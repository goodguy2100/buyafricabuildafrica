import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Strip <script>/<style> and tags; collapse whitespace. Cheap, no deps.
function htmlToText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]{1,300})<\/title>/i);
  return m ? m[1].trim() : null;
}

export default defineTool({
  name: "fetch_url",
  title: "Fetch URL",
  description:
    "Fetch a public https URL and return its cleaned text content plus title. Useful when the bot has a source link and wants to read the page before drafting a news article. Only http(s) URLs are allowed; response is truncated to ~15k characters.",
  inputSchema: {
    url: z.string().url().describe("Absolute http(s) URL to fetch."),
    max_chars: z
      .number()
      .int()
      .min(500)
      .max(20000)
      .optional()
      .describe("Max characters of body text to return (default 15000)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ url, max_chars }, _ctx: ToolContext) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return { content: [{ type: "text", text: "Invalid URL." }], isError: true };
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return {
        content: [{ type: "text", text: "Only http(s) URLs are allowed." }],
        isError: true,
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(parsed.toString(), {
        method: "GET",
        headers: {
          "User-Agent": "BABA-MCP-Bot/1.0 (+https://buyafricabuildafrica.org)",
          Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
        },
        redirect: "follow",
        signal: controller.signal,
      });
      const contentType = res.headers.get("content-type") ?? "";
      const raw = await res.text();
      if (!res.ok) {
        return {
          content: [
            { type: "text", text: `HTTP ${res.status} fetching ${parsed.toString()}` },
          ],
          isError: true,
        };
      }

      const isHtml = contentType.includes("html") || /<\/?html/i.test(raw);
      const title = isHtml ? extractTitle(raw) : null;
      const text = isHtml ? htmlToText(raw) : raw.trim();
      const limit = max_chars ?? 15000;
      const truncated = text.length > limit;
      const body = truncated ? text.slice(0, limit) : text;

      const payload = {
        url: parsed.toString(),
        status: res.status,
        content_type: contentType,
        title,
        char_count: text.length,
        truncated,
        text: body,
      };
      return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Fetch failed: ${msg}` }], isError: true };
    } finally {
      clearTimeout(timer);
    }
  },
});
