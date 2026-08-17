// Complete Kennie's partner-admin setup: add the missing user_roles row.
import { readFileSync } from "node:fs";
import { Client } from "pg";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");
const pw = content.match(/DB password:\s*(\S+)/)[1];
const ref = content.match(/Project ref:\s*`?([a-z0-9]+)`?/)[1];
const c = new Client({ host: "aws-1-eu-west-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}`, password: pw, database: "postgres", ssl: { rejectUnauthorized: false } });
await c.connect();

await c.query(
  "INSERT INTO public.user_roles (user_id, role) VALUES ('522ce78f-479e-49df-8f9f-5eff2bb55ba5', 'partner_admin') ON CONFLICT DO NOTHING",
);
console.log("role row inserted");

const r = await c.query(
  "SELECT (SELECT count(*) FROM public.partner_admins WHERE user_id='522ce78f-479e-49df-8f9f-5eff2bb55ba5') AS pa_rows, (SELECT count(*) FROM public.user_roles WHERE user_id='522ce78f-479e-49df-8f9f-5eff2bb55ba5') AS role_rows",
);
console.log("verify:", JSON.stringify(r.rows[0]));

await c.end();
