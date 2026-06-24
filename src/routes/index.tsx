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
  Target,
  Eye,
  Heart,
  Lightbulb,
  Globe,
  Award,
  Calendar,
  BookOpen,
  Wrench,
  ShoppingBag,
  Building2,
  Leaf,
  TrendingUp,
  Star,
  Shield,
  Handshake,
  Landmark,
  DollarSign,
  Network,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Counter } from "@/components/Counter";
import { pillars } from "@/data/pillars";
import heroCollage from "@/assets/hero-collage.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Buy Africa Build Africa (BABA) | Connecting Local Talent to Continental Opportunity" },
      {
        name: "description",
        content:
          "A Pan-African platform connecting professionals, artisans, institutions, and opportunities to drive economic growth and sustainable development across Africa.",
      },
      { property: "og:title", content: "Buy Africa Build Africa (BABA)" },
      {
        property: "og:description",
        content: "Connecting local talent to continental opportunity — bridging the country to build one.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const coreValues = [
  {
    icon: Star,
    title: "African Excellence",
    body: "African talent, products, services, and innovations can compete globally when given the right opportunities and support.",
  },
  {
    icon: Shield,
    title: "Integrity",
    body: "We uphold transparency, accountability, professionalism, and ethical leadership in all that we do.",
  },
  {
    icon: Handshake,
    title: "Collaboration",
    body: "Africa's greatest achievements will be built through partnerships and collective action.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    body: "We embrace creativity, technology, and forward-thinking solutions that advance economic growth.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    body: "We promote solutions that create long-term economic, environmental, and social value.",
  },
  {
    icon: Heart,
    title: "Empowerment",
    body: "We create pathways that enable individuals, businesses, and communities to reach their full potential.",
  },
];

const empowerPoints = [
  {
    icon: Briefcase,
    title: "Youth Employment",
    body: "Job creation that links young people to skills, professionals, funding, and certification. Connecting talent to opportunity across the continent.",
  },
  {
    icon: GraduationCap,
    title: "Skills & Training",
    body: "Sponsoring artisans on tools, providing master classes, and building financial skills to help professionals grow their wealth.",
  },
  {
    icon: ShoppingBag,
    title: "Buy Local",
    body: "Building with local products to limit importation and keep value on the continent. Championing African-made solutions.",
  },
  {
    icon: Globe,
    title: "Exchange Programs",
    body: "Africans learn abroad and return home to build, sharing knowledge and skills across borders.",
  },
];

const challenges = [
  {
    icon: Landmark,
    title: "Government's Problem: Youth Unemployment",
    body: "Governments across Africa face massive youth unemployment. BABA solves this by using the built environment to connect people, train them on skills, provide funding pathways, and link them to real jobs in construction, manufacturing, and trades.",
  },
  {
    icon: DollarSign,
    title: "Youth's Problem: Access to Funding",
    body: "Young people have skills but no capital. BABA links them to financial institutions, government funding programmes, and investment vehicles — after training and vetting to ensure they are ready and viable.",
  },
  {
    icon: TrendingUp,
    title: "Professionals' Problem: Financial Stagnation",
    body: "Even skilled architects, engineers, and designers struggle — many are 'pencil millionaires' with no cash flow. BABA provides financial education, master classes on special skills, and platforms to connect with paying clients.",
  },
  {
    icon: Network,
    title: "Vendors & Suppliers' Problem: Visibility",
    body: "Suppliers and manufacturers need to showcase their products. BABA gives them an exposition platform — exhibitions and showcases where African-made products, climate-resilient materials, and local innovations get the visibility they deserve.",
  },
];

const institutePrograms = [
  {
    title: "Training Programs",
    body: "Hands-on technical training in construction, plumbing, electrical, welding, master classes, and more — led by industry experts. Not a school, but a research institution empowering through practical skills.",
    icon: Wrench,
  },
  {
    title: "Certification Programs",
    body: "Industry-recognized certifications that validate skills and open doors to better opportunities across the continent.",
    icon: Award,
  },
  {
    title: "Country Workshops",
    body: "Regional workshops delivered across African countries, bringing training directly to local communities in their own regions.",
    icon: Globe,
  },
  {
    title: "Industry Forums",
    body: "Platforms for professionals, policymakers, and industry leaders to share knowledge, research findings, and shape the future of the built environment.",
    icon: Building2,
  },
  {
    title: "Research & Mapping",
    body: "BABA Institute conducts research and mapping of problematic urban areas, studying how we can improve cities and communities through climate-resilient, sustainable development.",
    icon: Leaf,
  },
];

const boardMembers = [
  { role: "Chairperson", name: "Government Representative", desc: "Ministry of Housing & Urban Development" },
  { role: "Vice Chair — Professionals", name: "Senior Architect or Engineer", desc: "Representing the professional bodies (the majority)" },
  { role: "Programs Manager", name: "Programs Director", desc: "Oversees all BABA initiatives, operations, and training programmes" },
  { role: "Secretary", name: "Administrative Lead", desc: "Coordinates board activities, documentation, and stakeholder communication" },
  { role: "CEO — Manufacturing Partner", name: "Manufacturing Sector CEO", desc: "Representing the manufacturing and industrial sector" },
  { role: "Member — Finance & Investment", name: "Financial Institution Rep", desc: "Linking BABA to investment, funding, and banking partnerships" },
  { role: "Member — Youth & Grassroots", name: "Community Leader", desc: "Representing grassroots voices and youth across all regions" },
];

const countries = [
  { name: "Kenya", flag: "🇰🇪", regions: ["Nairobi", "Coast", "Rift Valley", "Western", "Central"] },
  { name: "Nigeria", flag: "🇳🇬", regions: ["Lagos", "North-Central", "South-East", "South-West", "North-West"] },
  { name: "South Africa", flag: "🇿🇦", regions: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Limpopo"] },
  { name: "Egypt", flag: "🇪🇬", regions: ["Cairo", "Alexandria", "Giza", "Delta", "Upper Egypt"] },
];

const annualEvents = [
  {
    icon: Award,
    title: "BABA Annual Awards",
    date: "Every December",
    description: "Recognizing the best in the built environment — best plumber, best electrician, best ICT professional, and architects (first runner, second runner, third runner) across multiple categories.",
  },
  {
    icon: Globe,
    title: "Word Conference & Expo",
    date: "Annual",
    description: "A continental gathering where engineers, architects, and innovators showcase African-made solutions. Products and innovations that don't require importation — built in Africa, for Africa.",
  },
  {
    icon: Building,
    title: "Corporate Strategy Meeting",
    date: "Annual (August)",
    description: "High-level strategy session bringing together board members, partners, and stakeholders to set the direction for the year ahead and review progress.",
  },
];

const regionalBlocks = [
  { name: "Western Region (Kisumu)", period: "January - February" },
  { name: "Coastal Region (Mombasa)", period: "March - April" },
  { name: "Mount Kenya Region", period: "May - June" },
  { name: "Rift Valley Region", period: "July - August" },
  { name: "Northern Region", period: "September - October" },
  { name: "Nairobi Region", period: "November - December" },
];

const impactStats = [
  { icon: Briefcase, value: "12,500+", label: "Jobs Created" },
  { icon: Users, value: "350+", label: "Trainings" },
  { icon: MapPin, value: "4", label: "Countries" },
  { icon: Building, value: "120+", label: "Projects" },
];

function Home() {
  return (
    <PageShell>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden baba-wash">
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full border-[12px] border-baba-blue/10" />
        <div className="absolute -bottom-10 -left-10 h-32 w-64 rounded-t-full border-[8px] border-baba-copper/10" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-baba-blue/20 bg-white px-4 py-1.5 text-sm font-semibold text-baba-blue shadow-sm">
              🌍 Building Africa, by Africans
            </span>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-baba-slate sm:text-6xl lg:text-7xl">
              Buy Africa
              <br />
              <span className="baba-rainbow">Build Africa</span>
            </h1>
            <p className="mt-6 font-display text-xl font-semibold text-baba-blue sm:text-2xl">
              Connecting Local Talent to Continental Opportunity
            </p>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-baba-slate/70">
              We are bridging the country to build one. BABA is a Pan-African platform
              bringing together everyone in the build industry — from the lowest artisan
              to the highest professional — to build Africa from within.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-full baba-btn-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-baba-blue/25 transition-colors hover:bg-baba-blue-dark"
              >
                Become a Member
              </Link>
              <Link
                to="/partners"
                className="rounded-full border-2 border-baba-blue px-6 py-3 text-sm font-semibold text-baba-blue transition-colors hover:bg-baba-blue hover:text-white"
              >
                Partner With Us
              </Link>
              <Link
                to="/register"
                className="rounded-full border-2 border-baba-copper px-6 py-3 text-sm font-semibold text-baba-copper-dark transition-colors hover:bg-baba-copper hover:text-baba-slate"
              >
                Join the BABA Institute
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-baba-blue/10 shadow-2xl shadow-baba-slate/10">
              <img
                src={heroCollage}
                alt="African artisans, engineers and professionals building modern industry"
                width={1280}
                height={960}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 hidden h-24 w-24 rounded-[1.5rem] border-4 border-baba-copper/50 sm:block" />
            <div className="absolute -top-4 -right-4 hidden h-16 w-16 rounded-full border-4 border-baba-blue/40 sm:block" />
          </div>
        </div>
      </section>

      {/* ═══ OUR STORY / MISSION ═══ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Our Story
          </span>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-baba-slate sm:text-5xl">
            Building Africa's Future Through People, Skills, Enterprise &amp; Sustainable Cities
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-baba-slate/70">
            Africa is the youngest continent in the world, with more than 60% of its population under the age of 35. Every day, thousands move into Africa's cities in search of opportunity. The question is no longer <em>what</em> Africa needs — it's <em>how</em> we move from conversation to implementation.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-baba-slate/70">
            <strong>BABA</strong> was established to bridge that gap. We are a Pan-African platform that brings together professionals, artisans, entrepreneurs, institutions, manufacturers, governments, and communities to collectively contribute to Africa's development through practical action, collaboration, innovation, and enterprise.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-baba-blue/10">
              <Target className="h-8 w-8 text-baba-blue" />
              <h3 className="mt-4 font-display text-xl font-bold text-baba-slate">Our Mission</h3>
              <p className="mt-3 text-baba-slate/70 leading-relaxed">
                To connect people, businesses, industries, institutions, and opportunities through platforms that promote entrepreneurship, skills development, innovation, investment, sustainability, and inclusive economic growth across Africa.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-baba-copper/20">
              <Eye className="h-8 w-8 text-baba-copper-dark" />
              <h3 className="mt-4 font-display text-xl font-bold text-baba-slate">Our Vision</h3>
              <p className="mt-3 text-baba-slate/70 leading-relaxed">
                To become Africa's leading ecosystem for enterprise development, industry collaboration, skills advancement, and sustainable urban transformation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CORE VALUES ═══ */}
      <section className="bg-baba-cream py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-bl-full border-[6px] border-baba-blue/8" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-tr-full border-[6px] border-baba-copper/8" />
        <div className="mx-auto max-w-7xl px-5 lg:px-8 relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
              Our DNA
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
              Core Values
            </h2>
            <p className="mt-3 text-baba-slate/70">
              The principles that guide everything we do.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-baba-blue/10 bg-white p-6 baba-card-hover"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-baba-blue/10">
                  <v.icon className="h-5 w-5 text-baba-blue" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">{v.title}</h3>
                <p className="mt-2 text-sm text-baba-slate/65">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THE CHALLENGES BABA SOLVES ═══ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            The Challenges
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
            The Problems We Solve
          </h2>
          <p className="mt-3 text-baba-slate/70">
            BABA's platform is built to solve real problems across Africa's built environment — for governments, youth, professionals, and businesses.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {challenges.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-baba-blue/10 bg-white p-6 baba-card-hover"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-baba-copper/10">
                <c.icon className="h-6 w-6 text-baba-copper-dark" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">{c.title}</h3>
              <p className="mt-2 text-sm text-baba-slate/65">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW WE EMPOWER ═══ */}
      <section className="bg-baba-cream py-20 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full border-[8px] border-baba-blue/8" />
        <div className="mx-auto max-w-7xl px-5 lg:px-8 relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
              Our Impact
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
              How We Empower
            </h2>
            <p className="mt-3 text-baba-slate/70">
              Four pillars of impact that drive Africa's development from within.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {empowerPoints.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-baba-blue/10 bg-white p-6 baba-card-hover"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-baba-blue/10">
                  <p.icon className="h-6 w-6 text-baba-blue" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">{p.title}</h3>
                <p className="mt-2 text-sm text-baba-slate/65">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BABA INSTITUTE ═══ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Capacity Building
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
            BABA Institute
          </h2>
          <p className="mt-3 text-baba-slate/70">
            Not a college — a research institution for training, master classes, research, and empowerment. We bring in experts to train people on equipment, tools, and skillsets that build Africa from within.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {institutePrograms.map((prog) => (
            <div
              key={prog.title}
              className="rounded-2xl border border-baba-blue/10 bg-white p-6 baba-card-hover"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-baba-copper/10">
                <prog.icon className="h-5 w-5 text-baba-copper-dark" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">{prog.title}</h3>
              <p className="mt-2 text-sm text-baba-slate/65">{prog.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full baba-btn-primary px-6 py-3 text-sm font-semibold text-white"
          >
            Join the BABA Institute <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══ MONTHLY REGIONAL ACTIVITIES ═══ */}
      <section className="bg-gradient-to-br from-baba-blue/5 via-baba-cream to-baba-cream py-20 relative overflow-hidden">
        <div className="absolute -right-10 top-10 h-24 w-24 rounded-full border-[6px] border-baba-copper/10" />
        <div className="mx-auto max-w-7xl px-5 lg:px-8 relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
              Grassroots Engagement
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
              Monthly Regional Activities
            </h2>
            <p className="mt-3 text-baba-slate/70">
              Every two months, BABA runs training and marketing activities in a different regional block. As each region builds its own cohorts, we expand across the continent.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {regionalBlocks.map((block) => (
              <div
                key={block.name}
                className="flex items-center gap-4 rounded-xl border border-baba-blue/10 bg-white p-5 baba-card-hover"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-baba-blue/10 text-lg font-bold text-baba-blue">
                  {block.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-baba-slate">{block.name}</h3>
                  <p className="text-xs font-semibold uppercase tracking-wide text-baba-copper-dark">
                    {block.period}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center text-sm text-baba-slate/60">
            <p>As each region grows its own cohorts and local leadership, BABA expands to the next region — and eventually across Africa.</p>
          </div>
        </div>
      </section>

      {/* ═══ ANNUAL FLAGSHIP EVENTS ═══ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Flagship Events
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
            Three Major Annual Activities
          </h2>
          <p className="mt-3 text-baba-slate/70">
            Every year, BABA delivers three major events that bring together the entire built environment community from across Africa.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {annualEvents.map((event) => (
            <div
              key={event.title}
              className="rounded-2xl border border-baba-blue/10 bg-white p-6 baba-card-hover"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-baba-copper/10">
                <event.icon className="h-6 w-6 text-baba-copper-dark" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">{event.title}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-baba-blue">
                {event.date}
              </p>
              <p className="mt-2 text-sm text-baba-slate/65">{event.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-baba-blue hover:text-baba-blue-dark"
          >
            View Full Event Details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══ ADVISORY BOARD ═══ */}
      <section className="bg-baba-cream py-20 relative overflow-hidden">
        <div className="absolute bottom-10 right-10 h-32 w-32 rounded-tl-full border-[6px] border-baba-blue/8" />
        <div className="mx-auto max-w-7xl px-5 lg:px-8 relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
              Leadership
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
              Advisory Board
            </h2>
            <p className="mt-3 text-baba-slate/70">
              Guiding BABA's vision with expertise across government, professional bodies, manufacturing, finance, and community.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {boardMembers.map((m) => (
              <div
                key={m.role}
                className="rounded-2xl border border-baba-blue/10 bg-white p-6 text-center baba-card-hover"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-baba-blue/10">
                  <Star className="h-6 w-6 text-baba-blue" />
                </div>
                <h3 className="mt-4 font-display text-sm font-bold uppercase tracking-wide text-baba-copper-dark">
                  {m.role}
                </h3>
                <p className="mt-1 font-display text-base font-bold text-baba-slate">{m.name}</p>
                <p className="mt-1 text-xs text-baba-slate/60">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OUR PRESENCE ═══ */}
      <section className="bg-baba-blue text-baba-cream py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-baba-copper">
              Footprint
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
              Our Presence
            </h2>
            <p className="mt-3 text-white/80">
              We are currently active across Africa, with plans to expand to every region of the continent. Map of Africa with location markers coming soon.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {countries.map((c) => (
              <div
                key={c.name}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 transition-transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{c.flag}</span>
                  <h3 className="font-display text-lg font-bold text-white">{c.name}</h3>
                </div>
                <ul className="mt-4 space-y-2">
                  {c.regions.map((r) => (
                    <li
                      key={r}
                      className="flex items-center gap-2 text-sm text-white/80"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-baba-copper" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ IMPACT DASHBOARD ═══ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-baba-blue/90 via-baba-blue/75 to-baba-blue/60 px-6 py-12 text-white lg:px-12">
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
          <div className="mt-10 grid gap-6 border-t border-white/20 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {impactStats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                  <s.icon className="h-5 w-5 text-baba-copper" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{s.value}</p>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/80">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PILLARS PREVIEW ═══ */}
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
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-baba-blue hover:text-baba-blue-dark"
          >
            View Full Strategy <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {pillars.map((p) => (
            <Link
              key={p.key}
              to="/pillars"
              className="baba-card-hover rounded-2xl border border-baba-blue/10 bg-white p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-baba-blue/10">
                <p.icon className="h-5 w-5 text-baba-blue" />
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
