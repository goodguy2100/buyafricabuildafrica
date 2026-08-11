// Full dump of all 18 auth users with user_metadata (admin API uses user_metadata, not raw_user_meta_data)
import fs from "fs";
const vault = fs.readFileSync("C:\\Users\\Admin\\OneDrive\\Desktop\\DocumentsOpenClawVault\\Agent-Shared\\credentials\\Supabase.md", "utf8");
const svc = vault.match(/sb_secret_[A-Za-z0-9_]+/)[0];
const REF = "lwgxhverhtktotvowehg";
const base = `https://${REF}.supabase.co`;
const headers = { Authorization: `Bearer ${svc}`, apikey: svc, "Content-Type": "application/json" };

let users = [];
let page = 1;
for (;;) {
  const r = await fetch(`${base}/auth/v1/admin/users?page=${page}&per_page=200`, { headers });
  const d = await r.json();
  if (!d.users || !d.users.length) break;
  users = users.concat(d.users);
  if (d.users.length < 200) break;
  page++;
}

const rReg = await fetch(`${base}/rest/v1/registrations?select=user_id,email,full_name,created_at,status`, { headers });
const regs = await rReg.json();
const regByUser = new Map(regs.map(r => [r.user_id, r]));

for (const u of users) {
  const meta = u.user_metadata || {};
  const hasReg = regByUser.has(u.id);
  console.log(JSON.stringify({
    id: u.id,
    email: u.email,
    confirmed: !!u.email_confirmed_at,
    created: u.created_at.slice(0, 16),
    hasReg,
    regEmail: hasReg ? regByUser.get(u.id).email : null,
    meta: {
      full_name: meta.full_name ?? null,
      username: meta.username ?? null,
      phone: meta.phone ?? null,
      national_id: meta.national_id ?? null,
      contact_email: meta.contact_email ?? null,
      category: meta.category ?? null,
      city: meta.city ?? null,
      area: meta.area ?? null,
      country: meta.country ?? null,
      professions: meta.professions ?? null,
    },
  }));
}
