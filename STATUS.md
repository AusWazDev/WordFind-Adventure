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
- DEF-21: Fixed bonus word input obstructing grid on iOS — removed autoFocus and bumped font-size to 16px to prevent iOS viewport zoom on the input field.
- DEF-20: Fixed off-theme mystery word (e.g. SINGULARITY in a Sports game). Root cause: category word lists had length gaps — sports had no 11-letter words, so when filler exhausted at K=11 the cross-category fallback fired. Fix: expanded all 14 wordLists to cover every length 4–12 (137 new themed words added). The filler loop's validMysteryLengths check now always finds a matching stop point and findMysteryWord always returns a themed word. Also improves game variety.
- CR-16 & CR-17: HTML mockups created (`CR-16-CR-17 Mockups.html` in workspace) for Waz review — showing collapsible word list (tap-to-toggle, auto-expand on victory) and responsive full-width grid sizing vs landscape nudge banner. Awaiting Waz sign-off before implementation.

### 2026-04-01 (Windows — CR-16, CR-17 implemented)
- CR-16: Collapsible word list — word list now collapsed by default during play, showing a slim toggle bar ("Words to Find · 3/8 ▾"). Tap to expand/collapse. Progress pill turns primary colour when all words found. Auto-expands when bonus word hunt starts and on non-bonus victory. Collapse wrapper is entirely in `Game.jsx` portrait layout — landscape sidebar and all three word list components (Standard/Audio, Anagram, Association) unchanged. Easy to roll back.
- CR-17: Responsive grid sizing — board `maxHeight` increases from `min(55dvh, 100vw)` to `min(75dvh, 100vw)` when word list is collapsed (the default). Board measurement re-fires on toggle so grid grows/shrinks smoothly. When expanded, board reverts to 55dvh cap. Landscape layout unchanged.

### 2026-04-05 (Windows — CR-23: PWA service worker + offline audio)
- CR-23: Installed `vite-plugin-pwa`. Workbox service worker precaches app shell and applies `CacheFirst` runtime caching to all `/audio/*.mp3` requests. Any MP3 fetched on WiFi is permanently cached on-device (1-year TTL). Combined with `preloadGameAudio()`, opening one Audio Challenge game on WiFi makes all that game's voices available offline. App itself also loads fully offline (precached shell). PWA manifest added. Commit `78858ab`.
- App is now fully offline-capable including natural ElevenLabs voices — core requirement met.

### 2026-04-06 (Windows — DEF-27: Mystery Word orphaned random-letter cells)
- DEF-27: Some Mystery Word games had grid cells that were neither part of any found word nor highlighted amber as mystery word cells. Root cause: the DEF-24 padding fallback filled cells with random letters to bridge K to a valid mystery length. These cells appeared as unexplained leftover letters. If K dropped below the minimum valid mystery length, `targetK`=0 caused ALL remaining cells to fill with random letters and the mystery word phase never activated.
- Fix: replaced the padding fallback with an undo mechanism in the filler loop. Before each filler word placement, a grid snapshot is saved. If the placement reduces K below `minValidLength`, the snapshot is restored (the new cells are cleared back to empty) and that filler word is skipped. This prevents K from ever dropping below the smallest valid mystery word length. The random-letter padding fallback is removed entirely.

### 2026-04-05 (Windows — DEF-26: audio delay fix)
- DEF-26: Significant delay before audio played on each tap. Root cause: `fetchBuffer()` was fetching and decoding the MP3 from Vercel on every tap — no caching. Fix: added `_bufferCache` Map in `voiceUtils.jsx`; decoded `AudioBuffer` objects are reused across plays. Added `preloadGameAudio()` which background-fetches all word, sentence, and phrase MP3s for the current game immediately after `generateGame()` in audio mode. First plays are now instant. Commit `ef2543f`.

### 2026-04-05 (Windows — DEF-25: Settings test voice + completion audio overlap)
- DEF-25: Settings "Test Voice" was still calling `speakText()` (Web Speech API) — replaced with `speakPhraseAndWord('great_you_found', 'RAIN', ...)` so test button plays Hannah/Neil via ElevenLabs.
- DEF-25: When last word found, `speakPhraseAndWord('great_you_found')` and `speakFixedPhrase('all_words_found')` were both scheduling audio simultaneously → inaudible celebration. Fixed by consolidating last-word audio logic: bonus hunt → only `all_words_found`; non-bonus → new `game_complete` phrase.
- DEF-25: Non-bonus game completions had no celebration audio — added new `game_complete` phrase "Incredible! You found all the words!" to `generate-audio.mjs`; 2 new MP3s generated and deployed. Commit `38cbbbf`.

### 2026-04-05 (Windows — CR-22: Sentence MP3s, Web Audio API gapless playback, Vercel deploy)
- Root cause of robotic voices identified: all Audio Challenge words have `hasSentence() = true` → `speakSentenceAudio` path always taken → only Web Speech API was ever reached (ElevenLabs word MP3s were unreachable). Fix: generate sentence MP3s as single seamless files and add `speakSentenceAudio()` to play them.
- `scripts/generate-audio.mjs` extended with Phase 3 — parses `trickySentences.jsx` for all WORD → sentence pairs, generates `public/audio/sentences/{gender}_{WORD}.mp3` with full text "word... sentence... word." as one continuous recording. 313 sentences × 2 genders = 626 files generated (zero errors).
- Voices confirmed: Hannah (`M7ya1YbaeFaPXljg9BpK`) female AU, Neil (`iIg0uI51lssRFauz7W21`) male AU.
- `voiceUtils.jsx` rewritten to use Web Audio API (`AudioContext`) for gapless playback. `fetchBuffer()` decodes MP3s, `scheduleBuffers()` places clips at sample-accurate start times, `playSeamless()` fetches all files in parallel then schedules them back-to-back with zero gap. `speakWordAudio()` plays word twice with intentional 400ms gap. `speakSentenceAudio()` plays single-file sentence recording. `speakPhraseAndWord()` / `speakFixedPhrase()` use gapless scheduling. `unlockAudio()` now initialises/resumes `AudioContext` on first user gesture (iOS requirement).
- `WordList.jsx` import updated to include `speakSentenceAudio`; sentence path uses `speakSentenceAudio()`; non-sentence path uses `speakWordAudio()`.
- Vercel build cache issue resolved — `vercel --prod --force` still served old bundle; fix: push to GitHub and let git-based auto-deploy trigger a clean build.
- All code committed `922ac7e` + `7de9b53` + `a4bd127`, Vercel auto-deploy triggered.
- Total audio library: 1,714 word MP3s × 2 genders + 6 phrase MP3s + 626 sentence MP3s = 4,060 files.

### 2026-04-04 (Windows — CR-22: Pre-generated ElevenLabs audio)
- `scripts/generate-audio.mjs` created — Node.js batch script to call ElevenLabs API (Rachel female / Adam male, `eleven_turbo_v2_5`) and generate `public/audio/{female|male}/{WORD}.mp3` for every word in `gameUtils.jsx` plus `public/audio/phrases/{gender}_{key}.mp3` for three fixed in-game phrases. Reads words via regex on `gameUtils.jsx` (auto-picks up new words on re-run). Concurrency 2, 250ms delay. Skips existing files — fully resumable. Dry-run mode with `--dry-run`.
- `voiceUtils.jsx` — added `playAudioFile()`, `speakWordAudio()`, `speakPhraseAndWord()`, `speakFixedPhrase()`. All fall back to Web Speech API if the MP3 is missing or playback fails.
- `WordList.jsx` — non-sentence word playback now uses `speakWordAudio()` (MP3 twice, fallback to Web Speech). Tricky-word sentence path unchanged on `speakText`.
- `Game.jsx` — three `speakText` calls replaced: "Great! You found [word]" → `speakPhraseAndWord('great_you_found', ...)`, "Incredible! All words found!" → `speakFixedPhrase('all_words_found', ...)`, "Amazing! The hidden word was [word]" → `speakPhraseAndWord('hidden_word_was', ...)`.
- **Next step**: run `ELEVENLABS_API_KEY=sk_... node scripts/generate-audio.mjs` to generate the MP3 library before pushing. Commit hash TBD.

### 2026-04-04 (Windows — DEF-24: Mystery Word mode sporadically missing mystery word)
- Root cause confirmed: category-restricted filler pool (40–65 words) too small for Expert/Master grids (15×15, 20–25 main words removed). Pool exhausts before K drops to a valid mystery length → `findMysteryWord` returns null → mystery phase never activates. Random category unaffected (~700-word pool).
- Fix part 1: expanded all 14 `wordLists` categories from 40–65 to 86–112 words (~487 new themed words). Filler pool now large enough for Expert/Master on all categories.
- Fix part 2: added padding fallback in `generateGame()` after filler loop — if K is still not a valid mystery length after filler exhausts, random letters fill cells (reading order) until K reaches the nearest valid length. Insurance for any remaining edge cases.

### 2026-04-03 (Windows — CR-21 follow-up: Home header icon + WelcomeScreen centering)
- CR-21 follow-up: Replaced `Volume2` placeholder icon with `icon.png` in `Home.jsx` header (40px, iOS border-radius). Removed unused `Volume2` import from `Home.jsx`. Fixed `WelcomeScreen.jsx` icon centering — Tailwind Preflight sets `img { display: block }` so `text-center` had no effect; added `mx-auto` to explicitly centre the icon above the app name.

### 2026-04-03 (Windows — DEF-23, CR-21: Hints exploit fix + brand alignment)
- DEF-23: Fixed Settings reset exploiting free hints. `handleResetData` in `Settings.jsx` now preserves `hints_remaining` and `ads_removed` across reset. Uses selective key removal instead of `localStorage.clear()`.
- CR-21: WelcomeScreen and HowToPlayModal aligned to dark brand theme. Background → deep dark near-black. Volume2 icon → `icon.png` (72px). "Find" text → violet-400. Audio Challenge card and HowToPlay featured header → teal/indigo gradient.

### 2026-04-03 (Windows — DEF-22: Splash screen flash fix)
- DEF-22: Splash screen was flashing the Home page for ~400ms before covering it. Fixed by splitting `SplashScreen.jsx` into two motion elements — outer overlay immediately opaque (`opacity: 1`), inner content fades in smoothly. Home is now fully blocked from the first frame.

### 2026-04-03 (Windows — CR-18, CR-19, CR-20: Icon & Splash Screen)
- CR-18: App icon designed — interactive HTML5 Canvas mockup built (`docs/icon/icon-mockup.html`). Concept D: diagonal split, 7×7 word grid top-right fading to diagonal with SOUND+FIND spelled in teal cells, rounded iOS-style teal speaker top-left with gold accent waves. Final 1024px PNG exported (`docs/icon/soundfind-icon-d.png`). Locked settings: grid opacity 38%, grid fade 60%, wave reach 72%, wave start gap 10%, speaker size 20%, length 150%, bottom bleed 40%, top bleed 47%, position x=15% y=15%.
- CR-19: Splash screen designed — interactive HTML5 Canvas mockup built (`docs/icon/splash-mockup.html`). Deep dark near-black background, icon centred at 40%, "SoundFind" name, tagline "Find the words. Feel the sound.", animated Preview button. Locked settings approved by Waz: icon 40%, vertical 40%, name gap 10%, deep dark bg, grid overlay 10%, hold 2000ms (total 2.7s).
- CR-20: Splash screen implemented — `src/components/game/SplashScreen.jsx` created from CR-19 approved design. Framer Motion sequence: fade in 400ms → hold 2000ms → fade out 300ms → Home. Wired into `App.jsx` via `showSplash` state. `public/icon.png` added (1024px master). `index.html` favicon updated from emoji to `icon.png`.

### 2026-04-06 (Windows — CR-25: Full codebase audit + cleanup)
- Full codebase audit performed. 9 issues identified and fixed.
- Dead imports removed: `speakText` (WordList, Game), `useMemo` named import (Stats), `diagnoseVoices` export (voiceUtils), `Toaster` (Game, DailyChallenge)
- Duplicate `<Toaster />` consolidated: App.jsx now mounts the single global sonner Toaster with `position="top-center" richColors`. Game.jsx and DailyChallenge.jsx no longer mount their own.
- `WordList.jsx` localStorage read replaced with `getLocalSettings()` — ensures DEFAULT_SETTINGS merge so `audio_voice` is always defined
- Shared constants extracted to `src/lib/constants.js`: `LEVEL_NAMES`, `CATEGORIES`, `CATEGORY_LABELS`. Removed duplicate declarations from GameHeader, VictoryModal, Settings.
- `best_streak` bug fixed: DailyChallenge `triggerVictory` now computes `newStreak` before `updateProgress` and passes `best_streak: Math.max(current, newStreak)` — Stats page "Longest Streak" now increments correctly.
- Hint timer leak fixed: `hintTimerRef` added to Game.jsx; each hint call now cancels the previous 4s timeout before starting a new one.
- DailyChallenge score penalty aligned: lightbulb hints now apply 0.75× penalty (added `hintedWords` state + ref; `handleUseHint` marks the hinted word; `handleWordFound` applies the multiplier).
- Stale "AUTO-GENERATED" comment in `pages.config.js` replaced with accurate description.
- 45 unused shadcn UI files deleted from `src/components/ui/`. CSS bundle: 97 kB → 58 kB (−40%).
- Build confirmed clean.

### 2026-04-06 (Windows — CR-24: Word Association clue update)
- CR-24: Added ~450 new `wordClues` entries to `gameUtils.jsx` covering every word added in DEF-20 and DEF-24 category expansions across all 13 categories. Word Association mode was showing `A ${n}-letter word` for all newly expanded words. All entries now have descriptive clues matching the style of existing ones. Build clean, deployed.

### 2026-04-08 (Windows — DEF-28, DEF-29, CR-28: hint UX + wordClues + Welcome redesign)
- DEF-28: Hint flash is now persistent until the hinted word is found. `hintWord` guard added to `handleUseHint` and `handleHintCell` to block re-entry. `hintWordRef` synced via `useEffect`. `handleWordFound` clears hint state when hinted word is found. Bonus-hunt hint retains 4s timer.
- DEF-28 visual: Hint buttons (GameHeader + WordList lightbulbs) now visually dim to 40% opacity with `cursor-not-allowed` when a hint is active. `hintActive={!!hintWord}` passed from Game.jsx to GameHeader.
- DEF-29: All 38 duplicate keys in `wordClues` fixed. Words in multiple categories now have combined clues. Silent-letter notes merged into primary clues. CACHE clue added (was missing). Root cause: flat object — last key wins silently.
- CR-28: WelcomeScreen redesigned. Removed feature cards/grid. Icon 88px. One-liner pill ("5 game modes · Natural voices · Works offline", no border). Primary button violet→indigo gradient. Secondary "How to Play" teal outline. Removed misleading "progress saved" footer (only saves on game completion).
- Note: mid-game state is NOT saved — progress (stats/hints) saves on victory only. FE-03 candidate: add mid-game save/restore.

### 2026-04-09 (Windows — DEF-30: Word list collapsed on game start)
- CR-27 set `useState(false)` so word list is expanded by default, but `generateGame` effect still called `setWordListCollapsed(true)` on every new game — overriding the intent. Fixed in `Game.jsx` line 162: `true` → `false`.

### 2026-04-08 (Windows — CR-30: Audit fixes)
- Full codebase audit performed. Removed 5 unused imports across 4 files. Deleted dead file `src/lib/app-params.js` (Base44 leftover). Replaced `alert()` IAP stubs with `toast.info()` in HintModal + RemoveAdsModal. Added iOS PWA meta tags to index.html. Updated Traceability.md date.
- Privacy Policy deferred — will be built once at launch, hosted on `uniquegames.com.au/SoundFind/privacypolicy/` (pending ABN/domain activation).
- App Store blockers (Capacitor, RevenueCat, AdMob) remain Phase 5.

### 2026-04-08 (Windows — CR-29: HowToPlay modal redesign)
- Modal now responsive: width scales `max-w-sm` → `sm:max-w-md` → `md:max-w-lg`; height uses `flex flex-col max-h-[90dvh]` so modal shrinks to content and only scrolls when needed.
- Scrollbar hidden via `.no-scrollbar` CSS utility in `src/index.css` — eliminates scrollbar flash on slide transitions.
- Header and nav button fixed to consistent violet→indigo gradient on all slides.
- All body text standardised to `text-sm`; content trimmed ~35%.
- Game mode list order on slide 3 now matches home screen menu order.
- FE-04 added to `docs/Future Enhancements.md`: Global Leaderboard (requires backend, deferred to Phase 5+).

### 2026-04-08 (Windows — CR-27: Word list expanded by default)
- Reverted CR-16's collapsed-by-default to expanded-by-default (`useState(false)`). Collapsed state wasn't discoverable on mobile — players didn't see the word list. Player can still collapse manually. FE-02 logged for smarter UX in a future version.

### 2026-04-08 (Windows — CR-26: Mode reorder + Mystery Word difficulty cap)
- Word Association moved above Anagram Hunt in `GameModeSelector.jsx`.
- `LevelSelector.jsx`: Mystery Word + specific (non-Random) category now shows only Easy/Medium/Hard — Expert and Master hidden. Root cause: category-restricted filler pools can't reliably fill a 15×15 grid down to a valid mystery word length. Tracked as FE-01 in `docs/Future Enhancements.md` for a future version.
- `Home.jsx`: passes `selectedMode` + `selectedCategory` to `LevelSelector`.
- DEF-27 follow-up: removed `emptyAfter > 0` guard in filler undo — undo now also fires when a filler word fills all remaining empty cells (emptyAfter === 0).
- Duplicate `SALMON` key removed from `wordClues` (colours entry deleted; food entry retained).
- `docs/Future Enhancements.md` created.

## Next Steps (Priority Order)
- [x] CR-16: Collapsible word list ✅
- [x] CR-17: Responsive grid sizing ✅
- [x] CR-22: Pre-generated ElevenLabs audio ✅ — Hannah (AU female) + Neil (AU male), 4,062 MP3 files generated + deployed
- [x] CR-23: PWA service worker ✅ — offline audio via CacheFirst runtime caching; app shell precached
- [ ] **Beta testing in progress** — monitor Google Form responses, log defects via Change Register
- [ ] Review beta defects and fix — prioritise Critical/High severity
- [ ] Wire up RevenueCat SDK (IAP + remove-ads) — Phase 5 with Capacitor
- [ ] Wire up real AdMob (replace Unsplash placeholder) — Phase 5 with Capacitor
- [x] App icon design — CR-18 ✅
- [x] Splash screen — CR-19/CR-20 ✅
- [ ] PWA manifest + service worker (vite-plugin-pwa)
- [ ] Capacitor setup for iOS/Android native builds
- [ ] Analytics: PostHog + Sentry integration (before public launch)
- [ ] Privacy Policy — host at `uniquegames.com.au/SoundFind/privacypolicy/` once domain is live (pending ABN). Build once alongside Capacitor/store submission prep — do not build early. Content: no personal data collected, game progress stored locally only, no analytics currently (update when PostHog/AdMob added in Phase 5).