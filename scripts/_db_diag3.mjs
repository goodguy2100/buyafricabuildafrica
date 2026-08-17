import { readFileSync } from "node:fs";
import { Client } from "pg";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");
const pw = content.match(/DB password:\s*(\S+)/)[1];
const ref = content.match(/Project ref:\s*`?([a-z0-9]+)`?/)[1];
const c = new Client({
  host: "aws-1-eu-west-1.pooler.supabase.com",
  port: 5432,
  user: `postgres.${ref}`,
  password: pw,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});
await c.connect();

const r = await c.query(
  "SELECT n.nspname AS schema, p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE p.proname IN ('has_role','is_partner_admin','get_partner_org_id','update_updated_at_column') ORDER BY 1,2",
);
console.log("functions:", JSON.stringify(r.rows));

const s = await c.query("SHOW search_path");
console.log("search_path:", JSON.stringify(s.rows));

const pol = await c.query(
  "SELECT polname, pg_get_expr(polqual, polrelid) AS expr FROM pg_policy WHERE polname LIKE '%partner%' OR polname LIKE '%Admins can view all roles%'",
);
console.log("policies:", JSON.stringify(pol.rows, null, 1));

await c.end();
