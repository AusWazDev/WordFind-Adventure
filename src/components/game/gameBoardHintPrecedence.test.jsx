// @vitest-environment jsdom
// SF-44 (D-C): a cell's appearance follows selected > hint > found, for colour
// and scale. Before, found came before hint, so a hint whose first-letter cell
// was already part of a found word showed nothing: green, and not enlarged.
// motion.div is replaced by a plain div that writes the scale it is asked to
// animate to, as in gameBoardHintScale.test.jsx.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ animate, transition, initial, exit, whileHover, whileTap, layout, ...rest }) => <div data-scale={animate?.scale} {...rest} />,
  },
}));
const { default: GameBoard } = await import('./GameBoard');

const SIZE = 5;
const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill('A'));
// ROW is found; the hint sits on (0,1), one of its cells.
const wordPositions = { ROW: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] };
const HINT = 'from-amber-400';
const FOUND = 'from-emerald-400';
const SELECTED = 'from-violet-500';

let container, root;
async function render(props) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root.render(<GameBoard grid={grid} gridSize={SIZE} wordPositions={wordPositions} foundWords={[]} hintCells={[]} onWordFound={() => {}} {...props} />); });
}
const cell = (r, c) => container.querySelectorAll('[data-scale]')[r * SIZE + c];
afterEach(async () => { vi.restoreAllMocks(); await act(async () => root?.unmount()); container?.remove(); });

describe('GameBoard cell precedence: selected > hint > found (SF-44, D-C)', () => {
  it('a hint on a cell of a found word shows the hint colour and scale, not the found ones', async () => {
    await render({ foundWords: ['row'], hintCells: [{ row: 0, col: 1 }] });
    expect(cell(0, 1).className).toContain(HINT);
    expect(cell(0, 1).className).not.toContain(FOUND);
    expect(cell(0, 1).dataset.scale).toBe('1.08');
  });

  it('control: a found cell with no hint still shows the found colour at scale 1', async () => {
    await render({ foundWords: ['row'], hintCells: [{ row: 0, col: 1 }] });
    for (const c of [0, 2]) {
      expect(cell(0, c).className).toContain(FOUND);
      expect(cell(0, c).className).not.toContain(HINT);
      expect(cell(0, c).dataset.scale).toBe('1');
    }
  });

  it('a selected cell still wins over a hint', async () => {
    await render({ hintCells: [{ row: 2, col: 2 }] });
    expect(cell(2, 2).className).toContain(HINT);              // before selecting
    // The board maps a pointer to a cell from its own rectangle: 500 px square, 100 px cells.
    const board = container.querySelector('.select-none');
    vi.spyOn(board, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 500, height: 500, right: 500, bottom: 500, x: 0, y: 0 });
    await act(async () => { board.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: 250, clientY: 250 })); });
    expect(cell(2, 2).className).toContain(SELECTED);
    expect(cell(2, 2).className).not.toContain(HINT);
    expect(cell(2, 2).dataset.scale).toBe('1.08');
  });
});
