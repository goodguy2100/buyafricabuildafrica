import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { MapPin, Clock, ArrowRight, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useVerificationGate } from "@/components/VerificationGate";
import { opportunities, kinds, type Kind } from "@/data/opportunities";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Up & Coming | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Upcoming trainings, masterclasses and events you can sign up for across the BABA network.",
      },
    ],
    links: [{ rel: "canonical", href: "/opportunities" }],
  }),
  component: Opportunities,
});

const PAGE_SIZE = 3;

function Opportunities() {
  const [filter, setFilter] = useState<"All" | Kind>("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { GateModal } = useVerificationGate();
  const gridRef = useRef<HTMLDivElement>(null);

  const list =
    filter === "All" ? opportunities : opportunities.filter((o) => o.kind === filter);
  const visible = list.slice(0, visibleCount);
  const hasMore = visibleCount < list.length;

  const resetPaging = (k: "All" | Kind) => {
    setFilter(k);
    setVisibleCount(PAGE_SIZE);
    setLoading(false);
    setError(false);
  };

  const loadMore = useCallback(() => {
    if (loading) return;
    setError(false);
    setLoading(true);
    const prevCount = visibleCount;
    // Simulate an async fetch so loading / error states are meaningful.
    window.setTimeout(() => {
      // Deterministic "failure" hook kept off by default; flip to simulate errors.
      const failed = false;
      if (failed) {
        setLoading(false);
        setError(true);
        return;
      }
      setVisibleCount((c) => c + PAGE_SIZE);
      setLoading(false);
      // Move focus to the first newly revealed card for keyboard users.
      requestAnimationFrame(() => {
        const cards = gridRef.current?.querySelectorAll<HTMLElement>("[data-opp-card]");
        cards?.[prevCount]?.focus();
      });
    }, 500);
  }, [loading, visibleCount]);


  return (
    <PageShell>
      <section className="border-b border-baba-blue/10 bg-baba-blue/5">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Grow With Us
          </span>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-baba-slate sm:text-5xl">
            Up &amp; Coming
          </h1>
          <p className="mt-4 max-w-2xl text-baba-slate/70">
            Upcoming trainings held every other month, masterclasses, and events you can
            sign up for across the BABA network.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Filter opportunities">
          {kinds.map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={filter === k}
              onClick={() => resetPaging(k)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === k
                  ? "bg-baba-blue text-baba-cream"
                  : "bg-secondary text-baba-slate/70 hover:bg-baba-blue/10"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <div
          ref={gridRef}
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy={loading}
        >
          {visible.map((o) => (
            <article
              key={o.id}
              className="baba-card-hover flex flex-col rounded-2xl border border-baba-blue/10 bg-card p-6"
            >
              <span className="inline-flex w-fit rounded-full bg-baba-copper/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-baba-copper-dark">
                {o.kind}
              </span>
              <Link
                to="/opportunities/$id"
                params={{ id: String(o.id) }}
                data-opp-card
                className="mt-4 rounded-sm font-display text-lg font-bold text-baba-slate outline-none hover:text-baba-blue focus-visible:ring-2 focus-visible:ring-baba-blue focus-visible:ring-offset-2"
              >
                {o.title}
              </Link>
              <p className="mt-1 text-sm font-semibold text-baba-blue">{o.org}</p>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-baba-slate/60">
                <MapPin className="h-3.5 w-3.5" /> {o.location}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-baba-slate/60">
                <Clock className="h-3.5 w-3.5" /> {o.meta}
              </p>
              <Link
                to="/opportunities/$id"
                params={{ id: String(o.id) }}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-baba-copper-dark hover:underline"
              >
                View details <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        <div aria-live="polite" className="mt-10 flex flex-col items-center gap-3">
          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertCircle className="h-4 w-4" /> Something went wrong loading more. Please try again.
            </p>
          )}
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              aria-busy={loading}
              className="inline-flex items-center gap-2 rounded-full border border-baba-blue/20 bg-white px-6 py-2.5 text-sm font-semibold text-baba-blue shadow-sm outline-none transition-colors hover:bg-baba-blue hover:text-white focus-visible:ring-2 focus-visible:ring-baba-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </>
              ) : error ? (
                <>
                  Try again <ChevronDown className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </section>
      {GateModal}
    </PageShell>
  );
}
