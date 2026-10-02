// @vitest-environment jsdom
// CR-84 (S27, S28, FB-18, FB-19): the Daily Challenge page, rendered for real as
// in DailyChallenge.test.jsx. The template, the generated game and voiceUtils
// are replaced so each case is exact; storage, scoring and the page run as shipped.
//   S27: a timed Daily's limit scales with the game's word count (12 s a word for
//        standard, 15 for anagram and association, 20 for audio); untimed stays untimed.
//   S28: the reward hints are given once per day; a repeat completion gives none
//        and leaves the day's record and the streak alone.
//   FB-19: an audio-mode Daily speaks found words the way normal play does.
process.env.TZ = 'Australia/Melbourne';

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// A game of n words, each on its own row.
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXY';
function makeGame(n) {
  const words = Array.from({ length: n }, (_, i) => `W${LETTERS[i]}`.toLowerCase() + 'ord');
  const wordPositions = Object.fromEntries(words.map((w, r) => [w.toUpperCase(), Array.from({ length: w.length }, (_, c) => ({ row: r, col: c }))]));
  return { words, wordPositions, grid: Array.from({ length: 25 }, () => Array(25).fill('X')), gridSize: 25 };
}

const state = { template: null, game: null };
const board = { props: null };
const voice = vi.hoisted(() => ({
  stopAllAudio: vi.fn(),
  unlockAudio: vi.fn(() => Promise.resolve()),
  speakPhraseAndWord: vi.fn(),
  speakFixedPhrase: vi.fn(),
}));
vi.mock('@/components/game/voiceUtils', () => voice);
vi.mock('@/components/game/GameBoard', () => ({ default: props => { board.props = props; return null; } }));
vi.mock('@/components/game/WordList', () => ({ default: () => null }));
vi.mock('@/components/game/AnagramWordList', () => ({ default: () => null }));
vi.mock('@/components/game/AssociationWordList', () => ({ default: () => null }));
vi.mock('@/components/game/HintModal', () => ({ default: () => null }));
vi.mock('@/components/game/gameUtils', async importOriginal => ({ ...(await importOriginal()), generateGame: () => state.game }));
vi.mock('@/components/game/DailyChallengeUtils', async importOriginal => ({ ...(await importOriginal()), getDailyChallengeConfig: () => ({ ...state.template, date: '2026-09-30' }) }));

const { default: DailyChallenge } = await import('./DailyChallenge');

// Templates carry both the old fixed limit (time_limit, read before CR-84) and the
// new flag (timed, read from CR-84), so each case means the same on both codes.
const T = (mode, level, time_limit, extra = {}) => ({ title: 'T', description: '', category: 'animals', mode, level, time_limit, timed: time_limit > 0, bonus_multiplier: 2, reward_hints: 2, ...extra });
const SEED_PROGRESS = { id: 'local', current_level: 1, total_score: 100, hints_remaining: 5, games_played: 3, words_found: 20, best_streak: 2 };

let container, root;
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 0)); }); };
const store = key => JSON.parse(localStorage.getItem(key) || 'null');
async function renderPage(template, words) {
  state.template = template;
  state.game = makeGame(words);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root.render(<MemoryRouter><DailyChallenge /></MemoryRouter>); });
  await flush();
}
const countdown = () => (container.textContent.match(/\b\d\d:\d\d\b/) || [null])[0];
async function find(word) { await act(async () => { board.props.onWordFound(word.toUpperCase(), state.game.wordPositions[word.toUpperCase()]); }); await flush(); }
async function findAll() { for (const w of state.game.words) await find(w); }

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-30T02:00:00Z')); // 12:00 AEST
  localStorage.clear();
  localStorage.setItem('wf_progress', JSON.stringify(SEED_PROGRESS));
  localStorage.setItem('wf_daily', JSON.stringify({ '2026-09-29': { completed: true, streak: 2 } }));
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  Element.prototype.getBoundingClientRect = () => ({ width: 320, height: 320, top: 0, left: 0, right: 320, bottom: 320, x: 0, y: 0 });
  board.props = null;
  Object.values(voice).forEach(f => f.mockClear());
});
afterEach(async () => { await act(async () => root?.unmount()); container?.remove(); vi.useRealTimers(); });

describe('S27: the limit scales with the word count', () => {
  it('apparatus: the page renders the chosen game', async () => {
    await renderPage(T('standard', 2, 90), 10);
    expect(board.props.wordPositions && Object.keys(board.props.wordPositions).length).toBe(10);
  });
  it('standard, 10 words: 2:00 (12 s a word)', async () => { await renderPage(T('standard', 2, 90), 10); expect(countdown()).toBe('02:00'); });
  it('standard, 15 words: 3:00', async () => { await renderPage(T('standard', 3, 120), 15); expect(countdown()).toBe('03:00'); });
  it('anagram, 15 words: 3:45 (15 s a word)', async () => { await renderPage(T('anagram', 3, 150), 15); expect(countdown()).toBe('03:45'); });
  it('association, 10 words: 2:30 (15 s a word)', async () => { await renderPage(T('association', 2, 120), 10); expect(countdown()).toBe('02:30'); });
  it('audio, 10 words: 3:20 (20 s a word)', async () => { await renderPage(T('audio', 2, 180), 10); expect(countdown()).toBe('03:20'); });
  it('an untimed template stays untimed', async () => {
    await renderPage(T('standard', 4, 0), 20);
    expect(countdown()).toBeNull();
    expect(container.textContent).toContain('words');            // control: the info bar rendered
  });
});

describe('S28: the reward is once per day', () => {
  it('the first completion adds the reward hints and the streak', async () => {
    await renderPage(T('standard', 2, 90), 3);
    await findAll();
    expect(store('wf_progress').hints_remaining).toBe(5 + 2);
    expect(store('wf_daily')['2026-09-30']).toMatchObject({ completed: true, streak: 3, words_found: 3 });
    expect(store('wf_progress').best_streak).toBe(3);
    expect(container.textContent).toContain('+2 hints added to your account!');
  });

  it('a second completion the same day adds 0 hints and leaves the record and streak unchanged', async () => {
    const first = { completed: true, score: 999, words_found: 3, total_words: 3, time_taken: 40, streak: 3, category: 'animals' };
    localStorage.setItem('wf_daily', JSON.stringify({ '2026-09-29': { completed: true, streak: 2 }, '2026-09-30': first }));
    localStorage.setItem('wf_progress', JSON.stringify({ ...SEED_PROGRESS, best_streak: 3 }));
    await renderPage(T('standard', 2, 90), 3);
    expect(container.textContent).toContain('playing for fun');   // control: the page knows the day is done
    await findAll();
    const p = store('wf_progress');
    expect(p.hints_remaining).toBe(5);                           // no reward
    expect(store('wf_daily')['2026-09-30']).toEqual(first);      // record untouched
    expect(p.best_streak).toBe(3);                               // streak untouched
    expect(p.games_played).toBe(4);                              // still counts as a game
    expect(p.words_found).toBe(23);
    expect(p.total_score).toBeGreaterThan(100);
    expect(container.textContent).not.toContain('hints added to your account');
  });
});

describe('FB-19: found-word audio in an audio-mode Daily', () => {
  it('a found word speaks "Great! You found…" and the word; the last one speaks the game-complete phrase', async () => {
    await renderPage(T('audio', 2, 180), 3);
    const [a, b, c] = state.game.words;
    await find(a);
    expect(voice.speakPhraseAndWord).toHaveBeenCalledTimes(1);
    expect(voice.speakPhraseAndWord.mock.calls[0].slice(0, 3)).toEqual(['great_you_found', a, `Great! You found ${a}!`]);
    await find(b);
    await find(c);
    expect(voice.speakPhraseAndWord).toHaveBeenCalledTimes(2);  // not for the last word
    expect(voice.speakFixedPhrase).toHaveBeenCalledTimes(1);
    expect(voice.speakFixedPhrase.mock.calls[0].slice(0, 2)).toEqual(['game_complete', 'Incredible! You found all the words!']);
    expect(voice.unlockAudio).toHaveBeenCalled();
  });

  it('a non-audio Daily speaks neither', async () => {
    await renderPage(T('standard', 2, 90), 3);
    await findAll();
    expect(store('wf_daily')['2026-09-30']?.completed).toBe(true);  // control: the game was completed
    expect(voice.speakPhraseAndWord).not.toHaveBeenCalled();
    expect(voice.speakFixedPhrase).not.toHaveBeenCalled();
  });
});
