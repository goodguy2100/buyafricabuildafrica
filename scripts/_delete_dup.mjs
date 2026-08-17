// Delete confirmed duplicate registration b6c4217b (same user_id/email/phone as bd9c8de4).
// Guarded: only deletes if id AND email AND phone all match; verifies afterwards.
import fs from "fs";
const vault = fs.readFileSync("C:\\Users\\Admin\\OneDrive\\Desktop\\DocumentsOpenClawVault\\Agent-Shared\\credentials\\Supabase.md", "utf8");
const T = vault.match(/sbp_[a-f0-9]+/)[0];
const REF = "lwgxhverhtktotvowehg";

async function q(sql) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${T}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  return { status: r.status, rows: await r.json() };
}

const DUP = "b6c4217b-2fce-4161-8c5f-fa85eb3ada35";

const del = await q(`DELETE FROM public.registrations
  WHERE id = '${DUP}'
    AND email = 'bonfaceosumba@gmail.com'
    AND phone = '0729852311'
    AND user_id = 'a207c347-2760-4a25-81b1-e9ef66e4ab50'
  RETURNING id, full_name, email;`);
console.log("=== DELETE result (status " + del.status + ") ===");
console.log(JSON.stringify(del.rows, null, 2));

const after = await q(`SELECT id, full_name, email, phone, created_at
  FROM public.registrations
  WHERE email = 'bonfaceosumba@gmail.com' OR full_name ILIKE 'bonface%'
  ORDER BY created_at;`);
console.log("\n=== remaining Bonface rows ===");
console.log(JSON.stringify(after.rows, null, 2));
