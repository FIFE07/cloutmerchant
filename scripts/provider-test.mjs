// Provider connectivity smoke test. Runs against the LIVE provider API.
// Usage: set OWLET_API_KEY (and/or JAP_API_KEY) in .env.local, then:
//   node scripts/provider-test.mjs
// Exits 0 when every configured provider answers correctly.
import { readFileSync } from "node:fs";

// minimal .env.local loader (no extra deps)
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

async function call(baseUrl, key, params) {
  const body = new URLSearchParams({ key, ...params });
  const res = await fetch(baseUrl, { method: "POST", body });
  return res.json();
}

async function testProvider(name, baseUrl, key) {
  if (!key) {
    console.log(`SKIP  ${name}: no API key in .env.local`);
    return true;
  }
  const bal = await call(baseUrl, key, { action: "balance" });
  if (bal.error) {
    console.log(`FAIL  ${name}: balance → ${bal.error}`);
    return false;
  }
  const svcs = await call(baseUrl, key, { action: "services" });
  const count = Array.isArray(svcs) ? svcs.length : 0;
  console.log(`PASS  ${name}: balance ${bal.balance} ${bal.currency}, ${count} services live`);
  return count > 0;
}

let ok = true;
ok = (await testProvider("Owlet", "https://theowlet.com/api/v2", process.env.OWLET_API_KEY)) && ok;
ok = (await testProvider("JAP", "https://justanotherpanel.com/api/v2", process.env.JAP_API_KEY)) && ok;
process.exit(ok ? 0 : 1);
