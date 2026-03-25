import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import GameBoard from '@/components/game/GameBoard';
import WordList from '@/components/game/WordList';
import AnagramWordList from '@/components/game/AnagramWordList';
import AssociationWordList from '@/components/game/AssociationWordList';
import SpellingBeeWordList from '@/components/game/SpellingBeeWordList';
import GameHeader from '@/components/game/GameHeader';
import GameLoadingScreen from '@/components/game/GameLoadingScreen';
import HintModal from '@/components/game/HintModal';
import VictoryModal from '@/components/game/VictoryModal';
import { generateGame, checkWord, calculateScore } from '@/components/game/gameUtils';
import { speakText, unlockAudio } from '@/components/game/voiceUtils';
import { loadProgress, updateProgress, loadSettings } from '@/components/game/offlineStorage';
import { toast, Toaster } from 'sonner';

// ─── Orientation hook ─────────────────────────────────────────────────────────
function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(
    () => window.innerWidth > window.innerHeight
  );
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

// ─── Word list router ─────────────────────────────────────────────────────────
function WordListSwitch({ mode, gameData, foundWords, hintWord, revealedWords, onRevealWord, hintsRemaining, category }) {
  if (mode === 'anagram') {
    return <AnagramWordList words={gameData.words} foundWords={foundWords} hintWord={hintWord} />;
  }
  if (mode === 'association') {
    return (
      <AssociationWordList
        words={gameData.words}
        foundWords={foundWords}
        hintWord={hintWord}
        revealedWords={revealedWords}
        onRevealWord={onRevealWord}
        hintsRemaining={hintsRemaining}
      />
    );
  }
  if (mode === 'spelling') {
    return <SpellingBeeWordList words={gameData.words} foundWords={foundWords} hintWord={hintWord} />;
  }
  return (
    <WordList
      words={gameData.words}
      foundWords={foundWords}
      isAudioMode={mode === 'audio'}
      revealedWords={revealedWords}
      onRevealWord={onRevealWord}
      hintsRemaining={hintsRemaining}
      hintWord={hintWord}
      category={category}
    />
  );
}

// ─── Main Game component ──────────────────────────────────────────────────────
export default function Game() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode') || 'standard';
  const categoryParam = urlParams.get('category');
  const category = (categoryParam && categoryParam !== 'null') ? categoryParam : null;
  const level = parseInt(urlParams.get('level') || '1');

  const [gameData, setGameData] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [revealedWords, setRevealedWords] = useState([]);
  const [score, setScore] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [progress, setProgress] = useState(null);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hintCells, setHintCells] = useState([]);
  const [hintWord, setHintWord] = useState(null);

  // Stable refs for handleWordFound — avoids recreating the callback on every word found
  const gameDataRef = useRef(null);
  const foundWordsRef = useRef([]);
  useEffect(() => { gameDataRef.current = gameData; }, [gameData]);
  useEffect(() => { foundWordsRef.current = foundWords; }, [foundWords]);

  // Board sizing — measured in JS for exact pixel values
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
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, [isLandscape, gameData]);

  useEffect(() => {
    initGame();
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    const p = await loadProgress();
    setProgress(p);
    setHintsRemaining(p.hints_remaining || 3);
  };

  const initGame = async () => {
    const game = generateGame(level, category, mode === 'audio');
    setGameData(game);
    setFoundWords([]);
    setRevealedWords([]);
    setScore(0);
    setShowVictory(false);
    // NOTE: No auto-play intro here — iOS Safari blocks audio without a user gesture.
    // Players tap the speaker button to start audio.
  };

  const handleWordFound = useCallback((selectedWord, cells) => {
    const currentGame = gameDataRef.current;
    const currentFound = foundWordsRef.current;
    if (!currentGame) return;
    const foundWord = checkWord(selectedWord, currentGame.words, currentFound);
    if (foundWord) {
      const newFoundWords = [...currentFound, foundWord];
      setFoundWords(newFoundWords);
      const wordScore = calculateScore(foundWord, level, mode === 'audio');
      setScore(prev => prev + wordScore);

      // Speak feedback — unlockAudio() first so iOS allows it.
      // This fires from the result of a drag gesture which counts as a user interaction.
      if (mode === 'audio' && audioEnabled) {
        unlockAudio();
        loadSettings().then(settings => {
          speakText(`Great! You found ${foundWord}!`, settings);
        });
      }

      toast.success(`+${wordScore} points!`, { description: `Found: ${foundWord.toUpperCase()}` });

      if (newFoundWords.length === currentGame.words.length) {
        setTimeout(() => { setShowVictory(true); saveProgress(newFoundWords.length); }, 500);
      }
    }
  }, [level, mode, audioEnabled]);

  const saveProgress = async (wordsFoundCount) => {
    if (!progress) return;
    const updated = await updateProgress(null, progress, {
      total_score: (progress.total_score || 0) + score,
      games_played: (progress.games_played || 0) + 1,
      words_found: (progress.words_found || 0) + wordsFoundCount,
      hints_remaining: hintsRemaining,
      current_level: Math.max(progress.current_level || 1, level),
    });
    setProgress(updated);
  };

  const handleUseHint = () => {
    if (hintsRemaining <= 0) { setShowHintModal(true); return; }
    if (!gameData) return;
    const unfoundWords = gameData.words.filter(w => !foundWords.includes(w.toLowerCase()));
    if (unfoundWords.length === 0) return;
    const randomWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
    const positions = gameData.wordPositions[randomWord.toUpperCase()];
    const newHints = hintsRemaining - 1;
    setHintsRemaining(newHints);
    if (progress) updateProgress(null, progress, { hints_remaining: newHints });
    if (positions?.length > 0) {
      setHintCells([positions[0]]);
      setHintWord(randomWord.toLowerCase());
      setTimeout(() => { setHintCells([]); setHintWord(null); }, 4000);
    } else {
      setHintWord(randomWord.toLowerCase());
      setTimeout(() => setHintWord(null), 4000);
    }
  };

  const handleRevealWord = (word) => {
    if (hintsRemaining <= 0) { setShowHintModal(true); return; }
    setRevealedWords(prev => [...prev, word]);
    const newHints = hintsRemaining - 1;
    setHintsRemaining(newHints);
    if (progress) updateProgress(null, progress, { hints_remaining: newHints });
    toast.info(`Word revealed: ${word}`, { duration: 3000 });
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
    toast.success(`You purchased ${amount} hints!`);
    if (progress) updateProgress(null, progress, { hints_remaining: newHints });
  };

  const handleNextLevel = () => {
    const nextLevel = Math.min(level + 1, 4);
    // Use location.assign for a single atomic navigation — avoids the race condition
    // of calling navigate() then reload() separately (progress could be lost between the two)
    window.location.assign(createPageUrl('Game') + `?mode=${mode}&category=${category}&level=${nextLevel}`);
  };

  const handleReplay = () => initGame();
  const handleHome = () => navigate(createPageUrl('Home'));

  if (!gameData) return <GameLoadingScreen mode={mode} level={level} />;

  const wordListProps = {
    mode, gameData, foundWords, hintWord,
    revealedWords, onRevealWord: handleRevealWord,
    hintsRemaining, category,
  };

  const headerProps = {
    score, hintsRemaining,
    wordsFound: foundWords.length,
    totalWords: gameData.words.length,
    level, onBack: handleHome,
    onUseHint: handleUseHint,
    isAudioMode: mode === 'audio',
    audioEnabled,
    onToggleAudio: () => setAudioEnabled(!audioEnabled),
  };

  const boardProps = {
    grid: gameData.grid,
    foundWords,
    wordPositions: gameData.wordPositions,
    onWordFound: handleWordFound,
    gridSize: gameData.gridSize,
    hintCells,
    isLandscape,
  };

  const SIDEBAR_W = 260;
  const GAP = 12;
  const PAD = 12;

  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', background: 'var(--background)' }}>
      <Toaster position="top-center" richColors />

      {isLandscape ? (
        // LANDSCAPE: compact header top, board + word list side by side below
        <div style={{
          display: 'flex', flexDirection: 'column',
          width: '100%', height: '100%',
          padding: PAD, gap: GAP, boxSizing: 'border-box',
        }}>
          <div style={{ flexShrink: 0 }}>
            <GameHeader {...headerProps} compact />
          </div>

          <div
            ref={boardAreaRef}
            style={{
              flex: 1, display: 'flex', flexDirection: 'row',
              alignItems: 'flex-start', justifyContent: 'center',
              gap: GAP, minHeight: 0, overflow: 'hidden',
            }}
          >
            {boardSize > 0 && (
              <div style={{ width: boardSize, height: boardSize, flexShrink: 0 }}>
                <GameBoard {...boardProps} />
              </div>
            )}
            {boardSize > 0 && (
              <div style={{
                width: SIDEBAR_W, height: boardSize, flexShrink: 0,
                overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'thin',
              }}>
                <WordListSwitch {...wordListProps} />
              </div>
            )}
          </div>
        </div>

      ) : (
        // PORTRAIT: header, board (capped height), scrollable word list
        <div style={{
          display: 'flex', flexDirection: 'column',
          width: '100%', height: '100%',
          padding: PAD, gap: GAP, boxSizing: 'border-box', overflow: 'hidden',
        }}>
          <div style={{ flexShrink: 0 }}>
            <GameHeader {...headerProps} />
          </div>

          <div
            ref={boardAreaRef}
            style={{
              flexShrink: 0, width: '100%',
              maxHeight: 'min(55dvh, 100vw)',
              aspectRatio: '1 / 1', overflow: 'hidden',
            }}
          >
            {boardSize > 0 && (
              <div style={{ width: boardSize, height: boardSize }}>
                <GameBoard {...boardProps} />
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '0.5rem' }}>
            <WordListSwitch {...wordListProps} />
          </div>
        </div>
      )}

      <HintModal isOpen={showHintModal} onClose={() => setShowHintModal(false)} onWatchAd={handleWatchAd} onPurchase={handlePurchase} />
      <VictoryModal isOpen={showVictory} score={score} wordsFound={foundWords.length} level={level} onNextLevel={handleNextLevel} onReplay={handleReplay} onHome={handleHome} />
    </div>
  );
}
