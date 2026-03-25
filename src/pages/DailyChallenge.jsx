import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { loadProgress, updateProgress, getDailyRecord, saveDailyRecord } from '@/components/game/offlineStorage';
import GameBoard from '@/components/game/GameBoard';
import WordList from '@/components/game/WordList';
import AnagramWordList from '@/components/game/AnagramWordList';
import AssociationWordList from '@/components/game/AssociationWordList';
import SpellingBeeWordList from '@/components/game/SpellingBeeWordList';
import HintModal from '@/components/game/HintModal';
import { generateGame, checkWord, calculateScore } from '@/components/game/gameUtils';
import { getDailyChallengeConfig, formatCountdown } from '@/components/game/DailyChallengeUtils';
import { toast, Toaster } from 'sonner';
import { Clock, Trophy, Star, Home, ChevronRight, Flame, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DailyChallenge() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const challenge = getDailyChallengeConfig();
  const { mode, category, level, time_limit, bonus_multiplier, reward_hints, title, date } = challenge;

  const [gameData, setGameData] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [revealedWords, setRevealedWords] = useState([]);
  const [score, setScore] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [hintCell, setHintCell] = useState(null);
  const [hintWord, setHintWord] = useState(null);
  const [showHintModal, setShowHintModal] = useState(false);
  const [progress, setProgress] = useState(null);
  const [timeLeft, setTimeLeft] = useState(time_limit || null);
  const [timerActive, setTimerActive] = useState(false);
  const [gameOver, setGameOver] = useState(false); // time ran out
  const [victory, setVictory] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    initGame();
    loadProgressData();
    return () => clearInterval(timerRef.current);
  }, []);

  // Timer countdown — only restarts when timerActive toggles on
  useEffect(() => {
    if (!timerActive || !time_limit) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [timerActive, time_limit]);

  // Game-over detection — separate from countdown to avoid nested setState calls
  useEffect(() => {
    if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      setGameOver(true);
    }
  }, [timeLeft, timerActive]);

  const loadProgressData = async () => {
    const p = await loadProgress();
    setProgress(p);
    setHintsRemaining(p.hints_remaining || 3);
    const daily = getDailyRecord(date);
    if (daily?.completed) setAlreadyCompleted(true);
  };

  const initGame = () => {
    const game = generateGame(level, category, mode === 'audio');
    setGameData(game);
    setFoundWords([]);
    setRevealedWords([]);
    setScore(0);
    setVictory(false);
    setGameOver(false);
    if (time_limit) {
      setTimeLeft(time_limit);
      setTimerActive(true);
    }
  };

  const handleWordFound = useCallback((selectedWord, cells) => {
    if (!gameData || gameOver || victory) return;
    const foundWord = checkWord(selectedWord, gameData.words, foundWords);
    if (foundWord) {
      const newFoundWords = [...foundWords, foundWord];
      setFoundWords(newFoundWords);
      const wordScore = Math.round(calculateScore(foundWord.length, level, mode === 'audio') * bonus_multiplier);
      setScore(prev => prev + wordScore);
      toast.success(`+${wordScore} pts! (${bonus_multiplier}× bonus)`, { description: `Found: ${foundWord.toUpperCase()}` });
      if (newFoundWords.length === gameData.words.length) {
        triggerVictory(newFoundWords.length);
      }
    }
  }, [gameData, foundWords, level, mode, bonus_multiplier, gameOver, victory]);

  const triggerVictory = async (wordsFoundCount) => {
    setTimerActive(false);
    clearInterval(timerRef.current);
    setVictory(true);

    // Award hints & update progress
    if (progress) {
      const updated = await updateProgress(null, progress, {
        total_score: (progress.total_score || 0) + score,
        games_played: (progress.games_played || 0) + 1,
        words_found: (progress.words_found || 0) + wordsFoundCount,
        hints_remaining: (progress.hints_remaining || 3) + reward_hints,
      });
      setProgress(updated);
    }

    // Calculate streak from yesterday's daily record
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    const prevDay = getDailyRecord(yStr);
    const prevStreak = prevDay?.completed ? (prevDay.streak || 1) : 0;
    const newStreak = prevStreak + 1;

    saveDailyRecord(date, {
      completed: true, score, words_found: wordsFoundCount,
      total_words: gameData.words.length,
      time_taken: time_limit ? time_limit - timeLeft : 0,
      streak: newStreak,
    });
  };

  const handleUseHint = () => {
    if (hintsRemaining <= 0) { setShowHintModal(true); return; }
    if (!gameData) return;
    const unfound = gameData.words.filter(w => !foundWords.includes(w.toLowerCase()));
    if (!unfound.length) return;
    const word = unfound[Math.floor(Math.random() * unfound.length)];
    const positions = gameData.wordPositions[word.toUpperCase()];
    if (positions?.length) {
      setHintCell(positions[0]);
      setHintWord(word.toLowerCase());
      setTimeout(() => { setHintCell(null); setHintWord(null); }, 4000);
    } else {
      setHintWord(word.toLowerCase());
      setTimeout(() => setHintWord(null), 4000);
    }
    setHintsRemaining(prev => prev - 1);
    if (progress) updateProgress(null, progress, { hints_remaining: hintsRemaining - 1 }).catch(console.error);
  };

  const handleRevealWord = (word) => {
    if (hintsRemaining <= 0) { setShowHintModal(true); return; }
    setRevealedWords(prev => [...prev, word]);
    setHintsRemaining(prev => prev - 1);
    if (progress) updateProgress(null, progress, { hints_remaining: hintsRemaining - 1 }).catch(console.error);
    toast.info(`Revealed: ${word}`);
  };

  const handleWatchAd = () => {
    setHintsRemaining(prev => prev + 1);
    setShowHintModal(false);
    toast.success('You earned 1 hint!');
  };

  const handlePurchase = (amount) => {
    setHintsRemaining(prev => prev + amount);
    setShowHintModal(false);
    toast.success(`Purchased ${amount} hints!`);
  };

  const timerUrgent = time_limit && timeLeft !== null && timeLeft <= 30;

  if (!gameData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Toaster position="top-center" richColors />
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(createPageUrl('Home'))}
            className="flex items-center gap-1.5 min-h-[44px] px-2 text-muted-foreground hover:text-foreground transition-colors">
            <Home className="w-4 h-4" /> <span className="text-sm">Home</span>
          </button>
          <div className="text-center">
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Daily Challenge</p>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-amber-200 px-3 py-1.5 rounded-xl">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-foreground">{score}</span>
          </div>
        </div>

        {/* Timer bar */}
        {time_limit > 0 && (
          <motion.div
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-2xl font-bold text-lg",
              timerUrgent ? "bg-red-100 border-2 border-red-400 text-red-600" : "bg-card border border-amber-200 text-foreground"
            )}
            animate={timerUrgent ? { scale: [1, 1.02, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            <Clock className={cn("w-5 h-5", timerUrgent ? "text-red-500" : "text-amber-500")} />
            {formatCountdown(timeLeft ?? time_limit)}
          </motion.div>
        )}

        {/* Progress bar */}
        <div className="bg-card rounded-2xl px-4 py-2 border border-amber-200 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{foundWords.length}/{gameData.words.length} words</span>
          <div className="flex-1 bg-amber-100 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
              animate={{ width: `${(foundWords.length / gameData.words.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 200 }}
            />
          </div>
          <span className="text-xs font-bold text-amber-600">{Math.round((foundWords.length / gameData.words.length) * 100)}%</span>
        </div>

        <GameBoard
          grid={gameData.grid}
          foundWords={foundWords}
          wordPositions={gameData.wordPositions}
          onWordFound={handleWordFound}
          gridSize={gameData.gridSize}
          hintCell={hintCell}
        />

        <div className="flex items-center justify-between px-1">
          <button onClick={handleUseHint}
            className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300 font-medium min-h-[44px] px-1">
            💡 Hint ({hintsRemaining})
          </button>
          <div className="flex items-center gap-1.5 bg-amber-100 px-3 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-700">{bonus_multiplier}× Bonus Active</span>
          </div>
        </div>

        {mode === 'anagram' && <AnagramWordList words={gameData.words} foundWords={foundWords} hintWord={hintWord} />}
        {mode === 'association' && <AssociationWordList words={gameData.words} foundWords={foundWords} hintWord={hintWord} revealedWords={revealedWords} onRevealWord={handleRevealWord} hintsRemaining={hintsRemaining} />}
        {mode === 'spelling' && (
          <SpellingBeeWordList words={gameData.words} foundWords={foundWords} hintWord={hintWord}
            onSpellingAttempt={(attempt) => {
              const unfound = gameData.words.filter(w => !foundWords.includes(w.toLowerCase()));
              if (unfound.length > 0 && attempt === unfound[0]) {
                const newFW = [...foundWords, unfound[0].toLowerCase()];
                setFoundWords(newFW);
                const ws = Math.round(calculateScore(unfound[0].length, level, false) * 2 * bonus_multiplier);
                setScore(p => p + ws);
                toast.success(`+${ws} pts!`, { description: `Spelled: ${unfound[0]}` });
                if (newFW.length === gameData.words.length) triggerVictory(newFW.length);
                return true;
              }
              toast.error('Not quite!', { duration: 1500 });
              return false;
            }} />
        )}
        {(mode === 'standard' || mode === 'audio') && (
          <WordList words={gameData.words} foundWords={foundWords} isAudioMode={mode === 'audio'}
            revealedWords={revealedWords} onRevealWord={handleRevealWord} hintsRemaining={hintsRemaining} hintWord={hintWord} />
        )}
      </div>

      <HintModal isOpen={showHintModal} onClose={() => setShowHintModal(false)}
        onWatchAd={handleWatchAd} onPurchase={handlePurchase} />

      {/* Victory Overlay */}
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
              <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">+{reward_hints} hints added to your account!</span>
            </div>
            <button onClick={() => navigate(createPageUrl('Home'))}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-200 min-h-[44px]">
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
            <p className="text-muted-foreground text-sm mb-6">You found {foundWords.length} of {gameData.words.length} words</p>
            <div className="bg-muted rounded-2xl p-3 mb-6">
              <p className="text-2xl font-bold text-foreground">{score}</p>
              <p className="text-xs text-muted-foreground">Points Earned</p>
            </div>
            <div className="flex gap-3">
              <button onClick={initGame}
                className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold py-3 rounded-2xl">
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