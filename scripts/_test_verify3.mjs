import { readFileSync } from "node:fs";
import { Client } from "pg";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");
const pw = content.match(/DB password:\s*(\S+)/)[1];
const ref = content.match(/Project ref:\s*`?([a-z0-9]+)`?/)[1];
const c = new Client({ host: "aws-1-eu-west-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}`, password: pw, database: "postgres", ssl: { rejectUnauthorized: false } });
await c.connect();

const r = await c.query(
  "SELECT full_name, verified, verification_method, verified_at IS NOT NULL AS has_vat, first_login, account_status FROM public.registrations WHERE national_id IN ('23456789','34567890') ORDER BY national_id",
);
console.log(JSON.stringify(r.rows));

await c.end();
