# WordFind Adventure — Project Status

## Overview
A word-finding game app built with React + Vite, hosted on Base44.
GitHub: https://github.com/AusWazDev/WordFind-Adventure

## Tech Stack
- React (JSX) + Vite
- Tailwind CSS
- shadcn/ui component library
- Base44 backend platform

## Project Structure
- `src/pages/` — main pages: Home, Game, DailyChallenge, Leaderboard, Stats, Settings
- `src/components/game/` — core game components (GameBoard, GameHeader, VictoryModal, HintModal, etc.)
- `src/components/ui/` — shadcn/ui base components
- `src/lib/` — auth context, app params, utilities

## Game Modes
Based on component files: Anagram, Association, Spelling Bee, Word Find, Tricky Sentences

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

## Next Steps
- [ ] Push latest commits from Mac terminal: `cd ~/WordFind-Adventure && git push`
- [ ] Plan and begin Capacitor integration for multi-platform builds
- [ ] Connect RevenueCat SDK (replace alert() placeholders in HintModal + RemoveAdsModal)
- [ ] Connect AdMob (replace Unsplash placeholder ads in AdModal + HintModal AdPlayer)
