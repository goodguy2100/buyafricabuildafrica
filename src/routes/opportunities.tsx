import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Up & Coming | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Upcoming trainings, masterclasses and events you can sign up for across the BABA network.",
      },
    ],
    links: [{ rel: "canonical", href: "/opportunities" }],
  }),
  component: Opportunities,
});

type Kind = "Trainings" | "Masterclasses" | "Events";

interface Opp {
  id: number;
  kind: Kind;
  title: string;
  org: string;
  location: string;
  meta: string;
}

const opportunities: Opp[] = [
  { id: 1, kind: "Trainings", title: "Advanced Masonry Training", org: "BABA Skills Academy", location: "Online + Nairobi", meta: "Runs every other month · Certificate" },
  { id: 2, kind: "Trainings", title: "Green Building Fundamentals", org: "BABA Skills Academy", location: "Online", meta: "Next intake · Bi-monthly" },
  { id: 3, kind: "Trainings", title: "Construction Project Management", org: "BABA Skills Academy", location: "Online", meta: "8 weeks · Diploma" },
  { id: 4, kind: "Masterclasses", title: "Sustainable Design Masterclass", org: "BABA Capacity Building Hub", location: "Nairobi, Kenya", meta: "1 day · Sign up" },
  { id: 5, kind: "Masterclasses", title: "Entrepreneurship & Business Growth", org: "BABA Capacity Building Hub", location: "Online", meta: "Live session · Sign up" },
  { id: 6, kind: "Events", title: "BABA Industry Networking Meetup", org: "Buy Africa Build Africa", location: "Nairobi, Kenya", meta: "Free · Sign up to attend" },
  { id: 7, kind: "Events", title: "Green Building & Innovation Expo", org: "Buy Africa Build Africa", location: "Nairobi, Kenya", meta: "Register your interest" },
];

const kinds: ("All" | Kind)[] = ["All", "Trainings", "Masterclasses", "Events"];

function Opportunities() {
  const [filter, setFilter] = useState<"All" | Kind>("All");
  const list =
    filter === "All" ? opportunities : opportunities.filter((o) => o.kind === filter);

  return (
    <PageShell>
      <section className="border-b border-baba-blue/10 bg-baba-blue/5">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Grow With Us
          </span>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-baba-slate sm:text-5xl">
            Up &amp; Coming
          </h1>
          <p className="mt-4 max-w-2xl text-baba-slate/70">
            Upcoming trainings held every other month, masterclasses, and events you can
            sign up for across the BABA network.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="flex flex-wrap gap-2.5">
          {kinds.map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === k
                  ? "bg-baba-blue text-baba-cream"
                  : "bg-secondary text-baba-slate/70 hover:bg-baba-blue/10"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((o) => (
            <article
              key={o.id}
              className="baba-card-hover flex flex-col rounded-2xl border border-baba-blue/10 bg-card p-6"
            >
              <span className="inline-flex w-fit rounded-full bg-baba-copper/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-baba-copper-dark">
                {o.kind}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">
                {o.title}
              </h3>
              <p className="mt-1 text-sm font-semibold text-baba-blue">{o.org}</p>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-baba-slate/60">
                <MapPin className="h-3.5 w-3.5" /> {o.location}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-baba-slate/60">
                <Clock className="h-3.5 w-3.5" /> {o.meta}
              </p>
              <button className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-baba-copper-dark hover:underline">
                Sign Up <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
