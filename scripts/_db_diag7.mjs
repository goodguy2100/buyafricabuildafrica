import { readFileSync } from "node:fs";
import { Client } from "pg";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");
const pw = content.match(/DB password:\s*(\S+)/)[1];
const ref = content.match(/Project ref:\s*`?([a-z0-9]+)`?/)[1];
const c = new Client({ host: "aws-1-eu-west-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}`, password: pw, database: "postgres", ssl: { rejectUnauthorized: false } });
await c.connect();

const fn = await c.query(
  "SELECT pg_get_functiondef(oid) AS def FROM pg_proc WHERE proname='guard_registration_admin_fields'",
);
console.log(fn.rows[0]?.def ?? "not found");

await c.end();
