import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { containerTypeFor, feeForRole } from "@/lib/roles";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

/** Throw unless the caller is an admin. Returns the supabase client + userId. */
async function assertAdmin(context: {
  supabase: any;
  userId: string;
}): Promise<{ supabase: any; userId: string }> {
  const { supabase, userId } = context;
  const { data: isAdmin, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!isAdmin) throw new Error("Forbidden: admin access required");
  return { supabase, userId };
}

export interface MemberRow {
  id: string;
  user_id: string;
  role: string;
  user_role: string | null;
  artisan_type: string | null;
  container_type: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  national_id: string | null;
  location: string | null;
  occupation: string | null;
  education_level: string | null;
  field_of_study: string | null;
  institution_name: string | null;
  years_experience: string | null;
  employment_status: string | null;
  industries: string[];
  looking_for: string[];
  verified: boolean;
  verification_fee_paid: boolean;
  status: string;
  last_login: string | null;
  created_at: string;
  data: Json;
}

function toMemberRow(r: Record<string, any>): MemberRow {
  return {
    id: r.id,
    user_id: r.user_id,
    role: r.role,
    user_role: r.user_role ?? r.role ?? null,
    artisan_type: r.artisan_type ?? null,
    container_type: containerTypeFor(r.user_role ?? r.role, r.artisan_type ?? null),
    full_name: r.full_name ?? null,
    email: r.email ?? null,
    phone: r.phone ?? null,
    national_id: r.national_id ?? null,
    location: r.location ?? null,
    occupation: r.occupation ?? null,
    education_level: r.education_level ?? null,
    field_of_study: r.field_of_study ?? null,
    institution_name: r.institution_name ?? null,
    years_experience: r.years_experience ?? null,
    employment_status: r.employment_status ?? null,
    industries: r.industries ?? [],
    looking_for: r.looking_for ?? [],
    verified: !!r.verified,
    verification_fee_paid: !!r.verification_fee_paid,
    status: r.status ?? "pending",
    last_login: r.last_login ?? null,
    created_at: r.created_at,
    data: r.data ?? {},
  };
}

// ----------------------------------------------------------------------------
// OVERVIEW
// ----------------------------------------------------------------------------

export interface AdminOverview {
  totalMembers: number;
  revenueThisMonth: number;
  revenueAllTime: number;
  pendingApprovals: number;
  activeOpportunities: number;
  signupsByDay: { date: string; individual: number; professional: number; artisan: number; corporate: number }[];
  revenueByRole: { role: string; label: string; amount: number }[];
  membersByContainer: { container_type: string; display_name: string; member_count: number }[];
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    const { supabase } = await assertAdmin(context);

    const { data: regs, error } = await supabase.from("registrations").select("*");
    if (error) throw new Error(error.message);
    const members: MemberRow[] = (regs ?? []).map(toMemberRow);

    const { data: containers } = await supabase
      .from("role_containers")
      .select("container_type, display_name, member_count")
      .order("display_name");

    const { count: activeOpps } = await supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("status", "open");

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let revenueThisMonth = 0;
    let revenueAllTime = 0;
    const revenueByRoleMap: Record<string, number> = {};
    let pending = 0;

    for (const m of members) {
      if (m.status === "pending") pending++;
      if (m.verification_fee_paid && m.verified) {
        const fee = feeForRole(m.user_role ?? m.role);
        revenueAllTime += fee;
        revenueByRoleMap[m.user_role ?? m.role] =
          (revenueByRoleMap[m.user_role ?? m.role] ?? 0) + fee;
        if (new Date(m.created_at) >= monthStart) revenueThisMonth += fee;
      }
    }

    // signups by day for last 30 days, bucketed by role family
    const days: Record<string, { individual: number; professional: number; artisan: number; corporate: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days[d.toISOString().slice(0, 10)] = { individual: 0, professional: 0, artisan: 0, corporate: 0 };
    }
    for (const m of members) {
      const key = new Date(m.created_at).toISOString().slice(0, 10);
      if (!(key in days)) continue;
      const r = m.user_role ?? m.role;
      if (r === "corporate") days[key].corporate++;
      else if (r === "artisan") days[key].artisan++;
      else if (r.startsWith("professional")) days[key].professional++;
      else days[key].individual++;
    }

    const roleLabel: Record<string, string> = {
      individual: "Individuals",
      professional_young: "Young Professionals",
      professional_exp: "Experienced Professionals",
      artisan: "Artisans",
      corporate: "Corporates",
    };

    return {
      totalMembers: members.length,
      revenueThisMonth,
      revenueAllTime,
      pendingApprovals: pending,
      activeOpportunities: activeOpps ?? 0,
      signupsByDay: Object.entries(days).map(([date, v]) => ({ date, ...v })),
      revenueByRole: Object.entries(revenueByRoleMap).map(([role, amount]) => ({
        role,
        label: roleLabel[role] ?? role,
        amount,
      })),
      membersByContainer: (containers ?? []) as AdminOverview["membersByContainer"],
    };
  });

// ----------------------------------------------------------------------------
// CONTAINERS + MEMBERS
// ----------------------------------------------------------------------------

export const listContainers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = await assertAdmin(context);
    const { data, error } = await supabase
      .from("role_containers")
      .select("container_id, container_type, display_name, member_count")
      .order("display_name");
    if (error) throw new Error(error.message);
    return (data ?? []) as {
      container_id: string;
      container_type: string;
      display_name: string;
      member_count: number;
    }[];
  });

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ container_type: z.string().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }): Promise<MemberRow[]> => {
    const { supabase } = await assertAdmin(context);
    const { data: regs, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    let members: MemberRow[] = (regs ?? []).map(toMemberRow);

    // enrich missing email/name from profiles
    const missing = members.filter((m) => !m.email || !m.full_name).map((m) => m.user_id);
    if (missing.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", [...new Set(missing)]);
      const map = new Map<string, { email: string | null; full_name: string | null }>();
      for (const p of profiles ?? []) map.set(p.id, { email: p.email, full_name: p.full_name });
      members = members.map((m) => ({
        ...m,
        email: m.email ?? map.get(m.user_id)?.email ?? null,
        full_name: m.full_name ?? map.get(m.user_id)?.full_name ?? null,
      }));
    }

    if (data.container_type) {
      members = members.filter((m) => m.container_type === data.container_type);
    }
    return members;
  });

export const getMemberDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = await assertAdmin(context);
    const { data: reg, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const member = toMemberRow(reg);

    let profile: { email: string | null; full_name: string | null } | null = null;
    const { data: p } = await supabase
      .from("profiles")
      .select("email, full_name, phone, location, bio, cv_url")
      .eq("id", member.user_id)
      .maybeSingle();
    profile = p ?? null;

    const { data: apps } = await supabase
      .from("opportunity_applications")
      .select("*")
      .eq("user_id", member.user_id)
      .order("created_at", { ascending: false });

    return { member, profile, applications: apps ?? [] };
  });

export const updateMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        ids: z.array(z.string().uuid()).min(1),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        verified: z.boolean().optional(),
        verification_fee_paid: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = await assertAdmin(context);
    const patch: Record<string, unknown> = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.verified !== undefined) patch.verified = data.verified;
    if (data.verification_fee_paid !== undefined)
      patch.verification_fee_paid = data.verification_fee_paid;
    if (Object.keys(patch).length === 0) return { updated: 0 };
    const { error } = await supabase.from("registrations").update(patch).in("id", data.ids);
    if (error) throw new Error(error.message);
    return { updated: data.ids.length };
  });

// ----------------------------------------------------------------------------
// PAYMENTS
// ----------------------------------------------------------------------------

export interface Transaction {
  id: string;
  user_name: string;
  role: string;
  amount: number;
  paid: boolean;
  reference: string;
  date: string;
}

export const listTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Transaction[]> => {
    const { supabase } = await assertAdmin(context);
    const { data: regs, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (regs ?? []).map(toMemberRow).map((m: MemberRow) => ({
      id: m.id,
      user_name: m.full_name ?? m.email ?? "Unnamed",
      role: m.user_role ?? m.role,
      amount: feeForRole(m.user_role ?? m.role),
      paid: m.verification_fee_paid,
      reference: `BABA-${m.id.slice(0, 8).toUpperCase()}`,
      date: m.created_at,
    }));
  });

// ----------------------------------------------------------------------------
// OPPORTUNITIES
// ----------------------------------------------------------------------------

export interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  status: string;
  target_containers: string[];
  event_date: string | null;
  location: string | null;
  deadline: string | null;
  attachments: Json;
  completed: boolean;
  applicants_count: number;
  created_at: string;
  updated_at: string;
}

export const listOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Opportunity[]> => {
    const { supabase } = await assertAdmin(context);
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Opportunity[];
  });

const opportunityInput = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(8000).optional(),
  kind: z.enum(["event", "job", "course"]),
  status: z.enum(["open", "closed", "upcoming", "expired", "paused", "draft"]),
  target_containers: z.array(z.string()).default([]),
  event_date: z.string().optional().nullable(),
  location: z.string().max(300).optional().nullable(),
  deadline: z.string().optional().nullable(),
});

export const createOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => opportunityInput.parse(input))
  .handler(async ({ data, context }): Promise<Opportunity> => {
    const { supabase, userId } = await assertAdmin(context);
    const { data: row, error } = await supabase
      .from("opportunities")
      .insert({
        title: data.title,
        description: data.description ?? null,
        kind: data.kind,
        status: data.status,
        target_containers: data.target_containers,
        event_date: data.event_date || null,
        location: data.location || null,
        deadline: data.deadline || null,
        created_by: userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Opportunity;
  });

export const updateOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    opportunityInput.partial().extend({ id: z.string().uuid(), completed: z.boolean().optional() }).parse(input),
  )
  .handler(async ({ data, context }): Promise<Opportunity> => {
    const { supabase } = await assertAdmin(context);
    const { id, ...rest } = data;
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) patch[k] = v === "" ? null : v;
    }
    const { data: row, error } = await supabase
      .from("opportunities")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Opportunity;
  });

export const deleteOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = await assertAdmin(context);
    const { error } = await supabase.from("opportunities").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { deleted: true };
  });

export const listApplicants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ title: z.string().optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase } = await assertAdmin(context);
    let q = supabase.from("opportunity_applications").select("*").order("created_at", { ascending: false });
    if (data.title) q = q.eq("opportunity_title", data.title);
    const { data: apps, error } = await q;
    if (error) throw new Error(error.message);
    return (apps ?? []) as Record<string, any>[];
  });

// ----------------------------------------------------------------------------
// NOTIFICATIONS
// ----------------------------------------------------------------------------

export interface NotificationRow {
  id: string;
  title: string;
  body: string | null;
  recipient_type: string;
  recipient_container: string | null;
  message_type: string;
  scheduled_for: string | null;
  sent_count: number;
  status: string;
  is_popup: boolean;
  banner_url: string | null;
  link_url: string | null;
  active: boolean;
  show_from: string | null;
  show_until: string | null;
  created_at: string;
}

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NotificationRow[]> => {
    const { supabase } = await assertAdmin(context);
    const { data, error } = await supabase
      .from("notifications_sent")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as NotificationRow[];
  });

export const sendNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        title: z.string().min(1).max(300),
        body: z.string().max(8000).optional(),
        recipient_type: z.enum(["container", "all", "applicants"]),
        recipient_container: z.string().optional().nullable(),
        message_type: z.enum(["text", "popup", "email", "all"]),
        scheduled_for: z.string().optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<NotificationRow> => {
    const { supabase, userId } = await assertAdmin(context);

    // compute recipient count
    let sentCount = 0;
    if (data.recipient_type === "all") {
      const { count } = await supabase
        .from("registrations")
        .select("id", { count: "exact", head: true });
      sentCount = count ?? 0;
    } else if (data.recipient_type === "container" && data.recipient_container) {
      const { data: c } = await supabase
        .from("role_containers")
        .select("member_count")
        .eq("container_type", data.recipient_container)
        .maybeSingle();
      sentCount = c?.member_count ?? 0;
    }

    const scheduled = data.scheduled_for && new Date(data.scheduled_for) > new Date();
    const { data: row, error } = await supabase
      .from("notifications_sent")
      .insert({
        title: data.title,
        body: data.body ?? null,
        recipient_type: data.recipient_type,
        recipient_container: data.recipient_container ?? null,
        message_type: data.message_type,
        scheduled_for: data.scheduled_for || null,
        sent_count: sentCount,
        status: scheduled ? "scheduled" : "delivered",
        is_popup: data.message_type === "popup" || data.message_type === "all",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as NotificationRow;
  });

const popupInput = z.object({
  title: z.string().min(1).max(300),
  body: z.string().max(4000).optional(),
  banner_url: z.string().max(1000).optional().nullable(),
  link_url: z.string().max(1000).optional().nullable(),
  recipient_container: z.string().optional().nullable(),
  active: z.boolean().default(true),
  show_from: z.string().optional().nullable(),
  show_until: z.string().optional().nullable(),
});

export const createPopup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => popupInput.parse(input))
  .handler(async ({ data, context }): Promise<NotificationRow> => {
    const { supabase } = await assertAdmin(context);
    const { data: row, error } = await supabase
      .from("notifications_sent")
      .insert({
        title: data.title,
        body: data.body ?? null,
        banner_url: data.banner_url || null,
        link_url: data.link_url || null,
        recipient_type: data.recipient_container ? "container" : "all",
        recipient_container: data.recipient_container ?? null,
        message_type: "popup",
        is_popup: true,
        active: data.active,
        show_from: data.show_from || null,
        show_until: data.show_until || null,
        status: "delivered",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as NotificationRow;
  });

export const togglePopup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = await assertAdmin(context);
    const { error } = await supabase
      .from("notifications_sent")
      .update({ active: data.active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----------------------------------------------------------------------------
// GALLERY
// ----------------------------------------------------------------------------

export interface GalleryMedia {
  id: string;
  opportunity_id: string | null;
  title: string | null;
  caption: string | null;
  media_url: string;
  media_type: string;
  date_taken: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
}

export const listGalleryMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ opportunity_id: z.string().uuid().optional() }).parse(input ?? {}))
  .handler(async ({ data, context }): Promise<GalleryMedia[]> => {
    const { supabase } = await assertAdmin(context);
    let q = supabase.from("gallery_media").select("*").order("sort_order").order("created_at");
    if (data.opportunity_id) q = q.eq("opportunity_id", data.opportunity_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as GalleryMedia[];
  });

export const addGalleryMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        opportunity_id: z.string().uuid().optional().nullable(),
        title: z.string().max(300).optional(),
        caption: z.string().max(2000).optional(),
        media_url: z.string().min(1).max(2000),
        media_type: z.enum(["image", "video"]).default("image"),
        date_taken: z.string().optional().nullable(),
        published: z.boolean().default(false),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<GalleryMedia> => {
    const { supabase, userId } = await assertAdmin(context);
    const { data: row, error } = await supabase
      .from("gallery_media")
      .insert({
        opportunity_id: data.opportunity_id || null,
        title: data.title ?? null,
        caption: data.caption ?? null,
        media_url: data.media_url,
        media_type: data.media_type,
        date_taken: data.date_taken || null,
        published: data.published,
        created_by: userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as GalleryMedia;
  });

export const updateGalleryMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().max(300).optional(),
        caption: z.string().max(2000).optional(),
        published: z.boolean().optional(),
        sort_order: z.number().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = await assertAdmin(context);
    const { id, ...rest } = data;
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) if (v !== undefined) patch[k] = v;
    const { error } = await supabase.from("gallery_media").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteGalleryMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = await assertAdmin(context);
    const { error } = await supabase.from("gallery_media").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----------------------------------------------------------------------------
// SETTINGS — admin management
// ----------------------------------------------------------------------------

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = await assertAdmin(context);
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    const ids = (roles ?? []).map((r: any) => r.user_id);
    if (!ids.length) return [] as { user_id: string; email: string | null; full_name: string | null }[];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", ids);
    const map = new Map<string, any>();
    for (const p of profiles ?? []) map.set(p.id, p);
    return ids.map((id: string) => ({
      user_id: id,
      email: map.get(id)?.email ?? null,
      full_name: map.get(id)?.full_name ?? null,
    }));
  });

export const addAdminByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = await assertAdmin(context);
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!profile) throw new Error("No member found with that email. They must sign up first.");
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: profile.id, role: "admin" });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const removeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = await assertAdmin(context);
    if (data.user_id === userId) throw new Error("You cannot remove your own admin access.");
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
