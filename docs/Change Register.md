# SoundFind — Change Register

**Project:** SoundFind
**Repo:** github.com/AusWazDev/WordFind-Adventure
**Baseline commit:** `129f64f` — *CR-07 to CR-10: dead code cleanup, offline fixes, How to Play update, 12 free hints*
**Baseline date:** 27 March 2026

All future changes must be raised as a Change Request, approved before implementation, and recorded here upon completion.

---

## Change Request Log

| CR # | Title | Status | Commit | Date |
|------|-------|--------|--------|------|
| CR-01 | Remove Spelling Bee mode entirely | ✅ Completed | `a80a6ae` | Mar 2026 |
| CR-02 | Promote Mystery Word to secondary hero card; reorder remaining tiles | ✅ Completed | `a80a6ae` | Mar 2026 |
| CR-03 | Add Lightbulb hint button to all non-audio word list modes (−25% penalty) | ✅ Completed | `a80a6ae` | Mar 2026 |
| CR-04 | Expand Word Association clues from ~50 to ~800 entries (all categories + tricky audio words) | ✅ Completed | `a80a6ae` | Mar 2026 |
| CR-05 | Restrict Mystery Word filler pool to active category only | ✅ Completed | `a80a6ae` | Mar 2026 |
| CR-06 | Full-grid Mystery Word coverage — all remaining empty cells form the mystery word | ✅ Completed | `a80a6ae` | Mar 2026 |
| CR-07 | Remove dead `spelling: 'Spelling Bee'` entry from `GameHeader.jsx` modeLabels | ✅ Completed | `129f64f` | Mar 2026 |
| CR-08 | Remove stale `REQUIRES_ONLINE` gate for Word Association (works fully offline after CR-04) | ✅ Completed | `129f64f` | Mar 2026 |
| CR-09 | Update `HowToPlayModal` — Mystery Word added, Spelling Bee removed, clue description fixed, hint penalties documented | ✅ Completed | `129f64f` | Mar 2026 |
| CR-10 | Offline monetisation — 12 free hints on first launch; interstitial ad skipped offline; HintModal buttons greyed out offline | ✅ Completed | `129f64f` | Mar 2026 |
| CR-11 | Remove dead code in `gameUtils.jsx` — `pickCategoryBonusWord`, `tryPlaceWordDenseProtected`, `hasEmptyNonProtectedCell` | ✅ Completed | `3aba629` | Mar 2026 |
| CR-12 | Settings page refresh — add Master level, all 23 categories, back button, auto-save indicator, remove Theme stub, rename Delete Account → Reset Game Data | ✅ Completed | `3aba629` | Mar 2026 |
| CR-13 | Daily Challenge overhaul — fixed viewport layout matching Game.jsx, orientation support, board sizing, remove SpellingBeeWordList, add mystery_word support, fix hintCell→hintCells, fix hints hardcoded to 3; replace 2 spelling templates in DailyChallengeUtils; fix MODE_LABELS in DailyChallengeCard | ✅ Completed | `7470c5c` | Mar 2026 |
| CR-14 | Delete orphaned `SpellingBeeWordList.jsx` — no longer imported anywhere after CR-13 | ✅ Completed | `3561220` | Mar 2026 |
| CR-15 | Reduce interstitial ad frequency — change trigger from every 3 game **starts** to every 6 **completed** games. `AD_FREQUENCY` changed to 6 in `Home.jsx`; `saveProgress` in `Game.jsx` now increments `games_completed_count` in localStorage; `handleSelectLevel` reads `games_completed_count` and `last_ad_completed_at` to determine when to show the ad, avoiding double-triggering at the same threshold. | ✅ Completed | `caa3330` | Mar 2026 |

---

## Defects Log

| DEF # | Description | Status | Fix Commit | Date |
|-------|-------------|--------|------------|------|
| DEF-01 | Word list displayed words in lowercase | ✅ Fixed | `a80a6ae` | Mar 2026 |
| DEF-02 | Words 100% formed from already-placed letters incorrectly included in word list | ✅ Fixed | `a80a6ae` | Mar 2026 |
| DEF-03 | "Homophone" label showing under RAIN in non-audio Mystery Word mode | ✅ Fixed | `ef74286` | Mar 2026 |
| DEF-04 | Category name truncated in compact header ("Mystery Word ·...") | ✅ Fixed | `ef74286` | Mar 2026 |
| DEF-05 | Non-category words appearing in themed Mystery Word filler (e.g. RUIN/SAD in Food game) | ✅ Fixed | `a80a6ae` | Mar 2026 |
| DEF-06 | HowToPlay nav buttons appeared permanently hovered/pressed | ✅ Fixed | `129f64f` | Mar 2026 |
| DEF-07 | HowToPlay Other Modes tile titles incorrectly inherited dark mode text colour | ✅ Fixed | `129f64f` | Mar 2026 |
| DEF-08 | Category and Level selector tile titles incorrectly inherited dark mode text colour (same class as DEF-07); icon and title now displayed inline | ✅ Fixed | `6931b72` | Mar 2026 |
| DEF-09 | WelcomeScreen feature grid references removed game mode "Spelling Bee" (🐝) — replaced with Mystery Word (🔍) | ✅ Fixed | `ce06d61` | Mar 2026 |
| DEF-10 | Audio Challenge word list dots (• • • • •) wrapping onto second line in narrow containers — added `whitespace-nowrap` to dot span in `WordList.jsx` | ✅ Fixed | `0be8117` | Mar 2026 |
| DEF-11 | Audio Challenge using robotic Microsoft voice instead of Google US English — `getVoices()` was caching only local (Microsoft) voices on first synchronous call before Chrome's `voiceschanged` fired with full list; removed early-return short-circuit in `voiceUtils.jsx` | ✅ Fixed | `b2ee77f` | Mar 2026 |
| DEF-12 | Audio Challenge voice quality poor on Safari/Mac — investigated on Mac (29 Mar). Safari returns 223 voices synchronously; no enhanced voices installed on test Mac. Scoring algorithm correctly selects Karen (en-AU, score 105). No code fix required — quality limited by macOS installed voices. iOS beta testers will have Karen (Enhanced) pre-installed and will get high-quality audio automatically. | ✅ Closed (no code change) | — | Mar 2026 |
| DEF-17 | Mystery word selected from wrong category — e.g. INTERSTELLAR (space) appearing in a Food game. Filler loop ran past all valid food word lengths, leaving K=11 which matched a space category bonus pair. Fix: pre-compute `validMysteryLengths` from the category word pool; filler loop now stops as soon as empty cell count hits a valid length, ensuring `findMysteryWord` always finds an in-category match. Cross-category fallback retained as true last resort. | ✅ Fixed | `80c20d0` | Mar 2026 |
| DEF-18 | In Mystery Word mode, words from the regular word list could have all their letters already present in other selected words (e.g. IRAN in a Countries game where I, R, A, N all appear elsewhere), making them trivially deducible. The unique-letter preference rule from DEF-16 was applied only to the mystery word selection, not to `pickWords`. Fix: added `preferUniqueLetters` flag to `pickWords`; in Mystery Word mode, words are greedily selected so each contributes at least one letter not already covered by the other selected words. Falls back to any valid word only if all 26 letters are already exhausted. Word pool remains the same themed category pool as Standard mode. | ✅ Fixed | `ea5f433` | Mar 2026 |
| DEF-16 | Mystery word could be selected with all letters already present in regular word list (e.g. PIE when P, I, E all used by other words) — `findMysteryWord` had no preference for words contributing unique letters. Fix: build `placedLetters` set from all placed words; pass to `findMysteryWord` which now prefers candidates containing at least one letter not in that set, falling back to any valid word only if no unique-letter candidate exists at the target length. | ✅ Fixed | `80c20d0` | Mar 2026 |
| DEF-15 | Level selector Medium tile appears permanently hovered — selected state used `shadow-lg shadow-violet-200` which is visually indistinguishable from the hover shadow; replaced with `ring-2 ring-violet-300 ring-offset-1` to give a clear selection indicator distinct from hover. | ✅ Fixed | `860b23a` | Mar 2026 |
| DEF-14 | Highlighting a substring of a longer word incorrectly accepted as finding the shorter word (e.g. highlighting CAKE within PANCAKE's grid positions marked CAKE as found). `checkWord` matched on spelling only — added position guard in `handleWordFound` to compare selected cells against `wordPositions[word]`; rejects match if cells don't align exactly. | ✅ Fixed | `ac1f345` | Mar 2026 |
| DEF-13 | App crashes when clicking Next Level after completing a level — `handleNextLevel` used `window.location.assign()` causing a hard reload to `/Game` which Vercel serves as 404 (no SPA routing configured). Fix: added `vercel.json` with SPA rewrites; replaced `window.location.assign()` with React Router `navigate()`; updated `useEffect` deps to `[level, mode, category]` so game re-initialises on client-side URL change. | ✅ Fixed | `2eb2b4e` | Mar 2026 |
| DEF-19 | Touch scroll and pull-to-refresh conflict with word selection on mobile web. React 17+ registers touch listeners as passive by default, so `e.preventDefault()` in synthetic event handlers (`onTouchStart`, `onTouchMove`) is silently ignored — the browser still scrolls/pull-to-refreshes through the game board during word selection. Fix: added a `useEffect` in `GameBoard.jsx` that attaches direct non-passive DOM listeners (`{ passive: false }`) for `touchstart` and `touchmove` on the grid element, ensuring `preventDefault()` is honoured. Also added `overscrollBehavior: 'none'` to the board container to block pull-to-refresh at the CSS level. | ✅ Fixed | `caa3330` | Mar 2026 |

---

## How to Raise a Change Request

1. Describe the change — what, why, which files are affected
2. Await approval before any code changes are made
3. Upon completion, record the CR here with commit hash and date

## How to Raise a Defect

1. Describe the defect — steps to reproduce, expected vs actual behaviour, mode/category/level if relevant
2. A fix will be scoped and may be raised as a CR if significant, or applied directly if minor
3. Record 