// Fetch both live auth pages, extract JS bundle, search for wizard vs old markers
const urls = [
  "https://buyafricabuildafrica.org/auth",
  "https://goodguy2100-buyafricabuildafrica.buyafricabuildafrica26.workers.dev/auth",
];
(async () => {
  for (const u of urls) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(15000) });
      const t = await r.text();
      const m = t.match(/src="(\/assets\/[^"]*\.js)"/);
      let bundle = "none";
      let hasWizard = false, hasCombobox = false, hasRecovery = false;
      if (m) {
        const br = await fetch(new URL(m[1], u).href, { signal: AbortSignal.timeout(20000) });
        bundle = await br.text();
        hasWizard = bundle.includes("Make your password");
        hasCombobox = bundle.includes("Select") && bundle.includes("what do you do");
        hasRecovery = bundle.includes("lookupLoginEmail") || bundle.includes("login-lookup");
      }
      console.log("=== " + u);
      console.log("  bundle:", m ? m[1] : "none", "| size:", (bundle.length / 1024).toFixed(0) + "KB");
      console.log("  wizard('Make your password'):", hasWizard, "| old combobox:", hasCombobox, "| recovery bridge:", hasRecovery);
    } catch (e) { console.log("=== " + u, "ERR", e.message); }
  }
})();
