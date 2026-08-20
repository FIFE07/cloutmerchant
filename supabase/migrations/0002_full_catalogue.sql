-- ============================================================================
-- CLOUTMERCHANT — Migration 0002: full catalogue categories + real provider sync prep
-- ============================================================================
-- The 6-platform demo taxonomy grows to cover the full wholesale catalogue
-- (Owlet: 4,724 services). Demo seed services are deactivated; real catalogue
-- arrives via provider sync (scripts/owlet-sync.mjs → chunked SQL).
-- ============================================================================

insert into public.service_categories (name, slug, platform, icon, sort_order) values
  ('Spotify & Music',  'music',      'music',      'music',      7),
  ('WhatsApp',         'whatsapp',   'whatsapp',   'whatsapp',   8),
  ('Discord',          'discord',    'discord',    'discord',    9),
  ('Twitch & Kick',    'streaming',  'streaming',  'streaming',  10),
  ('Snapchat',         'snapchat',   'snapchat',   'snapchat',   11),
  ('LinkedIn',         'linkedin',   'linkedin',   'linkedin',   12),
  ('Pinterest',        'pinterest',  'pinterest',  'pinterest',  13),
  ('Website Traffic',  'webtraffic', 'webtraffic', 'webtraffic', 14),
  ('Votes & Polls',    'votes',      'votes',      'votes',      15),
  ('More Services',    'other',      'other',      'other',      99)
on conflict (slug) do nothing;

-- Retire the demo seed catalogue now that the real one exists.
update public.services set is_active = false where provider = 'demo';
