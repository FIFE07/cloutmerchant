// Pull the full live Owlet catalogue into data/owlet-services.json for
// benchmarking and catalogue sync development.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const key = process.env.OWLET_API_KEY;
if (!key) { console.error("OWLET_API_KEY missing"); process.exit(1); }

const res = await fetch("https://theowlet.com/api/v2", {
  method: "POST",
  body: new URLSearchParams({ key, action: "services" }),
});
const services = await res.json();
if (!Array.isArray(services)) { console.error("Unexpected:", services); process.exit(1); }

mkdirSync("data", { recursive: true });
writeFileSync("data/owlet-services.json", JSON.stringify(services, null, 2));

// Benchmark summary: category counts + price ranges (rate = NGN per 1000)
const byCat = new Map();
for (const s of services) {
  const c = s.category || "Other";
  if (!byCat.has(c)) byCat.set(c, { count: 0, minRate: Infinity, maxRate: 0 });
  const e = byCat.get(c);
  e.count++;
  const r = parseFloat(s.rate);
  if (r > 0) { e.minRate = Math.min(e.minRate, r); e.maxRate = Math.max(e.maxRate, r); }
}
console.log(`Total services: ${services.length}, categories: ${byCat.size}`);
const top = [...byCat.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 20);
for (const [cat, e] of top) {
  console.log(`${cat.padEnd(45)} ${String(e.count).padStart(5)} services  ₦${e.minRate.toFixed(2)}–₦${e.maxRate.toFixed(2)}/1000`);
}
