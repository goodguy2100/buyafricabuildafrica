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
  location: string | null;
}): PublicEvent {
  if (!row.event_date) {
    return {
      id: row.id,
      title: row.title,
      dateLabel: "Date to be announced",
      location: row.location ?? "Location to be announced",
      description: row.description ?? "",
      start: "",
      end: "",
    };
  }
  const d = new Date(row.event_date);
  const time = fmtTime.format(d);
  const dateLabel =
    time === "00:00" ? fmtDate.format(d) : `${fmtDate.format(d)} · ${time.trim()}`;
  const ymd = fmtYmd.format(d).replaceAll("-", "");
  return {
    id: row.id,
    title: row.title,
    dateLabel,
    location: row.location ?? "Location to be announced",
    description: row.description ?? "",
    start: ymd,
    end: ymd,
  };
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
      .select("id,title,description,event_date,location")
      .eq("kind", "event")
      .in("status", ["open", "upcoming"])
      .order("event_date", { ascending: true, nullsFirst: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(toPublicEvent);
  });
