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

/** Reject loopback, private, link-local and cloud-metadata targets (SSRF guard). */
function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) return true;
  if (host === "metadata.google.internal") return true;

  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // link-local + cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast / reserved
    return false;
  }

  if (host.includes(":")) {
    // IPv6: block loopback, unique-local (fc00::/7) and link-local (fe80::/10)
    if (host === "::1" || host === "::") return true;
    if (/^f[cd]/.test(host)) return true;
    if (/^fe[89ab]/.test(host)) return true;
    if (host.startsWith("::ffff:")) return isBlockedHost(host.slice(7));
  }
  return false;
}

/** Follow redirects manually so every hop is re-checked against the deny-list. */
async function safeFetch(start: URL, signal: AbortSignal): Promise<Response> {
  let current = start;
  for (let hop = 0; hop < 5; hop++) {
    if (isBlockedHost(current.hostname)) {
      throw new Error("Blocked: internal or private network addresses are not allowed.");
    }
    const res = await fetch(current.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "BABA-MCP-Bot/1.0 (+https://buyafricabuildafrica.org)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
      },
      redirect: "manual",
      signal,
    });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      const next = new URL(location, current);
      if (next.protocol !== "https:" && next.protocol !== "http:") {
        throw new Error("Blocked: redirect to a non-http(s) URL.");
      }
      current = next;
      continue;
    }
    return res;
  }
  throw new Error("Too many redirects.");
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
