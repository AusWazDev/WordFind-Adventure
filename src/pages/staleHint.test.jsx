// @vitest-environment jsdom
// FB-22 (CR-85): a hint whose cell lies inside a DIFFERENT word is cleared when that
// other word is found, in normal play (Game.jsx) and in the Daily (its own copy of
// the hint logic). DEF-28's clear when the hinted word itself is found is unchanged.
// Both pages render for real with the real WordList. The board, header, modals,
// game generator and voiceUtils are replaced, and Math.random is stubbed so the
// header hint picks CAKE, whose first cell (0,3) is the C inside PANCAKE.
process.env.TZ = 'Australia/Melbourne';

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const cells = list => list.map(([row, col]) => ({ row, col }));
const FIXED_GAME = {
  words: ['pancake', 'cake', 'dog'],
  wordPositions: {
    PANCAKE: cells([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]]),
    CAKE: cells([[0, 3], [1, 3], [2, 3], [3, 3]]),               // runs down from PANCAKE's C
    DOG: cells([[5, 0], [5, 1], [5, 2]]),
  },
  grid: Array.from({ length: 8 }, () => Array(8).fill('X')),
  gridSize: 8,
};

const board = { props: null };
const header = { props: null };
vi.mock('@/components/game/GameBoard', () => ({ default: props => { board.props = props; return null; } }));
vi.mock('@/components/game/GameHeader', () => ({ default: props => { header.props = props; return null; } }));
vi.mock('@/components/game/HintModal', () => ({ default: () => null }));
vi.mock('@/components/game/VictoryModal', () => ({ default: () => null }));
vi.mock('@/components/game/voiceUtils', () => ({
  stopAllAudio: vi.fn(), unlockAudio: vi.fn(() => Promise.resolve()), preloadGameAudio: vi.fn(),
  speakPhraseAndWord: vi.fn(), speakFixedPhrase: vi.fn(), speakWordAudio: vi.fn(), speakSentenceAudio: vi.fn(),
}));
vi.mock('@/components/game/gameUtils', async importOriginal => ({ ...(await importOriginal()), generateGame: () => FIXED_GAME }));
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
const renderGame = () => render(<MemoryRouter initialEntries={['/Game?mode=standard&level=1']}><Game /></MemoryRouter>);
const renderDaily = () => render(<MemoryRouter><DailyChallenge /></MemoryRouter>);
async function find(word) { await act(async () => { board.props.onWordFound(word.toUpperCase(), FIXED_GAME.wordPositions[word.toUpperCase()]); }); await flush(); }
const dailyHintButton = () => [...container.querySelectorAll('button')].find(b => b.textContent.includes('Hint ('));
// The word list's rows, top to bottom, as { word, struck }.
const rows = () => [...container.querySelectorAll('span.font-medium')].map(s => ({ word: s.textContent, struck: s.className.includes('line-through') }));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-30T02:00:00Z'));
  localStorage.clear();
  localStorage.setItem('wf_progress', JSON.stringify({ id: 'local', current_level: 1, total_score: 0, hints_remaining: 5, games_played: 0, words_found: 0, best_streak: 0 }));
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  Element.prototype.getBoundingClientRect = () => ({ width: 320, height: 320, top: 0, left: 0, right: 320, bottom: 320, x: 0, y: 0 });
  board.props = null; header.props = null;
  vi.spyOn(Math, 'random').mockReturnValue(0.4);            // unfound [pancake, cake, dog] -> index 1, CAKE
});
afterEach(async () => { await act(async () => root?.unmount()); container?.remove(); vi.useRealTimers(); vi.restoreAllMocks(); });

const PAGES = [
  ['Game', renderGame, async () => { await act(async () => { header.props.onUseHint(); }); await flush(); }],
  ['Daily', renderDaily, async () => { await act(async () => { dailyHintButton().click(); }); await flush(); }],
];

for (const [name, renderPage, useHint] of PAGES) {
  describe(`${name}: a hint inside another word (FB-22)`, () => {
    it('control: the header hint lands on CAKE\'s first cell, inside PANCAKE', async () => {
      await renderPage();
      await useHint();
      expect(board.props.hintCells).toEqual([{ row: 0, col: 3 }]);
    });

    it('finding PANCAKE clears the CAKE hint, and PANCAKE is struck through and last', async () => {
      await renderPage();
      await useHint();
      await find('pancake');
      expect(board.props.hintCells).toEqual([]);
      const r = rows();
      expect(r.map(x => x.word)).toEqual(['CAKE', 'DOG', 'PANCAKE']);
      expect(r.find(x => x.word === 'PANCAKE').struck).toBe(true);
      expect(r.filter(x => x.struck).length).toBe(1);
    });

    it('DEF-28 unchanged: finding the hinted word itself still clears the hint', async () => {
      await renderPage();
      await useHint();
      await find('cake');
      expect(board.props.hintCells).toEqual([]);
    });
  });
}
