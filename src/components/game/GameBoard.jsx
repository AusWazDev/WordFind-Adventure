import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GameBoard({
  grid,
  foundWords,
  wordPositions,
  onWordFound,
  gridSize,
  hintCells = [],
  isLandscape
}) {
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundCells, setFoundCells] = useState(new Set());
  const gridRef = useRef(null);

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
    if (selecting && selectedCells.length >= 2) {
      const word = selectedCells.map(c => grid[c.row][c.col]).join('');
      onWordFound(word, selectedCells);
    }
    setSelecting(false);
    setStartCell(null);
    setSelectedCells([]);
  };

  const isSelected = (row, col) => selectedCells.some(c => c.row === row && c.col === col);
  const isFound = (row, col) => foundCells.has(`${row}-${col}`);
  const isHint = (row, col) => hintCells.some(c => c.row === row && c.col === col);

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
      style={{ touchAction: 'none', padding: '6px' }}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
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
              className={cn(
                'flex items-center justify-center rounded-md font-bold cursor-pointer transition-colors duration-100',
                getCellFontSize(),
                isSelected(rowIndex, colIndex)
                  ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md z-10'
                  : isFound(rowIndex, colIndex)
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                  : isHint(rowIndex, colIndex)
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md z-10 ring-2 ring-amber-300'
                  : 'bg-muted text-foreground hover:bg-muted/70'
              )}
              animate={
                isSelected(rowIndex, colIndex) || isHint(rowIndex, colIndex)
                  ? { scale: 1.08 }
                  : { scale: 1 }
              }
              transition={{ duration: 0.1 }}
            >
              {letter}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
