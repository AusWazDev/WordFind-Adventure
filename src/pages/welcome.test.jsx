// @vitest-environment jsdom
// SF-63 (S42): who sees the welcome; it renders INSTEAD of Home with nothing blurred
// mounted (Layout's bottom nav included); "Skip, just play" starts a game through the
// same function as Home's level picker.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const platform = vi.hoisted(() => ({ native: true }));
vi.mock('@/lib/platform', () => ({ isNative: () => platform.native, getPlatform: () => (platform.native ? 'android' : 'web') }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), captureMessage: vi.fn(), addBreadcrumb: vi.fn() }));
vi.mock('@/lib/purchases', () => ({ purchaseProduct: vi.fn(), usePrice: () => null, useLowestPrice: () => null, REMOVE_ADS_PRODUCT_ID: 'x', PURCHASE_OPTIONS: [] }));
const ads = vi.hoisted(() => ({ calls: [] }));
vi.mock('@/lib/adCadence', () => ({
  showInterstitialBeforeGame: vi.fn(async gates => { ads.calls.push(gates); return false; }),
  interstitialDue: vi.fn(() => false), markInterstitialShown: vi.fn(), recordCompletedGame: vi.fn(),
}));
vi.mock('@/components/game/voiceUtils', () => ({
  unlockAudio: vi.fn(async () => {}), speakWordAudio: vi.fn(async () => {}), preloadGameAudio: vi.fn(),
  stopAllAudio: vi.fn(), speakPhraseAndWord: vi.fn(),
}));

const { default: Layout } = await import('@/Layout');
const { default: Home } = await import('./Home');

let container, root, location;
function Where() { location = useLocation(); return <div data-testid="game-route" />; }
async function render() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
          <Route path="/Game" element={<Where />} />
          <Route path="/Tutorial" element={<Where />} />
        </Routes>
      </MemoryRouter>,
    );
  });
  await act(async () => { await new Promise(r => setTimeout(r, 0)); });
}
beforeEach(() => {
  localStorage.clear();
  platform.native = true; ads.calls = []; location = null;
  window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
  window.scrollTo = () => {}; Element.prototype.scrollTo = () => {};
});
afterEach(async () => { await act(async () => root?.unmount()); container?.remove(); });

const text = () => document.body.textContent;
const click = async label => {
  const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === label);
  if (!b) throw new Error(`no button "${label}"`);
  await act(async () => { b.click(); });
  await act(async () => { await new Promise(r => setTimeout(r, 0)); });
};
// Any element carrying a blur: a Tailwind blur / backdrop-blur class, or an inline filter.
const blurred = () => [...document.body.querySelectorAll('*')].filter(el =>
  /(^|\s)(backdrop-)?blur(-|$|\s)/.test(el.getAttribute('class') || '') ||
  /blur\(/.test(`${el.style.backdropFilter} ${el.style.filter}`));
const nav = () => document.querySelector('nav.bottom-nav');

describe('who sees the welcome (SF-63)', () => {
  it('a new player (no progress) sees it instead of Home', async () => {
    await render();
    expect(text()).toContain('Show me how');
    expect(text()).toContain('Hear the word. Find the spelling.');
    expect(text()).not.toContain('Choose Game Mode');
  });

  it('a new player whose progress says games_played 0 sees it', async () => {
    localStorage.setItem('wf_progress', JSON.stringify({ games_played: 0, hints_remaining: 12 }));
    await render();
    expect(text()).toContain('Show me how');
  });

  it('a player with games played never sees it, not even for a frame, and it is marked seen quietly', async () => {
    localStorage.setItem('wf_progress', JSON.stringify({ games_played: 3, hints_remaining: 12 }));
    const { preloadGameAudio } = await import('@/components/game/voiceUtils');
    preloadGameAudio.mockClear();
    await render();
    expect(text()).not.toContain('Show me how');
    expect(preloadGameAudio, 'the welcome never mounted (it preloads KNIGHT on mount)').not.toHaveBeenCalled();
    expect(text(), 'control: Home rendered').toContain('Choose Game Mode');
    expect(localStorage.getItem('wf_welcome_seen')).toBe('true');
  });

  it('a player who has seen it does not see it again', async () => {
    localStorage.setItem('wf_welcome_seen', 'true');
    await render();
    expect(text()).not.toContain('Show me how');
  });
});

describe('nothing blurred is mounted while it shows (SF-63)', () => {
  it('no blur element and no bottom nav while the welcome shows', async () => {
    await render();
    expect(nav()).toBeNull();
    expect(blurred().map(el => el.className)).toEqual([]);
  });

  it('control: on Home after the welcome, the nav and its blur are mounted and the scan finds them', async () => {
    localStorage.setItem('wf_welcome_seen', 'true');
    localStorage.setItem('wf_tutorial_done', 'true');
    await render();
    expect(nav()).not.toBeNull();
    expect(blurred().length).toBeGreaterThan(0);
  });
});

describe('"Skip, just play" and the resume rule (SF-64b)', () => {
  it('after Skip, with the game left unfinished, Home starts no tutorial redirect', async () => {
    await render();
    await click('Skip, just play');
    expect(location.pathname, 'control: the game started').toBe('/Game');
    // The game is left unfinished: games_played is still 0 (no progress at all here).
    await act(async () => root.unmount()); container.remove();
    location = null;
    await render();
    expect(location ? `${location.pathname}${location.search}` : null, 'no redirect to the tutorial').toBeNull();
    expect(text()).toContain('Choose Game Mode');
    expect(localStorage.getItem('wf_tutorial_done')).toBe('true');
  });
});

describe('"Show me how" opens the guided first game (SF-64)', () => {
  it('goes to the tutorial in first-run mode, with the welcome marked seen', async () => {
    await render();
    await click('Show me how');
    expect(`${location.pathname}${location.search}`).toBe('/Tutorial?mode=first');
    expect(localStorage.getItem('wf_welcome_seen')).toBe('true');
    expect(localStorage.getItem('wf_tutorial_done'), 'never set on start').toBeNull();
  });
});

describe('"Skip, just play" starts a game exactly like a level choice (SF-63)', () => {
  it('Standard, level 1, category random, through the same start function', async () => {
    await render();
    await click('Skip, just play');
    expect(localStorage.getItem('wf_welcome_seen')).toBe('true');
    const skip = { url: `${location.pathname}${location.search}`, ads: ads.calls };
    expect(skip.url).toBe('/Game?mode=standard&category=random&level=1');
    expect(skip.ads).toEqual([{ adsRemoved: false, isOnline: true }]);

    // The same choice made in Home's own picker gives the same ad gate and route.
    await act(async () => root.unmount()); container.remove();
    ads.calls = []; location = null;
    // Without this, Home would resume the tutorial (SF-64: welcome seen, tutorial not done,
    // no games played), which is not what this comparison is about.
    localStorage.setItem('wf_tutorial_done', 'true');
    await render();
    // The picker's buttons carry a description after the name.
    for (const name of ['Standard', 'Random', 'Easy']) {
      const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim().startsWith(name));
      expect(b, `control: the picker shows ${name}`).toBeTruthy();
      await act(async () => { b.click(); });
      await act(async () => { await new Promise(r => setTimeout(r, 0)); });
    }
    expect({ url: `${location.pathname}${location.search}`, ads: ads.calls }).toEqual(skip);
  });
});
