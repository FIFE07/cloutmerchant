-- 0003: sub-categories for the classic 3-level dropdown
-- (Category → Sub-category → Service), derived from provider data.
alter table public.services
  add column if not exists subcategory text not null default 'General';

create index if not exists services_subcategory_idx
  on public.services (category_id, subcategory)
  where is_active;
