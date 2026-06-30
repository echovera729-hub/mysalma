# MySalma 🫶

A warm, private social home for a rehabilitation hospital team — built for the people who do the holistic work of recovery: physiotherapists, occupational therapists, speech-language pathologists, recreational therapists, nurses, respiratory therapists, dieticians, and admin.

Everything good about a social network — feed, profiles, groups, events, chat, reactions, stories — rebuilt for the realities of a care team, plus original features that build belonging and gently push back against burnout.

---

## ✨ What it does (and actually works)

This is a **fully functional front-end app**. Out of the box you can:

- **Create posts** — Moments, Bright Spots (kudos), Win Wall, Time Capsules
- **Upload real photos** from your device (they're downscaled and stored locally)
- **React** with ❤️ and ✦, **comment**, **save**, and **delete** posts
- **Log your mood** with the daily Pulse check-in
- **Answer The Daily One** prompt
- **RSVP** to events, **offer to cover** shift swaps
- **Edit your profile** — name, role, tagline, bio, profile photo & cover photo
- Switch **feed layouts** (cards / magazine / minimal), themes, fonts and density via the Tweaks panel

> **How data is stored:** Out of the box, MySalma saves everything to your browser's `localStorage` (single-user, no setup — great for demos). It also ships with a **complete Supabase integration**: paste your project keys into `supabase-config.js` and it becomes a shared, real-time, multi-user network. See *Going multi-user with Supabase* below.

---

## 🚀 Put it online with GitHub Pages

1. Create a new repository and **upload every file in this folder** (keep the structure — all the `.jsx`, `.css`, `.html` files and the `screenshots/` folder).
2. In the repo, go to **Settings → Pages**.
3. Under *Build and deployment*, set **Source: Deploy from a branch**, **Branch: `main`** (folder `/root`), and **Save**.
4. Wait ~1 minute. Your app is live at `https://<your-username>.github.io/<repo-name>/`.

That's it — `index.html` is the entry point and loads automatically.

> Opening `index.html` by double-clicking it **won't work** (browsers block the module loading from `file://`). It needs to be served — GitHub Pages does this for you, or run a local server: `python3 -m http.server` then open `http://localhost:8000`.

---

## 📁 What's in here

| File | What it is |
|------|------------|
| `index.html` | **The app** — entry point, loads everything below |
| `styles.css` | The full design system (colors, type, components) |
| `store.jsx` | Data layer — localStorage **and** Supabase, posting, photos, reactions |
| `supabase-config.js` | Paste your Supabase keys here to turn on multi-user |
| `supabase-schema.sql` | Run this in Supabase to create the tables + security |
| `auth.jsx` | Sign-in / sign-up screen (Supabase mode only) |
| `data.jsx` | Configuration — your teams, mood options, prompts (no fake content) |
| `components.jsx` | Shared pieces — icons, avatars, pills |
| `feed.jsx` | The feed + post card + mood check-in |
| `engage.jsx` | The Daily One, shift hub, digest |
| `screens.jsx` | Home, profile, crews, events |
| `screens2.jsx` | Composer, notifications, chat, search, onboarding, settings |
| `app.jsx` | App shell, sidebar, navigation |
| `manifest.webmanifest` | PWA manifest — makes it installable to the home screen |
| `sw.js` | Service worker — install + offline support |
| `icons/` | App icons (home-screen, maskable, Apple touch) |
| `MySalma Pitch Deck.html` | The leadership pitch deck |

No build step, no npm, no framework CLI — it runs straight in the browser.

---

## 📱 Installing it like an app (PWA)

MySalma is a **Progressive Web App** — once it's deployed over HTTPS (GitHub Pages does this automatically), staff can install it to their phone or desktop and run it fullscreen, with its own icon, separate from the browser.

**On Android / Chrome / Edge:** an **Install** banner appears after a couple of seconds, or use the browser menu → “Install app” / “Add to Home screen.”

**On iPhone / iPad (Safari):** tap the **Share** button, then **“Add to Home Screen.”** (iOS doesn't allow a one-tap install button — the app shows a hint with these steps.)

After installing, it opens fullscreen like a native app, keeps working offline for previously-loaded content, and (once Supabase is connected) syncs live across everyone's devices.

> PWA install **requires HTTPS** — it won't offer to install from a plain `file://` or `http://` address. GitHub Pages serves HTTPS, so it works there out of the box.

---

## 🎨 Make it yours

- **Hospital name / branding:** search the files for `MySalma` and `Salma Rehab` and replace.
- **Your teams/disciplines:** edit the `TEAMS` list in `data.jsx`.
- **Colors & fonts:** the top of `styles.css` has every brand variable, or use the in-app **Tweaks** panel.
- **Reset the app:** Settings → Account → *Reset data*.

---

## 🔌 Going multi-user with Supabase (built in!)

MySalma ships with a **complete Supabase integration** — it just needs your project keys to switch on. Until then it runs in local single-user mode, so the app always works.

**Setup (about 5 minutes):**

1. Create a free project at [supabase.com](https://supabase.com).
2. In Supabase → **SQL Editor**, paste the entire contents of `supabase-schema.sql` and click **Run**. This creates all the tables, security rules, and realtime.
3. In Supabase → **Project Settings → API**, copy your **Project URL** and **anon public** key.
4. Open `supabase-config.js` and paste them into the two lines at the top.
5. In Supabase → **Authentication → Providers → Email**, turn **off** "Confirm email" (so staff can sign in immediately — it's an internal tool).
6. Commit and push. Done — MySalma is now a **shared, live, multi-user network**:
   - Each staff member signs up / logs in (real auth)
   - Everyone sees the same feed, events, crews, and shift swaps
   - Posts, reactions, comments, and RSVPs update **in real time** across everyone's screens
   - Profiles (with photos) are shared

**How it's wired:** all data flows through the `Store` object in `store.jsx`. It detects whether `supabase-config.js` is filled in — if yes, it uses Supabase + realtime; if no, it falls back to this-browser localStorage. No other file changes between modes. `auth.jsx` is the sign-in/sign-up screen (only shown in Supabase mode).

> **Security note:** the `anon` key is safe to ship in front-end code — that's what it's for. Real protection comes from the Row Level Security policies in `supabase-schema.sql` (everyone can read; you can only write your own rows). Never put the `service_role` key in front-end code.

---

*Made with 🫶 for the team that helps people walk, speak, breathe, and live again.*
