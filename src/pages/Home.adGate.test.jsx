// @vitest-environment jsdom
// Between-game ad, decision S6 (CR-67, brief SF-3R): an ad after every 6
// completed games (AD_FREQUENCY). Off native it is the placeholder AdModal;
// on native the real interstitial. Drives the real Home screen: mode, category,
// then level.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const platform = { native: false };
const showInterstitial = vi.fn(async () => {});
vi.mock('@/lib/platform', () => ({ isNative: () => platform.native, getPlatform: () => (platform.native ? 'ios' : 'web') }));
vi.mock('@/lib/admob', () => ({ showInterstitial: (...a) => showInterstitial(...a), showRewarded: vi.fn(), initAdMob: vi.fn() }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));

const { default: Home } = await import('./Home');

let container;
let root;
const button = label => [...container.querySelectorAll('button')].find(b => b.textContent.includes(label));
const settle = () => act(async () => { await new Promise(r => setTimeout(r, 30)); });
const AD_TEXT = 'Your game starts in';

async function playToLevelSelect(completedGames) {
  localStorage.clear();
  localStorage.setItem('wf_welcome_seen', 'true');
  localStorage.setItem('games_completed_count', String(completedGames));
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Game" element={<div>GAME PAGE</div>} />
        </Routes>
      </MemoryRouter>,
    );
  });
  await settle();
  await act(async () => { button('Standard').click(); });
  await settle();
  await act(async () => { [...container.querySelectorAll('button')].find(b => /animals/i.test(b.textContent)).click(); });
  await settle();
  await act(async () => { [...container.querySelectorAll('button')].find(b => /Easy/.test(b.textContent)).click(); });
  await settle();
}

beforeEach(() => {
  showInterstitial.mockClear();
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  window.scrollTo = () => {};
});
afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

describe('off native: the placeholder ad after every 6 completed games', () => {
  beforeEach(() => { platform.native = false; });

  it('5 completed games: no ad, straight to the game', async () => {
    await playToLevelSelect(5);
    expect(container.textContent).not.toContain(AD_TEXT);
    expect(container.textContent).toContain('GAME PAGE');
  });

  it('6 completed games: the placeholder ad shows first', { timeout: 20000 }, async () => {
    await playToLevelSelect(6);
    expect(container.textContent).toContain(AD_TEXT);
    expect(container.textContent).not.toContain('GAME PAGE');
    expect(showInterstitial).not.toHaveBeenCalled();
  });
});

describe('on native: the real interstitial, no placeholder', () => {
  beforeEach(() => { platform.native = true; });

  it('6 completed games: showInterstitial is called and no AdModal renders', async () => {
    await playToLevelSelect(6);
    expect(showInterstitial).toHaveBeenCalledTimes(1);
    expect(container.textContent).not.toContain(AD_TEXT);
    expect(container.textContent).toContain('GAME PAGE');
  });
});
