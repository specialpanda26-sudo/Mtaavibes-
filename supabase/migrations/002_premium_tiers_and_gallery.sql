-- Migration 002 — run this in the Supabase SQL editor if you already ran
-- the original supabase/schema.sql on a live project. Safe to re-run
-- (everything is guarded with IF NOT EXISTS / ON CONFLICT / DROP IF EXISTS).
--
-- What this adds:
--   1. events.gallery_images — photos shown on the event card + purchase sheet
--   2. event_tiers.tier_name — widened from (general, vip, premium) to the
--      new 4-tier badge system: silver, gold, diamond, premium
--   3. A public `event-images` storage bucket for posters + gallery photos

-- 1. Gallery images on events
alter table events
  add column if not exists gallery_images text[] default '{}';

-- 2. Widen the tier_name check constraint.
-- If you have existing rows using 'general' or 'vip', remap them first so
-- the new constraint doesn't reject them:
update event_tiers set tier_name = 'silver' where tier_name = 'general';
update event_tiers set tier_name = 'gold' where tier_name = 'vip';
-- 'premium' already matches the new set, so it's left as-is.

alter table event_tiers drop constraint if exists event_tiers_tier_name_check;
alter table event_tiers
  add constraint event_tiers_tier_name_check
  check (tier_name in ('silver','gold','diamond','premium'));

-- 3. Public bucket for event posters + gallery photos
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view event images" on storage.objects;
create policy "Anyone can view event images"
  on storage.objects for select
  to public
  using (bucket_id = 'event-images');

drop policy if exists "Organizers upload their own event images" on storage.objects;
create policy "Organizers upload their own event images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Organizers delete their own event images" on storage.objects;
create policy "Organizers delete their own event images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
