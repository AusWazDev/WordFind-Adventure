import React, { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import GameBoard from '@/components/game/GameBoard';
import { unlockAudio, speakWordAudio, preloadGameAudio, stopAllAudio } from '@/components/game/voiceUtils';
import { getLocalSettings } from '@/components/game/offlineStorage';
import { isNative } from '@/lib/platform';
import { isElectronPage } from '@/lib/staleServiceWorkers';
import { prefersReducedMotion } from '@/lib/motion';
import { markWelcomeSeen } from '@/lib/welcome';
import { markTutorialDone } from '@/lib/tutorial';

// Kept for existing imports; the logic lives in src/lib/welcome.js (SF-63).
export { hasSeenWelcome, markWelcomeSeen } from '@/lib/welcome';

// ── The demo board (S42, SF-63) ────────────────────────────────────────────
// KNIGHT along row 2; the filler is consonant-heavy so no row, column or diagonal
// spells an obvious second word.
export const DEMO_WORD = 'KNIGHT';
export const DEMO_GRID = [
  ['B', 'Q', 'X', 'P', 'V', 'Z'],
  ['J', 'W', 'F', 'Y', 'Q', 'B'],
  ['K', 'N', 'I', 'G', 'H', 'T'],
  ['Z', 'D', 'Q', 'X', 'V', 'J'],
  ['F', 'P', 'Y', 'B', 'W', 'Q'],
  ['X', 'V', 'J', 'Z', 'P', 'D'],
];
export const DEMO_CELLS = DEMO_WORD.split('').map((_, col) => ({ row: 2, col }));
export const DEMO_STEP_MS = 140;
const DEMO_POSITIONS = { [DEMO_WORD]: DEMO_CELLS };

// Highlights KNIGHT's cells one at a time, then shows the word found. Plays once per
// call; under reduced motion it shows the found state at once.
function useDemo() {
  const [selected, setSelected] = useState([]);
  const [found, setFound] = useState([]);
  const timers = useRef([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const play = () => {
    clear();
    setSelected([]);
    if (prefersReducedMotion()) { setFound([DEMO_WORD.toLowerCase()]); return; }
    setFound([]);
    DEMO_CELLS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setSelected(DEMO_CELLS.slice(0, i + 1)), DEMO_STEP_MS * (i + 1)));
    });
    timers.current.push(setTimeout(() => { setSelected([]); setFound([DEMO_WORD.toLowerCase()]); }, DEMO_STEP_MS * (DEMO_CELLS.length + 1)));
  };

  useEffect(() => { play(); return clear; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return { selected, found, replay: play };
}

// The welcome (S42, SF-63). Home renders it INSTEAD of its own content while it is due
// (src/lib/welcome.js), and Layout leaves out the blurred bottom nav meanwhile.
export default function WelcomeScreen({ onShowMeHow, onSkip }) {
  const demo = useDemo();
  // The same helpers the mode picker uses (GameModeSelector): the web build alone
  // fetches some audio over the network; native and Electron bundle it all.
  const offlineChip = !isNative() && !isElectronPage() ? 'Most modes work offline' : 'Works offline';

  useEffect(() => { preloadGameAudio([DEMO_WORD], getLocalSettings()); }, []);

  // The same steps as WordList's speaker: unlock inside the tap, then the shared play path.
  const hearIt = async () => {
    await unlockAudio();
    await speakWordAudio(DEMO_WORD, getLocalSettings());
  };
  // skipsTutorial: "Skip, just play" also marks the tutorial done (SF-64b), so Home's resume
  // rule does not send this player to it while their first game is still unfinished.
  const close = (next, skipsTutorial = false) => () => {
    stopAllAudio();
    markWelcomeSeen();
    if (skipsTutorial) markTutorialDone();
    next();
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative w-full flex flex-col items-center justify-center px-6"
        style={{
          minHeight: '100dvh',
          background: 'linear-gradient(160deg, #0f0e1a 0%, #1a1830 100%)',
          paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <motion.div className="text-center" initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
            <h1 className="text-5xl font-black text-white tracking-tight leading-none">
              Sound<span className="text-violet-400">Find</span>
            </h1>
            <p className="text-white/60 text-sm mt-2 font-medium">Hear the word. Find the spelling.</p>
          </motion.div>

          {/* The demo board: not touchable as a game; a tap replays the demo. */}
          <motion.button
            type="button"
            onClick={demo.replay}
            aria-label="Replay the demo"
            data-testid="welcome-demo"
            className="w-60 h-60 rounded-2xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <GameBoard
              grid={DEMO_GRID}
              gridSize={6}
              foundWords={demo.found}
              wordPositions={DEMO_POSITIONS}
              onWordFound={() => 'ignored'}
              interactive={false}
              selectedCells={demo.selected}
            />
          </motion.button>

          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={hearIt}
              aria-label="Hear the word KNIGHT"
              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition-colors"
            >
              <Volume2 className="w-4 h-4" /> Hear it
            </button>
            <p className="text-white/50 text-xs">Silent K, silent GH.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {['5 game modes', 'Natural voices', offlineChip].map(chip => (
              <span key={chip} className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">{chip}</span>
            ))}
          </div>

          <div className="w-full space-y-2">
            <motion.button
              type="button"
              onClick={close(onShowMeHow)}
              className="w-full flex items-center justify-center py-4 rounded-2xl font-black text-base text-white shadow-xl shadow-violet-900/40"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
              whileTap={{ scale: 0.97 }}
            >
              Show me how
            </motion.button>
            <button
              type="button"
              onClick={close(onSkip, true)}
              className="w-full py-3 min-h-[44px] text-sm font-semibold text-white/70 hover:text-white transition-colors"
            >
              Skip, just play
            </button>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
