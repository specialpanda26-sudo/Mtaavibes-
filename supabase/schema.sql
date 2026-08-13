-- Mtaa Vibes — Supabase schema
-- Source of truth: docs/BUILD_PROMPT.md, Section 4.
-- Run this in the Supabase SQL editor.

-- Events
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('fashion','dressing','dance','campus','club','art','other')),
  venue TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  poster_url TEXT,
  gallery_images TEXT[] DEFAULT '{}', -- concert/crowd photos shown on the event card + purchase sheet
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','live','paused','ended')),
  commission_rate DECIMAL DEFAULT 0.10,
  organizer_mpesa_number TEXT NOT NULL,
  sold_tickets INTEGER DEFAULT 0, -- scaffold addition: incremented by the payment webhook
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tier pricing per event
CREATE TABLE event_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL CHECK (tier_name IN ('silver','gold','diamond','premium')),
  price INTEGER NOT NULL,
  description TEXT,
  perks TEXT[]
);

-- Bulk discounts per event
CREATE TABLE bulk_discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL,
  discount_percent DECIMAL NOT NULL,
  label TEXT
);

-- Tickets purchased
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  tier_id UUID REFERENCES event_tiers(id),
  buyer_phone TEXT NOT NULL,
  buyer_name TEXT,
  quantity INTEGER DEFAULT 1,
  discount_applied DECIMAL DEFAULT 0,
  transaction_id TEXT UNIQUE,
  amount_paid INTEGER NOT NULL,
  commission_paid INTEGER NOT NULL,
  organizer_paid INTEGER NOT NULL,
  qr_code TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','used','refunded')),
  paid_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizer verification
CREATE TABLE organizer_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES auth.users(id) UNIQUE, -- one verification row per organizer; the dashboard upserts onConflict "organizer_id"
  id_front_url TEXT,
  id_back_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payouts to organizers
CREATE TABLE payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  organizer_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  mpesa_receipt TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals: 100 points credited to the referrer for every friend who buys using their link/code
-- (REFERRAL_POINTS_PER_SIGNUP — tune this one constant in src/lib/constants.js before launch)
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_phone TEXT NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_phone TEXT,
  referred_ticket_id UUID REFERENCES tickets(id),
  points_awarded INTEGER DEFAULT 100,
  reward_status TEXT DEFAULT 'pending' CHECK (reward_status IN ('pending','earned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points ledger: running history of earns (referrals) and redemptions (used at checkout).
-- Balance for a phone number = SUM(amount) WHERE type='earn' - SUM(amount) WHERE type='redeem'
CREATE TABLE points_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  type TEXT CHECK (type IN ('earn','redeem')),
  amount INTEGER NOT NULL,
  reason TEXT, -- e.g. 'referral_signup', 'redeemed_at_checkout'
  referral_id UUID REFERENCES referrals(id),
  ticket_id UUID REFERENCES tickets(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pending payments: scaffold addition, bridges the STK push request to the
-- webhook (IntaSend's webhook only carries api_ref/invoice_id, not our
-- event/tier/quantity/referral context, so we stash it here in between).
CREATE TABLE pending_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_ref TEXT UNIQUE NOT NULL,
  invoice_id TEXT,
  event_id UUID REFERENCES events(id),
  tier_id UUID REFERENCES event_tiers(id),
  quantity INTEGER DEFAULT 1,
  buyer_phone TEXT NOT NULL,
  amount_paid INTEGER NOT NULL,
  referral_code TEXT,
  points_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Organizer ID verification storage
-- ============================================================================
-- Private bucket for national ID photos uploaded on the dashboard. Files are
-- named "<organizer_id>/front.<ext>" and "<organizer_id>/back.<ext>" so RLS
-- can scope access to the folder matching the signed-in user's own id.
insert into storage.buckets (id, name, public)
values ('organizer-ids', 'organizer-ids', false)
on conflict (id) do nothing;

-- Organizers can upload/overwrite only their own two files.
create policy "Organizers upload their own ID files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'organizer-ids'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Organizers replace their own ID files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'organizer-ids'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Organizers can view their own upload (e.g. to re-check what's on file);
-- nobody else can — admin review reads these via the service-role key, which
-- bypasses RLS, so no separate policy is needed for that.
create policy "Organizers view their own ID files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'organizer-ids'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- Event images: posters + gallery (public)
-- ============================================================================
-- Public bucket for event posters and gallery photos (concert shots, crowd,
-- dancefloor). Anyone can view; only authenticated organizers can upload,
-- scoped to a folder named after their own user id (mirrors organizer-ids).
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

create policy "Anyone can view event images"
  on storage.objects for select
  to public
  using (bucket_id = 'event-images');

create policy "Organizers upload their own event images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Organizers delete their own event images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Row-level security on organizer_verifications itself: an organizer can
-- read/insert/update only their own verification row.
alter table organizer_verifications enable row level security;

create policy "Organizers manage their own verification row"
  on organizer_verifications for all
  to authenticated
  using (organizer_id = auth.uid())
  with check (organizer_id = auth.uid());
