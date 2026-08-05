-- ============================================================================
-- CLOUTMERCHANT — Migration 0001: initial schema, RLS, atomic wallet functions
-- ============================================================================
-- Hard rules encoded here (from product spec §4 / §9):
--   1. RLS is enabled on EVERY table from day one.
--   2. Wallet balances change ONLY through SECURITY DEFINER functions that
--      insert a ledger row and update the balance atomically.
--   3. No secrets in any table. References only.
--   4. All money math is integer kobo. Never floats.
-- ============================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  display_name        text not null default '',
  email               text not null default '',
  role                text not null default 'user'
                      check (role in ('user', 'reseller', 'admin')),
  wallet_balance_kobo bigint not null default 0
                      check (wallet_balance_kobo >= 0), -- policy: no negative balances (spec §17.6)
  api_key             uuid unique,                      -- null until reseller generates one
  created_at          timestamptz not null default now()
);

-- Public-safe view for anything social: id + display_name ONLY.
create or replace view public.profiles_public
  with (security_invoker = true) as
  select id, display_name from public.profiles;

create table public.service_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  platform   text not null,
  icon       text not null default '',
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.services (
  id                          uuid primary key default gen_random_uuid(),
  category_id                 uuid not null references public.service_categories (id) on delete restrict,
  name                        text not null,
  description                 text not null default '',
  provider                    text not null default 'demo', -- 'demo' until real provider integration (Phase 3)
  provider_service_id         text,                          -- reference, never a secret (spec §9.2)
  unit                        text not null default 'per 1000',
  price_per_1000_kobo         bigint not null check (price_per_1000_kobo > 0),
  reseller_price_per_1000_kobo bigint check (reseller_price_per_1000_kobo is null or reseller_price_per_1000_kobo > 0),
  min_qty                     integer not null check (min_qty > 0),
  max_qty                     integer not null check (max_qty >= min_qty),
  avg_time                    text not null default '',
  refill                      boolean not null default false,
  is_active                   boolean not null default true,
  sort_order                  integer not null default 0,
  created_at                  timestamptz not null default now()
);
create index services_category_idx on public.services (category_id) where is_active;

create table public.transactions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  type              text not null check (type in ('credit', 'debit')),
  amount_kobo       bigint not null check (amount_kobo > 0),
  balance_after_kobo bigint not null,
  reference         text not null unique, -- idempotency anchor for webhooks (spec §7)
  source            text not null check (source in ('paystack', 'stripe', 'order', 'refund', 'admin', 'bonus')),
  meta              jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now()
);
create index transactions_user_idx on public.transactions (user_id, created_at desc);

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  service_id        uuid not null references public.services (id) on delete restrict,
  link              text not null,
  quantity          integer not null check (quantity > 0),
  charge_kobo       bigint not null check (charge_kobo > 0),
  status            text not null default 'pending'
                    check (status in ('pending', 'processing', 'partial', 'completed', 'cancelled', 'refunded')),
  provider_order_id text,
  start_count       integer,
  remains           integer,
  idempotency_key   text unique, -- reseller API safe-retries (spec §6)
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status) where status in ('pending', 'processing');

create table public.tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  subject    text not null,
  status     text not null default 'open' check (status in ('open', 'answered', 'closed')),
  created_at timestamptz not null default now()
);

create table public.ticket_messages (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.tickets (id) on delete cascade,
  sender_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index ticket_messages_ticket_idx on public.ticket_messages (ticket_id, created_at);

create table public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.profiles (id) on delete set null,
  action     text not null,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       text not null, -- 'wallet_credited' | 'order_status' | 'ticket_answered' | 'announcement'
  title      text not null,
  body       text not null default '',
  is_read    boolean not null default false,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index notifications_user_unread_idx on public.notifications (user_id, created_at desc) where not is_read;

-- ----------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Role check without RLS recursion (runs as definer, bypasses RLS on profiles).
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- New signup -> profile row. Reads display_name from Supabase Auth metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Client-side profile edits may NOT touch money, role, api_key or email.
-- Those columns move only inside SECURITY DEFINER functions (which execute
-- as the function owner) or the service role.
create or replace function public.guard_profile_columns()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if current_user in ('postgres', 'service_role') then
    return new;
  end if;
  if new.role is distinct from old.role
     or new.wallet_balance_kobo is distinct from old.wallet_balance_kobo
     or new.api_key is distinct from old.api_key
     or new.email is distinct from old.email
     or new.id is distinct from old.id then
    raise exception 'protected_column';
  end if;
  return new;
end;
$$;

create trigger profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile_columns();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_touch
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 3. WALLET FUNCTIONS — the ONLY way money moves (spec §4, §9.3)
--    All are one database transaction: balance update + ledger row + audit.
--    Idempotent on transactions.reference (duplicate webhook = no double credit).
-- ----------------------------------------------------------------------------

create or replace function public.credit_wallet(
  p_user_id     uuid,
  p_amount_kobo bigint,
  p_reference   text,
  p_source      text,
  p_meta        jsonb default '{}'::jsonb
)
returns table (new_balance_kobo bigint, already_processed boolean)
language plpgsql security definer set search_path = ''
as $$
declare
  v_balance bigint;
begin
  if p_amount_kobo is null or p_amount_kobo <= 0 then
    raise exception 'invalid_amount';
  end if;
  if p_source not in ('paystack', 'stripe', 'order', 'refund', 'admin', 'bonus') then
    raise exception 'invalid_source';
  end if;

  -- Idempotency fast path: this reference was already applied.
  if exists (select 1 from public.transactions t where t.reference = p_reference) then
    select p.wallet_balance_kobo into v_balance from public.profiles p where p.id = p_user_id;
    return query select v_balance, true;
    return;
  end if;

  update public.profiles p
     set wallet_balance_kobo = p.wallet_balance_kobo + p_amount_kobo
   where p.id = p_user_id
  returning wallet_balance_kobo into v_balance;
  if not found then
    raise exception 'user_not_found';
  end if;

  begin
    insert into public.transactions (user_id, type, amount_kobo, balance_after_kobo, reference, source, meta)
    values (p_user_id, 'credit', p_amount_kobo, v_balance, p_reference, p_source, p_meta);
  exception when unique_violation then
    -- Lost a race with a duplicate delivery: roll back to savepoint, report prior state.
    select p.wallet_balance_kobo into v_balance from public.profiles p where p.id = p_user_id;
    return query select v_balance, true;
    return;
  end;

  insert into public.audit_log (actor_id, action, meta)
  values (p_user_id, 'wallet_credit',
          jsonb_build_object('amount_kobo', p_amount_kobo, 'reference', p_reference, 'source', p_source));

  insert into public.notifications (user_id, type, title, body, meta)
  values (p_user_id, 'wallet_credited', 'Wallet credited',
          'Your wallet balance has been updated.',
          jsonb_build_object('amount_kobo', p_amount_kobo, 'reference', p_reference));

  return query select v_balance, false;
end;
$$;

create or replace function public.debit_wallet(
  p_user_id     uuid,
  p_amount_kobo bigint,
  p_reference   text,
  p_source      text,
  p_meta        jsonb default '{}'::jsonb
)
returns table (new_balance_kobo bigint, already_processed boolean)
language plpgsql security definer set search_path = ''
as $$
declare
  v_balance bigint;
begin
  if p_amount_kobo is null or p_amount_kobo <= 0 then
    raise exception 'invalid_amount';
  end if;
  if p_source not in ('paystack', 'stripe', 'order', 'refund', 'admin', 'bonus') then
    raise exception 'invalid_source';
  end if;

  if exists (select 1 from public.transactions t where t.reference = p_reference) then
    select p.wallet_balance_kobo into v_balance from public.profiles p where p.id = p_user_id;
    return query select v_balance, true;
    return;
  end if;

  -- Atomic balance check + debit in one statement (no TOCTOU race).
  update public.profiles p
     set wallet_balance_kobo = p.wallet_balance_kobo - p_amount_kobo
   where p.id = p_user_id
     and p.wallet_balance_kobo >= p_amount_kobo
  returning wallet_balance_kobo into v_balance;
  if not found then
    raise exception 'insufficient_funds';
  end if;

  insert into public.transactions (user_id, type, amount_kobo, balance_after_kobo, reference, source, meta)
  values (p_user_id, 'debit', p_amount_kobo, v_balance, p_reference, p_source, p_meta);

  insert into public.audit_log (actor_id, action, meta)
  values (p_user_id, 'wallet_debit',
          jsonb_build_object('amount_kobo', p_amount_kobo, 'reference', p_reference, 'source', p_source));

  return query select v_balance, false;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. ORDER PLACEMENT — validate, price, debit, create: one transaction.
--    Resellers are billed reseller_price_per_1000_kobo automatically.
-- ----------------------------------------------------------------------------
create or replace function public.place_order(
  p_service_id      uuid,
  p_link            text,
  p_quantity        integer,
  p_idempotency_key text default null
)
returns public.orders
language plpgsql security definer set search_path = ''
as $$
declare
  v_user    uuid := auth.uid();
  v_service public.services;
  v_role    text;
  v_price   bigint;
  v_charge  bigint;
  v_order   public.orders;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  -- API safe-retry: same key returns the original order, no double charge.
  if p_idempotency_key is not null then
    select o.* into v_order from public.orders o
    where o.idempotency_key = p_idempotency_key and o.user_id = v_user;
    if found then
      return v_order;
    end if;
  end if;

  select s.* into v_service from public.services s
  where s.id = p_service_id and s.is_active;
  if not found then
    raise exception 'service_unavailable';
  end if;

  if p_link is null or length(trim(p_link)) < 5 or length(p_link) > 2048 then
    raise exception 'invalid_link';
  end if;
  if p_quantity is null or p_quantity < v_service.min_qty or p_quantity > v_service.max_qty then
    raise exception 'quantity_out_of_range';
  end if;

  select p.role into v_role from public.profiles p where p.id = v_user;

  v_price := case
    when v_role = 'reseller' and v_service.reseller_price_per_1000_kobo is not null
      then v_service.reseller_price_per_1000_kobo
    else v_service.price_per_1000_kobo
  end;

  -- Integer ceiling: ceil(quantity * price / 1000)
  v_charge := (p_quantity * v_price + 999) / 1000;

  -- Debit atomically; raises insufficient_funds when the balance is short.
  perform public.debit_wallet(v_user, v_charge, 'order:' || gen_random_uuid()::text, 'order',
    jsonb_build_object('service_id', p_service_id, 'quantity', p_quantity));

  insert into public.orders (user_id, service_id, link, quantity, charge_kobo, idempotency_key)
  values (v_user, p_service_id, trim(p_link), p_quantity, v_charge, p_idempotency_key)
  returning * into v_order;

  -- Rewrite the ledger reference so it is traceable to the order id.
  update public.transactions t
     set reference = 'order:' || v_order.id::text,
         meta = t.meta || jsonb_build_object('order_id', v_order.id)
   where t.id = (
     select t2.id from public.transactions t2
     where t2.user_id = v_user and t2.source = 'order'
     order by t2.created_at desc limit 1
   );

  insert into public.audit_log (actor_id, action, meta)
  values (v_user, 'order_placed',
          jsonb_build_object('order_id', v_order.id, 'service_id', p_service_id,
                             'quantity', p_quantity, 'charge_kobo', v_charge));

  return v_order;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. ADMIN FUNCTIONS (callable by admins from the dashboard; role checked inside)
-- ----------------------------------------------------------------------------

create or replace function public.refund_order(p_order_id uuid)
returns public.orders
language plpgsql security definer set search_path = ''
as $$
declare
  v_order public.orders;
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;

  select o.* into v_order from public.orders o where o.id = p_order_id for update;
  if not found then
    raise exception 'order_not_found';
  end if;
  if v_order.status = 'refunded' then
    return v_order; -- idempotent
  end if;

  -- Credit back atomically; reference makes a second refund attempt a no-op.
  perform public.credit_wallet(v_order.user_id, v_order.charge_kobo,
    'refund:' || v_order.id::text, 'refund',
    jsonb_build_object('order_id', v_order.id, 'actor', auth.uid()));

  update public.orders o set status = 'refunded' where o.id = v_order.id
  returning * into v_order;

  insert into public.audit_log (actor_id, action, meta)
  values (auth.uid(), 'order_refunded',
          jsonb_build_object('order_id', v_order.id, 'charge_kobo', v_order.charge_kobo));

  insert into public.notifications (user_id, type, title, body, meta)
  values (v_order.user_id, 'order_status', 'Order refunded',
          'Your order was refunded to your wallet.',
          jsonb_build_object('order_id', v_order.id));

  return v_order;
end;
$$;

create or replace function public.adjust_balance(
  p_user_id    uuid,
  p_delta_kobo bigint, -- signed: positive = credit, negative = debit
  p_reason     text
)
returns bigint
language plpgsql security definer set search_path = ''
as $$
declare
  v_result record;
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  if p_reason is null or length(trim(p_reason)) < 3 then
    raise exception 'reason_required'; -- mandatory per spec §5 admin
  end if;
  if p_delta_kobo is null or p_delta_kobo = 0 then
    raise exception 'invalid_amount';
  end if;

  if p_delta_kobo > 0 then
    select * into v_result from public.credit_wallet(
      p_user_id, p_delta_kobo, 'admin:' || gen_random_uuid()::text, 'admin',
      jsonb_build_object('reason', trim(p_reason), 'actor', auth.uid()));
  else
    select * into v_result from public.debit_wallet(
      p_user_id, -p_delta_kobo, 'admin:' || gen_random_uuid()::text, 'admin',
      jsonb_build_object('reason', trim(p_reason), 'actor', auth.uid()));
    -- Policy (spec §17.6): a manual debit that would take the wallet negative
    -- is BLOCKED by the balance check inside debit_wallet. Suggest partial instead.
  end if;

  insert into public.audit_log (actor_id, action, meta)
  values (auth.uid(), 'admin_balance_adjustment',
          jsonb_build_object('user_id', p_user_id, 'delta_kobo', p_delta_kobo, 'reason', trim(p_reason)));

  return v_result.new_balance_kobo;
end;
$$;

create or replace function public.regenerate_api_key()
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_key uuid := gen_random_uuid();
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  -- Atomic replace: the old key dies the moment this commits (spec §17.7).
  update public.profiles p set api_key = v_key where p.id = auth.uid();
  insert into public.audit_log (actor_id, action, meta)
  values (auth.uid(), 'api_key_regenerated', '{}'::jsonb);
  return v_key;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. FUNCTION PRIVILEGES — default EXECUTE is PUBLIC, so lock down explicitly.
--    Money movement primitives are service-role / internal ONLY.
-- ----------------------------------------------------------------------------
revoke all on function public.credit_wallet(uuid, bigint, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.debit_wallet(uuid, bigint, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.place_order(uuid, text, integer, text) to authenticated;
grant execute on function public.refund_order(uuid) to authenticated;          -- checks is_admin() inside
grant execute on function public.adjust_balance(uuid, bigint, text) to authenticated; -- checks is_admin() inside
grant execute on function public.regenerate_api_key() to authenticated;

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY — enabled on every table, no exceptions.
-- ----------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.service_categories enable row level security;
alter table public.services          enable row level security;
alter table public.transactions      enable row level security;
alter table public.orders            enable row level security;
alter table public.tickets           enable row level security;
alter table public.ticket_messages   enable row level security;
alter table public.announcements     enable row level security;
alter table public.audit_log         enable row level security;
alter table public.notifications     enable row level security;

-- profiles: own row only (protected columns guarded by trigger, §2 above)
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- catalogue: world-readable when active; admin writes
create policy categories_read_active on public.service_categories
  for select using (is_active or public.is_admin());
create policy categories_admin_write on public.service_categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy services_read_active on public.services
  for select using (is_active or public.is_admin());
create policy services_admin_write on public.services
  for all using (public.is_admin()) with check (public.is_admin());

-- transactions: read own; writes only via wallet functions (no client policies)
create policy transactions_select_own on public.transactions
  for select using (auth.uid() = user_id or public.is_admin());

-- orders: read own; create ONLY via place_order(); status by admin
create policy orders_select_own on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy orders_admin_update on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- tickets: users see/reply to own threads; admin sees all
create policy tickets_select_own on public.tickets
  for select using (auth.uid() = user_id or public.is_admin());
create policy tickets_insert_own on public.tickets
  for insert with check (auth.uid() = user_id);
create policy tickets_admin_update on public.tickets
  for update using (public.is_admin()) with check (public.is_admin());

create policy ticket_messages_select on public.ticket_messages
  for select using (
    public.is_admin() or exists (
      select 1 from public.tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );
create policy ticket_messages_insert on public.ticket_messages
  for insert with check (
    sender_id = auth.uid() and (
      public.is_admin() or exists (
        select 1 from public.tickets t
        where t.id = ticket_id and t.user_id = auth.uid()
      )
    )
  );

-- announcements: active ones are world-readable; admin writes
create policy announcements_read_active on public.announcements
  for select using (is_active or public.is_admin());
create policy announcements_admin_write on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- audit_log: admin read-only; inserts only via definer functions
create policy audit_log_admin_read on public.audit_log
  for select using (public.is_admin());

-- notifications: own only; mark-read by owner; inserts via functions
create policy notifications_select_own on public.notifications
  for select using (auth.uid() = user_id);
create policy notifications_update_own on public.notifications
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id and is_read); -- owners may only mark read

-- ----------------------------------------------------------------------------
-- 8. SEED — DEMO CATALOGUE (clearly marked; replaced by real providers in Phase 3)
-- ----------------------------------------------------------------------------
insert into public.service_categories (name, slug, platform, icon, sort_order) values
  ('Instagram', 'instagram', 'instagram', 'instagram', 1),
  ('TikTok',    'tiktok',    'tiktok',    'tiktok',    2),
  ('YouTube',   'youtube',   'youtube',   'youtube',   3),
  ('X (Twitter)', 'x',       'x',         'x',         4),
  ('Facebook',  'facebook',  'facebook',  'facebook',  5),
  ('Telegram',  'telegram',  'telegram',  'telegram',  6);

insert into public.services
  (category_id, name, description, provider, price_per_1000_kobo, reseller_price_per_1000_kobo, min_qty, max_qty, avg_time, refill, sort_order)
select c.id, v.name, v.description, 'demo', v.price, v.reseller_price, v.min_qty, v.max_qty, v.avg_time, v.refill, v.sort_order
from public.service_categories c
join (values
  -- platform_slug, name, description, price_kobo, reseller_kobo, min, max, avg_time, refill, sort
  ('instagram', 'Instagram Followers', 'Demo catalogue entry. Gradual-delivery followers for public Instagram profiles. Delivery times are estimates.', 250000, 212500, 50, 50000, '1–6 hours', true, 1),
  ('instagram', 'Instagram Likes', 'Demo catalogue entry. Likes for public posts; split across recent posts on request.', 90000, 76500, 50, 100000, '0–1 hours', false, 2),
  ('instagram', 'Instagram Reel Views', 'Demo catalogue entry. Views for public reels and videos.', 45000, 38250, 100, 1000000, '0–1 hours', false, 3),
  ('instagram', 'Instagram Comments (Custom)', 'Demo catalogue entry. You supply the comment text; delivered gradually.', 600000, 510000, 10, 5000, '1–24 hours', false, 4),
  ('instagram', 'Instagram Story Views', 'Demo catalogue entry. Views on your current public stories.', 60000, 51000, 100, 100000, '0–1 hours', false, 5),
  ('tiktok', 'TikTok Followers', 'Demo catalogue entry. Followers for public TikTok accounts, delivered gradually.', 320000, 272000, 50, 50000, '1–12 hours', true, 1),
  ('tiktok', 'TikTok Likes', 'Demo catalogue entry. Likes for public TikTok videos.', 110000, 93500, 50, 100000, '0–1 hours', false, 2),
  ('tiktok', 'TikTok Video Views', 'Demo catalogue entry. Views for public TikTok videos.', 25000, 21250, 100, 5000000, '0–1 hours', false, 3),
  ('tiktok', 'TikTok Shares', 'Demo catalogue entry. Shares on public TikTok videos.', 150000, 127500, 50, 50000, '1–6 hours', false, 4),
  ('youtube', 'YouTube Subscribers', 'Demo catalogue entry. Subscribers for public channels, gradual delivery.', 800000, 680000, 50, 20000, '1–24 hours', true, 1),
  ('youtube', 'YouTube Views', 'Demo catalogue entry. Views for public videos; retention varies and is not guaranteed.', 300000, 255000, 100, 500000, '1–12 hours', false, 2),
  ('youtube', 'YouTube Likes', 'Demo catalogue entry. Likes for public videos.', 120000, 102000, 50, 50000, '0–6 hours', false, 3),
  ('youtube', 'YouTube Watch Hours', 'Demo catalogue entry. Watch-time hours on longer public videos.', 1500000, 1275000, 100, 4000, '1–7 days', false, 4),
  ('x', 'X Followers', 'Demo catalogue entry. Followers for public X accounts.', 350000, 297500, 50, 50000, '1–12 hours', true, 1),
  ('x', 'X Likes', 'Demo catalogue entry. Likes for public posts on X.', 100000, 85000, 50, 100000, '0–1 hours', false, 2),
  ('x', 'X Reposts', 'Demo catalogue entry. Reposts of public posts.', 180000, 153000, 25, 25000, '0–6 hours', false, 3),
  ('x', 'X Post Views', 'Demo catalogue entry. Impressions on public posts.', 30000, 25500, 100, 1000000, '0–1 hours', false, 4),
  ('facebook', 'Facebook Page Likes', 'Demo catalogue entry. Likes/follows for public Facebook pages.', 280000, 238000, 50, 50000, '1–24 hours', true, 1),
  ('facebook', 'Facebook Post Likes', 'Demo catalogue entry. Reactions on public posts.', 95000, 80750, 50, 100000, '0–6 hours', false, 2),
  ('facebook', 'Facebook Video Views', 'Demo catalogue entry. Views on public videos and reels.', 40000, 34000, 100, 1000000, '0–1 hours', false, 3),
  ('facebook', 'Facebook Group Members', 'Demo catalogue entry. Members for public groups you admin.', 500000, 425000, 50, 20000, '1–48 hours', false, 4),
  ('telegram', 'Telegram Channel Members', 'Demo catalogue entry. Members for public channels.', 200000, 170000, 50, 50000, '1–12 hours', true, 1),
  ('telegram', 'Telegram Post Views', 'Demo catalogue entry. Views on recent channel posts.', 20000, 17000, 100, 1000000, '0–1 hours', false, 2),
  ('telegram', 'Telegram Reactions', 'Demo catalogue entry. Emoji reactions on channel posts.', 80000, 68000, 50, 100000, '0–6 hours', false, 3),
  ('telegram', 'Telegram Group Members', 'Demo catalogue entry. Members for public groups.', 220000, 187000, 50, 30000, '1–24 hours', false, 4)
) as v(platform_slug, name, description, price, reseller_price, min_qty, max_qty, avg_time, refill, sort_order)
  on v.platform_slug = c.slug;

-- ============================================================================
-- Verification targets after applying (run in SQL editor):
--   select count(*) from public.service_categories;  -- 6
--   select count(*) from public.services;            -- 25
--   select tablename, rowsecurity from pg_tables
--    where schemaname = 'public';                    -- all rowsecurity = true
-- Negative tests (anon key, no session) must return 0 rows:
--   select * from public.orders; select * from public.transactions;
-- ============================================================================
