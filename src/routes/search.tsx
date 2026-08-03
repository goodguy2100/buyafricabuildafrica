import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Search Buy Africa Build Africa — find news, opportunities, events, members and resources across the BABA ecosystem.",
      },
      { property: "og:title", content: "Search BABA" },
      { property: "og:url", content: "https://buyafricabuildafrica.org/search" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://buyafricabuildafrica.org/search" }],
  }),
  component: SearchPage,
});

const CSE_CX = "c6698f549a2c84f6f";

type CseElement = { render: (options: object) => void };

function getCseElement(): CseElement | undefined {
  const w = window as unknown as {
    google?: { search?: { cse?: { element?: CseElement } } };
  };
  return w.google?.search?.cse?.element;
}

function SearchPage() {
  useEffect(() => {
    const w = window as unknown as { __gcse?: { callback?: () => void } };

    const render = () => {
      const el = getCseElement();
      if (!el) return;
      try {
        el.render({ div: "gcse-searchbox", tag: "searchbox-only", gname: "baba" });
        el.render({ div: "gcse-results", tag: "results", gname: "baba" });
      } catch {
        // Elements already rendered — nothing to do.
      }
    };

    // The CSE script calls this callback once it is ready.
    w.__gcse = { callback: render };

    if (document.querySelector('script[src*="cse.js"]')) {
      render();
    } else {
      const s = document.createElement("script");
      s.src = `https://cse.google.com/cse.js?cx=${CSE_CX}`;
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-gradient-to-br from-baba-blue via-baba-blue-dark to-baba-slate py-20">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-baba-copper/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Search className="h-4 w-4" /> Site Search
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold text-white sm:text-5xl">
            Find it on BABA.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Search news, opportunities, events, members and resources across the platform.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
        <div id="gcse-searchbox" />
        <div id="gcse-results" className="mt-8" />
      </section>
    </PageShell>
  );
}
