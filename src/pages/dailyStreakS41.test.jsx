// @vitest-environment jsdom
// S41 (SF-74): the Daily page, rendered for real as in DailyChallengeCR84.test.jsx, with
// the streak award. Windows only: a streak reaching 3 pays 2 hints on top of the day's
// reward, once; a same-day replay pays nothing more (S28); the web never pays it.
process.env.TZ = 'Australia/Melbourne';

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXY';
function makeGame(n) {
  const words = Array.from({ length: n }, (_, i) => `W${LETTERS[i]}`.toLowerCase() + 'ord');
  const wordPositions = Object.fromEntries(words.map((w, r) => [w.toUpperCase(), Array.from({ length: w.length }, (_, c) => ({ row: r, col: c }))]));
  return { words, wordPositions, grid: Array.from({ length: 25 }, () => Array(25).fill('X')), gridSize: 25 };
}

const platform = vi.hoisted(() => ({ windows: false }));
vi.mock('@/lib/platform', () => ({ isWindowsApp: () => platform.windows, isNative: () => false, getPlatform: () => 'web' }));
const state = { game: null };
const board = { props: null };
vi.mock('@/components/game/voiceUtils', () => ({ stopAllAudio: vi.fn(), unlockAudio: vi.fn(() => Promise.resolve()), speakPhraseAndWord: vi.fn(), speakFixedPhrase: vi.fn() }));
vi.mock('@/components/game/GameBoard', () => ({ default: props => { board.props = props; return null; } }));
vi.mock('@/components/game/WordList', () => ({ default: () => null }));
vi.mock('@/components/game/AnagramWordList', () => ({ default: () => null }));
vi.mock('@/components/game/AssociationWordList', () => ({ default: () => null }));
vi.mock('@/components/game/HintModal', () => ({ default: () => null }));
vi.mock('@/components/game/gameUtils', async importOriginal => ({ ...(await importOriginal()), generateGame: () => state.game }));
vi.mock('@/components/game/DailyChallengeUtils', async importOriginal => ({
  ...(await importOriginal()),
  getDailyChallengeConfig: () => ({ title: 'T', description: '', category: 'animals', mode: 'standard', level: 2, timed: false, bonus_multiplier: 2, reward_hints: 2, date: '2026-09-30' }),
}));

const { default: DailyChallenge } = await import('./DailyChallenge');
const { STREAK_AWARD_KEY } = await import('@/lib/streakReward');

let container, root;
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 0)); }); };
const store = key => JSON.parse(localStorage.getItem(key) || 'null');
async function playToday() {
  state.game = makeGame(3);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root.render(<MemoryRouter><DailyChallenge /></MemoryRouter>); });
  await flush();
  for (const w of state.game.words) {
    await act(async () => { board.props.onWordFound(w.toUpperCase(), state.game.wordPositions[w.toUpperCase()]); });
    await flush();
  }
}
async function unmount() { await act(async () => root?.unmount()); container?.remove(); }

function seed(yesterdayStreak) {
  localStorage.clear();
  localStorage.setItem('wf_progress', JSON.stringify({ id: 'local', current_level: 1, total_score: 0, hints_remaining: 5, games_played: 0, words_found: 0, best_streak: yesterdayStreak }));
  localStorage.setItem('wf_daily', JSON.stringify(yesterdayStreak ? { '2026-09-29': { completed: true, streak: yesterdayStreak } } : {}));
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-30T02:00:00Z')); // 12:00 AEST, the Daily's date
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  Element.prototype.getBoundingClientRect = () => ({ width: 320, height: 320, top: 0, left: 0, right: 320, bottom: 320, x: 0, y: 0 });
  platform.windows = false;
  board.props = null;
});
afterEach(async () => { await unmount(); vi.useRealTimers(); });

describe('S41 on Windows', () => {
  beforeEach(() => { platform.windows = true; });

  it('streak reaches 3: the day\'s 2 plus 2 bonus hints, and the streak line', async () => {
    seed(2);
    await playToday();
    expect(store('wf_daily')['2026-09-30'].streak, 'control: today is day 3 of the streak').toBe(3);
    expect(store('wf_progress').hints_remaining).toBe(5 + 2 + 2);
    expect(container.querySelector('[data-testid="streak-bonus"]').textContent).toBe('3 day Daily streak! +2 bonus hints');
    expect(store(STREAK_AWARD_KEY)).toEqual({ run_start: '2026-09-28', paid_through: 3 });
  });

  it('a same-day replay pays nothing more (S28)', async () => {
    seed(2);
    await playToday();
    expect(store('wf_progress').hints_remaining).toBe(9);
    await unmount();
    await playToday();
    expect(store('wf_progress').hints_remaining, 'replay: no day reward, no streak bonus').toBe(9);
    expect(container.querySelector('[data-testid="streak-bonus"]')).toBeNull();
  });

  it('streak reaches 2: the day\'s reward only, no bonus', async () => {
    seed(1);
    await playToday();
    expect(store('wf_progress').hints_remaining).toBe(5 + 2);
    expect(container.querySelector('[data-testid="streak-bonus"]')).toBeNull();
    expect(store(STREAK_AWARD_KEY)).toBeNull();
  });

  it('streak reaches 6: pays again', async () => {
    seed(5);
    localStorage.setItem(STREAK_AWARD_KEY, JSON.stringify({ run_start: '2026-09-25', paid_through: 3 }));
    await playToday();
    expect(store('wf_progress').hints_remaining).toBe(5 + 2 + 2);
    expect(store(STREAK_AWARD_KEY)).toEqual({ run_start: '2026-09-25', paid_through: 6 });
  });
});

describe('S41 off Windows (the web here; iOS and Android take the same path)', () => {
  it('streak reaches 3: the day\'s reward only, no bonus, nothing recorded', async () => {
    seed(2);
    await playToday();
    expect(store('wf_daily')['2026-09-30'].streak, 'control: today is day 3 of the streak').toBe(3);
    expect(store('wf_progress').hints_remaining).toBe(5 + 2);
    expect(container.querySelector('[data-testid="streak-bonus"]')).toBeNull();
    expect(store(STREAK_AWARD_KEY)).toBeNull();
  });
});
