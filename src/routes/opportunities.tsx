import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Award, Search, ArrowRight, BookOpen, Star, Users, Wrench } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities | Buy Africa Build Africa (BABA)" },
      { name: "description", content: "Upcoming trainings, masterclasses, awards, and professional connections through the BABA network." },
    ],
    links: [{ rel: "canonical", href: "/opportunities" }],
  }),
  component: Opportunities,
});

const upcomingTrainings = [
  { title: "Advanced Masonry Masterclass", date: "August 2026", mode: "Online + Nairobi", cert: "Certificate" },
  { title: "Construction Project Management", date: "September 2026", mode: "Online", cert: "Diploma" },
  { title: "Interior Design Fundamentals", date: "October 2026", mode: "Online + Mombasa", cert: "Certificate" },
  { title: "Financial Literacy for SMEs", date: "November 2026", mode: "Online", cert: "Certificate" },
];

function Opportunities() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="border-b border-baba-blue/10 bg-gradient-to-br from-baba-blue/5 via-baba-cream to-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">Grow With Us</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-baba-slate sm:text-5xl">Opportunities</h1>
          <p className="mt-4 max-w-2xl text-baba-slate/70">Trainings, masterclasses, awards, and professional connections to help you grow.</p>
        </div>
      </section>

      {/* Upcoming Trainings & Masterclasses */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-baba-blue" />
          <h2 className="font-display text-2xl font-bold text-baba-slate">Upcoming Trainings & Masterclasses</h2>
        </div>
        <p className="mt-2 text-sm text-baba-slate/60">Training sessions run every other month. Sign up for the next available session.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {upcomingTrainings.map((t) => (
            <div key={t.title} className="rounded-2xl border border-baba-blue/10 bg-white p-6 baba-card-hover flex flex-col">
              <span className="inline-flex w-fit rounded-full bg-baba-copper/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-baba-copper-dark">Training</span>
              <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">{t.title}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-baba-slate/60"><Calendar className="h-3.5 w-3.5 text-baba-copper" /> {t.date}</p>
              <p className="flex items-center gap-1.5 text-sm text-baba-slate/60">{t.mode}</p>
              <p className="mt-2 text-xs font-semibold text-baba-blue">{t.cert}</p>
              <Link to="/register" className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-baba-copper-dark hover:underline pt-4">
                Sign Up <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Win an Award */}
      <section className="bg-gradient-to-br from-baba-blue/5 to-baba-cream py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="rounded-2xl border border-baba-copper/20 bg-white p-8 md:p-12">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-baba-copper to-baba-copper-dark">
                <Award className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-baba-slate">Win an Award</h2>
                <p className="mt-2 text-baba-slate/70">The BABA Excellence Awards recognize outstanding individuals, organizations, projects, and initiatives contributing to Africa's development. Categories include Professional Excellence, Artisan Excellence, Business Excellence, Sustainability Leadership, Innovation, Youth Achievement, and Community Impact.</p>
                <Link to="/events" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-baba-copper to-baba-copper-dark px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all">
                  View Award Categories <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find & Connect */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="flex items-center gap-3">
          <Search className="h-6 w-6 text-baba-blue" />
          <h2 className="font-display text-2xl font-bold text-baba-slate">Find & Connect</h2>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, title: "Find a Professional", desc: "Connect with architects, engineers, designers and consultants across Africa." },
            { icon: Wrench, title: "Find an Artisan", desc: "Locate skilled plumbers, electricians, carpenters, welders and masons near you." },
            { icon: Star, title: "Find a Supplier", desc: "Discover verified manufacturers and suppliers for your projects." },
            { icon: BookOpen, title: "Improve Your Skill", desc: "Enrol in training programmes and masterclasses to advance your career." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-baba-blue/10 bg-white p-6 baba-card-hover text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-baba-blue/10">
                <item.icon className="h-6 w-6 text-baba-blue" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">{item.title}</h3>
              <p className="mt-2 text-sm text-baba-slate/65">{item.desc}</p>
              <Link to="/register" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-baba-copper-dark hover:underline">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
