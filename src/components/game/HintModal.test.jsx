// @vitest-environment jsdom
// Out-of-hints modal, decision S6 (CR-67, brief SF-3R): the SF-3 refill is
// reverted. Off native (Windows, web) the placeholders are back: "Watch an Ad"
// (the simulated AdPlayer, which grants 1 hint) and "Buy Hint Pack". On native
// the real rewarded ad is used. No free refill exists anywhere.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const platform = { native: false };
const showRewarded = vi.fn(async () => true);
vi.mock('@/lib/platform', () => ({ isNative: () => platform.native, getPlatform: () => (platform.native ? 'ios' : 'web') }));
vi.mock('@/lib/admob', () => ({ showRewarded: (...a) => showRewarded(...a) }));
vi.mock('@/lib/purchases', () => ({
  purchaseProduct: vi.fn(),
  usePrice: () => null,
  useLowestPrice: () => null,
  PURCHASE_OPTIONS: [{ productId: 'au.com.uniquegames.soundfind.hints_10', hints: 10, label: 'Best Value', gradient: '', popular: true }],
}));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));

const { default: HintModal } = await import('./HintModal');

let container;
let root;
const handlers = { onClose: vi.fn(), onWatchAd: vi.fn(), onPurchase: vi.fn() };
const text = () => container.textContent;
const button = label => [...container.querySelectorAll('button')].find(b => b.textContent.includes(label));
async function render() {
  await act(async () => { root.render(<HintModal isOpen {...handlers} />); });
}

beforeEach(() => {
  Object.values(handlers).forEach(h => h.mockClear());
  showRewarded.mockClear();
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.useRealTimers();
});

describe('off native (Windows, web): the S6 placeholders', () => {
  beforeEach(() => { platform.native = false; });

  it('offers both "Watch an Ad" and "Buy Hint Pack"', async () => {
    await render();
    expect(button('Watch an Ad')).toBeDefined();
    expect(button('Buy Hint Pack')).toBeDefined();
  });

  it('"Watch an Ad" plays the placeholder and then grants the hint (onWatchAd once)', async () => {
    const realSetTimeout = globalThis.setTimeout;
    const realSleep = ms => new Promise(r => realSetTimeout(r, ms));
    vi.useFakeTimers();
    await render();
    await act(async () => { button('Watch an Ad').click(); });
    // The views sit in AnimatePresence mode="wait", so the ad view mounts only
    // after the menu's exit animation ends. Wait for it (bounded), advancing
    // both fake and real time, rather than assuming it is already there.
    for (let i = 0; i < 100 && !text().includes('Watch the full ad to earn your hint'); i++) {
      await act(async () => { vi.advanceTimersByTime(50); await realSleep(20); });
    }
    expect(text()).toContain('Watch the full ad to earn your hint');
    // One second per act, so React applies each progress update (the player's
    // 15 s ad) before the next tick; the completion timer is set by the last one.
    for (let s = 0; s < 16; s++) await act(async () => { vi.advanceTimersByTime(1000); });
    await act(async () => { vi.advanceTimersByTime(400); });
    expect(handlers.onWatchAd).toHaveBeenCalledTimes(1);
    expect(showRewarded).not.toHaveBeenCalled();
  });
});

describe('on native (iOS, Android): unchanged', () => {
  beforeEach(() => { platform.native = true; });

  it('"Watch an Ad" calls the real rewarded ad, not the placeholder', async () => {
    await render();
    await act(async () => { button('Watch an Ad').click(); });
    expect(showRewarded).toHaveBeenCalledTimes(1);
    expect(text()).not.toContain('Watch the full ad to earn your hint');
  });
});

describe('the SF-3 free refill is gone', () => {
  it('no refill code or copy remains anywhere in src', () => {
    const SRC = join(process.cwd(), 'src');
    const files = dir => readdirSync(dir).flatMap(n => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? files(p) : (/\.(js|jsx)$/.test(n) && !n.includes('.test.') ? [p] : []);
    });
    const hits = files(SRC).filter(f => /freeHintRefill|FreeRefill|onFreeHints|free hints once|sf_free_hint_refill_at/.test(readFileSync(f, 'utf8')));
    expect(files(SRC).length).toBeGreaterThan(20); // control: the sweep saw the source tree
    expect(hits).toEqual([]);
  });
});
