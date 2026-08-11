import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export interface PublicEvent {
  id: string;
  title: string;
  dateLabel: string;
  location: string;
  description: string;
  start: string; // YYYYMMDD ("" when undated)
  end: string; // YYYYMMDD ("" when undated)
  imageUrl: string | null;
  icon: string | null;
  applicantsCount: number;
}

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input: any, init: any) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const fmtDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Nairobi",
});
const fmtTime = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Africa/Nairobi",
});
const fmtYmd = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Africa/Nairobi",
});

function toPublicEvent(row: {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  event_end_date: string | null;
  location: string | null;
  image_url: string | null;
  icon: string | null;
  applicants_count: number | null;
}): PublicEvent {
  const base = {
    id: row.id,
    title: row.title,
    location: row.location ?? "Location to be announced",
    description: row.description ?? "",
    imageUrl: row.image_url ?? null,
    icon: row.icon ?? null,
    applicantsCount: row.applicants_count ?? 0,
  };
  if (!row.event_date) {
    return { ...base, dateLabel: "Date to be announced", start: "", end: "" };
  }
  const start = new Date(row.event_date);
  const end = row.event_end_date ? new Date(row.event_end_date) : start;
  const startYmd = fmtYmd.format(start).replaceAll("-", "");
  const endYmd = fmtYmd.format(end).replaceAll("-", "");
  let dateLabel: string;
  if (endYmd !== startYmd) {
    dateLabel = `${fmtDate.format(start)} – ${fmtDate.format(end)}`;
  } else {
    const time = fmtTime.format(start);
    dateLabel =
      time === "00:00" ? fmtDate.format(start) : `${fmtDate.format(start)} · ${time.trim()}`;
  }
  return { ...base, dateLabel, start: startYmd, end: endYmd };
}

/**
 * Public events for the website — reads the opportunities table (kind =
 * 'event') so admins can add/edit dates, times, locations and descriptions
 * from the admin panel without a redeploy.
 */
export const listPublicEvents = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({}).parse(input ?? {}))
  .handler(async (): Promise<PublicEvent[]> => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("opportunities")
      .select("id,title,description,event_date,event_end_date,location,image_url,icon,applicants_count")
      .eq("kind", "event")
      .in("status", ["open", "upcoming"])
      .order("event_date", { ascending: true, nullsFirst: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(toPublicEvent);
  });
