// Migration: is_online + online_url on opportunities
import fs from "fs";
const vault = fs.readFileSync("C:\\Users\\Admin\\OneDrive\\Desktop\\DocumentsOpenClawVault\\Agent-Shared\\credentials\\Supabase.md", "utf8");
const ref = vault.match(/https:\/\/[a-z0-9]+\.supabase\.co/)[0].match(/[a-z0-9]+\.supabase\.co/)[0].split(".")[0];
const pat = vault.match(/sbp_[a-f0-9]+/)[0];
const sql = `
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS online_url text;
`;
const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});
console.log("status:", r.status);
console.log("body:", (await r.text()).slice(0, 500));
