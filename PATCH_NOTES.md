# Patch notes — round 2: security + bug fixes + real OTP + 2 UI widgets

Unzip over your existing repo as usual (`unzip -o`). This round fixes real
bugs found in a full code review, closes a serious security gap, and wires
in two of the five standalone HTML mockups you sent (OTP verification,
password strength) — see the bottom of this file for why the other three
weren't force-fit in.

## 0. Run this migration FIRST — it's the important one

```
supabase/migrations/003_row_level_security.sql
```

Every table except `organizer_verifications` had **no row-level security at
all**. The anon key baked into your client bundle (visible to anyone who
opens devtools) had full read/write on `tickets` — meaning anyone could:
run `select * from tickets` and harvest every buyer's phone number **and
every ticket's `qr_code`** (the entire fraud vector: copy a real QR code,
walk in before the real buyer does), mark any ticket "used" directly, delete
any ticket, or insert fake events under any organizer_id. This migration
locks all of that down. Safe to re-run, and paired with code changes below
(a ticket's UUID link still works for the post-payment confirmation page,
routed through a server API instead of a raw client query — see comments in
`src/app/api/ticket/[id]/route.js`).

## 1. Real phone verification (closes the old "TODO: wire to real OTP")

`src/components/PhoneVerify.jsx` — boxed-digit code entry with the
animated trace-in effect from your `otp-verification.html`, re-themed to
the site's light glass/ink/gold palette. Wired to **real** Supabase phone
auth (`signInWithOtp` / `verifyOtp`), not a fake demo code — so it'll send
actual SMS once you turn on **Authentication → Phone** + an SMS provider
(Twilio is the easiest to set up) in the Supabase dashboard. Until you do,
it'll show a clear inline error instead of silently failing.

My Tickets now gates on this instead of a bare, unguarded
`localStorage.getItem("buyerPhone")` that anyone could set from devtools to
view someone else's tickets.

## 2. Password strength meter on signup

`src/components/PasswordStrength.jsx` — same entropy math and tier ladder
("no lock" → "bank vault") as your `password-strength.html`, re-themed.
Signup now also rejects passwords below the "padlock" tier (~40 bits)
server-side in the submit handler, not just cosmetically.

## 3. Bugs fixed

- **Referral codes and points redemption were completely dead.** The
  events feed passed `pointsBalance` and `referralCode` props into
  `PurchaseSheet`, but the component never declared or read either one —
  so a referral link's `?ref=` code never reached checkout, and there was
  no way to redeem points at all despite the backend fully supporting it.
  Fixed; PurchaseSheet now has a "use N points" toggle and shows the
  applied referral code.
- **Dashboard undercounted tickets sold.** It counted ticket *rows*, not
  the `quantity` column — so a buyer who purchased 4 tickets in one
  checkout only counted as 1 toward "tickets sold" and revenue math on the
  organizer's own dashboard (revenue/commission itself was correct, just
  the ticket count).
- **`/scan` had no auth check at all.** Anyone with the URL could mark any
  ticket, for any event, "used" — no login required. Now gated behind the
  organizer's session, and scoped so an organizer can only scan tickets for
  events they own (was previously possible to burn a competitor's tickets).
- **No phone number validation on checkout.** `/api/pay/stkpush` accepted
  anything in the phone field and forwarded it straight to IntaSend, so a
  typo just silently failed the STK push with no useful error. Also wasn't
  validating `quantity`, so a malformed request could ask for a negative or
  absurd ticket count. Both now validated, and phone numbers are
  normalized to one canonical format so the same buyer's tickets are
  always found later regardless of whether they typed `07...`, `+254 7...`,
  or `2547...` at checkout.
- **`KENYAN_PHONE_REGEX` used a global (`/g`) flag with `.test()`.** Global
  regexes are stateful — `.lastIndex` persists on the shared `const`
  between calls — so a second "create event" submission in the same
  session could intermittently skip a phone number that genuinely should
  have been blocked from the description field. Removed `/g` (only ever
  checking existence, never iterating matches, so it bought nothing).
- **Webhook used a bare `crypto.randomUUID()` with no import.** Works on
  newer Node by luck (global), but isn't guaranteed on every runtime Render
  might use. Now explicitly imported from `node:crypto`.

## 4. On the other 3 HTML files (modern-checkout, order-button, auth-flip)

Didn't force these in this round, and want to explain why rather than
silently drop them:

- **auth-flip.html** — a genuinely nice flip-card login/signup animation,
  but your login/signup pages are already clean, on-theme, and working.
  Swapping them for a full visual redesign is a bigger, more opinionated
  change than a bug-fix pass should make unilaterally. Happy to build it
  next if you want it — just say so.
- **modern-checkout.html** — your actual checkout (`PurchaseSheet` +
  `PaymentButton`) is already more purpose-built than this generic
  e-commerce mockup: it has the tier picker, bulk quantity, M-Pesa/Card/
  Bank switcher, and the STK-push/card-scan animation tailored to Ogolla
  Pay. Force-fitting the mockup would be a downgrade.
- **order-button.html** — a delivery/parcel-themed press animation. Cute,
  but the truck/package iconography doesn't fit a ticketing product, and
  your `PaymentButton` already has an equivalent "press → sending →
  success checkmark" flow. If you want its specific *feel* (the satisfying
  press morph) on a specific button — tell me which one and I'll adapt it.

---

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
