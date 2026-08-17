// Inspect opportunity_applications + registrations columns for the signup feature
import fs from "fs";
const vault = fs.readFileSync("C:\\Users\\Admin\\OneDrive\\Desktop\\DocumentsOpenClawVault\\Agent-Shared\\credentials\\Supabase.md", "utf8");
const T = vault.match(/sbp_[a-f0-9]+/)[0];
const REF = "lwgxhverhtktotvowehg";
const SQL = `
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name IN ('opportunity_applications','registrations','opportunities')
ORDER BY table_name, ordinal_position;
`;
const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${T}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: SQL }),
});
console.log("status:", r.status);
const rows = await r.json();
if (Array.isArray(rows)) {
  const groups = {};
  for (const row of rows) {
    (groups[row.table_name] ??= []).push(`${row.column_name}:${row.data_type}${row.is_nullable === "YES" ? "?" : ""}`);
  }
  for (const [t, cols] of Object.entries(groups)) console.log(`\n${t}:\n  ${cols.join("\n  ")}`);
} else {
  console.log(JSON.stringify(rows).slice(0, 400));
}
