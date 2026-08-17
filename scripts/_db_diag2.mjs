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

const UUID = "'00000000-0000-0000-0000-000000000000'";

try {
  const r = await c.query(`SELECT public.has_role(${UUID}::uuid, 'admin')`);
  console.log("with ::uuid cast:", JSON.stringify(r.rows));
} catch (e) {
  console.log("with ::uuid cast FAILED:", e.message);
}

try {
  const r = await c.query(`SELECT public.has_role(${UUID}::uuid, 'admin'::public.app_role)`);
  console.log("with enum cast:", JSON.stringify(r.rows));
} catch (e) {
  console.log("with enum cast FAILED:", e.message);
}

// Theory: ALTER TYPE ADD VALUE inside a transaction breaks enum function
// resolution for the rest of that transaction. Test in a rolled-back txn.
try {
  await c.query("BEGIN");
  await c.query("ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner_admin'");
  const r = await c.query(`SELECT public.has_role(${UUID}::uuid, 'admin')`);
  console.log("in-txn after ALTER TYPE:", JSON.stringify(r.rows));
  await c.query("ROLLBACK");
  console.log("rolled back");
} catch (e) {
  console.log("in-txn after ALTER TYPE FAILED:", e.message);
  try {
    await c.query("ROLLBACK");
  } catch {}
}

await c.end();
