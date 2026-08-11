// Check auth routes + find auth chunk, verify wizard text present
const base = "https://buyafricabuildafrica.org";
for (const p of ["/auth", "/forgot-password", "/reset-password", "/signin", "/dashboard", "/"]) {
  try {
    const r = await fetch(base + p, { signal: AbortSignal.timeout(15000) });
    console.log(p, r.status);
  } catch (e) {
    console.log(p, "ERR", e.message);
  }
}
const h = await (await fetch(base + "/auth")).text();
const scripts = [...h.matchAll(/src="(\/assets\/[^"]*\.js)"/g)].map((x) => x[1]);
console.log("scripts:", scripts.join(" "));

// Find the auth chunk and check wizard strings
for (const s of scripts) {
  const t = await (await fetch(base + s)).text();
  const checks = {
    username_login: t.includes("username"),
    national_id: t.includes("National ID"),
    make_password: t.includes("Make your password"),
    username_password_heading: t.includes("username & password") || t.includes("Username & Password"),
    join_us: t.includes("Join us") || t.includes("Join Us"),
  };
  console.log(s.split("/").pop(), JSON.stringify(checks));
}
