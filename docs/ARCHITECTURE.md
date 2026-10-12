# SoundFind — Architecture

**Generated from code at commit `6d412f5`, 13 October 2026, `package.json` version
1.1.1 (Android versionCode 5, iOS build 8).** SF-59, which regenerated this file,
changed tests and test configuration only, so the app code described here is the
code at `6d412f5`.

Derived by reading the repository, not written from the website, the store listing,
or memory. **Every "nothing", "no" and "none" below is a claim about the code as at
13 Oct 2026**, from a sweep of the 52 app source files under `src/` (tests and test
utilities excluded) unless it names a narrower scope.

> **Regenerate at every version bump.** A stale architecture document is worse
> than none, because it reads as authoritative. If the commit above is not an
> ancestor of your HEAD, treat everything here as a claim to verify. Prefer
> citing files and symbol names over line numbers.
>
> The previous generation (commit `4b80d21`, 20 Aug 2026, version 1.1.0) and the
> annotations added to it between then and 13 Oct 2026 are in git history.

---

## 1. What the app is

A word-search game with five modes, including an audio mode where words are spoken
aloud and the player finds the spelling in the grid.

The repo is `WordFind-Adventure`; the app is SoundFind. **The repo name predates the
rebrand — do not rename it.** Brand: Unique Interactive Games (uniquegames.com.au).

No backend and no accounts: as at 13 Oct 2026 the app's own state is all in
`localStorage` (§5).

---

## 2. Stack

| Layer | What |
|---|---|
| App | React ^18.2.0, Vite ^6.1.0, Tailwind ^3.4.17, shadcn/ui, Framer Motion ^11.16.4, lucide-react ^0.475.0 icons |
| Routing | **`HashRouter`** (`src/App.jsx`), react-router-dom ^6.26.0. Required for Capacitor and Electron, where there is no server for deep paths |
| Mobile | Capacitor ^8.3.0 (`@capacitor/core`, `/cli`, `/ios`, `/android`); `capacitor.config.json` has `appId: au.com.uniquegames.soundfind` |
| Desktop | Electron ^41.3.0 and electron-builder ^26.8.1, packaged as an `appx` for the Microsoft Store |
| Ads | `@capacitor-community/admob` ^8.0.0 (`src/lib/admob.js`, `src/lib/adCadence.js`) |
| In-app purchases | `@revenuecat/purchases-capacitor` ^13.1.5 (`src/lib/purchases.js`, `src/lib/hintLedger.js`) |
| Errors | `@sentry/react` ^10.50.0 |
| PWA | `vite-plugin-pwa` ^1.2.0, web build only |
| Effects | `canvas-confetti` ^1.9.0 (`VictoryModal.jsx`) |
| Web deploy | Vercel (`vercel.json` holds the SPA rewrites) |

Pages (`src/pages.config.js`, `PAGES`): `DailyChallenge`, `Game`, `Home`, `Settings`,
`Stats`; `mainPage` is `Home`. There is no Leaderboard page (removed in CR-66,
decision S3); an old `#/Leaderboard` link shows Page Not Found. The bottom nav is
Home, Stats, Settings.

### Build scripts (`package.json`)

```
dev                  vite
build                vite build                      (web, with the service worker)
build:ios            vite build --mode capacitor     (no service worker)
build:android        vite build --mode capacitor     (no service worker)
electron:build-web   vite build --mode electron
electron:dist        electron:build-web, electron-builder --win appx, scripts/patch-appx-assets.mjs
test                 vitest run
```

**A web build is not what ships to a store.** `vite.config.js` leaves `VitePWA` out in
the `capacitor` and `electron` modes, because a service worker intercepts the native
schemes' audio fetches (CR-53, CR-55, CR-70). Native release order: `npm run
build:android` (or `build:ios`), then `npx cap sync <platform>`, then the signed build
in Android Studio or Xcode.

### Tests

Vitest ^3.2.7 with jsdom ^26.1.0, 38 test files. Each file that needs a DOM declares
`// @vitest-environment jsdom`. **Verification reads a run's exit code and its whole
summary, including any `Errors` line, never a filtered summary** (SF-55d, SF-59; see
the repo `CLAUDE.md`).

- **`vitest.config.js` (SF-59)** is test-only. It merges `vite.config.js` unchanged and
  adds one setting: `deps.optimizer.web` pre-bundles `lucide-react`, whose ESM entry
  re-exports 3,522 per-icon files. Loaded one by one, that was 2.9 s alone and 11 s in
  a full parallel run, most of the budget `leaderboardRoute.test.jsx` kept missing.
  `vite build` does not read this file.
- **canvas-confetti is mocked** (`vi.mock('canvas-confetti', ...)`) in the two test files
  that render the real victory screen, `src/adCadence.test.jsx` and
  `src/components/game/overlaysNoBlur.test.jsx` (CR-102). jsdom has no canvas, so the
  library's first animation frame threw an unhandled error and `npm test` exited 1
  with every test passing. Any new test that renders the real `VictoryModal` needs
  the same mock.
- **`@sentry/react` is mocked** in the three files that import `voiceUtils`
  (`voiceUtils.test.js`, `audioInterruption.test.js`, `voicePoll.test.js`; SF-59).
  Loading the real package was about 90% of their `beforeAll` import, which overran
  the 10 s hook budget under load.
- **The ad plugin double** `src/lib/admobPluginMock.testutil.js` copies the real
  plugin's behaviour (CR-101): `showInterstitial()` resolves while the ad is on screen,
  and only the Dismissed event says it closed.

---

## 3. Game modes — five

Defined in `src/components/game/GameModeSelector.jsx`. Internal id on the left, the
label players see on the right (the same in `GameHeader.jsx` `modeLabels`, decision
S2):

| id | Label | Offline |
|---|---|---|
| `standard` | Standard | Works |
| `audio` | Audio Challenge | In `DEGRADED_OFFLINE`; on the web its sentences need the network |
| `anagram` | Anagram Hunt | Works |
| `association` | Word Association | Works (hand-crafted clues) |
| `mystery_word` | Mystery Word | Works |

As at 13 Oct 2026, `REQUIRES_ONLINE` is an empty set: no mode requires a connection.
Offline on native and Electron (`sentencesNeedNetwork` false), the mode picker's banner
reads *"You're offline. Every mode still works — ads and purchases need a
connection."*; on the web it says Audio Challenge is limited (CR-90).

The Daily Challenge has a time limit that scales with the word count (decision S27)
and awards its reward hints once a day (S28).

---

## 4. Monetisation

### Products (`src/lib/purchases.js`)

| Product ID | What |
|---|---|
| `au.com.uniquegames.soundfind.remove_ads` | Remove ads, one-time (`REMOVE_ADS_PRODUCT_ID`; entitlement `remove_ads`) |
| `au.com.uniquegames.soundfind.hints_3` | 3 hints ("Starter") |
| `au.com.uniquegames.soundfind.hints_10` | 10 hints ("Best Value") |
| `au.com.uniquegames.soundfind.hints_25` | 25 hints ("Power Pack") |

**Prices come only from the store** (FB-1, CR-74): `getPrice`, `getLowestPrice` and
the `usePrice` hook return RevenueCat's own `priceString`, or null until the store
answers, and the screens then show no figure. As at 13 Oct 2026 the code holds no
price figure of its own.

### Hints and the hint shop

A new player starts with 12 hints (`offlineStorage.jsx` `loadProgress`; decision S6).
The hint shop (`HintModal.jsx`) opens when a hint is asked for at a balance of 0. It
offers "Watch an Ad" (a rewarded ad for 1 hint, `showRewarded` in `admob.js`) and the
three packs. Off native (`!isNative()`: web and Electron) the packs show a "Coming
soon" toast and the ad is a placeholder; as at 13 Oct 2026 the Windows model of
decision S25 (Store packs, non-ad free hints, no ads) is **not built**. The purchase
view tells the player that hints are kept on the device, not in an account (SF-46).

### Hint-pack ledger (`src/lib/hintLedger.js`; CR-98, CR-100; decision S40-C)

Two fields inside `wf_progress` keep a paid pack from being lost or credited twice:

| Field | Meaning |
|---|---|
| `credited_txn_ids` | **RevenueCat's** transaction IDs (the ones `customerInfo.nonSubscriptionTransactions` lists, shaped `o1_…`) whose packs have been credited, plus claim markers `pending:<product>:<ms>` and `matched:<product>:<ms>` |
| `reconcile_since` | ISO time; only hint-pack transactions on or after it are ever reconciled. Set when missing (a new install, or the first launch of the version that added it) |

- **At purchase** (`creditPurchaseNow`, called by `Game.jsx` and `DailyChallenge.jsx`):
  adds the pack and records, in the same write, the listed transaction from the
  customerInfo the purchase call returned: same product, not yet recorded, within
  `MATCH_WINDOW_MS` (2,000 ms) of the store's purchase time (`findListedEntry`). If it is
  not listed yet, it records a `pending:` claim instead. The store's own order ID
  (`GPA.…` on Google Play) is not kept: it never matches RevenueCat's ID, which is how
  CR-98 credited normal purchases twice (DEF-53).
- **At launch** (`initPurchases`): `ensureReconcileBaseline` sets the baseline before any
  purchase is possible; once RevenueCat answers, `reconcileHintPurchases` credits any
  listed hint-pack transaction after the baseline that is neither recorded nor
  matched by a claim, and shows *"Added N hints from an earlier purchase"*. A matched
  claim becomes `matched:` and credits nothing.
- **Measured on the tablet (SF-55, SF-55b, SF-55c):** a pack whose purchase was killed
  before crediting is added once, on the second launch after the kill; a normal
  purchase is added once and not again on relaunch.
- `saveLocalProgress` never moves the ledger backwards (union of IDs; the baseline is
  kept), Settings Reset keeps both fields with `hints_remaining`, and Android's
  backup (§5) restores them with the balance.

### Ads (`src/lib/admob.js`, `src/lib/adCadence.js`)

- **Child-directed on every request (decision S1):** `initialize` carries
  `tagForChildDirectedTreatment: true` and `maxAdContentRating` General; the consent
  request carries `tagForUnderAgeOfConsent: true`; every request sets `npa: true`.
  Android's merged manifest has no `AD_ID` and no `ACCESS_ADSERVICES_*` permissions
  (S21, CR-71, CR-73).
- **Interstitial cadence (CR-101, decision S41):** every completed game counts, normal
  and Daily (`recordCompletedGame`, key `games_completed_count`). An interstitial is
  due when `games_completed_count − last_ad_completed_at ≥ 6` (`AD_FREQUENCY`), with
  `last_ad_completed_at` taken as 0 before any ad (`interstitialDue`). The ad is
  recorded only on the plugin's Showed event (`markInterstitialShown`), so an ad that
  fails stays due; ads are never fewer than 6 completed games apart. Gates: native,
  online, ads not removed.
- **Wait for dismissal (CR-101, DEF-54):** the interstitial shows before the NEXT game,
  on every start path: Home's level picker, Next Level, Replay, the Daily card and
  the Daily's Try Again. Each awaits `showInterstitialBeforeGame`, which resolves when
  the ad is **dismissed**, or at once if it fails to load or show
  (`showInterstitialUntilClosed`, on the plugin's Dismissed, FailedToShow and
  rejected-show signals; one in-flight show at a time). The plugin's own
  `showInterstitial()` resolves while the ad is still on screen, so as at 13 Oct 2026
  nothing awaits it on its own. Off native, only Home shows the placeholder
  `AdModal`.
- **Measured on the tablet (SF-55c, debug build):** the ad appeared exactly when
  predicted on Next Level, Replay and the Daily card; nothing moved behind it; the
  next level, the restarted board and the Daily (its timer from full) started only
  after the ad closed, by Back or by X.
- **Debug builds use Google's test units (CR-101):** `isDebugBuild` reads
  `window.Capacitor.DEBUG`, which the native shell sets from the installed app
  (Android `FLAG_DEBUGGABLE`; iOS `isDevEnvironment`). `adUnitsFor(platform, debug)`
  returns Google's published test units when it is true and the production units
  otherwise. A release bundle therefore contains both sets; which one runs depends on
  the installed build. ⚠️ On iOS, `DEBUG` reads true only if the Debug configuration
  defines `CAPACITOR_DEBUG = true`: `Info.plist` reads `$(CAPACITOR_DEBUG)`, and as at
  13 Oct 2026 no configuration in this repo defines it, so an iOS debug build still
  requests production units.

---

## 5. Persistence

`localStorage` only; the app has no server and syncs nothing itself. Every key, from a
sweep of every `localStorage.getItem`, `setItem` and `removeItem` call in app code, as
at 13 Oct 2026 (no other storage API is used):

| Key | Where | Purpose | Settings Reset |
|---|---|---|---|
| `wf_progress` | `offlineStorage.jsx` `PROGRESS_KEY` | Level, score, hints, games played, words found, best streak, and the hint ledger (§4) | Cleared, keeping `hints_remaining`, `credited_txn_ids` and `reconcile_since` |
| `wf_settings` | `offlineStorage.jsx` `SETTINGS_KEY` | Voice, backup-voice rate and pitch, theme | Cleared |
| `wf_daily` | `offlineStorage.jsx` `DAILY_KEY` | Daily Challenge records by local date | Cleared |
| `wf_welcome_seen` | `WelcomeScreen.jsx` `WELCOME_KEY` | First-run welcome shown | Cleared |
| `games_completed_count` | `adCadence.js` `COUNT_KEY` | Completed games, for the interstitial cadence | Cleared |
| `last_ad_completed_at` | `adCadence.js` `LAST_AD_KEY` | Completion count at the last interstitial shown | Cleared |
| `ads_removed` | `purchases.js`, `Home.jsx`, `Settings.jsx`, `adCadence.js` | Remove Ads entitlement | Kept |
| `wordfind_reminder_timer` | `ReminderSettings.jsx` | Reminder schedule | Not touched |
| `wordfind_reminder` | `ReminderSettings.jsx` `STORAGE_KEY` | Reminder settings | Not touched |

Note the three prefixes (`wf_`, `wordfind_` and bare): legacy naming from before the
rebrand. Renaming any key orphans existing players' data. (`sf_free_hint_refill_at`,
from the withdrawn CR-64 refill, may remain in old browsers; as at 13 Oct 2026 nothing
reads or writes it.)

### Platform backup on Android, the SF-48 pin (CR-94, decision S40-B)

The app copies nothing anywhere, **but Android's Auto Backup does**: the manifest sets
`android:allowBackup="true"` and none of `fullBackupContent`, `dataExtractionRules` or
`backupAgent`, and `res/` has no backup rules file. **As measured 12 Oct 2026 on one
Android tablet (SF-47):** after a backup, an uninstall and reinstall restored both the
WebView's localStorage (so `wf_progress` and its hints) and RevenueCat's
SharedPreferences (so the same anonymous app user ID). With backup off, neither came
back. A restore brings back the last backup (about daily), nothing when the player has
backup off, and, inferred rather than tested, nothing on iOS after deleting the app.

**Pinned by `src/androidBackupConfig.test.js`:** `allowBackup="true"`, none of the three
rule attributes, and no `<full-backup-content>` or `<data-extraction-rules>` file in
`res/xml*`. Any future rules file or backup agent must keep `wf_progress` and
RevenueCat's preferences together, or restored hints and the ledger's reconcile break.
The test reads the source manifest; the merged release manifest was checked by hand
for the 1.1.1 (5) bundle (SF-55d).

---

## 6. Outbound network

As at 13 Oct 2026, apart from the SDKs below, the app's only outbound URLs are:

- Four `uniquegames.com.au` links in `Settings.jsx` (site, contact, SoundFind privacy,
  SoundFind terms).
- **Three Unsplash photos, from four hardcoded `images.unsplash.com` URLs** in
  `AdModal.jsx` (three) and `HintModal.jsx` (one, repeating one of AdModal's). These are
  third-party requests at runtime, so Unsplash sees player IP addresses; they appear
  only in the placeholder ad and the off-native hint shop.
- AdMob and RevenueCat SDK traffic on native builds; Sentry.

Audio is served from the app's own `public/audio/` files.

---

## 7. Platform differences that matter

- **`HashRouter`, not `BrowserRouter`.** Reading or writing `window.location` directly
  has broken this app twice. Use the router's hooks.
- **`isNative()`** (`src/lib/platform.js`) gates every purchase path and the real ads.
  Web and Electron take the non-native branch (placeholders).
- **The Microsoft Store ships Electron**, not a PWA wrapper (`electron:dist`).
- **Audio degrades silently:** if an MP3 is missing, playback falls back to the Web
  Speech API with no error shown.

---

## 8. Store presence

Not derivable from the code; check the consoles. What the repo records:

| Store | Recorded |
|---|---|
| Apple App Store | Live (ID 6769255354). The iOS project is at 1.1.1, build 8 |
| Google Play | Closed testing only, not publicly listed. **The signed 1.1.1 (versionCode 5) bundle for closed testing was built from `561e34e` on 13 Oct 2026 (SF-55d)**; its upload is the developer's |
| Microsoft Store | Live (Electron `appx`); kept, decision S22 |

Bundle and app id on every platform: `au.com.uniquegames.soundfind`. Google Play
production needs 12 opted-in testers for 14 consecutive days
(`soundfind-testers@googlegroups.com`).

---

## 9. Unverified and out of scope

- **Everything in the store consoles:** live pricing, current versions and review
  states, ratings, AdMob serving status.
- **iOS runtime behaviour.** The Android debug build was exercised on one tablet
  (SF-55 to SF-55d); nothing here was executed on iOS.
- **Whether `dist/` and `electron-dist/` in the working tree match current source.**
  They are build outputs, not evidence.
- **`.env.local`** exists and is gitignored; its contents were deliberately not read.
