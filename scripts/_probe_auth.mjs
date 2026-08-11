// Print the full auth settings JSON (mailer_autoconfirm etc.)
import fs from "fs";
const env = fs.readFileSync("C:\\Users\\Admin\\.openclaw\\workspace\\buyafricabuildafrica\\.env", "utf8");
function get(k) { const m = env.match(new RegExp("^" + k + "\\s*=\\s*\"?([^\"]*)\"?$", "m")); return m ? m[1].trim() : ""; }
const URL = get("SUPABASE_URL").replace(/["']/g, "");
const PUB = get("SUPABASE_PUBLISHABLE_KEY").replace(/["']/g, "");
(async () => {
  const r = await fetch(URL + "/auth/v1/settings", { headers: { apikey: PUB, Authorization: "Bearer " + PUB } });
  console.log(JSON.stringify(await r.json(), null, 1));
})();
