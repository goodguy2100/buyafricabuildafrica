import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { RegistrationRow, RoleValue } from "@/lib/registrations.functions";
import { PROFESSIONS } from "@/lib/wizard-options";

// ---------------------------------------------------------------------------
// Partner bulk registration, provisional accounts & scoped partner admins.
// Every handler re-checks role + org scope server-side — never trust the client.
// ---------------------------------------------------------------------------

export interface PartnerAccess {
  isAdmin: boolean;
  isPartnerAdmin: boolean;
  partnerOrgId: string | null;
  canAddOtherAdmins: boolean;
  orgName: string | null;
}

/** Current user's access: admin, partner_admin + org, permissions. */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PartnerAccess> => {
    const { supabase, userId } = context;

    const [rolesRes, paRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("partner_admins").select("partner_org_id, can_add_other_admins").eq("user_id", userId).maybeSingle(),
    ]);

    const roles = (rolesRes.data ?? []) as { role: string }[];
    const isAdmin = roles.some((r) => r.role === "admin");
    const isPartnerAdmin = roles.some((r) => r.role === "partner_admin") && !!paRes.data;

    let orgName: string | null = null;
    if (paRes.data?.partner_org_id) {
      const { data: org } = await supabase
        .from("partner_orgs")
        .select("org_name")
        .eq("id", paRes.data.partner_org_id)
        .maybeSingle();
      orgName = (org?.org_name as string | undefined) ?? null;
    }

    return {
      isAdmin,
      isPartnerAdmin,
      partnerOrgId: paRes.data?.partner_org_id ?? null,
      canAddOtherAdmins: paRes.data?.can_add_other_admins ?? false,
      orgName,
    };
  });

/** Throw unless the caller is an admin. */
async function assertAdmin(context: { supabase: any; userId: string }): Promise<{ supabase: any; userId: string }> {
  const { supabase, userId } = context;
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required");
  return { supabase, userId };
}

/** Throw unless the caller is a partner admin. Returns their org scope. */
async function assertPartnerAdmin(context: {
  supabase: any;
  userId: string;
}): Promise<{ supabase: any; userId: string; orgId: string; canAddOtherAdmins: boolean }> {
  const { supabase, userId } = context;
  const { data, error } = await supabase
    .from("partner_admins")
    .select("partner_org_id, can_add_other_admins")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: partner admin access required");
  return { supabase, userId, orgId: data.partner_org_id, canAddOtherAdmins: data.can_add_other_admins };
}

// ---------------------------------------------------------------------------
// BULK IMPORT (Part 1)
// ---------------------------------------------------------------------------

export const importRowSchema = z.object({
  name: z.string().min(2).max(200),
  national_id: z.string().min(1).max(60),
  phone: z.string().min(1).max(40),
  occupation: z.string().max(200).optional(),
  education_level: z.string().max(120).optional(),
  employment_status: z.string().max(120).optional(),
  // Optional details from the same list the member wizard uses.
  profession: z.string().max(120).optional(), // PROFESSIONS key
  profession_other: z.string().max(200).optional(), // free text when profession === "other"
  years_experience: z.string().max(60).optional(),
  temporary_password: z.string().max(128).optional(), // blank → national ID
});
export type ImportRow = z.infer<typeof importRowSchema>;

const bulkImportInput = z.object({
  rows: z.array(importRowSchema).min(1).max(100), // client batches; 100/call keeps the worker request fast
  partner_org_id: z.string().uuid().optional(), // super-admin override; partner admins are auto-tagged
});

export interface BulkImportResult {
  total: number;
  created: number;
  duplicates: number;
  errors: number;
  profileComplete: number;
  incomplete: number;
  errorRows: { row: number; reason: string }[];
}

function cleanDigits(v: string): string {
  return v.replace(/[^0-9]/g, "");
}

/** Normalise a Kenyan phone: 07xx… → +2547xx…, 2547xx… → +2547xx… */
function normalizePhone(raw: string): string {
  const d = cleanDigits(raw);
  if (d.length < 9) return raw.trim(); // caller validates length after this
  let body = d;
  if (body.startsWith("0")) body = body.slice(1);
  if (!body.startsWith("254")) body = `254${body}`;
  return `+${body}`;
}

/** Map a trade slug to the values the DB check constraint accepts. */
const ALLOWED_TRADES = [
  "plumber", "electrician", "mason", "carpenter",
  "painter", "welder", "tiler", "gypsum_installer", "other",
];
function normalizeTrade(v: string | null | undefined): string | null {
  const s = (v ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  if (!s) return null;
  return ALLOWED_TRADES.includes(s) ? s : "other";
}

/**
 * Create provisional accounts from a partner's list.
 * - temporary password = national ID number (first-login only)
 * - first_login = true, account_status = 'provisional'
 * - profile_complete = true only when occupation AND education_level AND
 *   employment_status are all present
 * - NO verification at import time — the person isn't present; that happens
 *   at first login (Part 2)
 */
export const bulkImportRegistrations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => bulkImportInput.parse(input))
  .handler(async ({ data, context }): Promise<BulkImportResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Resolve caller scope: super admin may import for any org; a partner
    // admin is ALWAYS scoped to their own org (override ignored).
    let orgId: string | null = null;
    if (data.partner_org_id) {
      await assertAdmin(context);
      orgId = data.partner_org_id;
    } else {
      const pa = await assertPartnerAdmin(context);
      orgId = pa.orgId;
    }

    const result: BulkImportResult = {
      total: data.rows.length,
      created: 0,
      duplicates: 0,
      errors: 0,
      profileComplete: 0,
      incomplete: 0,
      errorRows: [],
    };

    const seenInBatch = new Set<string>();

    for (let i = 0; i < data.rows.length; i++) {
      const row = data.rows[i];
      const rowNo = i + 1;
      const fail = (reason: string) => {
        result.errors++;
        result.errorRows.push({ row: rowNo, reason });
      };

      const name = row.name.trim();
      const idDigits = cleanDigits(row.national_id);
      const phone = normalizePhone(row.phone);
      const education = row.education_level?.trim() || null;
      const employment = row.employment_status?.trim() || null;
      const yearsExperience = row.years_experience?.trim() || null;
      const tempPassword = row.temporary_password?.trim();

      // Optional profession (same list as the member wizard): the partner can
      // leave it blank and the member picks it at first login instead.
      let occupation = row.occupation?.trim() || null;
      let role: RoleValue | undefined;
      let artisanType: string | null = null;
      let professionsArr: string[] = [];
      if (row.profession) {
        const p = PROFESSIONS.find((x) => x.key === row.profession);
        if (p) {
          occupation =
            p.key === "other" && row.profession_other?.trim()
              ? row.profession_other.trim()
              : p.label;
          role = p.role;
          artisanType = p.trade ? normalizeTrade(p.trade) : null;
          professionsArr = [occupation];
        } else {
          occupation = row.profession;
          professionsArr = [row.profession];
        }
      }

      if (name.length < 2) {
        fail("Name too short");
        continue;
      }
      if (idDigits.length < 6) {
        fail("National ID must be at least 6 digits");
        continue;
      }
      if (cleanDigits(phone).length < 9) {
        fail("Phone number too short");
        continue;
      }
      if (tempPassword && tempPassword.length < 6) {
        fail("Temporary password must be at least 6 characters");
        continue;
      }
      if (seenInBatch.has(idDigits)) {
        fail("Duplicate ID within this batch");
        continue;
      }
      seenInBatch.add(idDigits);

      const authEmail = `id${idDigits}@baba.local`;
      // Temporary password: partner's choice if they typed one, otherwise the
      // member's national ID (the member changes it at first login).
      const authPassword = tempPassword && tempPassword.length >= 6 ? tempPassword : idDigits;

      // Skip anyone already registered (checked by national ID).
      const { data: existingReg } = await supabaseAdmin
        .from("registrations")
        .select("user_id")
        .eq("national_id", idDigits)
        .maybeSingle();
      if (existingReg) {
        result.duplicates++;
        continue;
      }

      // Create the auth user (email_confirm: true → no email needed for a
      // synthetic address; password = national ID as the temporary password).
      const { data: createdUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: authEmail,
        password: authPassword,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          national_id: idDigits,
          phone,
          imported: true,
        },
      });
      if (createErr) {
        if (/already registered|already exists|user already/i.test(createErr.message)) {
          result.duplicates++;
        } else {
          fail(createErr.message);
        }
        continue;
      }
      if (!createdUser?.user) {
        fail("Account creation failed");
        continue;
      }

      const profileComplete = !!(occupation && education && employment);

      const { error: regErr } = await supabaseAdmin.from("registrations").insert({
        user_id: createdUser.user.id,
        role: role ?? "individual",
        user_role: role ?? "individual",
        data: {
          fullName: name,
          nationalId: idDigits,
          phone,
          occupation: occupation ?? null,
          education: education ?? null,
          employmentStatus: employment ?? null,
          yearsField: yearsExperience,
          profession: row.profession?.trim() ?? null,
          imported: true,
        },
        full_name: name,
        national_id: idDigits,
        phone,
        occupation,
        artisan_type: artisanType,
        professions: professionsArr,
        years_experience: yearsExperience,
        education_level: education,
        employment_status: employment,
        account_status: "provisional",
        profile_complete: profileComplete,
        first_login: true,
        partner_org_id: orgId,
        verified: false,
        status: "pending",
      });
      if (regErr) {
        // Roll the auth user back so a retry doesn't hit "already registered".
        await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
        fail(`Registration save failed: ${regErr.message}`);
        continue;
      }

      result.created++;
      if (profileComplete) result.profileComplete++;
      else result.incomplete++;
    }

    // Log the batch (persistent record + audit trail).
    await supabaseAdmin.from("bulk_import_logs").insert({
      partner_org_id: orgId,
      imported_by: context.userId,
      total_rows: result.total,
      created_count: result.created,
      duplicate_count: result.duplicates,
      error_count: result.errors,
      profile_complete_count: result.profileComplete,
      incomplete_count: result.incomplete,
      errors: result.errorRows as any,
    });

    return result;
  });

// ---------------------------------------------------------------------------
// PARTNER ORGS + ADMINS (Part 3)
// ---------------------------------------------------------------------------

export interface PartnerOrgRow {
  id: string;
  org_name: string;
  created_by: string | null;
  created_at: string;
  member_count: number;
  admin_count: number;
}

export const listPartnerOrgs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PartnerOrgRow[]> => {
    const { supabase } = await assertAdmin(context);
    const { data: orgs, error } = await supabase
      .from("partner_orgs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const { data: counts } = await supabase
      .from("registrations")
      .select("partner_org_id");
    const { data: admins } = await supabase
      .from("partner_admins")
      .select("partner_org_id");

    const memberCounts = new Map<string, number>();
    for (const r of counts ?? []) {
      if (!r.partner_org_id) continue;
      memberCounts.set(r.partner_org_id, (memberCounts.get(r.partner_org_id) ?? 0) + 1);
    }
    const adminCounts = new Map<string, number>();
    for (const a of admins ?? []) {
      adminCounts.set(a.partner_org_id, (adminCounts.get(a.partner_org_id) ?? 0) + 1);
    }

    return ((orgs ?? []) as any[]).map((o) => ({
      id: o.id,
      org_name: o.org_name,
      created_by: o.created_by,
      created_at: o.created_at,
      member_count: memberCounts.get(o.id) ?? 0,
      admin_count: adminCounts.get(o.id) ?? 0,
    }));
  });

export const createPartnerOrg = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ org_name: z.string().min(2).max(200) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = await assertAdmin(context);
    const { data: row, error } = await supabase
      .from("partner_orgs")
      .insert({ org_name: data.org_name.trim(), created_by: userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const renamePartnerOrg = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ org_id: z.string().uuid(), org_name: z.string().min(2).max(200) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = await assertAdmin(context);
    const { data: row, error } = await supabase
      .from("partner_orgs")
      .update({ org_name: data.org_name.trim() })
      .eq("id", data.org_id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export interface PartnerAdminRow {
  user_id: string;
  partner_org_id: string;
  can_add_other_admins: boolean;
  created_at: string;
  email: string | null;
  full_name: string | null;
  org_name: string | null;
}

/** List partner admins. Admins see all; partner admins see their own org only. */
export const listPartnerAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PartnerAdminRow[]> => {
    const { supabase, userId } = context;

    const [roleRes, paRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("partner_admins").select("partner_org_id").eq("user_id", userId).maybeSingle(),
    ]);
    const roles = (roleRes.data ?? []) as { role: string }[];
    const isAdmin = roles.some((r) => r.role === "admin");

    let q = supabase.from("partner_admins").select("*").order("created_at", { ascending: false });
    if (!isAdmin) {
      if (!paRes.data?.partner_org_id) throw new Error("Forbidden: partner admin access required");
      q = q.eq("partner_org_id", paRes.data.partner_org_id);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const pas = (rows ?? []) as any[];
    const userIds = [...new Set(pas.map((p) => p.user_id))];
    const orgIds = [...new Set(pas.map((p) => p.partner_org_id))];

    const [profilesRes, orgsRes] = await Promise.all([
      userIds.length
        ? supabase.from("profiles").select("id, email, full_name").in("id", userIds)
        : Promise.resolve({ data: [] }),
      orgIds.length
        ? supabase.from("partner_orgs").select("id, org_name").in("id", orgIds)
        : Promise.resolve({ data: [] }),
    ]);

    const profileMap = new Map<string, { email: string | null; full_name: string | null }>();
    for (const p of (profilesRes.data ?? []) as any[]) {
      profileMap.set(p.id, { email: p.email ?? null, full_name: p.full_name ?? null });
    }
    const orgMap = new Map<string, string>();
    for (const o of (orgsRes.data ?? []) as any[]) orgMap.set(o.id, o.org_name);

    return pas.map((p) => ({
      user_id: p.user_id,
      partner_org_id: p.partner_org_id,
      can_add_other_admins: p.can_add_other_admins,
      created_at: p.created_at,
      email: profileMap.get(p.user_id)?.email ?? null,
      full_name: profileMap.get(p.user_id)?.full_name ?? null,
      org_name: orgMap.get(p.partner_org_id) ?? null,
    }));
  });

const addPartnerAdminInput = z.object({
  email: z.string().email(),
  partner_org_id: z.string().uuid(),
  can_add_other_admins: z.boolean().default(false),
});

/**
 * Add a partner admin. Super admins can add anyone to any org.
 * A partner admin may add a colleague to their OWN org only when the
 * super admin has enabled can_add_other_admins for them (default off).
 */
export const addPartnerAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => addPartnerAdminInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Resolve caller scope.
    const [roleRes, paRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("partner_admins").select("partner_org_id, can_add_other_admins").eq("user_id", userId).maybeSingle(),
    ]);
    const roles = (roleRes.data ?? []) as { role: string }[];
    const isAdmin = roles.some((r) => r.role === "admin");

    let orgId = data.partner_org_id;
    let canAdd = data.can_add_other_admins;
    if (!isAdmin) {
      if (!paRes.data) throw new Error("Forbidden: partner admin access required");
      if (!paRes.data.can_add_other_admins) {
        throw new Error("You do not have permission to add other admins — ask the super admin to enable it.");
      }
      if (paRes.data.partner_org_id !== data.partner_org_id) {
        throw new Error("You can only add admins to your own organisation.");
      }
      canAdd = false; // partner admins can never grant the add-admins right
    }

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", data.email.toLowerCase())
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!profile) throw new Error("No member found with that email. They must sign up first.");

    const existing = await supabase
      .from("partner_admins")
      .select("user_id")
      .eq("user_id", profile.id)
      .maybeSingle();
    if (existing.data) throw new Error("That person is already a partner admin.");

    // Role-grant + org-link are written with the service role so they are
    // atomic and never blocked by RLS (the caller's permissions were already
    // checked above — this is a trusted server-side operation).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: paErr } = await supabaseAdmin.from("partner_admins").insert({
      user_id: profile.id,
      partner_org_id: orgId,
      can_add_other_admins: canAdd,
    });
    if (paErr) throw new Error(paErr.message);

    const { error: roleErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: profile.id,
      role: "partner_admin",
    });
    if (roleErr && !roleErr.message.includes("duplicate")) {
      // Roll back the org link so a retry works cleanly.
      await supabaseAdmin.from("partner_admins").delete().eq("user_id", profile.id);
      throw new Error(roleErr.message);
    }

    return { ok: true };
  });

export const removePartnerAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = await assertAdmin(context);
    if (data.user_id === userId) throw new Error("You cannot remove your own partner admin access.");
    await supabase.from("partner_admins").delete().eq("user_id", data.user_id);
    await supabase.from("user_roles").delete().eq("user_id", data.user_id).eq("role", "partner_admin");
    return { ok: true };
  });

export const setPartnerAdminPermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ user_id: z.string().uuid(), can_add_other_admins: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = await assertAdmin(context);
    const { error } = await supabase
      .from("partner_admins")
      .update({ can_add_other_admins: data.can_add_other_admins })
      .eq("user_id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// SCOPED USER LISTS (Part 4)
// ---------------------------------------------------------------------------

/**
 * Partner admin: the members registered under their org ONLY.
 * Super admin: every member, optionally filtered by org.
 */
export const listPartnerUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ partner_org_id: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }): Promise<RegistrationRow[]> => {
    const { supabase, userId } = context;

    const [roleRes, paRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("partner_admins").select("partner_org_id").eq("user_id", userId).maybeSingle(),
    ]);
    const roles = (roleRes.data ?? []) as { role: string }[];
    const isAdmin = roles.some((r) => r.role === "admin");

    // Partner admins are hard-scoped to their org — the optional filter is
    // ignored for them (cannot be used to peek at another org).
    let orgFilter: string | null = isAdmin ? (data.partner_org_id ?? null) : null;
    if (!isAdmin) {
      if (!paRes.data?.partner_org_id) throw new Error("Forbidden: partner admin access required");
      orgFilter = paRes.data.partner_org_id;
    } else if (!orgFilter && paRes.data?.partner_org_id) {
      // Super admin browsing their OWN partner portal: default to their own
      // org instead of dumping every member on the platform.
      orgFilter = paRes.data.partner_org_id;
    }

    let q = supabase.from("registrations").select("*").order("created_at", { ascending: false }).limit(1000);
    if (orgFilter) q = q.eq("partner_org_id", orgFilter);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as RegistrationRow[];
  });

/** Org summary for the partner dashboard (no financial data, ever). */
export const getPartnerOrgSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const pa = await assertPartnerAdmin(context);
    const { supabase } = pa;

    const { data: rows, error } = await supabase
      .from("registrations")
      .select("account_status, profile_complete, verified, first_login, created_at")
      .eq("partner_org_id", pa.orgId);
    if (error) throw new Error(error.message);

    const members = (rows ?? []) as any[];
    return {
      orgId: pa.orgId,
      total: members.length,
      provisional: members.filter((m) => m.account_status === "provisional").length,
      active: members.filter((m) => m.account_status === "active").length,
      suspended: members.filter((m) => m.account_status === "suspended").length,
      verified: members.filter((m) => m.verified).length,
      pendingVerification: members.filter((m) => !m.verified).length,
      profileComplete: members.filter((m) => m.profile_complete).length,
      needsWizard: members.filter((m) => !m.profile_complete).length,
    };
  });

// ---------------------------------------------------------------------------
// FIRST-LOGIN COMPLETION (Part 2)
// ---------------------------------------------------------------------------

/** State the /first-login wizard needs. */
export const getFirstLoginState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ registration: RegistrationRow | null }> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error && error.code !== "PGRST116") throw new Error(error.message);
    return { registration: (data ?? null) as RegistrationRow | null };
  });

/**
 * Marks a provisional account complete after the member has:
 *  1. confirmed their identity (the two-step: password = ID, then "this is me")
 *  2. (if incomplete) filled the missing wizard fields
 *  3. set their own permanent password (done client-side BEFORE this call)
 * The national ID then stops working because the password has been changed.
 */
export const completeFirstLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        role: z.enum(["individual", "professional_young", "professional_exp", "artisan", "corporate"]).optional(),
        artisan_type: z.string().max(60).optional(),
        occupation: z.string().max(200).optional(),
        education_level: z.string().max(120).optional(),
        employment_status: z.string().max(120).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<RegistrationRow> => {
    const { supabase, userId } = context;

    const { data: reg, error: regErr } = await supabase
      .from("registrations")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (regErr) throw new Error(regErr.message);
    if (!reg) throw new Error("No registration found for your account.");

    const r = reg as any;
    if (r.account_status !== "provisional") {
      // Idempotent-ish: already activated → just return the row.
      return r as RegistrationRow;
    }
    if (!r.first_login) throw new Error("First-login flow already completed.");

    const patch: Record<string, unknown> = {
      first_login: false,
      account_status: "active",
      verified: true,
      verification_method: "self_confirm",
      verified_at: new Date().toISOString(),
      verified_by: userId,
      last_login: new Date().toISOString(),
    };
    if (data.role) {
      patch.role = data.role;
      patch.user_role = data.role;
    }
    if (data.artisan_type) {
      // Normalise trade labels into the slugs the DB check constraint accepts
      // (same mapping as the signup wizard, e.g. "construction" → "other").
      const ALLOWED_TRADES = [
        "plumber", "electrician", "mason", "carpenter",
        "painter", "welder", "tiler", "gypsum_installer", "other",
      ];
      const s = data.artisan_type.trim().toLowerCase().replace(/\s+/g, "_");
      patch.artisan_type = ALLOWED_TRADES.includes(s) ? s : "other";
    }
    if (data.occupation !== undefined) patch.occupation = data.occupation || null;
    if (data.education_level !== undefined) patch.education_level = data.education_level || null;
    if (data.employment_status !== undefined) patch.employment_status = data.employment_status || null;

    // If the wizard ran, every required field is now present → complete.
    const complete =
      !!(patch.occupation ?? r.occupation) &&
      !!(patch.education_level ?? r.education_level) &&
      !!(patch.employment_status ?? r.employment_status);
    if (complete) patch.profile_complete = true;

    const { data: updated, error: updErr } = await supabase
      .from("registrations")
      .update(patch as any)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (updErr) throw new Error(updErr.message);
    return updated as RegistrationRow;
  });
