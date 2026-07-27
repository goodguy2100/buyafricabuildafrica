import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";
import { listPublishedNews, type NewsArticle } from "@/lib/news.functions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NewsHomePreview() {
  const fn = useServerFn(listPublishedNews);
  const query = useQuery({
    queryKey: ["news", "home-preview"],
    queryFn: () => fn({ data: { limit: 3 } }),
  });

  const items = query.data ?? [];
  if (query.isLoading || items.length === 0) return null;

  return (
    <section className="bg-baba-cream py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
              <Newspaper className="h-4 w-4" /> From the News Desk
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
              What's shaping Africa's built environment
            </h2>
          </div>
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-baba-blue hover:underline"
          >
            All stories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div data-stack className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((a: NewsArticle) => (
            <Link
              key={a.id}
              to="/news/$slug"
              params={{ slug: a.slug }}
              className="baba-card-hover group flex flex-col overflow-hidden rounded-2xl border border-baba-blue/10 bg-white"
            >
              <div className="relative h-36 bg-gradient-to-br from-baba-blue via-baba-blue-dark to-baba-slate">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
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
                <h3 className="mt-2 font-display text-base font-bold text-baba-slate transition-colors group-hover:text-baba-blue">
                  {a.title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-baba-slate/70">
                  {a.summary}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-baba-blue">
                  Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
