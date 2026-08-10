// Resend email sender for BABA.
// Server-only module (.server.ts suffix keeps it out of the client bundle).
// Renders existing React Email templates and sends through the Resend API.
// Falls back gracefully when RESEND_API_KEY is not configured (callers
// decide; sendResendEmail returns null so they can use the queue path).

import * as React from "react";
import { render } from "@react-email/render";
import { TEMPLATES } from "@/lib/email-templates/registry";

const EMAIL_FROM = process.env.EMAIL_FROM ?? "BABA <notify@buyafricabuildafrica.org>";
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO;

export interface ResendSendResult {
  id: string;
}

export interface ResendEmailInput {
  templateName: string;
  recipientEmail: string;
  templateData?: Record<string, any>;
  /** Override the default subject (rare; registry subject wins otherwise). */
  subject?: string;
  replyTo?: string;
}

function resendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY;
}

/**
 * Render a registered React Email template to { html, text, subject }.
 * Returns null when the template name is unknown.
 */
export async function renderTemplate(
  templateName: string,
  templateData: Record<string, any> = {},
): Promise<{ html: string; text: string; subject: string } | null> {
  const template = TEMPLATES[templateName];
  if (!template) return null;
  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function"
      ? template.subject(templateData)
      : template.subject;
  return { html, text, subject };
}

/**
 * Send an email through Resend. Returns the Resend message id, or null when
 * RESEND_API_KEY is not set (caller should fall back to the managed queue).
 * Throws on API errors so callers can log/retry.
 */
export async function sendResendEmail(
  input: ResendEmailInput,
): Promise<ResendSendResult | null> {
  const apiKey = resendApiKey();
  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY not set - skipping Resend send");
    return null;
  }

  const rendered = await renderTemplate(input.templateName, input.templateData ?? {});
  if (!rendered) {
    throw new Error(`Unknown email template: ${input.templateName}`);
  }

  const payload: Record<string, any> = {
    from: EMAIL_FROM,
    to: [input.recipientEmail],
    subject: input.subject ?? rendered.subject,
    html: rendered.html,
    text: rendered.text,
  };
  if (EMAIL_REPLY_TO || input.replyTo) {
    payload.reply_to = input.replyTo ?? EMAIL_REPLY_TO;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = (await res.json()) as { id: string };
  return { id: data.id };
}
