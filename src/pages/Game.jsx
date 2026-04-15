import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
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

  // CR-16: word list expanded by default; player can collapse manually for more grid space
  const [wordListCollapsed, setWordListCollapsed] = useState(false);

  // Track words where hint tools were used — for score penalties
  const [hintedWords, setHintedWords] = useState(new Set());   // lightbulb used → -25%

  // Timer ref — used for bonus-hunt hint timeout only (regular hints are persistent)
  const hintTimerRef = useRef(null);

  // Stable refs for handleWordFound — avoids recreating the callback on every word found
  const gameDataRef = useRef(null);
  const foundWordsRef = useRef([]);
  const revealedWordsRef = useRef([]);
  const hintedWordsRef = useRef(new Set());
  const hintWordRef = useRef(null);
  const bonusHuntActiveRef = useRef(false);
  const bonusFoundRef = useRef(false);
  // Refs for saveProgress — progress/score/hintsRemaining are not in handleWordFound deps,
  // so saveProgress would capture stale closure values without refs.
  const progressRef = useRef(null);
  const scoreRef = useRef(0);
  const hintsRemainingRef = useRef(12);
  useEffect(() => { gameDataRef.current = gameData; }, [gameData]);
  useEffect(() => { foundWordsRef.current = foundWords; }, [foundWords]);
  useEffect(() => { revealedWordsRef.current = revealedWords; }, [revealedWords]);
  useEffect(() => { hintedWordsRef.current = hintedWords; }, [hintedWords]);
  useEffect(() => { hintWordRef.current = hintWord; }, [hintWord]);
  useEffect(() => { bonusHuntActiveRef.current = bonusHuntActive; }, [bonusHuntActive]);
  useEffect(() => { bonusFoundRef.current = bonusFound; }, [bonusFound]);
  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { hintsRemainingRef.current = hintsRemaining; }, [hintsRemaining]);

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
  }, [isLandscape, gameData, wordListCollapsed]);

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
    setWordListCollapsed(false);  // CR-27: word list expanded by default on new game
    setBonusHuntActive(false);
    setBonusFound(false);
    setBonusPoints(0);
    setBonusInput('');
    // Preload this game's audio in the background so first taps are instant.
    // Only useful in audio mode; safe to call in other modes (no-ops quickly).
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

      // Speak feedback — unlockAudio() first so iOS allows it.
      // This fires from the result of a drag gesture which counts as a user interaction.
      // When the last word is found, play the completion phrase instead of "great_you_found"
      // to avoid both phrases firing simultaneously on the AudioContext.
      const isLastWord   = newFoundWords.length === currentGame.words.length;
      const hasBonusHunt = !!(currentGame.bonusWord && currentGame.bonusLetterPositions?.length && !bonusFoundRef.current);
      if (mode === 'audio' && audioEnabled) {
        unlockAudio();
        loadSettings().then(settings => {
          if (isLastWord && hasBonusHunt) {
            // Only "all_words_found" — it will play below; don't overlap with "great_you_found"
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
          setWordListCollapsed(false);  // CR-16: reveal list so player sees all words ticked
          if (mode === 'audio' && audioEnabled) {
            unlockAudio();
            loadSettings().then(settings =>
              speakFixedPhrase('all_words_found', 'Incredible! All words found! Now find the hidden bonus word!', settings)
            );
          }
          toast.success('🎉 All words found!', {
            description: 'Find the hidden bonus word for extra points!',
            duration: 5000,
          });
        } else {
          setTimeout(() => { setWordListCollapsed(false); setShowVictory(true); saveProgress(newFoundWords.length); }, 500);
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
    // on completions rather than starts (every 6 completed games).
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
    progressRef.current = updated;
  };

  const handleUseHint = () => {
    if (hintsRemaining <= 0) { setShowHintModal(true); return; }
    if (!gameData) return;
    // DEF-28: lock out while a hint is already active — wait for hinted word to be found
    if (hintWord) return;

    // ── Bonus hunt hint: flash the first letter of the bonus word (4s timer) ──
    if (bonusHuntActive && gameData.bonusWord && gameData.bonusLetterPositions?.length > 0) {
      const newHints = hintsRemaining - 1;
      setHintsRemaining(newHints);
      if (progress) updateProgress(null, progress, { hints_remaining: newHints });
      setHintCells([gameData.bonusLetterPositions[0]]);
      setHintWord(null);
      toast.info(`Hint: the hidden word starts with "${gameData.bonusWord[0]}"`, { duration: 4000 });
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = setTimeout(() => { setHintCells([]); }, 4000);
      return;
    }

    // ── Regular hint: flash first letter of a random unfound word (persistent) ─
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
      // No timer — flash persists until the player finds the hinted word
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
    // DEF-28: lock out while a hint is already active
    if (hintWord) return;
    const positions = gameData.wordPositions[word.toUpperCase()];
    if (!positions?.length) return;
    const newHints = hintsRemaining - 1;
    setHintsRemaining(newHints);
    if (progress) updateProgress(null, progress, { hints_remaining: newHints });
    // Mark this word as hinted — score will be reduced by 25% when found
    setHintedWords(prev => { const n = new Set(prev); n.add(word.toLowerCase()); return n; });
    setHintCells([positions[0]]);
    setHintWord(word.toLowerCase());
    // No timer — flash persists until the player finds the hinted word
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
        loadSettings().then(s => speakPhraseAndWord('hidden_word_was', gameData.bonusWord, `Amazing! The hidden word was ${gameData.bonusWord.toLowerCase()}!`, s));
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
    hintActive: !!hintWord,
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
            autoFocus={false}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.92)', color: '#1e1b4b',
              border: 'none', borderRadius: 8,
              padding: '6px 10px', fontSize: 16, fontWeight: 700,
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
        // PORTRAIT: header · board (CR-17: bigger when list collapsed) · collapsible word list (CR-16)
        <div style={{
          display: 'flex', flexDirection: 'column',
          width: '100%', height: '100%',
          padding: PAD, gap: GAP, boxSizing: 'border-box', overflow: 'hidden',
        }}>
          <div style={{ flexShrink: 0 }}>
            <GameHeader {...headerProps} />
          </div>

          {/* CR-17: maxHeight grows from 55→75dvh when word list is collapsed */}
          <div
            ref={boardAreaRef}
            style={{
              flexShrink: 0, width: '100%',
              maxHeight: wordListCollapsed ? 'min(75dvh, 100vw)' : 'min(55dvh, 100vw)',
              aspectRatio: '1 / 1', overflow: 'hidden',
              transition: 'max-height 0.25s ease',
            }}
          >
            {boardSize > 0 && (
              <div style={{ width: boardSize, height: boardSize }}>
                <GameBoard {...boardProps} />
              </div>
            )}
          </div>

          {/* CR-16: collapsible word list panel */}
          <div style={wordListCollapsed
            ? { flexShrink: 0 }
            : { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }
          }>
            {/* Bonus banner always visible above the toggle bar */}
            {bonusBannerEl}

            {/* Toggle bar — always visible, tap to expand/collapse */}
            <button
              onClick={() => setWordListCollapsed(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--card)',
                borderRadius: wordListCollapsed ? 12 : '12px 12px 0 0',
                padding: '10px 16px', boxSizing: 'border-box',
                border: '1px solid var(--border)',
                borderBottom: wordListCollapsed ? '1px solid var(--border)' : 'none',
                cursor: 'pointer', userSelect: 'none',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
                {mode === 'audio' ? 'Listen & Find' : 'Words to Find'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  background: foundWords.length === gameData.words.length
                    ? 'var(--primary)' : 'var(--muted)',
                  color: foundWords.length === gameData.words.length
                    ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  borderRadius: 20, padding: '2px 10px',
                  transition: 'background 0.3s',
                }}>
                  {foundWords.length} / {gameData.words.length}
                </span>
                <ChevronDown style={{
                  width: 18, height: 18, color: 'var(--muted-foreground)',
                  transform: wordListCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.25s ease',
                }} />
              </div>
            </button>

            {/* Expandable list — slides in below the toggle bar */}
            {!wordListCollapsed && (
              <div style={{
                flex: 1, overflowY: 'auto', overflowX: 'hidden',
                paddingBottom: '0.5rem',
                border: '1px solid var(--border)', borderTop: 'none',
                borderRadius: '0 0 12px 12px',
                background: 'var(--card)',
              }}>
                <WordListSwitch {...wordListProps} />
              </div>
            )}
          </div>
        </div>
      )}

      <HintModal isOpen={showHintModal} onClose={() => setShowHintModal(false)} onWatchAd={handleWatchAd} onPurchase={handlePurchase} />
      <VictoryModal isOpen={showVictory} score={score} wordsFound={foundWords.length} level={level} onNextLevel={handleNextLevel} onReplay={handleReplay} onHome={handleHome} bonusFound={bonusFound} bonusPoints={bonusPoints} hasBonusWord={!!gameData?.bonusWord} />
    </div>
  );
}
