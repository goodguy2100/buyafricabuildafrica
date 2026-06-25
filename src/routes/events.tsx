import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Award, Globe, Building, ArrowRight, MapPin, Clock } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events | Buy Africa Build Africa (BABA)" },
      { name: "description", content: "BABA's three annual events — Corporate Strategy Summit, Expo & Conference, and Excellence Awards." },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: Events,
});

const annualEvents = [
  {
    icon: Building, title: "BABA Corporate Strategy Summit",
    date: "Every January", time: "Full-day", location: "Nairobi, Kenya",
    description: "Annual leadership platform bringing together governments, investors, development partners, banks, corporates, manufacturers, industry leaders, and professionals to shape Africa's economic development agenda.",
    highlights: ["Policy Dialogue", "Investment Opportunities", "Industry Collaboration", "Economic Development Strategies"],
  },
  {
    icon: Globe, title: "BABA Expo & Conference",
    date: "Every July / August", time: "Multi-day", location: "Rotating African cities",
    description: "Africa's marketplace of ideas, products and opportunities. Featuring product exhibitions, supplier showcases, technology demonstrations, construction innovations, and manufacturing exhibitions. Conference includes keynote speakers, industry panels, sustainability forums, urban development discussions, and entrepreneurship sessions. Awards nominations officially open during the Expo.",
    highlights: ["Product Exhibitions & Supplier Showcases", "Keynote Speakers & Industry Panels", "Sustainability & Urban Development Forums", "Awards Nominations Launch", "Networking with Industry Leaders"],
  },
  {
    icon: Award, title: "BABA Excellence Awards",
    date: "Every December", time: "Evening gala", location: "To be announced",
    description: "Celebrating those building Africa. Recognizing outstanding achievements across professional, artisan, business, sustainability, youth, and special recognition categories.",
    categories: [
      { title: "Professional", awards: ["Architect of the Year", "Interior Designer of the Year", "Engineer of the Year", "Quantity Surveyor of the Year", "Project Manager of the Year"] },
      { title: "Artisan", awards: ["Plumber of the Year", "Electrician of the Year", "Carpenter of the Year", "Welder of the Year", "Mason of the Year"] },
      { title: "Business", awards: ["SME of the Year", "Manufacturer of the Year", "Supplier of the Year", "Emerging Business of the Year"] },
      { title: "Sustainability", awards: ["Green Building Project of the Year", "Sustainability Champion", "Climate Innovation Award"] },
      { title: "Youth", awards: ["Young Professional of the Year", "Young Entrepreneur of the Year", "Emerging Artisan of the Year"] },
      { title: "Special Recognition", awards: ["Women in Leadership Award", "Community Impact Award", "African Excellence Award", "Lifetime Achievement Award"] },
    ],
  },
];

export function Events() {
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-gradient-to-br from-baba-blue via-baba-blue-dark to-baba-slate py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-baba-copper/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-baba-blue-light/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <Calendar className="h-4 w-4" /> Our Annual Events
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">BABA Annual Events</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">Three flagship events that bring together the entire built environment community across Africa.</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-baba-cream to-transparent" />
      </section>

      <section className="bg-baba-cream py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {annualEvents.map((event) => (
              <div key={event.title} className="baba-card-hover overflow-hidden rounded-2xl border border-baba-copper/20 bg-white">
                <div className="h-2 bg-gradient-to-r from-baba-blue to-baba-copper" />
                <div className="p-6 md:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-baba-copper/10">
                    <event.icon className="h-6 w-6 text-baba-copper-dark" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-baba-slate">{event.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-baba-slate/70">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-baba-blue/10 px-3 py-1 text-xs font-semibold text-baba-blue">
                      <Calendar className="h-3.5 w-3.5" /> {event.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs"><Clock className="h-3.5 w-3.5 text-baba-copper" /> {event.time}</span>
                    <span className="inline-flex items-center gap-1.5 text-xs"><MapPin className="h-3.5 w-3.5 text-baba-copper" /> {event.location}</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-baba-slate/80">{event.description}</p>

                  {event.highlights && (
                    <>
                      <h4 className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-baba-blue">Highlights</h4>
                      <ul className="space-y-1.5">
                        {event.highlights.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-baba-slate/75">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-baba-copper/15 text-[9px] text-baba-copper-dark">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {event.categories && (
                    <div className="mt-4">
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-baba-blue">Award Categories</h4>
                      {event.categories.map((cat) => (
                        <div key={cat.title} className="mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-baba-copper-dark">{cat.title}</p>
                          <p className="text-[11px] text-baba-slate/70">{cat.awards.join(" · ")}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-2xl border border-baba-blue/10 bg-white p-8 text-center">
          <Calendar className="mx-auto h-8 w-8 text-baba-blue" />
          <h3 className="mt-3 font-display text-xl font-bold text-baba-slate">Interested in Participating?</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-baba-slate/70">Registration details for each event will be announced closer to the date. Contact us for sponsorship, exhibition, and partnership opportunities.</p>
          <Link to="/contact" className="baba-btn-primary mt-6 inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg">
            Contact Us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
