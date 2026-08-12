import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Members log in with their username (or full name / National ID for
 * members who joined before usernames existed) + password.
 * A member's login address is their real email when they provided one,
 * otherwise a synthetic internal "@baba.local" address. We map the
 * username / name / ID number to that address here.
 *
 * Asks for the National ID when a name is shared by several people.
 */
export const lookupLoginEmail = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        fullName: z.string().min(2).max(200),
        nationalId: z.string().max(60).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ email: string | null; needsId: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const name = data.fullName.trim();

    // If the member typed an email address, match the login email directly.
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(name)) {
      const { data: byEmail } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .ilike("email", name)
        .limit(5);
      const emailHit = (byEmail ?? []).find(
        (p) => typeof p.email === "string" && p.email.trim().length > 0,
      );
      if (emailHit?.email) return { email: emailHit.email as string, needsId: false };
      return { email: null, needsId: false };
    }

    // Exact (case-insensitive) match on the username column first, for members
    // who still type an old username (kept for backwards compatibility).
    if (name.length >= 2) {
      const { data: byUser } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .ilike("username", name)
        .limit(5);
      const userHit = (byUser ?? []).find(
        (p) => typeof p.email === "string" && p.email.trim().length > 0,
      );
      if (userHit?.email) return { email: userHit.email as string, needsId: false };
    }

    // Escape LIKE metacharacters so the caller cannot submit a wildcard pattern
    // and enumerate members — this must stay an exact (case-insensitive) match.
    const pattern = name.replace(/([\\%_])/g, "\\$1");

    const { data: profs } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .ilike("full_name", pattern)
      .limit(25);

    const matches = (profs ?? []).filter(
      (p) => typeof p.email === "string" && p.email.trim().length > 0,
    );

    if (matches.length === 0) {
      // No name matched — maybe the person typed their National ID instead
      // (login works with the ID number too). Resolve ID → registration → profile.
      const digits = name.replace(/[^0-9]/g, "");
      if (digits.length >= 4) {
        const { data: idRegs } = await supabaseAdmin
          .from("registrations")
          .select("user_id, national_id")
          .ilike("national_id", `${digits}%`)
          .limit(10);
        const hit = (idRegs ?? []).find(
          (r) => (r.national_id ?? "").replace(/[^0-9]/g, "") === digits,
        );
        if (hit) {
          const { data: prof } = await supabaseAdmin
            .from("profiles")
            .select("email")
            .eq("id", hit.user_id)
            .maybeSingle();
          if (prof?.email && typeof prof.email === "string" && prof.email.trim()) {
            return { email: prof.email as string, needsId: false };
          }
        }
      }
      return { email: null, needsId: false };
    }
    if (matches.length === 1) return { email: matches[0].email as string, needsId: false };

    const id = (data.nationalId ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    if (!id) return { email: null, needsId: true };

    // Disambiguate people who share a name using their National ID.
    const { data: regs } = await supabaseAdmin
      .from("registrations")
      .select("user_id, national_id")
      .in(
        "user_id",
        matches.map((p) => p.id as string),
      );
    const hit = (regs ?? []).find(
      (r) => (r.national_id ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === id,
    );
    const email = hit ? (matches.find((p) => p.id === hit.user_id)?.email as string) : null;
    return { email: email ?? null, needsId: !email };
  });

/**
 * Resolve a member's real email from their National ID. Used by the
 * "No email — help me" flow so a help request carries a mailable address
 * instead of a synthetic "@baba.local" one.
 */
export const lookupContactEmail = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ nationalId: z.string().min(1).max(60), fullName: z.string().max(200).optional() })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ email: string | null }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const id = data.nationalId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    if (!id) return { email: null };

    // National IDs are stored as plain digits; match the cleaned form server-side.
    let query = supabaseAdmin
      .from("registrations")
      .select("full_name, email, national_id")
      .ilike("national_id", `%${id}%`)
      .limit(10);
    const { data: regs } = await query;
    const hits = (regs ?? []).filter(
      (r) => (r.national_id ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === id,
    );
    if (hits.length === 0) return { email: null };

    // Prefer the exact name match, else the first hit with a real email.
    const name = (data.fullName ?? "").trim().toLowerCase();
    const byName = hits.find(
      (r) => (r.full_name ?? "").trim().toLowerCase() === name,
    );
    const pick = byName ?? hits.find((r) => (r.email ?? "").trim().length > 0);
    return { email: (pick?.email ?? null) as string | null };
  });
