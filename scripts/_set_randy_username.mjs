// Set username for Randy's admin account + verify login lookup resolves
import fs from "fs";
const vault = fs.readFileSync("C:\\Users\\Admin\\OneDrive\\Desktop\\DocumentsOpenClawVault\\Agent-Shared\\credentials\\Supabase.md", "utf8");
const svc = vault.match(/sb_secret_[A-Za-z0-9_]+/)[0];
const REF = "lwgxhverhtktotvowehg";
const base = `https://${REF}.supabase.co`;
const headers = { Authorization: `Bearer ${svc}`, apikey: svc, "Content-Type": "application/json" };
const UID = "cef753b9-768f-4a6c-95d5-72e89601a48e"; // randynyimier@gmail.com

// 1. Current profile
const pr = await fetch(`${base}/rest/v1/profiles?select=id,email,full_name,username,national_id&id=eq.${UID}`, { headers });
console.log("profile:", JSON.stringify(await pr.json()));

// 2. Set username if missing
const up = await fetch(`${base}/rest/v1/profiles?id=eq.${UID}`, {
  method: "PATCH",
  headers,
  body: JSON.stringify({ username: "randy" }),
});
console.log("set username:", up.status);

// 3. Also check his registration row (national_id present?)
const rr = await fetch(`${base}/rest/v1/registrations?select=user_id,full_name,email,national_id,username&user_id=eq.${UID}`, { headers });
console.log("registration:", JSON.stringify(await rr.json()));

// 4. Verify lookup logic server-side: does 'randy' resolve to his email?
const lu = await fetch(`${base}/rest/v1/profiles?select=email&username=ilike.randy`, { headers });
console.log("lookup 'randy':", JSON.stringify(await lu.json()));
