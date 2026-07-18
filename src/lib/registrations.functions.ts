import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export const ROLE_VALUES = [
  "individual",
  "professional_young",
  "professional_exp",
  "artisan",
  "corporate",
] as const;
export type RoleValue = (typeof ROLE_VALUES)[number];

const registrationInput = z.object({
  role: z.enum(ROLE_VALUES),
  artisan_type: z.string().optional(),
  data: z.record(z.string(), z.any()),
});

export interface RegistrationRow {
  id: string;
  user_id: string;
  role: string;
  user_role: string | null;
  artisan_type: string | null;
  professional_experience: string | null;
  verified: boolean;
  verification_fee_paid: boolean;
  last_login: string | null;
  status: string;
  data: Json;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  national_id: string | null;
  location: string | null;
  occupation: string | null;
  trade: string | null;
  years_experience: string | null;
  employment_status: string | null;
  education_level: string | null;
  institution_name: string | null;
  field_of_study: string | null;
  corporate_name: string | null;
  corporate_type: string | null;
  staff_size: string | null;
  business_license: string | null;
  industries: string[];
  looking_for: string[];
  created_at: string;
  updated_at: string;
}

export interface AdminRegistrationRow extends RegistrationRow {
  email: string | null;
  full_name: string | null;
}

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  cv_url: string | null;
  extra: Json;
  created_at: string;
  updated_at: string;
}

/** Create the signed-in user's registration submission. */
export const createRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => registrationInput.parse(input))
  .handler(async ({ data, context }): Promise<RegistrationRow> => {
    const { supabase, userId } = context;

    // Denormalize commonly-filtered fields from the raw form so the admin
    // panel can query/filter them directly instead of digging into JSON.
    const form = (data.data ?? {}) as Record<string, unknown>;
    const str = (v: unknown): string | null =>
      typeof v === "string" && v.trim() ? v.trim() : null;
    const arr = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

    // Normalize artisan trade labels (e.g. "Gypsum Installer") into the slug
    // values the DB check constraint accepts (e.g. "gypsum_installer").
    const ALLOWED_TRADES = [
      "plumber", "electrician", "mason", "carpenter",
      "painter", "welder", "tiler", "gypsum_installer", "other",
    ];
    const normalizeTrade = (v: unknown): string | null => {
      const s = typeof v === "string" ? v.trim().toLowerCase().replace(/\s+/g, "_") : "";
      if (!s) return null;
      return ALLOWED_TRADES.includes(s) ? s : "other";
    };
    const artisanType =
      data.role === "artisan" ? normalizeTrade(data.artisan_type) : null;

    const { data: row, error } = await supabase
      .from("registrations")
      .insert({
        user_id: userId,
        role: data.role,
        user_role: data.role,
        artisan_type: artisanType,
        professional_experience:
          data.role === "professional_young"
            ? "young"
            : data.role === "professional_exp"
              ? "experienced"
              : null,
        data: data.data as Json,
        full_name: str(form.fullName) ?? str(form.contactPerson),
        email: str(form.email) ?? str(form.contactEmail),
        phone: str(form.phone) ?? str(form.contactPhone),
        national_id: str(form.nationalId),
        location: str(form.location),
        occupation: str(form.occupation),
        trade: str(form.trade),
        years_experience:
          str(form.yearsField) ?? str(form.yearsTrade) ?? str(form.yearsInOperation),
        employment_status: str(form.employmentStatus),
        education_level: str(form.education),
        institution_name: str(form.institutionName),
        field_of_study: str(form.fieldOfStudy),
        corporate_name: str(form.corporateName),
        corporate_type: str(form.corporateType),
        staff_size: str(form.staffSize),
        business_license: str(form.businessLicense),
        industries: arr(form.industries),
        looking_for: arr(form.lookingFor),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as RegistrationRow;
  });

/** Get the signed-in user's own registration submissions. */
export const getMyRegistrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RegistrationRow[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as RegistrationRow[];
  });

/** Get the signed-in user's profile. */
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProfileRow | null> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data ?? null) as ProfileRow | null;
  });

const profileUpdateInput = z.object({
  full_name: z.string().max(200).optional(),
  phone: z.string().max(60).optional(),
  location: z.string().max(200).optional(),
  bio: z.string().max(4000).optional(),
  cv_url: z.string().max(500).optional(),
  extra: z.record(z.string(), z.any()).optional(),
});

/** Update the signed-in user's profile. */
export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => profileUpdateInput.parse(input))
  .handler(async ({ data, context }): Promise<ProfileRow> => {
    const { supabase, userId } = context;
    const patch: {
      full_name?: string;
      phone?: string;
      location?: string;
      bio?: string;
      cv_url?: string;
      extra?: Json;
    } = {};
    if (data.full_name !== undefined) patch.full_name = data.full_name;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.location !== undefined) patch.location = data.location;
    if (data.bio !== undefined) patch.bio = data.bio;
    if (data.cv_url !== undefined) patch.cv_url = data.cv_url;
    if (data.extra !== undefined) patch.extra = data.extra as Json;

    const { data: row, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as ProfileRow;
  });

/** Whether the signed-in user has the admin role. */
export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<boolean> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return !!data;
  });

/** Admin only: list every registration with the submitter's profile info. */
export const listAllRegistrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminRegistrationRow[]> => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAdmin) throw new Error("Forbidden");

    const { data: regs, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const rows = (regs ?? []) as RegistrationRow[];
    const ids = [...new Set(rows.map((r) => r.user_id))];
    const profileMap = new Map<string, { email: string | null; full_name: string | null }>();
    if (ids.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", ids);
      for (const p of profiles ?? []) {
        profileMap.set(p.id as string, {
          email: (p.email as string) ?? null,
          full_name: (p.full_name as string) ?? null,
        });
      }
    }

    return rows.map((r) => ({
      ...r,
      email: profileMap.get(r.user_id)?.email ?? null,
      full_name: profileMap.get(r.user_id)?.full_name ?? null,
    }));
  });

/** Admin only: set the verified flag on a registration. */
export const setRegistrationVerified = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), verified: z.boolean() }).parse(input))
  .handler(async ({ data, context }): Promise<RegistrationRow> => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { data: row, error } = await supabase
      .from("registrations")
      .update({ verified: data.verified })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as RegistrationRow;
  });
