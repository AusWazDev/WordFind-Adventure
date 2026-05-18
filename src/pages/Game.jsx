import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { speakPhraseAndWord, speakFixedPhrase, unlockAudio, preloadGameAudio } from '@/components/game/voiceUtils';
import { loadProgress, updateProgress, loadSettings } from '@/components/game/offlineStorage';
import { toast } from 'sonner';

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

// ─── Viewport height hook — tracks visualViewport so the container shrinks
//     when the iOS soft keyboard appears (100dvh does not update in Capacitor)
function useViewportHeight() {
  const [h, setH] = useState(() => window.visualViewport?.height ?? window.innerHeight);
  useEffect(() => {
    const update = () => setH(window.visualViewport?.height ?? window.innerHeight);
    window.visualViewport?.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.visualViewport?.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);
  return h;
}

// ─── Word list router ─────────────────────────────────────────────────────────
function WordListSwitch({ mode, gameData, foundWords, hintWord, revealedWords, onRevealWord, onHintCell, hintsRemaining, category }) {
  if (mode === 'anagram') {
    return <AnagramWordList words={gameData.words} foundWords={foundWords} hintWord={hintWord} onHintCell={onHintCell} hintsRemaining={hintsRemaining} />;
  }
  if (mode === 'association') {
    return (
      <AssociationWordList
        words={gameData.words}
        foundWords={foundWords}
        hintWord={hintWord}
        revealedWords={revealedWords}
        onRevealWord={onRevealWord}
        onHintCell={onHintCell}
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
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'standard';
  const categoryParam = searchParams.get('category');
  const category = (categoryParam && categoryParam !== 'null') ? categoryParam : null;
  const level = parseInt(searchParams.get('level') || '1');

  const [gameData, setGameData] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [revealedWords, setRevealedWords] = useState([]);
  const [score, setScore] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(12);
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

  // Timer ref — cancels bonus-hunt hint flash; regular hints are persistent (no timer)
  const hintTimerRef = useRef(null);
  const hintWordRef = useRef(null);
  // Refs for saveProgress — progress/score/hintsRemaining are stale in the handleWordFound closure
  const progressRef = useRef(null);
  const scoreRef = useRef(0);
  const hintsRemainingRef = useRef(12);
  useEffect(() => { hintWordRef.current = hintWord; }, [hintWord]);
  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { hintsRemainingRef.current = hintsRemaining; }, [hintsRemaining]);

  // Board sizing — measured in JS for exact pixel values
  const boardAreaRef = useRef(null);
  const [boardSize, setBoardSize] = useState(0);
  const isLandscape = useOrientation();
  const containerH = useViewportHeight();


  useEffect(() => {
    function measure() {
      if (!boardAreaRef.current) return;
      const rect = boardAreaRef.current.getBoundingClientRect();
      setBoardSize(Math.floor(Math.min(rect.width, rect.height)));
    }
    measure();
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    const t = setTimeout(measure, 150);
    return () => {
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, [isLandscape, gameData, bonusHuntActive]);

  // Re-initialise whenever URL params change (e.g. Next Level navigation)
  // NOTE: initGame and loadProgressData intentionally omitted from deps — they
  // are stable within a render and adding them would cause unnecessary reruns.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    initGame();
    loadProgressData();
  }, [level, mode, category]);

  const loadProgressData = async () => {
    const p = await loadProgress();
    setProgress(p);
    setHintsRemaining(p.hints_remaining ?? 12);
  };

  const initGame = async () => {
    const game = generateGame(level, category, mode === 'audio', mode === 'mystery_word');
    setGameData(game);
    setFoundWords([]);
    setRevealedWords([]);
    setHintedWords(new Set());
    setScore(0);
    scoreRef.current = 0;
    setShowVictory(false);
    setBonusHuntActive(false);
    setBonusFound(false);
    setBonusPoints(0);
    setBonusInput('');
    // Preload this game's audio in the background so first taps are instant.
    if (mode === 'audio') {
      loadSettings().then(settings => preloadGameAudio(game.words, settings));
    }
  };

  const handleWordFound = useCallback((selectedWord, cells) => {
    const currentGame = gameDataRef.current;
    const currentFound = foundWordsRef.current;
    if (!currentGame) return;

    // ── Regular word check ────────────────────────────────────────────────────
    const foundWord = checkWord(selectedWord, currentGame.words, currentFound);
    if (foundWord) {
      // Guard: verify selected cells match the stored grid positions for this word.
      // Without this, highlighting a substring (e.g. CAKE within PANCAKE) would
      // incorrectly mark the shorter word as found.
      const storedPositions = currentGame.wordPositions[foundWord.toUpperCase()];
      if (storedPositions) {
        const selectedSet = new Set(cells.map(c => `${c.row},${c.col}`));
        const storedSet   = new Set(storedPositions.map(p => `${p.row},${p.col}`));
        const positionsMatch = selectedSet.size === storedSet.size &&
          [...selectedSet].every(k => storedSet.has(k));
        if (!positionsMatch) return;
      }

      const newFoundWords = [...currentFound, foundWord];
      setFoundWords(newFoundWords);

      // DEF-28: clear persistent hint flash when the hinted word is found
      if (foundWord === hintWordRef.current) {
        clearTimeout(hintTimerRef.current);
        setHintCells([]);
        setHintWord(null);
      }

      // ── Score penalty for using hints ──────────────────────────────────────
      // Eye (reveal) = 50% penalty · Lightbulb (hint cell) = 25% penalty
      const wasRevealed = revealedWordsRef.current.includes(foundWord);
      const wasHinted   = hintedWordsRef.current.has(foundWord);
      const rawScore    = calculateScore(foundWord, level, mode === 'audio');
      const multiplier  = wasRevealed ? 0.5 : wasHinted ? 0.75 : 1.0;
      const wordScore   = Math.round(rawScore * multiplier);
      setScore(prev => prev + wordScore);

      const isLastWord   = newFoundWords.length === currentGame.words.length;
      const hasBonusHunt = !!(currentGame.bonusWord && currentGame.bonusLetterPositions?.length && !bonusFoundRef.current);

      // Speak feedback via ElevenLabs — unlockAudio() first so iOS/Android allows it.
      if (mode === 'audio' && audioEnabled) {
        unlockAudio().then(() => loadSettings()).then(settings => {
          if (isLastWord && hasBonusHunt) {
            // Skip great_you_found — all_words_found fires below to avoid AudioContext overlap
          } else if (isLastWord) {
            speakFixedPhrase('game_complete', 'Incredible! You found all the words!', settings);
          } else {
            speakPhraseAndWord('great_you_found', foundWord, `Great! You found ${foundWord}!`, settings);
          }
        });
      }

      const penaltyNote = wasRevealed ? ' (−50% penalty)' : wasHinted ? ' (−25% penalty)' : '';
      toast.success(`+${wordScore} points!${penaltyNote}`, { description: `Found: ${foundWord.toUpperCase()}` });

      if (isLastWord) {
        // Master level with a valid bonus word → start bonus hunt instead of victory
        if (hasBonusHunt) {
          setBonusHuntActive(true);
          if (mode === 'audio' && audioEnabled) {
            unlockAudio().then(() => loadSettings()).then(settings =>
              speakFixedPhrase('all_words_found', 'Incredible! All words found! Now find the hidden bonus word!', settings)
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
    // Use refs — progress/score/hintsRemaining are stale in the handleWordFound closure
    const currentProgress = progressRef.current;
    const currentScore = scoreRef.current;
    const currentHints = hintsRemainingRef.current;
    if (!currentProgress) return;
    // CR-15: track completed games in localStorage so Home.jsx can gate ads
    // on completions rather than starts.
    const completed = parseInt(localStorage.getItem('games_completed_count') || '0') + 1;
    localStorage.setItem('games_completed_count', String(completed));

    const updated = await updateProgress(null, currentProgress, {
      total_score: (currentProgress.total_score || 0) + currentScore,
      games_played: (currentProgress.games_played || 0) + 1,
      words_found: (currentProgress.words_found || 0) + wordsFoundCount,
      hints_remaining: currentHints,
      current_level: Math.max(currentProgress.current_level || 1, level),
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
      hintTimerRef.current = setTimeout(() => { setHintCells([]); }, 4000);
      return;
    }

    // ── Regular hint: persistent flash until the hinted word is found (DEF-28) ─
    if (hintWordRef.current) return; // hint already active — block re-entry
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
    } else {
      setHintWord(randomWord.toLowerCase());
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
    if (hintWordRef.current) return; // hint already active — block re-entry
    const positions = gameData.wordPositions[word.toUpperCase()];
    if (!positions?.length) return;
    const newHints = hintsRemaining - 1;
    setHintsRemaining(newHints);
    if (progress) updateProgress(null, progress, { hints_remaining: newHints });
    // Mark this word as hinted — score will be reduced by 25% when found
    setHintedWords(prev => { const n = new Set(prev); n.add(word.toLowerCase()); return n; });
    setHintCells([positions[0]]);
    setHintWord(word.toLowerCase());
    // No timer — hint persists until the word is found (DEF-28)
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

  const handleBonusCellTap = useCallback((letter) => {
    if (!gameDataRef.current?.bonusWord) return;
    const max = gameDataRef.current.bonusWord.length;
    setBonusInput(prev => prev.length < max ? (prev + letter).toUpperCase() : prev);
  }, []);

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
        unlockAudio().then(() => loadSettings()).then(s =>
          speakPhraseAndWord('great_you_found', gameData.bonusWord, `Amazing! The hidden word was ${gameData.bonusWord.toLowerCase()}!`, s)
        );
      }
      toast.success(`🌟 ${gameData.bonusWord}! +${bPts} bonus points!`, { duration: 3000 });
      setTimeout(() => { setShowVictory(true); saveProgress(foundWords.length); }, 900);
    } else {
      toast.error('Not quite — keep reading the grid!', { duration: 2000 });
    }
  };

  const handleNextLevel = () => {
    const nextLevel = Math.min(level + 1, 5);
    // Use React Router navigate() for client-side navigation — avoids a hard reload
    // which would 404 on Vercel (no server-side route for /Game exists).
    // The useEffect watching [level, mode, category] re-initialises the game automatically.
    navigate(`${createPageUrl('Game')}?mode=${mode}&category=${category}&level=${nextLevel}`);
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
    hintActive: !!hintWord,
  };

  const boardProps = {
    grid: gameData.grid,
    foundWords,
    wordPositions: gameData.wordPositions,
    onWordFound: handleWordFound,
    gridSize: gameData.gridSize,
    hintCells,
    bonusLetterCells: bonusHuntActive ? (gameData.bonusLetterPositions || []) : [],
    bonusHuntActive,
    onBonusCellTap: handleBonusCellTap,
    isLandscape,
  };

  const SIDEBAR_W = 260;
  const GAP = 12;
  const PAD = 12;

  // ── Bonus banner — shown above the word list in both orientations ────────────
  const bonusBannerEl = (() => {
    if (bonusHuntActive && gameData.bonusWord) {
      // No keyboard — player taps the bright gold cells in the grid to build the word.
      return (
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          borderRadius: 10, padding: '8px 10px', color: 'white',
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', opacity: 0.95, margin: '0 0 4px 0' }}>
            🌟 {gameData.bonusHint}
          </p>
          <p style={{ fontSize: 10, textAlign: 'center', opacity: 0.75, margin: '0 0 7px 0' }}>
            Tap the gold letters in the grid in order
          </p>

          {/* Letter slots — filled by tapping gold cells */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 7, flexWrap: 'wrap' }}>
            {Array.from({ length: gameData.bonusWord.length }).map((_, i) => (
              <div key={i} style={{
                width: 26, height: 30,
                border: `2px solid ${i < bonusInput.length ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)'}`,
                borderRadius: 5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i < bonusInput.length ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.12)',
                color: '#1e1b4b', fontSize: 14, fontWeight: 800,
              }}>
                {bonusInput[i] || ''}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setBonusInput(prev => prev.slice(0, -1))}
              style={{
                flexShrink: 0, fontSize: 14, fontWeight: 600,
                background: 'rgba(255,255,255,0.2)', border: 'none',
                borderRadius: 6, padding: '5px 10px', color: 'white', cursor: 'pointer',
              }}
            >
              ⌫
            </button>
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
                flexShrink: 0, fontSize: 11,
                background: 'rgba(255,255,255,0.12)', border: 'none',
                borderRadius: 6, padding: '5px 8px', color: 'white', cursor: 'pointer',
              }}
            >
              Skip
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

  // Board height cap: shrinks when keyboard is up so the bonus input stays visible
  const boardMaxH = Math.min(Math.floor(containerH * 0.55), window.innerWidth);

  return (
    <div style={{ width: '100vw', height: containerH, overflow: 'hidden', background: 'var(--background)' }}>

      {isLandscape ? (
        // LANDSCAPE: compact header top, board + word list side by side below
        <div style={{
          display: 'flex', flexDirection: 'column',
          width: '100%', height: '100%',
          padding: PAD, gap: GAP, boxSizing: 'border-box',
          paddingTop: `max(${PAD}px, env(safe-area-inset-top))`,
          paddingBottom: `max(${PAD}px, env(safe-area-inset-bottom))`,
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
          paddingTop: `max(${PAD}px, env(safe-area-inset-top))`,
          paddingBottom: `max(${PAD}px, env(safe-area-inset-bottom))`,
        }}>
          <div style={{ flexShrink: 0 }}>
            <GameHeader {...headerProps} />
          </div>

          {bonusHuntActive ? (
            // Bonus hunt: banner+input ABOVE board so the full grid stays
            // visible when the iOS soft keyboard pushes the viewport up.
            <>
              <div style={{ flexShrink: 0 }}>{bonusBannerEl}</div>
              <div
                ref={boardAreaRef}
                style={{
                  flex: 1, minHeight: 0, overflow: 'hidden',
                  display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
                }}
              >
                {boardSize > 0 && (
                  <div style={{ width: boardSize, height: boardSize }}>
                    <GameBoard {...boardProps} />
                  </div>
                )}
              </div>
            </>
          ) : (
            // Normal play: board capped at boardMaxH, word list scrolls below.
            <>
              <div
                ref={boardAreaRef}
                style={{
                  flexShrink: 0, width: '100%',
                  maxHeight: boardMaxH,
                  aspectRatio: '1 / 1', overflow: 'hidden',
                  display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
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
            </>
          )}
        </div>
      )}

      <HintModal isOpen={showHintModal} onClose={() => setShowHintModal(false)} onWatchAd={handleWatchAd} onPurchase={handlePurchase} />
      <VictoryModal isOpen={showVictory} score={score} wordsFound={foundWords.length} level={level} onNextLevel={handleNextLevel} onReplay={handleReplay} onHome={handleHome} bonusFound={bonusFound} bonusPoints={bonusPoints} hasBonusWord={!!gameData?.bonusWord} />
    </div>
  );
}
