# SoundFind — Project Status

## Overview
A word-finding game app (formerly "WordFind Adventure") rebranded to **SoundFind**.
Tagline: *Hear it. Find it.*
GitHub: https://github.com/AusWazDev/WordFind-Adventure

**Baseline commit:** `129f64f` — established 27 March 2026. All future changes managed via Change Register.

## Tech Stack
- React 18 + Vite 6
- Tailwind CSS + shadcn/ui component library
- Framer Motion (animations)
- React Router DOM v6
- Web Speech API (TTS for Audio mode)
- localStorage only — fully offline, no backend
- canvas-confetti (victory screen)

## Project Structure
- `src/pages/` — Home, Game, DailyChallenge, Leaderboard, Stats, Settings
- `src/components/game/` — GameBoard, GameHeader, WordList, VictoryModal, HintModal, AdModal, RemoveAdsModal, HowToPlayModal, voiceUtils, gameUtils, offlineStorage, trickySentences, etc.
- `src/components/ui/` — shadcn/ui base components
- `src/utils/index.js` — createPageUrl() helper

## Game Modes
| Mode | Description |
|------|-------------|
| **Audio Challenge** | Words spoken aloud — find the spelling in the grid. Featured mode. |
| **Mystery Word** | Find all words — remaining letters reveal a hidden mystery word. |
| **Standard** | Classic word search — word list visible, find them all. |
| **Anagram Hunt** | Words shown scrambled — unscramble then find them. |
| **Word Association** | Hand-crafted clue shown instead of the word — works fully offline. |

## Difficulty Levels
| Level | Grid | Words | Notes |
|-------|------|-------|-------|
| 1 Easy | 8×8 | 6 | Standard |
| 2 Medium | 10×10 | 10 | Standard |
| 3 Hard | 12×12 | 15 | Standard |
| 4 Expert | 15×15 | 20 | Standard |
| 5 Master | 15×15 | 25 | Dense crossword placement + Mystery Word |

## Mystery Word Mode (all levels)
- After placing all main words, ALL remaining empty cells become the mystery word area
- Filler words (category-only) fill cells first; exact remaining cell count determines mystery word length
- `findMysteryWord()` searches categoryBonusWordPairs → wordLists for exact-length match
- Amber cells highlight when all main words found; player reveals the hidden word
- Works across all 5 difficulty levels and all categories

## Hint System
- Players start with **12 free hints** on first launch
- **Lightbulb** (non-audio modes) — flashes first letter of a word on the grid. Costs 1 hint, −25% score penalty for that word.
- **Eye** (Audio Challenge only) — reveals word text. Costs 1 hint, −50% score penalty for that word.
- Out of hints: watch a short ad (1 hint) or purchase a hint pack via IAP
- Both ad-watch and IAP are **disabled when offline** — greyed-out with "Go online" message

## Monetisation (confirmed model)
- **Free to download** — 12 hints preloaded on first launch
- **Interstitial ads** — every 3 game starts (AdModal) — skipped silently when offline
- **Watch ad** — earn 1 hint per ad (~15 seconds) — requires online
- **Hint packs** — 3 hints $0.99 · 10 hints $1.99 · 25 hints $3.99 (prices TBC, RevenueCat TODO)
- **Remove Ads** — $2.99 one-time purchase (RevenueCat TODO)
- Real AdMob integration deferred to Phase 5 (Capacitor setup)

> ⚠️ **SUPERSEDED — annotated 30 Sep 2026 (CR-65, brief SF-4); the list above is kept as written.** RevenueCat and AdMob are wired on iOS and Android (CR-56, June 2026); "RevenueCat TODO" and "Phase 5" no longer apply. The interstitial runs after every **6th completed** game, not every 3 starts (decision S4, 30 Sep 2026). All ad requests are child-directed and non-personalised (CR-60). Windows and web show no ads and no purchases, only a daily free refill of 3 hints (CR-64). For the current state, read `src/lib/admob.js`, `src/lib/purchases.js`, `Home.jsx` `AD_FREQUENCY` and `docs/ARCHITECTURE.md` §4, not this list.

## Multi-platform Roadmap
- **Web PWA** — Vercel deployment (beta testing via `*.vercel.app` URL, testers add to home screen)
- **Native** — Capacitor for iOS / Android builds (Phase 5)
- **App Stores** — Apple App Store + Google Play (Phase 6)
- **Domain** — `uniquegames.com.au` reserved on Hostgator (pending ABN); `play.uniquegames.com.au` → Vercel once active

> ⚠️ **SUPERSEDED — annotated 30 Sep 2026 (CR-65); the list above is kept as written.** The phases are past: Capacitor iOS and Android builds exist, and SoundFind has shipped to the Apple App Store and the Microsoft Store. For live store status, check the consoles, not this file.

## Change Management
All changes tracked in `docs/Change Register.md` and `docs/Launch Plan.md` (now inside the repo — accessible from any machine via git pull).
Raise a CR before making any code changes. Defects logged with commit references.
Current baseline: commit `129f64f`

## Session Log

### 2026-03-27 (Mac — Cowork setup session)
- Connected project to Cowork on Mac via GitHub clone
- Set up STATUS.md for cross-device continuity
- Rewrote README.md — removed all Base44 references, added accurate project description
- Removed TypeScript dead code: @types packages, typescript dep, typecheck script, converted utils/index.ts → .js
- Fixed RemoveAdsModal crash: added missing `success` setter and `purchasing` state vars
- Confirmed monetisation strategy: ads + hint purchases, targeting web + Windows/Apple/Google stores
- Agreed tech path: Capacitor for multi-platform, RevenueCat for purchases, AdMob for ads (future milestone)
- Git push method on education network: SSH over port 443 (ssh://git@ssh.github.com:443/...)

### 2026-03-27 (Session 3 — three major features)
- Category/difficulty labels in GameHeader
- Hint/reveal score penalty (Eye −50%, Lightbulb −25%)
- Bonus word redesign with full grid coverage (categoryBonusWordPairs, buildFillerWordPool)

### 2026-03-27 (Windows — continued from prior context)
- Rebranded app: WordFind Adventure → SoundFind
- Removed all Base44 dependencies (18 packages), simplified App.jsx
- Fixed 7 critical bugs: timer, race condition, async errors, localStorage quota
- Fixed duplicate words bug (Fisher-Yates shuffle, Set() deduplication)
- Improved TTS voice quality (Google voice priority)
- Added Master level (level 5): dense crossword placement, 25 words
- Added 3-button audio word list: Speaker → Eye → Lightbulb
- Fixed hint button, VictoryModal, level labels

### 2026-03-27 (Windows — CR-01 to CR-06 + defect fixes)
- CR-01: Removed Spelling Bee mode entirely
- CR-02: Promoted Mystery Word to secondary hero card, reordered mode tiles
- CR-03: Added Lightbulb hint button to all non-audio modes (−25% penalty)
- CR-04: Expanded Word Association clues from ~50 to ~800 (all 13 categories + tricky audio words)
- CR-05: Restricted Mystery Word filler pool to active category only
- CR-06: Full-grid Mystery Word coverage — all remaining empty cells define mystery word length
- DEF-01: Word list uppercase fix
- DEF-02: 100% overlap placement prevention
- DEF-03: Homophone label gated to audio mode only
- DEF-04: Compact header max-width increased to prevent category truncation
- Removed pill tags from Audio and Mystery Word hero cards

### 2026-03-27 (Windows — CR-07 to CR-12 + baseline)
- CR-07: Removed dead `spelling` entry from GameHeader modeLabels
- CR-08: Emptied REQUIRES_ONLINE set; Word Association now correctly marked offline-capable
- CR-09: HowToPlayModal updated — Mystery Word added, Spelling Bee removed, clue description fixed, hint penalties documented, nav buttons and tile text fixed
- CR-10: 12 free hints on first launch; interstitial ad skipped offline; HintModal offline placeholders
- CR-11: Removed 3 dead functions from gameUtils.jsx (old Mystery Word algorithm)
- CR-12: Settings page refreshed — all 5 levels, all 23 categories, back button, auto-save indicator, Theme stub removed, "Delete Account" → "Reset Game Data"
- **Baseline established at commit `129f64f`**
- Launch Plan and Change Register created in workspace folder
- All 6 decision points resolved (app name, Mac/Xcode, monetisation, ads, domain, analytics)

### 2026-03-28 (Windows — docs into repo, line endings, DEF-08)
- Moved Change Register and Launch Plan into `docs/` inside the repo — now available from Mac and any machine via git pull
- Added `.gitattributes` (`* text=auto eol=lf`) to prevent CRLF/LF conflicts between Windows and Mac checkouts
- DEF-08: Fixed dark mode text colour inheritance on category and level selector tiles (same class as DEF-07); icon and title now displayed inline
- DEF-09: WelcomeScreen feature grid referenced removed mode "Spelling Bee" — replaced with Mystery Word

### 2026-03-28 (Windows — CR-13 Daily Challenge overhaul)
- CR-13: Daily Challenge page fully rewritten — fixed viewport layout (matching Game.jsx), landscape/portrait orientation, board sizing via JS measurement
- CR-13: Removed SpellingBeeWordList import/usage; added mystery_word mode; fixed hintCell → hintCells array
- CR-13: Fixed hints hardcoded to 3 in DailyChallenge.jsx (missed by CR-10) — now correctly uses `?? 12`
- CR-13: Replaced 2 broken "spelling" mode templates in DailyChallengeUtils.jsx ("Tech Hunt" → standard, "Food for Thought" → association)
- CR-13: Fixed MODE_LABELS in DailyChallengeCard.jsx (removed spelling, added mystery_word)

### 2026-03-28 (Windows — CR-14, Vercel deployment, beta test setup)
- CR-14: Deleted orphaned `SpellingBeeWordList.jsx` — no longer imported anywhere after CR-13
- **Vercel deployment complete** ✅ — live at `word-find-adventure.vercel.app` (auto-deploys on push to `main`)
- Created `SoundFind Beta Test Plan.xlsx` (4 tabs: Test Script, Results Tracker, Defect Log, Setup Guide) — saved in workspace
- Beta tester Google Form created by user — responses sheet: `SoundFind Beta Testing (Responses)`, 7 columns confirmed correct
- Created public Google Sheet "SoundFind Beta Test Script" — all 29 test cases, formatted, viewer access, short URL: https://tinyurl.com/2bw3jdod
- Created `docs/Beta Tester Invite Message.md` — committed to repo, 3 links: app URL, Google Form short URL, Test Script short URL
- **Beta testing now active** — invite message ready to send, testers report via Google Form

### 2026-03-29 (Windows — DEF-18: unique-letter preference rule extended to word list selection)
- DEF-18: The unique-letter preference rule (DEF-16) was only applied to the mystery word selection, not to the regular word list — so short words like IRAN could appear in the list with all their letters already covered by other words
- Word pool remains the same themed category as Standard mode (e.g. Countries game uses `wordLists['countries']` for both the word list and mystery word)
- Fix: added `preferUniqueLetters` parameter to `pickWords`; in Mystery Word mode, words are greedily selected so each contributes at least one letter not already in the other selected words; fallback to any valid word only if all 26 letters are already exhausted

### 2026-03-29 (Windows — DEF-16 + DEF-17 mystery word fixes)
- DEF-17: Mystery word selected from wrong category (INTERSTELLAR in a Food game) — filler loop overshot all valid food word lengths, leaving K=11 which matched a space bonus pair; fix: pre-compute `validMysteryLengths` from category pool; filler loop stops when empty cell count hits a valid length; cross-category fallback retained as genuine last resort
- DEF-16: Mystery word could use only letters already present in regular word list — fix: build `placedLetters` set from all placed words; `findMysteryWord` now prefers candidates with at least one letter not in that set; falls back gracefully if no unique-letter candidate exists at the target length

### 2026-03-29 (Windows — DEF-15 level selector hover appearance)
- DEF-15: Medium difficulty tile in level selector appeared permanently hovered — selected state styling (`shadow-lg shadow-violet-200`) was visually identical to the hover shadow
- Fix: replaced shadow with `ring-2 ring-violet-300 ring-offset-1` in `LevelSelector.jsx` — ring clearly indicates selection without resembling hover elevation

### 2026-03-29 (Windows — DEF-14 substring word acceptance)
- DEF-14: Highlighting CAKE within PANCAKE's grid cells incorrectly marked CAKE as found — `checkWord` matched on spelling only, never validated cell positions
- Fix: added position guard in `handleWordFound` — after spelling match, compares selected `cells` against `wordPositions[word]` using a set comparison; rejects if they don't align exactly
- Handles both forward and backward word selections correctly

### 2026-03-29 (Windows — DEF-13 Next Level crash)
- DEF-13: App crashed when clicking Next Level — `window.location.assign('/Game?...')` caused a hard page reload; Vercel returned 404 because no SPA routing was configured
- Fix 1: added `vercel.json` with `rewrites` rule to serve `index.html` for all routes (standard SPA fix for Vercel)
- Fix 2: replaced `window.location.assign()` with React Router `navigate()` in `handleNextLevel` — eliminates the hard reload entirely
- Fix 3: updated `useEffect` in `Game.jsx` to depend on `[level, mode, category]` so the game re-initialises automatically when URL params change via client-side navigation

### 2026-03-29 (Windows — traceability infrastructure)
- Created `docs/Traceability.md` — full dependency matrix mapping all 15 feature areas to their source files, related docs, and beta test cases; includes cross-cutting rules and document ownership table
- Created `scripts/hooks/pre-commit` — git hook that warns at commit time when source file changes are made without the corresponding docs being updated (Change Register, STATUS.md, Traceability.md, README.md, etc.)
- Created `scripts/install-hooks.sh` — one-command installer to copy hooks into `.git/hooks/` on any machine after cloning
- **To activate on each machine:** run `bash scripts/install-hooks.sh` from repo root

### 2026-03-28 (Windows — DEF-10, DEF-11 defect fixes)
- DEF-10: Audio Challenge word list dots wrapping onto second line — added `whitespace-nowrap` to dot span in `WordList.jsx`
- DEF-11: Audio Challenge using robotic Microsoft voice instead of Google US English — `getVoices()` was short-circuiting on first synchronous call (only 8 local Microsoft voices) before Chrome's `voiceschanged` fired with all 27 voices including Google ones; removed early-return in `voiceUtils.jsx`
- DEF-12 raised: Audio Challenge voice quality poor on Safari/Mac — separate issue from DEF-11; investigation handed off to Mac session. Full diagnostic steps in `docs/Safari Voice Investigation.md`

### 2026-03-29 (Mac — DEF-12 investigation, beta message finalised)
- Beta tester invite message finalised — deadline set to Saturday 11 April, links reformatted, signed off as "Thanks Waz!" — sent via iMessage
- DEF-12 investigated on Mac using Safari Web Inspector console diagnostic
  - Safari returns 223 voices synchronously (no voiceschanged timing issue)
  - No enhanced voices installed on test Mac (Paula's MacBook Air) — only basic compact voices available
  - Scoring algorithm working correctly — Karen (en-AU) selected at score 105, novelty voices correctly ignored
  - **No code fix required** — voice quality limited by macOS installed voices, not a bug
  - iOS beta testers will have Karen (Enhanced) pre-installed; they will get high-quality audio automatically
  - DEF-12 closed with no code change; `docs/Safari Voice Investigation.md` retained for reference

### 2026-03-31 (Windows — DEF-19, CR-15, CR-16/CR-17 mockups)
- DEF-19: Fixed touch scroll / pull-to-refresh conflict on mobile web — React 17+ passive touch listeners silently ignore `e.preventDefault()`; fixed by adding non-passive DOM listeners (`{ passive: false }`) for `touchstart` and `touchmove` directly on the grid element in `GameBoard.jsx`. Added `overscrollBehavior: 'none'` to board container for CSS-level pull-to-refresh suppression.
- CR-15: Changed interstitial ad trigger from every 3 game **starts** to every 6 **completed** games. `Game.jsx` now increments `games_completed_count` in localStorage on victory; `Home.jsx` reads this counter (with `last_ad_completed_at` to prevent double-triggering) rather than the old `game_start_count`. `AD_FREQUENCY` changed from 3 → 6.
- CR-16 & CR-17: HTML mockups created (`CR-16-CR-17 Mockups.html` in workspace) for Waz review — showing collapsible word list (tap-to-toggle, auto-expand on victory) and responsive full-width grid sizing vs landscape nudge banner. Awaiting Waz sign-off before implementation.

### 2026-04-19 (Mac — DEF-35 word placement bug)
- DEF-35: Fixed Mystery Word mode bug where a word appeared in the Words to Find list without being placed in the grid. Edge case in the filler loop where a word ends up in `placedWords` but its `wordPositions` entry is deleted by the undo/overlap logic. Hint system was marking the unplaced word as found with no grid cells highlighted. Fix: filter `placedWords` against `wordPositions` before returning from `generateGame` — any word without a grid position is dropped. Commit `2b5b6d9`.

### 2026-04-28 (Windows — CR-42 APPX tile fix + resubmission)
- CR-42: Fixed MS Store certification failure (policy 10.1.1.11 — default/generic tile assets).
  - Root cause: electron-builder generates Square150x150 at 300×300 (double size) and Wide310x150 at 620×300 with white/grey backgrounds — not branded.
  - `scripts/generate-appx-assets.mjs` created — sharp-based generator for 6 branded PNG tiles (dark #0f0e1a background, icon centred for square tiles; Wide tile: icon left-aligned + SVG "Sound"/"Find" text overlay on right side).
  - `scripts/patch-appx-assets.mjs` created — uses makeappx.exe to unpack APPX, replace tile assets, repack. adm-zip corrupts APPX zip format (0x80511002 error); makeappx is the only correct tool.
  - `electron:dist` script updated to auto-run patch after electron-builder.
  - `electron/appx-assets/` committed with all 6 branded tiles. Commits `0f64a94` + `1b06c5d`.
  - `docs/Store Submission Checklist.md` created — 5-section pre-submission checklist to prevent future regressions.
  - Resubmitted to Partner Center 27 Apr 2026 — passed pre-processing, in certification as of 28 Apr 2026.
- MER tile assets verified — Flutter msix generates proper multi-scale variants (scale-100 through scale-400), all branded on dark background. No action required.

### 2026-04-26 (evening — Terms of Service link)
- CR-41: Added Terms of Service link to Settings About & Legal section (`Settings.jsx`) — between Privacy Policy and Support & Contact. ToS page already live at uniquegames.com.au/soundfind/terms/. Commit `c7ff500`.

### 2026-04-26 (Windows — integrity checks, missing clues, Sentry, privacy)
- Fixed: 5 words in wordLists (ATMOSPHERE, DATA, LORD, MEMORY, SUNLIGHT) had no Association clue — all 1,306 words now have dedicated clues. Commit `68c73bc`.
- CR-39: Added Sentry crash reporting (`@sentry/react`) — `sendDefaultPii:false`, disabled when `VITE_SENTRY_DSN` unset, app wrapped with `Sentry.withProfiler`. Commits `c810a2a` + `0365e82`.
- Sentry project created at sentry.io (slug: soundfind, org: bedlin-development ⚠️ **CORRECTED 30 Sep 2026: the live org slug is `bedlin-pty-ltd`**, region `us.sentry.io`, per the Sentry MCP `find_organizations`; the old value is kept as written). DSN added to Vercel (Production + Preview) and `.env.local`. End-to-end verified — test error appeared in Sentry dashboard (SOUNDFIND-2), then resolved.
- Privacy Policy (uniquegames-site) updated with Sentry disclosure — Section 8 now covers crash reporting (US storage, 30-day retention, no PII). Site deployed and verified at uniquegames.com.au/soundfind/privacy/. Commit `a847117`.
- MER Change Register updated — entries 33–37 added covering commits f693b57, 52b41b9, a42594f, a42594f, fc01e97.
- ClickUp handoff document updated.
- CR-40: Electron MSIX build complete — `electron/main.cjs` created, electron-builder configured with Partner Center identity (`UniqueInteractiveGames.SoundFind`). `SoundFind 1.0.0.appx` (265 MB) built and uploaded to Partner Center. **Submitted for certification 26 Apr 2026.** Store ID: `9PG86ZDTB3P0`. Commit `29d40db`.

### 2026-04-25 (Windows — CR-03 completion, code audit)
- Pre-Electron build code audit identified that CR-03 (Lightbulb hint for all non-audio modes) was incompletely implemented — Anagram Hunt and Word Association were missing the Lightbulb button entirely
- Fix: added `onHintCell` + `hintsRemaining` props to `AnagramWordList` and `AssociationWordList` via `WordListSwitch` in `Game.jsx`; added Lightbulb button to each component following the `WordList.jsx` pattern
- All 4 non-audio modes (Standard, Mystery Word, Anagram Hunt, Word Association) now have the Lightbulb hint — CR-03 fully complete
- Commit `7b5bcb9` — lint clean, build passing
- DEF-41: Removed RED and TAN from colours word list — both are 3 letters, below the 4-letter minimum required for Master difficulty grid placement. Commit `da4224e`.

## Session: 29 April 2026 (continued) — Windows

**SoundFind v1.0.1 submitted for certification**

Issues found in v1.0.0 after publication and fixed in v1.0.1:
- **Electron window was 430×860px (phone size)** — changed to 1280×820 desktop in `electron/main.cjs`
- **ElevenLabs audio not working** — `loadFile()` + absolute `/audio/...` paths failed silently, fell back to Web Speech API. Fixed by adding `app://` protocol handler in `electron/main.cjs` so `dist/` is served correctly
- **Service worker registration errors in Sentry** — PWA SW cannot register on `file://` or `app://` protocols. Fixed by disabling VitePWA plugin for `--mode electron` builds in `vite.config.js`
- **patch-appx-assets.mjs hardcoded v1.0.0 filename** — would have shipped v1.0.1 with unbranded tiles. Fixed to read version dynamically from `package.json`
- **Store logo slots empty** — generated `assets/store_logo_300x300.png` + `assets/store_logo_1080x1080.png` and uploaded to Partner Center
- **Screenshots were portrait/mobile** — retaken at 1561×940px desktop resolution, uploaded to Partner Center
- Commits: `aa12b13` (v1.0.1 fixes), `14f537e` (patch script fix)

**Submitted for certification:** 29 April 2026
**v1.0.1 PUBLISHED:** 29 April 2026 — passed certification same day

### 2026-06-10 (Windows — CR-58: Sentry instrumentation for AdMob + RevenueCat)

**v1.1.0 confirmed live on App Store — all 4 IAPs visible. AdMob serving (A$0.09 earned). RevenueCat SDK connected.**

- **CR-58:** Added Sentry error capture to monetisation layer:
  - `admob.js`: `captureException` on `initAdMob` failure; `addBreadcrumb` on `prepareInterstitial` / `showInterstitial` / `showRewarded` failures (operational noise, not issues)
  - `purchases.js`: `captureException` on `initPurchases` failure; `addBreadcrumb` on `fetchAndCachePrices` failure
  - `HintModal.jsx` + `RemoveAdsModal.jsx`: `captureException` on non-cancel purchase errors
  - `main.jsx`: Sentry release updated `soundfind@1.0.0` → `soundfind@1.1.0`
- Ops dashboard: new `/api/revenuecat` route + IAP today/MTD row added to SoundFind card. Requires `REVENUECAT_SECRET_KEY` in Vercel env vars.

### 2026-06-07 (Mac — CR-57: dynamic IAP pricing + SoundFind v1.1.0 submitted)

**SoundFind v1.1.0 submitted to App Store — under review**

- Pulled CR-56 (Windows — AdMob + RevenueCat wiring) to Mac; ran `npm install` to install `@capacitor-community/admob` + `@revenuecat/purchases-capacitor`
- **CR-57:** Dynamic IAP pricing via RevenueCat — `purchases.js` fetches live prices from `getOfferings()` after init, caches by product identifier, exposes `getPrice(id, fallback)`; `HintModal` + `RemoveAdsModal` now show local store currency (AUD for AU users). Fixed SDK property name bug: `product.identifier` not `product.productIdentifier`. Fallback prices labelled `US$X.XX` for clarity. Commit `77cb13f`.
- **Settings — Go Ad-Free button** added (native only, hidden once purchased) so users can reach RemoveAdsModal without waiting for an interstitial. Commit `77cb13f`.
- **IAP review screenshots** taken on device (HintModal purchase view + RemoveAdsModal) and uploaded to App Store Connect via API for all 4 products — all products set to Ready to Submit.
- Bumped version to **1.1.0 (Build 4)** in `package.json` + Xcode project. Commit `4b45ba1`.
- Built IPA via `xcodebuild archive`, exported, uploaded via `xcrun altool` (Delivery UUID: `68d1f7e4-b768-419d-b1aa-62e0a45bf3e8`).
- **Submitted v1.1.0 for App Store review — 7 June 2026.** All 4 IAPs included. Marketing URL set. Under review (up to 48 hours).

**Note:** SoundFind Change Register needs CR-57 + v1.1.0 entries added on Windows.

### 2026-05-19 (Mac — CR-53: iOS Capacitor bug fixes post v1.0.1)

Five bugs discovered after v1.0.1 went live on the App Store, all fixed and committed `ad8460a`.

**Audio (ElevenLabs MP3s falling back to native TTS):**
- Workbox service worker (registered during development) was intercepting `capacitor://localhost/audio/…` fetches from the SW thread — silently failing, falling back to Web Speech API
- Fix: `vite.config.js` skips VitePWA plugin for `--mode capacitor` builds; `main.jsx` unregisters any stale SW on launch via `window.Capacitor` guard
- `fetchBuffer` switched from `fetch().arrayBuffer()` to XHR (`responseType='arraybuffer'`, `status===0` treated as success) — XHR is reliable for custom URL schemes in WKWebView; `fetch()` is not
- New npm script: `build:ios` → `vite build --mode capacitor`

**Status bar overlap:** `index.html` gained `viewport-fit=cover`; all page containers use `env(safe-area-inset-top/bottom)` padding; Game.jsx and DailyChallenge.jsx use `max(PAD, env(safe-area-inset-top))` for landscape/portrait

**Rubber-band scroll:** `scrollEnabled: false` + `allowsLinkPreview: false` in `capacitor.config.json`; CSS `overscroll-behavior: none` on body; `html` + `body` set to `height: 100%; overflow: hidden`

**Bonus word grid hidden by keyboard:** Replaced text input (triggered iOS keyboard, shrinking the grid) with tile-tap UX — gold letter cells turn bright amber during bonus hunt; tapping each adds its letter to display slots; no keyboard ever appears. `GameBoard.jsx` gained `bonusHuntActive` + `onBonusCellTap` props; single-cell tap on a bonus cell fires `onBonusCellTap(letter)`. Portrait bonus hunt layout: banner above board, board fills remaining space with `flex: 1`.

**Page transition flash:** `ScrollToTop` component added to `App.jsx` using `useLayoutEffect` — resets `#root.scrollTop = 0` before paint on every route change, preventing new page from briefly inheriting prior scroll position.

**Animation flash on mode/category lists:** `GameModeSelector.jsx` had staggered `initial={{ opacity:0, y:10 }}` and `initial={{ opacity:0, x:-20 }}` entry animations; `CategorySelector.jsx` had `initial={{ opacity:0, scale:0.9 }}` with delays up to 1.1 s (15 items × 0.08 s). All entry `initial`/`animate`/`transition` props removed; `whileHover`/`whileTap` retained.

**CR-31 re-fix:** `<span className="hidden sm:inline">How to Play</span>` in `Home.jsx` had been overwritten by CR-52 iPad layout change — re-applied.

All fixes committed `ad8460a`, version bumped to 1.0.2 (`65d652a`), pushed to GitHub. IPA (Build 3) uploaded to App Store Connect (Delivery UUID: `503a63b5-464c-4b24-8252-47c7aa079bfc`). Submitted for App Store review 19 May 2026. **v1.0.2 approved and live on App Store — 19 May 2026. All CR-53 fixes confirmed.**

### 2026-05-15 (Mac — SoundFind iOS App Store submission)

- **CR-51:** iOS App Store prep — Xcode DEVELOPMENT\_TEAM (B7LWF6Z674), app icon (SoundFind brand), splash screen (dark #0f0e1a), `ITSAppUsesNonExemptEncryption = false`. Commit `0795a4b`.
- **DEF-51:** DailyChallenge portrait board left-aligned on iPad — missing `display: flex; justifyContent: center` on board container (Game.jsx had it, DailyChallenge was missed). Commit `6c880f0`.
- **CR-52:** v1.0.1 iOS — version injection from package.json into Vite build as `__APP_VERSION__` global; Settings.jsx reads `__APP_VERSION__` dynamically; Xcode `MARKETING_VERSION` bumped to 1.0.1, `CURRENT_PROJECT_VERSION` to 2; Home layout `max-w-lg md:max-w-2xl` for iPad. Commit `aaf730d`.
- IPA built (v1.0.1, Build 2) and uploaded to App Store Connect via altool. Delivery UUID: `19ed3a53-d2fe-4ca4-ab77-edc5cec8f21a`.
- iPhone 6.9" (4 screenshots) + iPad Pro 12.9" (4 screenshots) uploaded and confirmed COMPLETE via API.
- App Privacy published: Sentry Crash Data + Performance Data, App Functionality, not linked to user.
- **SoundFind v1.0.1 submitted for App Store review — State: WAITING\_FOR\_REVIEW.** Submission ID: `d05414cc-7e87-4650-a6e1-56c7b196a255`.

### 2026-05-24 (Windows — Google Play Console setup)

- Created new personal Google Play developer account (apps@uniquegames.com.au, Account ID: 4868428079566899392)
- Created app with package name `au.com.uniquegames.soundfind`
- Completed store listing: title, short description, full description, screenshots (4 × 1080×1920 phone), feature graphic (1024×500), icon (512×512)
- Content rating (IARC), data safety, privacy policy, ads declaration (no ads) all completed
- Created upload keystore: `C:\dev\keystores\soundfind-upload-keystore.jks` (alias: soundfind-upload)
- Built signed release AAB v1 (99.2MB) — audio verified working on emulator
- Uploaded AAB to internal testing track
- Discovered closed testing requirement: 12 testers opted-in for 14 days before production access
- New scripts: `scripts/resize-google-play-icon.mjs`, `scripts/resize-gp-screenshots.mjs`
- New assets: `assets/google_play_icon_512.png`, `assets/google_play_feature_graphic.png`, `assets/screenshots/google_play_phone/sf-gp-phone-1 through 4.jpg`
- New docs: `docs/google-play-feature-graphic.html`

### 2026-05-26 (Windows — v1.1 monetisation setup: AdMob + RevenueCat)

- **CR-55 raised** — next Google Play upload must use `build:android` (`vite build --mode capacitor`); existing AABs include PWA service worker (same root cause as CR-53 iOS audio bug). versionCode 3, versionName 1.0.1. Commit `4a3d523`.
- **AdMob account created** (apps@uniquegames.com.au, pub-1060374954785370)
  - W-8BEN tax form completed — 0% US withholding (Article 7, Australia-US treaty)
  - Android app added (not yet linked to Play Store — closed testing only)
  - iOS app added (linked to App Store, live listing)
  - 4 ad units created: Android Interstitial `/7201714073`, Android Rewarded `/5473699434`, iOS Interstitial `/8928590640`, iOS Rewarded `/2712182023`
  - `app-ads.txt` added to uniquegames.com.au — committed `e0a84a2`, deployed
  - Payment/bank account pending — AdSense billing still provisioning (up to 24h)
- **RevenueCat account created** (apps@uniquegames.com.au)
  - SoundFind project created (Capacitor platform)
  - iOS App Store app configured — P8 key uploaded (B4U6Q6F7V8), SBP start date 2026-05-16, API key `appl_uaNkxxIRCiSXwfwQkJvoCSyQuSF`
  - Google Play blocked — API access not available on new personal account until app goes to production
- **App Store Connect IAP key generated** — SoundFind RevenueCat, Key ID B4U6Q6F7V8, Issuer ID 3dbf7469-74db-4222-a6cd-acf9f2bf93fb, P8 saved to `C:\dev\keystores\`
- Windows monetisation confirmed out of scope for v1.1 — Electron MSIX stays as-is (12 free hints, no ads/IAP)
- v1.1 scope locked: AdMob + RevenueCat on Android + iOS only; CR-55 bundled in

### 2026-05-25/26 (Windows — Google Play closed testing setup)

- Bumped `android/app/build.gradle` versionCode 1 → 2 (v1 already consumed by internal track upload)
- Rebuilt signed AAB v2 — uploaded to Closed testing Alpha track
- Created tester email list "SoundFind Testing" — 3 valid Google accounts added
- Feedback channel set to `contact@uniquegames.com.au`
- Opt-in link: `https://play.google.com/apps/testing/au.com.uniquegames.soundfind`
- All store setup items (privacy policy, content rating, data safety, ads declaration, app category, target audience) completed and submitted for review
- Release 2 (1.0) in review across 177 countries
- Facebook follow-up comment drafted — to be posted once review passes and track goes Active
- Need 9 more testers to opt-in (have 3 valid Google accounts, need 12 total for 14-day requirement)

### 2026-06-05/06 (Windows — CR-56 RevenueCat + AdMob dashboard setup)

- **CR-56 committed** — all v1.1 monetisation code already committed in prior session (`1ab255b` + `79ed002`). No new code this session.
- **RevenueCat dashboard fully configured:**
  - 4 products created in product catalog: `hints_3` ($0.99), `hints_10` ($1.99), `hints_25` ($3.99), `remove_ads` ($2.99)
  - `remove_ads` entitlement created and linked to `remove_ads` product
  - `default` offering created (REST ID: `ofrng5f489f0cc2`) with 4 packages: `hints_3`, `hints_10`, `hints_25`, `remove_ads`
  - iOS app: P8 key B4U6Q6F7V8 confirmed valid; S2S notification URL already set in App Store Connect
- **App Store Connect IAP products** — 4 products created (3 consumable hint packs + 1 non-consumable remove_ads). Review screenshots not yet added — required before v1.1 submission.
- **App Store S2S notification URL** confirmed set: `https://api.revenuecat.com/v1/incoming-webhooks/apple-server-to-server-notification/blbikLvuuyaJZoMDiTqgYtPqeOmMKIpa`
- **AdMob:** Account approved ✅ Payment profile complete ✅ `app-ads.txt` live at `uniquegames.com.au/app-ads.txt` ✅ iOS app "Requires review" — blocked because App Store listing has no developer website URL (app is under Notiva account). Fix: add `https://www.uniquegames.com.au` as Marketing URL in v1.1 submission → AdMob will verify automatically once v1.1 is live.
- **Android RevenueCat key** still TODO — waiting for Google Play production access (after 12 testers × 14 days closed testing).
- Change Register CR-56 entry added, committed and pushed (`363e9a2`).

### 2026-09-30 (Windows — CR-59 Sentry minimised for a child-directed app, brief SF-8)

- **CR-59:** Sentry now sends scrubbed error events only. New `src/lib/sentryConfig.js` holds every `Sentry.init` option; `main.jsx` calls it. Tracing removed (`browserTracingIntegration` gone, `tracesSampleRate` omitted, because `@sentry/core` 10.50.0 treats `0` as enabled). `beforeSend` cuts `request.url` to scheme, host and path and removes `User-Agent` and `Referer`. `beforeBreadcrumb` drops navigation breadcrumbs. The `BrowserSession` integration is removed because session envelopes carry the user agent and bypass `beforeSend`. `sendDefaultPii: false` kept. CR-58 capture calls unchanged. Release string unchanged (SF-4 owns it).
- **First test harness in the repo:** Vitest 3.2 + jsdom, `npm test`. 19 tests across two files, including an end-to-end test that runs the real SDK with a capturing transport. Five fault controls run in a scratch copy; each failed the expected tests.
- Sentry org slug corrected in the 2026-04-26 entry (annotated, old value kept).
- **Developer actions (not done by the CLI):** in Sentry project settings turn on *Prevent storing of IP addresses* and the default data scrubber; on the Mac, check whether `.env.local` holds `VITE_SENTRY_DSN` (iOS 1.1.0 sent 0 events in 90 days).

### 2026-09-30 (Windows — CR-60 child-directed ads, brief SF-7)

- **CR-60:** every ad request is child-directed and non-personalised (decision S1). `initialize` gets `tagForChildDirectedTreatment`, `tagForUnderAgeOfConsent` (both `true`) and `maxAdContentRating: General`; every interstitial and rewarded request gets `npa: true`. UMP is asked for consent info with TFUA true, before `initialize`, failure-safe; no consent or privacy-options form is ever shown. No ATT prompt and no `NSUserTrackingUsageDescription`. AdMob plugin left at 8.0.0.
- **Found while verifying:** the UMP binary does contain `requestTrackingAuthorization`, reachable only when a UMP form is shown. The app never shows one; the tests pin that. Also, do not create an IDFA explainer message in AdMob Privacy & messaging.
- Tests: `src/lib/admob.test.js`, 13 tests; 32 in the suite. Ten fault controls each failed the expected tests.
- **Needs a device build to take effect on iOS/Android**; the web and Electron builds make no ad calls. The EEA consent status can only be read on a device (plugin `debugGeography: EEA` plus a test device id).
- **CR-60 amendment (g), same day:** TFUA removed from `initialize` (Google: TFCD and TFUA should not both be true); it stays on the UMP consent request. `initialize` now carries TFCD and rating G only. Tests updated; fault control failed as expected. Decision S5 (App Store "Tracking" is NO) recorded in the brief; it reaches CURRENT DECISIONS via SF-6.
- **Console steps (developer):** see the CR-60 report. AdMob app-level child-directed and G rating; no IDFA message; App Store privacy answers (the Tracking question is still open); do not opt into the Kids Category; Play target audience and Families when Android ships.

### 2026-09-30 (Windows — CR-61 Daily Challenge, brief SF-1)

- **CR-61:** a Daily Challenge victory now saves score, games played, words found, best streak and the reward hints; before this, only the daily record was written, and with `score: 0`. The record is keyed by the player's **local** date, and the streak looks up the previous local date. Templates rotate by whole days, so consecutive days never repeat (the old formula repeated on six day-pairs a year). CAKE inside PANCAKE is rejected, as in the main game, and hints are one at a time with the timer cleaned up. Daily records now carry `category`, so the Stats category chart fills in.
- **Existing `wf_daily` records keep their UTC keys and are read at face value: no migration, no fallback lookup.** Why: an old key cannot be mapped back to a local day, because the record holds no timestamp. For an Australian player, a key could mean "that day after 10:00" or "the next day before 10:00". Any fallback that guesses would, every morning before 10:00, read yesterday's completion as today's and lock the player out, which is worse than the one-off below.
  - **What a player sees on upgrade day:** if they completed that day's challenge **before 10:00 (11:00 in daylight saving)** on the old version, the new version shows it as **not done**. They can play once more and earn its reward hints a second time.
  - **Streak:** a streak spanning the upgrade can be off by one day, once. `best_streak` never decreases, since it is a `Math.max`.
  - A completion after 10:00 on the old version already had the local date as its key and carries over exactly.
  - Players west of UTC (the Americas) see the opposite edge: an evening completion on the old version can show as done on the next local day, once.
  - The challenge **title** for a given date also changes once at upgrade (e.g. 30 Sep: Ocean Deep before, Emotional Journey after). Completion is keyed by date, not template, so this does not reopen or close anything.
- Tests: 16 new (50 in the suite). Ten fault controls each failed the expected tests.

### 2026-09-30 (Windows — CR-62 Anagram scrambles, brief SF-2)

- **CR-62:** after Replay or Next Level, Anagram mode showed every word unscrambled, because the list component stayed mounted and never re-scrambled the new words. It now re-scrambles whenever the words change, and can never fall back to showing the answer. This also fixes Try Again on the Daily screen's anagram challenges. Reshuffle per word still works.
- Tests: 5 new (55 in the suite); both fault controls failed as expected.

### 2026-09-30 (Windows — CR-63 audio overlaps, brief SF-9)

- **CR-63:** audio now has one playback channel: at most one thing speaks at a time, and the newest request wins. Finding a word mid-announcement stops the announcement; two quick finds no longer layer; a slow earlier fetch can no longer play late; leaving Game, the Daily Challenge or Settings silences audio. The Web Speech fallback obeys the same rules. The iOS/Android unlock (DEF-38) is untouched.
- **Found, not changed (for the developer):** the bonus-word find plays "Great! You found X" from the MP3, while its text fallback says "Amazing! The hidden word was X". The `hidden_word_was` MP3 exists and is preloaded but is never played.
- Tests: 7 new (62 in the suite); fault controls failed as expected.
- **Device check still to do (developer):** run the seven SF-9 scenarios on an iPhone build and in the Windows build (see the CR-63 report).
- **Follow-up (h), same day:** the bonus-word audio "mismatch" is unreachable. Bonus words exist only in Mystery Word mode, and audio feedback only in Audio mode (measured: 0 bonus words in 350 audio games; 217 in 350 Mystery Word games). No code change. SF-9 scenario 4 cannot happen, so skip it on the device check.

### 2026-09-30 (Windows — CR-64 Windows build, brief SF-3)

- **CR-64:** the Windows and web builds no longer show a fake "Ad", a Skip that still paid out, a hint-pack offer they cannot fulfil, or any Unsplash image. Out of hints, they offer **3 free hints once every 24 hours** (new key `sf_free_hint_refill_at`). iOS and Android are unchanged.
- **Electron shell:** links open in the system browser, navigation away from the app is blocked, no menu bar, one instance only.
- **Package:** `node_modules` excluded; appx **296,314,480 → 251,095,000 bytes** for the same code (−15.3%). Proved unneeded by driving the packaged build through a full game, audio, Test Voice and the Privacy link, with a positive control for the missing-module case.
- **Web (Vercel):** the web build takes the same `!isNative()` path, so the same surfaces change there: no ad step before a game, the free refill in place of the simulated ad and the "Buy Hint Pack" offer, and no Remove Ads button. The web build is deployed (production deploys READY on every push); whether anyone uses it is **not observable** (Vercel Web Analytics is not enabled; Sentry had 0 web events in 90 days).
- Tests: 12 new (74 in the suite); fault controls failed as expected. Not uploaded to Partner Center.

### 2026-09-30 (Windows — CR-65 truth pass, brief SF-4)

- **CR-65:** in-app copy now matches the code: level word counts (10 / 15 / 20), the Remove Ads perk, the reset dialog (hints and purchases are kept), the Sound Effects slider removed (nothing read it), and the voice rate and pitch relabelled as backup-voice settings. Sentry's release now comes from `package.json`. `package.json` gains `description` and `author`.
- Docs annotated: ARCHITECTURE §3 (mode-label census) and §5 (all 10 storage keys), this file's overview, CLAUDE.md's lock advice, and SoundFind premise 2 in the claude.ai instructions source.
- Recorded, not changed: the `AD_FREQUENCY` 3 → 6 revert by DEF-35's commit (decision S4 keeps 6), and DEF-52, the Electron service-worker `InvalidStateError`.

### 2026-09-30 (Windows — CR-66 decisions S2 to S4, brief SF-6)

- **CR-66:** one set of mode names everywhere (S2), with the census shown before and after. The short names only ever lived in a Daily-card map that is never rendered; the loading screen's "Standard Mode" and missing Mystery Word label, which players did see, are fixed. **The Leaderboard tab is removed** (S3): the nav is Home, Stats, Settings, and an old `#/Leaderboard` link shows Page Not Found with a router-based Go Home. Tap targets were measured at phone and tablet widths. The interstitial stays at 6 (S4, recorded under CR-32).
- **Decisions S1 to S5 recorded** in the CURRENT DECISIONS block of `C:\dev\CLAUDE.md` and the claude.ai instructions source, as a separate SoundFind table.
- Tests: 12 new (86 in the suite); six fault controls failed as expected.
- ⛔ **Lesson: a commit must be gated on the test command's EXIT CODE.** `1539865` was committed by a command chain that ran `npm test` but did not stop on its result, while one test had timed out; the chain's `&&` covered only the git steps. Fixed in `d1afea4`. From then on: `npm test; RC=$?` and commit only if `$RC` is 0.
- **Investigated `2b5b6d9`'s Register change:** nothing lost; all 33 rows were restored verbatim by `7ea9316` the same day (CR-32 note (2)).

### 2026-09-30 (Windows — CR-67 the S6 hint and ad model restored, brief SF-3R)

- **CR-67:** the Windows and web builds are back to the developer's model (decision S6): 12 starting hints; when out, "Watch an Ad" (placeholder) or "Buy Hint Pack" (Coming soon); and the placeholder ad after every 6 completed games. CR-64's 3-free-hints-every-24-hours refill is **withdrawn**; it was a monetisation change the chat half decided without asking. The Electron shell hardening and the `node_modules` exclusion stay. iOS and Android are unchanged.
- ⛔ **Standing rule (S6): monetisation (what is free, what is paid, when ads show) is the developer's decision; the chat half proposes.**
- Tests: 7 (HintModal rewritten, a new Home ad-gate test); four fault controls failed as expected. The restored Windows build was driven through a game, the 6th-game ad, audio and the Privacy link.
- The "Watch an Ad" test passed on its own but **failed once in the full suite**, which blocked the gated commit, as intended. Cause: the modal's views sit in `AnimatePresence mode="wait"`, so the ad view mounts only after the menu's exit animation. The test now waits for it (bounded) instead of assuming it is there; the fault controls were re-run against the new test and still fail.
- The restore brought back the 4 `images.unsplash.com` URLs (in `AdModal.jsx` and `HintModal.jsx`), as the brief intended ("unchanged"). So the web and Windows builds make third-party image requests again, and the CR-64 annotation on premise 7 in the claude.ai instructions ("0 Unsplash URLs") is now out of date. Not corrected in this pass.

### 2026-09-30 (Windows — CR-68 the offline audio cache matches, brief SF-13)

- **CR-68:** the web service worker's audio route never matched (Workbox tests a RegExp against the full URL, and the pattern was anchored to `/audio/`), so no audio was cached for offline play. It is now a pathname matcher (`src/lib/audioCacheRoute.js`). The cache name `soundfind-audio-v1` and its expiry are unchanged.
- Proof: 4 tests through Workbox's own route classes, with a fault control; the generated `sw.js` checked; and in headless Chrome the new build cached `RAIN.mp3` while the live site (old pattern) cached nothing.
- Recorded, not changed: asset and audio paths are root-absolute, which matters only for a sub-path host such as itch.io (deferred by S8).

### 2026-10-01 (Windows — release prep: 1.1.1, CR-69 to CR-71; decisions S20, S21)

- **Release plan (S20, mobile first): iOS 1.1.1 (build 5) and Android 1.1.1 (versionCode 3).** The chat half's call; the developer may override. Context from public listings the chat half read on 1 Oct 2026: the App Store shows 1.1.0, released 9 June; Google Play has no production listing.
- **CR-69:** version bump. Xcode `MARKETING_VERSION` 1.1.1 and `CURRENT_PROJECT_VERSION` 5 (App target, Debug and Release); `build.gradle` versionCode 3, versionName "1.1.1"; `package.json` 1.1.1.
- **CR-70 (CR-55 item 1, K1):** `build:android` = `vite build --mode capacitor`, like `build:ios`. A plain `npm run build` ships `sw.js`; `build:android` and `build:ios` do not. Test: `src/buildModes.test.js`. ⛔ **Build native only with `build:ios` / `build:android`.** `CLAUDE.md`'s "Build → App Store" section still says `npm run build` and needs correcting.
- **CR-71 (K8, S21):** AD_ID removed from the Android merged manifest (`tools:node="remove"`). Also: the committed Android project had not been synced since CR-36, so it carried neither AdMob nor RevenueCat; `npx cap sync android` fixed that. A debug APK built on Windows shows no AD_ID, versionCode 3 / 1.1.1, and no `sw.js`.
- **Open, not decided:** the three Privacy Sandbox permissions (`ACCESS_ADSERVICES_AD_ID`, `_ATTRIBUTION`, `_TOPICS`) still come from `play-services-ads-api` 24.9.0. `play-services-location` 19.0.0 is in the tree (from Play Billing 8.3.0, through RevenueCat), but the merged manifest requests no location permission.
- **Flaky test, seen once:** `src/leaderboardRoute.test.jsx` timed out at 60 s in one full-suite run; it passed alone twice and in the next three full runs. No code changed in between.

**Remaining, Mac (CLI or developer on the Mac):**
1. `git pull`, `npm ci`, `npm run build:ios`, `npx cap sync ios`; confirm the build log has no `VITE_SENTRY_DSN` warning and the synced bundle has no `sw.js`.
2. Archive 1.1.1 (5) in Xcode, upload to TestFlight.
3. On a device: the seven SF-9 audio scenarios and the first-tap check (DEF-38); hint packs, Remove Ads and restore in sandbox; ads serving.

**Remaining, developer (consoles):**
1. App Store Connect: App Privacy answers (S5: Tracking NO; GMA data types; RevenueCat Purchase History; whether Sentry "Performance Data" still applies after CR-59); submit 1.1.1.
2. Settle SF-8's gate 2 (whether the privacy policy must publish the same day).
   ⚠️ *Settled later on 1 Oct 2026, by the chat half: see the next entry.*
3. Android: RevenueCat Android app and key (the key in `purchases.js` is still empty, so purchases are off on Android); confirm the AdMob Android app and units; the upload key and Play App Signing; build and sign the release AAB with `npm run build:android && npx cap sync android`; closed testing (12 testers for 14 days); Data safety and Families declarations; decide the `ACCESS_ADSERVICES_*` question.
   ⚠️ *The `ACCESS_ADSERVICES_*` question was closed later on 1 Oct 2026: the permissions were removed in CR-73.*

### 2026-10-01, later (Windows — CR-72, CR-73; gate 2 settled)

- **SF-8 gate 2, settled by the chat half on 1 Oct 2026:** the new privacy policy and terms publish **on the day iOS 1.1.1 is released, not before**.
- **`CLAUDE.md`:** the "Build → App Store" steps (`npm run build`) are annotated as superseded: native builds use `build:ios` / `build:android` (CR-55, CR-70). It was the only native build instruction in the file.
- **CR-73:** the three Privacy Sandbox permissions (`ACCESS_ADSERVICES_AD_ID`, `_ATTRIBUTION`, `_TOPICS`) are removed from the Android manifest, which closes that open point. The debug APK now requests only INTERNET, ACCESS_NETWORK_STATE, BILLING, WAKE_LOCK, FOREGROUND_SERVICE and the app's own receiver permission. S21 is annotated in both decisions-table copies.
- **Target SDK:** compileSdk 36, targetSdk 36 and minSdk 24, all set once, in `android/variables.gradle`. Google Play requires API 36 for new apps and updates from 31 August 2026, so the project meets it.
- **CR-72, Android with no RevenueCat key (tests only):** nothing hangs, but tapping a hint pack, Remove Ads or Restore Purchases ends in *"Purchase failed / Restore failed — Please try again."*, which can never succeed without a key, and the purchase taps also send an exception to Sentry. "Watch an Ad" works on AdMob alone. **Open, for the developer:** what those three points should say until the key exists (copy is the developer's call).

### 2026-10-01, evening (Windows — FB-1 and FB-2, brief SF-16)

- **CR-74, FB-1 (store prices):** every price shown is now the store's own `priceString`, or no figure until it loads. The hard-coded *"from $0.99"* and the `US$` fallbacks are gone, and a shop opened before the store answers updates when the prices arrive. On web and Windows no figure appears, since no store price exists there; "Coming soon" is unchanged.
- **CR-75, FB-2 (page-load flicker):** the tab-page slide (which left a blank frame on every tab change) and 14 page-level entry animations are removed; the nav bar and page padding change together, instantly; Stats and Home show their data on the first frame; boards are sized before paint. Modal and victory animations are unchanged. **Still to do:** confirm on a device by screen-recording tab switches and stepping through frames.
- **CR-76, build numbers for this build:** iOS **1.1.1 (6)**; Android stays **1.1.1 (versionCode 3)**, since 3 was never uploaded. `android/app/release/` is now gitignored.
- **CR-77, FB-10 (audio silent after a screen lock, brief SF-17):** iOS leaves the shared audio context `'interrupted'` after a lock, and nothing resumed it, so every play was silent until a force-quit. Every play now makes sure the context is running, rebuilding it if it stays stuck, and returning to the foreground resets audio. **Still to do:** confirm on an iPhone by locking and unlocking mid-game, then tapping the speaker. FB-5 (pitch and voice mismatch) is not code: 16 long words and 2 tricky sentences have no MP3s and fall back to the device voice; generating them is SF-17 Part C.

### 2026-10-02 (Windows — FB-5 audio clips, brief SF-17 Part C)

- **CR-78, FB-5 (voice mismatch on some words):** the 36 missing clips are now in the library: the 16 long words in both voices, and the CONSCIENTIOUS and QUESTIONNAIRE sentences in both voices. The developer generated them with the script's own settings, and no existing MP3 was changed. The two sentences had been skipped because their lines in `trickySentences.jsx` had no space after the colon, which the generator's pattern needs; that space is added. Every game word and every tricky sentence now has a clip in both voices, in the same format as the rest of the library. **Still to do:** in Audio Challenge, play a few of the 16 words and the two sentences on a device and confirm they use Hannah / Neil.
- **Flaky test, second time:** the first `npm test` for CR-78 failed 2 of 114 tests, both in `src/leaderboardRoute.test.jsx`; its first test ran for 70 s. The rerun passed 114 of 114, and CR-78 changes no code that file tests. This is the second time that file has failed and then passed on a rerun (the first was 1 Oct). It's worth looking at its setup time before it blocks a commit.
- **CR-79, FB-10 (audio after a lock, brief SF-20):** SF-19 found two ways audio sticks after a lock, and that App Store 1.1.0 does the same, so this isn't a regression. Now, when the app goes to the background, the game stops its audio and suspends the audio context itself, and on iOS the app also suspends all of the web view's media until it is active again. That way iOS never interrupts the audio on its own, which was where both stuck paths started. CR-77's recovery on return stays. The audio session, the silent switch, CR-63's newest-play-wins, the audio files, prices and ads are unchanged. ⚠️ **The iOS part is compiled only on the Mac** and is unbuilt; it was checked against the WebKit and Capacitor sources. **Still to do, on an iPhone build:** lock for 10 s or more, once idle and once mid-word, unlock and tap the speaker. Audio should play both times without a force-quit, and the silent switch should still mute it.

## Next Steps (Priority Order)

### ✅ SoundFind v1.0.0 PUBLISHED on Microsoft Store — 29 April 2026
- Store ID: `9PG86ZDTB3P0`
- URL: https://apps.microsoft.com/detail/9PG86ZDTB3P0
- IARC Global Rating ID: `e7709de2-3d26-85a5-89c0-3f1dff2dcfaa` — reuse on Google Play and Apple
- uniquegames-site updated with live Windows Store badge

### ✅ SoundFind v1.0.1/v1.0.2 LIVE on Apple App Store — May 2026
### ✅ v1.1 monetisation code complete (CR-56) — Jun 2026

### v1.1 — Still Needed Before Submission
- [ ] IAP review screenshots — add to all 4 products in App Store Connect (needs device/Mac)
- [ ] Set Marketing URL = `https://www.uniquegames.com.au` in App Store listing (fixes AdMob app-ads.txt #96)
- [ ] Build v1.1 on Mac → TestFlight → test IAP + ads on device
- [ ] Add Android RevenueCat API key to `purchases.js` (after Google Play production — waiting on 12 testers × 14 days #90–92)
- [ ] AdMob bank account verification (#95) — check AdSense billing once fully provisioned

### Google Play Closed Testing (#90–92)
- Need 9 more testers to opt-in (have 3, need 12 total for 14-day requirement)
- Opt-in link: `https://play.google.com/apps/testing/au.com.uniquegames.soundfind`