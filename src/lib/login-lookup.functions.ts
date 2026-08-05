import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Members log in with their full name + password (National ID is no longer a
 * login credential). Accounts are created with a synthetic internal login
 * address, so we map a name to that address here.
 *
 * Only ever returns internal "@baba.local" addresses — never a member's real
 * email — and asks for the National ID when a name is shared by several people.
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

    // Escape LIKE metacharacters so the caller cannot submit a wildcard pattern
    // and enumerate members — this must stay an exact (case-insensitive) match.
    const pattern = name.replace(/([\\%_])/g, "\\$1");

    const { data: profs } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .ilike("full_name", pattern)
      .limit(25);

    const matches = (profs ?? []).filter(
      (p) => typeof p.email === "string" && (p.email as string).endsWith("@baba.local"),
    );

    if (matches.length === 0) return { email: null, needsId: false };
    if (matches.length === 1) return { email: matches[0].email as string, needsId: false };

    const id = (data.nationalId ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    if (!id) return { email: null, needsId: true };

    // Disambiguate people who share a name using their National ID.
    const direct = matches.find((p) => p.email === `id${id}@baba.local`);
    if (direct) return { email: direct.email as string, needsId: false };

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
