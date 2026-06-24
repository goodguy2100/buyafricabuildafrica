import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Award, Globe, Building, MapPin, Clock, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "BABA's three major annual events — the Awards, Word Conference & Expo, and Corporate Strategy Meeting.",
      },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: Events,
});

const events = [
  {
    icon: Award,
    title: "BABA Annual Awards",
    date: "Every December",
    time: "Evening gala",
    location: "To be announced",
    description:
      "Celebrating excellence across the built environment. The BABA Annual Awards recognize outstanding achievements from professionals and artisans across multiple categories.",
    highlights: [
      "Best Plumber — recognizing excellence in plumbing and sanitation",
      "Best Electrician — honoring electrical installation and maintenance skills",
      "Best ICT Professional — for innovation in construction technology",
      "Architects — first runner, second runner, third runner categories",
      "Multiple categories across all trades and professions in the built environment",
    ],
  },
  {
    icon: Globe,
    title: "Word Conference & Expo",
    date: "Annual",
    time: "Full-day event",
    location: "Rotating across African cities",
    description:
      "A continental gathering where engineers, architects, innovators, and manufacturers showcase African-made solutions. Products and innovations that don't require importation — built in Africa, for Africa. The expo highlights climate-resilient building, local materials, and indigenous innovation.",
    highlights: [
      "Exhibition of African-made building materials and technologies",
      "Presentations by engineers and architects on local innovation",
      "Climate-resilient and green building showcase",
      "Networking between manufacturers, suppliers, and buyers",
      "Spotlight on products that keep value on the continent",
    ],
  },
  {
    icon: Building,
    title: "Corporate Strategy Meeting",
    date: "Annual (August)",
    time: "Full-day session",
    location: "Nairobi, Kenya",
    description:
      "High-level strategy session bringing together board members, partners, government representatives, and key stakeholders. This meeting sets the direction for the year ahead, reviews progress across all pillars, and aligns on expansion plans into new regions.",
    highlights: [
      "Annual performance review and strategic planning",
      "Regional expansion roadmap discussion",
      "Partnership and funding alignment",
      "Stakeholder presentations and feedback",
      "Budget and resource allocation for the coming year",
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
              Three Major Annual Events
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              BABA Annual Events
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Every year, BABA delivers three major events — the Awards ceremony in December, the Word Conference &amp; Expo, and the Corporate Strategy Meeting — bringing together the entire built environment community from across Africa.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-baba-cream to-transparent" />
      </section>

      {/* Events List */}
      <section className="bg-baba-cream py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.title}
                className="baba-card-hover overflow-hidden rounded-2xl border border-baba-copper/20 bg-white"
              >
                <div className="h-2 bg-gradient-to-r from-baba-blue to-baba-copper" />
                <div className="p-6 md:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-baba-copper/10">
                    <event.icon className="h-6 w-6 text-baba-copper-dark" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-baba-slate">
                    {event.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-baba-slate/70">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-baba-blue/10 px-3 py-1 text-xs font-semibold text-baba-blue">
                      <Calendar className="h-3.5 w-3.5" />
                      {event.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <Clock className="h-3.5 w-3.5 text-baba-copper" />
                      {event.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <MapPin className="h-3.5 w-3.5 text-baba-copper" />
                      {event.location}
                    </span>
                  </div>
                  <p className="mt-4 leading-relaxed text-baba-slate/80 text-sm">
                    {event.description}
                  </p>
                  <h4 className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-baba-blue">
                    Highlights
                  </h4>
                  <ul className="space-y-1.5">
                    {event.highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-baba-slate/75">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-baba-copper/15 text-[9px] text-baba-copper-dark">
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

      {/* Monthly Regional Activities Note */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-2xl border border-baba-blue/10 bg-white p-8 text-center">
          <Calendar className="mx-auto h-8 w-8 text-baba-blue" />
          <h3 className="mt-3 font-display text-xl font-bold text-baba-slate">
            Monthly Regional Activities
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-baba-slate/70">
            Beyond the three major annual events, BABA runs training and marketing activities in regional blocks every two months — covering Western, Coastal, Mount Kenya, Rift Valley, Northern, and Nairobi regions in rotation.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
