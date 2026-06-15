import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, MapPin, ArrowRight, GraduationCap, Award, Users, Hammer } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Training | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Masterclasses, skills training, certification programs, county workshops, industry forums and construction training camps across Africa.",
      },
      { property: "og:title", content: "Events & Training | BABA" },
      {
        property: "og:description",
        content:
          "Join BABA masterclasses, certification programs, county workshops and industry forums.",
      },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: Events,
});

const categories = [
  { icon: GraduationCap, title: "Masterclasses", body: "Expert-led sessions on craft, trade and professional excellence." },
  { icon: Hammer, title: "Skills Training Programs", body: "Hands-on technical training aligned to real industry demand." },
  { icon: Award, title: "Certification Programs", body: "Recognized credentials that move trainees into employment." },
  { icon: MapPin, title: "County Workshops", body: "Localized workshops bringing skills closer to communities." },
  { icon: Users, title: "Industry Forums", body: "Connecting workforce, employers, institutions and government." },
  { icon: Hammer, title: "Construction Training Camps", body: "Immersive site-readiness camps for the built environment." },
];

const upcoming = [
  {
    title: "National Artisan Certification Camp",
    date: "Sat, Jun 20, 2026",
    location: "Nairobi, Kenya",
    tag: "Certification",
  },
  {
    title: "Women in Construction Masterclass",
    date: "Wed, Jul 8, 2026",
    location: "Kisumu, Kenya",
    tag: "Masterclass",
  },
  {
    title: "Green Building Materials Forum",
    date: "Thu, Jul 23, 2026",
    location: "Mombasa, Kenya",
    tag: "Industry Forum",
  },
];

function Events() {
  return (
    <PageShell>
      <section className="baba-wash border-b border-baba-teal/10">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Learn & Connect
          </span>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-tight text-baba-slate sm:text-5xl">
            Events & <span className="baba-rainbow">Training</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-baba-slate/70">
            From masterclasses to county-based workshops, BABA runs a continuous calendar
            of programs that turn skills into certified, employable expertise.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h2 className="font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
          What We Run
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c.title}
              className="baba-card-hover rounded-2xl border border-baba-teal/10 bg-card p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-baba-teal/10">
                <c.icon className="h-5 w-5 text-baba-teal" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">
                {c.title}
              </h3>
              <p className="mt-2 text-sm text-baba-slate/65">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
            Upcoming Events
          </h2>
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-baba-teal hover:text-baba-teal-dark"
          >
            See all opportunities <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {upcoming.map((e) => (
            <div
              key={e.title}
              className="baba-card-hover flex flex-col rounded-2xl border border-baba-teal/10 bg-card p-6"
            >
              <span className="inline-flex w-fit rounded-full bg-baba-copper/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-baba-copper-dark">
                {e.tag}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">
                {e.title}
              </h3>
              <div className="mt-3 space-y-1.5 text-sm text-baba-slate/65">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-baba-teal" /> {e.date}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-baba-teal" /> {e.location}
                </p>
              </div>
              <Link
                to="/register"
                className="mt-5 inline-flex w-fit rounded-full baba-btn-primary px-4 py-2 text-sm font-semibold text-baba-alabaster transition-colors hover:bg-baba-teal-dark"
              >
                Register
              </Link>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
