// @vitest-environment jsdom
// SF-62 (U8): Game and the Daily tell GameBoard whether a released selection was
// 'found', a 'miss', or 'ignored', and a miss changes nothing: no score, hints,
// progress, sound or vibration. The found path is unchanged (its effects are pinned by
// the existing page tests; here only its answer). Harness as in staleHint.test.jsx.
process.env.TZ = 'Australia/Melbourne';

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const cells = list => list.map(([row, col]) => ({ row, col }));
const BASE = {
  words: ['pancake', 'cake', 'dog'],
  wordPositions: {
    PANCAKE: cells([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]]),
    CAKE: cells([[0, 3], [1, 3], [2, 3], [3, 3]]),
    DOG: cells([[5, 0], [5, 1], [5, 2]]),
  },
  grid: Array.from({ length: 8 }, () => Array(8).fill('X')),
  gridSize: 8,
};
const WITH_BONUS = { ...BASE, bonusWord: 'HEN', bonusHint: 'A bird', bonusLetterPositions: cells([[7, 0], [7, 1], [7, 2]]) };
let game = BASE;

const board = { props: null };
const header = { props: null };
const voice = vi.hoisted(() => ({
  stopAllAudio: () => {}, unlockAudio: () => Promise.resolve(), preloadGameAudio: () => {},
  speakPhraseAndWord: null, speakFixedPhrase: null, speakWordAudio: null, speakSentenceAudio: null,
}));
vi.mock('@/components/game/GameBoard', () => ({ default: props => { board.props = props; return null; } }));
vi.mock('@/components/game/GameHeader', () => ({ default: props => { header.props = props; return null; } }));
vi.mock('@/components/game/HintModal', () => ({ default: () => null }));
vi.mock('@/components/game/VictoryModal', () => ({ default: () => null }));
vi.mock('@/components/game/voiceUtils', () => voice);
vi.mock('@/components/game/gameUtils', async importOriginal => ({ ...(await importOriginal()), generateGame: () => game }));
vi.mock('@/components/game/DailyChallengeUtils', async importOriginal => ({
  ...(await importOriginal()),
  getDailyChallengeConfig: () => ({ title: 'T', description: '', category: 'animals', mode: 'standard', level: 2, timed: false, time_limit: 0, bonus_multiplier: 1, reward_hints: 1, date: '2026-09-30' }),
}));

const { default: Game } = await import('./Game');
const { default: DailyChallenge } = await import('./DailyChallenge');

let container, root;
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 0)); }); };
async function render(el) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root.render(el); });
  await flush();
}
let answer;
const select = async (letters, positions) => { await act(async () => { answer = board.props.onWordFound(letters, positions); }); await flush(); return answer; };
const pos = w => BASE.wordPositions[w];
const PROGRESS = JSON.stringify({ id: 'local', current_level: 1, total_score: 0, hints_remaining: 5, games_played: 0, words_found: 0, best_streak: 0 });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-30T02:00:00Z'));
  localStorage.clear();
  localStorage.setItem('wf_progress', PROGRESS);
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  Element.prototype.getBoundingClientRect = () => ({ width: 320, height: 320, top: 0, left: 0, right: 320, bottom: 320, x: 0, y: 0 });
  for (const k of ['speakPhraseAndWord', 'speakFixedPhrase', 'speakWordAudio', 'speakSentenceAudio']) voice[k] = vi.fn();
  navigator.vibrate = vi.fn();
  board.props = null; header.props = null; game = BASE;
});
afterEach(async () => { await act(async () => root?.unmount()); container?.remove(); vi.useRealTimers(); });

const PAGES = [
  ['Game', mode => render(<MemoryRouter initialEntries={[`/Game?mode=${mode}&level=1`]}><Game /></MemoryRouter>)],
  ['Daily', () => render(<MemoryRouter><DailyChallenge /></MemoryRouter>)],
];

for (const [name, renderPage] of PAGES) {
  describe(`${name}: found, miss or ignored (U8)`, () => {
    it('a word found answers found; the same word again, either way round, is ignored', async () => {
      await renderPage('standard');
      expect(await select('PANCAKE', pos('PANCAKE'))).toBe('found');
      expect(await select('PANCAKE', pos('PANCAKE'))).toBe('ignored');
      expect(await select('EKACNAP', [...pos('PANCAKE')].reverse())).toBe('ignored');
    });

    it('letters that are no word are a miss, and change nothing (score, hints, progress, sound, vibration)', async () => {
      await renderPage('standard');
      const scoreBefore = name === 'Game' ? header.props.score : null;
      expect(await select('XXX', cells([[4, 0], [4, 1], [4, 2]]))).toBe('miss');
      expect(localStorage.getItem('wf_progress')).toBe(PROGRESS);
      if (name === 'Game') {
        expect(header.props.score).toBe(scoreBefore);
        expect(header.props.hintsRemaining).toBe(5);
      }
      for (const k of ['speakPhraseAndWord', 'speakFixedPhrase', 'speakWordAudio', 'speakSentenceAudio']) expect(voice[k]).not.toHaveBeenCalled();
      expect(navigator.vibrate).not.toHaveBeenCalled();
      expect(board.props.foundWords).toEqual([]);
    });

    it('a real word in the wrong place (CAKE along PANCAKE) is a miss, not found', async () => {
      await renderPage('standard');
      expect(await select('CAKE', cells([[0, 3], [0, 4], [0, 5], [0, 6]]))).toBe('miss');
      expect(board.props.foundWords).toEqual([]);
    });
  });
}

describe('ignored, not a miss, when the round is past finding words', () => {
  it('Game, Mystery Word: any drag in the bonus phase is ignored', async () => {
    game = WITH_BONUS;
    await PAGES[0][1]('mystery_word');
    for (const w of ['PANCAKE', 'CAKE', 'DOG']) expect(await select(w, pos(w))).toBe('found');
    expect(board.props.bonusHuntActive, 'control: the bonus phase started').toBe(true);
    expect(await select('XXX', cells([[4, 0], [4, 1], [4, 2]]))).toBe('ignored');
  });

  it('Daily: a drag after the last word (victory) is ignored', async () => {
    await PAGES[1][1]();
    for (const w of ['PANCAKE', 'CAKE', 'DOG']) expect(await select(w, pos(w))).toBe('found');
    expect(await select('XXX', cells([[4, 0], [4, 1], [4, 2]]))).toBe('ignored');
  });
});
