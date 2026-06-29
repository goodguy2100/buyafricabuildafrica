import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Users,
  MapPin,
  Building,
  Target,
  Eye,
  Heart,
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
  Handshake,
  Lightbulb,
  GraduationCap,
  Network,
  Shield,
  Zap,
  Search,
  DollarSign,
  PenTool,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Counter } from "@/components/Counter";
import { pillars } from "@/data/pillars";
import heroCollage from "@/assets/hero-collage.jpg";

import kenyaPulse from "@/assets/kenya-pulse.mp4.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Buy Africa Build Africa (BABA) | Building Africa's Future by Africans" },
      {
        name: "description",
        content:
          "A Pan-African platform connecting people, industries, institutions, skills, innovation, and opportunities to drive economic growth and sustainable development across Africa.",
      },
      { property: "og:title", content: "Buy Africa Build Africa (BABA)" },
      { property: "og:description", content: "Building Africa's Future by Africans." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const howBabaWorks = [
  { title: "CONNECT", body: "We build networks of professionals, artisans, entrepreneurs, institutions, manufacturers, suppliers, and development partners across Africa." },
  { title: "TRAIN", body: "Through the BABA capacity building programmes, we provide technical skills, entrepreneurship training, financial literacy, leadership development, and sustainability education." },
  { title: "SHOWCASE", body: "Through the BABA Expo & Conference, members gain visibility for their products, services, projects, and innovations." },
  { title: "RECOGNIZE", body: "Through the BABA Excellence Awards, we celebrate individuals and organizations creating impact across Africa." },
  { title: "RESEARCH & IMPLEMENT", body: "Through the Research & Innovation Hub, we transform ideas, research, and policy discussions into practical solutions." },
];

const strategicPillars = [
  { key: "network", name: "BABA Membership & Industry Network", tagline: "Connecting Africa's People, Skills and Opportunities", grad: "from-baba-blue to-baba-blue-light" },
  { key: "capacity", name: "BABA Capacity Building Hub", tagline: "Building Skills. Strengthening Enterprises. Empowering Communities.", grad: "from-baba-blue-light to-brand-green" },
  { key: "sustainability", name: "BABA Sustainability & Green Building Initiative", tagline: "Building Resilient Cities and Communities for Future Generations", grad: "from-brand-green to-baba-blue-light" },
  { key: "events", name: "BABA Events & Recognition Platform", tagline: "Connecting Ideas, Opportunities and Excellence", grad: "from-baba-blue-light to-baba-copper" },
  { key: "research", name: "BABA Research, Innovation & Implementation Hub", tagline: "Turning Ideas Into Action", grad: "from-baba-copper to-baba-blue" },
];


const whoWeServe = [
  {
    group: "Individuals & Professionals",
    items: [
      "Architects", "Engineers", "Quantity Surveyors", "Interior Designers",
      "Urban Planners", "Project Managers", "Contractors", "Plumbers",
      "Electricians", "Carpenters", "Welders", "Artisans", "Entrepreneurs", "Youth",
    ],
  },
  {
    group: "Government Institutions",
    items: ["Government Agencies", "Public Institutions", "NGOs", "Development Partners"],
  },
  {
    group: "Private Sector",
    items: ["Manufacturers", "Suppliers", "SMEs", "Financial Institutions", "Investors"],
  },
  {
    group: "Universities",
    items: ["Educational Institutions", "Students", "Researchers"],
  },
];

const ecosystemGroups = [
  {
    group: "Professionals",
    roles: "Architects, Engineers, Quantity Surveyors, Interior Designers, Urban Planners, Project Managers, Contractors and Consultants.",
    benefits: ["Visibility", "Networking", "Business Opportunities", "Professional Development", "Industry Recognition"],
  },
  {
    group: "Artisans",
    roles: "Plumbers, Electricians, Carpenters, Welders, Painters, Masons and Fabricators.",
    benefits: ["Training", "Certification", "Market Access", "Mentorship", "Employment Opportunities"],
  },
  {
    group: "Built Environment Entrepreneurs & SMEs",
    roles: "",
    benefits: ["Business Development Support", "Investment Readiness", "Market Access", "Growth Opportunities", "Strategic Partnerships"],
  },
  {
    group: "Manufacturers & Suppliers",
    roles: "",
    benefits: ["Product Visibility", "Access to Professionals", "Market Expansion", "Expo Participation", "Industry Partnerships"],
  },
  {
    group: "NGOs & Development Partners",
    roles: "",
    benefits: ["Community Reach", "Programme Implementation", "Research Collaboration", "Impact Delivery", "Capacity Building"],
  },
  {
    group: "Governments & Public Institutions",
    roles: "",
    benefits: ["Youth Empowerment", "Skills Development", "Enterprise Growth", "Industry Engagement", "Sustainable Development"],
  },
];

const kenyaRegions = [
  { name: "Nairobi", icon: "🏙️", note: "Headquarters & national hub" },
  { name: "Central", icon: "⛰️", note: "Highlands enterprise network" },
  { name: "Rift Valley", icon: "🌾", note: "Agri-industry & artisans" },
  { name: "Western", icon: "🌿", note: "Community skills programmes" },
  { name: "Coast", icon: "🌊", note: "Coastal trade & tourism" },
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
      <section className="relative overflow-hidden baba-wash py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-baba-blue/20 bg-white px-4 py-1.5 text-sm font-semibold text-baba-blue shadow-sm">
              🌍 Building Africa, by Africans
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-baba-slate sm:text-6xl lg:text-7xl">
              Buy Africa
              <br />
              <span className="baba-rainbow">Build Africa</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm font-semibold text-baba-copper-dark">
              We believe Africa's greatest resource is not beneath its soil. It is its people.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="rounded-full baba-cta px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-baba-blue/25">
                Become a Member
              </Link>
              <Link to="/partners" className="rounded-full border-2 border-baba-blue px-6 py-3 text-sm font-semibold text-baba-blue transition-colors hover:bg-baba-blue hover:text-white">
                Partner With Us
              </Link>
              <Link to="/register" className="rounded-full border-2 border-baba-copper px-6 py-3 text-sm font-semibold text-baba-copper-dark transition-colors hover:bg-baba-copper hover:text-baba-slate">
                Join the BABA Capacity Building Programme
              </Link>
              <Link to="/events" className="baba-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold">
                <Calendar className="h-4 w-4" /> Attend BABA Events
              </Link>
            </div>

            <div className="mx-auto mt-14 max-w-4xl rounded-3xl border border-baba-blue/10 bg-white/70 p-6 shadow-xl shadow-baba-blue/10 backdrop-blur sm:p-8">
              <div className="flex flex-col items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-baba-blue/20 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-widest text-baba-blue shadow-sm backdrop-blur">
                  🎯 Our Impact Targets
                </span>
                <p className="text-xs text-baba-slate/60">Where we're headed as we grow — goals, not yet achieved.</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
                <Counter target={10000} label="Members Target" suffix="+" tone="dark" />
                <Counter target={800} label="Jobs Target" suffix="+" tone="dark" />
                <Counter target={1200} label="Trainings Target" suffix="+" tone="dark" />
                <Counter target={5} label="Regions" tone="dark" />
              </div>
            </div>

            <p className="mx-auto mt-12 max-w-3xl font-display text-xl font-semibold text-baba-blue sm:text-2xl">
              Building Africa's Future by Africans
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-baba-slate/70">
              Africa's future should not only be discussed. It should be built. BABA is a Pan-African platform
              connecting people, industries, institutions, skills, innovation, and opportunities to drive economic
              growth, sustainable development, thriving enterprises, and resilient communities across Africa.
            </p>
          </div>

        </div>
      </section>

      {/* ═══ OUR STORY ═══ */}
      <section className="relative overflow-hidden baba-wash py-20">
        <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-baba-copper/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-baba-blue/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-baba-blue/10 bg-white/70 p-8 shadow-xl shadow-baba-blue/10 backdrop-blur sm:p-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-baba-copper/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">📖 Our Story</span>
            <h2 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
              <span className="baba-rainbow">Building Africa's Future by Africans</span>
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-baba-slate/80">
              <p>
                <span className="font-bold text-baba-blue">Africa is the youngest continent</span> in the world, with more than <span className="font-bold text-baba-copper-dark">60%</span> of its population under the age of 35.
                Every day, more than <span className="font-bold text-baba-copper-dark">200,000 people</span> move into Africa's cities in search of opportunity, livelihoods,
                education, and a better future.
              </p>
              <p>
                These rapidly growing urban populations are shaping the future of the continent and creating unprecedented demand for housing, infrastructure, services, innovation, employment, and sustainable development.
              </p>
              <p>
                At the same time, conversations about economic growth, climate resilience, entrepreneurship, youth empowerment, sustainable cities, and industrial development continue to take place across boardrooms, classrooms, conferences, policy forums, and development institutions throughout Africa.
              </p>
              <p className="rounded-2xl bg-gradient-to-r from-baba-blue/10 via-baba-copper/10 to-baba-blue/10 px-6 py-4 text-xl font-semibold text-baba-blue">
                The question is no longer what Africa needs. The question is how we move from conversation to implementation.
              </p>
              <p>
                <strong className="baba-rainbow font-extrabold">Buy Africa Build Africa (BABA)</strong> was established to help bridge that gap. Because Africa's future should not only be discussed. It should be built.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ═══ OPERATING ACROSS THE CONTINENT ═══ */}
      <section className="bg-gradient-to-br from-baba-blue/5 via-baba-cream to-brand-yellow/10 py-20">
        <div className="mx-auto max-w-3xl px-5 text-center lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">Our Reach</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
            Built for <span className="bg-gradient-to-r from-baba-blue via-brand-green to-baba-copper bg-clip-text text-transparent">All of Africa</span>
          </h2>
          <p className="mt-4 text-baba-slate/70">
            BABA is designed to operate across the African continent — connecting people, skills, industries and opportunities from one region to the next. We are rooted in Kenya today, and building the networks, partnerships and platforms to grow across Africa.
          </p>
          <p className="mt-3 text-baba-slate/70">
            From professionals and artisans to manufacturers, institutions and governments, our ecosystem is built to scale wherever African development is happening.
          </p>
        </div>
      </section>


      {/* ═══ HOW BABA WORKS ═══ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">Our Process</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">How BABA Works</h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {howBabaWorks.map((step, i) => (
            <div key={step.title} className="baba-pop-card baba-float overflow-hidden rounded-2xl p-6 text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-baba-blue to-baba-copper text-sm font-extrabold text-white shadow">
                {i + 1}
              </div>
              <h3 className="mt-4 font-display text-base font-extrabold text-baba-slate">{step.title}</h3>
              <p className="mt-2 text-xs text-baba-slate/65">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ STRATEGIC PILLARS — the main agenda ═══ */}
      <section className="relative overflow-hidden bg-baba-slate py-24">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-baba-blue/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-baba-copper/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-yellow">The Main Agenda</span>
            <h2 className="mt-2 font-display text-4xl font-extrabold text-white sm:text-5xl">
              Our <span className="bg-gradient-to-r from-baba-blue-light via-brand-yellow to-baba-copper bg-clip-text text-transparent">Strategic Pillars</span>
            </h2>
            <p className="mt-3 text-white/70">Five interconnected pillars driving Africa's development — connecting people, building industries, transforming the continent.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {strategicPillars.map((pillar, i) => (
              <Link
                key={pillar.name}
                to="/pillars"
                className={`group relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${pillar.grad} p-6 text-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl`}
              >
                <span className="font-display text-5xl font-black text-white/25">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-lg font-extrabold leading-tight">{pillar.name}</h3>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-white/90 transition-transform group-hover:translate-x-1">
                  Explore pillar <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHO WE SERVE ═══ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">Our Community</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">Who We Serve</h2>
        </div>
        <div className="mt-12 space-y-10">
          {whoWeServe.map((cat) => (
            <div key={cat.group}>
              <h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-baba-copper-dark">
                {cat.group}
              </h3>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {cat.items.map((item) => (
                  <span key={item} className="rounded-full border border-baba-blue/20 bg-white px-5 py-2.5 text-sm font-medium text-baba-slate shadow-sm transition-colors hover:border-baba-blue/40 hover:text-baba-blue">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ JOIN THE BABA ECOSYSTEM ═══ */}
      <section className="bg-gradient-to-br from-baba-blue/5 via-baba-cream to-baba-cream py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">Get Involved</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">Join the BABA Ecosystem</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ecosystemGroups.map((g) => (
              <Link
                key={g.group}
                to="/register"
                className="baba-pop-card flex items-center justify-between gap-3 rounded-2xl p-6"
              >
                <h3 className="font-display text-lg font-extrabold text-baba-slate">{g.group}</h3>
                <ArrowRight className="h-5 w-5 shrink-0 text-baba-copper-dark" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PARTNER WITH US ═══ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-baba-blue to-baba-blue-dark px-8 py-16 text-center text-white lg:px-16">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Partner With Us</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            BABA welcomes partnerships with organizations committed to enterprise development, skills advancement, sustainability, innovation, and economic transformation across Africa.
          </p>
          <Link to="/partners" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-baba-blue shadow-lg transition-colors hover:bg-baba-cream">
            Become a Partner <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══ OUR IMPACT VISION ═══ */}
      <section className="bg-baba-cream py-20">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">Our Belief</span>
          <div className="mt-8 space-y-4 text-xl font-display font-semibold text-baba-slate/80 sm:text-2xl">
            <p>Skills lead to opportunity.</p>
            <p>Opportunity leads to enterprise.</p>
            <p>Enterprise leads to employment.</p>
            <p>Employment leads to prosperity.</p>
            <p>Prosperity leads to stronger communities.</p>
            <p className="text-baba-blue">Stronger communities build stronger nations.</p>
          </div>
        </div>
      </section>

      {/* ═══ OUR PRESENCE ═══ */}
      <section className="bg-baba-blue py-20 text-baba-cream">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-baba-copper">
              🇰🇪 Footprint
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Our Presence in Kenya</h2>
            <p className="mt-3 text-white/80">
              We are currently active across Kenya, building our network region by region — with plans to expand
              across Africa.
            </p>
          </div>

          <div className="mt-12">
            {/* Animated Kenya map video */}
            <div className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl">
              <video
                src={kenyaPulse.url}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-contain"
              />
            </div>
          </div>


        </div>
      </section>


      {/* ═══ EVENTS PREVIEW ═══ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">Events</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">Our Annual Events</h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-baba-blue/10 bg-white p-6 baba-card-hover">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-baba-blue/10">
              <Building className="h-6 w-6 text-baba-blue" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">Corporate Strategy Summit</h3>
            <p className="mt-1 text-sm font-semibold text-baba-copper-dark">Every January</p>
            <p className="mt-2 text-sm text-baba-slate/65">High-level platform for governments, investors, development partners, banks, corporates, and industry leaders.</p>
          </div>
          <div className="rounded-2xl border border-baba-blue/10 bg-white p-6 baba-card-hover">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-baba-copper/10">
              <Globe className="h-6 w-6 text-baba-copper-dark" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">Expo & Conference</h3>
            <p className="mt-1 text-sm font-semibold text-baba-copper-dark">Every July / August</p>
            <p className="mt-2 text-sm text-baba-slate/65">Africa's marketplace of ideas, products and opportunities. Product exhibitions, supplier showcases, keynotes, and industry panels.</p>
          </div>
          <div className="rounded-2xl border border-baba-blue/10 bg-white p-6 baba-card-hover">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-baba-blue/10">
              <Award className="h-6 w-6 text-baba-blue" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">Excellence Awards</h3>
            <p className="mt-1 text-sm font-semibold text-baba-copper-dark">Every December</p>
            <p className="mt-2 text-sm text-baba-slate/65">Celebrating those building Africa — professionals, artisans, businesses, sustainability champions, and youth.</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-baba-blue hover:text-baba-blue-dark">
            View All Events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══ FINAL CALL TO ACTION ═══ */}
      <section className="bg-baba-slate py-20 text-baba-cream">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <p className="text-lg leading-relaxed text-white/80">
            Africa's future cannot be built by one institution. It cannot be built by one government.
            It cannot be built by one generation. It will be built through collaboration.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-white/80">
            Together, we can build stronger industries, stronger communities, stronger economies, and stronger African nations.
          </p>
          <h2 className="mt-10 font-display text-3xl font-extrabold sm:text-4xl">BUY AFRICA. BUILD AFRICA. EMPOWER AFRICA.</h2>
          <p className="mt-4 text-lg text-baba-copper">Connecting People. Building Industries. Transforming Africa.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-baba-blue shadow-lg transition-colors hover:bg-baba-cream">
              Become a Member
            </Link>
            <Link to="/partners" className="rounded-full border-2 border-white px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-baba-blue">
              Partner With Us
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ IMPACT DASHBOARD ═══ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-baba-blue/90 via-baba-blue/75 to-baba-blue/60 px-6 py-12 text-white lg:px-12">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-baba-copper">Our Growth Targets</p>
          <h2 className="mt-2 text-center font-display text-2xl font-extrabold sm:text-3xl">Scaling Modern African Industry</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-white/70">The numbers we're working towards as the BABA ecosystem grows.</p>
          <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
            <Counter target={50000} label="Members" suffix="+" />
            <Counter target={30000} label="Artisans" suffix="+" />
            <Counter target={9000} label="Professionals" suffix="+" />
            <Counter target={3500} label="Contractors" suffix="+" />
            <Counter target={1000} label="Suppliers" suffix="+" />
            <Counter target={100} label="Partners" suffix="+" />
          </div>
          <div className="mt-10 grid gap-6 border-t border-white/20 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {impactStats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                  <s.icon className="h-5 w-5 text-baba-copper" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{s.value}</p>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/80">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </PageShell>
  );
}
