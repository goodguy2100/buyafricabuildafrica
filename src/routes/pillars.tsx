import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  BookOpen,
  Leaf,
  Award,
  Lightbulb,
  CheckCircle2,
  Globe,
  ArrowRight,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/pillars")({
  head: () => ({
    meta: [
      { title: "Our Five Strategic Pillars | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Explore the five strategic pillars of BABA: the Membership & Industry Network, Capacity Building Hub, Sustainability & Green Building Initiative, Events & Recognition Platform, and Research, Innovation & Implementation Hub.",
      },
    ],
    links: [{ rel: "canonical", href: "/pillars" }],
  }),
  component: PillarsPage,
});

interface PillarList {
  heading: string;
  items: string[];
}

interface SubEvent {
  name: string;
  when: string;
  blurb: string;
  lists: PillarList[];
}

interface PillarDetail {
  key: string;
  shortName: string;
  name: string;
  icon: LucideIcon;
  tagline: string;
  grad: string;
  intro: string[];
  lists: PillarList[];
  subEvents?: SubEvent[];
}

const pillarDetails: PillarDetail[] = [
  {
    key: "network",
    shortName: "Membership Network",
    name: "Membership & Industry Network",
    icon: Users,
    tagline: "Connecting Africa's People, Skills and Opportunities",
    grad: "from-baba-blue to-baba-blue-light",
    intro: [
      "The BABA Membership & Industry Network is the foundation of our ecosystem and serves as a platform for collaboration, visibility, professional growth, enterprise development, and industry engagement.",
      "We bring together professionals, artisans, entrepreneurs, SMEs, manufacturers, suppliers, institutions, governments, development partners, investors, and communities into one interconnected network focused on building Africa's future.",
      "Our objective is to strengthen relationships, create opportunities, facilitate partnerships, and promote knowledge sharing across industries and regions.",
    ],
    lists: [
      {
        heading: "Who Can Join",
        items: [
          "Architects",
          "Engineers",
          "Quantity Surveyors",
          "Interior Designers",
          "Urban Planners",
          "Project Managers",
          "Contractors",
          "Developers",
          "Manufacturers",
          "Suppliers",
          "Entrepreneurs",
          "SMEs",
          "Artisans",
          "Educational Institutions",
          "Government Agencies",
          "NGOs",
          "Development Partners",
        ],
      },
      {
        heading: "Benefits",
        items: [
          "Professional Visibility",
          "Networking Opportunities",
          "Industry Connections",
          "Business Opportunities",
          "Strategic Partnerships",
          "Knowledge Sharing",
          "Market Access",
          "Industry Recognition",
        ],
      },
    ],
  },
  {
    key: "capacity",
    shortName: "Capacity Building",
    name: "BABA Capacity Building Hub",
    icon: BookOpen,
    tagline: "Building Skills. Strengthening Enterprises. Empowering Communities.",
    grad: "from-baba-blue-light to-brand-green",
    intro: [
      "The BABA Capacity Building Hub focuses on developing the skills, knowledge, leadership, and entrepreneurial capabilities needed to drive Africa's growth.",
      "As cities expand, industries evolve, and economies become increasingly competitive, the demand for skilled and adaptable professionals continues to grow.",
      "Through strategic partnerships with governments, professional associations, manufacturers, educational institutions, financial institutions, development partners, and industry experts, BABA delivers practical and market-driven learning opportunities.",
      "The Capacity Building Hub operates through Community Chapters across counties, regions, and countries, ensuring opportunities reach people where they live and work. Through monthly activities, members gain access to practical learning, networking, mentorship, and enterprise support.",
    ],
    lists: [
      {
        heading: "Focus Areas",
        items: [
          "Technical Skills Development",
          "Entrepreneurship Development",
          "Financial Literacy",
          "Business Growth",
          "Leadership Development",
          "Professional Development",
          "Digital Skills",
          "Sustainability Education",
          "Ethics and Professionalism",
        ],
      },
      {
        heading: "Delivery Channels",
        items: [
          "Physical Workshops",
          "Online Learning",
          "Masterclasses",
          "Industry Forums",
          "Community Outreach Programmes",
          "Mentorship Programmes",
          "Certification Programmes",
        ],
      },
    ],
  },
  {
    key: "sustainability",
    shortName: "Sustainability & Green Building",
    name: "BABA Sustainability & Green Building Initiative",
    icon: Leaf,
    tagline: "Building Resilient Cities and Communities for Future Generations",
    grad: "from-brand-green to-baba-copper",
    intro: [
      "Africa's urban population is growing rapidly, creating increased demand for housing, infrastructure, public services, and economic opportunities. As this growth continues, sustainability must remain at the centre of development.",
      "The BABA Sustainability & Green Building Initiative promotes practical solutions that support climate resilience, environmental stewardship, sustainable construction, and healthier communities.",
      "We work alongside governments, development partners, professional associations, researchers, manufacturers, and sustainability experts to advance implementation-focused initiatives that contribute to resilient cities and communities.",
      "Because the cities we build today will shape the future generations of tomorrow.",
    ],
    lists: [
      {
        heading: "Focus Areas",
        items: [
          "Green Building",
          "Climate Resilience",
          "Sustainable Urban Development",
          "Circular Economy Practices",
          "Environmental Stewardship",
          "Sustainable Construction",
          "Resource Efficiency",
          "Community Sustainability Projects",
          "Green Skills Development",
        ],
      },
      {
        heading: "Strategic Goals",
        items: [
          "Promote sustainable building practices",
          "Advance climate-smart development",
          "Encourage responsible urban growth",
          "Support environmental awareness",
          "Build local capacity in sustainability",
          "Foster collaboration on green initiatives",
        ],
      },
    ],
  },
  {
    key: "events",
    shortName: "Events & Recognition",
    name: "BABA Events & Recognition Platform",
    icon: Award,
    tagline: "Connecting Ideas, Opportunities and Excellence",
    grad: "from-baba-copper to-baba-copper-dark",
    intro: [
      "The BABA Events & Recognition Platform serves as our annual engagement framework, bringing together leaders, professionals, businesses, institutions, development partners, and communities to collaborate, learn, showcase, and celebrate excellence.",
      "Through our flagship events, we create opportunities for visibility, partnerships, investment, networking, and industry advancement.",
    ],
    lists: [],
    subEvents: [
      {
        name: "BABA Corporate Strategy Summit",
        when: "January",
        blurb: "The annual leadership platform focused on Africa's economic future.",
        lists: [
          {
            heading: "The Summit Brings Together",
            items: [
              "Government Leaders",
              "Policy Makers",
              "Investors",
              "Financial Institutions",
              "Development Partners",
              "Industry Leaders",
              "Business Executives",
              "Professional Associations",
            ],
          },
          {
            heading: "Key Focus Areas",
            items: [
              "Economic Development",
              "Industrial Growth",
              "Sustainable Cities",
              "Skills Development",
              "Entrepreneurship",
              "Investment Opportunities",
              "Public-Private Partnerships",
            ],
          },
        ],
      },
      {
        name: "BABA Expo & Conference",
        when: "July – September",
        blurb: "Africa's marketplace for products, services, innovations, technologies, research, and opportunities. A platform for businesses, institutions, manufacturers, suppliers, entrepreneurs, and professionals to showcase their work and connect with clients, partners, and investors. The Expo also serves as the official launch platform for nominations for the BABA Excellence Awards.",
        lists: [
          {
            heading: "Features",
            items: [
              "Product Exhibitions",
              "Industry Showcases",
              "Technology Demonstrations",
              "Supplier Engagement Forums",
              "Business Matching Sessions",
              "Networking Opportunities",
              "Thought Leadership Sessions",
              "Sustainability Forums",
              "Entrepreneurship Forums",
            ],
          },
        ],
      },
      {
        name: "BABA Excellence Awards",
        when: "December",
        blurb: "The BABA Excellence Awards recognize outstanding individuals, organizations, projects, and initiatives contributing to Africa's development — celebrating excellence while inspiring future generations to contribute to Africa's growth.",
        lists: [
          {
            heading: "Categories Include",
            items: [
              "Professional Excellence",
              "Artisan Excellence",
              "Business Excellence",
              "Sustainability Leadership",
              "Innovation Awards",
              "Youth Achievement Awards",
              "Community Impact Awards",
              "Lifetime Achievement Awards",
            ],
          },
        ],
      },
    ],
  },
  {
    key: "research",
    shortName: "Research & Innovation",
    name: "BABA Research, Innovation & Implementation Hub",
    icon: Lightbulb,
    tagline: "Turning Ideas Into Action",
    grad: "from-baba-copper-dark to-brand-red",
    intro: [
      "The BABA Research, Innovation & Implementation Hub exists to ensure that ideas, discussions, and recommendations translate into practical action and measurable impact.",
      "Working with governments, universities, professional bodies, development agencies, industry stakeholders, and communities, the Hub identifies opportunities, challenges, and emerging trends affecting Africa's development.",
      "We believe research should not remain on shelves. It should inform action. By combining knowledge, collaboration, innovation, and implementation, the Hub contributes to solutions that improve lives, strengthen communities, and support Africa's long-term development.",
    ],
    lists: [
      {
        heading: "Focus Areas",
        items: [
          "Sustainable Cities",
          "Affordable Housing",
          "Climate Resilience",
          "Youth Employment",
          "Skills Development",
          "SME Growth",
          "Industrial Development",
          "Innovation Ecosystems",
          "Community Development",
        ],
      },
      {
        heading: "Key Outputs",
        items: [
          "Research Reports",
          "Industry Studies",
          "Policy Papers",
          "Pilot Projects",
          "Innovation Challenges",
          "Community Assessments",
          "Development Frameworks",
          "Implementation Models",
        ],
      },
    ],
  },
];

const ecosystemSummary = [
  "Membership & Industry Network — Connecting people and opportunities.",
  "Capacity Building Hub — Developing skills and capabilities.",
  "Sustainability & Green Building Initiative — Building resilient communities.",
  "Events & Recognition Platform — Showcasing ideas and celebrating excellence.",
  "Research, Innovation & Implementation Hub — Transforming knowledge into action.",
];

function PillarsPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden baba-wash py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-baba-copper/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            The Main Agenda
          </span>
          <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-baba-slate sm:text-6xl lg:text-7xl">
            Our Strategic <span className="baba-rainbow">Pillars</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-baba-slate/70">
            Connecting People. Building Industries. Transforming Africa. Five interconnected
            pillars form the BABA ecosystem.
          </p>
        </div>
      </section>

      {/* Jump nav */}
      <div className="sticky top-[72px] z-30 border-y border-baba-blue/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="no-scrollbar flex items-center justify-start gap-4 overflow-x-auto py-4 sm:justify-center sm:gap-8">
            {pillarDetails.map((p) => (
              <a
                key={p.key}
                href={`#${p.key}`}
                className="flex shrink-0 items-center gap-2 text-sm font-bold text-baba-slate transition-colors hover:text-baba-blue"
              >
                <p.icon className="h-4 w-4" />
                <span>{p.shortName}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Pillar sections */}
      <div className="divide-y divide-baba-blue/10">
        {pillarDetails.map((pillar, index) => (
          <section
            key={pillar.key}
            id={pillar.key}
            className={`scroll-mt-32 py-20 lg:py-28 ${index % 2 === 1 ? "bg-baba-blue/5" : "bg-white"}`}
          >
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
              {/* Header */}
              <div className="max-w-3xl">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${pillar.grad} text-white shadow-lg`}>
                  <pillar.icon className="h-8 w-8" />
                </div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-baba-copper-dark">
                  Pillar 0{index + 1}
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
                  {pillar.name}
                </h2>
                <p className="mt-3 text-xl font-semibold text-baba-blue">{pillar.tagline}</p>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-baba-slate/75">
                  {pillar.intro.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              {/* Lists */}
              {pillar.lists.length > 0 && (
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                  {pillar.lists.map((list) => (
                    <div key={list.heading} className="rounded-2xl border border-baba-blue/10 bg-white p-6 shadow-sm">
                      <h3 className="font-display text-lg font-bold text-baba-slate">{list.heading}</h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {list.items.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 rounded-full bg-baba-blue/8 px-3 py-1.5 text-sm font-medium text-baba-slate"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-baba-blue" /> {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-events (Events pillar) */}
              {pillar.subEvents && (
                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                  {pillar.subEvents.map((ev) => (
                    <div key={ev.name} className="baba-pop-card flex flex-col overflow-hidden rounded-2xl p-6">
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-baba-copper/15 px-3 py-1 text-xs font-bold text-baba-copper-dark">
                        <Calendar className="h-3.5 w-3.5" /> {ev.when}
                      </span>
                      <h3 className="mt-3 font-display text-xl font-extrabold text-baba-slate">{ev.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-baba-slate/70">{ev.blurb}</p>
                      {ev.lists.map((list) => (
                        <div key={list.heading} className="mt-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-baba-copper-dark">{list.heading}</p>
                          <ul className="mt-2 space-y-1.5">
                            {list.items.map((item) => (
                              <li key={item} className="flex items-center gap-2 text-sm text-baba-slate/75">
                                <span className="h-1.5 w-1.5 rounded-full bg-baba-copper" /> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Pillar CTA */}
              <div className="mt-10 flex flex-wrap items-center gap-4 rounded-2xl bg-baba-slate p-8 text-white">
                <div className="flex-1 min-w-[220px]">
                  <h4 className="font-display text-xl font-bold">Get involved in this pillar</h4>
                  <p className="mt-1 text-sm text-white/70">
                    Join our network of professionals and organizations driving Africa's development.
                  </p>
                </div>
                <Link
                  to="/register"
                  className="baba-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
                >
                  Join &amp; Get Involved <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Ecosystem summary */}
      <section className="bg-baba-cream py-20">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-baba-blue to-baba-copper shadow-lg">
            <Globe className="h-10 w-10 animate-pulse text-white" />
          </div>
          <h2 className="mt-8 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
            Together, These Five Pillars Form the BABA Ecosystem
          </h2>
          <ul className="mx-auto mt-8 max-w-2xl space-y-3 text-left">
            {ecosystemSummary.map((s) => (
              <li key={s} className="flex items-start gap-3 rounded-xl border border-baba-blue/10 bg-white p-4 text-baba-slate/80 shadow-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-baba-blue" /> {s}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="baba-cta inline-flex items-center gap-2 rounded-full px-10 py-4 font-bold">
              Become a Member <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="rounded-full border-2 border-baba-blue px-10 py-4 font-bold text-baba-blue transition-colors hover:bg-baba-blue hover:text-white"
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
