// Check GitHub Actions runs using the credential cached in git (never printed)
import { execFileSync } from "child_process";
const out = execFileSync("git", ["credential", "fill"], {
  input: "protocol=https\nhost=github.com\n",
});
const lines = out.toString().split("\n");
const tok = lines.find((l) => l.startsWith("password="))?.slice(9);
if (!tok) { console.log("NO_TOKEN_IN_CREDENTIAL_MANAGER"); process.exit(1); }

const api = "https://api.github.com/repos/goodguy2100/buyafricabuildafrica";
const r = await fetch(`${api}/actions/runs?per_page=8`, {
  headers: { Authorization: `Bearer ${tok}`, "User-Agent": "eva-check" },
});
console.log("runs status:", r.status);
if (!r.ok) { console.log((await r.text()).slice(0, 300)); process.exit(0); }
const d = await r.json();
for (const w of d.workflow_runs ?? []) {
  console.log(`${w.head_sha.slice(0, 7)} | ${w.status} | ${w.conclusion ?? "-"} | ${w.name} | ${w.created_at}`);
}

// Also list recent commits on main to confirm our push is there
const rc = await fetch(`${api}/commits?per_page=3`, {
  headers: { Authorization: `Bearer ${tok}`, "User-Agent": "eva-check" },
});
const commits = await rc.json();
console.log("--- recent main commits ---");
for (const c of commits ?? []) console.log(`${c.sha.slice(0, 7)} | ${c.commit.message.split("\n")[0]}`);
