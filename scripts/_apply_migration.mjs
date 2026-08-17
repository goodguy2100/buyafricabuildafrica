// Apply a single SQL migration file to the live BABA Supabase DB (session pooler).
// Secrets are read from the vault and never printed.
import { readFileSync } from "node:fs";
import { Client } from "pg";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");

const pwMatch = content.match(/DB password:\s*(\S+)/);
const refMatch = content.match(/Project ref:\s*`?([a-z0-9]+)`?/);
if (!pwMatch || !refMatch) {
  console.error("Could not find DB password / project ref in Supabase.md");
  process.exit(1);
}

const sqlPath = process.argv[2];
if (!sqlPath) {
  console.error("Usage: node scripts/_apply_migration.mjs <sql-file>");
  process.exit(1);
}
const sql = readFileSync(sqlPath, "utf8");

const client = new Client({
  host: "aws-1-eu-west-1.pooler.supabase.com",
  port: 5432,
  user: `postgres.${refMatch[1]}`,
  password: pwMatch[1],
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("MIGRATION APPLIED OK");
  const check = await client.query(`
    SELECT
      (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('partner_orgs','partner_admins','bulk_import_logs')) AS new_tables,
      (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='registrations' AND column_name IN ('account_status','profile_complete','first_login','partner_org_id','verified_at','verified_by','verification_method')) AS new_cols,
      (SELECT count(*) FROM pg_enum WHERE enumlabel='partner_admin') AS role_added;
  `);
  console.log(JSON.stringify(check.rows[0]));
  await client.end();
} catch (err) {
  console.error("MIGRATION FAILED:", err.message);
  process.exit(1);
}
