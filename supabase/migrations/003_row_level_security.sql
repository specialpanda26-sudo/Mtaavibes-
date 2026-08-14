-- ============================================================================
-- Row-level security — CRITICAL, run this before taking real payments.
-- ============================================================================
-- schema.sql only ever enabled RLS on `organizer_verifications` and the two
-- storage buckets. Every other table — events, event_tiers, bulk_discounts,
-- tickets, referrals, points_ledger, payouts, pending_payments — was left
-- with RLS off. Supabase grants the public `anon` key (the one shipped in
-- your client bundle, visible to literally anyone) full SELECT/INSERT/
-- UPDATE/DELETE on public tables by default; RLS is what's supposed to
-- narrow that down, and here it simply wasn't turned on. Concretely, before
-- this migration, anyone could:
--   • run `select * from tickets` and read every buyer's phone number AND
--     every ticket's qr_code — which is the entire ticket-fraud attack:
--     copy a real qr_code, get in before the real buyer does.
--   • mark any ticket "used" directly (bypassing /scan and its owner check
--     added in this same patch).
--   • delete any ticket, or insert fake "events" as any organizer_id.
-- Safe to re-run.

alter table events enable row level security;
alter table event_tiers enable row level security;
alter table bulk_discounts enable row level security;
alter table tickets enable row level security;
alter table referrals enable row level security;
alter table points_ledger enable row level security;
alter table payouts enable row level security;
alter table pending_payments enable row level security;

-- ---------------------------------------------------------------------------
-- events — public can browse live events; only the owning organizer can
-- manage their own (draft/paused/ended included).
-- ---------------------------------------------------------------------------
create policy "Anyone can view live events"
  on events for select
  to public
  using (status = 'live');

create policy "Organizers view their own events"
  on events for select
  to authenticated
  using (organizer_id = auth.uid());

create policy "Organizers insert their own events"
  on events for insert
  to authenticated
  with check (organizer_id = auth.uid());

create policy "Organizers update their own events"
  on events for update
  to authenticated
  using (organizer_id = auth.uid())
  with check (organizer_id = auth.uid());

create policy "Organizers delete their own events"
  on events for delete
  to authenticated
  using (organizer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- event_tiers / bulk_discounts — prices aren't sensitive, so public read is
-- fine (that's the whole point — buyers need to see them). Writes are
-- scoped to the organizer who owns the parent event.
-- ---------------------------------------------------------------------------
create policy "Anyone can view event tiers"
  on event_tiers for select
  to public
  using (true);

create policy "Organizers manage tiers on their own events"
  on event_tiers for all
  to authenticated
  using (exists (select 1 from events e where e.id = event_tiers.event_id and e.organizer_id = auth.uid()))
  with check (exists (select 1 from events e where e.id = event_tiers.event_id and e.organizer_id = auth.uid()));

create policy "Anyone can view bulk discounts"
  on bulk_discounts for select
  to public
  using (true);

create policy "Organizers manage bulk discounts on their own events"
  on bulk_discounts for all
  to authenticated
  using (exists (select 1 from events e where e.id = bulk_discounts.event_id and e.organizer_id = auth.uid()))
  with check (exists (select 1 from events e where e.id = bulk_discounts.event_id and e.organizer_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- tickets — the sensitive one. No public read at all (qr_code + phone
-- number live here). Only:
--   • the organizer who owns the event (dashboard totals, /scan)
--   • the buyer themselves, matched against their verified Supabase phone
--     auth session (see src/components/PhoneVerify.jsx) — NOT a bare
--     client-supplied phone string, which would let anyone read anyone
--     else's tickets just by typing their number in.
-- No insert policy at all: tickets are only ever created by the webhook,
-- which uses the service-role key and bypasses RLS entirely.
-- ---------------------------------------------------------------------------
create policy "Organizers view tickets for their own events"
  on tickets for select
  to authenticated
  using (exists (select 1 from events e where e.id = tickets.event_id and e.organizer_id = auth.uid()));

create policy "Buyers view their own tickets by verified phone"
  on tickets for select
  to authenticated
  using (buyer_phone = regexp_replace(auth.jwt()->>'phone', '[^0-9]', '', 'g'));

create policy "Organizers mark tickets used on their own events"
  on tickets for update
  to authenticated
  using (exists (select 1 from events e where e.id = tickets.event_id and e.organizer_id = auth.uid()))
  with check (exists (select 1 from events e where e.id = tickets.event_id and e.organizer_id = auth.uid()));

create policy "Buyers delete their own tickets by verified phone"
  on tickets for delete
  to authenticated
  using (buyer_phone = regexp_replace(auth.jwt()->>'phone', '[^0-9]', '', 'g'));

-- ---------------------------------------------------------------------------
-- referrals / points_ledger — a buyer can see their own referral code and
-- points history once verified; no client insert (webhook/service-role
-- only writes here).
-- ---------------------------------------------------------------------------
create policy "Buyers view their own referral row"
  on referrals for select
  to authenticated
  using (referrer_phone = regexp_replace(auth.jwt()->>'phone', '[^0-9]', '', 'g'));

create policy "Buyers view their own points history"
  on points_ledger for select
  to authenticated
  using (phone = regexp_replace(auth.jwt()->>'phone', '[^0-9]', '', 'g'));

-- ---------------------------------------------------------------------------
-- payouts — organizer can see payouts for their own events. No client
-- writes; the webhook (service role) is the only writer.
-- ---------------------------------------------------------------------------
create policy "Organizers view their own payouts"
  on payouts for select
  to authenticated
  using (organizer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- pending_payments — purely an internal bridge between the stkpush route
-- and the webhook, both service-role. No anon/authenticated policy at all
-- is intentional here: with RLS on and zero policies, every client-side
-- request is denied by default, which is exactly what we want.
-- ---------------------------------------------------------------------------
