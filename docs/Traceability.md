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
| **Related docs** | `docs/Change Register.md`, `STATUS.md`, `src/pages/Tutorial.jsx` (was `HowToPlayModal.jsx`, deleted in SF-64) |
| **Beta test cases** | TC-03 (Mystery Word fills grid), TC-04 (Mystery Word revealed on win), TC-08 (no non-category fillers) |
| **Also check when changed** | Is the homophone label still suppressed in non-audio Mystery Word? Is the tutorial's finish-screen description (`Tutorial.jsx` `MODE_LINES`) still accurate? |

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
| **Related docs** | `docs/Change Register.md`, `STATUS.md`, `src/pages/Tutorial.jsx` (was `HowToPlayModal.jsx`, deleted in SF-64) |
| **Beta test cases** | TC-05 (hint reveals a cell), TC-06 (hint count decrements), TC-07 (offline hint limit) |
| **Also check when changed** | Does the 12 free hints on first launch (CR-10) still work? Are hint buttons greyed out offline? Is the penalty % shown in the tutorial's Hints box (`Tutorial.jsx`) still correct? |

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

### 11. How to Play Modal (retired 13 Oct 2026, SF-64; replaced by the guided first game, `src/pages/Tutorial.jsx`)

| | Files |
|---|---|
| **Primary source** | `src/pages/Tutorial.jsx` (finish screen: the five modes and the Hints box). *Was `src/components/game/HowToPlayModal.jsx`, deleted in SF-64.* |
| **Supporting source** | `src/pages/Game.jsx` |
| **Related docs** | `docs/Change Register.md`, `STATUS.md` |
| **Beta test cases** | TC-28 (How to Play opens; now the tutorial in replay mode), TC-29 (content accurate) |
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
| **Offline audio cache (CR-68, 30 Sep 2026)** | `vite.config.js` (`runtimeCaching`), `src/lib/audioCacheRoute.js`. **Also check:** does `audioCacheMatch` still match a full same-origin `/audio/…mp3` URL (Workbox tests RegExps against `url.href`, so never go back to an anchored path RegExp)? Is it still self-contained (it is serialised into `sw.js`)? Is the cache name still `soundfind-audio-v1`, with the same expiry? Test: `src/lib/audioCacheRoute.test.js`. Asset and audio paths are root-absolute, which matters only under a sub-path host (itch.io, deferred by S8). |
| **Native builds exclude the service worker (CR-70, 1 Oct 2026)** | `package.json` (`build:ios`, `build:android`), `vite.config.js` (`isCapacitor`). **Also check:** do both native scripts still use `--mode capacitor`, and does capacitor mode still skip `VitePWA`? A native bundle with `sw.js` breaks audio under `capacitor://` (CR-53, CR-55). Test: `src/buildModes.test.js`. Build iOS and Android only with `build:ios` / `build:android`, never plain `npm run build`. |
| **Android purchases with no RevenueCat key (CR-72, 1 Oct 2026)** | `src/lib/purchases.js` (`API_KEYS.android`, `initPurchases`), `HintModal.jsx`, `RemoveAdsModal.jsx`, `Settings.jsx` (Restore). **Also check:** when the Android key is added or the purchase paths change, does `src/lib/androidNoRevenueCatKey.test.jsx` still describe the behaviour, and does every purchase point still end without a hang? |
| **Store prices only (CR-74, FB-1, 1 Oct 2026)** | `src/lib/purchases.js` (`usePrice`, `useLowestPrice`, `subscribePrices`, `getPrice`), `HintModal.jsx`, `RemoveAdsModal.jsx`. **Also check:** is every displayed price the store's `priceString`, with no figure until it loads? Never add a fallback price. Tests: `src/lib/noHardcodedPrices.test.js` (the sweep), `src/lib/storePrices.test.jsx`, `src/lib/storePricesFailing.test.jsx`. |
| **No page-load flicker (CR-75, FB-2, 1 Oct 2026)** | `src/Layout.jsx`, `src/pages/Home.jsx`, `Settings.jsx`, `Stats.jsx`, `Game.jsx`, `DailyChallenge.jsx`, `src/components/game/DailyChallengeCard.jsx`. **Also check:** no page-level transition in Layout; no mount `initial=` on page content (modal and victory animations are fine); page data present on the first render; anything sized from the DOM measured in `useLayoutEffect`. Test: `src/pageLoadFlicker.test.jsx`. |
| **Audio after an interruption (CR-77, FB-10, 1 Oct 2026)** | `src/components/game/voiceUtils.jsx` (`ensureAudioRunning`, `rebuildAudioContext`, `recoverAudioAfterInterruption`, `unlockAudio`, every play function). **Also check:** does every new play path await `ensureAudioRunning()` before scheduling, with `resume()` still called synchronously so it stays inside the tap gesture? Is `'interrupted'` still handled, and does a rebuild keep the buffer cache? Test: `src/components/game/audioInterruption.test.js`. |
| **Audio suspended for the background (CR-79, FB-10, 2 Oct 2026)** | `src/components/game/voiceUtils.jsx` (`suspendAudioForBackground`, the `visibilitychange` listener) and `ios/App/App/AppDelegate.swift` (`applicationDidEnterBackground`, `applicationDidBecomeActive`, `mediaPlaybackSuspended`). **Also check:** on hidden, is audio still stopped and the context suspended by script? Are the native suspend and resume calls still in pairs? The AppDelegate change is only compiled on the Mac, so check an iOS build after any edit to it. Must not touch the audio category or `AVAudioSession` (FB-8, the silent switch). Test: `src/components/game/audioInterruption.test.js` (the background test). ⚠️ **The native half was removed by CR-82 (2 Oct 2026); the row above is kept as written.** WebKit discards `setAllMediaPlaybackSuspended` (SF-MAC-M), so `AppDelegate.swift` is back to its pre-CR-79 content. Only the JS hidden-suspend stays. |
| **Stalled playback rebuilt and replayed once (CR-82, FB-10, 2 Oct 2026)** | `src/components/game/voiceUtils.jsx` (`playWatched`, `STALL_CHECK_MS`, `stopSources`; `scheduleBuffers`' `sources` argument; `speakWordAudio` and `playSeamless` call `playWatched`). **Also check:** does every new Web Audio play path go through `playWatched`? Is there still at most one replay per play, never one for a play that was stopped or replaced (CR-63's generation check before the retry), and is `_bufferCache` kept across the rebuild? No idle suspend. Tests: `src/components/game/audioStall.test.js`; `audioInterruption.test.js` relies on its mock clock running, and its `afterAll` must outlast `STALL_CHECK_MS`. |
| **Voice poll stops when voices arrive by the event (CR-82, 2 Oct 2026)** | `src/components/game/voiceUtils.jsx` (`getVoices`: `poll`, `onChanged`). **Also check:** does every way of resolving clear the 200 ms poll? Test: `src/components/game/voicePoll.test.js`. |
| **Daily timer scales with word count (CR-84, S27, FB-18, 2 Oct 2026)** | `src/components/game/DailyChallengeUtils.jsx` (`CHALLENGE_TEMPLATES` `timed`, `SECONDS_PER_WORD`, `dailyTimeLimit`), `src/pages/DailyChallenge.jsx` (`timeLimit` / `timeLimitRef`, set in `initGame`). **Also check:** a new template needs `timed`, not a fixed limit. A new mode needs a `SECONDS_PER_WORD` entry, or it falls back to the standard 12 s. `time_taken` reads `timeLimitRef`. Test: `src/pages/DailyChallengeCR84.test.jsx` (S27). |
| **Daily reward once per day (CR-84, S28, 2 Oct 2026)** | `src/pages/DailyChallenge.jsx` (`triggerVictory`'s early branch on `getDailyRecord(date)?.completed`; `rewardEarned` and the victory card's reward line). **Also check:** any change to what a Daily completion pays is the developer's decision (S6, S28). A repeat must not rewrite the day's record or the streak. Test: `src/pages/DailyChallengeCR84.test.jsx` (S28); the first-completion save is also in `DailyChallenge.test.jsx`. |
| **Daily found-word audio (CR-84, FB-19, 2 Oct 2026)** | `src/pages/DailyChallenge.jsx` (`handleWordFound`'s `mode === 'audio'` block). **Also check:** it must stay in step with `Game.jsx`'s Audio Challenge feedback (phrase plus word; the game-complete phrase on the last word). Other modes stay toast-only. Test: `src/pages/DailyChallengeCR84.test.jsx` (FB-19). |
| **Daily time floor (CR-85, S27, 2 Oct 2026)** | `src/components/game/DailyChallengeUtils.jsx` (`min_seconds` on each timed template; `dailyTimeLimit` returns the larger of the scaled limit and the floor). **Also check:** `min_seconds` is a floor, not the limit. A new timed template needs one, or it gets the scaled limit alone. Test: `src/components/game/dailyTimeFloor.test.js`, which holds the old limits as its own data. |
| **Cell scale follows the colour order (CR-85, FB-22, 2 Oct 2026)** | `src/components/game/GameBoard.jsx` (the cell `motion.div`'s `className` and `animate`, shared by Game and the Daily). **Also check:** any new cell state must be added to both chains, in the same order. Test: `src/components/game/gameBoardHintScale.test.jsx`. |
| **Android backup on the measured defaults (CR-94, SF-48, S40-B, 12 Oct 2026)** | `android/app/src/main/AndroidManifest.xml` (`allowBackup="true"`, no rules, no agent) and `res/xml*`. **Also check:** any backup rules file or agent must keep the WebView's storage (`wf_progress`) and RevenueCat's preferences together; after a dependency change, check the merged release manifest (CR-94 has the command). Test: `src/androidBackupConfig.test.js`. |
| **Android Back (CR-110, SF-65, U7, 13 Oct 2026)** | `src/lib/backButton.js` (`resolveBack`, the registry, `useBackHandler`, `installBackButton`), `src/App.jsx` (`BackButtonBridge`, `HOME_PATHS`), registrations in `src/components/game/HintModal.jsx`, `src/components/game/RemoveAdsModal.jsx`, `src/pages/Game.jsx`, `src/pages/DailyChallenge.jsx`, `src/pages/Tutorial.jsx`, `src/pages/Settings.jsx`, `src/pages/Home.jsx` (the level picker's stages, CR-111); `@capacitor/app` in `package.json`; `android/capacitor.settings.gradle`, `android/app/capacitor.build.gradle`. **Also check:** a new modal or sheet must register `useBackHandler('modal', <its close>, isOpen)` or Back skips past it; a new page with its own Back control registers `'page'`; `backButton.js` must keep importing only react and the platform helpers (the Tutorial imports it); after a plugin change, both native projects need `npx cap sync`. Tests: `src/lib/backButton.test.js`, `src/backButtonPages.test.jsx`, `src/pages/tutorial.test.jsx`. |
| **Tutorial coach marks (CR-114, SF-66b, G1/G2/G5, 14 Oct 2026)** | `src/components/game/CoachMark.jsx` (the bubble only), `src/lib/coachPlacement.js` (`placeBubble`), `src/components/game/GameBoard.jsx` (`coachCells`, `coachDashed`), `src/components/game/TutorialWordList.jsx` (`coachTarget`), `src/pages/Tutorial.jsx` (coach steps, `avoid`, step 4 copy). **Also check:** a positioned element inside the tutorial page must set `margin: 0` (the page uses `space-y-3`); a new coach step names its target cells or control and the bubble must avoid them; the tutorial must still import no storage, ad, purchase or hint module. Tests: `src/lib/coachPlacement.test.js`, `src/pages/tutorial.test.jsx`, `src/tutorialIsolation.test.js`. |
| **Progress writes (CR-113, SF-66b, S6, 14 Oct 2026)** | `src/components/game/offlineStorage.jsx` (`changeProgress`, `updateProgress`, `hintCount`), every progress write in `src/pages/Game.jsx` and `src/pages/DailyChallenge.jsx` (`changeHints`, victory, replay, reward), `src/pages/Settings.jsx` (Reset). **Also check:** a new progress write must go through `changeProgress` with only the fields it owns, never a whole object the screen loaded earlier; nothing but a hint action, a purchase, a reconcile or the Daily reward writes `hints_remaining`; Reset never writes a balance it did not read. Tests: `src/hintWrites.test.jsx`. |
| **Guided first game (CR-108, SF-64, S43, 13 Oct 2026)** | `src/pages/Tutorial.jsx` (steps, finish screen `MODE_LINES` and Hints box, Skip), `src/components/game/TutorialWordList.jsx`, `src/components/game/CoachMark.jsx`, `src/lib/tutorial.js` (`wf_tutorial_done`, routes), `src/pages/Home.jsx` (resume, `startFirstPuzzle` hand-off, How to Play button), `src/pages/Settings.jsx` (Replay tutorial row; Reset), `src/Layout.jsx` (no nav on the page), `src/pages.config.js`. **Also check:** the page's import graph must stay clear of storage, ad, purchase and hint modules; the Hints box must match the code's hint values; a test that renders Home with `wf_welcome_seen` and no games needs `wf_tutorial_done` or Home resumes the tutorial. Tests: `src/tutorialIsolation.test.js`, `src/pages/tutorial.test.jsx`, `src/pages/tutorialEntry.test.jsx`. |
| **First-launch welcome (CR-107, SF-63, S42, 13 Oct 2026)** | `src/lib/welcome.js` (`isWelcomeDue`, `settleWelcomeForPlayers`, `useWelcomeDue`), `src/components/game/WelcomeScreen.jsx` (demo board, "Hear it", chips, buttons), `src/pages/Home.jsx` (renders the welcome instead of its content; `startLevel` shared by the picker and Skip; `WELCOME_SKIP_START`), `src/Layout.jsx` (no nav while the welcome is due), `src/lib/motion.js` (`prefersReducedMotion`, shared with `GameBoard.jsx`). **Also check:** anything that writes `games_played` or `wf_welcome_seen` changes who sees it; nothing blurred may mount on Home while it is due. Tests: `welcomeScreen.test.jsx`, `src/pages/welcome.test.jsx`. |
| **Miss feedback (CR-106, SF-62, U8, 13 Oct 2026)** | `GameBoard.jsx` (`MISS_MS`, `showMiss`, `data-miss`, the red tint and `x` shake), `Game.jsx` and `DailyChallenge.jsx` (`handleWordFound` returns `'found'`/`'miss'`/`'ignored'`), `gameUtils.jsx` (`spellsFoundWord`). **Also check:** any new page that renders `GameBoard` must return one of the three answers; a miss must stay cost-free. Tests: `missFeedback.test.jsx`, `src/pages/missClassification.test.jsx`. |
| **GameBoard demo seams and coach targets (CR-106, SF-62, 13 Oct 2026)** | `GameBoard.jsx` (`interactive`, `selectedCells`, `data-row`/`data-col`), `GameHeader.jsx` (`data-coach="header-hint"`), `WordList.jsx` (`data-coach` `word-play`, `word-hint`, `word-reveal`). **Also check:** real games pass neither seam prop. Test: `gameBoardSeams.test.jsx`. |
| **Tap areas never overlap (CR-106, SF-62, 13 Oct 2026)** | `src/lib/touchTarget.js` and every element using an `after:` hit area. **Also check:** a new or widened hit area must keep reach within its container's gap. Test: `src/tapAreaOverlap.test.jsx` (a class-derived model; two exclusions named in its header). |
| **Mode names, one map (CR-105, SF-61, U1, 13 Oct 2026)** | `src/lib/constants.js` (`MODE_LABELS`), read by `GameHeader.jsx`, `GameLoadingScreen.jsx`, `GameModeSelector.jsx`, `src/pages/Tutorial.jsx` (`HowToPlayModal.jsx` until SF-64). **Also check:** a new screen that names a mode reads `MODE_LABELS`; never add a second map or a label literal. Test: `src/components/game/modeLabels.test.jsx`. |
| **Touch targets and icon-button labels (CR-105, SF-61, U5, U6, 13 Oct 2026)** | `src/lib/touchTarget.js` (`HIT_*`: an `::after` hit area, visible size unchanged; the element must not clip overflow), used by `GameHeader.jsx`, `HintModal.jsx`, `RemoveAdsModal.jsx`, `HowToPlayModal.jsx` (deleted in SF-64), `ReminderSettings.jsx`, `WordList.jsx`, `Settings.jsx`, `Home.jsx`; inline hit classes on the Mystery Word backspace (`Game.jsx`) and the How to Play dots. **Also check:** any new icon-only button needs an `aria-label` and, if under 44 px, a hit area. Tests: `src/a11yIconButtons.test.js`, `src/components/game/headerTargets.test.jsx`. |
| **Victory confetti cancelled on close (CR-105, SF-61, 13 Oct 2026)** | `VictoryModal.jsx` (effect cleanup calls `confetti.reset()`). **Also check:** a test that renders the real `VictoryModal` must mock `canvas-confetti` with a `reset`. Test: `src/components/game/victoryConfetti.test.jsx`. |
| **Interstitial waits for Dismissed; 6-game gap; test ad units in debug (CR-101, SF-57, DEF-54, 13 Oct 2026)** | `src/lib/admob.js` (`showInterstitialUntilClosed`, `adUnitsFor`, `isDebugBuild`, `TEST_AD_UNITS`), `src/lib/adCadence.js` (`interstitialDue`: `completed − last ≥ 6`; `last_ad_completed_at` written on Showed). **Also check:** never await the plugin's `AdMob.showInterstitial()` alone (it resolves while the ad is on screen); any new start path awaits `showInterstitialBeforeGame()` before its board or timer; mocks of the plugin use `admobPluginMock.testutil.js` (its real behaviour); iOS debug builds need `CAPACITOR_DEBUG = true` in the Debug configuration to get test units. Tests: `src/lib/adFlow.test.jsx`, `src/adCadence.test.jsx`. |
| **What the hint ledger records (CR-100, SF-56, DEF-53, 13 Oct 2026)** | `src/lib/purchases.js` (`purchaseProduct` returns `purchase: { productId, purchaseDate, listed }`), `src/lib/hintLedger.js` (`findListedEntry`, `creditPurchase`, the `pending:`/`matched:` claims in `reconcile`). **Also check:** the purchase result's transaction ID is the store's and never matches RevenueCat's listed ID; any change to what is recorded needs fixtures in the observed ID shapes (store `GPA.…`, RevenueCat `o1_…`) and a device check with a normal purchase and a relaunch. Test: `src/lib/hintLedger.test.jsx` (i), (ii). |
| **Hint-pack ledger and reconcile (CR-98, SF-50, S40-C, P1, 13 Oct 2026)** | `src/lib/hintLedger.js` (pure `reconcile`, `creditPurchase`, `withBaseline`; wiring), `src/lib/purchases.js` (`purchaseProduct` returns `txnId`; `initPurchases` sets the baseline, `syncAdFreeStatus` runs the reconcile), `offlineStorage.jsx` (`saveLocalProgress` never moves `credited_txn_ids`/`reconcile_since` backwards), `Settings.jsx` (Reset keeps both), `Game.jsx`/`DailyChallenge.jsx`/`Home.jsx` (purchase credit; re-read on `soundfind-progress-changed`). **Also check:** any new screen that writes the hint balance must re-read on that event; any new reset must keep the two fields. Test: `src/lib/hintLedger.test.jsx`. |
| **No backdrop blur on full-screen overlays (CR-97, SF-49b, 13 Oct 2026)** | `VictoryModal.jsx`, `RemoveAdsModal.jsx`, `AdModal.jsx`, `HowToPlayModal.jsx` (deleted in SF-64) (and `HintModal.jsx`, CR-95). **Also check:** a new full-screen overlay should dim without `backdrop-blur-*`. The bottom nav bar's blur (`Layout.jsx`) is measured, not decided (see STATUS, SF-49b). Test: `src/components/game/overlaysNoBlur.test.jsx`. |
| **Interstitial cadence, one place (CR-96, SF-52, S41, 13 Oct 2026)** | `src/lib/adCadence.js` (count, due check, mark, native show), called from `Home.jsx` `handleSelectLevel`, `Game.jsx` `handleNextLevel`/`handleReplay`/`saveProgress`, `DailyChallenge.jsx` `triggerVictory`/`handleTryAgain`, `DailyChallengeCard.jsx` `handleStart`. **Also check:** any new way to start or complete a game must call it; the storage keys are published and must not change. Test: `src/adCadence.test.jsx`. |
| **Hint shop overlay without backdrop blur (CR-95, SF-49, 13 Oct 2026)** | `src/components/game/HintModal.jsx` (the `fixed inset-0` overlay: `bg-black/60`, no `backdrop-blur-*`). **Also check:** a full-screen backdrop blur is slow on low-end Android GPUs (SF-47 measured ten times the slow frames); the other modals still have one. Test: `src/components/game/hintModalOverlay.test.jsx`. |
| **Where hints are kept, on the purchase view (CR-93, SF-46, S40, 12 Oct 2026)** | `src/components/game/HintModal.jsx` (`PurchaseView`, the line under the pack list). **Also check:** if hints ever move off the device or gain a restore (SF-45's B or C), this line and the Terms' section 6 change together. Test: `src/components/game/hintStorageNote.test.jsx`. |
| **Cell precedence: selected, then hint, then found (CR-92, SF-44, 12 Oct 2026)** | `src/components/game/GameBoard.jsx` (both chains: the cell `className` and its `animate` scale). **Also check:** keep the two chains in the same order. A hint on a found word's cell must show the hint colour. Test: `src/components/game/gameBoardHintPrecedence.test.jsx`. |
| **A hint is cleared when any found word covers its cell (CR-85, FB-22, 2 Oct 2026)** | `src/pages/Game.jsx` and `src/pages/DailyChallenge.jsx` (`hintCellsRef`; `coversHintCell` in `handleWordFound`, beside DEF-28's clear). **Also check:** the two pages each have their own copy of the hint logic, so a change to one needs the same change in the other. The clear applies only to regular word hints. Test: `src/pages/staleHint.test.jsx`. |
| **Hint pill transition trial (CR-85, FB-21, 2 Oct 2026)** | `src/components/game/GameHeader.jsx` (both hint-pill `motion.button`s: `transition-colors`, not `transition-all`). **Also check:** a trial pending a device check. If FB-21 persists, the cause is elsewhere; HintModal's backdrop was deliberately left alone. No test (a CSS class only). |
| **Startup service-worker cleanup, guarded (CR-86, FB-24, Sentry SOUNDFIND-6, 2 Oct 2026)** | `src/lib/staleServiceWorkers.js` (`unregisterStaleServiceWorkers`, `isElectronPage`), called once from `src/main.jsx`. **Also check:** it must never reject; any new service-worker call needs the same guard. It still runs on iOS and Android, as CR-53's cleanup of the Workbox worker some old builds shipped (CR-53, CR-55), so don't skip native without that decision. Electron is skipped because its `app:` scheme has no `allowServiceWorkers` (`electron/main.cjs`). It also runs on the web, because `@capacitor/core` sets `window.Capacitor` everywhere; whether the web should skip it is open. The Sentry release comes from `package.json` via `__APP_VERSION__` (`vite.config.js`), never a literal. Test: `src/mainStartup.test.jsx`. |
| **Android RevenueCat key (CR-88, 2 Oct 2026)** | `src/lib/purchases.js` (`API_KEYS.android`, public SDK key `goog_…`; `initPurchases`). **Also check:** a key change or a new platform must be pinned by `src/lib/androidKeyAndOfflineText.test.jsx`. `src/lib/androidNoRevenueCatKey.test.jsx` describes the interim, before the Play products exist. |
| **Offline "need internet" line, web only (CR-88, 2 Oct 2026)** | `src/components/game/GameModeSelector.jsx` (`sentencesNeedNetwork = !isNative() && !isElectronPage()`). **Also check:** if sentence audio ever stops being bundled on a platform, or starts on the web, this condition follows it. The "Limited offline" badge and the offline banner were not changed. Test: `src/lib/androidKeyAndOfflineText.test.jsx`. |
| **Offline banner and "Limited offline" badge, web only (CR-90, 2 Oct 2026)** | `src/components/game/GameModeSelector.jsx` (the banner text and the badge, both keyed on `sentencesNeedNetwork`). **Also check:** if a mode ever needs the network on native or Electron, the banner's "Every mode still works" stops being true. Test: `src/components/game/offlineBannerNative.test.jsx`. |
| **Android version (CR-88, 2 Oct 2026)** | `android/app/build.gradle` (`versionCode` 4, `versionName` "1.1.1"), the only place the Android version is set. **Also check:** each Play upload needs a higher versionCode. iOS build numbers are separate (`project.pbxproj`). |
| **Word list visible on the first frame (CR-80, FB-13, 2 Oct 2026)** | `src/components/game/WordList.jsx`, `src/components/game/AnagramWordList.jsx`, `src/components/game/AssociationWordList.jsx` (the row `motion.div`). **Also check:** does any row element have an `initial` that is not `false`? A new list component, or a new row type in these, must paint its rows on the first frame. The found-word check badge's `initial={{ scale: 0 }}` is player-triggered and stays. Test: `src/components/game/wordListFirstFrame.test.jsx`; a new list component needs adding to its `LISTS`. |
| **Home selectors visible on the first frame (CR-81, FB-15, 2 Oct 2026)** | `src/components/game/AudioCategorySelector.jsx` (both card elements), and the other three selectors it guards: `GameModeSelector.jsx`, `CategorySelector.jsx`, `LevelSelector.jsx`. **Also check:** does any selector button have an `initial` other than `false`? A new card, or a new selector rendered by Home, must paint on the first frame. `whileHover` / `whileTap` are fine, because they only run on interaction. Test: `src/components/game/selectorFirstFrame.test.jsx`; a new selector, or a changed set of items, needs its entry in `SELECTORS` updated, with the button count and labels. |

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
| **Superseded (CR-67, 30 Sep 2026, decision S6)** | ⚠️ The two CR-64 rows around this one describe a model that was **withdrawn**. Off native, `AdModal.jsx` is back (the placeholder ad after every 6 completed games) and `HintModal` again offers "Watch an Ad" (placeholder) and "Buy Hint Pack" (Coming soon); the refill is gone. **Also check (CR-67):** does off-native still show both options and the ad on the 6th game, not the 5th? Is native unchanged? Is there no refill anywhere? Tests: `src/components/game/HintModal.test.jsx`, `src/pages/Home.adGate.test.jsx`. **Monetisation changes are the developer's decision (S6).** |
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
| Game mode added or removed | Update `README.md`, `WelcomeScreen.jsx`, `src/pages/Tutorial.jsx` (`MODE_LINES`; `HowToPlayModal.jsx` was deleted in SF-64), beta test sheet |
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
