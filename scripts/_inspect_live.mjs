// Registrations detail for Bonface cleanup + auth linkage
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

const dup = await q(`SELECT r.id, r.user_id, r.role, r.user_role, r.full_name, r.email, r.phone, r.status, r.verified, r.username, r.created_at,
  (SELECT count(*) FROM auth.users u WHERE u.id = r.user_id) AS auth_exists,
  (SELECT email FROM auth.users u WHERE u.id = r.user_id) AS auth_email
  FROM public.registrations r WHERE r.id IN ('bd9c8de4-6e94-44ba-8b9d-822307c024ab','b6c4217b-2fce-4161-8c5f-fa85eb3ada35','8574213a-ea21-451b-b813-acd7ab22be11');`);
console.log("=== dup detail (status " + dup.status + ") ===");
if (Array.isArray(dup.rows)) console.log(JSON.stringify(dup.rows, null, 2));
else console.log(JSON.stringify(dup.rows).slice(0, 400));

// check for duplicate auth users with same email
const auth = await q(`SELECT id, email, created_at FROM auth.users WHERE email = 'bonfaceosumba@gmail.com' ORDER BY created_at;`);
console.log("\n=== auth.users for bonfaceosumba@gmail.com ===");
console.log(JSON.stringify(auth.rows, null, 2));
