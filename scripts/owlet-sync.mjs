// Generates chunked SQL to sync the live Owlet catalogue into our DB.
// Pricing policy: cost (NGN/1000) -> store price = cost x 1.18, reseller = cost x 1.10
// (both in kobo, integer ceiling). Owlet service id is stored as reference —
// never any secret (spec §9.2).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const services = JSON.parse(readFileSync("data/owlet-services.json", "utf8"));

const MARGIN = 1.18;
const RESELLER_MARGIN = 1.10;

const PLATFORM_RULES = [
  [/instagram|\b ig \b|\bigb\b/i, "instagram"],
  [/tiktok/i, "tiktok"],
  [/youtube|\byt\b/i, "youtube"],
  [/twitter|\bx\b|𝕏/i, "x"],
  [/facebook|\bfb\b/i, "facebook"],
  [/telegram/i, "telegram"],
  [/spotify|soundcloud|apple music|audiomack|shazam|deezer|tidal|boomplay|music/i, "music"],
  [/whatsapp/i, "whatsapp"],
  [/discord/i, "discord"],
  [/twitch|\bkick\b/i, "streaming"],
  [/snapchat/i, "snapchat"],
  [/linkedin/i, "linkedin"],
  [/pinterest/i, "pinterest"],
  [/website|traffic|e-?commerce|seo|visitors|backlink/i, "webtraffic"],
  [/vote|poll|contest/i, "votes"],
];

function classify(text) {
  for (const [re, slug] of PLATFORM_RULES) if (re.test(text)) return slug;
  return "other";
}

const esc = (s) => String(s ?? "").replace(/'/g, "''");

const rows = [];
let skipped = 0;
for (const s of services) {
  const costNgn = parseFloat(s.rate);
  const min = parseInt(s.min, 10);
  const max = parseInt(s.max, 10);
  if (!Number.isFinite(costNgn) || costNgn <= 0 || !Number.isFinite(min) || !Number.isFinite(max) || min < 1 || max < min) {
    skipped++;
    continue;
  }
  const slug = classify(`${s.category} ${s.name}`);
  const priceKobo = Math.ceil(costNgn * 100 * MARGIN);
  const resellerKobo = Math.ceil(costNgn * 100 * RESELLER_MARGIN);
  const desc = `${s.type} · ${s.category}`.slice(0, 300);
  rows.push(
    `('${esc(slug)}', '${esc(s.name.slice(0, 180))}', '${esc(desc)}', '${s.service}', ${priceKobo}, ${resellerKobo}, ${min}, ${max}, ${s.refill === true || s.refill === "true"})`,
  );
}

console.log(`Prepared ${rows.length} services, skipped ${skipped} (bad rate/limits)`);

mkdirSync("data/sync", { recursive: true });
const CHUNK = 300;
let files = 0;
for (let i = 0; i < rows.length; i += CHUNK) {
  const part = rows.slice(i, i + CHUNK).join(",\n");
  const sql = `insert into public.services
  (category_id, name, description, provider, provider_service_id, price_per_1000_kobo, reseller_price_per_1000_kobo, min_qty, max_qty, avg_time, refill, is_active)
select c.id, v.name, v.description, 'owlet', v.psid, v.price, v.reseller, v.minq, v.maxq, '', v.refill, true
from (values\n${part}\n) as v(slug, name, description, psid, price, reseller, minq, maxq, refill)
join public.service_categories c on c.slug = v.slug;\n`;
  writeFileSync(`data/sync/chunk-${String(files).padStart(3, "0")}.sql`, sql);
  files++;
}
// Chunk 000 prefix: clear previous owlet sync so reruns are clean
writeFileSync("data/sync/chunk-000-clear.sql", "delete from public.services where provider = 'owlet';\n");
console.log(`Wrote ${files} chunks + clear chunk to data/sync/`);
