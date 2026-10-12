-- ====================================================================
-- Beetorial Clean Database Baseline
-- Zero dummy data: Clean production-ready baseline initialization
-- ====================================================================

-- Base Organization
insert into public.organisations (id, name, slug, status)
values
  ('11111111-1111-1111-1111-111111111111', 'Beetorial Academy', 'beetorial', 'active')
on conflict (slug) do nothing;
