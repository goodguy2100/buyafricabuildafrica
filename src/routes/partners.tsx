import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Landmark, GraduationCap, HandHeart, Check } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Partner with BABA — corporates, governments, training institutions and development organizations building Africa's industrial future together.",
      },
    ],
    links: [{ rel: "canonical", href: "/partners" }],
  }),
  component: Partners,
});

const types = [
  { icon: Building2, title: "Corporate Partners", body: "Source verified local talent and suppliers, and fulfill local-content commitments at scale." },
  { icon: Landmark, title: "Government & County", body: "Deliver job-creation, apprenticeship and infrastructure mandates through a verified workforce." },
  { icon: GraduationCap, title: "Training Institutions", body: "Connect TVET graduates directly to employers and continuous upskilling pathways." },
  { icon: HandHeart, title: "Development Organizations", body: "Scale impact programs with transparent, data-backed outcomes across counties." },
];

const benefits = [
  "Priority access to the verified national workforce database",
  "Co-branded skills and apprenticeship programs",
  "Local procurement and supplier matchmaking",
  "Impact reporting dashboards and measurable outcomes",
];

function Partners() {
  return (
    <PageShell>
      <section className="border-b border-baba-teal/10 bg-baba-teal/5">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Collaboration
          </span>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-baba-slate sm:text-5xl">
            Partner with BABA
          </h1>
          <p className="mt-4 max-w-2xl text-baba-slate/70">
            Join a continental coalition of institutions investing in African skills, local
            manufacturing and shared prosperity.
          </p>
          <Link
            to="/contact"
            className="baba-gradient mt-7 inline-block rounded-lg px-6 py-3 text-sm font-semibold"
          >
            Become a Partner
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {types.map((t) => (
            <div
              key={t.title}
              className="baba-card-hover flex gap-4 rounded-2xl border border-baba-teal/10 bg-card p-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-baba-teal/10">
                <t.icon className="h-6 w-6 text-baba-teal" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-baba-slate">
                  {t.title}
                </h3>
                <p className="mt-1.5 text-sm text-baba-slate/65">{t.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 rounded-3xl bg-baba-teal p-8 text-baba-alabaster lg:grid-cols-2 lg:p-12">
          <div>
            <h2 className="font-display text-3xl font-extrabold">Why partner with us</h2>
            <p className="mt-3 text-baba-alabaster/80">
              We provide the verified infrastructure, data and reach to turn local-content
              ambitions into measurable continental impact.
            </p>
          </div>
          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex gap-3 text-sm text-baba-alabaster/90">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-baba-copper" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
