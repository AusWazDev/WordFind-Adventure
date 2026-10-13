// @vitest-environment jsdom
// SF-62 (U8, first half): a released selection of 2 or more cells that the page reports
// as a miss shows a red tint and a short shake for MISS_MS, then clears. A found word,
// a single-cell tap and an ignored drag show nothing; reduced motion keeps the tint
// without the shake; a new drag is never held up by the last miss.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GameBoard, { MISS_MS } from './GameBoard';

const GRID = [['C', 'A', 'T', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X']];
let reducedMotion = false;
let container, root;
beforeEach(() => {
  reducedMotion = false;
  Element.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, right: 400, bottom: 400, width: 400, height: 400, x: 0, y: 0 });
  window.matchMedia = q => ({ matches: reducedMotion && /prefers-reduced-motion: reduce/.test(q), addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

const render = onWordFound => act(async () => root.render(
  <GameBoard grid={GRID} gridSize={4} foundWords={[]} wordPositions={{}} onWordFound={onWordFound} />));
const cell = (r, c) => container.querySelector(`[data-row="${r}"][data-col="${c}"]`);
const missCells = () => [...container.querySelectorAll('[data-miss]')];
const at = (r, c) => ({ clientX: c * 100 + 50, clientY: r * 100 + 50, bubbles: true });
const mouse = (type, r, c) => act(async () => { container.firstChild.dispatchEvent(new MouseEvent(type, at(r, c))); });
const drag = async (from, to) => { await mouse('mousedown', ...from); await mouse('mousemove', ...to); await mouse('mouseup', ...to); };
const wait = ms => act(async () => { await new Promise(r => setTimeout(r, ms)); });

describe('miss feedback on the board (U8, SF-62)', () => {
  it('a miss tints and shakes the selected cells, then clears after MISS_MS', async () => {
    await render(() => 'miss');
    await drag([0, 0], [0, 2]);
    expect(missCells().map(c => `${c.dataset.row},${c.dataset.col}`)).toEqual(['0,0', '0,1', '0,2']);
    expect(missCells().every(c => c.dataset.miss === 'shake')).toBe(true);
    expect(cell(0, 1).className).toContain('bg-red-200');
    expect(cell(0, 1).className).toContain('dark:bg-red-900/70');
    await wait(MISS_MS + 100);
    expect(missCells()).toEqual([]);
    expect(cell(0, 1).className).not.toContain('bg-red-200');
  });

  it('a found word never shows the miss state', async () => {
    const onWordFound = vi.fn(() => 'found');
    await render(onWordFound);
    await drag([0, 0], [0, 2]);
    expect(onWordFound, 'control: the page was asked').toHaveBeenCalledTimes(1);
    expect(missCells()).toEqual([]);
  });

  it('an ignored drag (a word already found, the bonus phase) shows nothing', async () => {
    await render(() => 'ignored');
    await drag([0, 0], [0, 2]);
    expect(missCells()).toEqual([]);
  });

  it('a single-cell tap never shows it, and never asks the page', async () => {
    const onWordFound = vi.fn(() => 'miss');
    await render(onWordFound);
    await mouse('mousedown', 0, 0);
    await mouse('mouseup', 0, 0);
    expect(onWordFound).not.toHaveBeenCalled();
    expect(missCells()).toEqual([]);
  });

  it('under reduced motion: the tint, without the shake', async () => {
    reducedMotion = true;
    await render(() => 'miss');
    await drag([0, 0], [0, 2]);
    expect(missCells().length).toBe(3);
    expect(missCells().every(c => c.dataset.miss === 'tint')).toBe(true);
    expect(cell(0, 1).className).toContain('bg-red-200');
  });

  it('a new drag right after a miss is not held up: the miss clears and the selection paints', async () => {
    await render(() => 'miss');
    await drag([0, 0], [0, 2]);
    await mouse('mousedown', 1, 0);
    await mouse('mousemove', 1, 2);
    expect(missCells()).toEqual([]);
    expect(cell(1, 1).className).toContain('from-violet-500');
  });
});
