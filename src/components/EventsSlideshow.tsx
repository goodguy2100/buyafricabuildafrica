import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useUpcomingEvents } from "@/lib/use-upcoming-events";

/**
 * Auto-rotating slideshow of the upcoming events BABA is tracking.
 * Pauses on hover; arrows + dots for manual control.
 */
export function EventsSlideshow() {
  const { events } = useUpcomingEvents();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = events.length;

  useEffect(() => {
    if (n === 0) return;
    setIndex((i) => Math.min(i, n - 1));
  }, [n]);

  useEffect(() => {
    if (paused || n === 0) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 4500);
    return () => clearInterval(t);
  }, [paused, n]);

  if (n === 0) return null;

  const ev = events[Math.min(index, n - 1)];

  return (
    <div
      className="relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-baba-blue/10 bg-white/85 shadow-xl shadow-baba-blue/10 backdrop-blur"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-baba-copper/10 blur-3xl" />
      <div className="relative px-8 pb-8 pt-10 text-center sm:px-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-baba-blue/20 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
          <Calendar className="h-3.5 w-3.5" /> Upcoming Event
        </span>
        <div className="mx-auto mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-baba-blue/10">
          <ev.icon className="h-7 w-7 text-baba-blue" />
        </div>
        <h3 className="mt-4 font-display text-3xl font-extrabold text-baba-slate">{ev.title}</h3>
        <p className="mt-3 text-sm font-bold text-baba-blue">{ev.date}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-baba-copper-dark">
          <MapPin className="h-4 w-4" /> {ev.location}
        </p>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-baba-slate/70">
          {ev.description}
        </p>
      </div>

      <button
        onClick={() => setIndex((i) => (i - 1 + n) % n)}
        aria-label="Previous event"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-baba-blue/15 bg-white/90 p-2 text-baba-blue shadow transition hover:bg-baba-blue hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => setIndex((i) => (i + 1) % n)}
        aria-label="Next event"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-baba-blue/15 bg-white/90 p-2 text-baba-blue shadow transition hover:bg-baba-blue hover:text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="relative flex items-center justify-center gap-2 pb-6">
        {events.map((e, i) => (
          <button
            key={e.id}
            onClick={() => setIndex(i)}
            aria-label={`Show ${e.title}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-baba-blue" : "w-2 bg-baba-blue/25 hover:bg-baba-blue/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
