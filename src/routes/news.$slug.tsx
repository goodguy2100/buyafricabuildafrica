import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Calendar, Loader2, Newspaper, Tag } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { getArticleBySlug } from "@/lib/news.functions";

export const Route = createFileRoute("/news/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} | BABA News` },
      {
        name: "description",
        content: "Read the full story on the BABA News Desk.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticlePage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ArticlePage() {
  const { slug } = Route.useParams();
  const fn = useServerFn(getArticleBySlug);
  const query = useQuery({
    queryKey: ["news", "article", slug],
    queryFn: () => fn({ data: { slug } }),
  });

  if (query.isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-baba-blue" />
        </div>
      </PageShell>
    );
  }

  if (!query.data) {
    return (
      <PageShell>
        <section className="mx-auto max-w-2xl px-5 py-24 text-center">
          <Newspaper className="mx-auto h-10 w-10 text-baba-copper" />
          <h1 className="mt-4 font-display text-3xl font-extrabold text-baba-blue">
            Article not found
          </h1>
          <p className="mt-2 text-baba-slate/70">
            This story may have been unpublished or the link is out of date.
          </p>
          <Link
            to="/news"
            className="mt-6 inline-flex items-center gap-2 rounded-xl baba-cta px-6 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to news
          </Link>
        </section>
      </PageShell>
    );
  }

  const a = query.data;
  const paragraphs = a.body.split(/\n{2,}/g).map((p) => p.trim()).filter(Boolean);

  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-sm font-semibold text-baba-blue hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> All stories
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-baba-slate/60">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(a.published_at)}
          </span>
          {a.topic && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-baba-blue/10 px-2.5 py-1 font-semibold text-baba-blue">
              <Tag className="h-3 w-3" /> {a.topic}
            </span>
          )}
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold text-baba-slate sm:text-4xl">
          {a.title}
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-baba-slate/80">{a.summary}</p>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-baba-slate/85">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {(a.source_url || a.source_name) && (
          <div className="mt-10 rounded-xl border border-baba-blue/10 bg-baba-cream/40 p-5 text-sm text-baba-slate/70">
            Source: {a.source_url ? (
              <a
                href={a.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-baba-blue hover:underline"
              >
                {a.source_name ?? a.source_url}
              </a>
            ) : (
              <span className="font-semibold">{a.source_name}</span>
            )}
          </div>
        )}
      </article>
    </PageShell>
  );
}
