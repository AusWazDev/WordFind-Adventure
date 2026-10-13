// G2 (SF-66b): the coach bubble never covers the step's target cells, the cells of the
// word the step asks for, or its outlined control, at every step, at three viewports.
// jsdom has no layout, so the tutorial page is modelled from its own classes
// (Tutorial.jsx: max-w-md mx-auto px-4, pt 3rem, space-y-3, a square board; the word
// list's rows; CoachMark: 280 px wide, at most container minus 16). The same check runs
// against real layout in headless Chrome (SF-66b evidence), not in this suite.
import { describe, it, expect } from 'vitest';
import { placeBubble, intersects, GAP } from './coachPlacement';

const VIEWPORTS = { 'small phone portrait': 360, 'tablet portrait': 800, 'tablet landscape': 1280 };
const N = 6, PAD = 6, CELL_GAP = 2;

function layout(vw, { knightFound }) {
  const width = Math.min(vw, 448);           // max-w-md
  const side = width - 32;                   // px-4 on both sides
  const board = { left: 16, top: 48, right: 16 + side, bottom: 48 + side }; // pt 3rem
  const cell = (side - 2 * PAD - (N - 1) * CELL_GAP) / N;
  const cellRect = (r, c) => {
    const left = board.left + PAD + c * (cell + CELL_GAP), top = board.top + PAD + r * (cell + CELL_GAP);
    return { left, top, right: left + cell, bottom: top + cell };
  };
  // Word list: p-4, header 28 + mb-3, rows (38 without a button, 62 with a 44 px one), gap-2.
  const listTop = board.bottom + 12;
  const rowH = { LAMB: 38, KNIGHT: knightFound ? 38 : 62, THUMB: 62 };
  let y = listTop + 16 + 28 + 12;
  const rows = {};
  for (const w of ['LAMB', 'KNIGHT', 'THUMB']) { rows[w] = { left: 32, right: 16 + side - 16, top: y, bottom: y + rowH[w] }; y += rowH[w] + 8; }
  const list = { left: 16, right: 16 + side, top: listTop, bottom: y - 8 + 16 };
  const control = row => ({ left: row.right - 12 - 44, right: row.right - 12, top: row.top + (row.bottom - row.top - 44) / 2, bottom: row.top + (row.bottom - row.top + 44) / 2 });
  return {
    container: { width, height: list.bottom + 24 }, board, list, cellRect,
    controls: { 'word-play': control(rows.KNIGHT), 'word-hint': control(rows.THUMB) },
  };
}

const cells = list => list.map(([r, c]) => ({ row: r, col: c }));
const LAMB = cells([[0, 0], [0, 1], [0, 2], [0, 3]]);
const MISS = cells([[1, 0], [1, 1], [1, 2], [1, 3]]);
const KNIGHT = cells([[5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5]]);
const THUMB = cells([[0, 5], [1, 5], [2, 5], [3, 5], [4, 5]]);
// Every step and phase: its targets (cells or control) and the step word's cells, as
// Tutorial.jsx builds `avoid`. Bubble heights: heading + body (+ link) as rendered.
const STEPS = [
  { id: '1 ask', cells: LAMB, word: LAMB, h: 140 },
  { id: '1 done', cells: LAMB, word: LAMB, h: 44 },
  { id: '2 ask', cells: MISS, word: MISS, h: 92 },
  { id: '2 done', cells: MISS, word: MISS, h: 92 },
  { id: '3 ask', control: 'word-play', word: KNIGHT, h: 140 },
  { id: '3 next', control: 'word-play', word: KNIGHT, h: 92 },
  { id: '3 done', cells: KNIGHT, word: KNIGHT, h: 44, knightFound: true },
  { id: '4 ask', control: 'word-hint', word: THUMB, h: 108, knightFound: true },
  { id: '4 next', cells: [THUMB[0]], word: THUMB, h: 92, knightFound: true },
  { id: '4 done', cells: THUMB, word: THUMB, h: 44, knightFound: true },
];
const COMPACT_H = 76; // heading + "More"

describe('G2: the coach bubble never covers a target (every step, three viewports)', () => {
  for (const [vpName, vw] of Object.entries(VIEWPORTS)) {
    for (const s of STEPS) {
      it(`${vpName}, step ${s.id}`, () => {
        const L = layout(vw, { knightFound: !!s.knightFound });
        const avoid = [
          ...(s.cells || []).map(c => L.cellRect(c.row, c.col)),
          ...s.word.map(c => L.cellRect(c.row, c.col)),
          ...(s.control ? [L.controls[s.control]] : []),
        ];
        const w = Math.min(280, L.container.width - 2 * GAP);
        let pos = placeBubble({ container: L.container, board: L.board, list: L.list, avoid, bubble: { w, h: s.h } });
        let h = s.h;
        if (!pos) { h = COMPACT_H; pos = placeBubble({ container: L.container, board: L.board, list: L.list, avoid, bubble: { w, h } }); }
        expect(pos, 'a place is found, full or heading-only').not.toBeNull();
        const bubble = { left: pos.left, top: pos.top, right: pos.left + w, bottom: pos.top + h };
        const hit = avoid.filter(a => intersects(bubble, a));
        expect(hit, `bubble ${JSON.stringify(bubble)} (${pos.where})`).toEqual([]);
        expect(bubble.left >= 0 && bubble.right <= L.container.width, 'inside the page width').toBe(true);
      });
    }
  }
});

describe('placeBubble order', () => {
  const container = { width: 400, height: 900 };
  const board = { left: 16, top: 200, right: 384, bottom: 568 };
  const list = { left: 16, top: 580, right: 384, bottom: 860 };
  it('above the board first, when it fits', () => {
    expect(placeBubble({ container, board, list, avoid: [], bubble: { w: 280, h: 100 } }).where).toBe('above');
  });
  it('then the word-list area', () => {
    const tall = { ...board, top: 60 };
    expect(placeBubble({ container, board: tall, list, avoid: [], bubble: { w: 280, h: 100 } }).where).toBe('list');
  });
  it('then over the board, away from what it avoids', () => {
    // No room above (board at the top) or below (the page ends under the board).
    const c = { width: 400, height: 400 }, b = { left: 16, top: 16, right: 384, bottom: 384 };
    const avoid = [{ left: 16, top: 16, right: 100, bottom: 100 }]; // top-left cells
    const p = placeBubble({ container: c, board: b, list: null, avoid, bubble: { w: 200, h: 80 } });
    expect(p.where).toBe('board');
    expect(p.left > 150 && p.top > 150, 'the bottom-right, furthest from the avoided cells').toBe(true);
  });
  it('null when nothing fits', () => {
    const all = [{ left: 0, top: 0, right: 400, bottom: 900 }];
    expect(placeBubble({ container, board, list, avoid: all, bubble: { w: 280, h: 100 } })).toBeNull();
  });
});
