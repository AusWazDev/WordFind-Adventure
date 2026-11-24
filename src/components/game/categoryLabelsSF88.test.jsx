// @vitest-environment jsdom
// CR-142 (brief SF-88): copy fixes, display text only.
//   1. The generic Mystery Word clue takes "A" or "An" by how its number is said.
//   2. The Colours category is labelled "Colours" (its id stays "colors").
//   3. The Stats category chart shows player-facing labels, still grouped by stored id.
//   4. Random is "Random Mix" in the picker, the game header and Stats.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('@/lib/platform', () => ({ isWindowsApp: () => false, isNative: () => true, getPlatform: () => 'android' }));
vi.mock('@/lib/purchases', () => ({ purchaseProduct: vi.fn(), usePrice: () => null, REMOVE_ADS_PRODUCT_ID: 'x' }));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), captureMessage: vi.fn(), addBreadcrumb: vi.fn() }));
// jsdom has no layout, so ResponsiveContainer would measure 0 x 0 and draw nothing.
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => React.cloneElement(children, { width: 600, height: 240 }),
  };
});

const gameUtils = await import('./gameUtils');
const { generateGame, categoryBonusWordPairs } = gameUtils;
const { CATEGORY_LABELS } = await import('@/lib/constants');
const { default: CategorySelector } = await import('./CategorySelector');
const { default: GameHeader } = await import('./GameHeader');
const StatsModule = await import('@/pages/Stats');

let container, root;
async function render(el) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(el));
}
afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  localStorage.clear();
});

// The 14 Mystery Word categories plus Random, as the picker lists them.
const IDS = ['random', 'animals', 'food', 'nature', 'colors', 'sports', 'space', 'music', 'countries',
  'science', 'mythology', 'technology', 'ocean', 'history', 'emotions'];

// "An" where the number is said with a vowel sound first. Written out here, not taken
// from the code under test: eight, eleven, eighteen, eighty to eighty-nine.
const SAID_WITH_A_VOWEL = new Set([8, 11, 18, ...Array.from({ length: 10 }, (_, i) => 80 + i)]);

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

describe('generic clue article (CR-142, step 1)', () => {
  it('says "An" for 8, 11, 18 and 80 to 89, and "A" for every other number to 99', () => {
    expect(typeof gameUtils.articleForNumber, 'articleForNumber is exported').toBe('function');
    const bad = [];
    for (let n = 1; n <= 99; n++) {
      const want = SAID_WITH_A_VOWEL.has(n) ? 'An' : 'A';
      if (gameUtils.articleForNumber(n) !== want) bad.push(`${n}: got ${gameUtils.articleForNumber(n)}, want ${want}`);
    }
    // Larger numbers, by how they are said.
    const more = { 100: 'A', 108: 'A', 110: 'A', 111: 'A', 118: 'A', 180: 'A', 800: 'An', 811: 'An',
      1100: 'A', 8000: 'An', 11000: 'An', 18000: 'An', 110000: 'A' };
    for (const [n, want] of Object.entries(more)) {
      if (gameUtils.articleForNumber(Number(n)) !== want) bad.push(`${n}: got ${gameUtils.articleForNumber(Number(n))}, want ${want}`);
    }
    expect(bad, bad.slice(0, 3).join('; ')).toEqual([]);
  });

  it('puts the right article on every generic clue that occurs, in both forms', () => {
    const bad = [];
    const seen = new Set();
    const real = Math.random;
    try {
      for (const id of IDS) {
        const pairs = new Set((categoryBonusWordPairs[id] || []).map(e => e.word.toUpperCase()));
        for (const level of [1, 2, 3]) {
          for (let seed = 1; seed <= 60; seed++) {
            Math.random = mulberry32(seed * 977 + level * 31 + IDS.indexOf(id));
            const { bonusWord, bonusHint } = generateGame(level, id, false, true);
            Math.random = real;
            if (pairs.has(bonusWord)) continue;
            const n = bonusWord.length;
            seen.add(n);
            const want = SAID_WITH_A_VOWEL.has(n) ? 'An' : 'A';
            if (!bonusHint.startsWith(`${want} ${n}-letter `)) bad.push(`${id}/${level} seed ${seed}: "${bonusHint}"`);
          }
        }
      }
    } finally {
      Math.random = real;
    }
    // The lengths that need "An" must actually have been exercised.
    expect(seen.has(8) && seen.has(11), `lengths seen: ${[...seen].sort((a, b) => a - b)}`).toBe(true);
    expect(bad.length, `${bad.length} cases, first: ${bad.slice(0, 3).join('; ')}`).toBe(0);
  });
});

describe('category labels (CR-142, steps 2 and 4)', () => {
  it('labels Colours and Random Mix, keeping their ids', () => {
    expect(CATEGORY_LABELS.colors).toBe('Colours');
    expect(CATEGORY_LABELS.random).toBe('Random Mix');
    expect(CATEGORY_LABELS.Colours).toBeUndefined(); // the label is never a key
  });

  it('shows the same label in the picker as in CATEGORY_LABELS, for every category', async () => {
    await render(<CategorySelector onSelectCategory={() => {}} />);
    const shown = [...container.querySelectorAll('h4')].map(h => h.textContent);
    expect(shown).toEqual(IDS.map(id => CATEGORY_LABELS[id]));
    expect(shown).toContain('Colours');
    expect(shown).toContain('Random Mix');
    expect(shown).not.toContain('Colors');
    expect(shown).not.toContain('Random');
  });

  // SF-89: the Random Mix blurb no longer repeats "Mix".
  it('describes Random Mix as "A bit of everything!"', async () => {
    await render(<CategorySelector onSelectCategory={() => {}} />);
    const random = [...container.querySelectorAll('h4')].find(h => h.textContent === 'Random Mix');
    const blurb = random.closest('button').querySelector('p').textContent;
    expect(blurb).toBe('A bit of everything!');
    expect(container.textContent).not.toContain('Mix of everything!');
  });

  it('passes the id, not the label, when a category is picked', async () => {
    const picked = [];
    await render(<CategorySelector onSelectCategory={id => picked.push(id)} />);
    const colours = [...container.querySelectorAll('h4')].find(h => h.textContent === 'Colours');
    await act(async () => colours.closest('button').click());
    expect(picked).toEqual(['colors']);
  });

  it('shows Colours and Random Mix in the game header', async () => {
    for (const [id, label] of [['colors', 'Colours'], ['random', 'Random Mix']]) {
      await render(
        <GameHeader score={0} hintsRemaining={1} wordsFound={0} totalWords={6} level={1} gameMode="standard"
          category={id} onBack={() => {}} onUseHint={() => {}} />
      );
      expect(container.textContent).toContain(label);
      expect(container.textContent).not.toMatch(/\bColors\b/);
      await act(async () => root.unmount());
      container.remove();
      root = null;
    }
  });
});

describe('Stats category chart (CR-142, step 3)', () => {
  it('groups stored ids and labels them for players: stored "colors" shows as "Colours"', () => {
    expect(typeof StatsModule.categoryChartData, 'categoryChartData is exported').toBe('function');
    const records = [{ category: 'colors' }, { category: 'colors' }, { category: 'random' }, { category: 'food' }, {}];
    expect(StatsModule.categoryChartData(records)).toEqual([
      { id: 'colors', name: 'Colours', count: 2 },
      { id: 'random', name: 'Random Mix', count: 1 },
      { id: 'food', name: 'Food', count: 1 },
    ]);
  });

  it('renders the labels, not the ids, on the chart from records stored before this change', async () => {
    // Daily records as the app stores them: keyed by date, category by id.
    localStorage.setItem('wf_daily', JSON.stringify({
      '2026-11-01': { completed: true, score: 10, category: 'colors' },
      '2026-11-02': { completed: true, score: 12, category: 'colors' },
      '2026-11-03': { completed: true, score: 9, category: 'random' },
      '2026-11-04': { completed: true, score: 7, category: 'countries' },
    }));
    await render(<StatsModule.default />);
    const ticks = [...container.querySelectorAll('.recharts-xAxis .recharts-cartesian-axis-tick-value')].map(t => t.textContent);
    expect(ticks).toEqual(['Colours', 'Random Mix', 'Countries']);
    for (const raw of ['colors', 'random', 'countries']) expect(ticks).not.toContain(raw);
  });
});
