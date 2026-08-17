// Create test partner org + partner admin for UI verification.
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

// 1. Test org
const org = await c.query(
  `INSERT INTO public.partner_orgs (org_name) VALUES ('Test Partner Org') RETURNING id`,
);
const orgId = org.rows[0].id;
console.log("org:", orgId);

// 2. Partner admin auth user (profile auto-created by trigger)
const admin = await c.query(
  `INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
   VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
           'testpartner@baba.local', crypt('Test@1234', gen_salt('bf')),
           now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test Partner Admin"}',
           now(), now())
   RETURNING id`,
);
const adminId = admin.rows[0].id;
console.log("admin user:", adminId);

// 3. Partner admin link + role
await c.query(
  `INSERT INTO public.partner_admins (user_id, partner_org_id, can_add_other_admins) VALUES ($1, $2, true)`,
  [adminId, orgId],
);
await c.query(
  `INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'partner_admin'::public.app_role)`,
  [adminId],
);
console.log("partner admin linked + role granted");

// Verify
const v = await c.query(
  `SELECT (SELECT org_name FROM public.partner_orgs WHERE id=$1) AS org,
          (SELECT full_name FROM public.profiles WHERE id=$2) AS profile_name,
          (SELECT count(*) FROM public.partner_admins WHERE user_id=$2) AS pa_rows,
          (SELECT count(*) FROM public.user_roles WHERE user_id=$2 AND role='partner_admin') AS role_rows`,
  [orgId, adminId],
);
console.log("verify:", JSON.stringify(v.rows[0]));

await c.end();
