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

## Next Steps (Priority Order)
- [ ] Deploy to Vercel for beta testing (Waz to complete — personal account selected)
- [ ] Beta test all game modes, levels and categories — log defects via Change Register
- [ ] Wire up RevenueCat SDK (IAP + remove-ads) — Phase 5 with Capacitor
- [ ] Wire up real AdMob (replace Unsplash placeholder) — Phase 5 with Capacitor
- [ ] App icon design (1024×1024 master)
- [ ] PWA manifest + service worker (vite-plugin-pwa)
- [ ] Capacitor setup for iOS/Android native builds
- [ ] Analytics: PostHog + Sentry integration (before public launch)
- [ ] Privacy Policy page on uniquegames.com.au (required for App Store submissions)
