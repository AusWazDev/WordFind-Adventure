// @vitest-environment jsdom
// Native Android with no RevenueCat key (the Android key in purchases.js is
// empty, so initPurchases returns before configure). This characterises what
// a player sees at each purchase point today. The plugin mock rejects exactly
// as the real Android plugin does when not configured: every call goes through
// rejectIfNotConfigured, which rejects "Purchases must be configured before
// calling this function" (PurchasesPlugin.kt). purchases.js and admob.js are
// the real modules; only the native plugins are mocked.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const NOT_CONFIGURED = 'Purchases must be configured before calling this function';
const reject = () => vi.fn(async () => { throw new Error(NOT_CONFIGURED); });
const Purchases = {
  configure: vi.fn(async () => {}),
  getOfferings: reject(),
  getCustomerInfo: reject(),
  getProducts: reject(),
  purchaseStoreProduct: reject(),
  restorePurchases: reject(),
};
vi.mock('@revenuecat/purchases-capacitor', () => ({ Purchases, PRODUCT_CATEGORY: { NON_SUBSCRIPTION: 'NON_SUBSCRIPTION' } }));

const AdMob = {
  requestConsentInfo: vi.fn(async () => ({ status: 'NOT_REQUIRED', canRequestAds: true })),
  initialize: vi.fn(async () => {}),
  prepareInterstitial: vi.fn(async () => {}),
  showInterstitial: vi.fn(async () => {}),
  prepareRewardVideoAd: vi.fn(async () => {}),
  showRewardVideoAd: vi.fn(async () => ({ type: 'hint', amount: 1 })),
};
vi.mock('@capacitor-community/admob', () => ({ AdMob, MaxAdContentRating: { General: 'General' } }));

vi.mock('@/lib/platform', () => ({ isNative: () => true, getPlatform: () => 'android' }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() };
vi.mock('sonner', () => ({ toast, Toaster: () => null }));
const Sentry = { captureException: vi.fn(), addBreadcrumb: vi.fn() };
vi.mock('@sentry/react', () => Sentry);

const { initPurchases } = await import('./purchases');
const { default: HintModal } = await import('@/components/game/HintModal');
const { default: RemoveAdsModal } = await import('@/components/game/RemoveAdsModal');
const { default: Settings } = await import('@/pages/Settings');

const sleep = ms => new Promise(r => setTimeout(r, ms));
let container;
let root;
const text = () => container.textContent;
const button = label => [...container.querySelectorAll('button')].find(b => b.textContent.includes(label));
async function show(element) {
  await act(async () => { root.render(element); });
  await act(async () => { await sleep(1200); }); // AnimatePresence mode="wait" transitions
}
async function tap(label) {
  const b = button(label);
  expect(b, `button "${label}"`).toBeDefined();
  await act(async () => { b.click(); });
  await act(async () => { await sleep(1200); });
}

beforeEach(() => {
  Object.values(toast).forEach(f => f.mockClear());
  Object.values(Sentry).forEach(f => f.mockClear());
  Object.values(AdMob).forEach(f => f.mockClear());
  Object.values(Purchases).forEach(f => f.mockClear());
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  localStorage.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

// ⚠️ CR-88 (2 Oct 2026): Android now has its RevenueCat key, so initPurchases DOES
// configure (the first test below). The rest still holds while the Play products do
// not exist yet: every store call fails, and each purchase point fails politely.
describe('native Android with no RevenueCat key: current behaviour', () => {
  it('initPurchases configures RevenueCat (CR-88; before it, it returned early)', async () => {
    await initPurchases();
    expect(Purchases.configure).toHaveBeenCalledTimes(1);
    expect(Purchases.configure.mock.calls[0][0].apiKey.startsWith('goog_')).toBe(true);
  });

  it('opening the hint shop shows the packs with no price figure, and no error', async () => {
    await show(<HintModal isOpen onClose={() => {}} onWatchAd={() => {}} onPurchase={() => {}} />);
    await tap('Buy Hint Pack');
    expect(text()).toContain('10 Hints');
    expect(text()).not.toMatch(/\$/); // FB-1: no store price was fetched, so no figure at all
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('tapping a pack ends in a "Purchase failed — Please try again." toast, and the button recovers (no hang)', async () => {
    const onPurchase = vi.fn();
    await show(<HintModal isOpen onClose={() => {}} onWatchAd={() => {}} onPurchase={onPurchase} />);
    await tap('Buy Hint Pack');
    await tap('Buy 10 Hints');
    expect(Purchases.getProducts).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('Purchase failed', { description: 'Please try again.' });
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(onPurchase).not.toHaveBeenCalled();
    expect(text()).not.toContain('Processing…');
    expect(button('Buy 10 Hints').disabled).toBe(false);
  });

  it('opening Remove Ads shows no price figure, and no error', async () => {
    await show(<RemoveAdsModal isOpen onClose={() => {}} onSuccess={() => {}} />);
    expect(button('Remove Ads')).toBeDefined();
    expect(text()).not.toMatch(/\$/); // FB-1: no store price, so no figure
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('tapping Remove Ads ends in the same "Purchase failed" toast, and recovers', async () => {
    const onSuccess = vi.fn();
    await show(<RemoveAdsModal isOpen onClose={() => {}} onSuccess={onSuccess} />);
    await tap('Remove Ads');
    expect(toast.error).toHaveBeenCalledWith('Purchase failed', { description: 'Please try again.' });
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(localStorage.getItem('ads_removed')).toBeNull();
    expect(text()).not.toContain('Processing…');
  });

  it('tapping Restore Purchases ends in a "Restore failed — Please try again." toast, and recovers', async () => {
    await show(<MemoryRouter><Settings /></MemoryRouter>);
    await tap('Restore Purchases');
    expect(Purchases.restorePurchases).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('Restore failed', { description: 'Please try again.' });
    expect(button('Restore Purchases').disabled).toBe(false); // label back from "Restoring…"
  });

  it('"Watch an Ad" works without RevenueCat: a completed reward grants the hint once', async () => {
    const onWatchAd = vi.fn();
    await show(<HintModal isOpen onClose={() => {}} onWatchAd={onWatchAd} onPurchase={() => {}} />);
    await tap('Watch an Ad');
    expect(AdMob.prepareRewardVideoAd).toHaveBeenCalledWith(expect.objectContaining({ adId: 'ca-app-pub-1060374954785370/5473699434', npa: true }));
    expect(onWatchAd).toHaveBeenCalledTimes(1);
    expect(Purchases.getProducts).not.toHaveBeenCalled();
  });

  it('"Watch an Ad" with no ad available: a polite "No ad available right now" and no hint', async () => {
    AdMob.prepareRewardVideoAd.mockImplementationOnce(async () => { throw new Error('No fill'); });
    const onWatchAd = vi.fn();
    await show(<HintModal isOpen onClose={() => {}} onWatchAd={onWatchAd} onPurchase={() => {}} />);
    await tap('Watch an Ad');
    expect(toast.info).toHaveBeenCalledWith('No ad available right now', { description: 'Try again in a moment.' });
    expect(onWatchAd).not.toHaveBeenCalled();
  });
});
