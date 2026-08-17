// Quick DB diagnostics — prints only non-secret info.
import { readFileSync } from "node:fs";
import { Client } from "pg";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");
const pwMatch = content.match(/DB password:\s*(\S+)/);
const refMatch = content.match(/Project ref:\s*`?([a-z0-9]+)`?/);
const client = new Client({
  host: "aws-1-eu-west-1.pooler.supabase.com",
  port: 5432,
  user: `postgres.${refMatch[1]}`,
  password: pwMatch[1],
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});
await client.connect();
console.log("PG version:", (await client.query("SHOW server_version")).rows[0].server_version);
console.log("app_role values:", JSON.stringify((await client.query("SELECT enumlabel FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='app_role'")).rows));
const fn = await client.query("SELECT proname, pg_get_function_identity_arguments(oid) AS args FROM pg_proc WHERE proname='has_role'");
console.log("has_role signatures:", JSON.stringify(fn.rows));
try {
  const r = await client.query("SELECT public.has_role('00000000-0000-0000-0000-000000000000', 'admin') AS ok");
  console.log("has_role('admin') call:", JSON.stringify(r.rows));
} catch (e) {
  console.log("has_role('admin') call FAILED:", e.message);
}
await client.end();
