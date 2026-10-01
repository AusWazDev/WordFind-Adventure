// @vitest-environment jsdom
// FB-1 (CR-74): when the store's offerings fail to load (offline, or not
// configured), the shop and Remove Ads show no price figure at all, never a
// fallback of our own. Its own file, because the price cache is module state.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const Purchases = {
  configure: vi.fn(async () => {}),
  getCustomerInfo: vi.fn(async () => ({ customerInfo: { entitlements: { active: {} } } })),
  getOfferings: vi.fn(async () => { throw new Error('Network error'); }),
};
vi.mock('@revenuecat/purchases-capacitor', () => ({ Purchases, PRODUCT_CATEGORY: { NON_SUBSCRIPTION: 'NON_SUBSCRIPTION' } }));
vi.mock('@/lib/platform', () => ({ isNative: () => true, getPlatform: () => 'ios' }));
vi.mock('@/lib/admob', () => ({ showRewarded: vi.fn(async () => false) }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), addBreadcrumb: vi.fn() }));

const { initPurchases } = await import('./purchases');
const { default: HintModal } = await import('@/components/game/HintModal');
const { default: RemoveAdsModal } = await import('@/components/game/RemoveAdsModal');

const sleep = ms => new Promise(r => setTimeout(r, ms));
let container;
let root;
const text = () => container.textContent;
const button = label => [...container.querySelectorAll('button')].find(b => b.textContent.includes(label));
async function settle() { await act(async () => { await sleep(1200); }); }

beforeEach(() => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe('store prices fail to load (FB-1)', () => {
  it('the hint shop shows no figure anywhere', async () => {
    await initPurchases();
    expect(Purchases.getOfferings).toHaveBeenCalled(); // control: the fetch was attempted and failed
    await act(async () => { root.render(<HintModal isOpen onClose={() => {}} onWatchAd={() => {}} onPurchase={() => {}} />); });
    await settle();
    expect(button('Buy Hint Pack')).toBeDefined();
    expect(text()).not.toMatch(/\$/);
    await act(async () => { button('Buy Hint Pack').click(); });
    await settle();
    expect(text()).toContain('10 Hints');
    expect(text()).not.toMatch(/\$/);
  });

  it('Remove Ads shows no figure anywhere', async () => {
    await act(async () => { root.render(<RemoveAdsModal isOpen onClose={() => {}} onSuccess={() => {}} />); });
    await settle();
    expect(button('Remove Ads')).toBeDefined();
    expect(text()).not.toMatch(/\$/);
  });
});
