import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendResendEmail } from "@/lib/email/resend.server";

export interface EventSignupResult {
  ok: boolean;
  already: boolean;
  applicantCount: number;
  emailed: boolean;
}

const SITE_URL = process.env.SITE_URL ?? "https://buyafricabuildafrica.org";
const SITE_NAME = "Buy Africa Build Africa (BABA)";

/** "28 Aug 2026 · 08:00" style label for the confirmation email. */
function dateLabel(eventDate: string | null): string {
  if (!eventDate) return "Date to be announced";
  const d = new Date(eventDate);
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Nairobi",
  }).format(d);
  return time === "00:00" ? date : `${date} · ${time.trim()}`;
}

/**
 * Sign the signed-in user up for an event (opportunities table, kind = 'event').
 * Writes an opportunity_applications row and bumps the public attendee count.
 * Verified members only — callers gate on verification before invoking this.
 *
 * On a successful sign-up the member gets:
 *  - an email with the event details (to the address on their dashboard), and
 *  - an in-app notification ("You have signed up for this event").
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
      return { ok: true, already: true, applicantCount: opp?.applicants_count ?? 0, emailed: false };
    }

    // Applicant identity — prefer the real contact email from the registration.
    const { data: reg } = await supabase
      .from("registrations")
      .select("full_name, email, phone")
      .eq("user_id", userId)
      .maybeSingle();
    const { data: prof } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .maybeSingle();
    const isReal = (e?: string | null) => !!e && !e.toLowerCase().endsWith("@baba.local");
    const regEmail = isReal(reg?.email) ? reg?.email : null;
    const profEmail = isReal(prof?.email) ? prof?.email : null;
    const email = regEmail ?? profEmail ?? null;
    const recipientName = reg?.full_name ?? prof?.full_name ?? "there";

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
      .select("applicants_count, is_online, online_url, event_date, location, description, title")
      .eq("id", data.opportunityId)
      .single();
    const next = (opp?.applicants_count ?? 0) + 1;
    await supabase
      .from("opportunities")
      .update({ applicants_count: next })
      .eq("id", data.opportunityId);

    // In-app notification: "You have signed up for this event. Click to get to
    // normal information." — links back to the events page.
    await supabase.from("user_notifications").insert({
      user_id: userId,
      notification_id: null,
      title: `You have signed up for this event`,
      body: `${data.title}. Click to get to normal information.`,
      link_url: `${SITE_URL}/events`,
      is_popup: false,
      is_important: false,
    });

    // Email the event detail to the address on the member's dashboard.
    let emailed = false;
    if (email) {
      try {
        const res = await sendResendEmail({
          templateName: "event-signup",
          recipientEmail: email,
          templateData: {
            siteName: SITE_NAME,
            siteUrl: SITE_URL,
            recipient: recipientName,
            eventTitle: opp?.title ?? data.title,
            eventDate: dateLabel(opp?.event_date ?? null),
            eventLocation: opp?.is_online ? "Online" : (opp?.location ?? "Location to be announced"),
            eventDescription: opp?.description ?? "",
            isOnline: !!opp?.is_online,
            onlineUrl: opp?.online_url ?? null,
          },
        });
        emailed = !!res;
      } catch (e) {
        console.warn("[signup] confirmation email failed:", e);
      }
    }

    return { ok: true, already: false, applicantCount: next, emailed };
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

/** Signed-up events with dates, so the dashboard can show countdowns. */
export const listMyEventSignupsDetailed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: apps, error } = await supabase
      .from("opportunity_applications")
      .select("opportunity_title, created_at")
      .eq("user_id", userId)
      .eq("opportunity_kind", "event")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const titles = (apps ?? []).map((a) => a.opportunity_title as string);
    if (titles.length === 0) return [];

    const { data: opps } = await supabase
      .from("opportunities")
      .select("id,title,event_date,event_end_date,location,is_online,online_url,description,applicants_count")
      .in("title", titles)
      .eq("kind", "event");

    return (opps ?? []).map((o) => ({
      id: o.id,
      title: o.title,
      eventDate: o.event_date,
      eventEndDate: o.event_end_date,
      location: o.is_online ? "Online" : (o.location ?? "Location to be announced"),
      isOnline: !!o.is_online,
      onlineUrl: o.online_url ?? null,
      description: o.description ?? "",
      applicantsCount: o.applicants_count ?? 0,
    }));
  });
