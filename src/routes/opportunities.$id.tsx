import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Building2,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useVerificationGate } from "@/components/VerificationGate";
import { getOpportunity, opportunities } from "@/data/opportunities";

export const Route = createFileRoute("/opportunities/$id")({
  head: ({ params }) => {
    const opp = getOpportunity(Number(params.id));
    const title = opp
      ? `${opp.title} | Buy Africa Build Africa (BABA)`
      : "Opportunity not found | Buy Africa Build Africa (BABA)";
    const description = opp
      ? opp.description.slice(0, 155)
      : "This opportunity could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(opp ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: `/opportunities/${params.id}` }],
    };
  },
  component: OpportunityDetail,
  notFoundComponent: OpportunityNotFound,
});

function OpportunityNotFound() {
  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
        <h1 className="font-display text-3xl font-extrabold text-baba-slate">
          Opportunity not found
        </h1>
        <p className="mt-3 text-baba-slate/70">
          The opportunity you are looking for may have ended or been moved.
        </p>
        <Link
          to="/opportunities"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-baba-blue px-6 py-2.5 text-sm font-semibold text-baba-cream"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Up &amp; Coming
        </Link>
      </section>
    </PageShell>
  );
}

function OpportunityDetail() {
  const { id } = Route.useParams();
  const opp = getOpportunity(Number(id));
  const { requireVerification, GateModal } = useVerificationGate();

  if (!opp) return <OpportunityNotFound />;

  const related = opportunities
    .filter((o) => o.kind === opp.kind && o.id !== opp.id)
    .slice(0, 3);

  return (
    <PageShell>
      <section className="border-b border-baba-blue/10 bg-baba-blue/5">
        <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-baba-blue hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Up &amp; Coming
          </Link>
          <span className="mt-6 inline-flex w-fit rounded-full bg-baba-copper/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-baba-copper-dark">
            {opp.kind}
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
            {opp.title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-baba-blue">
            <Building2 className="h-4 w-4" /> {opp.org}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-baba-slate/70">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {opp.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {opp.meta}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-xl font-bold text-baba-slate">
              About this opportunity
            </h2>
            <p className="mt-3 leading-relaxed text-baba-slate/80">
              {opp.description}
            </p>

            <h2 className="mt-10 font-display text-xl font-bold text-baba-slate">
              Requirements
            </h2>
            <ul className="mt-3 space-y-2.5">
              {opp.requirements.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-baba-slate/80">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-baba-copper-dark" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-baba-blue/10 bg-card p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-baba-slate">
                {opp.cta === "apply" ? "Ready to apply?" : "Reserve your place"}
              </h3>
              <p className="mt-2 text-sm text-baba-slate/70">
                {opp.cta === "apply"
                  ? "Apply to join this programme. Verified members get priority."
                  : "Register to attend. We'll confirm your spot by email."}
              </p>
              <button
                onClick={() => requireVerification("apply")}
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-baba-blue px-5 py-2.5 text-sm font-bold text-baba-cream transition-colors hover:bg-baba-blue/90"
              >
                {opp.cta === "apply" ? "Apply Now" : "Register Now"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                to="/contact"
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-baba-blue/20 px-5 py-2.5 text-sm font-semibold text-baba-blue transition-colors hover:bg-baba-blue/10"
              >
                Contact Us
              </Link>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-xl font-bold text-baba-slate">
              More {opp.kind}
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((o) => (
                <Link
                  key={o.id}
                  to="/opportunities/$id"
                  params={{ id: String(o.id) }}
                  className="baba-card-hover flex flex-col rounded-2xl border border-baba-blue/10 bg-card p-6"
                >
                  <h3 className="font-display text-base font-bold text-baba-slate">
                    {o.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-baba-blue">{o.org}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-baba-copper-dark">
                    View details <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
      {GateModal}
    </PageShell>
  );
}
