import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface EventSignupResult {
  ok: boolean;
  already: boolean;
  applicantCount: number;
}

/**
 * Sign the signed-in user up for an event (opportunities table, kind = 'event').
 * Writes an opportunity_applications row and bumps the public attendee count.
 * Verified members only — callers gate on verification before invoking this.
 */
export const signUpForEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        opportunityId: z.string().uuid(),
        title: z.string().min(1).max(300),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<EventSignupResult> => {
    const { supabase, userId } = context;

    // Already signed up? Idempotent — return early without a duplicate row.
    const { data: existing } = await supabase
      .from("opportunity_applications")
      .select("id")
      .eq("user_id", userId)
      .eq("opportunity_title", data.title)
      .maybeSingle();
    if (existing) {
      const { data: opp } = await supabase
        .from("opportunities")
        .select("applicants_count")
        .eq("id", data.opportunityId)
        .single();
      return { ok: true, already: true, applicantCount: opp?.applicants_count ?? 0 };
    }

    // Applicant identity — prefer the real contact email from the registration.
    const { data: reg } = await supabase
      .from("registrations")
      .select("full_name, email, phone")
      .eq("user_id", userId)
      .maybeSingle();
    const { data: prof } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();
    const isReal = (e?: string | null) => !!e && !e.toLowerCase().endsWith("@baba.local");
    const regEmail = isReal(reg?.email) ? reg?.email : null;
    const profEmail = isReal(prof?.email) ? prof?.email : null;
    const email = regEmail ?? profEmail ?? null;

    const { error } = await supabase.from("opportunity_applications").insert({
      user_id: userId,
      opportunity_title: data.title,
      opportunity_kind: "event",
      applicant_name: reg?.full_name ?? null,
      applicant_email: email,
      applicant_phone: reg?.phone ?? null,
      status: "applied",
    });
    if (error) throw new Error(error.message);

    // Bump the public attendee count.
    const { data: opp } = await supabase
      .from("opportunities")
      .select("applicants_count")
      .eq("id", data.opportunityId)
      .single();
    const next = (opp?.applicants_count ?? 0) + 1;
    await supabase
      .from("opportunities")
      .update({ applicants_count: next })
      .eq("id", data.opportunityId);

    return { ok: true, already: false, applicantCount: next };
  });

/** Event titles the signed-in user has already signed up for. */
export const listMyEventSignups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<string[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("opportunity_applications")
      .select("opportunity_title")
      .eq("user_id", userId)
      .eq("opportunity_kind", "event");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.opportunity_title as string);
  });
