import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Members log in with their full name + password (National ID is no longer a
 * login credential). Accounts are created with a synthetic internal email, so
 * we map a name to that internal login address here.
 *
 * Only ever returns internal "@baba.local" addresses — never a member's real
 * email — and requires the National ID when a name is shared by several people.
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

    const { data: rows } = await supabaseAdmin
      .from("registrations")
      .select("email, national_id, full_name")
      .ilike("full_name", name)
      .limit(25);

    let matches = (rows ?? []).filter((r) => typeof r.email === "string" && r.email);

    if (matches.length === 0) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("email, full_name")
        .ilike("full_name", name)
        .limit(25);
      matches = (profs ?? []).map((p) => ({
        email: p.email as string,
        national_id: null,
        full_name: p.full_name,
      })) as typeof matches;
    }

    const internal = matches.filter((m) => (m.email as string).endsWith("@baba.local"));
    if (internal.length === 0) return { email: null, needsId: false };

    if (internal.length === 1) return { email: internal[0].email as string, needsId: false };

    const id = (data.nationalId ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    if (!id) return { email: null, needsId: true };
    const byId = internal.find(
      (m) =>
        (m.national_id ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === id ||
        (m.email as string) === `id${id}@baba.local`,
    );
    return { email: (byId?.email as string) ?? null, needsId: !byId };
  });
