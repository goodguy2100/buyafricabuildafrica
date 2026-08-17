import { readFileSync } from "node:fs";
import { Client } from "pg";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");
const pw = content.match(/DB password:\s*(\S+)/)[1];
const ref = content.match(/Project ref:\s*`?([a-z0-9]+)`?/)[1];
const c = new Client({ host: "aws-1-eu-west-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}`, password: pw, database: "postgres", ssl: { rejectUnauthorized: false } });
await c.connect();

const r = await c.query(
  "SELECT verified, verification_method, verified_at, first_login, account_status, updated_at FROM public.registrations WHERE national_id='12345678'",
);
console.log("row:", JSON.stringify(r.rows[0]));

const pol = await c.query(
  "SELECT polname, pg_get_expr(polqual, polrelid) AS qual, pg_get_expr(polwithcheck, polrelid) AS wc FROM pg_policy WHERE polrelid='public.registrations'::regclass",
);
pol.rows.forEach((p) => console.log("POLICY:", p.polname, "|", p.qual, "| CHECK:", p.wc));

await c.end();
