// @vitest-environment jsdom
// FB-1 (CR-74): the shop shows the store's own price strings, and a screen
// opened before the store answers updates when the prices arrive. The real
// purchases.js runs; only the RevenueCat plugin is mocked. Native iOS, so the
// app's RevenueCat key exists and initPurchases fetches offerings.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const product = (id, priceString, price) => ({ storeProduct: { identifier: id, priceString, price } });
let releaseOfferings;
const offeringsReady = new Promise(r => { releaseOfferings = r; });
const Purchases = {
  configure: vi.fn(async () => {}),
  getCustomerInfo: vi.fn(async () => ({ customerInfo: { entitlements: { active: {} } } })),
  getOfferings: vi.fn(async () => {
    await offeringsReady;
    return { current: { availablePackages: [
      product('au.com.uniquegames.soundfind.hints_3', 'A$1.49', 1.49),
      product('au.com.uniquegames.soundfind.hints_10', 'A$2.99', 2.99),
      product('au.com.uniquegames.soundfind.hints_25', 'A$5.99', 5.99),
      product('au.com.uniquegames.soundfind.remove_ads', 'A$4.49', 4.49),
    ] } };
  }),
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

describe('store prices (FB-1)', () => {
  it('a shop opened before the store answers shows no figure, then the store prices when they arrive', async () => {
    const init = initPurchases(); // offerings held back until released below
    await act(async () => { root.render(<HintModal isOpen onClose={() => {}} onWatchAd={() => {}} onPurchase={() => {}} />); });
    await settle();
    expect(text()).not.toMatch(/\$/); // nothing loaded yet: no figure, not a fallback
    await act(async () => { button('Buy Hint Pack').click(); });
    await settle();
    expect(text()).not.toMatch(/\$/);
    expect(button('Buy 10 Hints').textContent.trim()).toBe('Buy 10 Hints');

    await act(async () => { releaseOfferings(); await init; });
    await settle();
    expect(text()).toContain('A$1.49');
    expect(text()).toContain('A$2.99');
    expect(text()).toContain('A$5.99');
    expect(button('Buy 10 Hints').textContent).toContain('Buy 10 Hints — A$2.99');
  });

  it('the hint options show "from" the cheapest store price', async () => {
    await act(async () => { root.render(<HintModal isOpen onClose={() => {}} onWatchAd={() => {}} onPurchase={() => {}} />); });
    await settle();
    expect(text()).toContain('from A$1.49');
  });

  it('Remove Ads shows the store price in the badge and on the button', async () => {
    await act(async () => { root.render(<RemoveAdsModal isOpen onClose={() => {}} onSuccess={() => {}} />); });
    await settle();
    expect(text()).toContain('A$4.49');
    expect(button('Remove Ads').textContent).toContain('Remove Ads — A$4.49');
  });
});
