import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import GameBoard from '@/components/game/GameBoard';
import WordList from '@/components/game/WordList';
import AnagramWordList from '@/components/game/AnagramWordList';
import AssociationWordList from '@/components/game/AssociationWordList';
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
function WordListSwitch({ mode, gameData, foundWords, hintWord, revealedWords, onRevealWord, onHintCell, hintsRemaining, category }) {
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
  return (
    <WordList
      words={gameData.words}
      foundWords={foundWords}
      isAudioMode={mode === 'audio'}
      revealedWords={revealedWords}
      onRevealWord={onRevealWord}
      onHintCell={onHintCell}
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

  // Bonus word hunt state (Master level)
  const [bonusHuntActive, setBonusHuntActive] = useState(false);
  const [bonusFound, setBonusFound] = useState(false);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [bonusInput, setBonusInput] = useState('');

  // Track words where hint tools were used — for score penalties
  const [hintedWords, setHintedWords] = useState(new Set());   // lightbulb used → -25%

  // Stable refs for handleWordFound — avoids recreating the callback on every word found
  const gameDataRef = useRef(null);
  const foundWordsRef = useRef([]);
  const revealedWordsRef = useRef([]);
  const hintedWordsRef = useRef(new Set());
  const bonusHuntActiveRef = useRef(false);
  const bonusFoundRef = useRef(false);
  useEffect(() => { gameDataRef.current = gameData; }, [gameData]);
  useEffect(() => { foundWordsRef.current = foundWords; }, [foundWords]);
  useEffect(() => { revealedWordsRef.current = revealedWords; }, [revealedWords]);
  useEffect(() => { hintedWordsRef.current = hintedWords; }, [hintedWords]);
  useEffect(() => { bonusHuntActiveRef.current = bonusHuntActive; }, [bonusHuntActive]);
  useEffect(() => { bonusFoundRef.current = bonusFound; }, [bonusFound]);

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
    const game = generateGame(level, category, mode === 'audio', mode === 'mystery_word');
    setGameData(game);
    setFoundWords([]);
    setRevealedWords([]);
    setHintedWords(new Set());
    setScore(0);
    setShowVictory(false);
    setBonusHuntActive(false);
    setBonusFound(false);
    setBonusPoints(0);
    setBonusInput('');
    // NOTE: No auto-play intro here — iOS Safari blocks audio without a user gesture.
    // Players tap the speaker button to start audio.
  };

  const handleWordFound = useCallback((selectedWord, cells) => {
    const currentGame = gameDataRef.current;
    const currentFound = foundWordsRef.current;
    if (!currentGame) return;

    // ── Regular word check ────────────────────────────────────────────────────
    const foundWord = checkWord(selectedWord, currentGame.words, currentFound);
    if (foundWord) {
      const newFoundWords = [...currentFound, foundWord];
      setFoundWords(newFoundWords);

      // ── Score penalty for using hints ──────────────────────────────────────
      // Eye (reveal) = 50% penalty · Lightbulb (hint cell) = 25% penalty
      const wasRevealed = revealedWordsRef.current.includes(foundWord);
      const wasHinted   = hintedWordsRef.current.has(foundWord);
      const rawScore    = calculateScore(foundWord, level, mode === 'audio');
      const multiplier  = wasRevealed ? 0.5 : wasHinted ? 0.75 : 1.0;
      const wordScore   = Math.round(rawScore * multiplier);
      setScore(prev => prev + wordScore);

      // Speak feedback — unlockAudio() first so iOS allows it.
      // This fires from the result of a drag gesture which counts as a user interaction.
      if (mode === 'audio' && audioEnabled) {
        unlockAudio();
        loadSettings().then(settings => {
          speakText(`Great! You found ${foundWord}!`, settings);
        });
      }

      const penaltyNote = wasRevealed ? ' (−50% penalty)' : wasHinted ? ' (−25% penalty)' : '';
      toast.success(`+${wordScore} points!${penaltyNote}`, { description: `Found: ${foundWord.toUpperCase()}` });

      if (newFoundWords.length === currentGame.words.length) {
        // Master level with a valid bonus word → start bonus hunt instead of victory
        if (currentGame.bonusWord && currentGame.bonusLetterPositions?.length && !bonusFoundRef.current) {
          setBonusHuntActive(true);
          if (mode === 'audio' && audioEnabled) {
            unlockAudio();
            loadSettings().then(settings =>
              speakText('Incredible! All words found! Now find the hidden bonus word!', settings)
            );
          }
          toast.success('🎉 All words found!', {
            description: 'Find the hidden bonus word for extra points!',
            duration: 5000,
          });
        } else {
          setTimeout(() => { setShowVictory(true); saveProgress(newFoundWords.length); }, 500);
        }
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

    // ── Bonus hunt hint: flash the first letter of the bonus word ─────────────
    if (bonusHuntActive && gameData.bonusWord && gameData.bonusLetterPositions?.length > 0) {
      const newHints = hintsRemaining - 1;
      setHintsRemaining(newHints);
      if (progress) updateProgress(null, progress, { hints_remaining: newHints });
      setHintCells([gameData.bonusLetterPositions[0]]);
      setHintWord(null);
      toast.info(`Hint: the hidden word starts with "${gameData.bonusWord[0]}"`, { duration: 4000 });
      setTimeout(() => { setHintCells([]); }, 4000);
      return;
    }

    // ── Regular hint: flash first letter of a random unfound word ─────────────
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

  const handleHintCell = (word) => {
    if (hintsRemaining <= 0) { setShowHintModal(true); return; }
    if (!gameData) return;
    const positions = gameData.wordPositions[word.toUpperCase()];
    if (!positions?.length) return;
    const newHints = hintsRemaining - 1;
    setHintsRemaining(newHints);
    if (progress) updateProgress(null, progress, { hints_remaining: newHints });
    // Mark this word as hinted — score will be reduced by 25% when found
    setHintedWords(prev => { const n = new Set(prev); n.add(word.toLowerCase()); return n; });
    setHintCells([positions[0]]);
    setHintWord(word.toLowerCase());
    setTimeout(() => { setHintCells([]); setHintWord(null); }, 4000);
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

  const handleSkipBonus = () => {
    setBonusHuntActive(false);
    setBonusInput('');
    setShowVictory(true);
    saveProgress(foundWords.length);
  };

  const handleBonusSubmit = () => {
    if (!gameData?.bonusWord) return;
    if (bonusInput.trim().toUpperCase() === gameData.bonusWord.toUpperCase()) {
      const bPts = gameData.bonusWord.length * 50;
      setBonusPoints(bPts);
      setBonusFound(true);
      setBonusHuntActive(false);
      setBonusInput('');
      setScore(prev => prev + bPts);
      if (mode === 'audio' && audioEnabled) {
        unlockAudio();
        loadSettings().then(s => speakText(`Amazing! The hidden word was ${gameData.bonusWord.toLowerCase()}!`, s));
      }
      toast.success(`🌟 ${gameData.bonusWord}! +${bPts} bonus points!`, { duration: 3000 });
      setTimeout(() => { setShowVictory(true); saveProgress(foundWords.length); }, 900);
    } else {
      toast.error('Not quite — keep reading the grid!', { duration: 2000 });
    }
  };

  const handleNextLevel = () => {
    const nextLevel = Math.min(level + 1, 5);
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
    onHintCell: handleHintCell,
    hintsRemaining, category,
  };

  const headerProps = {
    score, hintsRemaining,
    wordsFound: foundWords.length,
    totalWords: gameData.words.length,
    level, gameMode: mode, category,
    onBack: handleHome,
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
    bonusLetterCells: bonusHuntActive ? (gameData.bonusLetterPositions || []) : [],
    isLandscape,
  };

  const SIDEBAR_W = 260;
  const GAP = 12;
  const PAD = 12;

  // ── Bonus banner — shown above the word list in both orientations ────────────
  const bonusBannerEl = (() => {
    if (bonusHuntActive && gameData.bonusWord) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          borderRadius: 12, padding: '10px 12px', marginBottom: 8, color: 'white',
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, textAlign: 'center', margin: '0 0 2px 0' }}>
            🌟 BONUS WORD HUNT!
          </p>
          <p style={{ fontSize: 11, textAlign: 'center', opacity: 0.9, margin: '0 0 4px 0' }}>
            {gameData.bonusHint}
          </p>
          <p style={{ fontSize: 10, textAlign: 'center', opacity: 0.75, margin: '0 0 6px 0' }}>
            Read the gold letters top-left → bottom-right
          </p>
          <input
            type="text"
            value={bonusInput}
            onChange={e => setBonusInput(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
            placeholder="Type the hidden word…"
            maxLength={(gameData.bonusWord.length || 10) + 2}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck="false"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.92)', color: '#1e1b4b',
              border: 'none', borderRadius: 8,
              padding: '6px 10px', fontSize: 14, fontWeight: 700,
              letterSpacing: 3, textAlign: 'center', marginBottom: 6,
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleBonusSubmit}
              style={{
                flex: 1, fontSize: 12, fontWeight: 700,
                background: 'rgba(255,255,255,0.25)', border: 'none',
                borderRadius: 6, padding: '5px 8px', color: 'white', cursor: 'pointer',
              }}
            >
              Submit ✓
            </button>
            <button
              onClick={handleSkipBonus}
              style={{
                flex: 1, fontSize: 11,
                background: 'rgba(255,255,255,0.12)', border: 'none',
                borderRadius: 6, padding: '5px 8px', color: 'white', cursor: 'pointer',
              }}
            >
              Skip →
            </button>
          </div>
        </div>
      );
    }
    if (gameData.bonusWord && !bonusHuntActive && !bonusFound && foundWords.length < gameData.words.length) {
      return (
        <div style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 10, padding: '5px 10px', marginBottom: 6, textAlign: 'center',
        }}>
          <p style={{ fontSize: 11, color: '#b45309', margin: 0 }}>
            🔍 A hidden bonus word awaits…
          </p>
        </div>
      );
    }
    return null;
  })();

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
                {bonusBannerEl}
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
            {bonusBannerEl}
            <WordListSwitch {...wordListProps} />
          </div>
        </div>
      )}

      <HintModal isOpen={showHintModal} onClose={() => setShowHintModal(false)} onWatchAd={handleWatchAd} onPurchase={handlePurchase} />
      <VictoryModal isOpen={showVictory} score={score} wordsFound={foundWords.length} level={level} onNextLevel={handleNextLevel} onReplay={handleReplay} onHome={handleHome} bonusFound={bonusFound} bonusPoints={bonusPoints} hasBonusWord={!!gameData?.bonusWord} />
    </div>
  );
}
