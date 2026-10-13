import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/motion';

// U8 (SF-62): how long a missed selection stays tinted (and shakes).
export const MISS_MS = 400;
const SHAKE = [0, -4, 4, -3, 3, 0];

export default function GameBoard({
  grid,
  foundWords,
  wordPositions,
  onWordFound,
  gridSize,
  hintCells = [],
  bonusLetterCells = [],
  bonusHuntActive = false,
  onBonusCellTap,
  isLandscape,
  // SF-62 seams for a non-interactive demo board (the tutorial). Real games pass
  // neither, so they behave exactly as before.
  interactive = true,     // false: no pointer, mouse or touch handlers and no touch listeners
  selectedCells: selectedCellsOverride, // when given, shown as the selection (display only)
}) {
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundCells, setFoundCells] = useState(new Set());
  const [miss, setMiss] = useState(null); // { cells, shake } while a missed selection shows (U8)
  const missTimerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => () => clearTimeout(missTimerRef.current), []);

  const clearMiss = () => { clearTimeout(missTimerRef.current); setMiss(null); };
  const showMiss = cells => {
    clearTimeout(missTimerRef.current);
    setMiss({ cells, shake: !prefersReducedMotion() });
    missTimerRef.current = setTimeout(() => setMiss(null), MISS_MS);
  };

  useEffect(() => {
    const cells = new Set();
    foundWords.forEach(word => {
      const positions = wordPositions[word.toUpperCase()];
      if (positions) {
        positions.forEach(pos => cells.add(`${pos.row}-${pos.col}`));
      }
    });
    setFoundCells(cells);
  }, [foundWords, wordPositions]);

  // DEF-19: React 17+ registers touch listeners as passive by default, so
  // e.preventDefault() in synthetic handlers is silently ignored — the browser
  // still scrolls/pull-to-refreshes through the game board. Adding a direct
  // non-passive listener on the DOM node forces preventDefault() to be honoured.
  useEffect(() => {
    const el = gridRef.current;
    if (!el || !interactive) return;
    const suppressScroll = (e) => { e.preventDefault(); };
    el.addEventListener('touchstart', suppressScroll, { passive: false });
    el.addEventListener('touchmove',  suppressScroll, { passive: false });
    return () => {
      el.removeEventListener('touchstart', suppressScroll);
      el.removeEventListener('touchmove',  suppressScroll);
    };
  }, [interactive]);

  const getCellFromPoint = (x, y) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const cellSize = rect.width / gridSize;
    const col = Math.floor((x - rect.left) / cellSize);
    const row = Math.floor((y - rect.top) / cellSize);
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      return { row, col };
    }
    return null;
  };

  const computeSelection = (start, current) => {
    if (!start || !current) return [start].filter(Boolean);

    const dRow = current.row - start.row;
    const dCol = current.col - start.col;
    const absDRow = Math.abs(dRow);
    const absDCol = Math.abs(dCol);

    let dirRow, dirCol;
    if (absDRow === 0 && absDCol === 0) {
      return [start];
    } else if (absDRow === 0) {
      dirRow = 0; dirCol = Math.sign(dCol);
    } else if (absDCol === 0) {
      dirRow = Math.sign(dRow); dirCol = 0;
    } else {
      const ratio = absDRow / absDCol;
      if (ratio > 0.5 && ratio < 2) {
        dirRow = Math.sign(dRow); dirCol = Math.sign(dCol);
      } else if (absDRow >= absDCol) {
        dirRow = Math.sign(dRow); dirCol = 0;
      } else {
        dirRow = 0; dirCol = Math.sign(dCol);
      }
    }

    let steps;
    if (dirRow === 0) steps = Math.abs(dCol);
    else if (dirCol === 0) steps = Math.abs(dRow);
    else steps = Math.max(absDRow, absDCol);

    const cells = [];
    for (let i = 0; i <= steps; i++) {
      const r = start.row + dirRow * i;
      const c = start.col + dirCol * i;
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
        cells.push({ row: r, col: c });
      }
    }
    return cells;
  };

  const handleStart = (e) => {
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    const cell = getCellFromPoint(point.clientX, point.clientY);
    if (cell) {
      clearMiss(); // a new drag is never held up by the last miss (U8)
      setSelecting(true);
      setStartCell(cell);
      setSelectedCells([cell]);
    }
  };

  const handleMove = (e) => {
    if (!selecting || !startCell) return;
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    const cell = getCellFromPoint(point.clientX, point.clientY);
    if (cell) setSelectedCells(computeSelection(startCell, cell));
  };

  const handleEnd = () => {
    if (selecting) {
      if (selectedCells.length >= 2) {
        const word = selectedCells.map(c => grid[c.row][c.col]).join('');
        // U8 (SF-62): the page reports back 'found', 'miss' or 'ignored'; only a
        // miss shows feedback. A single-cell tap never reaches here.
        if (onWordFound(word, selectedCells) === 'miss') showMiss(selectedCells);
      } else if (selectedCells.length === 1 && onBonusCellTap) {
        const cell = selectedCells[0];
        if (isBonusLetter(cell.row, cell.col)) {
          onBonusCellTap(grid[cell.row][cell.col]);
        }
      }
    }
    setSelecting(false);
    setStartCell(null);
    setSelectedCells([]);
  };

  const shownSelection = selectedCellsOverride ?? selectedCells;
  const isSelected = (row, col) => shownSelection.some(c => c.row === row && c.col === col);
  const isMiss = (row, col) => !!miss && miss.cells.some(c => c.row === row && c.col === col);
  const inputHandlers = interactive ? {
    onMouseDown: handleStart, onMouseMove: handleMove, onMouseUp: handleEnd, onMouseLeave: handleEnd,
    onTouchStart: handleStart, onTouchMove: handleMove, onTouchEnd: handleEnd,
  } : {};
  const isFound = (row, col) => foundCells.has(`${row}-${col}`);
  const isHint = (row, col) => hintCells.some(c => c.row === row && c.col === col);
  const isBonusLetter = (row, col) => bonusLetterCells.some(c => c.row === row && c.col === col);

  // Scale font size with grid: bigger cells = bigger font
  const getCellFontSize = () => {
    if (gridSize <= 8)  return 'text-xl';
    if (gridSize <= 10) return 'text-lg';
    if (gridSize <= 12) return 'text-base';
    if (gridSize <= 15) return 'text-sm';
    return 'text-xs';
  };

  return (
    /*
     * The board fills whatever container its parent gives it.
     * The parent in Game.jsx always constrains it to a square via aspectRatio,
     * so width === height and cells come out square automatically.
     */
    <div
      ref={gridRef}
      className="w-full h-full bg-card rounded-2xl shadow-lg select-none"
      style={{ touchAction: 'none', overscrollBehavior: 'none', padding: '6px' }}
      {...inputHandlers}
    >
      <div
        className="w-full h-full"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          gap: gridSize > 12 ? '1px' : '2px',
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              data-row={rowIndex}
              data-col={colIndex}
              data-miss={isMiss(rowIndex, colIndex) ? (miss.shake ? 'shake' : 'tint') : undefined}
              className={cn(
                'flex items-center justify-center rounded-md font-bold cursor-pointer transition-colors duration-100',
                getCellFontSize(),
                isSelected(rowIndex, colIndex)
                  ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md z-10'
                  : isMiss(rowIndex, colIndex) // U8 (SF-62): a missed selection, for MISS_MS
                  ? 'bg-red-200 text-red-800 dark:bg-red-900/70 dark:text-red-100 z-10'
                  : isHint(rowIndex, colIndex) // before found, so a hint on a found cell shows (SF-44, D-C)
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md z-10 ring-2 ring-amber-300'
                  : isFound(rowIndex, colIndex)
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                  : isBonusLetter(rowIndex, colIndex) && bonusHuntActive
                  ? 'bg-amber-400 dark:bg-amber-500 text-white ring-2 ring-white/50 shadow-md font-extrabold'
                  : isBonusLetter(rowIndex, colIndex)
                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 ring-1 ring-amber-400 dark:ring-amber-600'
                  : 'bg-muted text-foreground hover:bg-muted/70'
              )}
              animate={ // same order as the colour above (FB-22, CR-85; SF-44): selected, miss, hint, found
                isSelected(rowIndex, colIndex)
                  ? { scale: 1.08, x: 0 }
                  : isMiss(rowIndex, colIndex)
                  ? { scale: 1, x: miss.shake ? SHAKE : 0 } // transform only (U8); no shake under reduced motion
                  : isHint(rowIndex, colIndex)
                  ? { scale: 1.08, x: 0 }
                  : isFound(rowIndex, colIndex)
                  ? { scale: 1, x: 0 }
                  : isBonusLetter(rowIndex, colIndex) && bonusHuntActive
                  ? { scale: 1.06, x: 0 }
                  : isBonusLetter(rowIndex, colIndex)
                  ? { scale: 1.04, x: 0 }
                  : { scale: 1, x: 0 }
              }
              transition={{ duration: 0.1, x: { duration: 0.3 } }}
            >
              {letter}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
