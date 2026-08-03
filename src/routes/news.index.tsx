import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Newspaper, ArrowRight, Calendar } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { listPublishedNews, type NewsArticle } from "@/lib/news.functions";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "News | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "News, analysis and editorial from BABA on Africa's built environment — artisans, professionals, jobs, migration and sustainability.",
      },
      { property: "og:title", content: "BABA News — Building Africa, one story at a time" },
      {
        property: "og:description",
        content:
          "News on Africa's built environment: artisans, professionals, jobs, migration and sustainability.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://buyafricabuildafrica.org/news" },
    ],
    links: [{ rel: "canonical", href: "https://buyafricabuildafrica.org/news" }],
  }),
  component: NewsIndex,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function NewsIndex() {
  const fn = useServerFn(listPublishedNews);
  const query = useQuery({
    queryKey: ["news", "published"],
    queryFn: () => fn({ data: {} }),
  });

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-gradient-to-br from-baba-blue via-baba-blue-dark to-baba-slate py-20">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-baba-copper/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Newspaper className="h-4 w-4" /> BABA News Desk
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold text-white sm:text-5xl">
            Stories shaping how Africa builds.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Editorial on jobs, migration, artisans, sustainability and the professionals building
            Africa's future.
          </p>
        </div>
      </section>

      <section className="bg-baba-cream py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          {query.isLoading && (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-baba-blue" />
            </div>
          )}

          {query.isError && (
            <div className="rounded-2xl border border-baba-copper/30 bg-white p-8 text-center">
              <p className="text-baba-slate/80">Couldn't load news right now. Please refresh.</p>
            </div>
          )}

          {query.data && query.data.length === 0 && (
            <div className="rounded-2xl border border-baba-blue/10 bg-white p-10 text-center">
              <Newspaper className="mx-auto h-8 w-8 text-baba-copper" />
              <p className="mt-3 text-baba-slate/80">No articles published yet. Check back soon.</p>
            </div>
          )}

          {query.data && query.data.length > 0 && (
            <div data-stack className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {query.data.map((a: NewsArticle) => (
                <article
                  key={a.id}
                  className="baba-card-hover flex flex-col overflow-hidden rounded-2xl border border-baba-blue/10 bg-white"
                >
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-baba-blue via-baba-blue-dark to-baba-slate">
                    {a.hero_image_url ? (
                      <img
                        src={a.hero_image_url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
                    )}
                    {a.topic && (
                      <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                        {a.topic}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-2 text-xs text-baba-slate/60">
                      <Calendar className="h-3.5 w-3.5" /> {formatDate(a.published_at)}
                    </div>
                    <h2 className="mt-3 font-display text-lg font-bold text-baba-slate">
                      {a.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-baba-slate/75">
                      {a.summary}
                    </p>
                    <Link
                      to="/news/$slug"
                      params={{ slug: a.slug }}
                      className="story-link mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-baba-blue"
                    >
                      Read the story <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
