import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { loadProgress, updateProgress, getDailyRecord, saveDailyRecord } from '@/components/game/offlineStorage';
import GameBoard from '@/components/game/GameBoard';
import WordList from '@/components/game/WordList';
import AnagramWordList from '@/components/game/AnagramWordList';
import AssociationWordList from '@/components/game/AssociationWordList';
import HintModal from '@/components/game/HintModal';
import { generateGame, checkWord, calculateScore } from '@/components/game/gameUtils';
import { getDailyChallengeConfig, formatCountdown } from '@/components/game/DailyChallengeUtils';
import { toast, Toaster } from 'sonner';
import { Clock, Trophy, Star, Home, Gift, Flame } from 'lucide-react';

// ─── Orientation hook ──────────────────────────────────────────────────────────
function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(() => window.innerWidth > window.innerHeight);
  useEffect(() => {
    const update = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);
  return isLandscape;
}

// ─── Word list router ──────────────────────────────────────────────────────────
function WordListSwitch({ mode, gameData, foundWords, hintWord, revealedWords, onRevealWord, hintsRemaining }) {
  if (mode === 'anagram') {
    return <AnagramWordList words={gameData.words} foundWords={foundWords} hintWord={hintWord} />;
  }
  if (mode === 'association') {
    return (
      <AssociationWordList
        words={gameData.words} foundWords={foundWords} hintWord={hintWord}
        revealedWords={revealedWords} onRevealWord={onRevealWord} hintsRemaining={hintsRemaining}
      />
    );
  }
  // standard, audio, mystery_word all use the standard WordList
  return (
    <WordList
      words={gameData.words} foundWords={foundWords} isAudioMode={mode === 'audio'}
      revealedWords={revealedWords} onRevealWord={onRevealWord}
      hintsRemaining={hintsRemaining} hintWord={hintWord}
    />
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function DailyChallenge() {
  const navigate = useNavigate();
  const challenge = getDailyChallengeConfig();
  const { mode, category, level, time_limit, bonus_multiplier, reward_hints, title, date } = challenge;

  const [gameData, setGameData]           = useState(null);
  const [foundWords, setFoundWords]       = useState([]);
  const [revealedWords, setRevealedWords] = useState([]);
  const [score, setScore]                 = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(12);
  const [hintCells, setHintCells]         = useState([]);
  const [hintWord, setHintWord]           = useState(null);
  const [showHintModal, setShowHintModal] = useState(false);
  const [progress, setProgress]           = useState(null);
  const [timeLeft, setTimeLeft]           = useState(time_limit || null);
  const [timerActive, setTimerActive]     = useState(false);
  const [gameOver, setGameOver]           = useState(false);
  const [victory, setVictory]             = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const timerRef = useRef(null);

  // Stable refs for handleWordFound
  const gameDataRef    = useRef(null);
  const foundWordsRef  = useRef([]);
  const revealedWordsRef = useRef([]);
  useEffect(() => { gameDataRef.current = gameData; },       [gameData]);
  useEffect(() => { foundWordsRef.current = foundWords; },   [foundWords]);
  useEffect(() => { revealedWordsRef.current = revealedWords; }, [revealedWords]);

  // Board sizing — measured in JS for exact pixel values (same approach as Game.jsx)
  const boardAreaRef = useRef(null);
  const [boardSize, setBoardSize] = useState(0);
  const isLandscape = useOrientation();

  useEffect(() => {
    function measure() {
      if (!boardAreaRef.current) return;
      const rect = boardAreaRef.current.getBoundingClientRect();
      setBoardSize(Math.floor(Math.min(rect.width, rect.height)));
    }
    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 150);
    return () => { window.removeEventListener('resize', measure); clearTimeout(t); };
  }, [isLandscape, gameData]);

  useEffect(() => {
    initGame();
    loadProgressData();
    return () => clearInterval(timerRef.current);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!timerActive || !time_limit) return;
    const interval = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [timerActive, time_limit]);

  // Game-over detection
  useEffect(() => {
    if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      setGameOver(true);
    }
  }, [timeLeft, timerActive]);

  const loadProgressData = async () => {
    const p = await loadProgress();
    setProgress(p);
    setHintsRemaining(p.hints_remaining ?? 12);
    const daily = getDailyRecord(date);
    if (daily?.completed) setAlreadyCompleted(true);
  };

  const initGame = () => {
    const game = generateGame(level, category, mode === 'audio', mode === 'mystery_word');
    setGameData(game);
    setFoundWords([]);
    setRevealedWords([]);
    setHintCells([]);
    setHintWord(null);
    setScore(0);
    setVictory(false);
    setGameOver(false);
    if (time_limit) {
      setTimeLeft(time_limit);
      setTimerActive(true);
    }
  };

  const handleWordFound = useCallback((selectedWord) => {
    const currentGame  = gameDataRef.current;
    const currentFound = foundWordsRef.current;
    if (!currentGame || gameOver || victory) return;

    const foundWord = checkWord(selectedWord, currentGame.words, currentFound);
    if (foundWord) {
      const newFoundWords = [...currentFound, foundWord];
      setFoundWords(newFoundWords);

      const wasRevealed = revealedWordsRef.current.includes(foundWord);
      const rawScore    = calculateScore(foundWord, level, mode === 'audio');
      const wordScore   = Math.round(rawScore * (wasRevealed ? 0.5 : 1.0) * bonus_multiplier);
      setScore(prev => prev + wordScore);

      const bonusNote = bonus_multiplier > 1 ? ` (${bonus_multiplier}× bonus)` : '';
      toast.success(`+${wordScore} pts!${bonusNote}`, { description: `Found: ${foundWord.toUpperCase()}` });

      if (newFoundWords.length === currentGame.words.length) {
        triggerVictory(newFoundWords.length);
      }
    }
  }, [level, mode, bonus_multiplier, gameOver, victory]);

  const triggerVictory = async (wordsFoundCount) => {
    setTimerActive(false);
    clearInterval(timerRef.current);
    setVictory(true);

    if (progress) {
      const updated = await updateProgress(null, progress, {
        total_score:      (progress.total_score || 0) + score,
        games_played:     (progress.games_played || 0) + 1,
        words_found:      (progress.words_found || 0) + wordsFoundCount,
        hints_remaining:  (progress.hints_remaining ?? 12) + reward_hints,
      });
      setProgress(updated);
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const prevDay    = getDailyRecord(yesterday.toISOString().slice(0, 10));
    const prevStreak = prevDay?.completed ? (prevDay.streak || 1) : 0;
    saveDailyRecord(date, {
      completed: true, score, words_found: wordsFoundCount,
      total_words:  gameDataRef.current?.words.length,
      time_taken:   time_limit ? time_limit - (timeLeft ?? 0) : 0,
      streak:       prevStreak + 1,
    });
  };

  const handleUseHint = () => {
    if (hintsRemaining <= 0) { setShowHintModal(true); return; }
    if (!gameData) return;
    const unfound = gameData.words.filter(w => !foundWords.includes(w.toLowerCase()));
    if (!unfound.length) return;
    const word      = unfound[Math.floor(Math.random() * unfound.length)];
    const positions = gameData.wordPositions[word.toUpperCase()];
    const newHints  = hintsRemaining - 1;
    setHintsRemaining(newHints);
    if (progress) updateProgress(null, progress, { hints_remaining: newHints }).catch(console.error);
    if (positions?.length) {
      setHintCells([positions[0]]);
      setHintWord(word.toLowerCase());
      setTimeout(() => { setHintCells([]); setHintWord(null); }, 4000);
    } else {
      setHintWord(word.toLowerCase());
      setTimeout(() => setHintWord(null), 4000);
    }
  };

  const handleRevealWord = (word) => {
    if (hintsRemaining <= 0) { setShowHintModal(true); return; }
    setRevealedWords(prev => [...prev, word]);
    const newHints = hintsRemaining - 1;
    setHintsRemaining(newHints);
    if (progress) updateProgress(null, progress, { hints_remaining: newHints }).catch(console.error);
    toast.info(`Revealed: ${word}`);
  };

  const handleWatchAd = () => {
    const newHints = hintsRemaining + 1;
    setHintsRemaining(newHints);
    setShowHintModal(false);
    toast.success('You earned 1 hint!');
    if (progress) updateProgress(null, progress, { hints_remaining: newHints });
  };

  const handlePurchase = (amount) => {
    const newHints = hintsRemaining + amount;
    setHintsRemaining(newHints);
    setShowHintModal(false);
    toast.success(`Purchased ${amount} hints!`);
    if (progress) updateProgress(null, progress, { hints_remaining: newHints });
  };

  if (!gameData) {
    return (
      <div style={{ width: '100vw', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 48, height: 48, border: '4px solid #f59e0b', borderTopColor: 'transparent', borderRadius: '50%' }}
        />
      </div>
    );
  }

  const PAD       = 12;
  const GAP       = 8;
  const SIDEBAR_W = 260;
  const timerUrgent = time_limit && timeLeft !== null && timeLeft <= 30;

  const wordListProps = { mode, gameData, foundWords, hintWord, revealedWords, onRevealWord: handleRevealWord, hintsRemaining };

  const boardProps = {
    grid: gameData.grid,
    foundWords,
    wordPositions: gameData.wordPositions,
    onWordFound: handleWordFound,
    gridSize: gameData.gridSize,
    hintCells,
    isLandscape,
  };

  // ── Header ─────────────────────────────────────────────────────────────────
  const headerEl = (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <button
        onClick={() => navigate(createPageUrl('Home'))}
        style={{ display: 'flex', alignItems: 'center', gap: 4, minHeight: 36, padding: '4px 2px', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
      >
        <Home style={{ width: 16, height: 16 }} /> Home
      </button>
      <div style={{ textAlign: 'center', flex: 1 }}>
        <p style={{ fontSize: 10, color: '#d97706', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
          Daily Challenge
        </p>
        <h1 style={{ fontSize: 15, fontWeight: 800, color: 'var(--foreground)', margin: 0, lineHeight: 1.2 }}>
          {title}
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--card)', border: '1px solid rgba(245,158,11,0.3)', padding: '5px 10px', borderRadius: 12, flexShrink: 0 }}>
        <Trophy style={{ width: 14, height: 14, color: '#f59e0b' }} />
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--foreground)' }}>{score}</span>
      </div>
    </div>
  );

  // ── Progress + timer row ────────────────────────────────────────────────────
  const infoBarEl = (
    <div style={{ flexShrink: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{ flex: 1, background: 'var(--card)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 16, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
          {foundWords.length}/{gameData.words.length} words
        </span>
        <div style={{ flex: 1, background: 'rgba(245,158,11,0.15)', borderRadius: 99, height: 6 }}>
          <motion.div
            style={{ height: 6, borderRadius: 99, background: 'linear-gradient(90deg,#f59e0b,#ef4444)' }}
            animate={{ width: `${(foundWords.length / gameData.words.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200 }}
          />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#b45309', whiteSpace: 'nowrap' }}>
          {Math.round((foundWords.length / gameData.words.length) * 100)}%
        </span>
      </div>
      {time_limit > 0 && (
        <div style={{
          background:   timerUrgent ? 'rgba(239,68,68,0.1)' : 'var(--card)',
          border:       timerUrgent ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(245,158,11,0.25)',
          borderRadius: 16, padding: '6px 10px',
          display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
        }}>
          <Clock style={{ width: 14, height: 14, color: timerUrgent ? '#ef4444' : '#f59e0b' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: timerUrgent ? '#ef4444' : 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}>
            {formatCountdown(timeLeft ?? time_limit)}
          </span>
        </div>
      )}
    </div>
  );

  // ── Hint + bonus bar ────────────────────────────────────────────────────────
  const hintBarEl = (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
      <button
        onClick={handleUseHint}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#7c3aed', fontWeight: 600, minHeight: 36, padding: '4px 2px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        💡 Hint ({hintsRemaining})
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: 99 }}>
        <Star style={{ width: 12, height: 12, color: '#f59e0b' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#b45309' }}>{bonus_multiplier}× Bonus Active</span>
      </div>
    </div>
  );

  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', background: 'var(--background)' }}>
      <Toaster position="top-center" richColors />

      {isLandscape ? (
        // LANDSCAPE: header + info bar stacked at top, board + word list side by side
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: PAD, gap: GAP, boxSizing: 'border-box' }}>
          {headerEl}
          {infoBarEl}
          <div
            ref={boardAreaRef}
            style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: GAP, minHeight: 0, overflow: 'hidden' }}
          >
            {boardSize > 0 && (
              <div style={{ width: boardSize, height: boardSize, flexShrink: 0 }}>
                <GameBoard {...boardProps} />
              </div>
            )}
            {boardSize > 0 && (
              <div style={{ width: SIDEBAR_W, height: boardSize, flexShrink: 0, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'thin' }}>
                {hintBarEl}
                <WordListSwitch {...wordListProps} />
              </div>
            )}
          </div>
        </div>
      ) : (
        // PORTRAIT: header, info bar, board (capped), hint bar, scrollable word list
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: PAD, gap: GAP, boxSizing: 'border-box', overflow: 'hidden' }}>
          {headerEl}
          {infoBarEl}
          <div
            ref={boardAreaRef}
            style={{ flexShrink: 0, width: '100%', maxHeight: 'min(52dvh, 100vw)', aspectRatio: '1 / 1', overflow: 'hidden' }}
          >
            {boardSize > 0 && (
              <div style={{ width: boardSize, height: boardSize }}>
                <GameBoard {...boardProps} />
              </div>
            )}
          </div>
          {hintBarEl}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '0.5rem' }}>
            <WordListSwitch {...wordListProps} />
          </div>
        </div>
      )}

      <HintModal
        isOpen={showHintModal}
        onClose={() => setShowHintModal(false)}
        onWatchAd={handleWatchAd}
        onPurchase={handlePurchase}
      />

      {/* Victory overlay */}
      {victory && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }}
            className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Challenge Complete!</h2>
            <p className="text-muted-foreground text-sm mb-6">{title}</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-2xl p-3">
                <p className="text-2xl font-bold text-amber-600">{score}</p>
                <p className="text-xs text-muted-foreground">Total Points</p>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl p-3">
                <p className="text-2xl font-bold text-emerald-600">{foundWords.length}/{gameData.words.length}</p>
                <p className="text-xs text-muted-foreground">Words Found</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 bg-violet-100 dark:bg-violet-900/30 rounded-2xl p-3 mb-6">
              <Gift className="w-5 h-5 text-violet-500" />
              <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                +{reward_hints} hints added to your account!
              </span>
            </div>
            <button
              onClick={() => navigate(createPageUrl('Home'))}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg min-h-[44px]"
            >
              <Home className="w-4 h-4" /> Back to Home
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Game Over (time ran out) */}
      {gameOver && !victory && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Time's Up!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              You found {foundWords.length} of {gameData.words.length} words
            </p>
            <div className="bg-muted rounded-2xl p-3 mb-6">
              <p className="text-2xl font-bold text-foreground">{score}</p>
              <p className="text-xs text-muted-foreground">Points Earned</p>
            </div>
            <div className="flex gap-3">
              <button onClick={initGame}
                className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold py-3 rounded-2xl min-h-[44px]">
                Try Again
              </button>
              <button onClick={() => navigate(createPageUrl('Home'))}
                className="flex-1 bg-muted text-foreground font-bold py-3 rounded-2xl flex items-center justify-center gap-1 min-h-[44px]">
                <Home className="w-4 h-4" /> Home
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Already completed notice */}
      {alreadyCompleted && !victory && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-medium z-40">
          <Flame className="w-4 h-4" /> You already completed today's challenge — playing for fun!
        </motion.div>
      )}
    </div>
  );
}
