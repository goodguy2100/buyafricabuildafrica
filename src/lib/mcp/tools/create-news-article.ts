import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export default defineTool({
  name: "create_news_article",
  title: "Create news article",
  description:
    "Create a BABA news article. Admin-only. The bot writes the article (title, summary, body, topic, optional source) and posts it into the site. Set `publish` to true to publish immediately, false to save as a draft for admin review.",
  inputSchema: {
    title: z.string().trim().min(6).max(300).describe("Headline, 6-14 words."),
    summary: z
      .string()
      .trim()
      .min(20)
      .max(600)
      .describe("One-paragraph summary, plain prose, max ~40 words."),
    body: z
      .string()
      .trim()
      .min(200)
      .max(20000)
      .describe(
        "Article body: 3-5 short paragraphs separated by \\n\\n. No markdown headings or bullet lists.",
      ),
    topic: z
      .string()
      .trim()
      .max(60)
      .optional()
      .describe("Short tag e.g. 'Artisans', 'Sustainability', 'Housing'."),
    source_url: z.string().url().max(500).optional().describe("Primary source URL, if any."),
    source_name: z.string().max(200).optional().describe("Human-readable source name."),
    hero_image_url: z
      .string()
      .url()
      .max(600)
      .optional()
      .describe("Absolute https URL for the hero image."),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, hyphens only")
      .max(80)
      .optional()
      .describe("Optional custom slug; auto-generated from the title if omitted."),
    publish: z
      .boolean()
      .optional()
      .describe("True = publish now (default), false = save as draft."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    // Admin gate — only admins can post news.
    const { data: role, error: roleErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId!)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) {
      return { content: [{ type: "text", text: roleErr.message }], isError: true };
    }
    if (!role) {
      return {
        content: [
          {
            type: "text",
            text: "Forbidden: only BABA admins can create news articles via MCP.",
          },
        ],
        isError: true,
      };
    }

    const baseSlug = input.slug ?? slugify(input.title);
    if (!baseSlug) {
      return { content: [{ type: "text", text: "Could not derive slug from title." }], isError: true };
    }
    const slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

    const publish = input.publish ?? true;

    const { data, error } = await supabase
      .from("news_articles")
      .insert({
        slug,
        title: input.title,
        summary: input.summary,
        body: input.body,
        topic: input.topic ?? null,
        source_url: input.source_url ?? null,
        source_name: input.source_name ?? "MCP bot",
        hero_image_url: input.hero_image_url ?? null,
        published: publish,
      })
      .select("id, slug, title, published, published_at")
      .single();

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const url = `/news/${data.slug}`;
    const summary = publish
      ? `Published "${data.title}" at ${url}.`
      : `Draft saved: "${data.title}". Visible to admins at ${url} once published.`;

    return {
      content: [{ type: "text", text: summary }],
      structuredContent: { article: data, url, published: publish },
    };
  },
});
