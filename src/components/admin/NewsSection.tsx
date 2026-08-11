import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Trash2, Eye, EyeOff, RefreshCw, ExternalLink, Link2, Plus } from "lucide-react";
import {
  listAllNews,
  generateAndSaveArticle,
  upsertNewsArticle,
  deleteNewsArticle,
  fetchArticleMeta,
  type NewsArticle,
} from "@/lib/news.functions";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function NewsSection() {
  const listFn = useServerFn(listAllNews);
  const genFn = useServerFn(generateAndSaveArticle);
  const saveFn = useServerFn(upsertNewsArticle);
  const delFn = useServerFn(deleteNewsArticle);
  const metaFn = useServerFn(fetchArticleMeta);
  const qc = useQueryClient();

  // Manual "add from link" form state
  const [form, setForm] = useState({
    source_url: "",
    title: "",
    summary: "",
    body: "",
    topic: "",
    source_name: "",
    hero_image_url: "",
    published: true,
  });
  const [manualError, setManualError] = useState<string | null>(null);

  const setF = (k: keyof typeof form, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v as never }));

  const fetchMeta = useMutation({
    mutationFn: async () => metaFn({ data: { url: form.source_url } }),
    onSuccess: (m) => {
      setForm((prev) => ({
        ...prev,
        title: prev.title || m.title,
        summary: prev.summary || m.summary,
        hero_image_url: prev.hero_image_url || m.hero_image_url,
        source_name: prev.source_name || m.source_name,
        body: prev.body || m.summary, // seed body with summary, admin can expand
      }));
      setManualError(null);
    },
    onError: (e: Error) => setManualError(e.message),
  });

  const addManual = useMutation({
    mutationFn: async () =>
      saveFn({
        data: {
          title: form.title,
          slug: `${slugify(form.title)}-${Date.now().toString(36).slice(-4)}`,
          summary: form.summary,
          body: form.body || form.summary,
          topic: form.topic || undefined,
          source_url: form.source_url || undefined,
          source_name: form.source_name || undefined,
          hero_image_url: form.hero_image_url || undefined,
          published: form.published,
        },
      }),
    onSuccess: () => {
      setForm({
        source_url: "",
        title: "",
        summary: "",
        body: "",
        topic: "",
        source_name: "",
        hero_image_url: "",
        published: true,
      });
      setManualError(null);
      qc.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (e: Error) => setManualError(e.message),
  });

  const listQ = useQuery({ queryKey: ["news", "admin"], queryFn: () => listFn() });

  const [topic, setTopic] = useState("");
  const [publishNow, setPublishNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useMutation({
    mutationFn: async () =>
      genFn({ data: { topic: topic || undefined, publishImmediately: publishNow } }),
    onSuccess: () => {
      setTopic("");
      setError(null);
      qc.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async (a: NewsArticle) =>
      saveFn({
        data: {
          id: a.id,
          title: a.title,
          slug: a.slug,
          summary: a.summary,
          body: a.body,
          topic: a.topic ?? undefined,
          source_url: a.source_url ?? undefined,
          source_name: a.source_name ?? undefined,
          hero_image_url: a.hero_image_url ?? undefined,
          published: !a.published,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news"] }),
  });

  const rows = useMemo(() => listQ.data ?? [], [listQ.data]);

  return (
    <div className="space-y-8">
      {/* Generator */}
      <div className="rounded-2xl border border-baba-blue/10 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-baba-copper" />
          <h2 className="font-display text-lg font-bold text-baba-blue">Generate an article</h2>
        </div>
        <p className="mt-1 text-sm text-baba-slate/60">
          Draft a BABA-aligned news article with AI. Leave the topic blank to pick one automatically.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="text"
            placeholder="Topic (optional) — e.g. 'Skilled artisan shortages in Nairobi'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="rounded-lg border border-baba-blue/20 bg-white px-3 py-2 text-sm outline-none focus:border-baba-blue"
          />
          <label className="inline-flex items-center gap-2 text-sm text-baba-slate/70">
            <input
              type="checkbox"
              checked={publishNow}
              onChange={(e) => setPublishNow(e.target.checked)}
            />
            Publish immediately
          </label>
          <button
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="inline-flex items-center gap-2 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {generate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generate.isPending ? "Drafting…" : "Draft with AI"}
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-4 rounded-lg border border-dashed border-baba-blue/20 bg-baba-cream/40 p-3 text-xs text-baba-slate/70">
          <b>Automate it:</b> a cron job can POST to{" "}
          <code className="rounded bg-white px-1 py-0.5">/api/public/news-generate</code> with the{" "}
          <code>x-cron-secret</code> header (value stored server-side as{" "}
          <code>CRON_SECRET</code>). Optional JSON body: <code>{"{ topic }"}</code>.
        </div>
      </div>

      {/* Add from link */}
      <div className="rounded-2xl border border-baba-blue/10 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-baba-blue" />
          <h2 className="font-display text-lg font-bold text-baba-blue">Add from a link</h2>
        </div>
        <p className="mt-1 text-sm text-baba-slate/60">
          Paste any news article URL. We'll auto-fill the title, summary, image and source — edit anything before publishing.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="url"
            placeholder="https://www.bbc.com/news/…"
            value={form.source_url}
            onChange={(e) => setF("source_url", e.target.value)}
            className="rounded-lg border border-baba-blue/20 bg-white px-3 py-2 text-sm outline-none focus:border-baba-blue"
          />
          <button
            onClick={() => fetchMeta.mutate()}
            disabled={!form.source_url || fetchMeta.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-baba-blue px-4 py-2 text-sm font-semibold text-baba-blue hover:bg-baba-blue hover:text-white disabled:opacity-60"
          >
            {fetchMeta.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Fetch metadata
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setF("title", e.target.value)}
            className="rounded-lg border border-baba-blue/20 bg-white px-3 py-2 text-sm outline-none focus:border-baba-blue"
          />
          <input
            type="text"
            placeholder="Topic (e.g. Housing)"
            value={form.topic}
            onChange={(e) => setF("topic", e.target.value)}
            className="rounded-lg border border-baba-blue/20 bg-white px-3 py-2 text-sm outline-none focus:border-baba-blue"
          />
          <input
            type="url"
            placeholder="Hero image URL (https://…)"
            value={form.hero_image_url}
            onChange={(e) => setF("hero_image_url", e.target.value)}
            className="rounded-lg border border-baba-blue/20 bg-white px-3 py-2 text-sm outline-none focus:border-baba-blue sm:col-span-2"
          />
          {form.hero_image_url && (
            <img
              src={form.hero_image_url}
              alt=""
              className="h-40 w-full rounded-lg border border-baba-blue/10 object-cover sm:col-span-2"
              onError={(e) => ((e.currentTarget.style.display = "none"))}
            />
          )}
          <input
            type="text"
            placeholder="Source name (e.g. BBC News)"
            value={form.source_name}
            onChange={(e) => setF("source_name", e.target.value)}
            className="rounded-lg border border-baba-blue/20 bg-white px-3 py-2 text-sm outline-none focus:border-baba-blue sm:col-span-2"
          />
          <textarea
            placeholder="Summary (one paragraph shown in cards)"
            value={form.summary}
            onChange={(e) => setF("summary", e.target.value)}
            rows={3}
            className="rounded-lg border border-baba-blue/20 bg-white px-3 py-2 text-sm outline-none focus:border-baba-blue sm:col-span-2"
          />
          <textarea
            placeholder="Body (full article — paragraphs separated by blank lines)"
            value={form.body}
            onChange={(e) => setF("body", e.target.value)}
            rows={8}
            className="rounded-lg border border-baba-blue/20 bg-white px-3 py-2 text-sm outline-none focus:border-baba-blue sm:col-span-2"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-baba-slate/70">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setF("published", e.target.checked)}
            />
            Publish immediately
          </label>
          <button
            onClick={() => addManual.mutate()}
            disabled={!form.title || !form.summary || addManual.isPending}
            className="inline-flex items-center gap-2 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {addManual.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Save article
          </button>
        </div>

        {manualError && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{manualError}</p>
        )}
      </div>


      {/* List */}
      <div className="rounded-2xl border border-baba-blue/10 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-baba-blue">All articles</h2>
          <button
            onClick={() => listQ.refetch()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-baba-blue/70 hover:text-baba-blue"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {listQ.isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-baba-blue" />
          </div>
        )}

        {rows.length === 0 && !listQ.isLoading && (
          <p className="mt-4 text-sm text-baba-slate/60">No articles yet.</p>
        )}

        <div className="mt-4 divide-y divide-baba-blue/10">
          {rows.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-semibold ${
                      a.published
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {a.published ? "Published" : "Draft"}
                  </span>
                  {a.topic && (
                    <span className="rounded-full bg-baba-blue/10 px-2 py-0.5 text-baba-blue">
                      {a.topic}
                    </span>
                  )}
                  <span className="text-baba-slate/50">
                    {new Date(a.published_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="mt-1 truncate font-semibold text-baba-slate">{a.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-baba-slate/70">{a.summary}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={`/news/${a.slug}`}
                  title="Open on site"
                  className="rounded-md p-2 text-baba-slate/60 hover:bg-baba-blue/5 hover:text-baba-blue"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => togglePublish.mutate(a)}
                  disabled={togglePublish.isPending}
                  title={a.published ? "Unpublish" : "Publish"}
                  className="rounded-md p-2 text-baba-slate/60 hover:bg-baba-blue/5 hover:text-baba-blue"
                >
                  {a.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${a.title}"?`)) remove.mutate(a.id);
                  }}
                  title="Delete"
                  className="rounded-md p-2 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
