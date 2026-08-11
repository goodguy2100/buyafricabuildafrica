// Download run logs, extract the Deploy to GitHub Pages step log
import { execFileSync } from "child_process";
import fs from "fs";
const out = execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n" });
const tok = out.toString().split("\n").find((l) => l.startsWith("password="))?.slice(9);
if (!tok) { console.log("NO_TOKEN"); process.exit(1); }
const api = "https://api.github.com/repos/goodguy2100/buyafricabuildafrica";
const H = { Authorization: `Bearer ${tok}`, "User-Agent": "eva-check" };

let runId = process.argv[2];
if (!/^\d+$/.test(runId)) {
  const r = await fetch(`${api}/actions/runs?per_page=10`, { headers: H });
  const d = await r.json();
  const run = (d.workflow_runs ?? []).find((w) => w.head_sha.startsWith(runId));
  if (!run) { console.log("no run for", runId); process.exit(1); }
  runId = run.id;
}

const r = await fetch(`${api}/actions/runs/${runId}/logs`, { headers: H, redirect: "follow" });
if (!r.ok) { console.log("log fetch status", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
fs.writeFileSync("_run_logs.zip", buf);
console.log("saved", buf.length, "bytes");
