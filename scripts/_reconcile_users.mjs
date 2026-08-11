// Compare Supabase auth users vs registrations/profiles — find signups missing from the platform
import fs from "fs";
const vault = fs.readFileSync("C:\\Users\\Admin\\OneDrive\\Desktop\\DocumentsOpenClawVault\\Agent-Shared\\credentials\\Supabase.md", "utf8");
const svc = vault.match(/sb_secret_[A-Za-z0-9_]+/)[0];
const REF = "lwgxhverhtktotvowehg";
const base = `https://${REF}.supabase.co`;

const headers = { Authorization: `Bearer ${svc}`, apikey: svc, "Content-Type": "application/json" };

// 1. All auth users (admin API, paginated)
let users = [];
let page = 1;
for (;;) {
  const r = await fetch(`${base}/auth/v1/admin/users?page=${page}&per_page=200`, { headers });
  const d = await r.json();
  if (r.status !== 200) { console.log("AUTH USERS STATUS:", r.status, JSON.stringify(d).slice(0, 200)); break; }
  if (!d.users || !d.users.length) break;
  users = users.concat(d.users);
  if (d.users.length < 200) break;
  page++;
}
console.log("AUTH USERS:", users.length);

// 2. All registrations
const rReg = await fetch(`${base}/rest/v1/registrations?select=user_id,email,full_name,created_at,status`, { headers });
const regs = await rReg.json();
console.log("REGISTRATIONS STATUS:", rReg.status);
const regList = Array.isArray(regs) ? regs : [];
console.log("REGISTRATIONS:", regList.length);

// 3. All profiles
const rProf = await fetch(`${base}/rest/v1/profiles?select=id,email,full_name,username`, { headers });
const profs = await rProf.json();
console.log("PROFILES STATUS:", rProf.status);
const profList = Array.isArray(profs) ? profs : [];
console.log("PROFILES:", profList.length);

const regByUser = new Map(regList.map(r => [r.user_id, r]));
const profByUser = new Map(profList.map(p => [p.id, p]));

console.log("\n=== USERS MISSING FROM REGISTRATIONS ===");
for (const u of users) {
  if (!regByUser.has(u.id)) {
    const meta = u.raw_user_meta_data || {};
    console.log(JSON.stringify({
      id: u.id,
      email: u.email,
      created: u.created_at,
      confirmed: !!u.email_confirmed_at,
      meta: { full_name: meta.full_name, username: meta.username, phone: meta.phone, national_id: meta.national_id, category: meta.category, contact_email: meta.contact_email, city: meta.city, area: meta.area, country: meta.country, professions: meta.professions },
    }));
  }
}

console.log("\n=== USERS WITH @baba.local EMAILS (auth) ===");
for (const u of users) {
  if (u.email && u.email.endsWith("@baba.local")) {
    const meta = u.raw_user_meta_data || {};
    console.log(JSON.stringify({
      id: u.id,
      email: u.email,
      created: u.created_at,
      confirmed: !!u.email_confirmed_at,
      meta: { full_name: meta.full_name, username: meta.username, phone: meta.phone, national_id: meta.national_id, contact_email: meta.contact_email },
    }));
  }
}

console.log("\n=== PROFILES WITHOUT REGISTRATION ===");
for (const p of profList) {
  if (!regByUser.has(p.id)) {
    console.log(JSON.stringify({ id: p.id, email: p.email, full_name: p.full_name, username: p.username }));
  }
}
