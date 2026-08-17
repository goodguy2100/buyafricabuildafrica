// Test auth sign-in for the test partner admin.
const email = process.argv[2];
const password = process.argv[3];
const res = await fetch("https://lwgxhverhtktotvowehg.supabase.co/auth/v1/token?grant_type=password", {
  method: "POST",
  headers: {
    apikey: "sb_publishable_DDGwHMKtwbqVaiC-UnukZg_PjgKcTHP",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
});
const body = await res.json();
console.log("status:", res.status);
console.log(body.access_token ? "SIGN-IN OK (access_token present)" : JSON.stringify(body));
