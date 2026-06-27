import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, BookOpen, Leaf, Award, Lightbulb, ArrowRight, type LucideIcon } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/pillars")({
  head: () => ({
    meta: [
      { title: "Our Five Strategic Pillars | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "The five strategic pillars guiding BABA: Membership & Industry Network, Capacity Building Hub, Sustainability & Green Building, Events & Recognition, and Research, Innovation & Implementation.",
      },
    ],
    links: [{ rel: "canonical", href: "/pillars" }],
  }),
  component: PillarsPage,
});

interface PillarSection {
  title: string;
  items?: string[];
  body?: string;
}

interface SubEvent {
  name: string;
  period: string;
  intro: string;
  sections: PillarSection[];
  note?: string;
}

interface Pillar {
  key: string;
  num: number;
  icon: LucideIcon;
  name: string;
  tagline: string;
  paras: string[];
  sections: PillarSection[];
  subEvents?: SubEvent[];
  closing?: string;
}

const pillars: Pillar[] = [
  {
    key: "network",
    num: 1,
    icon: Users,
    name: "BABA Membership & Industry Network",
    tagline: "Connecting Africa's People, Skills and Opportunities",
    paras: [
      "The BABA Membership & Industry Network is the foundation of our ecosystem and serves as a platform for collaboration, visibility, professional growth, enterprise development, and industry engagement.",
      "We bring together professionals, artisans, entrepreneurs, SMEs, manufacturers, suppliers, institutions, governments, development partners, investors, and communities into one interconnected network focused on building Africa's future.",
      "Our objective is to strengthen relationships, create opportunities, facilitate partnerships, and promote knowledge sharing across industries and regions.",
    ],
    sections: [
      {
        title: "Who Can Join",
        items: [
          "Architects", "Engineers", "Quantity Surveyors", "Interior Designers",
          "Urban Planners", "Project Managers", "Contractors", "Developers",
          "Manufacturers", "Suppliers", "Entrepreneurs", "SMEs", "Artisans",
          "Educational Institutions", "Government Agencies", "NGOs", "Development Partners",
        ],
      },
      {
        title: "Benefits",
        items: [
          "Professional Visibility", "Networking Opportunities", "Industry Connections",
          "Business Opportunities", "Strategic Partnerships", "Knowledge Sharing",
          "Market Access", "Industry Recognition",
        ],
      },
    ],
    closing:
      "By strengthening connections between people, industries, and institutions, we help create an environment where opportunities can flourish.",
  },
  {
    key: "capacity",
    num: 2,
    icon: BookOpen,
    name: "BABA Capacity Building Hub",
    tagline: "Building Skills. Strengthening Enterprises. Empowering Communities.",
    paras: [
      "The BABA Capacity Building Hub focuses on developing the skills, knowledge, leadership, and entrepreneurial capabilities needed to drive Africa's growth.",
      "As cities expand, industries evolve, and economies become increasingly competitive, the demand for skilled and adaptable professionals continues to grow.",
      "Through strategic partnerships with governments, professional associations, manufacturers, educational institutions, financial institutions, development partners, and industry experts, BABA delivers practical and market-driven learning opportunities.",
    ],
    sections: [
      {
        title: "Focus Areas",
        items: [
          "Technical Skills Development", "Entrepreneurship Development", "Financial Literacy",
          "Business Growth", "Leadership Development", "Professional Development",
          "Digital Skills", "Sustainability Education", "Ethics and Professionalism",
        ],
      },
      {
        title: "Delivery Channels",
        items: [
          "Physical Workshops", "Online Learning", "Masterclasses", "Industry Forums",
          "Community Outreach Programmes", "Mentorship Programmes", "Certification Programmes",
        ],
      },
      {
        title: "Community Chapters",
        body:
          "The Capacity Building Hub operates through Community Chapters across counties, regions, and countries, ensuring opportunities reach people where they live and work. Through monthly activities, members gain access to practical learning, networking, mentorship, and enterprise support.",
      },
    ],
  },
  {
    key: "sustainability",
    num: 3,
    icon: Leaf,
    name: "BABA Sustainability & Green Building Initiative",
    tagline: "Building Resilient Cities and Communities for Future Generations",
    paras: [
      "Africa's urban population is growing rapidly, creating increased demand for housing, infrastructure, public services, and economic opportunities.",
      "As this growth continues, sustainability must remain at the centre of development.",
      "The BABA Sustainability & Green Building Initiative promotes practical solutions that support climate resilience, environmental stewardship, sustainable construction, and healthier communities.",
      "We work alongside governments, development partners, professional associations, researchers, manufacturers, and sustainability experts to advance implementation-focused initiatives that contribute to resilient cities and communities.",
    ],
    sections: [
      {
        title: "Focus Areas",
        items: [
          "Green Building", "Climate Resilience", "Sustainable Urban Development",
          "Circular Economy Practices", "Environmental Stewardship", "Sustainable Construction",
          "Resource Efficiency", "Community Sustainability Projects", "Green Skills Development",
        ],
      },
      {
        title: "Strategic Goals",
        items: [
          "Promote sustainable building practices", "Advance climate-smart development",
          "Encourage responsible urban growth", "Support environmental awareness",
          "Build local capacity in sustainability", "Foster collaboration on green initiatives",
        ],
      },
    ],
    closing:
      "Because the cities we build today will shape the future generations of tomorrow.",
  },
  {
    key: "events",
    num: 4,
    icon: Award,
    name: "BABA Events & Recognition Platform",
    tagline: "Connecting Ideas, Opportunities and Excellence",
    paras: [
      "The BABA Events & Recognition Platform serves as our annual engagement framework, bringing together leaders, professionals, businesses, institutions, development partners, and communities to collaborate, learn, showcase, and celebrate excellence.",
      "Through our flagship events, we create opportunities for visibility, partnerships, investment, networking, and industry advancement.",
    ],
    sections: [],
    subEvents: [
      {
        name: "BABA Corporate Strategy Summit",
        period: "January",
        intro: "The annual leadership platform focused on Africa's economic future.",
        sections: [
          {
            title: "The Summit brings together",
            items: [
              "Government Leaders", "Policy Makers", "Investors", "Financial Institutions",
              "Development Partners", "Industry Leaders", "Business Executives", "Professional Associations",
            ],
          },
          {
            title: "Key Focus Areas",
            items: [
              "Economic Development", "Industrial Growth", "Sustainable Cities", "Skills Development",
              "Entrepreneurship", "Investment Opportunities", "Public-Private Partnerships",
            ],
          },
        ],
      },
      {
        name: "BABA Expo & Conference",
        period: "July – September",
        intro:
          "Africa's marketplace for products, services, innovations, technologies, research, and opportunities. The Expo & Conference provides a platform for businesses, institutions, manufacturers, suppliers, entrepreneurs, and professionals to showcase their work while connecting with potential clients, partners, and investors.",
        sections: [
          {
            title: "Features",
            items: [
              "Product Exhibitions", "Industry Showcases", "Technology Demonstrations",
              "Supplier Engagement Forums", "Business Matching Sessions", "Networking Opportunities",
              "Thought Leadership Sessions", "Sustainability Forums", "Entrepreneurship Forums",
            ],
          },
        ],
        note:
          "The Expo also serves as the official launch platform for nominations for the BABA Excellence Awards.",
      },
      {
        name: "BABA Excellence Awards",
        period: "December",
        intro:
          "The BABA Excellence Awards recognize outstanding individuals, organizations, projects, and initiatives contributing to Africa's development.",
        sections: [
          {
            title: "Categories include",
            items: [
              "Professional Excellence", "Artisan Excellence", "Business Excellence",
              "Sustainability Leadership", "Innovation Awards", "Youth Achievement Awards",
              "Community Impact Awards", "Lifetime Achievement Awards",
            ],
          },
        ],
        note:
          "The Awards celebrate excellence while inspiring future generations to contribute to Africa's growth.",
      },
    ],
  },
  {
    key: "research",
    num: 5,
    icon: Lightbulb,
    name: "BABA Research, Innovation & Implementation Hub",
    tagline: "Turning Ideas Into Action",
    paras: [
      "The BABA Research, Innovation & Implementation Hub exists to ensure that ideas, discussions, and recommendations translate into practical action and measurable impact.",
      "Working with governments, universities, professional bodies, development agencies, industry stakeholders, and communities, the Hub identifies opportunities, challenges, and emerging trends affecting Africa's development.",
    ],
    sections: [
      {
        title: "Focus Areas",
        items: [
          "Sustainable Cities", "Affordable Housing", "Climate Resilience", "Youth Employment",
          "Skills Development", "SME Growth", "Industrial Development", "Innovation Ecosystems",
          "Community Development",
        ],
      },
      {
        title: "Key Outputs",
        items: [
          "Research Reports", "Industry Studies", "Policy Papers", "Pilot Projects",
          "Innovation Challenges", "Community Assessments", "Development Frameworks", "Implementation Models",
        ],
      },
      {
        title: "Our Approach",
        body:
          "We believe research should not remain on shelves. It should inform action. By combining knowledge, collaboration, innovation, and implementation, the Hub contributes to solutions that improve lives, strengthen communities, and support Africa's long-term development.",
      },
    ],
  },
];

const ecosystemSummary = [
  { name: "Membership & Industry Network", desc: "Connecting people and opportunities." },
  { name: "Capacity Building Hub", desc: "Developing skills and capabilities." },
  { name: "Sustainability & Green Building Initiative", desc: "Building resilient communities." },
  { name: "Events & Recognition Platform", desc: "Showcasing ideas and celebrating excellence." },
  { name: "Research, Innovation & Implementation Hub", desc: "Transforming knowledge into action." },
];

function SectionBlock({ section }: { section: PillarSection }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-baba-copper-dark">{section.title}</p>
      {section.body && <p className="mt-3 leading-relaxed text-baba-slate/75">{section.body}</p>}
      {section.items && (
        <div className="mt-4 flex flex-wrap gap-2.5">
          {section.items.map((it) => (
            <span
              key={it}
              className="rounded-full border border-baba-blue/15 bg-white px-4 py-1.5 text-sm font-medium text-baba-slate shadow-sm transition-colors hover:border-baba-blue/40 hover:text-baba-blue"
            >
              {it}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PillarsPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden baba-wash py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-baba-copper/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Our Framework
          </span>
          <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-baba-slate sm:text-6xl lg:text-7xl">
            Our Five <span className="baba-rainbow">Strategic Pillars</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-baba-slate/70">
            Our five pillars guide everything we do — connecting people, building industries, and transforming Africa.
          </p>
        </div>
      </section>

      {/* Jump nav */}
      <div className="sticky top-[72px] z-30 border-y border-baba-blue/10 bg-white/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center justify-start gap-6 overflow-x-auto py-4 no-scrollbar sm:justify-center">
            {pillars.map((p) => (
              <a
                key={p.key}
                href={`#${p.key}`}
                className="flex shrink-0 items-center gap-2 text-sm font-bold text-baba-slate transition-colors hover:text-baba-blue"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-baba-blue/10 text-xs text-baba-blue">{p.num}</span>
                <p.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Pillar sections */}
      <div className="divide-y divide-baba-blue/10">
        {pillars.map((pillar, index) => (
          <section
            key={pillar.key}
            id={pillar.key}
            className={`scroll-mt-32 py-20 lg:py-24 ${index % 2 === 1 ? "bg-baba-blue/5" : "bg-white"}`}
          >
            <div className="mx-auto max-w-4xl px-5 lg:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-baba-blue to-baba-copper text-xl font-bold text-white shadow-md">
                  {pillar.num}
                </div>
                <pillar.icon className="h-8 w-8 text-baba-blue" />
              </div>
              <h2 className="mt-6 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">{pillar.name}</h2>
              <p className="mt-3 text-xl font-semibold text-baba-blue">{pillar.tagline}</p>

              <div className="mt-6 space-y-4 text-lg leading-relaxed text-baba-slate/80">
                {pillar.paras.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {pillar.sections.length > 0 && (
                <div className="mt-10 space-y-8">
                  {pillar.sections.map((s) => (
                    <SectionBlock key={s.title} section={s} />
                  ))}
                </div>
              )}

              {pillar.subEvents && (
                <div className="mt-10 space-y-6">
                  {pillar.subEvents.map((ev) => (
                    <div key={ev.name} className="rounded-2xl border border-baba-blue/10 bg-baba-cream/50 p-6 sm:p-8">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-display text-2xl font-bold text-baba-slate">{ev.name}</h3>
                        <span className="rounded-full bg-baba-blue/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-baba-blue">{ev.period}</span>
                      </div>
                      <p className="mt-3 leading-relaxed text-baba-slate/80">{ev.intro}</p>
                      <div className="mt-6 space-y-6">
                        {ev.sections.map((s) => (
                          <SectionBlock key={s.title} section={s} />
                        ))}
                      </div>
                      {ev.note && <p className="mt-5 text-sm font-semibold italic text-baba-copper-dark">{ev.note}</p>}
                    </div>
                  ))}
                </div>
              )}

              {pillar.closing && (
                <p className="mt-8 rounded-2xl bg-gradient-to-r from-baba-blue/10 via-baba-copper/10 to-baba-blue/10 px-6 py-4 text-lg font-semibold text-baba-blue">
                  {pillar.closing}
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Ecosystem summary */}
      <section className="bg-baba-slate py-20 text-white">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Together, These Five Pillars Form the <span className="baba-rainbow">BABA Ecosystem</span>
          </h2>
          <div className="mt-10 space-y-4 text-left">
            {ecosystemSummary.map((e, i) => (
              <div key={e.name} className="flex items-start gap-4 rounded-2xl bg-white/5 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-baba-copper text-sm font-bold text-baba-slate">{i + 1}</span>
                <div>
                  <p className="font-display font-bold text-white">{e.name}</p>
                  <p className="text-sm text-white/70">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-lg font-semibold text-baba-copper">Connecting People. Building Industries. Transforming Africa.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="rounded-full baba-btn-primary px-8 py-3.5 text-sm font-bold">
              Become a Member
            </Link>
            <Link to="/partners" className="inline-flex items-center gap-2 rounded-full border-2 border-white px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-baba-slate">
              Partner With Us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
