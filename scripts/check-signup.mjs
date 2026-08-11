// One-off verification: confirm "eva v3 test" account landed in Supabase
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('C:/Users/Admin/.openclaw/workspace/buyafricabuildafrica/.env');
const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('=');
  if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}

const strip = (s) => s.replace(/^["']|["']$/g, '');
let url = strip(env.SUPABASE_URL || env.VITE_SUPABASE_URL || '');
let key = strip(env.SUPABASE_SERVICE_ROLE_KEY || '');

// Fallback: recovery note names htzssalrtcvsrrpysetl as the live project
if (!key) {
  url = 'https://htzssalrtcvsrrpysetl.supabase.co';
  console.error('NO SERVICE KEY IN ENV - cannot verify');
  process.exit(1);
}

// Try both project URLs
const candidates = [url];
if (!url.includes('htzssalrtcvsrrpysetl')) candidates.push('https://htzssalrtcvsrrpysetl.supabase.co');
if (!url.includes('lwgxhverhtktotvowehg')) candidates.push('https://lwgxhverhtktotvowehg.supabase.co');

async function q(table, params = '') {
  const r = await fetch(`${url}/rest/v1/${table}?select=*${params}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return { status: r.status, body: await r.json() };
}

const name = 'eva v3 test';
const res = await q('profiles', `&name=eq.${encodeURIComponent(name)}&order=created_at.desc&limit=5`);
console.log('PROFILES status:', res.status);
console.log(JSON.stringify(res.body, null, 2));

// Also check registrations for this user
const regs = await q('registrations', `&order=created_at.desc&limit=3`);
console.log('\nREGISTRATIONS (latest 3):', regs.status);
console.log(JSON.stringify(regs.body, null, 2));
