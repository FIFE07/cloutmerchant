# CLOUTMERCHANT — Build Plan

Source of truth for scope: the owner's product brief (attached brief, "CLOUTMERCHANT lead full-stack engineer" spec). This file tracks staged milestones and is updated as reality changes.

## Milestones

### Week 1 — Foundation  ◀ CURRENT
- [x] Repo scaffold: Next.js 15 (App Router) + TypeScript + Tailwind v4 + Supabase clients
- [x] Design tokens (charcoal / cream / electric amber / teal; Sora + Inter; reduced-motion; keyboard-safe forms)
- [x] Migration 0001: full schema, RLS everywhere, atomic wallet functions, demo seed catalogue
- [ ] **OWNER CHECKPOINT:** review repo structure + migration 0001 before page code
- [ ] Supabase project created + migration applied + RLS negative tests (anon client reads 0 rows)
- [ ] Auth: signup (email confirm) / login / forgot / `/auth/callback` — tested end-to-end
- [ ] Landing page `/`, `/services` public catalogue, legal pages (`/terms`, `/privacy`, `/refunds`, `/faq`)
- [ ] Vercel staging deploy
- **Gate:** a stranger can sign up, confirm email, log in on their phone with zero confusion.

### Week 2 — Money loop
- [ ] Wallet UI + Paystack test-mode funding (initialize → hosted checkout → `charge.success` webhook → `credit_wallet`)
- [ ] "Verify payment" reconcile button (spec §17.5)
- [ ] Order placement 3-step flow (live price calc → atomic debit via `place_order`)
- [ ] Order history + detail drawer + reorder
- [ ] Basic admin: orders list + manual status, users list + balance adjust (with reason)
- [ ] Refund action → `refund_order` (atomic credit + audit)
- **Gate:** owner funds ₦500 in test mode, orders, sees balance drop; admin refund restores it.

### Week 3 — Catalogue + support
- [ ] Mega-menu nav (desktop) + accordion drawer (mobile) per spec §14
- [ ] Catalogue search/filter chips mirroring menu grouping
- [ ] Tickets + announcements UI
- [ ] AI assistant v1 (server route, rate-limited, persisted conversation, honest caveats)
- [ ] Stripe Checkout + webhook (same credit path as Paystack)
- [ ] Reseller API v1 (`/api/v1/services|orders|orders/:id|balance`, `X-API-Key`, 60 req/min, idempotency key)
- **Gate:** a test reseller key can list services and place an order via curl.

### Week 4 — Polish + launch prep
- [ ] Referral system (`/app/affiliate`)
- [ ] Notifications bell + transactional emails (Resend)
- [ ] Account deletion flow (policy: block while orders pending; then anonymise — spec §17.8)
- [ ] Performance (Lighthouse ≥ 90 mobile), SEO (OG image, sitemap, robots, slugs)
- [ ] Security sweep: RLS audit, secret scan, rate-limit tests (Sentinel + Advocate reports)
- [ ] Custom domain + `OWNER-MANUAL.md`
- **Gate:** owner completes the QA checklist on their own phone.

### Phase 2 (later)
Provider API fulfilment integrations, game top-ups / gift cards / airtime, virtual cards, native app.

## Decisions log
| Date | Decision | Why |
|---|---|---|
| 2026-08-05 | Next.js 15.5 + React 19 (create-next-app@15) | Brief says "Next.js 14+"; 15 is the current stable line on this toolchain |
| 2026-08-05 | Tailwind v4 CSS-first tokens in `globals.css` | Default of the scaffold; keeps tokens in one audited file |
| 2026-08-05 | Wallet cannot go negative (CHECK constraint) | Spec §17.6 — chose "block, suggest partial" policy over negative balances |
| 2026-08-05 | Direct client INSERT on `orders` disabled; orders only via `place_order()` | Makes "validate + debit + create" atomicity unbypassable |
| 2026-08-05 | Profile protected columns (role, balance, api_key, email) guarded by trigger | RLS alone can't split column permissions cleanly; trigger is explicit + auditable |
| 2026-08-05 | Seed marked `provider='demo'`, descriptions say "Demo catalogue entry" | Honesty rule §2.4 — nothing fake on the site |

## Blocked on owner
1. Supabase project (can be created via the connected Supabase integration once you confirm).
2. Domain purchase (Week 1/4) — ~$10–20/yr.
3. Paystack + Stripe accounts (Week 2) — need your business details.
4. Resend account + sender domain (Week 2+).
5. LLM API key for the assistant (Week 3).
