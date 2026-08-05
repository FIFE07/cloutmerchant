# STATE.md — CLOUTMERCHANT build changelog

Append one dated entry per work session: built / verified / blocked / next.

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
