import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Target,
  Eye,
  Heart,
  Star,
  Shield,
  Handshake,
  Lightbulb,
  Leaf,
  Users,
  Briefcase,
  GraduationCap,
  Globe,
  Building,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Learn about BABA's mission to connect local talent with continental opportunity across Africa's built environment.",
      },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

const coreValues = [
  {
    icon: Star,
    title: "African Excellence",
    body: "We believe African talent, products, services, and innovations can compete globally when given the right opportunities and support.",
  },
  {
    icon: Shield,
    title: "Integrity",
    body: "We uphold transparency, accountability, professionalism, and ethical leadership in all that we do.",
  },
  {
    icon: Handshake,
    title: "Collaboration",
    body: "Africa's greatest achievements will be built through partnerships and collective action across borders and industries.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    body: "We embrace creativity, technology, and forward-thinking solutions that advance economic growth and sustainable development.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    body: "We promote solutions that create long-term economic, environmental, and social value for communities across Africa.",
  },
  {
    icon: Heart,
    title: "Empowerment",
    body: "We create pathways that enable individuals, businesses, and communities to reach their full potential.",
  },
];

const whatWeDo = [
  {
    icon: Users,
    title: "Build Professional Networks",
    body: "We are building one of Africa's largest networks of professionals and practitioners within the built environment. Our network includes architects, engineers, quantity surveyors, interior designers, urban planners, project managers, contractors, developers, manufacturers, artisans, plumbers, carpenters, electricians, welders, painters, masons, fabricators, students, and emerging professionals.",
  },
  {
    icon: GraduationCap,
    title: "Skills Development",
    body: "Through the BABA Capacity Building Programme, we provide training programmes that strengthen technical competence, entrepreneurship, financial literacy, leadership, ethics, sustainability, and business growth. Our goal is to develop skilled, market-ready professionals capable of contributing meaningfully to Africa's growth.",
  },
  {
    icon: Briefcase,
    title: "Enterprise Development",
    body: "We support entrepreneurs, SMEs, artisans, manufacturers, and emerging businesses through business development support, mentorship, market access, strategic partnerships, growth acceleration, industry linkages, and visibility opportunities. Strong businesses create jobs, strengthen communities, and build nations.",
  },
  {
    icon: Globe,
    title: "Investment Facilitation",
    body: "BABA serves as a bridge between entrepreneurs, financial institutions, investors, governments, development partners, and industry stakeholders. Through these connections we help unlock opportunities for innovation, growth, enterprise development, and job creation.",
  },
  {
    icon: Building,
    title: "Sustainable Cities",
    body: "As African cities continue to expand, there is increasing need for resilient, inclusive, and sustainable urban development. BABA promotes green building, climate resilience, sustainable design, and eco-friendly construction practices across the continent.",
  },
];


const pillarDetails = [
  {
    key: "network",
    name: "Membership & Industry Network",
    tagline: "Connecting Africa's People, Skills and Opportunities",
    description: "The BABA Membership & Industry Network is the foundation of our ecosystem and serves as a platform for collaboration, visibility, professional growth, enterprise development, and industry engagement.",
    longDescription: "We bring together professionals, artisans, entrepreneurs, SMEs, manufacturers, suppliers, institutions, governments, development partners, investors, and communities into one interconnected network focused on building Africa's future.",
    focusTitle: "Who Can Join",
    focusAreas: [
      { title: "Professionals", detail: "Architects, Engineers, Quantity Surveyors, Interior Designers, Urban Planners, Project Managers, Contractors, Developers" },
      { title: "Business & Industry", detail: "Manufacturers, Suppliers, Entrepreneurs, SMEs" },
      { title: "Artisans & Trades", detail: "Plumbers, Electricians, Carpenters, Welders, Masons" },
      { title: "Institutions", detail: "Educational Institutions, Government Agencies, NGOs, Development Partners" },
    ],
  },
  {
    key: "capacity",
    name: "Capacity Building Hub",
    tagline: "Building Skills. Strengthening Enterprises. Empowering Communities.",
    description: "The BABA Capacity Building Hub focuses on developing the skills, knowledge, leadership, and entrepreneurial capabilities needed to drive Africa's growth.",
    longDescription: "Through strategic partnerships with governments, professional associations, manufacturers, educational institutions, financial institutions, and industry experts, BABA delivers practical and market-driven learning opportunities.",
    focusTitle: "Focus Areas",
    focusAreas: [
      { title: "Skills Development", detail: "Technical Skills, Digital Skills, Sustainability Education" },
      { title: "Enterprise Growth", detail: "Entrepreneurship Development, Business Growth, Financial Literacy" },
      { title: "Leadership", detail: "Leadership Development, Professional Development, Ethics & Professionalism" },
      { title: "Delivery Channels", detail: "Workshops, Online Learning, Masterclasses, Industry Forums, Mentorship, Certification" },
    ],
  },
  {
    key: "sustainability",
    name: "Sustainability & Green Building Initiative",
    tagline: "Building Resilient Cities and Communities for Future Generations",
    description: "The BABA Sustainability & Green Building Initiative promotes practical solutions that support climate resilience, environmental stewardship, sustainable construction, and healthier communities.",
    longDescription: "We work alongside governments, development partners, professional associations, researchers, manufacturers, and sustainability experts to advance implementation-focused initiatives that contribute to resilient cities and communities.",
    focusTitle: "Focus Areas",
    focusAreas: [
      { title: "Green Building", detail: "Sustainable construction practices, green materials, and eco-friendly design" },
      { title: "Climate Resilience", detail: "Climate-smart development and adaptation strategies" },
      { title: "Urban Development", detail: "Sustainable urban planning and community sustainability projects" },
      { title: "Resource Efficiency", detail: "Circular economy practices, environmental stewardship" },
    ],
  },
  {
    key: "events",
    name: "Events & Recognition Platform",
    tagline: "Connecting Ideas, Opportunities and Excellence",
    description: "The BABA Events & Recognition Platform serves as our annual engagement framework, bringing together leaders, professionals, businesses, institutions, and communities to collaborate, learn, showcase, and celebrate excellence.",
    longDescription: "Through our flagship events — the Corporate Strategy Summit (January), Expo & Conference (July-September), and Excellence Awards (December) — we create opportunities for visibility, partnerships, investment, networking, and industry advancement.",
    focusTitle: "Key Platforms",
    focusAreas: [
      { title: "Corporate Strategy Summit", detail: "January — Government leaders, investors, development partners, and industry executives" },
      { title: "Expo & Conference", detail: "July-September — Product exhibitions, industry showcases, business matching" },
      { title: "Excellence Awards", detail: "December — Professional, Artisan, Business, Sustainability, Youth, and Community categories" },
    ],
  },
  {
    key: "research",
    name: "Research, Innovation & Implementation Hub",
    tagline: "Turning Ideas Into Action",
    description: "The BABA Research, Innovation & Implementation Hub ensures that ideas, discussions, and recommendations translate into practical action and measurable impact.",
    longDescription: "Working with governments, universities, professional bodies, development agencies, industry stakeholders, and communities, the Hub identifies opportunities, challenges, and emerging trends affecting Africa's development.",
    focusTitle: "Focus Areas",
    focusAreas: [
      { title: "Urban Development", detail: "Sustainable Cities, Affordable Housing, Climate Resilience" },
      { title: "Economic Growth", detail: "Youth Employment, SME Growth, Industrial Development" },
      { title: "Innovation", detail: "Innovation Ecosystems, Community Development" },
      { title: "Key Outputs", detail: "Research Reports, Policy Papers, Pilot Projects, Innovation Challenges" },
    ],
  },
];

export function About() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-baba-blue via-baba-blue-dark to-baba-slate py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-baba-copper/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-baba-blue-light/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              About BABA
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              Building Africa's Future by African People
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              A Pan-African platform connecting people, industries, institutions, skills,
              innovation, and opportunities to drive economic growth and sustainable
              development across the continent.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-baba-cream to-transparent" />
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Our Story
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
            Why BABA Exists
          </h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-baba-slate/80">
            <p>
              Africa is the youngest continent in the world, with more than 60% of its
              population under the age of 35. Every day, hundreds of thousands of people
              move into Africa's cities in search of opportunity, livelihoods, education,
              and a better future. These rapidly growing urban populations are creating
              unprecedented demand for housing, infrastructure, services, innovation,
              employment, and sustainable development.
            </p>
            <p>
              At the same time, conversations about economic growth, climate resilience,
              entrepreneurship, youth empowerment, sustainable cities, and economic
              inclusion continue to take place across boardrooms, classrooms, conferences,
              and policy forums throughout Africa.
            </p>
            <p className="text-xl font-semibold text-baba-blue">
              The question is no longer what Africa needs.
              <br />
              The question is how we move from conversation to implementation.
            </p>
            <p>
              <strong>Buy Africa Build Africa (BABA)</strong> was established to help
              bridge that gap. We are a Pan-African platform that brings together
              professionals, artisans, entrepreneurs, institutions, manufacturers,
              governments, financial institutions, development partners, researchers,
              innovators, and communities to collectively contribute to Africa's
              development through practical action, collaboration, innovation, and
              enterprise.
            </p>
            <p>
              We believe Africa's greatest resource is not beneath its soil — it is its
              people. The future of Africa will be built by skilled professionals,
              empowered entrepreneurs, innovative businesses, responsible institutions, and
              connected communities working together to create sustainable opportunities
              for future generations.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Purpose */}
      <section className="bg-baba-cream py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-baba-blue/10 bg-white p-8 shadow-sm">
              <Target className="h-8 w-8 text-baba-blue" />
              <h3 className="mt-4 font-display text-xl font-bold text-baba-slate">Our Mission</h3>
              <p className="mt-3 leading-relaxed text-baba-slate/70">
                To connect people, businesses, industries, institutions, and opportunities
                through platforms that promote entrepreneurship, skills development,
                innovation, investment, sustainability, and inclusive economic growth
                across Africa.
              </p>
            </div>
            <div className="rounded-2xl border border-baba-copper/20 bg-white p-8 shadow-sm">
              <Eye className="h-8 w-8 text-baba-copper-dark" />
              <h3 className="mt-4 font-display text-xl font-bold text-baba-slate">Our Vision</h3>
              <p className="mt-3 leading-relaxed text-baba-slate/70">
                To become Africa's leading ecosystem for enterprise development, industry
                collaboration, skills advancement, and sustainable urban transformation.
              </p>
            </div>
            <div className="rounded-2xl border border-baba-slate/10 bg-baba-slate p-8 text-white shadow-sm">
              <Heart className="h-8 w-8 text-baba-copper" />
              <h3 className="mt-4 font-display text-xl font-bold">Our Purpose</h3>
              <p className="mt-3 leading-relaxed text-white/80">
                We believe sustainable development is achieved when people are empowered,
                industries are strengthened, and opportunities are accessible. Our purpose
                is to create platforms that connect talent, enterprise, capital,
                innovation, and partnerships to drive inclusive economic growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Our DNA
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
            Core Values
          </h2>
          <p className="mt-3 text-baba-slate/70">
            The principles that guide everything we do at BABA.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coreValues.map((v) => (
            <div
              key={v.title}
              className="baba-card-hover rounded-2xl border border-baba-blue/10 bg-white p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-baba-blue/10">
                <v.icon className="h-5 w-5 text-baba-blue" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">
                {v.title}
              </h3>
              <p className="mt-2 text-sm text-baba-slate/65">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What We Do */}
      <section className="bg-baba-cream py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
              Our Work
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
              What We Do
            </h2>
            <p className="mt-3 text-baba-slate/70">
              Through collaboration, skills development, enterprise support, and industry
              engagement, BABA is helping build stronger businesses, stronger industries,
              and stronger African economies.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whatWeDo.map((item, i) => (
              <div
                key={item.title}
                className="baba-card-hover rounded-2xl border border-baba-blue/10 bg-white p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-baba-blue/10">
                  <item.icon className="h-5 w-5 text-baba-blue" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-baba-slate/65">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-baba-blue to-baba-blue-dark px-8 py-16 text-center text-white lg:px-16">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Join the Movement
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Whether you're a professional, artisan, entrepreneur, institution, or
            partner — there's a place for you in the BABA ecosystem. Together, we are
            building Africa from within.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-baba-blue shadow-lg transition-colors hover:bg-baba-cream"
            >
              Become a Member
            </Link>
            <Link
              to="/partners"
              className="rounded-full border-2 border-white px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-baba-blue"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </section>
    
      {/* ═══ STRATEGIC PILLARS ═══ */}
      <section className="bg-baba-cream py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">Our Framework</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">Our Strategic Pillars</h2>
          <p className="mt-4 max-w-3xl text-baba-slate/70">Together, these five pillars form the BABA ecosystem — connecting people, building industries, and transforming Africa.</p>

          {pillarDetails.map((pillar, i) => (
            <div key={pillar.key} className="mt-10 rounded-2xl border border-baba-blue/10 bg-white p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-baba-blue to-baba-copper text-white text-lg font-bold">{i + 1}</div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-baba-slate">{pillar.name}</h3>
                  <p className="text-sm font-semibold text-baba-copper-dark">{pillar.tagline}</p>
                </div>
              </div>
              <p className="mt-4 text-baba-slate/80">{pillar.description}</p>
              <p className="mt-3 text-baba-slate/80">{pillar.longDescription}</p>

              <details className="group mt-5 rounded-lg border border-baba-blue/10">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-bold text-baba-blue list-none">
                  View Details <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="border-t border-baba-blue/10 px-4 py-4">
                  {pillar.focusAreas && (
                    <>
                      <p className="text-xs font-bold uppercase tracking-wide text-baba-copper-dark mb-3">{pillar.focusTitle || "Focus Areas"}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {pillar.focusAreas.map((fa) => (
                          <div key={fa.title} className="rounded-lg bg-baba-cream/50 p-3 border border-baba-blue/5">
                            <p className="text-sm font-bold text-baba-slate">{fa.title}</p>
                            <p className="text-xs text-baba-slate/65 mt-1">{fa.detail}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </details>
            </div>
          ))}
        </div>
      </section>

    </PageShell>
  );
}
