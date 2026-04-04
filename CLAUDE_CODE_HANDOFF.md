# SoundFind — Claude Code Handoff

> This file is for Claude Code sessions. Read this first before making any changes.
> Keep it updated as work progresses. Companion to STATUS.md and docs/Change Register.md.

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

## Current State (as of last Cowork session — 3 Apr 2026)

### Recently completed
| CR/DEF | What | Commit |
|--------|------|--------|
| CR-18 | App icon — 1024px master PNG designed and exported | `83db442` |
| CR-19 | Splash screen mockup approved | `48501a2` |
| CR-20 | Splash screen implemented in app (`SplashScreen.jsx`) | `4b4c408` |
| DEF-22 | Splash screen flashed Home before covering it — fixed | `82778c0` |
| DEF-23 | Settings reset was restoring 12 free hints — fixed | `dc87dcd` |
| CR-21 | Brand alignment: dark theme + new icon on Welcome, HowToPlay, Home header | `dc87dcd` + `1e09959` |

### What to verify on device
- Splash screen: dark background appears instantly, icon + name fade in, transitions to Home after ~2.7s
- Home header: shows `icon.png` (40px) left of "SoundFind", not Volume2 speaker
- Welcome screen: dark near-black background, `icon.png` centred above "SoundFind", "Find" in violet
- HowToPlay: Audio Challenge header is teal/indigo, not amber/orange
- Settings reset: after reset, hint count stays the same, `ads_removed` preserved

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
- `src/components/game/voiceUtils.jsx` — TTS voice selection for Audio Challenge

### Assets
- `public/icon.png` — 1024px master icon (used in splash, home header, welcome screen, favicon)
- `docs/icon/icon-mockup.html` — Interactive icon design tool
- `docs/icon/splash-mockup.html` — Interactive splash design tool
- `docs/icon/soundfind-icon-d.png` — Source icon PNG

### Docs
- `docs/Change Register.md` — Every CR and DEF with commit hashes
- `docs/Traceability.md` — File dependency map + "also check when changed" rules
- `STATUS.md` — Session log + next steps list
- `CLAUDE_CODE_HANDOFF.md` — This file

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

## Roadmap — What's Next

Priority order from STATUS.md:

1. **Beta testing** — responses in Google Sheet, review and triage defects
2. **HintModal stub** — testers hitting zero hints see an `alert()`. Needs a proper "coming soon" state rather than a raw alert before public launch
3. **PWA manifest + service worker** — `vite-plugin-pwa` setup for installability
4. **Capacitor** — iOS/Android native build setup
5. **RevenueCat SDK** — real IAP wiring (remove-ads + hint packs)
6. **Real AdMob** — replace Unsplash placeholder interstitial
7. **Privacy Policy page** — required for App Store submission, host on uniquegames.com.au
8. **Analytics** — PostHog + Sentry before public launch

---

## Known Issues / Watch Points

- `HintModal.jsx` — `alert()` stub on IAP purchase. Fine for beta but must be replaced before launch
- Vercel deployment — SPA rewrites in `vercel.json` handle React Router; don't remove
- Audio Challenge voice — iOS gets Karen (Enhanced) automatically; Mac quality depends on installed voices (DEF-12, no code fix needed)
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
