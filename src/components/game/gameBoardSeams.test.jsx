// @vitest-environment jsdom
// SF-62 (item 2): GameBoard's seams for a non-interactive demo board. Real games pass
// neither prop, so a default render must attach its handlers exactly as before.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GameBoard from './GameBoard';

const GRID = [['C', 'A', 'T', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X']];
const SELECTED = 'from-violet-500';

let container, root, adds;
beforeEach(() => {
  Element.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, right: 400, bottom: 400, width: 400, height: 400, x: 0, y: 0 });
  window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  adds = vi.spyOn(EventTarget.prototype, 'addEventListener');
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); });

const render = props => act(async () => root.render(
  <GameBoard grid={GRID} gridSize={4} foundWords={[]} wordPositions={{}} onWordFound={() => 'found'} {...props} />));
const board = () => container.firstChild;
const cell = (r, c) => container.querySelector(`[data-row="${r}"][data-col="${c}"]`);
const at = (r, c) => ({ clientX: c * 100 + 50, clientY: r * 100 + 50, bubbles: true });
const mouse = (type, r, c) => act(async () => { board().dispatchEvent(new MouseEvent(type, at(r, c))); });
const nonPassiveTouch = () => adds.mock.calls.filter(([type, , opts], i) =>
  adds.mock.contexts[i] === board() && (type === 'touchstart' || type === 'touchmove') && opts?.passive === false).map(c => c[0]);

describe('GameBoard seams (SF-62)', () => {
  it('a default render attaches the touch listeners and the drag handlers as today', async () => {
    const onWordFound = vi.fn(() => 'found');
    await render({ onWordFound });
    expect(nonPassiveTouch().sort()).toEqual(['touchmove', 'touchstart']);
    await mouse('mousedown', 0, 0);
    await mouse('mousemove', 0, 2);
    expect(cell(0, 1).className, 'the drag selection paints').toContain(SELECTED);
    await mouse('mouseup', 0, 2);
    expect(onWordFound).toHaveBeenCalledWith('CAT', [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }]);
  });

  it('interactive={false} attaches no touch listeners and ignores pointer input', async () => {
    const onWordFound = vi.fn(() => 'found');
    await render({ onWordFound, interactive: false });
    expect(nonPassiveTouch()).toEqual([]);
    await mouse('mousedown', 0, 0);
    await mouse('mousemove', 0, 2);
    expect(cell(0, 1).className).not.toContain(SELECTED);
    await mouse('mouseup', 0, 2);
    expect(onWordFound).not.toHaveBeenCalled();
  });

  it('selectedCells paints the given selection, display only; every cell has data-row and data-col', async () => {
    await render({ interactive: false, selectedCells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] });
    expect(container.querySelectorAll('[data-row][data-col]').length).toBe(16);
    expect(cell(0, 0).className).toContain(SELECTED);
    expect(cell(0, 1).className).toContain(SELECTED);
    expect(cell(0, 2).className, 'control: an unselected cell').not.toContain(SELECTED);
  });
});
