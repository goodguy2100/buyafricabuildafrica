// Create partner admin via the Auth Admin API (proper path, like the import code).
import { readFileSync } from "node:fs";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");
const serviceKey = content.match(/sb_secret_[A-Za-z0-9_\-]+/)[0];

const res = await fetch("https://lwgxhverhtktotvowehg.supabase.co/auth/v1/admin/users", {
  method: "POST",
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "testpartner@baba.local",
    password: "Test@1234",
    email_confirm: true,
    user_metadata: { full_name: "Test Partner Admin" },
  }),
});
const body = await res.json();
console.log("status:", res.status);
if (body.id) {
  console.log("CREATED:", body.id);
  const { Client } = await import("pg");
  const pw = content.match(/DB password:\s*(\S+)/)[1];
  const ref = content.match(/Project ref:\s*`?([a-z0-9]+)`?/)[1];
  const c = new Client({ host: "aws-1-eu-west-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}`, password: pw, database: "postgres", ssl: { rejectUnauthorized: false } });
  await c.connect();
  const org = await c.query(`SELECT id FROM public.partner_orgs WHERE org_name='Test Partner Org' LIMIT 1`);
  const orgId = org.rows[0].id;
  await c.query(`INSERT INTO public.partner_admins (user_id, partner_org_id, can_add_other_admins) VALUES ($1,$2,true) ON CONFLICT (user_id) DO NOTHING`, [body.id, orgId]);
  await c.query(`INSERT INTO public.user_roles (user_id, role) VALUES ($1,'partner_admin') ON CONFLICT DO NOTHING`, [body.id]);
  console.log("linked to org", orgId);
  await c.end();
} else {
  console.log(JSON.stringify(body));
}
