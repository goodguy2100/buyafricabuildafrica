// Delete the corrupt manual test user, then recreate via Auth Admin API.
import { readFileSync } from "node:fs";
import { Client } from "pg";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");
const serviceKey = content.match(/sb_secret_[A-Za-z0-9_\-]+/)[0];
const pw = content.match(/DB password:\s*(\S+)/)[1];
const ref = content.match(/Project ref:\s*`?([a-z0-9]+)`?/)[1];

const c = new Client({ host: "aws-1-eu-west-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}`, password: pw, database: "postgres", ssl: { rejectUnauthorized: false } });
await c.connect();

// 1. Clean up any leftovers for the old test admin
await c.query(`DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'testpartner%@baba.local')`);
await c.query(`DELETE FROM public.partner_admins WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'testpartner%@baba.local')`);
await c.query(`DELETE FROM auth.users WHERE email LIKE 'testpartner%@baba.local'`);
console.log("old test users cleaned");

// 2. Create fresh via admin API
const res = await fetch("https://lwgxhverhtktotvowehg.supabase.co/auth/v1/admin/users", {
  method: "POST",
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "testpartner@baba.local",
    password: "Test@1234",
    email_confirm: true,
    user_metadata: { full_name: "Test Partner Admin" },
  }),
});
const body = await res.json();
console.log("create status:", res.status);
if (!body.id) {
  console.log(JSON.stringify(body));
  process.exit(1);
}
console.log("created:", body.id);

// 3. Link to org + role
const org = await c.query(`SELECT id FROM public.partner_orgs WHERE org_name='Test Partner Org' LIMIT 1`);
const orgId = org.rows[0].id;
await c.query(`INSERT INTO public.partner_admins (user_id, partner_org_id, can_add_other_admins) VALUES ($1,$2,true) ON CONFLICT (user_id) DO NOTHING`, [body.id, orgId]);
await c.query(`INSERT INTO public.user_roles (user_id, role) VALUES ($1,'partner_admin'::public.app_role) ON CONFLICT DO NOTHING`, [body.id]);
console.log("linked:", orgId);

// 4. Verify the token endpoint now works
const login = await fetch("https://lwgxhverhtktotvowehg.supabase.co/auth/v1/token?grant_type=password", {
  method: "POST",
  headers: { apikey: "sb_publishable_DDGwHMKtwbqVaiC-UnukZg_PjgKcTHP", "Content-Type": "application/json" },
  body: JSON.stringify({ email: "testpartner@baba.local", password: "Test@1234" }),
});
const lb = await login.json();
console.log("login status:", login.status, lb.access_token ? "SIGN-IN OK" : JSON.stringify(lb));

await c.end();
