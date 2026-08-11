// Reconcile: create registration rows for auth users missing them + confirm their emails
import fs from "fs";
const vault = fs.readFileSync("C:\\Users\\Admin\\OneDrive\\Desktop\\DocumentsOpenClawVault\\Agent-Shared\\credentials\\Supabase.md", "utf8");
const svc = vault.match(/sb_secret_[A-Za-z0-9_]+/)[0];
const REF = "lwgxhverhtktotvowehg";
const base = `https://${REF}.supabase.co`;
const headers = { Authorization: `Bearer ${svc}`, apikey: svc, "Content-Type": "application/json" };

// Fetch all users
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

// Fetch existing registrations
const rReg = await fetch(`${base}/rest/v1/registrations?select=user_id`, { headers });
const regs = await rReg.json();
const regByUser = new Set(regs.map(r => r.user_id));

// Category label -> role + trade mapping (mirrors auth.tsx PROFESSIONS)
const CAT_ROLE = (cat = "") => {
  const c = cat.toLowerCase();
  if (c.includes("engineer") || c.includes("architect") || c.includes("designer") || c.includes("surveyor") || c.includes("manager") || c.includes("contractor")) return "professional_exp";
  if (c.includes("student")) return "professional_young";
  return "artisan";
};
const TRADE = (cat = "") => {
  const c = cat.toLowerCase();
  if (c.includes("mason")) return "mason";
  if (c.includes("electrician")) return "electrician";
  if (c.includes("plumber")) return "plumber";
  if (c.includes("carpenter")) return "carpenter";
  if (c.includes("welder")) return "welder";
  if (c.includes("painter")) return "painter";
  if (c.includes("tiler")) return "tiler";
  return "other";
};

const created = [];
for (const u of users) {
  if (regByUser.has(u.id)) continue;
  const m = u.user_metadata || {};
  const cat = m.category || null;
  const role = u.email?.endsWith("@baba.local") ? "artisan" : CAT_ROLE(cat);
  const label = cat || (m.full_name || "Member");
  const professions = Array.isArray(m.professions) && m.professions.length ? m.professions : [cat].filter(Boolean);
  const location = [m.area, m.city, m.country].filter(Boolean).join(", ");

  const payload = {
    user_id: u.id,
    role,
    user_role: role,
    artisan_type: role === "artisan" ? TRADE(label) : null,
    professional_experience: role === "professional_young" ? "young" : role === "professional_exp" ? "experienced" : null,
    data: {
      fullName: m.full_name || null,
      nationalId: m.national_id || null,
      phone: m.phone || null,
      email: m.contact_email || null,
      category: label,
      occupation: label,
      trade: role === "artisan" ? label : undefined,
      professions,
      country: m.country || null,
      city: m.city || null,
      area: m.area || null,
      location,
    },
    full_name: m.full_name || null,
    email: m.contact_email || null,
    phone: m.phone || null,
    national_id: m.national_id || null,
    location: location || null,
    country: m.country || null,
    city: m.city || null,
    area: m.area || null,
    occupation: label,
    trade: role === "artisan" ? label : null,
    professions,
    status: "pending",
  };

  const ins = await fetch(`${base}/rest/v1/registrations`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const insBody = await ins.text();
  const ok = ins.status === 201;
  created.push({ email: u.email, name: m.full_name, role, status: ins.status, body: insBody.slice(0, 120), confirmed: !!u.email_confirmed_at });

  // Confirm the auth email so they can actually log in (their confirmation link was broken)
  if (ok && !u.email_confirmed_at && u.email && !u.email.endsWith("@baba.local")) {
    const conf = await fetch(`${base}/auth/v1/admin/users/${u.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ email_confirm: true }),
    });
    const confBody = await conf.text();
    created[created.length - 1].confirmStatus = conf.status;
    created[created.length - 1].confirmBody = confBody.slice(0, 80);
  }
}

console.log("CREATED REGISTRATIONS:", created.length);
for (const c of created) console.log(JSON.stringify(c));
