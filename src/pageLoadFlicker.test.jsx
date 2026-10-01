// @vitest-environment jsdom
// FB-2 (CR-75): pages paint their real content on the first frame, with no
// page-level entry animation and no page slide. Modal and victory animations
// (player-triggered) are out of scope and are not in these files.
//
// First render is checked with renderToString, which runs no effects: data that
// only arrives in a useEffect is absent from it, which is exactly the frame the
// player saw flicker.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/platform', () => ({ isNative: () => false, getPlatform: () => 'web' }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));

const { default: Stats } = await import('@/pages/Stats');
const { default: Home } = await import('@/pages/Home');

const PAGE_FILES = ['src/Layout.jsx', 'src/pages/Home.jsx', 'src/pages/Settings.jsx', 'src/pages/Stats.jsx', 'src/components/game/DailyChallengeCard.jsx'];
const read = f => readFileSync(f, 'utf8');

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('wf_progress', JSON.stringify({ id: 'local', current_level: 3, total_score: 4242, hints_remaining: 7, games_played: 37, words_found: 290, best_streak: 5 }));
  localStorage.setItem('wf_welcome_seen', 'true');
});

describe('first render shows the data (FB-2)', () => {
  it('Stats: the saved score is in the first render, with no loading spinner', () => {
    const html = renderToString(<MemoryRouter><Stats /></MemoryRouter>);
    expect(html).toContain('My Stats'); // control: the page rendered at all
    expect(html).toMatch(/4,?242/); // the saved total score, formatted or not
    expect(html).not.toContain('animate-spin');
    expect(html).not.toMatch(/border-t-transparent rounded-full/); // the old loading spinner
  });

  it('Home: the saved score and hint count are in the first render', () => {
    const html = renderToString(<MemoryRouter><Home /></MemoryRouter>);
    expect(html).toMatch(/4,?242/);
    expect(html).toMatch(/>7</); // the hint chip
  });
});

describe('no page-level transition or entry animation (FB-2)', () => {
  it('the scanned files exist and are read (control)', () => {
    for (const f of PAGE_FILES) expect(read(f).length, f).toBeGreaterThan(200);
  });

  it('no page-level motion element has an `initial` prop', () => {
    const hits = PAGE_FILES.flatMap(f => read(f).split('\n').map((line, i) => (/\binitial=\{/.test(line) ? `${f}:${i + 1}` : null)).filter(Boolean));
    expect(hits).toEqual([]);
  });

  it('Layout has no AnimatePresence page slide', () => {
    expect(read('src/Layout.jsx')).not.toMatch(/AnimatePresence/);
  });

  it('Game and DailyChallenge measure the board before paint (useLayoutEffect)', () => {
    for (const f of ['src/pages/Game.jsx', 'src/pages/DailyChallenge.jsx']) {
      expect(read(f), f).toMatch(/useLayoutEffect\(\(\) => \{(?: *\/\/[^\n]*)?\s*function measure\(\)/);
    }
  });
});
