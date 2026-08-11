import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Award,
  Calendar,
  Globe,
  Hammer,
  Landmark,
  Rocket,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { listPublicEvents, type PublicEvent } from "@/lib/events.functions";

export interface DisplayEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  icon: LucideIcon;
  start: string; // YYYYMMDD or "" (undated)
  end: string; // YYYYMMDD or "" (undated)
  imageUrl: string | null;
  applicantsCount: number;
}

const ICON_BY_KEY: Record<string, LucideIcon> = {
  hammer: Hammer,
  landmark: Landmark,
  globe: Globe,
  award: Award,
  sparkles: Sparkles,
  rocket: Rocket,
  calendar: Calendar,
};

function pickIcon(title: string): LucideIcon {
  const t = title.toLowerCase();
  if (/expo|fair|show|exhibition/.test(t)) return Hammer;
  if (/award|gala/.test(t)) return Award;
  if (/launch/.test(t)) return Rocket;
  if (/summit|conference|forum/.test(t)) return Globe;
  return Calendar;
}

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * Live events for the public site — everything is admin-managed in Supabase
 * (opportunities table, kind = 'event'). No hardcoded fallback content:
 * admins create/edit events from Admin → Events.
 */
export function useUpcomingEvents() {
  const fn = useServerFn(listPublicEvents);
  const q = useQuery({
    queryKey: ["public-events"],
    queryFn: () => fn(),
    staleTime: 5 * 60_000,
  });

  const dbEvents: DisplayEvent[] = (q.data ?? []).map((e: PublicEvent) => ({
    id: e.id,
    title: e.title,
    date: e.dateLabel,
    location: e.location || "Location to be announced",
    description: e.description || "",
    icon: ICON_BY_KEY[e.icon ?? ""] ?? pickIcon(e.title),
    start: e.start,
    end: e.end,
    imageUrl: e.imageUrl,
    applicantsCount: e.applicantsCount,
  }));

  const today = todayKey();
  const events = dbEvents
    .filter((e) => !e.start || e.start >= today)
    .sort((a, b) => (a.start || "99999999").localeCompare(b.start || "99999999"));

  return { events, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };
}
