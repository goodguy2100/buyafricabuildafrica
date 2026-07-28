import { createFileRoute } from "@tanstack/react-router";
import mcp from "@/lib/mcp/index";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/mcp-health")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${request.headers.get("x-forwarded-host") ?? url.host}`;
        // Access tool metadata from the mcp definition (defineMcp exposes tools array).
        // Fall back gracefully if internal shape changes.
        const anyMcp = mcp as unknown as { tools?: Array<{ name: string; title?: string; description?: string }> };
        const tools = (anyMcp.tools ?? []).map((t) => ({
          name: t.name,
          title: t.title,
          description: t.description,
        }));
        const body = {
          status: "ok",
          server: "baba-mcp",
          mcp_endpoint: `${origin}/mcp`,
          oauth_metadata: `${origin}/.well-known/oauth-protected-resource`,
          auth: "oauth",
          transport: "streamable-http",
          tool_count: tools.length,
          tools,
          timestamp: new Date().toISOString(),
        };
        return new Response(JSON.stringify(body, null, 2), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      },
    },
  },
});
