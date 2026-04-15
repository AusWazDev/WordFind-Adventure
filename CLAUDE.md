# SoundFind — Claude Code Context

> **Auto-loaded by Claude Code on every session start.**
> This file covers code context only — tech stack, key files, architecture, gotchas.
> For current status, blockers, and next steps → fetch the ClickUp handoff document:
> **"Project Context & Status — Claude Handoff Document"** (Team Space, workspace 90161564576)
> Keep this file updated when architecture or key patterns change.

---

## Project Identity

- **App name:** SoundFind (repo name: WordFind-Adventure — legacy, do not rename)
- **Tagline:** *Hear it. Find it.*
- **GitHub:** https://github.com/AusWazDev/WordFind-Adventure
- **Live URL:** Deployed on Vercel (check vercel.json for config)
- **Owner:** Waz (wjl25) — Windows PC, PowerShell for all git operations

---

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Framer Motion (animations)
- shadcn/ui (component library)
- React Router v6
- localStorage for all persistence (no backend)
- Vercel for deployment
- Capacitor planned for iOS/Android native builds (not yet set up)

---

## How This Project Is Run

### Two-tool workflow
- **Cowork (Claude desktop)** — design mockups, HTML canvas files, spreadsheets, visual review, screenshots
- **Claude Code (you)** — all coding, git commits, bug fixes, CR implementation

### Git workflow (Windows PowerShell)
VS Code's git extension holds index.lock frequently. Always prepend commits with:
```powershell
Remove-Item ".git\index.lock" -ErrorAction SilentlyContinue; Remove-Item ".git\HEAD.lock" -ErrorAction SilentlyContinue
```

### Traceability pre-commit hook
Every commit triggers `scripts/check-traceability.js`. It will warn (but not block) if:
- `src/` files changed without a STATUS.md update
- `src/` files changed without a Change Register entry
- New source files added without a Traceability.md entry

Always do a follow-up docs commit if the hook fires warnings.

### Change Register
Every code change needs a CR or DEF entry in `docs/Change Register.md` with the commit hash filled in after pushing.

---

## Current State (as of 15 Apr 2026)

App is **v1.0.0 — locked for store submission.** Beta testing complete.

### Recently completed
| CR/DEF | What | Commit |
|--------|------|--------|
| CR-35 | Settings — removed Game Preferences; added About & Legal card (privacy policy + support links) | `b32691f` |
| CR-34 | PageNotFound — replaced hard reload with `useNavigate()` for Capacitor compatibility | `31985db` |
| CR-33 | PWA icons + manifest — icon-192/512 generated; vite.config.js updated for PWABuilder | `a12686c` |
| CR-32 | Interstitial ad frequency 6 → 3 completed games | `6cb4621` |
| CR-30 | Audit fixes — dead imports/file deleted, `alert()` → `toast.info()`, iOS PWA meta tags | `6d674a7` |
| CR-29 | HowToPlay modal — responsive sizing, decluttered ~35%, consistent violet/indigo gradient | `79f75d8` |
| CR-28 | WelcomeScreen redesign (minimal + one-liner pill) | `aefc0d1` |
| CR-27 | Word list expanded by default (collapsed default not discoverable on mobile) | `d9540f5` |
| CR-25 | Code audit — dead imports, duplicate Toaster, constants extracted, 45 unused shadcn files deleted (97→58 kB) | `a584696` |
| CR-23 | PWA service worker — `vite-plugin-pwa` + Workbox; offline audio caching (CacheFirst, 5,000 MP3s) | `78858ab` |
| CR-22 | Pre-generated ElevenLabs audio — Hannah (AU female) / Neil (AU male), 4,062 MP3 files | `922ac7e` + `7de9b53` |
| DEF-30 | Word list collapsed on game start despite CR-27 — `generateGame` effect overriding default | `5d67343` |
| DEF-29 | All duplicate keys in `wordClues` resolved — 38 total | `38416fe` + `aefc0d1` |
| DEF-28 | Hint flash persistent until hinted word found | `38416fe` |

### Audio system (CR-22) — key facts for next session
- **All in-game audio uses pre-generated ElevenLabs MP3s** — Web Speech API is only the fallback
- `voiceUtils.jsx` uses Web Audio API (`AudioContext`) for gapless playback — NOT HTML5 `<audio>`
- `unlockAudio()` must be called on every user gesture to keep iOS AudioContext alive
- Audio library layout:
  - `public/audio/{female|male}/{WORD}.mp3` — 1,714 words × 2 genders
  - `public/audio/phrases/{gender}_{key}.mp3` — 4 phrase keys × 2 genders
  - `public/audio/sentences/{gender}_{WORD}.mp3` — 313 tricky-word sentences × 2 genders
- Phrase keys: `great_you_found`, `all_words_found`, `hidden_word_was`, `game_complete`
- To add new words/phrases: edit `scripts/generate-audio.mjs` PHRASES map, then run:
  `$env:ELEVENLABS_API_KEY="sk_..."; node scripts/generate-audio.mjs`
- ElevenLabs voice IDs: Hannah female `M7ya1YbaeFaPXljg9BpK`, Neil male `iIg0uI51lssRFauz7W21`
- Script is fully resumable — skips existing files

### What to verify on device
- Audio Challenge: words play in Hannah/Neil voice (not robotic), sentence context plays for tricky words
- Settings → Test Voice: plays "Great! You found rain!" in the selected voice via ElevenLabs
- Game completion (non-bonus): plays "Incredible! You found all the words!" before victory modal
- Game completion (bonus hunt): plays "Incredible! All words found! Now find the hidden bonus word!" — no overlap with last-word phrase

---

## Key Files

### App entry & routing
- `src/main.jsx` — React entry point
- `src/App.jsx` — Router + `showSplash` state that gates `SplashScreen`
- `src/pages.config.js` — Page registration (auto-generated, only edit `mainPage`)

### Pages
- `src/pages/Home.jsx` — Main landing page, game mode/category/level selection
- `src/pages/Game.jsx` — Core gameplay (board, word list, hints, victory)
- `src/pages/Settings.jsx` — Settings + reset (DEF-23 selective reset here)
- `src/pages/DailyChallenge.jsx` — Daily challenge flow
- `src/pages/Stats.jsx`, `Leaderboard.jsx` — Stats/leaderboard stubs

### Key components
- `src/components/game/SplashScreen.jsx` — App launch splash (CR-20)
- `src/components/game/WelcomeScreen.jsx` — First-run onboarding (CR-21)
- `src/components/game/HowToPlayModal.jsx` — How to play slides (CR-21)
- `src/components/game/GameBoard.jsx` — The word-find grid
- `src/components/game/WordList.jsx` — Word list panel (CR-16 collapsible)
- `src/components/game/GameHeader.jsx` — In-game header
- `src/components/game/HintModal.jsx` — Hint purchase/ad modal
- `src/components/game/offlineStorage.jsx` — All localStorage read/write
- `src/components/game/gameUtils.jsx` — Word placement, game logic
- `src/components/game/voiceUtils.jsx` — ElevenLabs MP3 playback via Web Audio API; Web Speech fallback
- `src/components/game/trickySentences.jsx` — Homophone/tricky word → sentence context map
- `scripts/generate-audio.mjs` — Batch ElevenLabs audio generator (resumable, skip-existing)

### Assets
- `public/icon.png` — 1024px master icon (used in splash, home header, welcome screen, favicon)
- `docs/icon/icon-mockup.html` — Interactive icon design tool
- `docs/icon/splash-mockup.html` — Interactive splash design tool
- `docs/icon/soundfind-icon-d.png` — Source icon PNG

### Docs
- `docs/Change Register.md` — Every CR and DEF with commit hashes
- `docs/Traceability.md` — File dependency map + "also check when changed" rules
- `STATUS.md` — Session log + next steps list
- `CLAUDE.md` — This file (code context, auto-loaded by Claude Code)

---

## localStorage Key Map

| Key | What | Reset behaviour |
|-----|------|-----------------|
| `wf_progress` | level, score, hints_remaining, games_played, words_found | Reset clears but preserves `hints_remaining` |
| `wf_settings` | voice, dark mode, etc. | Cleared on reset |
| `wf_daily` | Daily challenge history | Cleared on reset |
| `wf_welcome_seen` | Whether welcome screen was shown | Cleared on reset |
| `games_completed_count` | For ad frequency gating (CR-15) | Cleared on reset |
| `last_ad_completed_at` | Last ad threshold (CR-15) | Cleared on reset |
| `ads_removed` | IAP purchase flag | **Preserved on reset** |
| `hints_remaining` | Inside `wf_progress` | **Preserved on reset** (DEF-23) |

---

## Next Steps

For current priorities and store submission status → fetch the ClickUp handoff document:
**"Project Context & Status — Claude Handoff Document"** in ClickUp Team Space (workspace 90161564576).

Next major code work: **Capacitor setup** (iOS/Android native builds) — Phase 5.
Verify integration first: check `package.json` for `@capacitor/core`, `capacitor.config.ts`, `ios/` and `android/` folders.

---

## Known Issues / Watch Points

- `HintModal.jsx` — IAP stubs replaced with `toast.info()` (CR-30); no real RevenueCat wiring yet. Must complete before public launch.
- Vercel deployment — SPA rewrites in `vercel.json` handle React Router; don't remove
- Audio: if an MP3 is missing, all audio functions fall back to Web Speech API silently — no error shown to user
- Touch scroll on game board — non-passive listeners in `GameBoard.jsx` prevent pull-to-refresh (DEF-19)

---

## Design Tokens (locked)

| Element | Value |
|---------|-------|
| Brand gradient (dark) | `#0f0e1a → #1a1830` (splash, welcome screen) |
| Brand gradient (icon) | `#6d28d9 → #5b21b6 → #3730a3` |
| "Sound" text | `white` (#ffffff) |
| "Find" text | `violet-400` (#a78bfa) dark / `violet-600` (#7c3aed) light |
| Teal accent (speaker, Audio Challenge) | `teal-500` (#14b8a6) |
| Gold accent (waves) | `amber-400` (#fbbf24) |
| App icon border-radius | `sz * 0.2237` (iOS standard) |
| Splash timing | fade-in 400ms, hold 2000ms, fade-out 300ms |
