import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Calendar, MapPin, X } from "lucide-react";

const upcomingEvents = [
  {
    title: "Gardens Expo & Conference",
    date: "August 2026",
    location: "Sarit Centre, Nairobi",
    description: "A celebration of landscaping, garden design and sustainable green spaces.",
    start: "20260815",
    end: "20260816",
  },
  {
    title: "Official BABA Launch",
    date: "End of September 2026",
    location: "Nairobi, Kenya",
    description: "The official launch of Buy Africa Build Africa.",
    start: "20260930",
    end: "20260930",
  },
  {
    title: "BABA Excellence Awards",
    date: "1st December 2026",
    location: "To be announced",
    description: "An evening gala celebrating those building Africa.",
    start: "20261201",
    end: "20261201",
  },
];

function escapeICS(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function closestEvent() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return upcomingEvents
    .filter((e) => e.start >= today)
    .sort((a, b) => a.start.localeCompare(b.start))[0] ?? upcomingEvents[0];
}

function generateICS(event: (typeof upcomingEvents)[number]) {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `${event.title.toLowerCase().replace(/\s+/g, "-")}@buyafricabuildafrica.org`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Buy Africa Build Africa//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${event.start}`,
    `DTEND;VALUE=DATE:${event.end}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
    `LOCATION:${escapeICS(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function EventPopup() {
  const [visible, setVisible] = useState(false);
  const event = closestEvent();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCalendar = () => {
    const ics = generateICS(event);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-baba-blue via-baba-blue-light to-baba-copper shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/90">Upcoming Event</p>
              <h3 className="font-display text-base font-bold text-white sm:text-lg">{event.title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/90">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {event.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {event.location}
                </span>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              onClick={handleAddToCalendar}
              className="flex-1 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 sm:flex-initial"
            >
              Add to Calendar
            </button>
            <Link
              to="/events"
              className="flex-1 rounded-full bg-white px-3 py-2 text-center text-xs font-semibold text-baba-blue shadow transition hover:bg-white/90 sm:flex-initial"
            >
              Learn More
            </Link>
            <button
              onClick={() => setVisible(false)}
              aria-label="Close event notice"
              className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
