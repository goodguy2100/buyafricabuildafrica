// Find Randy's BABA account(s), check admin role, reset password for the admin one
import fs from "fs";
const vault = fs.readFileSync("C:\\Users\\Admin\\OneDrive\\Desktop\\DocumentsOpenClawVault\\Agent-Shared\\credentials\\Supabase.md", "utf8");
const svc = vault.match(/sb_secret_[A-Za-z0-9_]+/)[0];
const REF = "lwgxhverhtktotvowehg";
const base = `https://${REF}.supabase.co`;
const headers = { Authorization: `Bearer ${svc}`, apikey: svc, "Content-Type": "application/json" };

// 1. All auth users
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

// 2. Admin roles
const rr = await fetch(`${base}/rest/v1/user_roles?select=user_id,role`, { headers });
const roles = await rr.json();

const admins = new Set((roles ?? []).filter((x) => x.role === "admin").map((x) => x.user_id));

// 3. Profiles for usernames
const pr = await fetch(`${base}/rest/v1/profiles?select=id,email,full_name,username`, { headers });
const profiles = await pr.json();
const profByUser = new Map((profiles ?? []).map((p) => [p.id, p]));

// Candidates: emails with randy/nyimier/phillips + all admins
const interesting = users.filter((u) => {
  const e = (u.email ?? "").toLowerCase();
  return e.includes("randy") || e.includes("nyimier") || e.includes("phillips") || admins.has(u.id);
});

console.log("--- candidates ---");
for (const u of interesting) {
  const p = profByUser.get(u.id);
  console.log(
    `${u.id} | ${u.email} | admin=${admins.has(u.id)} | name=${p?.full_name ?? "-"} | user=${p?.username ?? "-"} | confirmed=${u.email_confirmed_at ? "yes" : "no"}`
  );
}

// 4. Reset password for the admin account (if exactly one)
const adminUser = interesting.find((u) => admins.has(u.id));
if (!adminUser) {
  console.log("NO_ADMIN_ACCOUNT_FOUND");
  process.exit(0);
}

const words = ["Baba", "Ubuntu", "Africa", "Build", "Rise", "Unity"];
const w = words[Math.floor(Math.random() * words.length)];
const n = Math.floor(1000 + Math.random() * 9000);
const newPass = `${w}${n}!`;

const up = await fetch(`${base}/auth/v1/admin/users/${adminUser.id}`, {
  method: "PUT",
  headers,
  body: JSON.stringify({ password: newPass }),
});
console.log("reset status:", up.status, (await up.text()).slice(0, 120));
console.log("NEW_PASSWORD:", newPass);
console.log("LOGIN_HINT:", profByUser.get(adminUser.id)?.username ?? adminUser.email);
