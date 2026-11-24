// CR-139 (brief SF-85; decisions S49 and S50): Mystery Word picks its word first, in
// category, always; listed words obey the level's length rule and word count.
// CR-140 (brief SF-86; S51): the word may come from the category's bonus pairs or its
// full word list.
// CR-141 (brief SF-87; S52): one game in three a bonus pair, otherwise a list word of 6
// letters or more; the generic clue names the category by its player-facing label.
//
// Sweeps every combination Mystery Word can be played in (the SF-84 denominator):
// the 14 categories in CategorySelector.jsx at levels 1 to 3 (LevelSelector.jsx caps a
// specific category at Hard), plus Random at levels 1 to 5. 47 combinations, SEEDS games
// each, with Math.random replaced by a seeded generator so a failure names a
// reproducible case. Expectations are built here from the raw data, not from the
// code under test.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { generateGame, levelConfig, wordLists, categoryBonusWordPairs } from './gameUtils';
import { CATEGORY_LABELS } from '../../lib/constants';

const SEEDS = 40;
const CATEGORIES = ['animals', 'food', 'nature', 'colors', 'sports', 'space', 'music', 'countries',
  'science', 'mythology', 'technology', 'ocean', 'history', 'emotions'];
const COMBOS = [
  ...CATEGORIES.flatMap(c => [1, 2, 3].map(l => [c, l])),
  ...[1, 2, 3, 4, 5].map(l => ['random', l]),
];

const upper = (arr) => arr.map(w => w.toUpperCase());
// "In category": the category's bonus pairs and word list. Random's pool: the 'random'
// bonus pairs plus every category's word list.
function poolFor(category) {
  if (category === 'random') {
    return new Set([...upper(categoryBonusWordPairs.random.map(e => e.word)), ...upper(Object.values(wordLists).flat())]);
  }
  return new Set([...upper(categoryBonusWordPairs[category].map(e => e.word)), ...upper(wordLists[category])]);
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const games = [];
// S52 share batch: 600 games per category (200 seeds at each of levels 1 to 3; Random
// 120 at each of 1 to 5). With p = 1/3 the standard deviation of the share is
// sqrt(0.222 / 600), about 1.9 points, so the 25% and 42% bounds sit 4.3 and 4.5
// standard deviations away: about 2 in 100,000 per category, 3 in 10,000 across all
// 15, that an unrelated change to the random sequence trips the check.
const SHARE_GAMES_PER_CATEGORY = 600;
const shareGames = [];
// Math.random is swapped directly, not with vi.spyOn: a spy records every call, and
// the pre-fix generator made enough calls to exhaust the worker's memory.
const realRandom = Math.random;

function generateSeeded(out, seedsPerCombo, seedBase) {
  for (const [category, level] of COMBOS) {
    const n = typeof seedsPerCombo === 'function' ? seedsPerCombo(category) : seedsPerCombo;
    for (let seed = 1; seed <= n; seed++) {
      Math.random = mulberry32(seedBase + seed * 1000 + level * 100 + COMBOS.findIndex(c => c[0] === category && c[1] === level));
      out.push({ category, level, seed, game: generateGame(level, category, false, true) });
    }
  }
}

beforeAll(() => {
  try {
    generateSeeded(games, SEEDS, 0);
    generateSeeded(shareGames, (c) => SHARE_GAMES_PER_CATEGORY / (c === 'random' ? 5 : 3), 7_000_000);
  } finally {
    Math.random = realRandom;
  }
});

afterAll(() => { Math.random = realRandom; });

const label = ({ category, level, seed }) => `${category}/${level} seed ${seed}`;
// Assert on the count and name the first cases, so a failure reads as a number and
// three reproducible examples.
const firstFew = (bad) => `${bad.length} cases, first: ${bad.slice(0, 3).join('; ')}`;

describe('Mystery Word (CR-139, S49 and S50)', () => {
  it('sweeps all 47 combinations', () => {
    expect(COMBOS).toHaveLength(47);
    expect(games).toHaveLength(47 * SEEDS);
  });

  it('always has a mystery word, written into its gold cells in reading order (S49)', () => {
    const bad = [];
    for (const g of games) {
      const { bonusWord, bonusLetterPositions, grid } = g.game;
      if (!bonusWord) { bad.push(`${label(g)}: no mystery word`); continue; }
      const spelled = (bonusLetterPositions || []).map(p => grid[p.row][p.col]).join('');
      if (spelled !== bonusWord) bad.push(`${label(g)}: cells spell ${spelled}, word ${bonusWord}`);
      const order = (bonusLetterPositions || []).map(p => p.row * g.game.gridSize + p.col);
      if (order.some((v, i) => i > 0 && v <= order[i - 1])) bad.push(`${label(g)}: cells not in reading order`);
    }
    expect(bad.length, firstFew(bad)).toBe(0);
  });

  it('takes the mystery word from the selected category, or the Random pool (S49)', () => {
    const bad = [];
    for (const g of games) {
      const w = g.game.bonusWord;
      if (w && !poolFor(g.category).has(w)) bad.push(`${label(g)}: ${w} is not in ${g.category}`);
    }
    expect(bad.length, firstFew(bad)).toBe(0);
  });

  it("draws mystery words from the category's word list too, never from outside it (S51, CR-140)", () => {
    const bad = [];
    const listSourced = {};
    for (const g of games) {
      const w = g.game.bonusWord;
      if (!w) continue;
      const pairs = new Set(upper((categoryBonusWordPairs[g.category] || []).map(e => e.word)));
      if (pairs.has(w)) continue;
      const lists = g.category === 'random' ? new Set(upper(Object.values(wordLists).flat())) : new Set(upper(wordLists[g.category]));
      if (!lists.has(w)) bad.push(`${label(g)}: ${w} is neither a bonus pair nor a list word of ${g.category}`);
      const key = `${g.category}/${g.level}`;
      listSourced[key] = (listSourced[key] || 0) + 1;
    }
    for (const [category, level] of COMBOS) {
      if (!listSourced[`${category}/${level}`]) bad.push(`${category}/${level}: no list-sourced mystery word in ${SEEDS} seeds`);
    }
    expect(bad.length, firstFew(bad)).toBe(0);
  });

  it('never also lists the mystery word, and never lets a listed word cross a gold cell', () => {
    const bad = [];
    for (const g of games) {
      const { bonusWord, bonusLetterPositions, words, wordPositions } = g.game;
      if (!bonusWord) continue;
      if (upper(words).includes(bonusWord)) bad.push(`${label(g)}: ${bonusWord} is also listed`);
      const gold = new Set((bonusLetterPositions || []).map(p => `${p.row},${p.col}`));
      for (const w of words) {
        if ((wordPositions[w.toUpperCase()] || []).some(p => gold.has(`${p.row},${p.col}`))) {
          bad.push(`${label(g)}: ${w} crosses a gold cell`);
        }
      }
    }
    expect(bad.length, firstFew(bad)).toBe(0);
  });

  it("gives every listed word a length inside the level's minWordLen and maxWordLen (S50)", () => {
    const bad = [];
    for (const g of games) {
      const { minWordLen, maxWordLen } = levelConfig[g.level];
      for (const w of g.game.words) {
        if (w.length < minWordLen || w.length > maxWordLen) bad.push(`${label(g)}: ${w} (${w.length}) outside ${minWordLen} to ${maxWordLen}`);
      }
    }
    expect(bad.length, firstFew(bad)).toBe(0);
  });

  it("lists no more words than the level's configured count, and all are in category (S50)", () => {
    const bad = [];
    for (const g of games) {
      const { wordCount } = levelConfig[g.level];
      if (g.game.words.length > wordCount) bad.push(`${label(g)}: ${g.game.words.length} words listed, level allows ${wordCount}`);
      const lists = g.category === 'random' ? new Set(upper(Object.values(wordLists).flat())) : new Set(upper(wordLists[g.category]));
      for (const w of g.game.words) if (!lists.has(w.toUpperCase())) bad.push(`${label(g)}: listed ${w} is not in ${g.category}`);
    }
    expect(bad.length, firstFew(bad)).toBe(0);
  });

  it('uses the bonus pair hint, or the generic category hint, with no dash', () => {
    const bad = [];
    for (const g of games) {
      const { bonusWord, bonusHint } = g.game;
      if (!bonusWord) continue;
      const pairs = categoryBonusWordPairs[g.category] || [];
      const pair = pairs.find(e => e.word.toUpperCase() === bonusWord);
      // CR-141: the generic clue names the category by its player-facing label.
      const generic = g.category === 'random'
        ? `A ${bonusWord.length}-letter mystery word 🔎`
        : `A ${bonusWord.length}-letter word from ${CATEGORY_LABELS[g.category]} 🔎`;
      if (bonusHint !== (pair ? pair.hint : generic)) bad.push(`${label(g)}: hint "${bonusHint}"`);
      if (/[–—]|--| - /.test(bonusHint || '')) bad.push(`${label(g)}: dash in "${bonusHint}"`);
    }
    expect(bad.length, firstFew(bad)).toBe(0);
  });

  it('makes bonus pairs 25 to 42% of each category\'s mystery words (S52)', () => {
    expect(shareGames).toHaveLength(15 * SHARE_GAMES_PER_CATEGORY);
    const bad = [];
    for (const category of [...CATEGORIES, 'random']) {
      const pairs = new Set(upper((categoryBonusWordPairs[category] || []).map(e => e.word)));
      const mine = shareGames.filter(g => g.category === category);
      const share = mine.filter(g => pairs.has(g.game.bonusWord)).length / mine.length;
      if (share < 0.25 || share > 0.42) bad.push(`${category}: bonus pairs ${(100 * share).toFixed(1)}% of ${mine.length} games`);
    }
    expect(bad.length, firstFew(bad)).toBe(0);
  });

  it('never takes a list word of fewer than 6 letters as the mystery word (S52)', () => {
    const bad = [];
    for (const g of [...games, ...shareGames]) {
      const w = g.game.bonusWord;
      if (!w) continue;
      const pairs = new Set(upper((categoryBonusWordPairs[g.category] || []).map(e => e.word)));
      if (!pairs.has(w) && w.length < 6) bad.push(`${label(g)}: list word ${w} has ${w.length} letters`);
    }
    expect(bad.length, firstFew(bad)).toBe(0);
  });

  it("names the category in a generic clue by its player-facing label, never its id (CR-141)", () => {
    const bad = [];
    for (const g of [...games, ...shareGames]) {
      if (g.category === 'random') continue;
      const { bonusWord, bonusHint } = g.game;
      const pair = (categoryBonusWordPairs[g.category] || []).find(e => e.word.toUpperCase() === bonusWord);
      if (!bonusWord || pair) continue;
      const name = CATEGORY_LABELS[g.category];
      if (!bonusHint.includes(name)) bad.push(`${label(g)}: "${bonusHint}" lacks "${name}"`);
      if (bonusHint.includes(g.category)) bad.push(`${label(g)}: "${bonusHint}" shows the id "${g.category}"`);
    }
    expect(bad.length, firstFew(bad)).toBe(0);
  });
});
