// Apply username column migration via Supabase Management API SQL endpoint
import fs from "fs";
const vault = fs.readFileSync("C:\\Users\\Admin\\OneDrive\\Desktop\\DocumentsOpenClawVault\\Agent-Shared\\credentials\\Supabase.md", "utf8");
const T = vault.match(/sbp_[a-f0-9]+/)[0];
const REF = "lwgxhverhtktotvowehg";

const SQL = `
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS username text;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles (lower(username)) WHERE username IS NOT NULL;
`;

const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${T}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: SQL }),
  signal: AbortSignal.timeout(30000),
});
console.log("SQL status:", r.status);
console.log((await r.text()).slice(0, 500));
