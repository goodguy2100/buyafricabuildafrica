import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, Heart, Globe2, Factory, TrendingDown, Users, Briefcase, Award } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BABA | Buy Africa Build Africa" },
      {
        name: "description",
        content:
          "Why BABA exists: ending raw-material dependency and building Africa's industrial future through youth employment, skills, local value addition and partnership.",
      },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

const values = [
  { icon: Target, title: "Mission", body: "To industrialize Africa by empowering youth employment through job creation, connecting verified local talent with continental demand, and championing locally-made value." },
  { icon: Eye, title: "Vision", body: "A self-reliant, industrially competitive Africa where skills, manufacturing and trade keep wealth on the continent, with thriving youth-led enterprises." },
  { icon: Heart, title: "Core Values", body: "Integrity, craftsmanship, sustainability, inclusion and unapologetic pride in African capability." },
];

const context = [
  { icon: Users, title: "Youth Unemployment Crisis", body: "Over 1 billion Africans are under 35 years old, yet urbanization is happening rapidly without proportional job creation. Our youth face unprecedented joblessness." },
  { icon: TrendingDown, title: "Raw Material Export Trap", body: "Africa exports raw minerals and crops cheaply, then re-imports finished goods at a premium — exporting jobs along with them." },
  { icon: Factory, title: "Under-Industrialization", body: "Limited local manufacturing means value addition happens elsewhere, weakening currencies and stalling job creation." },
  { icon: Globe2, title: "Fragmented Markets", body: "Disconnected national markets prevent economies of scale that intra-African trade could unlock." },
];

const initiatives = [
  { icon: Briefcase, title: "Youth Employment & Skills", body: "Link youth with job creation opportunities, professional mentors, and skills training to build sustainable careers." },
  { icon: Award, title: "Local Production & Learning", body: "Encourage youth to build using local products, reduce importation, and create exchange programs for Africans to learn globally and return to build locally." },
  { icon: Globe2, title: "Funding & Support", body: "Secure governmental and institutional funding across the globe to sponsor training programs, tool access, financial literacy, and artisan development." },
];

function About() {
  return (
    <PageShell>
      <section className="border-b border-baba-teal/10 bg-baba-teal/5">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Our Story
          </span>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-tight text-baba-slate sm:text-5xl">
            Building Africa from within
          </h1>
          <p className="mt-4 max-w-2xl text-baba-slate/70">
            Buy Africa Build Africa (BABA) is a continental initiative mobilizing skilled
            people, local industry and institutional partners to transform how Africa
            builds, trades and prospers — with a focus on empowering youth employment and
            economic independence.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-baba-slate">
              What BABA Is
            </h2>
            <p className="mt-4 text-baba-slate/70">
              BABA is a verified ecosystem and digital institution that empowers youth employment by linking artisans, professionals, contractors, youth and suppliers with the projects, training, certification and capital they need — while championing African-made products and services.
            </p>
            <h2 className="mt-10 font-display text-3xl font-extrabold text-baba-slate">
              Why It Was Created
            </h2>
            <p className="mt-4 text-baba-slate/70">
              For too long, Africa's growth has been constrained by exporting raw materials and importing finished goods, while over 1 billion youth remain unemployed. BABA exists to close that loop — keeping skills, manufacturing, wealth and employment opportunities on the continent. We're committed to creating pathways for youth to learn, build, and prosper using local resources and global partnerships.
            </p>
          </div>
          <div className="space-y-5">
            {context.map((c) => (
              <div
                key={c.title}
                className="flex gap-4 rounded-2xl border border-baba-teal/10 bg-card p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-baba-copper/15">
                  <c.icon className="h-5 w-5 text-baba-copper-dark" />
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
      </section>

      <section className="bg-baba-teal/5 py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="mb-10 font-display text-3xl font-extrabold text-baba-slate">
            Our Mission & Values
          </h2>
          <div className="grid gap-5 lg:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-baba-teal/10 bg-card p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-baba-teal/10">
                  <v.icon className="h-6 w-6 text-baba-teal" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-baba-slate">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm text-baba-slate/70">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h2 className="mb-10 font-display text-3xl font-extrabold text-baba-slate">
          How We Empower Youth
        </h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {initiatives.map((init) => (
            <div
              key={init.title}
              className="rounded-2xl border border-baba-teal/10 bg-card p-7"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-baba-copper/15">
                <init.icon className="h-6 w-6 text-baba-copper-dark" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-baba-slate">
                {init.title}
              </h3>
              <p className="mt-2 text-sm text-baba-slate/70">{init.body}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
