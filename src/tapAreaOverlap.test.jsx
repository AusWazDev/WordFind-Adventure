// @vitest-environment jsdom
// SF-62 (item 1): no extended tap area (SF-61's ::after hit areas) overlaps a
// neighbouring interactive element's tap area or visible box.
//
// jsdom has no layout, so this is a MODEL computed from each element's rendered classes:
// a tap area's reach per side comes from its after:-inset* classes, and the space
// between two elements from their container's gap (class or inline style), plus, between
// stacked rows, the rows' own vertical padding. Element widths are counted as zero, so
// the model can only over-report an overlap, never miss one.
//
// EXCLUDED, with reasons (the model cannot bound these; see the SF-62 report):
//  1. The portrait header's top row (Back · level column · Audio): justify-between with
//     no gap, so the distance depends on the screen width; the level column between
//     them is far wider than the 4 + 4 px of reach.
//  2. How to Play's Close against its slide dots: different rows; Close sits at the
//     header's right end and the dots are centred, so they never share a column.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/components/game/voiceUtils', () => ({
  stopAllAudio: vi.fn(), unlockAudio: vi.fn(() => Promise.resolve()), preloadGameAudio: vi.fn(),
  speakPhraseAndWord: vi.fn(), speakFixedPhrase: vi.fn(), speakWordAudio: vi.fn(), speakSentenceAudio: vi.fn(),
}));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), captureMessage: vi.fn(), addBreadcrumb: vi.fn() }));
vi.mock('canvas-confetti', () => ({ default: Object.assign(vi.fn(), { reset: vi.fn() }) }));
const cells = list => list.map(([row, col]) => ({ row, col }));
const BONUS_GAME = {
  words: ['dog'], wordPositions: { DOG: cells([[0, 0], [0, 1], [0, 2]]) },
  grid: Array.from({ length: 8 }, () => Array(8).fill('X')), gridSize: 8,
  bonusWord: 'HEN', bonusHint: 'A bird', bonusLetterPositions: cells([[7, 0], [7, 1], [7, 2]]),
};
const board = { props: null };
vi.mock('@/components/game/GameBoard', () => ({ default: props => { board.props = props; return null; } }));
vi.mock('@/components/game/gameUtils', async importOriginal => ({ ...(await importOriginal()), generateGame: () => BONUS_GAME }));

const { default: GameHeader } = await import('@/components/game/GameHeader');
const { default: HowToPlayModal } = await import('@/components/game/HowToPlayModal');
const { default: WordList } = await import('@/components/game/WordList');
const { default: ReminderSettings } = await import('@/components/game/ReminderSettings');
const { default: Game } = await import('@/pages/Game');

// ── The model ──────────────────────────────────────────────────────────────
const SPACING = v => v.startsWith('[') ? parseFloat(v.slice(1)) : parseFloat(v) * 4; // Tailwind: 1 = 4px; [7px]
export function reach(el) {
  const r = { top: 0, right: 0, bottom: 0, left: 0 };
  for (const c of el.classList) {
    const m = c.match(/^after:(-?)(inset-x|inset-y|inset|top|right|bottom|left)-(.+)$/); // longest names first
    if (!m) continue;
    const px = m[1] ? SPACING(m[3]) : -SPACING(m[3]); // a negative inset reaches outward
    const sides = { inset: ['top', 'right', 'bottom', 'left'], 'inset-x': ['left', 'right'], 'inset-y': ['top', 'bottom'] }[m[2]] || [m[2]];
    for (const s of sides) r[s] = Math.max(0, px);
  }
  return r;
}
function gapOf(el, axis) {
  if (el.style.gap) return parseFloat(el.style.gap);
  for (const c of el.classList) {
    const m = c.match(axis === 'row' ? /^(?:gap|gap-x|space-x)-(.+)$/ : /^(?:gap|gap-y|space-y)-(.+)$/);
    if (m) return SPACING(m[1]);
  }
  return 0;
}
const padOf = (el, side) => {
  for (const c of el.classList) {
    const m = c.match(new RegExp(`^(?:p|py|p${side[0]})-(.+)$`));
    if (m) return SPACING(m[1]);
  }
  return 0;
};
const isTapTarget = el => el.matches('button, [role="button"]');

// Adjacent interactive siblings in a row: reach(a).right + reach(b).left must fit the gaps between.
export function rowOverlaps(container) {
  const kids = [...container.children];
  const out = [];
  kids.forEach((a, i) => kids.slice(i + 1).forEach((b, k) => {
    if (!isTapTarget(a) || !isTapTarget(b)) return;
    const need = reach(a).right + reach(b).left, have = gapOf(container, 'row') * (k + 1);
    out.push({ a: a.getAttribute('aria-label') || a.textContent.trim(), b: b.getAttribute('aria-label') || b.textContent.trim(), need, have, overlap: need > have });
  }));
  return out;
}
// Stacked rows: the lowest reach in row i plus the highest in row i+1 must fit the gap plus the rows' padding.
export function columnOverlaps(container) {
  const rows = [...container.children];
  const out = [];
  for (let i = 0; i + 1 < rows.length; i++) {
    const below = Math.max(0, ...[...rows[i].querySelectorAll('button')].map(b => reach(b).bottom));
    const above = Math.max(0, ...[...rows[i + 1].querySelectorAll('button')].map(b => reach(b).top));
    const have = gapOf(container, 'col') + padOf(rows[i], 'bottom') + padOf(rows[i + 1], 'top');
    out.push({ rows: `${i}/${i + 1}`, need: below + above, have, overlap: below + above > have });
  }
  return out;
}

let container, root;
async function render(el) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root.render(el); });
  await act(async () => { await new Promise(r => setTimeout(r, 0)); });
}
beforeEach(() => {
  localStorage.clear();
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  Element.prototype.getBoundingClientRect = () => ({ width: 320, height: 320, top: 0, left: 0, right: 320, bottom: 320, x: 0, y: 0 });
});
afterEach(async () => { await act(async () => root?.unmount()); container?.remove(); });
const byLabel = l => container.querySelector(`[aria-label="${l}"]`);
const header = compact => <GameHeader score={10} hintsRemaining={3} wordsFound={0} totalWords={6} level={1} gameMode="audio" category="animals"
  onBack={() => {}} onUseHint={() => {}} isAudioMode audioEnabled onToggleAudio={() => {}} compact={compact} />;

describe('the model (control)', () => {
  it('reads reach from the hit-area classes and reports an overlap when the gap is too small', () => {
    const row = document.createElement('div'); row.className = 'flex gap-2';
    const a = document.createElement('button'); a.className = 'relative after:absolute after:-inset-1.5';
    const b = document.createElement('button'); b.className = 'relative after:absolute after:-inset-x-0.5 after:-inset-y-2.5';
    row.append(a, b);
    expect(reach(a)).toEqual({ top: 6, right: 6, bottom: 6, left: 6 });
    expect(reach(b)).toEqual({ top: 10, right: 2, bottom: 10, left: 2 });
    expect(rowOverlaps(row)[0]).toMatchObject({ need: 8, have: 8, overlap: false });
    row.className = 'flex gap-1.5';
    expect(rowOverlaps(row)[0]).toMatchObject({ need: 8, have: 6, overlap: true });
  });
});

describe('no extended tap area overlaps a neighbour (SF-62)', () => {
  it('compact game header row', async () => {
    await render(header(true));
    const pairs = rowOverlaps(byLabel('Back').parentElement);
    expect(pairs.length, 'control: Back, hint and Audio paired').toBe(3);
    expect(pairs.filter(p => p.overlap)).toEqual([]);
  });

  it('portrait game header: the score / hint / count row, and the two rows stacked', async () => {
    await render(header(false));
    const hint = byLabel('Hint, 3 left');
    expect(rowOverlaps(hint.parentElement).filter(p => p.overlap)).toEqual([]);
    const stacked = columnOverlaps(hint.parentElement.parentElement);
    expect(stacked.length, 'top row / score row / progress row').toBe(2);
    expect(stacked.filter(p => p.overlap)).toEqual([]);
  });

  it('How to Play: the slide dots', async () => {
    await render(<HowToPlayModal isOpen onClose={() => {}} />);
    const pairs = rowOverlaps(byLabel('Go to slide 1').parentElement);
    expect(pairs.length, 'control: 4 dots, 6 pairs').toBe(6);
    expect(pairs.filter(p => p.overlap)).toEqual([]);
  });

  it('word list rows (the per-word hint, outside Audio Challenge)', async () => {
    await render(<WordList words={['cat', 'dog', 'owl']} foundWords={[]} isAudioMode={false} revealedWords={[]} onRevealWord={() => {}} onHintCell={() => {}} hintsRemaining={3} hintWord={null} category="animals" />);
    const hints = [...container.querySelectorAll('[aria-label="Hint: show first letter"]')];
    expect(hints.length, 'control: one hint per word').toBe(3);
    const rows = hints[0].parentElement.parentElement;
    const stacked = columnOverlaps(rows);
    expect(stacked.length).toBe(2);
    expect(stacked.filter(p => p.overlap)).toEqual([]);
  });

  it('reminder settings: the switch above the time picker', async () => {
    localStorage.setItem('wordfind_reminder', JSON.stringify({ enabled: true, time: '18:00' }));
    // jsdom has no Notification; ReminderSettings reads its permission on mount.
    window.Notification = class { static permission = 'granted'; static requestPermission = async () => 'granted'; };
    await render(<ReminderSettings />);
    const sw = byLabel('Turn off daily reminder');
    expect(byLabel('Hour up'), 'control: the time picker is showing').not.toBeNull();
    const stacked = columnOverlaps(sw.parentElement.parentElement);
    expect(stacked.filter(p => p.overlap)).toEqual([]);
  });

  it('Mystery Word bonus: the backspace beside Submit and Skip', async () => {
    localStorage.setItem('wf_welcome_seen', 'true');
    await render(<MemoryRouter initialEntries={['/Game?mode=mystery_word&level=1']}><Game /></MemoryRouter>);
    await act(async () => { board.props.onWordFound('DOG', BONUS_GAME.wordPositions.DOG); });
    const back = byLabel('Delete last letter');
    expect(back, 'control: the bonus banner is showing').not.toBeNull();
    const pairs = rowOverlaps(back.parentElement);
    expect(pairs.length, 'backspace, Submit, Skip').toBe(3);
    expect(pairs.filter(p => p.overlap)).toEqual([]);
  });
});
