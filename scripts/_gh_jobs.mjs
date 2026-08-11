// Inspect a workflow run: jobs + failing step logs (pass full sha or short)
import { execFileSync } from "child_process";
const out = execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n" });
const tok = out.toString().split("\n").find((l) => l.startsWith("password="))?.slice(9);
if (!tok) { console.log("NO_TOKEN"); process.exit(1); }
const api = "https://api.github.com/repos/goodguy2100/buyafricabuildafrica";
const H = { Authorization: `Bearer ${tok}`, "User-Agent": "eva-check" };

let runId = process.argv[2];
if (!runId) { console.log("usage: _gh_jobs.mjs <runId|sha>"); process.exit(1); }

// If arg looks like a sha, resolve to run id
if (!/^\d+$/.test(runId)) {
  const r = await fetch(`${api}/actions/runs?per_page=10`, { headers: H });
  const d = await r.json();
  const run = (d.workflow_runs ?? []).find((w) => w.head_sha.startsWith(runId));
  if (!run) { console.log("no run for", runId); process.exit(1); }
  runId = run.id;
}

const jr = await fetch(`${api}/actions/runs/${runId}/jobs`, { headers: H });
const jobs = await jr.json();
for (const j of jobs.jobs ?? []) {
  console.log(`job: ${j.name} | ${j.status} | ${j.conclusion}`);
  for (const s of j.steps ?? []) {
    console.log(`  step ${s.number}: ${s.name} | ${s.conclusion ?? s.status}`);
  }
}
