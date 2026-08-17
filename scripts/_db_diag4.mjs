import { readFileSync } from "node:fs";
import { Client } from "pg";

const vault = "C:/Users/Admin/OneDrive/Desktop/DocumentsOpenClawVault/Agent-Shared/credentials/Supabase.md";
const content = readFileSync(vault, "utf8");
const pw = content.match(/DB password:\s*(\S+)/)[1];
const ref = content.match(/Project ref:\s*`?([a-z0-9]+)`?/)[1];
const c = new Client({ host: "aws-1-eu-west-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}`, password: pw, database: "postgres", ssl: { rejectUnauthorized: false } });
await c.connect();

const cols = await c.query(
  `SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_schema='auth' AND table_name='users' ORDER BY ordinal_position`,
);

const testUser = await c.query(
  `SELECT id, instance_id, aud, role, email, email_confirmed_at, is_sso_user, deleted_at, is_anonymous, raw_app_meta_data, created_at FROM auth.users WHERE email='testpartner@baba.local'`,
);
console.log("TEST USER:", JSON.stringify(testUser.rows[0], null, 1));

const healthy = await c.query(
  `SELECT id, instance_id, aud, role, email, email_confirmed_at, is_sso_user, deleted_at, is_anonymous, raw_app_meta_data, created_at FROM auth.users WHERE email NOT LIKE '%@baba.local' AND deleted_at IS NULL LIMIT 1`,
);
console.log("HEALTHY USER:", JSON.stringify(healthy.rows[0], null, 1));

await c.end();
