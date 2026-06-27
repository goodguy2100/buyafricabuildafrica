import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  BadgeCheck,
  Award,
  X,
  Phone,
  Mail,
  SlidersHorizontal,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "National Directory | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Search, filter and connect with verified construction artisans, technical professionals, contractors and suppliers across Africa.",
      },
    ],
    links: [{ rel: "canonical", href: "/directory" }],
  }),
  component: Directory,
});

type Category = "Workers" | "Professionals" | "Contractors" | "Suppliers" | "Partners & Institutions" | "Students & Emerging Professionals";
type Experience = "Entry" | "Intermediate" | "Expert";

interface Profile {
  id: number;
  name: string;
  initials: string;
  role: string;
  category: Category;
  location: string;
  years: number;
  experience: Experience;
  tags: string[];
  certified?: boolean;
  phone: string;
  email: string;
}

const profiles: Profile[] = [
  {
    id: 1,
    name: "John Mwangi",
    initials: "JM",
    role: "Worker · Master Tiler",
    category: "Workers",
    location: "Nairobi, Kenya",
    years: 12,
    experience: "Expert",
    tags: ["Ceramic Tiling", "Geometric Layouts"],
    phone: "+254 712 100 200",
    email: "john.mwangi@baba.africa",
  },
  {
    id: 2,
    name: "Sarah Ochieng",
    initials: "SO",
    role: "Principal Architect",
    category: "Professionals",
    location: "Kisumu, Kenya",
    years: 15,
    experience: "Expert",
    tags: ["Sustainable Design", "Urban Planning"],
    phone: "+254 733 220 110",
    email: "sarah.ochieng@baba.africa",
  },
  {
    id: 3,
    name: "Moussa Diop",
    initials: "MD",
    role: "Civil Subcontractor",
    category: "Contractors",
    location: "Kigali, Rwanda",
    years: 10,
    experience: "Expert",
    tags: ["Masonry", "Concrete Finishing"],
    phone: "+250 788 450 990",
    email: "moussa.diop@baba.africa",
  },
  {
    id: 4,
    name: "Amina Bello",
    initials: "AB",
    role: "Students & Emerging Professionals",
    category: "Students & Emerging Professionals",
    location: "Lagos, Nigeria",
    years: 2,
    experience: "Entry",
    tags: ["Solar PV", "Electrical Installation"],
    certified: true,
    phone: "+234 802 330 770",
    email: "amina.bello@baba.africa",
  },
  {
    id: 5,
    name: "Kenji Kamau",
    initials: "KK",
    role: "Supplier · Bamboo Solutions",
    category: "Suppliers",
    location: "Nakuru, Kenya",
    years: 8,
    experience: "Intermediate",
    tags: ["Bamboo Structures", "Sustainable Sourcing"],
    phone: "+254 720 880 440",
    email: "kenji.kamau@baba.africa",
  },
  {
    id: 6,
    name: "David Osei",
    initials: "DO",
    role: "Worker · Plumber",
    category: "Workers",
    location: "Accra, Ghana",
    years: 9,
    experience: "Intermediate",
    tags: ["Industrial Plumbing", "Maintenance"],
    phone: "+233 244 660 330",
    email: "david.osei@baba.africa",
  },
];

const categories: { name: Category; count: number }[] = [
  { name: "Professionals", count: 856 },
  { name: "Workers", count: 1240 },
  { name: "Contractors", count: 412 },
  { name: "Suppliers", count: 158 },
  { name: "Partners & Institutions", count: 80 },
  { name: "Students & Emerging Professionals", count: 2890 },
];

const experiences: Experience[] = ["Entry", "Intermediate", "Expert"];

function Directory() {
  const [query, setQuery] = useState("");
  const [selectedCats, setSelectedCats] = useState<Category[]>([]);
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [active, setActive] = useState<Profile | null>(null);

  const toggleCat = (c: Category) =>
    setSelectedCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      const matchesCat = selectedCats.length === 0 || selectedCats.includes(p.category);
      const matchesExp = !selectedExp || p.experience === selectedExp;
      const matchesVerified = !verifiedOnly || !p.certified;
      return matchesQuery && matchesCat && matchesExp && matchesVerified;
    });
  }, [query, selectedCats, selectedExp, verifiedOnly]);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="text-sm text-baba-slate/50">
          Home <span className="mx-1">›</span> National Directory
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-baba-blue sm:text-5xl">
          Directory &amp; professional Database{"\u00A0"}
        </h1>
        <p className="mt-4 max-w-2xl text-baba-slate/70">
          Search, filter, and connect with verified construction artisans, technical
          professionals, contractors, and suppliers across Africa.
        </p>

        {/* Search bar */}
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-baba-blue/10 bg-card p-3 shadow-sm sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 px-2">
            <Search className="h-5 w-5 text-baba-slate/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, skill, keyword…"
              className="w-full bg-transparent py-2 text-sm text-baba-slate placeholder:text-baba-slate/40 focus:outline-none"
            />
          </div>
          <div className="rounded-lg baba-btn-primary px-6 py-3 text-center text-sm font-semibold text-baba-cream">
            Find Professionals
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-7">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-baba-slate">
                  Categories
                </h2>
                <SlidersHorizontal className="h-4 w-4 text-baba-slate/40" />
              </div>
              <div className="mt-4 space-y-1">
                {categories.map((c) => {
                  const checked = selectedCats.includes(c.name);
                  return (
                    <label
                      key={c.name}
                      className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        checked ? "bg-baba-blue/10 text-baba-blue" : "hover:bg-secondary"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCat(c.name)}
                          className="h-4 w-4 accent-[oklch(0.49_0.073_197)]"
                        />
                        {c.name}
                      </span>
                      <span className="text-xs text-baba-slate/40">
                        {c.count.toLocaleString()}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="font-display text-base font-bold text-baba-slate">
                Experience Level
              </h2>
              <div className="mt-4 space-y-1">
                {experiences.map((e) => (
                  <label
                    key={e}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                  >
                    <input
                      type="radio"
                      name="experience"
                      checked={selectedExp === e}
                      onChange={() => setSelectedExp(e)}
                      className="h-4 w-4 accent-[oklch(0.49_0.073_197)]"
                    />
                    {e === "Entry"
                      ? "Entry (0–2 years)"
                      : e === "Intermediate"
                        ? "Intermediate (3–7 years)"
                        : "Expert (8+ years)"}
                  </label>
                ))}
                {selectedExp && (
                  <button
                    onClick={() => setSelectedExp(null)}
                    className="px-3 pt-1 text-xs font-semibold text-baba-copper-dark hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-baba-copper/30 bg-baba-copper/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-copper-dark">
                  Verified Only
                </span>
                <button
                  onClick={() => setVerifiedOnly((v) => !v)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    verifiedOnly ? "bg-baba-blue" : "bg-baba-slate/20"
                  }`}
                  aria-label="Toggle verified only"
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                      verifiedOnly ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <p className="mt-2 text-xs text-baba-slate/60">
                Show only profiles vetted through BABA's premium certification process.
              </p>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-baba-slate/60">
                Showing{" "}
                <span className="font-semibold text-baba-slate">{filtered.length}</span>{" "}
                Verified Professionals
              </p>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <article
                  key={p.id}
                  className="baba-card-hover flex flex-col rounded-2xl border border-baba-blue/10 bg-card p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-baba-blue/10 font-display text-sm font-bold text-baba-blue">
                      {p.initials}
                    </div>
                    {p.certified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-baba-copper/15 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-baba-copper-dark">
                        <Award className="h-3.5 w-3.5" /> Certified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-baba-blue/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-baba-blue">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">
                    {p.name}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wide text-baba-copper-dark">
                    {p.role}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-baba-slate/60">
                    <MapPin className="h-3.5 w-3.5" /> {p.location} · {p.years} Years Exp.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-secondary px-2.5 py-1 text-xs text-baba-slate/70"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-baba-blue/10 pt-4">
                    <button className="text-xs font-bold uppercase tracking-wide text-baba-copper-dark hover:underline">
                      View Portfolio
                    </button>
                    <button
                      onClick={() => setActive(p)}
                      className="rounded-lg baba-btn-primary px-4 py-2 text-xs font-semibold text-baba-cream transition-colors hover:bg-baba-blue-dark"
                    >
                      Request Contact
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mt-10 rounded-2xl border border-dashed border-baba-blue/20 p-12 text-center text-baba-slate/50">
                No professionals match your filters. Try adjusting your search.
              </div>
            )}
          </div>
        </div>

        {/* CTA banner */}
        <div className="mt-16 grid gap-6 rounded-3xl bg-baba-slate p-8 text-baba-cream lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
          <div>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
              Are you a professional, artisan, supplier, or institution?
            </h2>
            <p className="mt-3 max-w-xl text-sm text-baba-cream/70">
              Register your profile today to access exclusive opportunities, verify your
              skills, and connect with continental partners.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/register"
              className="rounded-lg baba-btn-primary px-6 py-3 text-sm font-semibold text-baba-cream transition-colors hover:bg-baba-blue-light"
            >
              Join Database
            </a>
            <a
              href="/about"
              className="rounded-lg border-2 border-baba-copper px-6 py-3 text-sm font-semibold text-baba-copper transition-colors hover:bg-baba-copper hover:text-baba-slate"
            >
              View Verification Process
            </a>
          </div>
        </div>
      </section>

      {/* Request contact modal */}
      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-baba-slate/60 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-baba-blue/10 font-display text-sm font-bold text-baba-blue">
                  {active.initials}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-baba-slate">
                    {active.name}
                  </h3>
                  <p className="text-xs text-baba-slate/60">{active.role}</p>
                </div>
              </div>
              <button
                onClick={() => setActive(null)}
                className="rounded-lg p-1 text-baba-slate/50 hover:bg-secondary"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 rounded-xl bg-secondary p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-baba-copper-dark">
                Secure Contact Details
              </p>
              <a
                href={`tel:${active.phone}`}
                className="mt-3 flex items-center gap-2.5 text-sm font-semibold text-baba-slate"
              >
                <Phone className="h-4 w-4 text-baba-blue" /> {active.phone}
              </a>
              <a
                href={`mailto:${active.email}`}
                className="mt-2 flex items-center gap-2.5 text-sm font-semibold text-baba-slate"
              >
                <Mail className="h-4 w-4 text-baba-blue" /> {active.email}
              </a>
            </div>
            <p className="mt-4 text-xs text-baba-slate/50">
              These details are shared via BABA's verified network. Please mention BABA
              when reaching out.
            </p>
          </div>
        </div>
      )}
    </PageShell>
  );
}
