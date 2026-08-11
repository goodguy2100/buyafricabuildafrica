// Add is_important to notifications_sent + user_notifications
import fs from "fs";
const vault = fs.readFileSync("C:\\Users\\Admin\\OneDrive\\Desktop\\DocumentsOpenClawVault\\Agent-Shared\\credentials\\Supabase.md", "utf8");
const T = vault.match(/sbp_[a-f0-9]+/)[0];
const REF = "lwgxhverhtktotvowehg";

const SQL = `
ALTER TABLE public.notifications_sent ADD COLUMN IF NOT EXISTS is_important boolean NOT NULL DEFAULT false;
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS is_important boolean NOT NULL DEFAULT false;
`;

const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${T}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: SQL }),
  signal: AbortSignal.timeout(30000),
});
console.log("SQL status:", r.status);
console.log((await r.text()).slice(0, 500));
