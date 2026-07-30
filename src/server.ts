import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Hashed build output is immutable; everything else gets a short shared cache
// so repeat visits and CDN edges avoid re-fetching unchanged bytes.
const IMMUTABLE_PATH = /^\/(?:_build|assets|_serverFn)?\/?.*\.[0-9a-zA-Z_-]{8,}\.(?:js|css|woff2?|png|jpe?g|webp|avif|svg|mp4)$/;
const STATIC_EXT = /\.(?:js|css|woff2?|png|jpe?g|webp|avif|svg|ico|mp4|txt)$/;

function withCacheHeaders(request: Request, response: Response): Response {
  if (request.method !== "GET" || response.status !== 200) return response;
  if (response.headers.has("cache-control")) return response;

  const { pathname } = new URL(request.url);
  let value: string | null = null;
  if (IMMUTABLE_PATH.test(pathname)) {
    value = "public, max-age=31536000, immutable";
  } else if (STATIC_EXT.test(pathname)) {
    value = "public, max-age=3600, stale-while-revalidate=86400";
  } else if ((response.headers.get("content-type") ?? "").includes("text/html")) {
    value = "public, max-age=0, s-maxage=300, stale-while-revalidate=86400";
  }
  if (!value) return response;

  const headers = new Headers(response.headers);
  headers.set("cache-control", value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withCacheHeaders(request, await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
