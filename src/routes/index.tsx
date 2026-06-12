import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  GraduationCap,
  PackageX,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Users,
  MapPin,
  Building,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Counter } from "@/components/Counter";
import { pillars } from "@/data/pillars";
import heroCollage from "@/assets/hero-collage.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Buy Africa Build Africa (BABA) | Building the Future of the Continent" },
      {
        name: "description",
        content:
          "An African initiative building skills, jobs, cities and futures. Connect local talent with continental opportunity.",
      },
      { property: "og:title", content: "Buy Africa Build Africa (BABA)" },
      {
        property: "og:description",
        content: "An African initiative building skills, jobs, cities and futures.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const challenges = [
  {
    icon: AlertTriangle,
    title: "Structural Unemployment",
    body: "Vast pools of potential workers lack the formal pipeline to high-value industrial projects.",
  },
  {
    icon: GraduationCap,
    title: "Skills Gap",
    body: "Disconnect between educational output and technical industry requirements on the ground.",
  },
  {
    icon: PackageX,
    title: "Import Reliance",
    body: "Heavy dependence on imported labor and materials weakens local supply chains.",
  },
];

const solutions = [
  {
    title: "Integrated Skills Training",
    body: "Continuous upskilling programs aligned with real-time construction and manufacturing needs.",
  },
  {
    title: "Digital Workforce Database",
    body: "A centralized, verified registry for workers and professionals to connect with contractors.",
  },
  {
    title: "Manufacturing Integration",
    body: "Prioritizing local materials and equipment to stimulate continental industry.",
  },
  {
    title: "TVET Collaboration",
    body: "Direct partnership with Technical and Vocational Education and Training centers.",
  },
];

const impactStats = [
  { icon: Briefcase, value: "12,500+", label: "Jobs Created" },
  { icon: Users, value: "350+", label: "Trainings" },
  { icon: MapPin, value: "47", label: "Counties" },
  { icon: Building, value: "120+", label: "Projects" },
];

function Home() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden baba-wash">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-baba-teal/20 bg-baba-alabaster px-4 py-1.5 text-sm font-semibold text-baba-teal shadow-sm">
              ✨ Building Africa, by Africans 💪
            </span>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-baba-slate sm:text-6xl lg:text-7xl">
              Buy Africa
              <br />
              <span className="baba-rainbow">Build Africa</span>
            </h1>
            <p className="mt-6 font-display text-xl font-semibold text-baba-teal sm:text-2xl">
              An African Initiative Building Skills, Jobs, Cities, and Futures.
            </p>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-baba-slate/70">
              Join the movement that connects local talent with continental opportunities.
              We are bridging the gap between skilled workforce and institutional demand.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-full bg-baba-teal px-6 py-3 text-sm font-semibold text-baba-alabaster shadow-lg shadow-baba-teal/25 transition-colors hover:bg-baba-teal-dark"
              >
                Join as Worker
              </Link>
              <Link
                to="/register"
                className="rounded-full border-2 border-baba-teal px-6 py-3 text-sm font-semibold text-baba-teal transition-colors hover:bg-baba-teal hover:text-baba-alabaster"
              >
                Join as Professional
              </Link>
            <Link
              to="/partners"
              className="rounded-full border-2 border-baba-copper px-6 py-3 text-sm font-semibold text-baba-copper-dark transition-colors hover:bg-baba-copper hover:text-baba-slate"
            >
              Register as Partner
            </Link>
            <Link
              to="/events"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-baba-alabaster shadow-lg shadow-accent/25 transition-colors hover:opacity-90"
            >
              BABA Training Institute
            </Link>
          </div>
        </div>
        <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-baba-teal/10 shadow-2xl shadow-baba-slate/10">
              <img
                src={heroCollage}
                alt="African artisans, engineers and professionals building modern industry"
                width={1280}
                height={960}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 hidden h-24 w-24 rounded-[1.5rem] border-4 border-baba-copper/50 sm:block" />
            <div className="absolute -top-4 -right-4 hidden h-16 w-16 rounded-full border-4 border-baba-teal/40 sm:block" />
          </div>
        </div>
      </section>


      {/* Impact Dashboard */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="rounded-3xl bg-baba-teal px-6 py-12 text-baba-alabaster lg:px-12">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-baba-copper">
            Real-Time Impact Tracker
          </p>
          <h2 className="mt-2 text-center font-display text-2xl font-extrabold sm:text-3xl">
            Scaling Modern African Industry
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
            <Counter target={45230} label="Members" />
            <Counter target={28150} label="Workers" />
            <Counter target={8420} label="Professionals" />
            <Counter target={3120} label="Contractors" />
            <Counter target={960} label="Suppliers" />
            <Counter target={80} label="Partners" />
          </div>
          <div className="mt-10 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {impactStats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <s.icon className="h-5 w-5 text-baba-copper" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{s.value}</p>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-baba-alabaster/60">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge vs Solution */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Market Realities
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
            The Challenge
          </h2>
          <p className="mt-3 max-w-md text-baba-slate/70">
            Fragmented markets and reliance on external expertise limit local economic
            growth potential.
          </p>
          <div className="mt-8 space-y-5">
            {challenges.map((c) => (
              <div key={c.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                  <c.icon className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-baba-slate">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-sm text-baba-slate/65">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-baba-teal p-8 text-baba-alabaster lg:p-10">
          <span className="inline-block rounded-full bg-baba-copper px-3 py-1 text-xs font-bold uppercase tracking-wide text-baba-slate">
            Our Mandate
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            The BABA Solution
          </h2>
          <p className="mt-3 text-baba-alabaster/80">
            We provide the technical and organizational framework to build Africa from
            within.
          </p>
          <div className="mt-7 space-y-5">
            {solutions.map((s) => (
              <div key={s.title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-baba-copper" />
                <div>
                  <h3 className="font-display text-base font-bold">{s.title}</h3>
                  <p className="mt-0.5 text-sm text-baba-alabaster/70">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Preview */}
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
              Foundation
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
              The BABA Pillars
            </h2>
          </div>
          <Link
            to="/pillars"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-baba-teal hover:text-baba-teal-dark"
          >
            View Full Strategy <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {pillars.map((p) => (
            <Link
              key={p.key}
              to="/pillars"
              className="baba-card-hover rounded-2xl border border-baba-teal/10 bg-card p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-baba-teal/10">
                <p.icon className="h-5 w-5 text-baba-teal" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">
                {p.name}
              </h3>
              <p className="mt-2 text-sm text-baba-slate/65">{p.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-baba-copper-dark">
                Learn More <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
