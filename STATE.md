# STATE.md — CLOUTMERCHANT build changelog

Append one dated entry per work session: built / verified / blocked / next.

---

## 2026-08-05 — Session 2 (database live, preview fixed)

**Built**
- Fixed preview failure: middleware now skips session refresh when Supabase env vars are absent (was 500-ing every page before the database existed).
- Created Supabase project **`cloutmerchant`** (ref `pkvudcnbohfwuekcupxi`, eu-west-1, free tier $0/mo) in the owner's existing org — 100% separate database/users/keys from Moor Sports and FIFE.
- Applied migration 0001 to the live database.
- `.env.local` written with project URL + anon key (gitignored). Service-role key intentionally left empty until Week 2 webhooks.
- `scripts/rls-negative-test.mjs` — repeatable Sentinel RLS test (11 checks).

**Verified (live)**
- Schema: 6 categories, 25 demo services, **10/10 tables have RLS enabled**, 9 security-definer functions.
- RLS negative tests: **11/11 PASS** — anonymous client sees 0 rows of orders/transactions/profiles/tickets/notifications/audit_log; can read the public catalogue; `credit_wallet` is permission-denied for non-service roles.
- Preview: dev server serves the home page **HTTP 200** on port 7100 (the earlier "couldn't start" error was the missing env vars, now fixed and server stopped after the test).

**Owner decisions recorded**
- Fulfilment: no existing provider account → plan wholesale provider APIs (Phase 3).
- Database hosting: option (a) — new project inside existing Supabase login.

**Blocked**
- Nothing for Week 1 page work. (Week 2 will need owner click-by-click: Paystack account.)

**Next action**
- Auth flow (signup → email confirm → `/auth/callback` → login → reset), then landing/catalogue/legal pages, all against the live database.

---

## 2026-08-05 — Session 2b (preview help for owner)

- Owner still saw "couldn't start the website" — the earlier preview cards pointed to the pre-move folder (no longer exists). Added **`START-WEBSITE.bat`** in the project root: owner double-clicks it, a browser opens at `http://localhost:7100/` automatically after ~15s; closing the black window stops the site. Port 7100 confirmed free; `node` confirmed at `C:\Program Files\nodejs`. This is now the owner-proof way to view the site, independent of the preview-card system.

---

## 2026-08-05 — Session 1 (Week 1 kickoff)

**Built**
- Repo scaffold at `cloutmerchant/`: Next.js 15.5.22 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + ESLint; `@supabase/supabase-js`, `@supabase/ssr`, `zod` installed.
- `supabase/migrations/0001_init.sql` — full initial schema (10 tables + `profiles_public` view), RLS enabled on every table with explicit policies, SECURITY DEFINER wallet layer (`credit_wallet`, `debit_wallet`, `place_order`, `refund_order`, `adjust_balance`, `regenerate_api_key`), profile column guard trigger, `handle_new_user` signup trigger, audit logging, demo seed catalogue (6 platforms × services = 25 rows, all marked demo).
- Supabase wiring: `src/lib/supabase/{client,server,middleware}.ts` + `src/middleware.ts` (session refresh).
- Design tokens in `src/app/globals.css` (charcoal/cream/electric amber/teal; reduced-motion support; 16px input font anti-zoom rule) and Sora + Inter fonts in `layout.tsx`.
- `.env.example` documenting every secret and which ones are server-only.
- `plan.md` (staged milestones + decisions log), this `STATE.md`, `reports/` for Sentinel/Advocate findings.

**Verified**
- `npm run build` compiles clean (Next 15.5.22, static prerender + middleware). Note: on this machine the build must run from the true on-disk path casing (`Documents\kimi\...` lowercase) — a wrong-case cwd makes webpack load two React copies and the prerender crashes. Recorded so we don't rediscover it.
- Migration NOT yet applied to a live database — awaiting owner confirmation (see below).

**Supabase discovery**
- Connected Supabase account has exactly one existing project: `moorsportsagency@gmail.com's Project` (eu-west-1, ACTIVE_HEALTHY) — belongs to a different venture; will NOT be reused for CLOUTMERCHANT.

**Owner directives (2026-08-05)**
- TOTAL separation from FIFE: project relocated from the FIFE workspace to its own top-level folder `C:\Users\DELL\Documents\CLOUTMERCHANT` (moved + build re-verified there). Separate git repo, separate future Supabase project/database/keys. Owner is willing to use a NEW email + new accounts for CLOUTMERCHANT.
- Owner is a novice: no command-prompt steps in the normal flow; everything must be as automated as possible (payments, keys, fulfilment).
- Owner asked about "Owelet" (likely The Owlet, a Nigerian SMM/bills platform) — either reuse that payment style or pull service plans automatically. Clarifying question sent: automation via official wholesale provider APIs is the compliant route; cloning another site's catalogue is not (brief §2).

**Blocked (owner actions)**
1. Confirm creation of a NEW Supabase project named `cloutmerchant` (free tier; suggest eu-west-1, or af-south-1 Cape Town if you prefer nearest-to-Nigeria latency) so migration 0001 can be applied and RLS negative tests run.
2. Domain, Paystack/Stripe, Resend, LLM key — needed at Weeks 2–4, see plan.md.

**Next action**
- Owner checkpoint: review repo structure + migration 0001 (per brief: "show me the repo structure and the first migration before writing page code").
- Then: apply migration → RLS negative tests → auth flow → landing/catalogue/legal pages.

---

## Cost map (kept current per brief §11)

| Item | Cost | When | Status |
|---|---|---|---|
| Domain (cloutmerchant.com/.io) | ~$10–20/yr | Week 1/4 | Not purchased |
| Vercel hosting | $0 → $20/mo | Week 1 / later | Not deployed |
| Supabase | $0 → $25/mo | Week 1 / later | Project pending owner confirm |
| Paystack + Stripe | ~1.5–3.9% per txn | Week 2 | Accounts not created |
| Transactional email (Resend) | $0 (3k/mo free) | Week 2 | Not created |
| LLM API (assistant) | ~$5–30/mo PAYG | Week 3 | Not created |
| AI build assistance | ~$39–90/mo during build | Now | Active |
| **Total to launch** | **~$150–250 one-off + ~$0–50/mo** | | |

---

## 2026-08-05 — Session 3 (Week 1 public site + auth, live-tested)

**Built**
- Public site: landing `/` (hero, live category grid from the database, how-it-works, honesty strip, CTAs), `/services` catalogue (search + platform chips mirroring nav grouping, public prices, order button routes to signup), `/terms`, `/privacy` (UK GDPR), `/refunds`, `/faq` — all original copy with the honesty language required by brief §2.
- Auth: `/signup` (email confirm, show/hide password eye, consent line), `/login` (warm error mapping, never raw API errors), `/forgot-password` (no account enumeration), `/auth/callback` (app-owned confirmation landing exchanging the code for a session), minimal `/app` dashboard (wallet card + sign out; logged-out visitors redirect to login).
- Shared chrome: header/footer, original spark wordmark logo, Naira/kobo format helpers.
- `scripts/auth-smoke-test.mjs` — repeatable live signup test.
- eslint: disabled `react/no-unescaped-entities` (plain apostrophes in copy are fine; escaping would make legal/marketing copy unmaintainable).

**Verified (live, not assumed)**
- `npm run build` — all 11 routes compile clean (static where possible; `/app` and `/services` server-rendered).
- Real signup against the live project: user created, **email confirmation required = true**, and the `handle_new_user` trigger created the profile row with correct display_name/role/₦0 balance. Test user then deleted (0 smoke users remain).
- The owner's `START-WEBSITE.bat` session hot-reloads these pages automatically.

**Blocked** — nothing for Week 1 remaining items.

**Next action**
- QA pass on a 360px viewport + the Week 1 gate checklist (stranger signup flow), then mega-menu polish; Week 2 kickoff is Paystack (needs owner click-by-click to create the account).

---

## 2026-08-05 — Session 4 (mega-menu + owner preview crash fix)

**Built**
- **Services mega-menu** (spec §14, owner-requested): full-width desktop panel with one column per platform fed live from the database; each service type links to a pre-filtered `/services?platform=…&q=…`; hover reveals one-line description + starting price; closes on Escape and outside click. Mobile: hamburger drawer with per-platform accordions, visible close button AND backdrop tap (no trap).
- `/services` now reads `platform` and `q` URL params so menu deep-links land pre-filtered.
- `START-WEBSITE.bat` is now self-healing: deletes stale `.next` temp files before every start.

**Root cause of the owner's 500 crash (recorded so it never repeats)**
- I ran `rm -rf .next && npm run build` while the owner's dev server was running from the same folder — it scrambled the dev server's runtime chunks (`Cannot find module './331.js'`). **Rule going forward: never run production builds or delete `.next` while the owner's dev server is up.** Owner fix: restart via the bat (now self-cleaning).

**Verified**
- Build: 15/15 routes compile clean.
- Live dev-server check: `/` 200, `/services?platform=instagram&q=Followers` 200, menu data (Followers/Telegram/platform links) present in the page payload sent to the browser. Test server stopped afterwards.

**Next action**
- Owner refreshes via the bat; then Week 1 gate QA (360px viewport + stranger signup), then Week 2 Paystack (owner click-by-click needed).
