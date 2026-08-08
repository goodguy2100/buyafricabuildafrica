// Post-build fix for Cloudflare Workers static assets (Windows + CI safe).
//
// Nitro generates `.output/public/_redirects` with `/* /index.html 200`,
// which Cloudflare's Workers Assets validator rejects as an infinite loop
// (code 100324). The correct SPA fallback for Workers is
// `not_found_handling: single-page-application` on the assets binding.
import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const redirects = resolve(root, ".output/public/_redirects");
const wranglerJson = resolve(root, ".output/server/wrangler.json");

let changed = false;

if (existsSync(redirects)) {
  const content = readFileSync(redirects, "utf8");
  if (content.includes("/index.html") || content.includes("/index ")) {
    rmSync(redirects);
    console.log("[postbuild] removed SPA _redirects (using not_found_handling instead)");
    changed = true;
  } else {
    console.log("[postbuild] _redirects left as-is (no SPA rule)");
  }
}

if (existsSync(wranglerJson)) {
  const cfg = JSON.parse(readFileSync(wranglerJson, "utf8"));
  // Pin compatibility_date to the current UTC date: wrangler otherwise bumps it
  // to the LOCAL date, which Cloudflare rejects as "in the future" when the
  // local timezone is ahead of UTC (code 10021).
  const utcToday = new Date().toISOString().slice(0, 10);
  if (cfg.compatibility_date !== utcToday) {
    cfg.compatibility_date = utcToday;
    console.log(`[postbuild] pinned compatibility_date to ${utcToday} (UTC)`);
    changed = true;
  }
  if (cfg.assets && cfg.assets.not_found_handling !== "single-page-application") {
    cfg.assets.not_found_handling = "single-page-application";
    console.log("[postbuild] set assets.not_found_handling = single-page-application");
    changed = true;
  }
  if (changed) writeFileSync(wranglerJson, JSON.stringify(cfg, null, 2));
}

if (!changed) console.log("[postbuild] nothing to fix");
