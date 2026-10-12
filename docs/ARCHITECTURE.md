# SoundFind — Architecture

**Generated from code at commit `4b80d21`, audited 20 August 2026,
`package.json` version 1.1.0.**

Derived by reading the repository, not written from the website, the store
listing, or memory.

> **Regenerate at every version bump.** A stale architecture document is worse
> than none, because it reads as authoritative. If the commit above is not an
> ancestor of your HEAD, treat everything here as a claim to verify. Prefer
> citing files and symbol names over line numbers — the line numbers here were
> correct at `4b80d21` and rot on the next edit.

---

## 1. What the app is

A word-search game with five modes, including an audio mode where words are
spoken aloud and the player finds the spelling in the grid.

Repo is `WordFind-Adventure`; the app is SoundFind. **The repo name predates the
rebrand — do not rename it.** Brand: Unique Interactive Games
(uniquegames.com.au).

No backend, no accounts. All state is in `localStorage`.

---

## 2. Stack

| Layer | What |
|---|---|
| App | React 18 + Vite 6, Tailwind, shadcn/ui, Framer Motion |
| Routing | **`HashRouter`** (`src/App.jsx`) — required for Capacitor and Electron, where there is no server to handle deep paths |
| Mobile | Capacitor 8.3.0 — `@capacitor/core`, `/cli`, `/ios`, `/android` |
| Desktop | Electron 41 + electron-builder, packaged as an `appx` for Microsoft Store |
| Ads | `@capacitor-community/admob` ^8.0.0 |
| IAP | `@revenuecat/purchases-capacitor` ^13.1.5 |
| Errors | `@sentry/react` ^10.50.0 |
| PWA | `vite-plugin-pwa` |
| Web deploy | Vercel (`vercel.json` holds the SPA rewrites) |

**Capacitor integration is real, not scaffolding** — `capacitor.config.json`
exists with `appId: au.com.uniquegames.soundfind`, `webDir: dist`, both `ios/`
and `android/` projects are present, and the app calls Capacitor APIs at runtime
(`src/lib/platform.js` wraps `Capacitor.isNativePlatform()`, and AdMob and
RevenueCat are Capacitor plugins). This answers the long-standing "verify
Capacitor integration" question in the affirmative.

There are **no Base44 references anywhere in `src/` or `package.json`.** Base44
is origin history only, not a live dependency.

### Build scripts

```
dev                  vite
build                vite build
build:ios            vite build --mode capacitor
electron:build-web   vite build --mode electron
electron:dist        build web, electron-builder --win appx, patch appx assets
```

Three distinct build modes. A web build is **not** what ships to a store.

---

## 3. Game modes — five

Defined in `src/components/game/GameModeSelector.jsx` (`OTHER_MODES`) and
labelled in `DailyChallengeCard.jsx` (`MODE_LABELS`). Internal id on the left,
player-facing label on the right — **they differ, and the labels are what store
copy should use**:

| id | Label | Notes |
|---|---|---|
| `standard` | Word Find | Classic search with a visible word list |
| `audio` | Audio | Words spoken aloud. **Degrades offline** (`DEGRADED_OFFLINE`) |
| `anagram` | Anagram | |
| `association` | Clue Hunt | Hand-crafted clues, works fully offline |
| `mystery_word` | Mystery Word | |

`REQUIRES_ONLINE` is currently an empty set — **no mode requires a connection.**
Only `audio` is marked as degraded offline, where it falls back to the Web
Speech API.

> ⚠️ **ANNOTATED 30 Sep 2026 (CR-65, brief SF-4); the table above is kept as
> written.** Its "Label" column is **not** what the game shows. Census of every
> mode-label site in `src/` (49 files scanned, tests excluded; `label_census`
> sweep for `id: 'label'` pairs and every quoted label of either set):
>
> | Site | standard | audio | anagram | association | mystery_word |
> |---|---|---|---|---|---|
> | `GameModeSelector.jsx` (the mode picker) | Standard | Audio Challenge | Anagram Hunt | Word Association | Mystery Word |
> | `GameHeader.jsx` `modeLabels` (in-game header) | Standard | Audio Challenge | Anagram Hunt | Word Association | Mystery Word |
> | `HowToPlayModal.jsx` | Standard | Audio Challenge | Anagram Hunt | Word Association | Mystery Word |
> | `GameLoadingScreen.jsx` `MODE_LABELS` | **Standard Mode** | Audio Challenge | Anagram Hunt | Word Association | **(missing → "Loading Game")**; also a stale `spelling: 'Spelling Bee'` entry for the mode removed in CR-01 |
> | `DailyChallengeCard.jsx` `MODE_LABELS` | **Word Find** | **Audio** | **Anagram** | **Clue Hunt** | Mystery Word |
>
> So the long set (Standard / Audio Challenge / Anagram Hunt / Word Association /
> Mystery Word) is the player-facing set everywhere except the Daily card and the
> loading screen's two deviations. The short set in the table above exists
> **only** in `DailyChallengeCard.MODE_LABELS`. Decision S2 (30 Sep 2026) adopts
> the long set everywhere; the change is applied in SF-6. Store copy should use
> the long set.

Pages: `Home`, `Game`, `DailyChallenge`, `Leaderboard`, `Stats`, `Settings`.

> ⚠️ **ANNOTATED 30 Sep 2026 (CR-66, decision S3); the line above is kept as
> written.** `Leaderboard` was removed: no route, no tab, file deleted. The bottom
> nav is Home, Stats, Settings. The long mode names (S2) now apply everywhere,
> including `DailyChallengeCard.MODE_LABELS` (which the card does not render) and
> the loading screen ("Standard"; Mystery Word no longer shows "Loading Game").

---

## 4. Monetisation — both paths are wired

Contrary to older notes in `CLAUDE.md`, RevenueCat is **not** stubbed.

`src/lib/purchases.js` is the single IAP surface: `initPurchases`,
`purchaseProduct`, `restorePurchases`, `getPrice`. Products:

| Product ID | What | Listed price in code |
|---|---|---|
| `au.com.uniquegames.soundfind.remove_ads` | Remove ads, one-time | from store |
| `au.com.uniquegames.soundfind.hints_3` | 3 hints | US$0.99 |
| `au.com.uniquegames.soundfind.hints_10` | 10 hints | US$1.99 |
| `au.com.uniquegames.soundfind.hints_25` | 25 hints | US$3.99 |

Prices in `PURCHASE_OPTIONS` are **fallback display strings only** — `getPrice`
prefers the real store price. Do not quote them as live pricing; check the
console.

**The "Coming soon" toast is not a stub.** `HintModal.jsx` shows it only when
`!isNative()` — i.e. on web and Electron, where IAP does not exist. On iOS and
Android the same handler calls `purchaseProduct`. `RemoveAdsModal.jsx` calls it
unconditionally.

Ads: `src/lib/admob.js` — `initAdMob()` from `App.jsx` at startup, `showRewarded()`
from `HintModal`. AdMob and RevenueCat failures are both reported to Sentry with
context tags rather than swallowed.

---

## 5. Persistence

`localStorage` only. No backend, no accounts, no sync. Keys in use:

| Key | Purpose |
|---|---|
| `wf_progress` | Game progress |
| `ads_removed` | Remove-ads entitlement |
| `games_completed_count` | Games finished |
| `last_ad_completed_at` | Rewarded-ad throttle |
| `wordfind_reminder_timer` | Reminder scheduling |

Note the inconsistent prefixes — `wf_`, `wordfind_`, and bare. Legacy naming from
before the rebrand; renaming any of them orphans existing players' data.

> ⚠️ **ANNOTATED 30 Sep 2026 (CR-65, brief SF-4); the table above is kept as
> written.** It lists 5 of the **10** keys the app uses, and `last_ad_completed_at`
> is the *interstitial* throttle (Home.jsx), not a rewarded-ad one. Every key,
> from a sweep of every `localStorage.getItem/setItem/removeItem` call in `src/`
> with key constants resolved:
>
> | Key | Where | Purpose | Settings Reset |
> |---|---|---|---|
> | `wf_progress` | `offlineStorage.jsx` `PROGRESS_KEY` | Level, score, hints, games played, words found, best streak | Cleared, but `hints_remaining` preserved (DEF-23) |
> | `wf_settings` | `offlineStorage.jsx` `SETTINGS_KEY` | Voice, backup-voice rate and pitch, theme, `sound_effects_volume` (stored, unused) | Cleared |
> | `wf_daily` | `offlineStorage.jsx` `DAILY_KEY` | Daily Challenge records by date (local date since CR-61) | Cleared |
> | `wf_welcome_seen` | `WelcomeScreen.jsx` `WELCOME_KEY` | First-run welcome shown | Cleared |
> | `games_completed_count` | `Game.jsx`, `Home.jsx` | Completed games, for interstitial gating | Cleared |
> | `last_ad_completed_at` | `Home.jsx` | Completion count at the last interstitial | Cleared |
> | `ads_removed` | `purchases.js`, `Home.jsx`, `Settings.jsx` | Remove Ads entitlement | Preserved |
> | `wordfind_reminder_timer` | `ReminderSettings.jsx` | Reminder schedule | Not touched |
> | `wordfind_reminder` | `ReminderSettings.jsx` `STORAGE_KEY` | Reminder settings (a second reminder key) | Not touched |
> | `sf_free_hint_refill_at` | `src/lib/freeHintRefill.js` (CR-64) | Last daily free refill on Windows and web | Not touched (so Reset cannot re-grant it) |
>
> ⚠️ *Annotated 30 Sep 2026 (CR-67, decision S6): the refill was withdrawn and
> `freeHintRefill.js` deleted. `sf_free_hint_refill_at` may still exist in
> browsers that used the CR-64 build, but **nothing reads or writes it**, so the
> app uses 9 keys. The row above is kept as written.*

### Platform backup (Android), added 12 Oct 2026 (CR-94, SF-47, SF-48, decision S40-B)

"No sync" above still holds: the app itself copies nothing anywhere. **But Android's
Auto Backup does**, because the manifest sets only `android:allowBackup="true"` and
no rules (`fullBackupContent`, `dataExtractionRules`, `backupAgent`: none).

**As measured 12 Oct 2026 on one Android tablet (SF-47); normal backups run about
daily:** after a forced backup, an uninstall and reinstall restored, at install and
before first launch, both the WebView's localStorage (`app_webview/Default/Local
Storage/leveldb`, so `wf_progress` came back with its hint balance) and RevenueCat's
SharedPreferences (`com_revenuecat_purchases_preferences`, so the same anonymous app
user ID). With Backup Manager disabled, neither came back: the balance was the
`loadProgress` seed of 12 and RevenueCat made a new ID.

What this does **not** give: the latest balance (a restore brings back the last
backup, which Android takes about daily), anything when the player has backup turned
off, or anything on iOS after deleting the app (only a whole-device restore brings
iCloud data back; inferred, not tested).

**Pinned by `src/androidBackupConfig.test.js`:** `allowBackup="true"`, none of the
three rule attributes, and no `<full-backup-content>` or `<data-extraction-rules>`
file in `res/xml*`. Any rules file or backup agent must keep `wf_progress` and
RevenueCat's preferences together, or restored hints and any future purchase
reconciliation (SF-45 C) break. The test reads the source manifest only; the merged
manifest is checked by hand (see CR-94).

### Hint-pack ledger in `wf_progress`, added 13 Oct 2026 (CR-98, SF-50, decision S40-C)

Two new fields inside `wf_progress`; the key and every existing field keep their
meaning:

| Field | Type | Meaning |
|---|---|---|
| `credited_txn_ids` | array of strings | Store transaction IDs whose hint packs have been credited, by the purchase path or by a reconcile |
| `reconcile_since` | ISO time string | Only hint-pack transactions dated on or after this are ever reconciled. Set when missing: on a new install, or on the first launch of the version that added it |

**Who writes them:** `src/lib/hintLedger.js`. The purchase path (`creditPurchaseNow`)
records the ID with the balance in one write; `initPurchases` sets the baseline before
any purchase is possible and, once RevenueCat answers, reconciles
`customerInfo.nonSubscriptionTransactions`. `saveLocalProgress` never moves them
backwards (the ID list is merged as a union; the baseline, once set, is kept), and
Settings Reset keeps both with `hints_remaining`. Since they live in `wf_progress`,
Android's Auto Backup (above) restores them together with the balance.

---

## 6. Outbound network

The app is close to fully local, but **not** entirely:

- Four static `uniquegames.com.au` links (site, contact, SoundFind privacy, terms)
- **Three hardcoded `images.unsplash.com` photo URLs.** These are third-party
  requests made at runtime, so Unsplash sees player IP addresses. Worth
  confirming this is reflected in the privacy policy and the store privacy
  declarations, since the rest of the app makes no third-party calls.
- AdMob and RevenueCat SDK traffic on native builds
- Sentry

---

## 7. Platform differences that matter

- **`HashRouter`, not `BrowserRouter`.** Reading or writing `window.location`
  directly has broken this app twice. Use the router's hooks.
- **`isNative()`** (`src/lib/platform.js`) gates every IAP path. Web and Electron
  take the non-native branch.
- **Microsoft Store ships Electron**, not a PWA wrapper. `electron:dist` runs
  `electron-builder --win appx` then patches appx assets via
  `scripts/patch-appx-assets.mjs`.
- **Audio degrades offline** to the Web Speech API, silently — if an MP3 is
  missing, no error is shown to the player.

---

## 8. Store presence

| Store | Status | ID |
|---|---|---|
| Apple App Store | Live | 6769255354 |
| Microsoft Store | Live | — |
| Google Play | Closed Testing only, not publicly listed | — |

Bundle / app id across platforms: `au.com.uniquegames.soundfind`.

Google Play closed testing runs through the Google Group
`soundfind-testers@googlegroups.com` and needs 12 opted-in testers for 14
consecutive days before production is unlocked.

---

## 9. Unverified and out of scope for this audit

- **Everything in the store consoles.** Live pricing, category, keywords, current
  ratings, AdMob serving status. Not in the repo — check the consoles.
- **iOS and Android runtime behaviour.** This audit read source on Windows. IAP,
  ads, audio playback and the native shells were not executed.
- **Whether `dist/` and `electron-dist/` in the working tree match current
  source.** They are build outputs, not evidence.
- **`.env.local` exists and is correctly gitignored and untracked** — its
  contents were deliberately not read.
