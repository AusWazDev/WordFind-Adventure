# SoundFind

A word-finding puzzle game with multiple game modes, daily challenges, and audio-assisted play.

**Live:** https://word-find-adventure.vercel.app

## Game Modes

- **Standard** — classic grid-based word search; find all listed words in the grid
- **Audio Challenge** — words are spoken aloud via text-to-speech; find the spelling in the grid
- **Anagram Hunt** — words are shown scrambled; unscramble then find them
- **Word Association** — a hand-crafted clue is shown instead of the word; works fully offline
- **Mystery Word** — find all main words; the remaining letters spell a hidden bonus word

## Tech Stack

- **React 18** + **Vite 6**
- **Tailwind CSS** + **shadcn/ui** component library
- **React Router DOM v6** for navigation
- **Framer Motion** for animations
- **Web Speech API** for text-to-speech (Audio Challenge mode)
- **localStorage** — fully offline, no backend

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Install & Run

```bash
git clone https://github.com/AusWazDev/WordFind-Adventure.git
cd WordFind-Adventure
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Other Commands

```bash
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

## Features

- 5 game modes with shared grid/hint architecture
- 5 difficulty levels (Easy → Master), each increasing grid size and word count
- 13 word categories (Animals, Food, Space, Ocean, Tech, Sport, Music, Nature, Travel, Science, History, Movies, Tricky Audio Words)
- Daily Challenge with rotating puzzles
- Hint system — Lightbulb (first letter, −25% score) and Eye (full word reveal, −50% score)
- 12 free hints on first launch; earn more by watching ads or purchasing hint packs
- Interstitial ads skipped silently when offline
- Offline support — all modes work without internet (no backend required)
- PWA-ready — installable via "Add to Home Screen" on iOS/Android

## Project Docs

All planning and change management docs are in `docs/`:

- `docs/Launch Plan.md` — phase-by-phase roadmap (Phases 1–9)
- `docs/Change Register.md` — all CRs and defects with commit references
- `docs/Beta Tester Invite Message.md` — ready-to-send beta tester invite
