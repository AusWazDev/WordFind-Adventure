# SoundFind — Launch Readiness & Deployment Plan

**App:** SoundFind (package name: `soundfind`)
**Stack:** React 18 · Vite · TailwindCSS · shadcn/ui · framer-motion
**Repo:** github.com/AusWazDev/WordFind-Adventure
**Date drafted:** 27 March 2026

---

## Phase 1 — Finish & Stabilise (Current)

Work in progress before anything else is actioned.

### 1.1 Active Testing
- [ ] Mystery Word — all 5 levels, all categories (in progress)
- [ ] Standard mode — all levels, all categories
- [ ] Audio Challenge — online and offline
- [ ] Anagram Hunt — all levels
- [ ] Word Association — verify all 800+ clues render correctly
- [ ] Hint system — lightbulb penalty in all non-audio modes
- [ ] Score penalties — Eye (−50%), Lightbulb (−25%) apply correctly
- [ ] Victory modal — correct score shown, correct stars awarded
- [ ] Progress persistence — game resumes after leaving and returning
- [ ] Dark mode — all screens, all components

### 1.2 Known Technical Debt
- [ ] Remove dead code in `gameUtils.jsx` — three functions left over from old Mystery Word algorithm (`pickCategoryBonusWord`, `tryPlaceWordDenseProtected`, `hasEmptyNonProtectedCell`) are no longer called
- [x] Browser tab title — `index.html` already reads `SoundFind` ✅
- [ ] No `public/` folder — no favicon, no app manifest, no robots.txt
- [ ] Version number stuck at `0.0.0`
- [ ] **`GameHeader.jsx`** — dead `spelling: 'Spelling Bee'` entry in `modeLabels` (Spelling Bee was removed in CR-01 but the label map still references it)
- [ ] **`GameModeSelector.jsx`** — `REQUIRES_ONLINE = new Set(['association'])` and `offlineDescription: 'Requires internet for AI-generated clues'` are now stale. After CR-04, all Word Association clues are hardcoded locally — the mode works fully offline. The gate and the warning description should both be removed.
- [ ] **`HowToPlayModal.jsx`** — "Other Modes" slide still lists Spelling Bee (removed CR-01) and describes Word Association as using "AI-generated clues" (no longer true). Mystery Word mode is missing entirely from the modal. Hints & Scoring slide does not mention the per-word lightbulb button (added CR-03) or the −25%/−50% score penalties.
- [ ] **`HintModal.jsx`** — Contains a fully built mock AdPlayer UI (15-second countdown, skip-after-5s). No real ad SDK is connected. `RemoveAdsModal.jsx` has a `TODO: replace with RevenueCat purchase call`. IAP pricing is already stubbed ($0.99 / $1.99 / $3.99 hint bundles). **Monetisation decisions needed before this can be wired up** — see Decision Points.

### 1.3 Edge Cases to Verify
- [ ] Mystery Word: what happens when no word of the exact remaining length can be found? (graceful fallback to no bonus word rather than a crash)
- [ ] Very short grids (Easy level) with dense filler — grid full before mystery word is placed
- [ ] Audio mode offline — TTS fallback confirmed working
- [ ] Category `random` with Mystery Word mode — words drawn from all categories, mystery word still found

---

## Phase 2 — Polish & Pre-Launch Prep

### 2.1 App Identity
- [x] **App name confirmed: SoundFind** — `package.json` and `index.html` already aligned ✅
- [ ] **App icon** — Design a 1024×1024 master icon (used for all platforms). Should be simple, recognisable at small sizes. Suggested concept: bold letter tiles forming a word on a coloured background, incorporating a sound-wave motif to reflect the audio features.
- [ ] **Splash/loading screen** — Branded screen shown while React hydrates (currently just white flash).
- [ ] **Favicon set** — 16×16, 32×32, 180×180 (Apple touch icon), 512×512 PNG.

### 2.2 Content & Legal
- [ ] **Privacy Policy** — Required for both app stores. Must cover: what data is stored (local only?), audio permissions, no third-party analytics currently. Host on a publicly accessible URL.
- [ ] **Terms of Use** — Optional but recommended.
- [ ] **Age rating** — Game is suitable for all ages; COPPA compliance check (no account creation, no personal data collected = low risk).
- [ ] **Accessibility audit** — Colour contrast, tap target sizes (44×44px minimum), screen reader labels on icon buttons.
- [ ] **Localization** — English only for v1 is fine; note this as a future consideration.

### 2.3 Performance
- [ ] Run `npm run build` and check bundle size — the large `wordClues` object (~800 entries) should be checked; consider lazy-loading game utils if bundle > 500 KB.
- [ ] Add `loading="lazy"` to any images; confirm no layout shift on load.
- [ ] Test on a mid-range Android device (often 3× slower JS execution than desktop).

---

## Phase 3 — PWA Setup (Web + "Add to Home Screen")

A Progressive Web App is the fastest path to mobile without app store approval. Users can install directly from the browser.

### 3.1 What's Needed
- [ ] **`public/manifest.json`** — App name, short name, icons, theme colour, display mode (`standalone`), start URL, background colour.
- [ ] **Service Worker** — Cache app shell + game assets for offline play. Use `vite-plugin-pwa` (Workbox-based) — one npm install, minimal config.
- [ ] **HTTPS** — Required for service workers; provided automatically by all recommended hosts.
- [ ] **iOS meta tags** — `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, `apple-touch-icon` in `index.html`.

### 3.2 Estimated Effort
2–4 hours to implement and test.

### 3.3 User Experience
Once installed as a PWA, the app:
- Opens full-screen (no browser chrome)
- Works offline (all game modes except Word Association)
- Appears in the device's app drawer like a native app
- Can receive push notifications (future feature)

---

## Phase 4 — Hosting & Deployment

### 4.1 Recommended Platform: **Vercel** (free tier) ✅ DEPLOYED

| Criteria | Vercel | Netlify | GitHub Pages | Cloudflare Pages |
|----------|--------|---------|--------------|-----------------|
| Vite support | ✅ First-class | ✅ | ✅ (manual) | ✅ |
| Custom domain | ✅ Free | ✅ Free | ✅ Free | ✅ Free |
| HTTPS auto | ✅ | ✅ | ✅ | ✅ |
| Deploy from GitHub | ✅ Auto | ✅ Auto | ✅ Action needed | ✅ Auto |
| Edge CDN | ✅ Global | ✅ Global | ❌ | ✅ Global |
| Free tier limits | Generous | Generous | Unlimited static | Unlimited |

**Recommendation: Vercel.** Connects directly to the GitHub repo; every push to `main` auto-deploys in ~60 seconds.

### 4.2 Setup Steps
1. Create account at vercel.com
2. Import `AusWazDev/WordFind-Adventure` repo
3. Framework preset: **Vite** (auto-detected)
4. Build command: `npm run build` · Output dir: `dist`
5. Add custom domain (optional)
6. Enable GitHub integration → auto-deploy on push to `main`

### 4.3 Custom Domain
- **Reserved domain:** `www.uniquegames.com.au` (Hostgator — not yet active, ABN registration in progress)
- **Plan:** Use Hostgator for marketing/landing page + Privacy Policy/Support URLs required by App Store submissions
- **Game hosting:** Point `play.uniquegames.com.au` subdomain to Vercel via CNAME record (takes ~10 min once domain is active)
- **In the interim:** Use Vercel's auto-generated `*.vercel.app` URL for beta testing — no domain needed

### 4.4 Beta Testing (Pre-Domain / Pre-Store) ✅ ACTIVE

**Live URL:** https://word-find-adventure.vercel.app (auto-deploys on push to `main`)

**Beta test infrastructure (all committed to `docs/`):**
- `docs/Beta Tester Invite Message.md` — ready-to-send message with 3 links
- Google Form for feedback: https://forms.gle/5n1bdni6jrVNVz487
- Test Script (29 test cases): https://tinyurl.com/2bw3jdod
- Results sheet: SoundFind Beta Testing (Responses) — Google Sheets (owner: warwick.lindsay@gmail.com)
- Full test plan XLSX: `SoundFind Beta Test Plan.xlsx` (4 tabs: Test Script, Results Tracker, Defect Log, Setup Guide)

**Process:**
1. Send `docs/Beta Tester Invite Message.md` via iMessage group (update `[YOUR DEADLINE]` first)
2. Testers open app in Safari (iOS) or Chrome (Android) → Add to Home Screen → installs as PWA
3. Testers work through test cases in the Google Sheet and submit results via Google Form
4. Monitor responses sheet, log confirmed defects in `docs/Change Register.md`
5. Once Capacitor is set up: **TestFlight** (iOS internal, up to 25 people, no review) and **Google Play Internal Testing** (up to 100 testers, no review)

### 4.4 Environment & Config
- No environment variables currently needed (all client-side)
- If Word Association ever uses a real AI API, API keys must be added as Vercel env vars (never committed to git)

---

## Phase 5 — Native App Packaging (iOS & Android)

### 5.1 Recommended Tool: **Capacitor** (by Ionic)

Capacitor wraps the existing web app in a native WebView shell. No rewrite required — the React app runs as-is inside a native container, with access to native APIs (camera, push notifications, IAP etc.).

**Alternative considered:** React Native — requires significant rewrite; not recommended for this project.

### 5.2 Capacitor Setup (one-time)
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "WordFind Adventure" "com.auswazdev.wordfindadventure"
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

After each build:
```bash
npm run build
npx cap sync        # copies dist/ into native projects
npx cap open ios    # opens Xcode
npx cap open android # opens Android Studio
```

### 5.3 Requirements
| Tool | Required for |
|------|-------------|
| Xcode 15+ (Mac only) | iOS build & submission |
| Android Studio | Android build & submission |
| Apple Developer Account | iOS App Store ($99 USD/year) |
| Google Play Developer Account | Play Store ($25 USD one-time) |

> ✅ **Mac confirmed** — Mac with Xcode already set up and connected to GitHub (`AusWazDev/WordFind-Adventure`). No cloud build service needed.

### 5.4 Native Plugins to Consider
| Plugin | Purpose |
|--------|---------|
| `@capacitor/haptics` | Vibration feedback on word found |
| `@capacitor/status-bar` | Match status bar colour to app theme |
| `@capacitor/splash-screen` | Native splash screen on launch |
| `@capacitor/in-app-purchases` (or RevenueCat) | Monetisation — hint packs |

---

## Phase 6 — App Store Submission

### 6.1 Apple App Store

**Required assets:**
- [ ] App icon: 1024×1024 PNG (no transparency, no rounded corners — Apple applies the mask)
- [ ] Screenshots: iPhone 6.9" (1320×2868), iPhone 6.5" (1242×2688), iPad Pro 12.9" (2048×2732) — at least 3 per device
- [ ] App preview video (optional but boosts conversion) — 15–30 sec screen recording
- [ ] App name (max 30 chars)
- [ ] Subtitle (max 30 chars) — e.g., "Word Search & Audio Challenge"
- [ ] Description (max 4000 chars)
- [ ] Keywords (max 100 chars) — comma-separated, e.g., "word search,spelling,vocabulary,puzzle,kids"
- [ ] Privacy policy URL (publicly hosted)
- [ ] Age rating questionnaire
- [ ] Categories: Primary = Games → Word; Secondary = Education

**Review timeline:** 1–3 business days (first submission); faster for updates.

**Common rejection reasons to avoid:**
- App crashes on launch
- Placeholder content visible
- Missing privacy policy
- In-app purchase items not described accurately
- Buttons/links that don't work

### 6.2 Google Play Store

**Required assets:**
- [ ] App icon: 512×512 PNG
- [ ] Feature graphic: 1024×500 PNG (banner shown at top of listing)
- [ ] Screenshots: Phone (min 2, max 8), 7" tablet, 10" tablet (optional but recommended)
- [ ] Short description (max 80 chars)
- [ ] Full description (max 4000 chars)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire (IARC)
- [ ] Target audience & content declaration
- [ ] Data safety form (declare what data you collect — currently: nothing sent externally)

**Review timeline:** Hours to 3 business days; automated checks happen immediately.

---

## Phase 7 — Monetisation

The app already has a `RemoveAdsModal` UI component, indicating ads/IAP are planned.

### 7.1 Confirmed Model ✅
- **Free to download**
- **12 hints preloaded on first launch** (implemented in `offlineStorage.jsx`, `Game.jsx`, `Home.jsx`)
- **Extra hints:** Watch ad (1 hint, ~15 sec) OR buy hint pack via IAP
- **Interstitial ads:** Shows after every 3 game starts (`AD_FREQUENCY = 3` in `Home.jsx`) — skipped when offline
- **Remove Ads:** One-time purchase ($2.99) removes all interstitial ads forever
- **Prices to confirm:** Current stubs — 3 hints $0.99 · 10 hints $1.99 · 25 hints $3.99 (finalise before RevenueCat wiring)

### 7.2 Real Ads Timeline
- **Now (web/PWA):** Placeholder Unsplash images in AdModal — not real ads. Functional for testing UX flow.
- **With Capacitor (Phase 5):** Install `@capacitor-community/admob`, register app in AdMob console, replace placeholder with real interstitial ad unit IDs.
- **Revenue note:** Minimal until user base is established. Do not delay launch to activate real ads.

### 7.3 Offline Behaviour (implemented)
- Interstitial ad is silently skipped when device is offline — game starts immediately
- HintModal Watch Ad and Buy Hint Pack buttons are replaced with greyed-out "Go online" messages when offline
- Player's existing hint balance always works offline

### 7.4 IAP Implementation
- **Web (PWA):** No native IAP — purchases will show "available on the app" message
- **Native (Capacitor):** **RevenueCat SDK** — cross-platform, handles both Apple and Google IAP with one API, free tier available. Wire up when Capacitor is set up (Phase 5).

---

## Phase 8 — Analytics & Crash Reporting

### 8.1 What to Track
Game starts (mode, category, difficulty) · game completions (score, stars, time) · hint usage (type, mode) · ad watches · IAP initiated/completed · session length · Mystery Word revealed/not revealed

### 8.2 Recommended Tools
| Tool | Purpose | Cost |
|------|---------|------|
| **PostHog** | Custom game events (modes played, hints used, funnels) | Free tier (1M events/month) |
| **Sentry** | JavaScript error tracking & crash reports | Free tier |
| **Vercel Analytics** | Basic page views, load times — zero config | Free with Vercel |

**Recommended: PostHog + Sentry.** Avoid Firebase unless going deep into Google ecosystem (adds privacy policy complexity).

### 8.3 Privacy Obligations
- **Australia Privacy Act 1988** — privacy policy required even for anonymous event tracking
- **Apple Privacy Labels** — must declare analytics data collection in App Store Connect
- **Google Play Data Safety** — declare all data types collected; currently: nothing sent externally
- **GDPR** — if EU users are expected, analytics must support data deletion; PostHog handles this
- **COPPA** — game is all-ages (not specifically targeting under-13s); standard rules apply
- Keep analytics privacy-first — no PII, no cross-site tracking. This simplifies the privacy policy.

---

## Phase 9 — Post-Launch

- [ ] Monitor App Store reviews and respond within 48 hours
- [ ] Track most-played modes and categories via analytics → prioritise new content
- [ ] Add new category word lists (currently 13 — add History, Geography, Science sub-topics etc.)
- [ ] Seasonal content (Christmas, Halloween themed word lists)
- [ ] Leaderboards / social sharing (future major feature)
- [ ] Push notifications for daily challenges (requires PWA or native)
- [ ] iPad / tablet layout optimisation

---

## Summary Timeline (Suggested)

| Week | Focus |
|------|-------|
| Week 1 | Complete testing, fix bugs, clean up dead code, finalise app name |
| Week 2 | App icon & assets, PWA setup, Vercel deployment, custom domain |
| Week 3 | Capacitor setup, iOS/Android builds, internal testing on real devices |
| Week 4 | App Store assets (screenshots, descriptions, privacy policy) |
| Week 5 | Submit to both stores, address review feedback |
| Week 6+ | Live — monitor, iterate, add content |

---

## Decision Points

1. ~~**App name**~~ ✅ **Resolved — SoundFind.**
2. ~~**Mac access**~~ ✅ **Resolved — Mac + Xcode + GitHub already connected.**
3. ~~**Monetisation model**~~ ✅ **Resolved — Free download · 12 preloaded hints · ads + IAP for more hints · Remove Ads $2.99. Prices to confirm before RevenueCat wiring.**
4. ~~**Ads**~~ ✅ **Resolved — Keep ad option. Real AdMob integration deferred to Phase 5 (Capacitor). Placeholder UX remains for testing.**
5. ~~**Domain**~~ ✅ **Resolved — `uniquegames.com.au` reserved (Hostgator, pending ABN). Vercel `*.vercel.app` URL used for beta testing in interim.**
6. ~~**Analytics**~~ ✅ **Resolved — PostHog (custom game events) + Sentry (crash reporting). Implement in Phase 8 before public launch.**
