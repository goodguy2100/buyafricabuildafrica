import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { pillars } from "@/data/pillars";

export const Route = createFileRoute("/pillars")({
  head: () => ({
    meta: [
      { title: "The Five Pillars | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Skills Africa, Buy Africa, Build Africa, Green Africa and Prosper Africa — the five strategic pillars driving the BABA mandate.",
      },
    ],
    links: [{ rel: "canonical", href: "/pillars" }],
  }),
  component: Pillars,
});

function Pillars() {
  const [active, setActive] = useState(pillars[0].key);
  const current = pillars.find((p) => p.key === active)!;

  return (
    <PageShell>
      <section className="border-b border-baba-blue/10 bg-baba-blue/5">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Foundation
          </span>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-baba-slate sm:text-5xl">
            The Five BABA Pillars
          </h1>
          <p className="mt-4 max-w-2xl text-baba-slate/70">
            A coordinated strategy to build the continent from within — developing people,
            local value, infrastructure, sustainability and shared prosperity.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="flex flex-wrap gap-2.5">
          {pillars.map((p) => (
            <button
              key={p.key}
              onClick={() => setActive(p.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                active === p.key
                  ? "bg-baba-blue text-baba-cream"
                  : "bg-secondary text-baba-slate/70 hover:bg-baba-blue/10"
              }`}
            >
              <p.icon className="h-4 w-4" />
              {p.name}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 rounded-3xl border border-baba-blue/10 bg-card p-8 lg:grid-cols-2 lg:p-12">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-baba-blue/10">
              <current.icon className="h-7 w-7 text-baba-blue" />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-baba-copper-dark">
              {current.tagline}
            </p>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-baba-slate">
              {current.name}
            </h2>
            <p className="mt-4 text-baba-slate/70">{current.description}</p>
          </div>
          <div className="rounded-2xl bg-secondary p-6">
            <h3 className="font-display text-base font-bold text-baba-slate">
              Focus Areas
            </h3>
            <ul className="mt-4 space-y-3">
              {current.focus.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-baba-slate/75">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-baba-blue/15">
                    <Check className="h-3.5 w-3.5 text-baba-blue" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {pillars.map((p) => (
            <button
              key={p.key}
              onClick={() => setActive(p.key)}
              className={`baba-card-hover rounded-2xl border p-5 text-left ${
                active === p.key
                  ? "border-baba-blue bg-baba-blue/5"
                  : "border-baba-blue/10 bg-card"
              }`}
            >
              <p.icon className="h-5 w-5 text-baba-blue" />
              <h3 className="mt-3 font-display text-base font-bold text-baba-slate">
                {p.name}
              </h3>
              <p className="mt-1.5 text-xs text-baba-slate/60">{p.tagline}</p>
            </button>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
