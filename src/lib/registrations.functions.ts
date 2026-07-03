import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

const registrationInput = z.object({
  role: z.enum(["individual", "professional", "organization"]),
  data: z.record(z.string(), z.any()),
});

export interface RegistrationRow {
  id: string;
  user_id: string;
  role: string;
  verified: boolean;
  data: Json;
  created_at: string;
  updated_at: string;
}

export interface AdminRegistrationRow extends RegistrationRow {
  email: string | null;
  full_name: string | null;
}

/** Create (or replace) the signed-in user's registration submission. */
export const createRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => registrationInput.parse(input))
  .handler(async ({ data, context }): Promise<RegistrationRow> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("registrations")
      .insert({ user_id: userId, role: data.role, data: data.data as Json })
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

/** Whether the signed-in user has the admin role. */
export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<boolean> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    return !!data;
  });

/** Admin only: list every registration with the submitter's profile info. */
export const listAllRegistrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminRegistrationRow[]> => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
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
