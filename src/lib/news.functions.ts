import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  topic: string | null;
  source_url: string | null;
  source_name: string | null;
  hero_image_url: string | null;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { supabase, userId } = context;
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required");
  return { supabase, userId };
}

// --------------------------------------------------------------------------
// PUBLIC READS — use publishable client so pages work without a session
// --------------------------------------------------------------------------

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input: any, init: any) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listPublishedNews = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(50).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<NewsArticle[]> => {
    const supabase = publicClient();
    const q = supabase
      .from("news_articles")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (data.limit) q.limit(data.limit);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as NewsArticle[];
  });

export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }): Promise<NewsArticle | null> => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("news_articles")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row ?? null) as NewsArticle | null;
  });

// --------------------------------------------------------------------------
// ADMIN
// --------------------------------------------------------------------------

export const listAllNews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NewsArticle[]> => {
    const { supabase } = await assertAdmin(context);
    const { data, error } = await supabase
      .from("news_articles")
      .select("*")
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as NewsArticle[];
  });

const upsertInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, hyphens only"),
  summary: z.string().min(1).max(600),
  body: z.string().min(1).max(20000),
  topic: z.string().max(120).optional().nullable(),
  source_url: z.string().url().max(500).optional().nullable().or(z.literal("")),
  source_name: z.string().max(200).optional().nullable(),
  hero_image_url: z.string().max(600).optional().nullable(),
  published: z.boolean().default(true),
});

export const upsertNewsArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => upsertInput.parse(input))
  .handler(async ({ data, context }): Promise<NewsArticle> => {
    const { supabase } = await assertAdmin(context);
    const payload = {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      body: data.body,
      topic: data.topic || null,
      source_url: data.source_url || null,
      source_name: data.source_name || null,
      hero_image_url: data.hero_image_url || null,
      published: data.published,
    };
    if (data.id) {
      const { data: row, error } = await supabase
        .from("news_articles")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return row as NewsArticle;
    }
    const { data: row, error } = await supabase
      .from("news_articles")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as NewsArticle;
  });

export const deleteNewsArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = await assertAdmin(context);
    const { error } = await supabase.from("news_articles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { deleted: true };
  });

// --------------------------------------------------------------------------
// AI GENERATION — Lovable AI Gateway (openai/gpt-5.5)
// --------------------------------------------------------------------------

const TOPICS = [
  "Rural-to-urban migration and the built environment",
  "Skilled artisan shortages in African cities",
  "Youth employment in construction and manufacturing",
  "Sustainable / green building in Africa",
  "Affordable housing delivery challenges",
  "Women in African trades and engineering",
  "Vocational (TVET) training gaps and reforms",
  "Local manufacturing and buying African-made materials",
  "Infrastructure investment across African cities",
  "Climate resilience in African urban planning",
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

async function generateArticlePayload(topic?: string): Promise<{
  title: string;
  slug: string;
  summary: string;
  body: string;
  topic: string;
}> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");

  const chosen = topic ?? TOPICS[Math.floor(Math.random() * TOPICS.length)];

  const system = `You are the editorial voice of Buy Africa Build Africa (BABA), a pan-African movement uniting professionals, artisans, businesses and institutions in the built environment. Write like a thoughtful newsroom: clear, grounded, non-partisan, no marketing fluff. Every article should tie the news topic back to what BABA does — training artisans, connecting professionals, promoting local manufacturing, sustainability, and dignified work — WITHOUT sounding like an ad.`;

  const user = `Write a short news-style article for the BABA website on this topic:

"${chosen}"

Return STRICT JSON with these fields:
- "title": punchy, 6-14 words, no clickbait
- "summary": one paragraph, max 40 words, plain prose
- "body": 3-5 short paragraphs separated by \\n\\n. Around 250-400 words total. No markdown headings, no bullet lists — just paragraphs.
- "topic": short 1-3 word tag like "Artisans", "Sustainability", "Jobs & Migration", "Housing", "Youth", "Manufacturing"

Return ONLY the JSON object. Do not include commentary.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: "openai/gpt-5.5",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("AI rate limit exceeded — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted — please top up in workspace settings.");
    throw new Error(`AI gateway error ${res.status}: ${body}`);
  }

  const json = await res.json();
  const raw = json?.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as {
    title?: string;
    summary?: string;
    body?: string;
    topic?: string;
  };

  const title = (parsed.title ?? "").trim();
  const summary = (parsed.summary ?? "").trim();
  const body = (parsed.body ?? "").trim();
  const topicOut = (parsed.topic ?? chosen).trim().slice(0, 60);

  if (!title || !summary || !body) throw new Error("AI returned an incomplete article.");

  return {
    title,
    slug: `${slugify(title)}-${Date.now().toString(36).slice(-4)}`,
    summary,
    body,
    topic: topicOut,
  };
}

export const generateAndSaveArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        topic: z.string().max(200).optional(),
        publishImmediately: z.boolean().default(false),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }): Promise<NewsArticle> => {
    const { supabase } = await assertAdmin(context);
    const draft = await generateArticlePayload(data.topic);
    const { data: row, error } = await supabase
      .from("news_articles")
      .insert({
        slug: draft.slug,
        title: draft.title,
        summary: draft.summary,
        body: draft.body,
        topic: draft.topic,
        source_name: "AI-assisted (BABA editorial)",
        published: data.publishImmediately,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as NewsArticle;
  });

/**
 * Internal helper used by the cron/webhook route. Not exposed as a server fn.
 */
export async function generateAndSaveArticleAsCron(topic?: string): Promise<NewsArticle> {
  const draft = await generateArticlePayload(topic);
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: row, error } = await supabase
    .from("news_articles")
    .insert({
      slug: draft.slug,
      title: draft.title,
      summary: draft.summary,
      body: draft.body,
      topic: draft.topic,
      source_name: "AI-assisted (cron)",
      published: true,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return row as NewsArticle;
}

// --------------------------------------------------------------------------
// FETCH METADATA from an external news URL (Open Graph / Twitter cards)
// --------------------------------------------------------------------------

function pickMeta(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

export const fetchArticleMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ url: z.string().url() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const res = await fetch(data.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BABA-NewsBot/1.0; +https://buyafricabuildafrica.org)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const html = (await res.text()).slice(0, 500_000);

    const attr = (prop: string, kind: "property" | "name" = "property") =>
      new RegExp(
        `<meta[^>]+${kind}=["']${prop}["'][^>]*content=["']([^"']+)["']`,
        "i",
      );
    const attrRev = (prop: string, kind: "property" | "name" = "property") =>
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]*${kind}=["']${prop}["']`,
        "i",
      );

    const title =
      pickMeta(html, [attr("og:title"), attrRev("og:title"), attr("twitter:title", "name"), /<title>([^<]+)<\/title>/i]) ??
      "";
    const summary =
      pickMeta(html, [
        attr("og:description"),
        attrRev("og:description"),
        attr("description", "name"),
        attr("twitter:description", "name"),
      ]) ?? "";
    const image =
      pickMeta(html, [attr("og:image"), attrRev("og:image"), attr("twitter:image", "name")]) ??
      "";
    const site =
      pickMeta(html, [attr("og:site_name"), attr("application-name", "name")]) ?? "";

    let imageAbs = image;
    if (image && !/^https?:\/\//i.test(image)) {
      try {
        imageAbs = new URL(image, data.url).toString();
      } catch {
        imageAbs = "";
      }
    }

    return {
      title: decodeEntities(title).slice(0, 300),
      summary: decodeEntities(summary).slice(0, 600),
      hero_image_url: imageAbs,
      source_name: decodeEntities(site).slice(0, 200) || new URL(data.url).hostname,
      source_url: data.url,
    };
  });
