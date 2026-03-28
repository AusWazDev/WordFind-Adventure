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

---

## How to Raise a Change Request

1. Describe the change — what, why, which files are affected
2. Await approval before any code changes are made
3. Upon completion, record the CR here with commit hash and date

## How to Raise a Defect

1. Describe the defect — steps to reproduce, expected vs actual behaviour, mode/category/level if relevant
2. A fix will be scoped and may be raised as a CR if significant, or applied directly if minor
3. Record the fix here with commit hash and date

---

---

## Pending Changes (Awaiting Approval)

| CR # | Title | Raised | Status |
|------|-------|--------|--------|

---

*Last updated: 28 March 2026*
