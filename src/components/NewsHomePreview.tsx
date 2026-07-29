import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Calendar, Newspaper, Sparkles } from "lucide-react";
import { listPublishedNews, type NewsArticle } from "@/lib/news.functions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isNew(iso: string) {
  const d = new Date(iso).getTime();
  return Date.now() - d < 7 * 24 * 60 * 60 * 1000;
}

const topicPalette: Record<string, string> = {
  events: "bg-baba-copper/15 text-baba-copper-dark",
  partnerships: "bg-baba-blue/15 text-baba-blue",
  training: "bg-emerald-500/15 text-emerald-700",
  announcements: "bg-amber-500/15 text-amber-700",
};

function topicClass(topic?: string | null) {
  if (!topic) return "bg-baba-slate/10 text-baba-slate";
  return topicPalette[topic.toLowerCase()] ?? "bg-baba-blue/10 text-baba-blue";
}

export function NewsHomePreview() {
  const fn = useServerFn(listPublishedNews);
  const query = useQuery({
    queryKey: ["news", "home-preview"],
    queryFn: () => fn({ data: { limit: 6 } }),
  });

  const items = query.data ?? [];
  const showSkeletons = query.isLoading || (query.isFetching && items.length === 0);
  if (!query.isLoading && !query.isFetching && items.length === 0 && !query.isError) return null;

  return (
    <section className="bg-baba-cream py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
              <Newspaper className="h-4 w-4 shrink-0" /> From the News Desk
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
              What's shaping Africa's built environment
            </h2>
          </div>
          <Link
            to="/news"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border-2 border-baba-blue px-5 py-2.5 text-sm font-semibold text-baba-blue transition-colors hover:bg-baba-blue hover:text-white sm:inline-flex"
          >
            View All News <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div data-stack className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {showSkeletons &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="flex flex-col overflow-hidden rounded-2xl border border-baba-blue/10 bg-white shadow-sm"
              >
                <div className="h-44 animate-pulse bg-baba-blue/10" />
                <div className="space-y-3 p-6">
                  <div className="h-3 w-24 animate-pulse rounded bg-baba-blue/10" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-baba-blue/10" />
                  <div className="h-4 w-full animate-pulse rounded bg-baba-blue/5" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-baba-blue/5" />
                </div>
              </div>
            ))}
          {!showSkeletons && items.map((a: NewsArticle) => (
            <Link
              key={a.id}
              to="/news/$slug"
              params={{ slug: a.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-baba-blue/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-baba-blue/10"
            >
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-baba-blue via-baba-blue-dark to-baba-slate">
                {a.hero_image_url ? (
                  <img
                    src={a.hero_image_url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_55%)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Newspaper className="h-14 w-14 text-white/25" />
                    </div>
                  </>
                )}
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  {a.topic && (
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur ${topicClass(a.topic)}`}
                    >
                      {a.topic}
                    </span>
                  )}
                  {isNew(a.published_at) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-baba-copper px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow">
                      <Sparkles className="h-3 w-3" /> New
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2 text-xs text-baba-slate/60">
                  <Calendar className="h-3.5 w-3.5" /> {formatDate(a.published_at)}
                </div>
                <h3 className="mt-2 font-display text-lg font-bold leading-snug text-baba-slate transition-colors group-hover:text-baba-blue">
                  {a.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-baba-slate/70">
                  {a.summary}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-baba-blue">
                  Read more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex justify-center sm:hidden">
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-baba-blue px-6 py-3 text-sm font-semibold text-baba-blue transition-colors hover:bg-baba-blue hover:text-white"
          >
            View All News <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
