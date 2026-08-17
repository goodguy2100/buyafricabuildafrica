import { readFileSync } from "node:fs";
import { Client } from "pg";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");
const pw = content.match(/DB password:\s*(\S+)/)[1];
const ref = content.match(/Project ref:\s*`?([a-z0-9]+)`?/)[1];
const c = new Client({ host: "aws-1-eu-west-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}`, password: pw, database: "postgres", ssl: { rejectUnauthorized: false } });
await c.connect();

const r = await c.query(
  `SELECT full_name, account_status, profile_complete, first_login, verified, verification_method, verified_at IS NOT NULL AS has_verified_at
   FROM public.registrations WHERE national_id='12345678'`,
);
console.log("Member One:", JSON.stringify(r.rows[0]));

// Old ID password should now be dead
const login = await fetch("https://lwgxhverhtktotvowehg.supabase.co/auth/v1/token?grant_type=password", {
  method: "POST",
  headers: { apikey: "sb_publishable_DDGwHMKtwbqVaiC-UnukZg_PjgKcTHP", "Content-Type": "application/json" },
  body: JSON.stringify({ email: "id12345678@baba.local", password: "12345678" }),
});
const lb = await login.json();
console.log("old ID password login:", login.status, lb.access_token ? "STILL WORKS (BAD)" : "dead ✓");

// New password works
const login2 = await fetch("https://lwgxhverhtktotvowehg.supabase.co/auth/v1/token?grant_type=password", {
  method: "POST",
  headers: { apikey: "sb_publishable_DDGwHMKtwbqVaiC-UnukZg_PjgKcTHP", "Content-Type": "application/json" },
  body: JSON.stringify({ email: "id12345678@baba.local", password: "MemberOne123!" }),
});
const lb2 = await login2.json();
console.log("new password login:", login2.status, lb2.access_token ? "works ✓" : JSON.stringify(lb2));

await c.end();
