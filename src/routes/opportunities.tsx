import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Browse jobs, apprenticeships, training masterclasses and project tenders across Africa on the BABA network.",
      },
    ],
    links: [{ rel: "canonical", href: "/opportunities" }],
  }),
  component: Opportunities,
});

type Kind = "Jobs" | "Apprenticeships" | "Training" | "Tenders";

interface Opp {
  id: number;
  kind: Kind;
  title: string;
  org: string;
  location: string;
  meta: string;
}

const opportunities: Opp[] = [
  { id: 1, kind: "Jobs", title: "Tiling Artisan", org: "Skyline Builders Ltd", location: "Nairobi, Kenya", meta: "Full-time · KES 60k–90k" },
  { id: 2, kind: "Jobs", title: "Interior Architect", org: "Urban Forge Studio", location: "Kisumu, Kenya", meta: "Full-time · Senior" },
  { id: 3, kind: "Apprenticeships", title: "County Public Works Attachment", org: "Nakuru County Government", location: "Nakuru, Kenya", meta: "6 months · Stipend" },
  { id: 4, kind: "Apprenticeships", title: "Solar Installation Apprentice", org: "GreenGrid Africa", location: "Mombasa, Kenya", meta: "12 months · Certified" },
  { id: 5, kind: "Training", title: "Advanced Masonry Masterclass", org: "BABA Skills Academy", location: "Online + Nairobi", meta: "4 weeks · Certificate" },
  { id: 6, kind: "Training", title: "Construction Project Management", org: "BABA Skills Academy", location: "Online", meta: "8 weeks · Diploma" },
  { id: 7, kind: "Tenders", title: "Supply of Eco-Bricks (50,000 units)", org: "Affordable Housing Board", location: "Eldoret, Kenya", meta: "Closes in 14 days" },
  { id: 8, kind: "Tenders", title: "Bamboo Scaffolding Supply", org: "Coastal Developers", location: "Mombasa, Kenya", meta: "Closes in 9 days" },
];

const kinds: ("All" | Kind)[] = ["All", "Jobs", "Apprenticeships", "Training", "Tenders"];

function Opportunities() {
  const [filter, setFilter] = useState<"All" | Kind>("All");
  const list =
    filter === "All" ? opportunities : opportunities.filter((o) => o.kind === filter);

  return (
    <PageShell>
      <section className="border-b border-baba-teal/10 bg-baba-teal/5">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Grow With Us
          </span>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-baba-slate sm:text-5xl">
            Opportunities
          </h1>
          <p className="mt-4 max-w-2xl text-baba-slate/70">
            Jobs, apprenticeships, training masterclasses and project tenders — all in one
            verified continental marketplace.
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
                  ? "bg-baba-teal text-baba-alabaster"
                  : "bg-secondary text-baba-slate/70 hover:bg-baba-teal/10"
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
              className="baba-card-hover flex flex-col rounded-2xl border border-baba-teal/10 bg-card p-6"
            >
              <span className="inline-flex w-fit rounded-full bg-baba-copper/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-baba-copper-dark">
                {o.kind}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">
                {o.title}
              </h3>
              <p className="mt-1 text-sm font-semibold text-baba-teal">{o.org}</p>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-baba-slate/60">
                <MapPin className="h-3.5 w-3.5" /> {o.location}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-baba-slate/60">
                <Clock className="h-3.5 w-3.5" /> {o.meta}
              </p>
              <button className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-baba-copper-dark hover:underline">
                View &amp; Apply <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
