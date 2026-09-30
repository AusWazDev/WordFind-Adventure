# SoundFind — Traceability Map

**Purpose:** When any file is changed, consult this map to identify what else must be reviewed or updated.
The pre-commit hook (`scripts/hooks/pre-commit`) automates these checks at commit time.

*Last updated: 8 April 2026*

---

## How to Use

1. Find the feature area for the file you changed.
2. Review every entry in **"Also check"** — update or verify each one applies.
3. Always update `docs/Change Register.md` (new DEF or CR entry) and `STATUS.md` (session log) for any code commit.

---

## Feature Areas

### 1. Audio Challenge — Voice Selection

| | Files |
|---|---|
| **Primary source** | `src/components/game/voiceUtils.jsx` |
| **Supporting source** | `src/components/game/AudioCategorySelector.jsx`, `src/components/game/trickySentences.jsx` |
| **Related docs** | `docs/Change Register.md`, `docs/Safari Voice Investigation.md`, `STATUS.md` |
| **Beta test cases** | TC-14 (Audio Challenge loads), TC-15 (correct word spoken), TC-16 (skip button), TC-17 (audio mode dots hidden) |
| **Also check when changed** | Does `Safari Voice Investigation.md` still reflect current voice-loading strategy? Does scoring algorithm need updating? |
| **Playback channel (added 30 Sep 2026, CR-63)** | Callers: `WordList.jsx` (speaker tap), `Game.jsx` (found, last word, bonus hunt, bonus word), `Settings.jsx` (Test Voice). `stopAllAudio()` runs on unmount of `Game.jsx`, `DailyChallenge.jsx` and `Settings.jsx`. Tests: `src/components/game/voiceUtils.test.js` |
| **Also check (CR-63)** | Does every NEW public play function call `beginPlay()` first and check `isCurrent(generation)` after every await? Is every source scheduled through `scheduleBuffers` (so it is tracked)? Is `stopAllAudio` still conditional on `_speechActive`, so it never cancels the DEF-38 unlock utterance? Are `unlockAudio()` call sites unchanged? |

---

### 2. Audio Challenge — Word List Display

| | Files |
|---|---|
| **Primary source** | `src/components/game/WordList.jsx` |
| **Supporting source** | `src/components/game/voiceUtils.jsx` (audio state drives dot display) |
| **Related docs** | `docs/Change Register.md`, `STATUS.md` |
| **Beta test cases** | TC-17 (dots don't wrap), TC-18 (word revealed on correct guess) |
| **Also check when changed** | Do dots still render without wrapping? Does word reveal animation still work? Does `AnagramWordList.jsx` or `AssociationWordList.jsx` need the same fix? |

---

### 3. Game Logic — Board & Word Placement

| | Files |
|---|---|
| **Primary source** | `src/components/game/gameUtils.jsx` |
| **Supporting source** | `src/components/game/GameBoard.jsx`, `src/pages/Game.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md`, `README.md` (if game modes change) |
| **Beta test cases** | TC-01 (game loads), TC-02 (words placed correctly), TC-03 (Mystery Word fills grid), TC-08 (category words only in filler) |
| **Also check when changed** | Does Mystery Word full-grid coverage still work? Are category-only filler restrictions intact? Does the hint system still have valid cells to reveal? |

---

### 4. Mystery Word Mode

| | Files |
|---|---|
| **Primary source** | `src/components/game/gameUtils.jsx` (word placement, filler logic) |
| **Supporting source** | `src/components/game/WordList.jsx`, `src/components/game/GameBoard.jsx`, `src/pages/Game.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md`, `src/components/game/HowToPlayModal.jsx` |
| **Beta test cases** | TC-03 (Mystery Word fills grid), TC-04 (Mystery Word revealed on win), TC-08 (no non-category fillers) |
| **Also check when changed** | Is the homophone label still suppressed in non-audio Mystery Word? Is `HowToPlayModal.jsx` description still accurate? |

---

### 5. Word Association Mode

| | Files |
|---|---|
| **Primary source** | `src/components/game/AssociationWordList.jsx` |
| **Supporting source** | `src/components/game/gameUtils.jsx`, `src/pages/Game.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md` |
| **Beta test cases** | TC-09 (association clues show), TC-10 (clue accuracy) |
| **Also check when changed** | Is the offline gate still removed (CR-08)? Are all ~800 clue entries intact? |

---

### 6. Anagram Mode

| | Files |
|---|---|
| **Primary source** | `src/components/game/AnagramWordList.jsx` |
| **Supporting source** | `src/components/game/gameUtils.jsx`, `src/pages/Game.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md` |
| **Beta test cases** | TC-11 (anagram clue shown), TC-12 (anagram correct) |
| **Also check when changed** | Does `WordList.jsx` share any display logic that may need the same fix? |
| **Tests (added 30 Sep 2026, CR-62)** | `src/components/game/AnagramWordList.test.jsx`. Run `npm test` |
| **Also check (CR-62)** | The list stays MOUNTED across Replay, Next Level and the Daily screen's Try Again, and receives new `words`: are scrambles still rebuilt when the word set changes? Can any path still render a plain answer (never fall back to `word`)? `scrambleWord` would recurse forever on a word of one repeated letter (none in the lists as at 30 Sep 2026, measured over 1,357 words). |

---

### 7. Daily Challenge

| | Files |
|---|---|
| **Primary source** | `src/pages/DailyChallenge.jsx`, `src/components/game/DailyChallengeUtils.jsx` |
| **Supporting source** | `src/components/game/DailyChallengeCard.jsx`, `src/components/game/GameBoard.jsx`, `src/components/game/GameHeader.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md` |
| **Beta test cases** | TC-22 (Daily Challenge loads), TC-23 (correct puzzle for date), TC-24 (streak tracked) |
| **Also check when changed** | Do MODE_LABELS still match in `DailyChallengeCard.jsx`? Is orientation support intact? Do hint counts still use `hintCells` (not hardcoded 3)? |
| **Tests (added 30 Sep 2026, CR-61)** | `src/components/game/DailyChallengeUtils.test.js` (dates and rotation, run in `Australia/Melbourne`), `src/pages/DailyChallenge.test.jsx` (the page rendered in jsdom). Run `npm test` |
| **Also check (CR-61)** | Is every date key built with `localDateKey` / `previousLocalDateKey`, never `toISOString()`? Does `triggerVictory` still read progress, score, hints and time through refs? Does `handleWordFound` still check cell positions (DEF-14)? Is the one-hint-at-a-time guard intact, and is its timer cleared on unmount? Does the daily record still carry `category` (read by `Stats.jsx`)? Are the 14 templates unchanged? |

---

### 8. Hint System

| | Files |
|---|---|
| **Primary source** | `src/components/game/HintModal.jsx` |
| **Supporting source** | `src/components/game/gameUtils.jsx`, `src/components/game/offlineStorage.jsx`, `src/pages/Game.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md`, `src/components/game/HowToPlayModal.jsx` |
| **Beta test cases** | TC-05 (hint reveals a cell), TC-06 (hint count decrements), TC-07 (offline hint limit) |
| **Also check when changed** | Does the 12 free hints on first launch (CR-10) still work? Are hint buttons greyed out offline? Is the penalty % shown in `HowToPlayModal.jsx` still correct? |

---

### 9. Settings Page

| | Files |
|---|---|
| **Primary source** | `src/pages/Settings.jsx` |
| **Supporting source** | `src/components/game/ReminderSettings.jsx`, `src/components/game/offlineStorage.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md` |
| **Beta test cases** | TC-25 (settings save), TC-26 (category selection persists), TC-27 (level selection persists) |
| **Also check when changed** | Are all 23 categories present? Is Master level included? Does Reset Game Data preserve `hints_remaining` and `ads_removed` (DEF-23)? Is auto-save indicator working? |
| **Also check (CR-65, 30 Sep 2026)** | Does the reset dialog text still match `handleResetData` (hints and purchases kept)? Do the "Backup Voice" rate and pitch controls still affect only `speakText`? `sound_effects_volume` has no control and no reader; it is stored only. |

---

### 10. Level & Category Selectors

| | Files |
|---|---|
| **Primary source** | `src/components/game/LevelSelector.jsx`, `src/components/game/CategorySelector.jsx` |
| **Supporting source** | `src/components/game/AudioCategorySelector.jsx`, `src/pages/Home.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md` |
| **Beta test cases** | TC-25 (settings save), TC-26 (category selection persists), TC-27 (level selection persists) |
| **Also check when changed** | Does the selected state look clearly different from hover? (DEF-15) Are all 5 levels shown? Are all 23 categories present in CategorySelector? Does dark mode text render correctly? (DEF-08) |
| **Also check (CR-65, 30 Sep 2026)** | Do `LevelSelector`'s word counts still equal `levelConfig`'s `wordCount` (6 / 10 / 15 / 20 / 25)? |

---

### 11. Welcome Screen & Mode Selector

| | Files |
|---|---|
| **Primary source** | `src/components/game/WelcomeScreen.jsx`, `src/components/game/GameModeSelector.jsx` |
| **Supporting source** | `src/pages/Home.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md`, `README.md` |
| **Beta test cases** | TC-01 (welcome screen loads), TC-13 (all 5 modes accessible) |
| **Also check when changed** | Does `README.md` still list the correct game modes? Is the feature grid (WelcomeScreen) still referencing correct modes? No Spelling Bee references remain? Does `icon.png` exist in `public/` (CR-21)? Is the background dark near-black, "Find" violet, and icon centred with `mx-auto`? |

---

### 11. How to Play Modal

| | Files |
|---|---|
| **Primary source** | `src/components/game/HowToPlayModal.jsx` |
| **Supporting source** | `src/pages/Game.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md` |
| **Beta test cases** | TC-28 (How to Play opens), TC-29 (content accurate) |
| **Also check when changed** | Are all 5 current modes documented? Are hint penalties accurate? Is Mystery Word description current? Are nav buttons rendering correctly (not stuck hover state — DEF-06)? Is Audio Challenge header teal/indigo (not amber — CR-21)? |

---

### 12. Offline Support & Storage

| | Files |
|---|---|
| **Primary source** | `src/components/game/offlineStorage.jsx`, `src/hooks/useOnlineStatus.js` |
| **Supporting source** | `src/components/game/HintModal.jsx`, `src/components/game/AdModal.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md` |
| **Beta test cases** | TC-07 (offline hint limit), TC-19 (game loads offline), TC-20 (progress saved offline) |
| **Also check when changed** | Does the CR-08 offline gate removal for Word Association remain intact? Does the interstitial ad still skip when offline (CR-10)? |

---

### 13. Ads & Monetisation

| | Files |
|---|---|
| **Primary source** | `src/components/game/AdModal.jsx`, `src/components/game/RemoveAdsModal.jsx` |
| **Supporting source** | `src/components/game/offlineStorage.jsx`, `src/pages/Game.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md` |
| **Beta test cases** | TC-21 (ad shown at correct intervals), TC-21b (ad skipped offline) |
| **Also check when changed** | Does ad skip logic still fire when offline? Does Remove Ads modal still gate correctly? |
| **Native ads (added 30 Sep 2026, CR-60)** | `src/lib/admob.js` was missing from this section. It holds `CHILD_DIRECTED_CONFIG` (decision S1) and the UMP call. Callers: `src/App.jsx` (`initAdMob`), `src/pages/Home.jsx` (`showInterstitial`), `src/components/game/HintModal.jsx` (`showRewarded`) |
| **Tests** | `src/lib/admob.test.js` (plugin mocked). Run `npm test` |
| **Also check (CR-60)** | Are all three child-directed flags still `true` in `initialize`? Does every ad request, including any new format, carry `npa: true`? Is `requestConsentInfo` still before `initialize` with TFUA true? Is `showConsentForm`, `showPrivacyOptionsForm` or `requestTrackingAuthorization` still never called? On a plugin upgrade, see held item K7 (`ageRestrictedTreatment`) |
| **Also check (CR-60 amendment g, 30 Sep 2026)** | ⚠️ *"all three child-directed flags still `true` in `initialize`"* above is superseded. `initialize` carries TFCD `true` and rating `General` only; TFUA must be **absent** there and present only on `requestConsentInfo`. Google: TFCD and TFUA "shouldn't both simultaneously be set to true" |
| **Windows and web (added 30 Sep 2026, CR-64)** | ⚠️ `AdModal.jsx` in *Primary source* above was **deleted** in CR-64 (the row is kept as written). On `!isNative()` there are no ads and no purchases: `HintModal.jsx` shows only the daily free refill (`src/lib/freeHintRefill.js`, key `sf_free_hint_refill_at`), and `Home.jsx` skips the ad step. Tests: `src/lib/freeHintRefill.test.js`, `src/components/game/HintModal.test.jsx` |
| **Also check (CR-64)** | Is the native branch of `HintModal` (Watch an Ad, Buy Hint Pack) still unchanged? Does any `!isNative()` path offer an ad, a purchase or Remove Ads, or load a third-party image? Is the refill still 3 hints per 24 hours under its own key? |

---

### 14. App Shell & Routing

| | Files |
|---|---|
| **Primary source** | `src/App.jsx`, `src/main.jsx`, `src/pages/Game.jsx`, `src/pages/Home.jsx` |
| **Supporting source** | `src/Layout.jsx`, `src/lib/AuthContext.jsx`, `src/pages.config.js` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md`, `README.md` |
| **Beta test cases** | TC-01 (app loads), TC-13 (navigation works) |
| **Also check when changed** | Does `README.md` still accurately describe the tech stack? Is Vercel deployment config (`vite.config.js`, `package.json`, `vercel.json`) still consistent? |
| **Also check (CR-66, 30 Sep 2026)** | The bottom nav is Home, Stats, Settings (decision S3): does a new page need a tab, and does `TAB_ROOTS` match `NAV_ITEMS`? Does an unknown hash still reach `PageNotFound`, and does it still use `navigate`, not a reload (CR-34)? Tests: `src/leaderboardRoute.test.jsx`. Every mode-label map uses the long set (decision S2); tests: `src/components/game/modeLabels.test.jsx`. |

---

### 17. Splash Screen

| | Files |
|---|---|
| **Primary source** | `src/components/game/SplashScreen.jsx` |
| **Supporting source** | `src/App.jsx` (`showSplash` state), `public/icon.png` |
| **Related docs** | `docs/Change Register.md` (CR-19, CR-20), `docs/icon/splash-mockup.html`, `STATUS.md` |
| **Beta test cases** | TC-01 (splash shows on load, fades to Home after ~2.7s) |
| **Also check when changed** | Does the icon still load from `public/icon.png`? Does `onComplete` correctly unmount the splash and reveal Home? Does the animation feel right on both mobile and desktop? |

---

### 16. Vercel Deployment Config

| | Files |
|---|---|
| **Primary source** | `vercel.json` |
| **Supporting source** | `vite.config.js`, `package.json` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md` |
| **Beta test cases** | TC-01 (app loads on Vercel URL), TC-13 (direct URL navigation works) |
| **Also check when changed** | Do all React Router routes still resolve after a hard reload? Does Next Level still work after navigating directly to `/Game`? |

---

### 15. Game Header & Layout

| | Files |
|---|---|
| **Primary source** | `src/components/game/GameHeader.jsx` |
| **Supporting source** | `src/pages/Game.jsx`, `src/pages/DailyChallenge.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md` |
| **Beta test cases** | TC-01 (header renders), TC-04 (category name not truncated — DEF-04) |
| **Also check when changed** | Is `modeLabels` still free of removed mode entries (CR-07)? Is the category name display still untruncated? |

---

### 19. Windows (Electron) Build

*Added 30 Sep 2026 (CR-64).*

| | Files |
|---|---|
| **Primary source** | `electron/main.cjs` (window, `app://` protocol, link and navigation guards, menu, single-instance lock), `package.json` `build` block (`files` excludes `node_modules`) |
| **Supporting source** | `scripts/patch-appx-assets.mjs` (branded tiles), `electron/appx-assets/`, `vite.config.js` (`--mode electron`) |
| **Related docs** | `docs/Store Submission Checklist.md`, `docs/Change Register.md`, `STATUS.md` |
| **Also check when changed** | Does the main process still require only Electron built-ins? A new `require` of a package would fail at launch now that `node_modules` is excluded, and it shows only as an "Error" dialog, never on stderr. Do external links still open in the system browser (`setWindowOpenHandler`, `will-navigate`)? Run the full smoke test in `docs/Store Submission Checklist.md` §3 on the packaged build, not just a launch |

---

### 18. Error Monitoring (Sentry)

*Added 30 Sep 2026 (CR-59).*

| | Files |
|---|---|
| **Primary source** | `src/lib/sentryConfig.js` (all `Sentry.init` options), `src/main.jsx` (calls it) |
| **Supporting source** | `src/lib/admob.js`, `src/lib/purchases.js`, `src/components/game/HintModal.jsx`, `src/components/game/RemoveAdsModal.jsx` (CR-58 capture calls) |
| **Tests** | `src/lib/sentryConfig.test.js`, `src/lib/sentryConfig.e2e.test.js` (real SDK, capturing transport). Run `npm test` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md`; uniquegames-site SoundFind privacy policy (Sentry section) |
| **Also check when changed** | Does `npm test` still pass? Is `tracesSampleRate` still OMITTED (0 counts as enabled)? Does any new breadcrumb, header or context carry a route query or device detail? Does the privacy policy still describe what Sentry receives? |

---

## Cross-Cutting Rules

These apply to **every** code commit, regardless of feature area:

| Rule | Action |
|------|--------|
| Any `src/` file changed | Add entry to `docs/Change Register.md` (DEF or CR) |
| Any `src/` file changed | Update `STATUS.md` session log |
| New source file added | Add it to this `docs/Traceability.md` map |
| Game mode added or removed | Update `README.md`, `WelcomeScreen.jsx`, `HowToPlayModal.jsx`, beta test sheet |
| Live URL changes | Update `README.md`, `docs/Beta Tester Invite Message.md`, `docs/Launch Plan.md` |
| Voice loading logic changes | Update `docs/Safari Voice Investigation.md` to reflect current strategy |

---

## Document Ownership

| Document | Updated when… |
|----------|---------------|
| `docs/Change Register.md` | Every code commit (new DEF or CR row) |
| `STATUS.md` | Every code commit (session log entry) |
| `README.md` | Game modes change · Tech stack changes · Live URL changes |
| `docs/Launch Plan.md` | Phase milestones completed · Beta test status changes |
| `docs/Beta Tester Invite Message.md` | App URL changes · Form URL changes · Deadline set |
| `docs/Safari Voice Investigation.md` | `voiceUtils.jsx` voice-loading strategy changes |
| `docs/Traceability.md` | New source files added · New features · New docs added |
