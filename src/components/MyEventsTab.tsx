import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Calendar, Globe, MapPin, Clock, Check, ArrowRight } from "lucide-react";
import { listMyEventSignupsDetailed } from "@/lib/events-apply.functions";

interface SignedUpEvent {
  id: string;
  title: string;
  eventDate: string | null;
  eventEndDate: string | null;
  location: string;
  isOnline: boolean;
  onlineUrl: string | null;
  description: string;
  applicantsCount: number;
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  state: "future" | "live" | "ended";
}

function countdownTo(targetMs: number, nowMs: number): Countdown {
  const diff = targetMs - nowMs;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, state: "ended" };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    state: "future",
  };
}

function EventCountdown({ event }: { event: SignedUpEvent }) {
  const now = useNow();
  if (!event.eventDate) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-baba-blue/10 px-3 py-1 text-xs font-semibold text-baba-blue">
        <Calendar className="h-3.5 w-3.5" /> Date to be announced
      </span>
    );
  }

  const startMs = new Date(event.eventDate).getTime();
  const endMs = event.eventEndDate ? new Date(event.eventEndDate).getTime() : startMs;
  let cd: Countdown;
  if (now < startMs) cd = countdownTo(startMs, now);
  else if (now <= endMs) cd = { days: 0, hours: 0, minutes: 0, seconds: 0, state: "live" };
  else cd = countdownTo(startMs, now);

  const pad = (n: number) => String(n).padStart(2, "0");
  const startDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(new Date(event.eventDate));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {cd.state === "future" && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-baba-blue/10 px-3 py-1 text-xs font-bold text-baba-blue">
          <Clock className="h-3.5 w-3.5" />
          {cd.days > 0 && <>{cd.days}d </>}
          {pad(cd.hours)}:{pad(cd.minutes)}:{pad(cd.seconds)}
        </span>
      )}
      {cd.state === "live" && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
          </span>
          Live now
        </span>
      )}
      {cd.state === "ended" && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-baba-slate/10 px-3 py-1 text-xs font-semibold text-baba-slate/60">
          Ended · {startDate}
        </span>
      )}
    </div>
  );
}

export function MyEventsTab() {
  const fn = useServerFn(listMyEventSignupsDetailed);
  const q = useQuery({ queryKey: ["my-event-signups"], queryFn: () => fn() });
  const events = (q.data ?? []) as SignedUpEvent[];

  if (q.isLoading) {
    return (
      <div className="rounded-2xl border border-baba-blue/10 bg-card p-6 text-center text-sm text-baba-slate/60">
        Loading your events…
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-baba-blue/20 bg-card p-10 text-center">
        <Calendar className="mx-auto h-8 w-8 text-baba-blue/40" />
        <p className="mt-3 text-sm text-baba-slate/60">
          You haven't signed up for any events yet.{" "}
          <Link to="/events" className="font-semibold text-baba-copper-dark hover:underline">
            Explore upcoming events.
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
      <h2 className="font-display text-lg font-bold text-baba-slate">My Events</h2>
      <p className="mt-1 text-sm text-baba-slate/60">
        Events you've signed up for — watch the countdown!
      </p>
      <div className="mt-5 grid gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-baba-blue/10 p-4"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display font-bold text-baba-slate">{event.title}</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                  <Check className="h-3 w-3" /> Signed up
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-baba-slate/70">
                {event.isOnline ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 font-semibold text-sky-700">
                    <Globe className="h-3 w-3" /> Online event
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-baba-copper" /> {event.location}
                  </span>
                )}
                {event.applicantsCount > 0 && (
                  <span className="text-baba-slate/50">
                    {event.applicantsCount} signed up
                  </span>
                )}
              </div>
              {event.description && (
                <p className="mt-2 line-clamp-2 text-sm text-baba-slate/60">{event.description}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <EventCountdown event={event} />
              <Link
                to="/events"
                className="inline-flex items-center gap-1.5 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                Event info <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
