// @vitest-environment jsdom
// Out-of-hints modal (CR-64, brief SF-3): on Windows and web (!isNative) there
// is no ad, no purchase and no third-party image, only the daily free refill.
// On native the ad and purchase options are unchanged.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const platform = { native: false };
vi.mock('@/lib/platform', () => ({ isNative: () => platform.native, getPlatform: () => (platform.native ? 'ios' : 'web') }));
vi.mock('@/lib/admob', () => ({ showRewarded: vi.fn(async () => true) }));
vi.mock('@/lib/purchases', () => ({
  purchaseProduct: vi.fn(),
  getPrice: (_id, fallback) => fallback,
  PURCHASE_OPTIONS: [{ productId: 'au.com.uniquegames.soundfind.hints_10', hints: 10, price: 'US$1.99', label: 'Best Value', gradient: '', popular: true }],
}));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));

const { default: HintModal } = await import('./HintModal');

let container;
let root;
const handlers = { onClose: vi.fn(), onWatchAd: vi.fn(), onPurchase: vi.fn(), onFreeHints: vi.fn() };

async function render() {
  await act(async () => { root.render(<HintModal isOpen {...handlers} />); });
}
const text = () => container.textContent;
const button = label => [...container.querySelectorAll('button')].find(b => b.textContent.includes(label));

beforeEach(() => {
  localStorage.clear();
  Object.values(handlers).forEach(h => h.mockClear());
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe('Windows and web (!isNative)', () => {
  beforeEach(() => { platform.native = false; });

  it('offers no ad, no purchase and loads no image', async () => {
    await render();
    expect(text()).not.toContain('Watch an Ad');
    expect(text()).not.toContain('Buy Hint Pack');
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });

  it('offers 3 free hints, and claiming them grants exactly 3', async () => {
    await render();
    expect(text()).toContain('Get 3 free hints');
    await act(async () => { button('Get 3 free hints').click(); });
    expect(handlers.onFreeHints).toHaveBeenCalledWith(3);
    expect(handlers.onWatchAd).not.toHaveBeenCalled();
    expect(handlers.onPurchase).not.toHaveBeenCalled();
  });

  it('after claiming, the next open shows the wait and no claim button', async () => {
    await render();
    await act(async () => { button('Get 3 free hints').click(); });
    await act(async () => root.unmount());
    root = createRoot(container);
    await render();
    expect(button('Get 3 free hints')).toBeUndefined();
    expect(text()).toMatch(/Next 3 free hints in \d+h/);
  });
});

describe('native (iOS / Android) is unchanged', () => {
  beforeEach(() => { platform.native = true; });

  it('still offers Watch an Ad and Buy Hint Pack, and no free refill', async () => {
    await render();
    expect(text()).toContain('Watch an Ad');
    expect(text()).toContain('Buy Hint Pack');
    expect(text()).not.toContain('free hints');
  });
});
