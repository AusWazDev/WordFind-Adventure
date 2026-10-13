import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import { Hand } from 'lucide-react';
import GameBoard from '@/components/game/GameBoard';
import TutorialWordList from '@/components/game/TutorialWordList';
import CoachMark, { useTargetRect } from '@/components/game/CoachMark';
import { unlockAudio, speakWordAudio, speakSentenceAudio, stopAllAudio } from '@/components/game/voiceUtils';
import { getSentence, hasSentence } from '@/components/game/trickySentences';
import { MODE_LABELS } from '@/lib/constants';
import { isNative } from '@/lib/platform';
import { prefersReducedMotion } from '@/lib/motion';
import { markTutorialDone } from '@/lib/tutorial';
import { useBackHandler } from '@/lib/backButton';
import { createPageUrl } from '@/utils';

// The guided first game (S43, SF-64). ISOLATED BY DESIGN: this page and everything it
// imports never reach offlineStorage, adCadence, hintLedger, purchases or admob, and its
// only storage write is wf_tutorial_done (tutorialIsolation.test.js, tutorial.test.jsx).

const cells = list => list.map(([row, col]) => ({ row, col }));
// A hand-written game in generateGame's shape. LAMB on row 1, KNIGHT on row 6, THUMB down
// column 6. (Also present by chance, and simply misses here: NIGHT inside KNIGHT, and PIE
// on a diagonal from row 3, column 1.)
export const TUTORIAL_GAME = {
  grid: ['LAMBET', 'SOCWRH', 'PEFDIU', 'RIVOLM', 'GYENAB', 'KNIGHT'].map(r => r.split('')),
  words: ['LAMB', 'KNIGHT', 'THUMB'],
  wordPositions: {
    LAMB: cells([[0, 0], [0, 1], [0, 2], [0, 3]]),
    KNIGHT: cells([[5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5]]),
    THUMB: cells([[0, 5], [1, 5], [2, 5], [3, 5], [4, 5]]),
  },
  gridSize: 6,
  bonusWord: null,
  bonusHint: null,
  bonusLetterPositions: null,
};
const MISS_ROW = cells([[1, 0], [1, 1], [1, 2], [1, 3]]); // S O C W: no word
const STEP_WORD = { 1: 'LAMB', 3: 'KNIGHT', 4: 'THUMB' };
export const FOUND_ADVANCE_MS = 1300;
export const MISS_ADVANCE_MS = 2000;
const FINISH = 5;

const cellSel = ({ row, col }) => `[data-row="${row}"][data-col="${col}"]`;
const sameCells = (a, b) => a.length === b.length && a.every(c => b.some(d => d.row === c.row && d.col === c.col));
// The voice setting, read directly: the tutorial must not import offlineStorage.
const audioSettings = () => {
  try { return { audio_voice: 'female', ...JSON.parse(localStorage.getItem('wf_settings') || '{}') }; } catch { return { audio_voice: 'female' }; }
};

export const MODE_LINES = [
  ['audio', 'Hear the word, find the spelling.'],
  ['standard', 'Classic word search. The word list is visible.'],
  ['anagram', 'Words are scrambled. Unscramble, then find.'],
  ['association', 'A clue is shown instead of the word. Find the match.'],
  ['mystery_word', 'Find every word, then tap the gold letters to spell the hidden bonus word.'],
];

// The drag hand for step 1: shown once per run, across LAMB; transform and opacity only.
function DragHand({ containerRef, run }) {
  const first = useTargetRect(containerRef, [cellSel(TUTORIAL_GAME.wordPositions.LAMB[0])]);
  const last = useTargetRect(containerRef, [cellSel(TUTORIAL_GAME.wordPositions.LAMB[3])]);
  if (!first || !last) return null;
  const x0 = (first.left + first.right) / 2, x1 = (last.left + last.right) / 2, y = (first.top + first.bottom) / 2;
  return (
    <motion.div
      key={run}
      data-testid="coach-hand"
      className="pointer-events-none absolute z-30 text-white drop-shadow"
      style={{ left: 0, top: 0 }}
      initial={{ x: x0, y, opacity: 0 }}
      animate={{ x: [x0, x0, x1, x1], y, opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.6, times: [0, 0.15, 0.85, 1] }}
    >
      <Hand className="w-8 h-8" />
    </motion.div>
  );
}

export default function Tutorial() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const firstRun = params.get('mode') !== 'replay';
  const pageRef = useRef(null);
  const timers = useRef([]);
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState('ask');   // 'ask' → 'next' (still waiting) → 'done' (moving on)
  const [found, setFound] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [hintCells, setHintCells] = useState([]);
  const [note, setNote] = useState(null);
  const [closeCall, setCloseCall] = useState(false); // NIGHT dragged in step 3 (SF-64b)
  const [handRun, setHandRun] = useState(0);
  const [reduced] = useState(prefersReducedMotion);

  const after = (ms, fn) => { timers.current.push(setTimeout(fn, ms)); };
  const goTo = n => { setStep(n); setPhase('ask'); setNote(null); setCloseCall(false); };
  // Leaving the page by any route stops audio and pending steps.
  useEffect(() => () => { timers.current.forEach(clearTimeout); stopAllAudio(); }, []);

  // Answers GameBoard as Game.jsx does: 'found', 'miss' or 'ignored' (SF-62).
  const handleWordFound = (letters, sel) => {
    setNote(null);
    setCloseCall(false);
    if (phase === 'done' || step === FINISH) return 'ignored';
    const upper = letters.toUpperCase();
    const reversed = [...upper].reverse().join('');
    const placed = Object.keys(TUTORIAL_GAME.wordPositions)
      .find(w => (w === upper || w === reversed) && sameCells(sel, TUTORIAL_GAME.wordPositions[w]));
    if (placed) {
      if (found.includes(placed)) return 'ignored';
      if (placed !== STEP_WORD[step]) {
        if (step === 1) setNote("That one's for later. Find LAMB first.");
        return 'ignored';
      }
      setFound(f => [...f, placed]);
      setHintCells([]);
      setPhase('done');
      after(FOUND_ADVANCE_MS, () => goTo(step + 1));
      return 'found';
    }
    if (found.some(w => w === upper || w === reversed)) return 'ignored';
    if (step === 2) { setPhase('done'); after(MISS_ADVANCE_MS, () => goTo(3)); }
    // Step 3 only: NIGHT (inside KNIGHT) is still a miss, with a nudge toward the silent K.
    if (step === 3 && (upper === 'NIGHT' || reversed === 'NIGHT')) setCloseCall(true);
    return 'miss';
  };

  // KNIGHT's speaker: the same path WordList uses in Audio Challenge (a tricky word plays
  // its sentence clip), with SF-60's retry and fallback inside voiceUtils.
  const play = async word => {
    await unlockAudio();
    const settings = audioSettings();
    if (hasSentence(word)) await speakSentenceAudio(word, getSentence(word), settings);
    else await speakWordAudio(word, settings);
  };
  const onPlay = word => {
    setCloseCall(false);
    if (step === 3 && phase === 'ask') setPhase('next');
    play(word);
  };
  const showWord = () => { setCloseCall(false); setRevealed(true); if (phase === 'ask') setPhase('next'); };
  const onHint = word => { // free: lights the first letter with the real hint style, spends nothing
    if (step !== 4 || phase !== 'ask' || word !== 'THUMB') return;
    setHintCells([TUTORIAL_GAME.wordPositions.THUMB[0]]);
    setPhase('next');
  };

  const leave = () => {
    timers.current.forEach(clearTimeout);
    markTutorialDone();
    stopAllAudio();
    // First run: Home starts the first puzzle through its own startLevel, so the tutorial
    // never touches the ad, progress or hint code. Replay: back to Home.
    if (firstRun) navigate(createPageUrl('Home'), { replace: true, state: { startFirstPuzzle: true } });
    else navigate(createPageUrl('Home'), { replace: true });
  };
  // Android Back (SF-65, rule e): as Skip (flag set, audio stopped), but in either mode it
  // goes to Home and never starts a game.
  useBackHandler('tutorial', () => {
    timers.current.forEach(clearTimeout);
    markTutorialDone();
    stopAllAudio();
    navigate(createPageUrl('Home'), { replace: true });
  });

  const coach = {
    1: { ask: { sel: TUTORIAL_GAME.wordPositions.LAMB.map(cellSel), heading: 'Find LAMB', body: 'Press on the first letter, drag through the word, then let go.', link: reduced ? null : 'Show me again', onLink: () => setHandRun(r => r + 1) },
         done: { sel: TUTORIAL_GAME.wordPositions.LAMB.map(cellSel), heading: 'Found LAMB!' } },
    2: { ask: { sel: MISS_ROW.map(cellSel), dashed: true, heading: "What if you're wrong?", body: "Drag across the dotted letters. They don't spell one of the words." },
         done: { sel: MISS_ROW.map(cellSel), dashed: true, heading: 'No penalty', body: "When it isn't one of the words, the letters shake. Just try again." } },
    3: { ask: { sel: ['[data-coach="word-play"]'], heading: 'Some words are hidden', body: "Tap the speaker to hear the word, then find how it's spelt.", link: "Can't hear? Show the word", onLink: showWord },
         next: { sel: ['[data-coach="word-play"]'], heading: 'Now find it on the board', body: 'Silent letters are the tricky part. Listen again any time.' },
         done: { sel: TUTORIAL_GAME.wordPositions.KNIGHT.map(cellSel), heading: 'Found KNIGHT!' } },
    4: { ask: { sel: ['[data-coach="word-hint"]'], heading: 'Stuck? Use a hint', body: "Tap the lightbulb. It lights up the first letter. This one's free." },
         next: { sel: [cellSel(TUTORIAL_GAME.wordPositions.THUMB[0])], heading: 'It starts here', body: 'In real games a hint uses one from your balance, and that word scores less.' },
         done: { sel: TUTORIAL_GAME.wordPositions.THUMB.map(cellSel), heading: 'Found THUMB!' } },
  }[step]?.[phase];
  // The step 3 close call (set only in step 3, cleared on every step change) replaces the
  // bubble's words only; the target and link stay.
  const coachShown = coach && closeCall
    ? { ...coach, heading: 'So close!', body: 'Listen again. This one starts with a silent letter.' }
    : coach;

  const skipButton = (
    <button type="button" onClick={leave} className="absolute top-0 right-0 z-40 min-h-[44px] px-3 text-sm font-semibold text-muted-foreground hover:text-foreground">
      Skip tutorial
    </button>
  );

  if (step === FINISH) {
    const earnLine = isNative(); // Android and iOS have both the rewarded ad and the hint packs
    return (
      <MotionConfig reducedMotion="user">
        <div className="max-w-md mx-auto px-4 py-6 space-y-4" style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
          <div>
            <h1 className="text-2xl font-bold text-foreground">You're ready to play</h1>
            <p className="text-sm text-muted-foreground mt-1">Every game is a word search with a twist. Pick one from the home screen:</p>
          </div>
          <ul className="bg-card rounded-2xl shadow-lg p-4 space-y-2">
            {MODE_LINES.map(([id, line]) => (
              <li key={id} className="text-sm"><span className="font-semibold text-foreground">{MODE_LABELS[id]}:</span> <span className="text-muted-foreground">{line}</span></li>
            ))}
          </ul>
          <div className="bg-card rounded-2xl shadow-lg p-4 space-y-2" data-testid="hints-box">
            <h2 className="font-semibold text-foreground">Hints</h2>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>You start with 12 free hints.</li>
              <li>Lightbulb on a word: lights up its first letter. That word scores 25% less.</li>
              <li>Lightbulb at the top: gives a hint on a random word.</li>
              <li>Eye (Audio Challenge and Word Association): shows the word. That word scores 50% less.</li>
              {earnLine && <li>Run out? Watch a short ad to earn one, or buy a hint pack.</li>}
            </ul>
          </div>
          <button
            type="button"
            onClick={leave}
            className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-500 to-indigo-600"
          >
            {firstRun ? 'Play your first puzzle' : 'Back to home'}
          </button>
          {firstRun && <p className="text-center text-xs text-muted-foreground">Replay this any time from Settings.</p>}
        </div>
      </MotionConfig>
    );
  }

  const list = [
    { word: 'LAMB', hidden: false, dimmed: false },
    { word: 'KNIGHT', hidden: !revealed, dimmed: step < 3, speaker: true },
    { word: 'THUMB', hidden: true, dimmed: step < 4, hint: true },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div ref={pageRef} className="relative max-w-md mx-auto px-4 pb-6 space-y-3" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))' }}>
        {skipButton}
        <div className="w-full aspect-square">
          <GameBoard
            grid={TUTORIAL_GAME.grid}
            gridSize={TUTORIAL_GAME.gridSize}
            foundWords={found.map(w => w.toLowerCase())}
            wordPositions={TUTORIAL_GAME.wordPositions}
            onWordFound={handleWordFound}
            hintCells={hintCells}
          />
        </div>
        {note && <p role="status" className="text-center text-sm font-medium text-amber-700 dark:text-amber-400">{note}</p>}
        <TutorialWordList words={list} foundWords={found} hintWord={hintCells.length ? 'THUMB' : null} onPlay={onPlay} onHint={onHint} />
        {coachShown && <CoachMark containerRef={pageRef} selectors={coachShown.sel} dashed={coachShown.dashed} heading={coachShown.heading} body={coachShown.body} link={coachShown.link} onLink={coachShown.onLink} />}
        {step === 1 && phase === 'ask' && !reduced && <DragHand containerRef={pageRef} run={handRun} />}
      </div>
    </MotionConfig>
  );
}
