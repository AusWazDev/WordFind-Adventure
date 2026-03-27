# SoundFind — Project Status

## Overview
A word-finding game app (formerly "WordFind Adventure") rebranded to **SoundFind**.
Tagline: *Hear it. Find it.*
GitHub: https://github.com/AusWazDev/WordFind-Adventure

## Tech Stack
- React 18 + Vite 6
- Tailwind CSS + shadcn/ui component library
- Framer Motion (animations)
- React Router DOM v6
- Web Speech API (TTS for Audio mode)
- localStorage only — fully decoupled from Base44
- canvas-confetti (victory screen)

## Project Structure
- `src/pages/` — Home, Game, DailyChallenge, Leaderboard, Stats, Settings
- `src/components/game/` — GameBoard, GameHeader, WordList, VictoryModal, HintModal, RemoveAdsModal, voiceUtils, gameUtils, offlineStorage, trickySentences, etc.
- `src/components/ui/` — shadcn/ui base components
- `src/utils/index.js` — createPageUrl() helper

## Game Modes
- **Standard** — classic word find
- **Audio** — words are spoken, grid labels hidden until revealed
- **Anagram** — unscramble words
- **Association** — theme-linked words
- **Spelling Bee** — free-form letter set
- **Tricky Sentences** — spot hidden words in sentences

## Difficulty Levels
| Level | Grid | Words | Notes |
|-------|------|-------|-------|
| 1 Easy | 8×8 | 6 | Standard |
| 2 Medium | 10×10 | 10 | Standard |
| 3 Hard | 12×12 | 15 | Standard |
| 4 Expert | 15×15 | 20 | Standard |
| 5 Master | 15×15 | 25 | Dense crossword placement + bonus word |

## Master Level — Bonus Word Mechanic
After all 25 words are found, a bonus hunt activates:
- The bonus word letters occupy the **first N empty cells in reading order** (left→right, top→bottom) after all list words are placed
- During bonus hunt those cells glow gold/amber in the grid
- Player reads the gold letters, types the word into a text input and submits
- Correct → word_length × 50 bonus points; wrong → error toast (unlimited tries)
- Header hint button flashes the first gold cell
- Skip button available to go straight to victory

## Audio Mode — Word List Buttons
Each unfound word shows 3 buttons (left to right):
1. 🔊 **Speaker** (violet) — plays the word aloud, free
2. 👁️ **Eye** (amber) — reveals word text, costs 1 hint
3. 💡 **Lightbulb** (green) — flashes first letter on grid, costs 1 hint
When hints = 0, Eye and Lightbulb open the hint purchase/watch-ad modal.

## Monetisation (planned)
- **Ads** — banner/interstitial (AdMob — placeholder Unsplash images currently)
- **Remove Ads** — $2.99 one-time IAP (RevenueCat — alert() placeholder currently)
- **Hint packs** — purchase extra hints (RevenueCat — alert() placeholder currently)

## Multi-platform (planned)
- Capacitor for iOS / Android / Windows / Mac builds
- Target stores: App Store, Google Play, Microsoft Store

## Session Log

### 2026-03-27 (Mac — Cowork setup session)
- Connected project to Cowork on Mac via GitHub clone
- Set up STATUS.md for cross-device continuity
- Repo cloned to ~/WordFind-Adventure on Mac
- Rewrote README.md — removed all Base44 references, added accurate project description
- Removed TypeScript dead code: @types packages, typescript dep, typecheck script, converted utils/index.ts → .js
- Fixed RemoveAdsModal crash: added missing `success` setter and `purchasing` state vars
- Confirmed monetisation strategy: ads + hint purchases, targeting web + Windows/Apple/Google stores
- Agreed tech path: Capacitor for multi-platform, RevenueCat for purchases, AdMob for ads (future milestone)
- Git push method on education network: SSH over port 443 (ssh://git@ssh.github.com:443/...)

### 2026-03-27 (Windows — Cowork session, continued from prior context)
- Rebranded app: WordFind Adventure → SoundFind ("Hear it. Find it.")
- Removed all Base44 dependencies (18 packages), simplified App.jsx
- Fixed 7 critical bugs: timer split effect, race condition in level nav, async errors, localStorage quota
- Fixed duplicate words bug (Fisher-Yates shuffle, Set() deduplication)
- Improved TTS voice quality (Google voice priority, Desktop SAPI penalty, lowercase spoken words)
- Added Master level (level 5): dense crossword placement, 25 words, Skull icon, col-span-2 card
- Added bonus hidden word mechanic for Master level (reading-order letter placement)
- Added 3-button audio word list: Speaker → Eye → Lightbulb (fixed disabled/modal bug)
- Fixed hint button during bonus hunt (flashes first gold cell)
- Fixed VictoryModal: level 5 "Master" label, Next Level cap, bonus result display

## Next Steps
- [ ] Test bonus word mechanic end-to-end in browser (Master level)
- [ ] Test audio mode 3-button layout and hint modal behaviour
- [ ] Plan and begin Capacitor integration for multi-platform builds
- [ ] Connect RevenueCat SDK (replace alert() in HintModal + RemoveAdsModal)
- [ ] Connect AdMob (replace Unsplash placeholder ads in AdModal + HintModal AdPlayer)
- [ ] Update domain: uniquegames.com.au → point to HostGator once DNS propagates
- [ ] First production deployment to HostGator (npm run build → upload dist/)
