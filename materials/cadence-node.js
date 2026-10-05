// Runs the browser engine (assets/cadence-live.js) under node on the shipped sample and prints
// canon JSON in the same shape as cadence-reference.py. Usage: node materials/cadence-node.js
const path = require("path");
global.window = undefined;
const src = require("fs").readFileSync(path.join(__dirname, "..", "assets", "cadence-sample.js"), "utf8");
const S = JSON.parse(src.match(/window\.CADENCE_SAMPLE = (\{.*\});/s)[1]);
const E = require(path.join(__dirname, "..", "assets", "cadence-live.js"));
const out = E.computeAll(S, 0);
out.shuffled = {};
for (const sd of [1, 4, 7, 10, 13]) { const r = E.computeAll(S, sd).shuffled; delete r.seed; out.shuffled[String(sd)] = r; }
function r6(v) {
  if (typeof v === "number") return Math.floor(v * 1e6 + 0.5) / 1e6;
  if (Array.isArray(v)) return v.map(r6);
  if (v && typeof v === "object") { const o = {}; Object.keys(v).sort().forEach(k => o[k] = r6(v[k])); return o; }
  return v;
}
console.log(JSON.stringify(r6(out), null, 1));
