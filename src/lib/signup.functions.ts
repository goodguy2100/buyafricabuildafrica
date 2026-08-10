import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Confirm a just-created auth user server-side.
 *
 * Members who join without an email get a synthetic "@baba.local" login
 * address, which has no inbox — a confirmation email can never arrive, so
 * those accounts would stay locked when the project has "Confirm email" on.
 *
 * Two modes:
 * - userId + email: called right after signUp with the fresh account.
 * - email only: called when a signup retry hits "already registered" and the
 *   existing account is an unconfirmed @baba.local one. Only synthetic
 *   internal addresses may be confirmed this way.
 */
export const confirmSignup = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        userId: z.string().uuid().optional(),
        email: z.string().email(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();

    let targetId = data.userId ?? null;
    if (!targetId) {
      // Email-only mode — only synthetic internal addresses qualify.
      if (!email.endsWith("@baba.local")) {
        throw new Error("External emails must be confirmed by the member");
      }
      const { data: users, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 200,
      });
      if (listErr) throw new Error(listErr.message);
      const hit = (users?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email);
      if (!hit) throw new Error("Account not found");
      if (hit.email_confirmed_at) return { ok: true };
      targetId = hit.id;
    } else {
      const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(targetId);
      if (error || !user.user) throw new Error("Account not found");
      if ((user.user.email ?? "").toLowerCase() !== email) {
        throw new Error("Email does not match this account");
      }
      if (user.user.email_confirmed_at) return { ok: true };
    }

    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(targetId, {
      email_confirm: true,
    });
    if (updErr) throw new Error(updErr.message);
    return { ok: true };
  });
