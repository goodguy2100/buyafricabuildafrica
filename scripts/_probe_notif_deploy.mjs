// Probe live dashboard bundle for notifications-feature markers
const urls = [
  "https://buyafricabuildafrica.org/dashboard",
  "https://goodguy2100-buyafricabuildafrica.buyafricabuildafrica26.workers.dev/dashboard",
];
(async () => {
  for (const u of urls) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(15000) });
      const t = await r.text();
      const m = t.match(/src="(\/assets\/[^"]*\.js)"/);
      let bundle = "none";
      let unread = false, important = false, redBadge = false;
      if (m) {
        const br = await fetch(new URL(m[1], u).href, { signal: AbortSignal.timeout(20000) });
        bundle = await br.text();
        unread = bundle.includes("getUnreadNotificationCount") || bundle.includes("unread-notifications");
        important = bundle.includes("is_important");
        redBadge = bundle.includes("9+") || (bundle.includes("bg-red-600") && bundle.includes("min-w-5"));
      }
      console.log("=== " + u);
      console.log("  bundle:", m ? m[1] : "none", "| size:", (bundle.length / 1024).toFixed(0) + "KB");
      console.log("  unread-count fn:", unread, "| is_important:", important, "| red badge:", redBadge);
    } catch (e) { console.log("=== " + u, "ERR", e.message); }
  }
})();
