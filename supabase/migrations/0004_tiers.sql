-- 0004: quality tier per service, computed from live provider data
-- free / budget / standard / premium — shown as badges in dropdowns & tables.
alter table public.services
  add column if not exists tier text not null default 'standard'
    check (tier in ('free', 'budget', 'standard', 'premium'));
