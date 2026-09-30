// @vitest-environment jsdom
// Daily Challenge page, rendered for real (CR-61, brief SF-1). Only the board,
// word lists, hint modal and game generator are replaced: storage, scoring,
// checkWord and the page's own logic all run as shipped.
process.env.TZ = 'Australia/Melbourne';

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// A fixed game. CAKE is placed on its own row, and its letters also appear
// inside PANCAKE on row 0: selecting those cells must not find CAKE (DEF-14).
const row = (r, from, len) => Array.from({ length: len }, (_, i) => ({ row: r, col: from + i }));
const FIXED_GAME = {
  words: ['pancake', 'cake', 'dog'],
  wordPositions: { PANCAKE: row(0, 0, 7), CAKE: row(2, 0, 4), DOG: row(4, 0, 3) },
  grid: Array.from({ length: 8 }, () => Array(8).fill('X')),
  gridSize: 8,
};

const board = { props: null };
vi.mock('@/components/game/GameBoard', () => ({
  default: props => { board.props = props; return null; },
}));
vi.mock('@/components/game/WordList', () => ({ default: () => null }));
vi.mock('@/components/game/AnagramWordList', () => ({ default: () => null }));
vi.mock('@/components/game/AssociationWordList', () => ({ default: () => null }));
vi.mock('@/components/game/HintModal', () => ({ default: () => null }));
vi.mock('@/components/game/gameUtils', async importOriginal => ({
  ...(await importOriginal()),
  generateGame: () => FIXED_GAME,
}));

const { default: DailyChallenge } = await import('./DailyChallenge');
const { getDailyChallengeConfig } = await import('@/components/game/DailyChallengeUtils');

const NOON_30_SEP = new Date('2026-09-30T02:00:00Z'); // 12:00 AEST
const SEED_PROGRESS = { id: 'local', current_level: 1, total_score: 100, hints_remaining: 5, games_played: 3, words_found: 20, best_streak: 0 };

let container;
let root;
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 0)); }); };
const store = key => JSON.parse(localStorage.getItem(key) || 'null');

async function renderPage() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(<MemoryRouter><DailyChallenge /></MemoryRouter>);
  });
  await flush();
}

async function find(word, cells) {
  await act(async () => { board.props.onWordFound(word, cells); });
  await flush();
}

async function findAll() {
  await find('PANCAKE', FIXED_GAME.wordPositions.PANCAKE);
  await find('CAKE', FIXED_GAME.wordPositions.CAKE);
  await find('DOG', FIXED_GAME.wordPositions.DOG);
}

function hintButton() {
  return [...container.querySelectorAll('button')].find(b => b.textContent.includes('Hint ('));
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOON_30_SEP);
  localStorage.clear();
  localStorage.setItem('wf_progress', JSON.stringify(SEED_PROGRESS));
  // Yesterday completed with a streak of 2, keyed by the local date.
  localStorage.setItem('wf_daily', JSON.stringify({ '2026-09-29': { completed: true, streak: 2 } }));
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  Element.prototype.getBoundingClientRect = () => ({ width: 320, height: 320, top: 0, left: 0, right: 320, bottom: 320, x: 0, y: 0 });
  board.props = null;
});

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('the apparatus', () => {
  it('renders the board with the fixed game and today\'s template', async () => {
    await renderPage();
    expect(board.props).not.toBeNull();
    expect(board.props.foundWords).toEqual([]);
    expect(getDailyChallengeConfig().date).toBe('2026-09-30');
  });
});

describe('victory saves everything (a)', () => {
  it('saves score, games played, words found, best streak and reward hints', async () => {
    const { reward_hints, category } = getDailyChallengeConfig();
    await renderPage();
    await findAll();

    const daily = store('wf_daily')['2026-09-30'];
    const progress = store('wf_progress');
    expect.soft(daily?.completed).toBe(true);
    expect.soft(daily.score).toBeGreaterThan(0);
    expect.soft(daily.words_found).toBe(3);
    expect.soft(daily.streak).toBe(3);
    expect.soft(progress.total_score).toBe(100 + daily.score);
    expect.soft(progress.games_played).toBe(4);
    expect.soft(progress.words_found).toBe(23);
    expect.soft(progress.best_streak).toBe(3);
    expect.soft(progress.hints_remaining).toBe(5 + reward_hints);
    // item 5: the record carries its category, which Stats reads.
    expect.soft(daily.category).toBe(category);
  });

  it('adds the reward to the CURRENT hint balance, after a hint was spent in the game', async () => {
    const { reward_hints } = getDailyChallengeConfig();
    await renderPage();
    await act(async () => { hintButton().click(); });
    await flush();
    await findAll();
    expect(store('wf_progress').hints_remaining).toBe(5 - 1 + reward_hints);
  });
});

describe('local date at 09:00 AEST, when the UTC date is still yesterday (b)', () => {
  it('keys the record to today and continues yesterday\'s streak', async () => {
    vi.setSystemTime(new Date('2026-09-29T23:00:00Z')); // 09:00 AEST, 30 Sep
    await renderPage();
    await findAll();
    const daily = store('wf_daily');
    expect(daily['2026-09-30']?.completed).toBe(true);
    expect(daily['2026-09-30'].streak).toBe(3);
    expect(store('wf_progress').best_streak).toBe(3);
  });
});

describe('substring rejection (d, DEF-14)', () => {
  it('selecting CAKE\'s letters inside PANCAKE does not find CAKE', async () => {
    await renderPage();
    await find('CAKE', FIXED_GAME.wordPositions.PANCAKE.slice(3));
    expect(board.props.foundWords).not.toContain('cake');
    await find('CAKE', FIXED_GAME.wordPositions.CAKE);
    expect(board.props.foundWords).toContain('cake');
  });
});

describe('hint guard (item 4)', () => {
  it('a second tap while a hint is showing spends no second hint', async () => {
    await renderPage();
    await act(async () => { hintButton().click(); });
    await act(async () => { hintButton().click(); });
    await flush();
    expect(store('wf_progress').hints_remaining).toBe(4);
    expect(hintButton().textContent).toContain('Hint (4)');
  });

  it('the hint timer is cleared when the page unmounts', async () => {
    const setSpy = vi.spyOn(window, 'setTimeout');
    const clearSpy = vi.spyOn(window, 'clearTimeout');
    await renderPage();
    await act(async () => { hintButton().click(); });
    const hintTimer = setSpy.mock.results[setSpy.mock.calls.findIndex(([, ms]) => ms === 4000)]?.value;
    expect(hintTimer).toBeDefined();
    await act(async () => root.unmount());
    root = null;
    expect(clearSpy.mock.calls.map(([id]) => id)).toContain(hintTimer);
  });
});
