const fs = require("fs");
const files = [
  "src/components/Header.tsx",
  "src/components/Footer.tsx",
  "src/routes/index.tsx",
  "src/routes/events.tsx",
  "src/routes/about.tsx",
  "src/routes/pillars.tsx",
];
for (const f of files) {
  const c = fs.readFileSync(f, "utf8");
  const n =
    (c.match(/to="\/register"/g) || []).length +
    (c.match(/to: "\/register"/g) || []).length;
  const out = c
    .replace(/to="\/register"/g, 'to="/auth"')
    .replace(/to: "\/register"/g, 'to: "/auth"');
  fs.writeFileSync(f, out, "utf8");
  console.log(f, "->", n, "replaced");
}
