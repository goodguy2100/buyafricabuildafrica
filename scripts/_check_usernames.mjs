// Check username columns + existing values + duplicates before adding uniqueness.
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

// Column existence
console.log("=== profiles.username column ===");
console.log(JSON.stringify((await q(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name IN ('username','email','full_name');`)).rows, null, 1));

console.log("=== registrations.username column ===");
console.log(JSON.stringify((await q(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='registrations' AND column_name IN ('username','email','full_name');`)).rows, null, 1));

// Existing non-null usernames + any duplicates
console.log("=== non-null usernames in profiles (count) ===");
console.log(JSON.stringify((await q(`SELECT count(*) AS n FROM public.profiles WHERE username IS NOT NULL AND username <> '';`)).rows, null, 1));

console.log("=== non-null usernames in registrations (count) ===");
console.log(JSON.stringify((await q(`SELECT count(*) AS n FROM public.registrations WHERE username IS NOT NULL AND username <> '';`)).rows, null, 1));

console.log("=== duplicate usernames in registrations ===");
console.log(JSON.stringify((await q(`SELECT lower(username) AS u, count(*) FROM public.registrations WHERE username IS NOT NULL AND username <> '' GROUP BY lower(username) HAVING count(*) > 1;`)).rows, null, 1));

console.log("=== duplicate usernames in profiles ===");
console.log(JSON.stringify((await q(`SELECT lower(username) AS u, count(*) FROM public.profiles WHERE username IS NOT NULL AND username <> '' GROUP BY lower(username) HAVING count(*) > 1;`)).rows, null, 1));

// auth.users metadata has username?
console.log("=== auth.users with username in raw_user_meta_data ===");
console.log(JSON.stringify((await q(`SELECT count(*) AS n FROM auth.users WHERE raw_user_meta_data->>'username' IS NOT NULL;`)).rows, null, 1));
