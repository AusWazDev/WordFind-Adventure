// @vitest-environment jsdom
// FB-22 (CR-85): a cell's scale follows the same order as its colour: selected,
// then found, then hint, then bonus letter. Before, the scale skipped "found", so
// a found cell that was also the hint cell showed green but stayed enlarged (1.08).
// motion.div is replaced by a plain div that writes the scale it is asked to
// animate to, so the target is read exactly (framer's own animation is not run).
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
const wordPositions = { ROW: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] };

let container, root;
async function render(props) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root.render(<GameBoard grid={grid} gridSize={SIZE} wordPositions={wordPositions} foundWords={[]} hintCells={[]} onWordFound={() => {}} {...props} />); });
}
const cell = (r, c) => container.querySelectorAll('[data-scale]')[r * SIZE + c];
afterEach(async () => { await act(async () => root?.unmount()); container?.remove(); });

describe('GameBoard cell scale follows the colour order (FB-22)', () => {
  it('control: a hint cell alone is enlarged, a plain cell is not', async () => {
    await render({ hintCells: [{ row: 3, col: 3 }] });
    expect(container.querySelectorAll('[data-scale]').length).toBe(SIZE * SIZE);
    expect(cell(3, 3).dataset.scale).toBe('1.08');
    expect(cell(4, 4).dataset.scale).toBe('1');
  });

  it('a cell that is both found and the hint cell renders at scale 1, in the found colour', async () => {
    await render({ foundWords: ['row'], hintCells: [{ row: 0, col: 1 }] });
    expect(cell(0, 1).className).toContain('from-emerald-400');   // found colour wins
    expect(cell(0, 1).dataset.scale).toBe('1');
    expect(cell(0, 0).dataset.scale).toBe('1');                  // the rest of the found word
  });
});
