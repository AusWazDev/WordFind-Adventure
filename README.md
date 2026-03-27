# WordFind Adventure

A word-finding puzzle game with multiple game modes, daily challenges, leaderboards, and audio-assisted play.

## Game Modes

- **Word Find** — classic grid-based word search
- **Anagram** — unscramble letters to find words
- **Association** — find words linked by a common theme
- **Spelling Bee** — make as many words as possible from a set of letters
- **Tricky Sentences** — spot the hidden words in sentences
- **Master Level** — advanced challenge with a bonus hidden word built from remaining letters

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** + **shadcn/ui** component library
- **React Router** for navigation
- **Framer Motion** for animations
- **Recharts** for stats visualisation
- **Local storage** for offline progress & settings

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

- Multiple difficulty levels (1–5, including Master)
- Daily Challenge mode with shared puzzles
- Leaderboard & personal stats tracking
- Audio mode with voice assistance
- Hint system with eye, speaker & lightbulb controls
- Offline support via local storage
- Pull-to-refresh on mobile
