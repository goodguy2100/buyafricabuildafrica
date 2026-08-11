// Welcome backfill: welcome email (Resend) + important in-app notification for every BABA user
import fs from "fs";
const vault = fs.readFileSync("C:\\Users\\Admin\\OneDrive\\Desktop\\DocumentsOpenClawVault\\Agent-Shared\\credentials\\Supabase.md", "utf8");
const resendVault = fs.readFileSync("C:\\Users\\Admin\\OneDrive\\Desktop\\DocumentsOpenClawVault\\Agent-Shared\\credentials\\resnd.md", "utf8");
const svc = vault.match(/sb_secret_[A-Za-z0-9_]+/)[0];
const resendKey = resendVault.match(/re_[A-Za-z0-9_]+/)[0];
const REF = "lwgxhverhtktotvowehg";
const base = `https://${REF}.supabase.co`;
const headers = { Authorization: `Bearer ${svc}`, apikey: svc, "Content-Type": "application/json" };
const ORIGIN = "https://buyafricabuildafrica.org";

// All auth users
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

// Registrations for real emails (some auth emails are @baba.local but registration has real email)
const rReg = await fetch(`${base}/rest/v1/registrations?select=user_id,email,full_name`, { headers });
const regs = await rReg.json();
const regByUser = new Map(regs.map(r => [r.user_id, r]));

const mailable = (e) => {
  const v = (e ?? "").trim().toLowerCase();
  return v && v.includes("@") && !v.endsWith("@baba.local") ? v : null;
};

const TITLE = "Welcome to BABA — you're fully confirmed! 🎉";
const BODY = `Hi there,

You are now a fully confirmed member of Buy Africa Build Africa (BABA).

Your account is ready — log in anytime with your username or National ID at buyafricabuildafrica.org.

We celebrate every skill, big and small. Update your profile, explore opportunities, and let's build Africa together.

— The BABA Team`;

const html = (name) => `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f6f8fb;padding:24px;">
<div style="max-width:560px;margin:auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e2e8f0;">
  <h1 style="color:#1e3a8a;font-size:22px;margin:0 0 12px;">Welcome to BABA — you're fully confirmed! 🎉</h1>
  <p style="color:#334155;font-size:15px;line-height:1.6;">Hi ${name || "there"},</p>
  <p style="color:#334155;font-size:15px;line-height:1.6;">You are now a fully confirmed member of <strong>Buy Africa Build Africa</strong>.</p>
  <p style="color:#334155;font-size:15px;line-height:1.6;">Your account is ready — log in anytime with your <strong>username or National ID</strong> at <a href="${ORIGIN}" style="color:#1e3a8a;">buyafricabuildafrica.org</a>.</p>
  <p style="color:#334155;font-size:15px;line-height:1.6;">We celebrate every skill, big and small. Update your profile, explore opportunities, and let's build Africa together.</p>
  <p style="color:#64748b;font-size:13px;line-height:1.6;margin-top:24px;">— The BABA Team</p>
</div></body></html>`;

let emailed = 0, skipped = 0, notified = 0, emailErrors = 0;

for (const u of users) {
  const meta = u.user_metadata || {};
  const name = meta.full_name || regByUser.get(u.id)?.full_name || null;
  const regEmail = mailable(regByUser.get(u.id)?.email);
  const authEmail = mailable(u.email);
  const to = regEmail ?? authEmail;

  // 1. In-app notification (important = red) for every user
  const notif = await fetch(`${base}/rest/v1/user_notifications`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      user_id: u.id,
      notification_id: null,
      title: TITLE,
      body: BODY,
      is_popup: false,
      is_important: true,
    }),
  });
  if (notif.status === 201) notified++;
  else { console.log("NOTIF FAIL", u.email, notif.status, (await notif.text()).slice(0, 100)); }

  // 2. Welcome email only when there is a real address
  if (!to) { skipped++; continue; }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "BABA <notify@buyafricabuildafrica.org>",
        to: [to],
        subject: "Welcome to BABA — you're fully confirmed! 🎉",
        html: html(name),
        text: BODY,
      }),
    });
    const body = await res.text();
    if (res.ok) { emailed++; console.log("EMAIL OK", to, JSON.parse(body).id); }
    else { emailErrors++; console.log("EMAIL FAIL", to, res.status, body.slice(0, 120)); }
  } catch (e) {
    emailErrors++;
    console.log("EMAIL THREW", to, e.message);
  }
}

console.log(`\nDONE. notified=${notified} emailed=${emailed} skipped(no email)=${skipped} emailErrors=${emailErrors}`);
