# Patch notes — workflow fixes + premium tier system

Unzip this over your existing `Mtaavibes-` repo (`unzip -o`) — every file
here replaces the same path in your project. Nothing you haven't touched
was removed.

## 1. One-time Supabase step (do this first)

Open your Supabase project → SQL editor → paste and run:

```
supabase/migrations/002_premium_tiers_and_gallery.sql
```

This adds `events.gallery_images`, widens the ticket tier system to
`silver / gold / diamond / premium`, and creates the public `event-images`
storage bucket. Safe to re-run.

## 2. Fixed workflows

- **Sign out.** Didn't exist anywhere. Now on the dashboard (organizer,
  real Supabase auth session) and on My Tickets ("Switch number" — clears
  the saved buyer phone).
- **Payment confirmation.** `/pay/complete` used to just say "we're
  confirming" and never actually confirmed anything. It now polls a new
  `/api/pay/poll` route until the webhook has really created the ticket,
  then shows an animated checkmark + confetti + a link straight to the
  ticket. M-Pesa buyers are now routed here too after the STK push, instead
  of being left on the purchase sheet with no real confirmation.
- **Broken animations.** Several components referenced Tailwind classes
  like `animate-pulseRing` / `text-accentRed` that were never defined
  (config only had the kebab-case versions), so those effects and error
  colors were silently invisible. Added the missing aliases in
  `tailwind.config.js`, plus two genuinely new keyframes (`pulseDot`,
  `tabUnderline`) that were referenced but never existed.

## 3. Premium tier system (Silver / Gold / Diamond / Premium)

- New `TierBadge` component — colored, icon'd badge per tier, used on
  event cards, the purchase sheet, and the ticket itself.
- `CreateEventForm` now defaults to all 4 tiers instead of 3.
- Ticket tier badge sits on the bottom of the ticket, as requested.

## 4. Image uploads

- New `ImageUploader` component (drag/drop or tap), backed by the new
  public `event-images` bucket.
- `CreateEventForm` now has a poster uploader and a gallery uploader (up
  to 6 photos — concert shots, crowd, dancefloor).
- Event cards show a horizontal gallery strip when photos are present.

## 5. Loading page

- New `LoadingRing` component (pulsing concentric rings + center dot).
- Boot splash now shows it under the animated wordmark instead of just a
  progress bar.

## Known gaps not touched this round

- Dashboard's "Edit" and "Pause/Resume" buttons on an event are still
  placeholders (no handler wired up).
- My Tickets buyer identity is still `localStorage` only — no OTP/real
  session, noted as a TODO in the original code.
