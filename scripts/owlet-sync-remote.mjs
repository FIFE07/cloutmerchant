// FULL AUTOMATED SYNC: pull live Owlet catalogue → classify → upsert into
// Supabase via the service role (server-only). One command, repeatable:
//   node scripts/owlet-sync-remote.mjs
// Needs OWLET_API_KEY + SUPABASE_SERVICE_ROLE_KEY in .env.local.
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const { OWLET_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!OWLET_API_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Need OWLET_API_KEY and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const MARGIN = 1.18, RESELLER_MARGIN = 1.10;
const RULES = [
  [/instagram|\b ig \b|\bigb\b/i, "instagram"], [/tiktok/i, "tiktok"],
  [/youtube|\byt\b/i, "youtube"], [/twitter|\bx\b|𝕏/i, "x"],
  [/facebook|\bfb\b/i, "facebook"], [/telegram/i, "telegram"],
  [/spotify|soundcloud|apple music|audiomack|shazam|deezer|tidal|boomplay|music/i, "music"],
  [/whatsapp/i, "whatsapp"], [/discord/i, "discord"],
  [/twitch|\bkick\b/i, "streaming"], [/snapchat/i, "snapchat"],
  [/linkedin/i, "linkedin"], [/pinterest/i, "pinterest"],
  [/website|traffic|e-?commerce|seo|visitors|backlink/i, "webtraffic"],
  [/vote|poll|contest/i, "votes"],
];
const classify = (t) => (RULES.find(([re]) => re.test(t)) || [, "other"])[1];

// Sub-category: clean engagement-type grouping (Followers / Likes / Views …)
// derived from the provider's messy emoji-heavy category names.
const SUB_RULES = [
  [/live|broadcast/i, "Live"],
  [/stor(y|ies)/i, "Stories"],
  [/poll|vote/i, "Polls & Votes"],
  [/\bdm\b|direct message|mass dm/i, "Messages (DM)"],
  [/verif|blue ?tick|badge/i, "Verification"],
  [/comment|mention|reply/i, "Comments & Mentions"],
  [/like|reaction/i, "Likes & Reactions"],
  [/view|watch|impression|reach|\bplay|stream|listen/i, "Views & Plays"],
  [/follow|subscriber|member|join/i, "Followers & Members"],
  [/share|repost|retweet|save|re-?post/i, "Shares & Saves"],
  [/traffic|visitor|seo|backlink|website/i, "Website Traffic"],
  [/pack|bundle|combo|growth|boost/i, "Packages & Boosts"],
];
const subClassify = (t) => (SUB_RULES.find(([re]) => re.test(t)) || [, "Other"])[1];

console.log("Pulling live Owlet catalogue…");
const res = await fetch("https://theowlet.com/api/v2", {
  method: "POST",
  body: new URLSearchParams({ key: OWLET_API_KEY, action: "services" }),
});
const list = await res.json();
if (!Array.isArray(list)) { console.error("Owlet error:", list); process.exit(1); }
console.log(`${list.length} services from Owlet`);

const hdrs = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};
const base = `${NEXT_PUBLIC_SUPABASE_URL}/rest/v1`;

const cats = await (await fetch(`${base}/service_categories?select=id,slug`, { headers: hdrs })).json();
const catId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

console.log("Clearing previous Owlet rows…");
await fetch(`${base}/services?provider=eq.owlet`, { method: "DELETE", headers: hdrs });

const rows = [];
for (const s of list) {
  const cost = parseFloat(s.rate), min = parseInt(s.min, 10), max = parseInt(s.max, 10);
  if (!cost || cost <= 0 || !min || !max || max < min) continue;
  rows.push({
    category_id: catId[classify(`${s.category} ${s.name}`)],
    subcategory: subClassify(`${s.category} ${s.name}`),
    name: String(s.name).slice(0, 180),
    description: `${s.type} · ${s.category}`.slice(0, 300),
    provider: "owlet",
    provider_service_id: String(s.service),
    price_per_1000_kobo: Math.ceil(cost * 100 * MARGIN),
    reseller_price_per_1000_kobo: Math.ceil(cost * 100 * RESELLER_MARGIN),
    min_qty: min, max_qty: max,
    refill: s.refill === true || s.refill === "true",
    is_active: true,
  });
}

const B = 400;
for (let i = 0; i < rows.length; i += B) {
  const r = await fetch(`${base}/services`, {
    method: "POST", headers: hdrs, body: JSON.stringify(rows.slice(i, i + B)),
  });
  if (!r.ok) { console.error("Insert failed:", r.status, await r.text()); process.exit(1); }
  console.log(`  synced ${Math.min(i + B, rows.length)}/${rows.length}`);
}
console.log(`DONE — ${rows.length} live services in the CLOUTMERCHANT catalogue.`);
