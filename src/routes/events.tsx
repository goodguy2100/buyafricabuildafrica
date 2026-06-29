import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Award, Globe, Building, ArrowRight, MapPin, Clock, Leaf, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";


const upcomingEvents = [
  {
    icon: Leaf, image: gardensExpoImg, title: "Gardens Expo & Conference",
    date: "August 2026", location: "Sarit Centre, Nairobi",
    description: "A celebration of landscaping, garden design and sustainable green spaces — bringing together exhibitors, professionals and enthusiasts.",
  },
  {
    icon: Sparkles, image: babaLaunchImg, title: "Official BABA Launch",
    date: "End of September 2026", location: "Nairobi, Kenya",
    description: "The official launch of Buy Africa Build Africa — unveiling our mission, pillars and the movement to build Africa's future.",
  },
  {
    icon: Award, image: awardsGalaImg, title: "BABA Excellence Awards",
    date: "1st December 2026 (to confirm)", location: "To be announced",
    description: "An evening gala celebrating those building Africa across professional, artisan, business, sustainability and youth categories.",
  },
];


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

      <section className="bg-baba-cream pt-16 md:pt-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">Mark Your Calendar</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">Upcoming Events</h2>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <div key={event.title} className="baba-card-hover group relative overflow-hidden rounded-2xl border border-baba-copper/20 bg-white">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={event.image} alt={event.title} loading="lazy" width={800} height={600}
                    className="absolute inset-0 h-full w-full scale-110 object-cover blur-[3px] brightness-95 transition-transform duration-500 group-hover:scale-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-baba-slate/80 via-baba-slate/30 to-transparent" />
                  <div className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm">
                    <event.icon className="h-5 w-5 text-baba-copper-dark" />
                  </div>
                  <h3 className="absolute bottom-4 left-5 right-5 font-display text-xl font-bold text-white drop-shadow">{event.title}</h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-baba-blue/10 px-3 py-1 text-xs font-semibold text-baba-blue">
                      <Calendar className="h-3.5 w-3.5" /> {event.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-baba-slate/70"><MapPin className="h-3.5 w-3.5 text-baba-copper" /> {event.location}</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-baba-slate/80">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-baba-cream py-16 md:py-24">

        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {annualEvents.map((event) => (
              <div key={event.title} className="baba-card-hover overflow-hidden rounded-2xl border border-baba-copper/20 bg-white">
                <div className="h-2 bg-gradient-to-r from-baba-blue to-baba-copper" />
                <div className="p-7 md:p-9">
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
                      <h4 className="mb-3 mt-6 text-xs font-bold uppercase tracking-wider text-baba-blue">Highlights</h4>
                      <ul className="space-y-2.5">
                        {event.highlights.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-baba-slate/75">
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
        <div className="relative overflow-hidden rounded-2xl border border-baba-blue/10 bg-gradient-to-br from-baba-blue via-baba-blue-dark to-baba-slate p-10 text-center text-white">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-baba-copper/20 blur-3xl" />
          <div className="relative">
            <Calendar className="mx-auto h-8 w-8 text-white" />
            <h3 className="mt-3 font-display text-2xl font-bold">Join the Movement</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/80">There's a place for everyone in BABA. Become a member, list your business in the directory, explore live opportunities, or partner with us on our flagship events.</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-baba-blue shadow-lg transition-transform hover:scale-[1.03]">
                Become a Member <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/opportunities" className="inline-flex items-center gap-2 rounded-xl bg-baba-copper px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]">
                View Opportunities <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/directory" className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                Join the Directory
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

    </PageShell>
  );
}
