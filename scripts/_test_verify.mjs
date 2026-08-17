import { readFileSync } from "node:fs";
import { Client } from "pg";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");
const pw = content.match(/DB password:\s*(\S+)/)[1];
const ref = content.match(/Project ref:\s*`?([a-z0-9]+)`?/)[1];
const c = new Client({ host: "aws-1-eu-west-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}`, password: pw, database: "postgres", ssl: { rejectUnauthorized: false } });
await c.connect();

const r = await c.query(
  `SELECT full_name, national_id, phone, occupation, education_level, employment_status,
          account_status, profile_complete, first_login, verified,
          (SELECT org_name FROM public.partner_orgs o WHERE o.id = r.partner_org_id) AS org,
          (SELECT email FROM auth.users u WHERE u.id = r.user_id) AS login_email
   FROM public.registrations r
   WHERE national_id IN ('12345678','23456789','34567890')
   ORDER BY national_id`,
);
for (const row of r.rows) {
  console.log(JSON.stringify(row));
}

const log = await c.query(
  `SELECT total_rows, created_count, duplicate_count, error_count, profile_complete_count, incomplete_count
   FROM public.bulk_import_logs ORDER BY created_at DESC LIMIT 1`,
);
console.log("batch log:", JSON.stringify(log.rows[0]));

await c.end();
