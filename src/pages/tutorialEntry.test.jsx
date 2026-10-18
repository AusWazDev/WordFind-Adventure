// @vitest-environment jsdom
// SF-64 (S43): the ways into and out of the guided first game. Resume sends only a
// player with no games played; Home's How to Play and Settings' Replay tutorial open
// replay mode; the first run's hand-off makes Home start the first puzzle through
// startLevel; Settings Reset clears wf_tutorial_done.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/platform', () => ({ isWindowsApp: () => false, isNative: () => true, getPlatform: () => 'android' }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), captureMessage: vi.fn(), addBreadcrumb: vi.fn() }));
vi.mock('@/lib/purchases', () => ({ purchaseProduct: vi.fn(), restorePurchases: vi.fn(), usePrice: () => null, useLowestPrice: () => null, REMOVE_ADS_PRODUCT_ID: 'x', PURCHASE_OPTIONS: [] }));
const ads = vi.hoisted(() => ({ calls: [] }));
vi.mock('@/lib/adCadence', () => ({
  showInterstitialBeforeGame: vi.fn(async gates => { ads.calls.push(gates); return false; }),
  interstitialDue: vi.fn(() => false), markInterstitialShown: vi.fn(), recordCompletedGame: vi.fn(),
}));
vi.mock('@/components/game/voiceUtils', () => ({
  unlockAudio: vi.fn(async () => {}), speakWordAudio: vi.fn(async () => {}), speakPhraseAndWord: vi.fn(),
  preloadGameAudio: vi.fn(), stopAllAudio: vi.fn(),
}));

const { default: Layout } = await import('@/Layout');
const { default: Home } = await import('./Home');
const { default: Settings } = await import('./Settings');

let container, root, location;
function Where() { location = useLocation(); return <div data-testid="elsewhere" />; }
async function render(entry) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
          <Route path="/Home" element={<Layout currentPageName="Home"><Home /></Layout>} />
          <Route path="/Settings" element={<Layout currentPageName="Settings"><Settings /></Layout>} />
          <Route path="/Tutorial" element={<Where />} />
          <Route path="/Game" element={<Where />} />
        </Routes>
      </MemoryRouter>,
    );
  });
  await act(async () => { await new Promise(r => setTimeout(r, 0)); });
}
beforeEach(() => {
  localStorage.clear();
  location = null; ads.calls = [];
  window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
  window.scrollTo = () => {}; Element.prototype.scrollTo = () => {};
});
afterEach(async () => { await act(async () => root?.unmount()); container?.remove(); });
const here = () => (location ? `${location.pathname}${location.search}` : null);
const clickButton = async match => {
  const b = [...document.querySelectorAll('button')].find(x => match(x));
  if (!b) throw new Error('button not found');
  await act(async () => { b.click(); });
  await act(async () => { await new Promise(r => setTimeout(r, 0)); });
};

describe('resume (SF-64)', () => {
  it('welcome seen, tutorial not done, no games played: Home goes to the tutorial\'s first run', async () => {
    localStorage.setItem('wf_welcome_seen', 'true');
    await render('/');
    expect(here()).toBe('/Tutorial?mode=first');
  });

  it('games_played 0 counts as none played', async () => {
    localStorage.setItem('wf_welcome_seen', 'true');
    localStorage.setItem('wf_progress', JSON.stringify({ games_played: 0, hints_remaining: 12 }));
    await render('/');
    expect(here()).toBe('/Tutorial?mode=first');
  });

  it('a player with games played is never redirected', async () => {
    localStorage.setItem('wf_welcome_seen', 'true');
    localStorage.setItem('wf_progress', JSON.stringify({ games_played: 2, hints_remaining: 12 }));
    await render('/');
    expect(here()).toBeNull();
    expect(document.body.textContent).toContain('Choose Game Mode');
  });

  it('nor is a player who finished or skipped the tutorial', async () => {
    localStorage.setItem('wf_welcome_seen', 'true');
    localStorage.setItem('wf_tutorial_done', 'true');
    await render('/');
    expect(here()).toBeNull();
  });

  it('a new player gets the welcome, not the tutorial', async () => {
    await render('/');
    expect(here()).toBeNull();
    expect(document.body.textContent).toContain('Show me how');
  });
});

describe('entry points open replay mode (SF-64)', () => {
  it("Home's How to Play button (aria-label kept)", async () => {
    localStorage.setItem('wf_welcome_seen', 'true');
    localStorage.setItem('wf_tutorial_done', 'true');
    await render('/');
    await clickButton(b => b.getAttribute('aria-label') === 'How to Play');
    expect(here()).toBe('/Tutorial?mode=replay');
  });

  it("Settings' Replay tutorial row, with its subtitle", async () => {
    await render('/Settings');
    expect(document.body.textContent).toContain('The guided first game, about a minute');
    await clickButton(b => b.textContent.includes('Replay tutorial'));
    expect(here()).toBe('/Tutorial?mode=replay');
  });
});

describe('the first run hands off to Home (SF-64)', () => {
  it('Home starts Standard level 1, random, through startLevel and its ad gate', async () => {
    localStorage.setItem('wf_welcome_seen', 'true');
    localStorage.setItem('wf_tutorial_done', 'true');
    await render({ pathname: '/Home', state: { startFirstPuzzle: true } });
    expect(here()).toBe('/Game?mode=standard&category=random&level=1');
    expect(ads.calls).toEqual([{ adsRemoved: false, isOnline: true }]);
  });
});

describe('Settings Reset (SF-64)', () => {
  it('also removes wf_tutorial_done', async () => {
    localStorage.setItem('wf_tutorial_done', 'true');
    localStorage.setItem('wf_welcome_seen', 'true');
    await render('/Settings');
    await clickButton(b => b.textContent.trim() === 'Reset Game Data');
    await clickButton(b => b.textContent.trim() === 'Yes, Reset Everything');
    expect(localStorage.getItem('wf_tutorial_done')).toBeNull();
    expect(localStorage.getItem('wf_welcome_seen'), 'control: Reset ran').toBeNull();
  });
});
