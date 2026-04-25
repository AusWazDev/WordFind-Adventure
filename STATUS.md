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

### 2026-04-25 (Windows — CR-03 completion, code audit)
- Pre-Electron build code audit identified that CR-03 (Lightbulb hint for all non-audio modes) was incompletely implemented — Anagram Hunt and Word Association were missing the Lightbulb button entirely
- Fix: added `onHintCell` + `hintsRemaining` props to `AnagramWordList` and `AssociationWordList` via `WordListSwitch` in `Game.jsx`; added Lightbulb button to each component following the `WordList.jsx` pattern
- All 4 non-audio modes (Standard, Mystery Word, Anagram Hunt, Word Association) now have the Lightbulb hint — CR-03 fully complete
- Commit `7b5bcb9` — lint clean, build passing
- DEF-41: Removed RED and TAN from colours word list — both are 3 letters, below the 4-letter minimum required for Master difficulty grid placement. Commit `da4224e`.

## Next Steps (Priority Order)
- [ ] **Beta testing in progress** — monitor Google Form responses, log defects via Change Register
- [ ] Review beta defects and fix — prioritise Critical/High severity
- [ ] Wire up RevenueCat SDK (IAP + remove-ads) — Phase 5 with Capacitor
- [ ] Wire up real AdMob (replace Unsplash placeholder) — Phase 5 with Capacitor
- [ ] App icon design (1024×1024 master)
- [ ] PWA manifest + service worker (vite-plugin-pwa)
- [ ] Capacitor setup for iOS/Android native builds
- [ ] Analytics: PostHog + Sentry integration (before public launch)
- [ ] Privacy Policy page on uniquegames.com.au (required for App Store submissions)