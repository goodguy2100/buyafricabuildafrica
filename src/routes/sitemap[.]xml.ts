import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listPublishedNews } from "@/lib/news.functions";

const BASE_URL = "https://buyafricabuildafrica.org";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.8" },
          { path: "/pillars", changefreq: "monthly", priority: "0.8" },
          { path: "/directory", changefreq: "weekly", priority: "0.9" },
          { path: "/register", changefreq: "monthly", priority: "0.7" },
          { path: "/partners", changefreq: "monthly", priority: "0.7" },
          { path: "/opportunities", changefreq: "weekly", priority: "0.9" },
          { path: "/events", changefreq: "monthly", priority: "0.8" },
          { path: "/impact", changefreq: "monthly", priority: "0.7" },
          { path: "/news", changefreq: "weekly", priority: "0.8" },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        // Dynamic URLs: published news articles (the site's real content engine).
        const articleUrls: string[] = [];
        try {
          const articles = await listPublishedNews({ data: {} });
          for (const a of articles) {
            const lastmod = (a.updated_at || a.published_at || "").slice(0, 10);
            articleUrls.push(
              [
                `  <url>`,
                `    <loc>${BASE_URL}/news/${a.slug}</loc>`,
                lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
                `    <changefreq>weekly</changefreq>`,
                `    <priority>0.6</priority>`,
                `  </url>`,
              ]
                .filter(Boolean)
                .join("\n"),
            );
          }
        } catch (err) {
          // A data error must never break the sitemap.
          console.error("Sitemap: failed to load news articles", err);
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          ...articleUrls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
