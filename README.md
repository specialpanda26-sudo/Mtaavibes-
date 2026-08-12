# Mtaa Vibes — Cinematic Edition

## What's in this zip

```
tailwind.config.js
src/app/globals.css
src/app/layout.js
src/app/page.js
src/components/CursorGlow.jsx
src/components/CinematicHero.jsx
src/components/EventCard.jsx
src/components/PurchaseSheet.jsx
src/components/TicketQR.jsx
```

Each file REPLACES the file at the same path in your `Mtaavibes-` repo.
Everything else in your repo (events page, dashboard, scan, login, signup,
my-tickets, ticket/[id], all api routes, lib/, other components) stays as-is.

You need `framer-motion` and `qrcode.react` installed:
```
npm install framer-motion qrcode.react
```

## Getting these files onto your phone (Termux)

Don't retype this by hand — your keyboard is auto-converting straight quotes
to curly ones and it'll break the JS. Instead:

1. In the Claude app, tap each file (or the zip) and choose **Save / Download**.
   It lands in your phone's normal Downloads folder.
2. One-time setup in Termux, if you haven't already:
   ```
   termux-setup-storage
   ```
   (approve the permission popup)
3. Copy the files into your repo, overwriting the old ones:
   ```
   cd ~/Mtaavibes-
   cp ~/storage/downloads/mtaa-vibes-cinematic.zip .
   unzip -o mtaa-vibes-cinematic.zip -x "README.md"
   rm mtaa-vibes-cinematic.zip
   ```
   `unzip -o` overwrites existing files automatically, so this drops all
   nine files into the right folders in one shot.

## Push to GitHub

```
cd ~/Mtaavibes-
git add .
git commit -m "cinematic edition: 3D tilt cards, glass UI, hero, ticket QR"
git push origin main
```

If your default branch is `master` instead of `main`, use that instead —
check with `git branch`.

Render will redeploy automatically on push if auto-deploy is on for your
service; otherwise trigger a manual deploy from the Render dashboard.
