import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Award, MapPin, Clock, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Upcoming BABA events — the Official Launch and Annual Awards.",
      },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: Events,
});

const events = [
  {
    title: "BABA Official Launch",
    date: "End of September 2026",
    time: "To be announced",
    location: "To be announced",
    description:
      "The official launch of Buy Africa Build Africa (BABA) — bringing together professionals, artisans, partners, government representatives, and stakeholders from across the continent. This landmark event marks the beginning of a transformative journey to connect local talent with continental opportunity.",
    highlights: [
      "Keynote address by BABA leadership outlining the vision and strategic priorities",
      "Panel discussion with industry leaders from across Africa's built environment",
      "Networking reception with professionals, partners, and policymakers",
      "Launch of BABA membership programmes and inaugural initiatives",
      "Showcasing of the BABA Institute and upcoming training programmes",
    ],
  },
  {
    title: "BABA Annual Awards",
    date: "December 7, 2026",
    time: "Evening gala",
    location: "To be announced",
    description:
      "Celebrating excellence across the built environment. The BABA Annual Awards recognize outstanding achievements and contributions from professionals, artisans, contractors, suppliers, and innovators who are building Africa from within.",
    highlights: [
      "Awards ceremony recognizing excellence in multiple categories",
      "Best Plumber, Best Electrician, Best Architect, Best Engineer, and more",
      "Gala dinner with distinguished guests from government and industry",
      "Live entertainment and cultural showcase celebrating African talent",
      "Networking with senior business leaders and decision-makers",
    ],
  },
];

export function Events() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-baba-blue via-baba-blue-dark to-baba-slate py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-baba-copper/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-baba-blue-light/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <Calendar className="h-4 w-4" />
              Upcoming Events
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              Flagship Events
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Discover the key events driving the BABA mission forward — from our official
              launch to the annual celebration of excellence across the built environment.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-baba-cream to-transparent" />
      </section>

      {/* Events List */}
      <section className="bg-baba-cream py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:gap-10">
            {events.map((event) => (
              <div
                key={event.title}
                className="baba-card-hover overflow-hidden rounded-2xl border border-baba-copper/20 bg-white"
              >
                <div className="h-2 bg-gradient-to-r from-baba-blue to-baba-copper" />
                <div className="p-8 md:p-10">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-baba-blue/10 px-4 py-1.5 text-sm font-semibold text-baba-blue">
                    <Calendar className="h-4 w-4" />
                    {event.date}
                  </div>
                  <h3 className="font-display text-2xl font-bold text-baba-slate md:text-3xl">
                    {event.title}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-baba-slate/70">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-baba-copper" />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-baba-copper" />
                      {event.location}
                    </span>
                  </div>
                  <p className="mt-6 leading-relaxed text-baba-slate/80">
                    {event.description}
                  </p>
                  <h4 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-baba-blue">
                    Event Highlights
                  </h4>
                  <ul className="space-y-2">
                    {event.highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-baba-slate/80">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-baba-copper/15 text-xs text-baba-copper-dark">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mx-auto mt-20 max-w-2xl text-center">
            <div className="rounded-2xl border border-baba-copper/10 bg-white p-10 shadow-lg md:p-14">
              <h2 className="font-display text-2xl font-bold text-baba-slate md:text-3xl">
                Interested in Attending?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-baba-slate/70">
                Registration details will be announced closer to each event date. Join our
                mailing list to be the first to receive updates and invitations.
              </p>
              <Link
                to="/contact"
                className="baba-btn-primary mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-lg font-semibold text-white shadow-lg shadow-baba-blue/25 transition-all duration-300 hover:shadow-xl"
              >
                Join Our Mailing List
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
