import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_news",
  title: "List news articles",
  description: "List published BABA news articles, newest first.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Max articles (default 10)."),
    search: z.string().optional().describe("Optional text match on title or summary."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, search }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("news_articles")
      .select("id, slug, title, summary, topic, published_at, hero_image_url")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(limit ?? 10);
    if (search?.trim()) {
      const q = search.trim();
      query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
    }
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
