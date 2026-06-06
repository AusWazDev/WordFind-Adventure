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

## Multi-platform Roadmap
- **Web PWA** — Vercel deployment (beta testing via `*.vercel.app` URL, testers add to home screen)
- **Native** — Capacitor for iOS / Android builds (Phase 5)
- **App Stores** — Apple App Store + Google Play (Phase 6)
- **Domain** — `uniquegames.com.au` reserved on Hostgator (pending ABN); `play.uniquegames.com.au` → Vercel once active

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
- Sentry project created at sentry.io (slug: soundfind, org: bedlin-development). DSN added to Vercel (Production + Preview) and `.env.local`. End-to-end verified — test error appeared in Sentry dashboard (SOUNDFIND-2), then resolved.
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