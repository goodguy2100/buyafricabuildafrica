import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  GraduationCap,
  HeartHandshake,
  Briefcase,
  Building,
  MapPin,
  Handshake,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Counter } from "@/components/Counter";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Our Impact | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Track BABA's measurable impact across Africa — members registered, youth trained, women empowered, jobs created, projects supported and counties reached.",
      },
      { property: "og:title", content: "Our Impact | BABA" },
      {
        property: "og:description",
        content:
          "Measurable change across Africa: trained youth, empowered women, jobs created and partners onboarded.",
      },
    ],
    links: [{ rel: "canonical", href: "/impact" }],
  }),
  component: Impact,
});

const headline = [
  { target: 45230, label: "Members Registered", icon: Users },
  { target: 12800, label: "Youth Trained", icon: GraduationCap },
  { target: 7400, label: "Women Empowered", icon: HeartHandshake },
  { target: 12500, label: "Jobs Created", icon: Briefcase },
  { target: 120, label: "Projects Supported", icon: Building },
  { target: 47, label: "Counties Reached", icon: MapPin },
  { target: 80, label: "Partner Organizations", icon: Handshake },
];

const stories = [
  {
    title: "Skilling the next generation",
    body: "Through TVET partnerships and apprenticeships, thousands of young artisans have moved from training directly into paid, certified work.",
  },
  {
    title: "Empowering women in the trades",
    body: "Targeted programs are breaking barriers, bringing more women into construction, manufacturing and professional roles across the continent.",
  },
  {
    title: "Keeping value on the continent",
    body: "By prioritizing local suppliers and manufacturers, BABA projects retain spending, jobs and expertise within African economies.",
  },
];

function Impact() {
  return (
    <PageShell>
      <section className="baba-wash border-b border-baba-teal/10">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Measurable Change
          </span>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-tight text-baba-slate sm:text-5xl">
            BABA <span className="baba-rainbow">Impact</span> Across Africa
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-baba-slate/70">
            Every number represents a person skilled, a job created or a community
            strengthened. Here is the difference the movement is making, in real time.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {headline.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-baba-teal/10 bg-card p-6 text-center shadow-sm"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-baba-teal/10">
                <s.icon className="h-6 w-6 text-baba-teal" />
              </div>
              <div className="mt-4">
                <Counter target={s.target} label={s.label} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <h2 className="font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
          Stories Behind the Numbers
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {stories.map((s) => (
            <div
              key={s.title}
              className="baba-card-hover rounded-2xl border border-baba-teal/10 bg-card p-6"
            >
              <h3 className="font-display text-lg font-bold text-baba-slate">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-baba-slate/65">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
