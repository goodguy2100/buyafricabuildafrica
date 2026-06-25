import { createFileRoute } from "@tanstack/react-router";
import { 
  Wrench, 
  ShoppingBag, 
  Building2, 
  Leaf, 
  TrendingUp, 
  CheckCircle2, 
  Target, 
  Users, 
  Globe, 
  Zap,
  ArrowRight
} from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/pillars")({
  head: () => ({
    meta: [
      { title: "The Five Strategic Pillars | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Explore the five strategic pillars of BABA: Skills Africa, Buy Africa, Build Africa, Green Africa, and Prosper Africa. Our roadmap for a self-reliant continent.",
      },
    ],
    links: [{ rel: "canonical", href: "/pillars" }],
  }),
  component: PillarsPage,
});

const pillarDetails = [
  {
    key: "skills",
    name: "Skills Africa",
    icon: Wrench,
    tagline: "Empowering the Youth & Workforce",
    description: "Skills Africa is dedicated to bridging the technical skills gap by empowering the youth and experienced workers through specialized, technically certified training. We believe that a highly skilled workforce is the foundation of industrial growth.",
    longDescription: "Our approach focuses on transforming the African labor market from one of raw potential to one of certified expertise. By partnering with Technical and Vocational Education and Training (TVET) institutions, we ensure that training is aligned with modern industrial needs. We don't just provide classroom learning; we facilitate hands-on apprenticeships and attachments that turn theory into practice.",
    focusAreas: [
      { title: "Technically Certified Trades", detail: "Standardizing certifications for masons, electricians, plumbers, and welders to meet international standards." },
      { title: "TVET Partnerships", detail: "Collaborating with vocational colleges to modernize curriculum and provide industry-relevant equipment." },
      { title: "Apprenticeships & Attachments", detail: "Connecting students with real-world projects to gain practical experience and mentorship." },
      { title: "Continuous Upskilling", detail: "Providing masterclasses and refresher courses for seasoned professionals to stay ahead of technology." }
    ],
    impact: "Creating a future-ready workforce that drives efficiency and innovation in the built environment."
  },
  {
    key: "buy",
    name: "Buy Africa",
    icon: ShoppingBag,
    tagline: "Prioritizing Local Value Chains",
    description: "Buy Africa fosters intra-continental trade and supports home-grown brands and products. We aim to keep African wealth within Africa by connecting local manufacturers with local buyers.",
    longDescription: "The Buy Africa pillar is about changing the procurement mindset. We are building a comprehensive directory of African-made products and verified suppliers. By reducing reliance on external imports for materials that can be produced locally, we strengthen our industries, reduce carbon footprints associated with long-distance shipping, and create a robust internal market.",
    focusAreas: [
      { title: "Home-Grown Brand Directory", detail: "A curated platform showcasing high-quality African brands across construction and manufacturing." },
      { title: "Local Procurement Grids", detail: "Helping developers and governments source materials locally for large-scale infrastructure projects." },
      { title: "Intra-Continental Trade", detail: "Leveraging AfCFTA to facilitate the movement of goods and services between African nations." },
      { title: "Verified Supplier Network", detail: "Rigorous vetting process to ensure reliability, quality, and ethical standards among our partners." }
    ],
    impact: "Strengthening local economies and ensuring that every dollar spent on development builds African industry."
  },
  {
    key: "build",
    name: "Build Africa",
    icon: Building2,
    tagline: "Modern Infrastructure & Smart Cities",
    description: "Build Africa focuses on developing sustainable infrastructure and smart cities through localized construction ecosystems. We believe in building for the future, today.",
    longDescription: "This pillar addresses the urgent need for housing and urban infrastructure driven by rapid urbanization. We advocate for localized construction methods that utilize African talent and materials. Our vision includes the development of 'Smart Cities'—urban centers that are technologically integrated, inclusive, and designed to improve the quality of life for all residents.",
    focusAreas: [
      { title: "Localized Construction", detail: "Utilizing local materials and labor to reduce costs and increase community ownership of projects." },
      { title: "Smart City Development", detail: "Integrating technology in urban planning to manage resources efficiently and improve service delivery." },
      { title: "Affordable Housing", detail: "Developing innovative, scalable models to address the continent's housing deficit." },
      { title: "Project Tendering", detail: "Creating transparent platforms where local contractors can bid for and win significant infrastructure projects." }
    ],
    impact: "Transforming the African landscape with resilient, modern, and inclusive infrastructure."
  },
  {
    key: "green",
    name: "Green Africa",
    icon: Leaf,
    tagline: "Sustainable & Regenerative Development",
    description: "Green Africa leads the transition to sustainable development and eco-friendly manufacturing. We ensure that our growth does not come at the expense of our environment.",
    longDescription: "Sustainability is not an afterthought at BABA; it is a core principle. Green Africa promotes circular economy models where waste is minimized and resources are reused. From renewable energy integration in new builds to the use of eco-materials in manufacturing, we are setting the standard for climate-resilient development across the continent.",
    focusAreas: [
      { title: "Recycling Systems", detail: "Implementing robust waste management and material recovery systems in industrial and urban zones." },
      { title: "Renewable Energy", detail: "Promoting solar, wind, and geothermal solutions for residential and industrial energy needs." },
      { title: "Eco-Materials", detail: "Researching and promoting the use of sustainable alternatives like stabilized earth bricks and bamboo." },
      { title: "Climate-Resilient Design", detail: "Ensuring all infrastructure is built to withstand and adapt to the changing climate." }
    ],
    impact: "Securing a healthy, sustainable environment for future generations of Africans."
  },
  {
    key: "prosper",
    name: "Prosper Africa",
    icon: TrendingUp,
    tagline: "Shared Prosperity & Financial Inclusion",
    description: "Prosper Africa drives economic empowerment and financial inclusion across all levels of the workforce. We believe that growth must be inclusive to be sustainable.",
    longDescription: "The ultimate goal of BABA is prosperity for all. This pillar focuses on unlocking the financial resources needed for SMEs and artisans to scale. By providing access to specialized financing, insurance, and investment opportunities, we are building a foundation of wealth that reaches the grassroots level of the African economy.",
    focusAreas: [
      { title: "SME Loans & Financing", detail: "Bridging the credit gap by providing accessible capital for business expansion and project funding." },
      { title: "Financial Inclusion", detail: "Bringing unbanked artisans and small-scale entrepreneurs into the formal financial ecosystem." },
      { title: "Wealth Creation", detail: "Facilitating equity participation and ownership opportunities for workers in the projects they build." },
      { title: "Cooperative Investment", detail: "Enabling collective investment schemes that allow members to pool resources for larger ventures." }
    ],
    impact: "Lifting millions into the middle class and creating a self-sustaining cycle of economic growth."
  }
];

function PillarsPage() {
  return (
    <PageShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden baba-wash py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-baba-copper/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
              Strategic Roadmap
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-baba-slate sm:text-6xl lg:text-7xl">
              The Five <span className="baba-rainbow">Pillars</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-baba-slate/70">
              Our holistic strategy to transform the African continent through skills, trade, 
              infrastructure, sustainability, and shared prosperity.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation / Jump Links */}
      <div className="sticky top-[72px] z-30 border-y border-baba-blue/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center justify-center gap-4 overflow-x-auto py-4 no-scrollbar sm:gap-8">
            {pillarDetails.map((p) => (
              <a 
                key={p.key} 
                href={`#${p.key}`}
                className="flex shrink-0 items-center gap-2 text-sm font-bold text-baba-slate transition-colors hover:text-baba-blue"
              >
                <p.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{p.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Pillar Sections */}
      <div className="divide-y divide-baba-blue/10">
        {pillarDetails.map((pillar, index) => (
          <section 
            key={pillar.key} 
            id={pillar.key} 
            className={`py-24 lg:py-32 ${index % 2 === 1 ? 'bg-baba-blue/5' : 'bg-white'}`}
          >
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
                {/* Content Left */}
                <div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-baba-blue/10 shadow-sm">
                    <pillar.icon className="h-8 w-8 text-baba-blue" />
                  </div>
                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-baba-copper-dark">
                    Pillar 0{index + 1}
                  </p>
                  <h2 className="mt-2 font-display text-4xl font-extrabold text-baba-slate sm:text-5xl">
                    {pillar.name}
                  </h2>
                  <p className="mt-4 text-xl font-semibold text-baba-blue">
                    {pillar.tagline}
                  </p>
                  <p className="mt-6 text-lg leading-relaxed text-baba-slate/70">
                    {pillar.description}
                  </p>
                  <div className="mt-8 space-y-6 text-base leading-relaxed text-baba-slate/80">
                    <p>{pillar.longDescription}</p>
                  </div>
                  
                  <div className="mt-10 rounded-2xl border border-baba-blue/10 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-baba-copper-dark" />
                      <h4 className="font-display text-lg font-bold text-baba-slate">The Impact</h4>
                    </div>
                    <p className="mt-3 text-baba-slate/70 italic">
                      "{pillar.impact}"
                    </p>
                  </div>
                </div>

                {/* Focus Areas Right */}
                <div className="space-y-6">
                  <h3 className="font-display text-2xl font-bold text-baba-slate">Key Focus Areas</h3>
                  <div className="grid gap-4">
                    {pillar.focusAreas.map((area) => (
                      <div 
                        key={area.title} 
                        className="group rounded-2xl border border-baba-blue/10 bg-white p-6 transition-all hover:border-baba-blue/30 hover:shadow-md"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-baba-blue/10 group-hover:bg-baba-blue/20">
                            <CheckCircle2 className="h-4 w-4 text-baba-blue" />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-baba-slate">{area.title}</h4>
                            <p className="mt-1 text-sm text-baba-slate/65 leading-relaxed">
                              {area.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Call to action for this specific pillar */}
                  <div className="mt-8 overflow-hidden rounded-2xl bg-baba-slate p-8 text-white">
                    <div className="relative z-10">
                      <h4 className="font-display text-xl font-bold">Get Involved in {pillar.name}</h4>
                      <p className="mt-2 text-sm text-white/70">
                        Join our network of professionals and organizations driving {pillar.name.toLowerCase()} across Africa.
                      </p>
                      <button className="mt-6 flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-baba-slate transition-transform hover:scale-105">
                        Join the Movement <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                    {/* Decorative background icon */}
                    <pillar.icon className="absolute -right-8 -bottom-8 h-32 w-32 rotate-12 text-white/5" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Global CTA */}
      <section className="bg-baba-cream py-24">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-baba-blue/10 shadow-inner">
            <Globe className="h-10 w-10 text-baba-blue animate-pulse" />
          </div>
          <h2 className="mt-8 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
            A Unified Strategy for a Stronger Africa
          </h2>
          <p className="mt-6 text-lg text-baba-slate/70">
            These five pillars are not isolated initiatives; they are an interconnected ecosystem 
            designed to create a self-reliant, prosperous, and sustainable Africa.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button className="rounded-full baba-btn-primary px-10 py-4 font-bold">
              Become a Member
            </button>
            <button className="rounded-full border-2 border-baba-blue px-10 py-4 font-bold text-baba-blue transition-colors hover:bg-baba-blue hover:text-white">
              Download Strategy PDF
            </button>
          </div>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="bg-baba-slate py-16 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="font-display text-4xl font-extrabold text-baba-copper">5</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-widest text-white/60">Pillars</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl font-extrabold text-baba-copper">20+</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-widest text-white/60">Focus Areas</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl font-extrabold text-baba-copper">1 Mission</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-widest text-white/60">Self-Reliance</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl font-extrabold text-baba-copper">54</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-widest text-white/60">Nations</p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
