import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Globe, ArrowRight, MapPin, Clock, Check, Loader2 } from "lucide-react";import { useServerFn } from "@tanstack/react-start";
import { PageShell } from "@/components/PageShell";
import { useUpcomingEvents } from "@/lib/use-upcoming-events";
import { useVerificationGate } from "@/components/VerificationGate";
import { signUpForEvent, listMyEventSignups } from "@/lib/events-apply.functions";
import { getMyRegistrations } from "@/lib/registrations.functions";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events | Buy Africa Build Africa (BABA)" },
      { name: "description", content: "Upcoming events in Kenya's built environment — plus BABA's flagship Expo & Conference." },
      { property: "og:title", content: "BABA Events — Upcoming & Annual" },
      {
        property: "og:description",
        content:
          "The events BABA is tracking — Build Expo and The Showground — plus BABA's flagship Expo & Conference for Africa.",
      },
      { property: "og:url", content: "https://buyafricabuildafrica.org/events" },
    ],
    links: [{ rel: "canonical", href: "https://buyafricabuildafrica.org/events" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: "BABA Expo & Conference",
          description:
            "BABA's flagship annual gathering — a leadership platform for governments, investors and industry, combined with Africa's marketplace of products, ideas and opportunities.",
          location: { "@type": "Place", name: "Nairobi, Kenya", address: "Nairobi, Kenya" },
          organizer: { "@type": "Organization", name: "Buy Africa Build Africa (BABA)", url: "https://buyafricabuildafrica.org/" },
        }),
      },
    ],
  }),
  component: Events,
});

const annualEvents = [
  {
    icon: Globe, title: "BABA Expo & Conference",
    date: "Every July / August", time: "Multi-day", location: "Nairobi, Kenya",
    description: "BABA's flagship annual gathering — the Corporate Strategy Summit and the Expo & Conference as one. A leadership platform bringing together governments, investors, development partners, banks, corporates, manufacturers and industry leaders, combined with Africa's marketplace of ideas, products and opportunities: product exhibitions, supplier showcases, technology demonstrations, construction innovations, manufacturing exhibitions, keynote speakers, industry panels, sustainability forums and entrepreneurship sessions.",
    highlights: ["Policy Dialogue", "Investment Opportunities", "Product Exhibitions & Supplier Showcases", "Keynote Speakers & Industry Panels", "Sustainability & Urban Development Forums", "Networking with Industry Leaders"],
  },
];

export function Events() {
  const { events } = useUpcomingEvents();
  const navigate = useNavigate();
  const signupFn = useServerFn(signUpForEvent);
  const mySignupsFn = useServerFn(listMyEventSignups);
  const regsFn = useServerFn(getMyRegistrations);
  const { requireVerification, GateModal } = useVerificationGate();
  const [signedUp, setSignedUp] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Preload the member's existing sign-ups when they are signed in.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      mySignupsFn()
        .then((titles) => setSignedUp(new Set(titles)))
        .catch(() => {});
    });
  }, [mySignupsFn]);

  const handleSignup = async (event: { id: string; title: string }) => {
    setNotice(null);
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      requireVerification("apply");
      return;
    }
    try {
      // Verified members sign up for real; unverified members are sent to
      // the pillars (that's the verification path) instead of paying.
      const regs = await regsFn();
      if (!regs.some((r) => r.verified)) {
        navigate({ to: "/pillars" });
        return;
      }
      setBusy(event.id);
      const res = await signupFn({ data: { opportunityId: event.id, title: event.title } });
      setSignedUp((s) => new Set(s).add(event.title));
      setNotice(res.already ? "You're already signed up for this event." : `You're signed up for ${event.title} — see you there! 🎉`);
      setBusy(null);
    } catch (e) {
      setBusy(null);
      setNotice(e instanceof Error ? e.message : "Could not sign up. Please try again.");
    }
  };

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
            <p className="mt-4 max-w-2xl text-lg text-white/80">Our flagship Expo & Conference, plus the events the BABA community is tracking across Kenya's built environment.</p>
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
          <div data-stack className="mt-12 grid gap-8 lg:grid-cols-3">
            {events.length === 0 && (
              <div className="rounded-2xl border border-baba-blue/10 bg-white p-10 text-center lg:col-span-3">
                <Calendar className="mx-auto h-8 w-8 text-baba-blue/40" />
                <p className="mt-3 text-sm text-baba-slate/60">
                  No upcoming events right now — check back soon.
                </p>
              </div>
            )}
            {events.map((event) => (
              <div key={event.id} className="baba-card-hover group relative overflow-hidden rounded-2xl border border-baba-copper/20 bg-white">
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-baba-blue via-baba-blue-dark to-baba-slate">
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-baba-slate/70 via-transparent to-transparent" />
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
                    {event.isOnline ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                        <Globe className="h-3.5 w-3.5" /> Online event
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-baba-slate/70"><MapPin className="h-3.5 w-3.5 text-baba-copper" /> {event.location}</span>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-baba-slate/80">{event.description}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    {event.applicantsCount > 0 && (
                      <span className="text-xs font-semibold text-baba-slate/50">
                        {event.applicantsCount} person{event.applicantsCount === 1 ? "" : "s"} signed up
                      </span>
                    )}
                    {signedUp.has(event.title) ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                        <Check className="h-4 w-4" /> You're signed up
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSignup(event)}
                        disabled={busy === event.id}
                        className="inline-flex items-center gap-1.5 rounded-lg baba-cta px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                      >
                        {busy === event.id && <Loader2 className="h-4 w-4 animate-spin" />}
                        Sign up for this event
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {notice && (
            <p className="mx-auto mt-6 max-w-xl rounded-xl border border-baba-blue/15 bg-white px-4 py-3 text-center text-sm font-semibold text-baba-slate">
              {notice}
            </p>
          )}
          {GateModal}
        </div>
      </section>

      <section className="bg-baba-cream py-16 md:py-24">

        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div data-stack className="grid gap-8 lg:grid-cols-3">
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
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/80">There's a place for everyone in BABA. Become a member, or partner with us on our flagship events.</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-baba-blue shadow-lg transition-transform hover:scale-[1.03]">
                Become a Member <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/partners" className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                Become a Partner
              </Link>
            </div>
          </div>
        </div>
      </section>

    </PageShell>
  );
}
