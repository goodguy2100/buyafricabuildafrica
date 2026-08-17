import { readFileSync } from "node:fs";
import { Client } from "pg";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");
const pw = content.match(/DB password:\s*(\S+)/)[1];
const ref = content.match(/Project ref:\s*`?([a-z0-9]+)`?/)[1];
const c = new Client({ host: "aws-1-eu-west-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}`, password: pw, database: "postgres", ssl: { rejectUnauthorized: false } });
await c.connect();

const fn = await c.query(
  "SELECT pg_get_functiondef(oid) AS def FROM pg_proc WHERE proname='registration_privileged_unchanged'",
);
console.log("FUNCTION:", fn.rows[0]?.def);

const trg = await c.query(
  "SELECT tgname, pg_get_triggerdef(oid) AS def FROM pg_trigger WHERE tgrelid='public.registrations'::regclass AND NOT tgisinternal",
);
trg.rows.forEach((t) => console.log("TRIGGER:", t.def));

await c.end();
