import { readFileSync } from "node:fs";
import { Client } from "pg";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");
const pw = content.match(/DB password:\s*(\S+)/)[1];
const ref = content.match(/Project ref:\s*`?([a-z0-9]+)`?/)[1];
const c = new Client({ host: "aws-1-eu-west-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}`, password: pw, database: "postgres", ssl: { rejectUnauthorized: false } });
await c.connect();

const r = await c.query(
  "SELECT u.id, u.email, u.email_confirmed_at IS NOT NULL AS confirmed, p.full_name, (SELECT count(*) FROM public.partner_admins pa WHERE pa.user_id=u.id) AS pa_rows, (SELECT count(*) FROM public.user_roles ur WHERE ur.user_id=u.id) AS role_rows FROM auth.users u LEFT JOIN public.profiles p ON p.id=u.id WHERE u.email='kennienjoroge8@gmail.com'",
);
console.log("user:", JSON.stringify(r.rows[0] ?? null));

if (r.rows[0]) {
  const uid = r.rows[0].id;
  const pa = await c.query("SELECT id, partner_org_id, can_add_other_admins FROM public.partner_admins WHERE user_id=$1", [uid]);
  console.log("partner_admin rows:", JSON.stringify(pa.rows));
  const roles = await c.query("SELECT role FROM public.user_roles WHERE user_id=$1", [uid]);
  console.log("roles:", JSON.stringify(roles.rows));
}

// What orgs exist
const orgs = await c.query("SELECT id, org_name FROM public.partner_orgs ORDER BY created_at");
console.log("orgs:", JSON.stringify(orgs.rows));

await c.end();
