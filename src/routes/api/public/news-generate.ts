import { createFileRoute } from "@tanstack/react-router";
import { generateAndSaveArticleAsCron } from "@/lib/news.functions";

/**
 * Webhook endpoint for a cron job or external scheduler to trigger AI-generated
 * news articles. Callers must supply the CRON_SECRET (set as a server env var)
 * in either an `x-cron-secret` header or `?secret=` query param.
 *
 * Example:
 *   curl -X POST \
 *     "https://project--<project-id>.lovable.app/api/public/news-generate" \
 *     -H "x-cron-secret: <CRON_SECRET>" \
 *     -H "Content-Type: application/json" \
 *     -d '{"topic":"Rural-to-urban migration"}'
 */
export const Route = createFileRoute("/api/public/news-generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (!secret) {
          return new Response("Server missing CRON_SECRET", { status: 500 });
        }

        const url = new URL(request.url);
        const provided =
          request.headers.get("x-cron-secret") ?? url.searchParams.get("secret") ?? "";
        // Constant-time-ish compare
        if (
          provided.length !== secret.length ||
          !provided.split("").every((c, i) => c === secret[i])
        ) {
          return new Response("Unauthorized", { status: 401 });
        }

        let topic: string | undefined;
        try {
          const body = await request.json().catch(() => null);
          if (body && typeof body.topic === "string") topic = body.topic.slice(0, 200);
        } catch {
          /* ignore */
        }

        try {
          const article = await generateAndSaveArticleAsCron(topic);
          return Response.json({
            ok: true,
            article: { id: article.id, slug: article.slug, title: article.title },
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          console.error("news-generate failed:", msg);
          return Response.json({ ok: false, error: msg }, { status: 500 });
        }
      },
      GET: async () =>
        Response.json({
          ok: true,
          hint: "POST with x-cron-secret header (or ?secret=). Optional JSON body: { topic }.",
        }),
    },
  },
});
