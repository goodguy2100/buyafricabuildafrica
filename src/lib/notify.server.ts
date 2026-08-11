/**
 * Notification fan-out. Admin messages are recorded in `notifications_sent`
 * (the audit log) and then actually delivered: one row per member in
 * `user_notifications` (their in-app inbox) and, when requested, an email
 * through the transactional email queue.
 */

export interface Recipient {
  user_id: string;
  email: string | null;
  full_name: string | null;
}

const INTERNAL_EMAIL_SUFFIX = "@baba.local";

/** Real, mailable address (internal login aliases are not mailable). */
export function mailable(email: string | null | undefined): string | null {
  if (!email) return null;
  const e = email.trim().toLowerCase();
  if (!e.includes("@") || e.endsWith(INTERNAL_EMAIL_SUFFIX)) return null;
  return e;
}

export interface DeliverArgs {
  supabase: any;
  notificationId: string | null;
  recipients: Recipient[];
  title: string;
  body: string | null;
  linkUrl?: string | null;
  bannerUrl?: string | null;
  isPopup: boolean;
  isImportant?: boolean;
  sendEmail: boolean;
  /** Caller's bearer header, forwarded to the email route. */
  authHeader: string | null;
  origin: string;
}

export interface DeliverResult {
  inbox: number;
  emails: number;
  emailErrors: number;
}

export async function deliverNotification(args: DeliverArgs): Promise<DeliverResult> {
  const {
    supabase,
    notificationId,
    recipients,
    title,
    body,
    linkUrl,
    bannerUrl,
    isPopup,
    isImportant,
    sendEmail,
    authHeader,
    origin,
  } = args;

  const unique = new Map<string, Recipient>();
  for (const r of recipients) if (r.user_id) unique.set(r.user_id, r);
  const list = [...unique.values()];
  if (list.length === 0) return { inbox: 0, emails: 0, emailErrors: 0 };

  const rows = list.map((r) => ({
    user_id: r.user_id,
    notification_id: notificationId,
    title,
    body,
    link_url: linkUrl ?? null,
    banner_url: bannerUrl ?? null,
    is_popup: isPopup,
    is_important: isImportant ?? false,
  }));

  // Insert in chunks so a large audience does not blow the request size.
  let inbox = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const { error } = await supabase.from("user_notifications").insert(chunk);
    if (error) throw new Error(error.message);
    inbox += chunk.length;
  }

  let emails = 0;
  let emailErrors = 0;
  if (sendEmail && authHeader) {
    const { sendResendEmail } = await import("@/lib/email/resend.server");
    const hasResend = Boolean(process.env.RESEND_API_KEY);
    for (const r of list) {
      const to = mailable(r.email);
      if (!to) continue;
      try {
        const templateData = {
          memberName: r.full_name ?? "Member",
          title,
          body: body ?? "",
          linkUrl: linkUrl ?? `${origin}/dashboard`,
        };

        if (hasResend) {
          // Resend path: direct API send (no queue hop).
          const result = await sendResendEmail({
            templateName: "member-message",
            recipientEmail: to,
            templateData,
          });
          if (result) {
            emails++;
            console.log("[notify] email sent via Resend", { to, id: result.id });
          } else {
            emailErrors++;
            console.error("[notify] Resend returned no result");
          }
          continue;
        }

        // Fallback: managed queue (Lovable path) when Resend is not configured.
        const res = await fetch(`${origin}/lovable/email/transactional/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: authHeader },
          body: JSON.stringify({
            templateName: "member-message",
            recipientEmail: to,
            idempotencyKey: `${notificationId ?? "msg"}:${r.user_id}`,
            templateData,
          }),
        });
        if (res.ok) emails++;
        else {
          emailErrors++;
          console.error("[notify] email send failed", res.status, await res.text());
        }
      } catch (err) {
        emailErrors++;
        console.error("[notify] email send threw", err);
      }
    }
  }

  return { inbox, emails, emailErrors };
}
