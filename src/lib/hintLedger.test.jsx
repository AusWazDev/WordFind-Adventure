// @vitest-environment jsdom
// S40-C (SF-50, P1): hint packs charged but never credited are credited on a later
// launch, exactly once, and only after the reconcile baseline. Each test names the
// behaviour its fault control removes (see CR-98).
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const platform = vi.hoisted(() => ({ native: true }));
vi.mock('@/lib/platform', () => ({ isNative: () => platform.native, getPlatform: () => (platform.native ? 'android' : 'web') }));
vi.mock('@revenuecat/purchases-capacitor', () => ({
  Purchases: { configure: vi.fn(), getCustomerInfo: vi.fn(), getOfferings: vi.fn(), getProducts: vi.fn(), purchaseStoreProduct: vi.fn(), restorePurchases: vi.fn() },
  PRODUCT_CATEGORY: { NON_SUBSCRIPTION: 'NON_SUBSCRIPTION' },
}));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), addBreadcrumb: vi.fn() }));
vi.mock('@/lib/admob', () => ({ showInterstitial: vi.fn(async () => {}), showRewarded: vi.fn(async () => false), prepareInterstitial: vi.fn() }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
vi.mock('@/components/game/voiceUtils', () => ({
  speakPhraseAndWord: vi.fn(), speakFixedPhrase: vi.fn(), unlockAudio: vi.fn(async () => {}),
  preloadGameAudio: vi.fn(), stopAllAudio: vi.fn(), speakWord: vi.fn(),
}));
vi.mock('@/components/game/GameBoard', () => ({ default: () => <div data-testid="board" /> }));

const L = await import('@/lib/hintLedger');
const { Purchases } = await import('@revenuecat/purchases-capacitor');
const { default: Settings } = await import('@/pages/Settings');
const { default: Game } = await import('@/pages/Game');

const PACK10 = 'au.com.uniquegames.soundfind.hints_10';
const BASE = '2026-10-13T00:00:00.000Z';
const AFTER = '2026-10-13T01:00:00.000Z';
const BEFORE = '2026-10-12T23:00:00.000Z';
const NOW = Date.parse('2026-10-13T02:00:00.000Z');
// Synthetic IDs in the shapes observed on the tablet (SF-55, DEF-53). The purchase
// result carries the store's ID (Google Play order ID: "GPA." + 4-4-4-5 digits, 24
// characters); customerInfo.nonSubscriptionTransactions lists RevenueCat's own ID
// ("o1_" + 22 characters, 25 in all). The store's time has milliseconds; RevenueCat's
// is to the second (16:00:21.893Z against 16:00:21.000Z for one purchase).
const RC1 = 'o1_kQ3mZ8vR2pX5nL7tY9wB4c';
const RC2 = 'o1_Hd7fW2sJ9qK4xM6bN1zP8e';
const RC_OLD = 'o1_aB3cD4eF5gH6iJ7kL8mN9p';
const ORDER = 'GPA.3341-0927-6650-12845';
const txn = (id, productIdentifier = PACK10, purchaseDate = AFTER) => ({ transactionIdentifier: id, productIdentifier, purchaseDate, purchaseToken: null });
// The purchase as purchaseProduct now reports it, and the raw MakePurchaseResult.
const STORE_TIME = '2026-10-13T01:00:00.893Z';
const purchaseOf = listed => ({ productId: PACK10, purchaseDate: STORE_TIME, listed });
const makePurchaseResult = listed => ({
  productIdentifier: PACK10,
  customerInfo: { entitlements: { all: {}, active: {} }, nonSubscriptionTransactions: listed },
  transaction: { transactionIdentifier: ORDER, productIdentifier: PACK10, purchaseDate: STORE_TIME, purchaseToken: null },
});
const stored = () => JSON.parse(localStorage.getItem('wf_progress'));
const store = p => localStorage.setItem('wf_progress', JSON.stringify(p));

let container, root;
async function mount(el, entry = '/') {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root.render(<MemoryRouter initialEntries={[entry]}><Routes><Route path="*" element={el} /></Routes></MemoryRouter>); });
}
const sleep = ms => act(async () => { await new Promise(r => setTimeout(r, ms)); });
beforeEach(() => {
  localStorage.clear();
  platform.native = true;
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});
afterEach(async () => { if (root) await act(async () => root.unmount()); container?.remove(); root = null; });

describe('hint ledger, pure (S40-C, SF-50)', () => {
  it('(a) one uncredited pack after the baseline is credited once, and its ID recorded', () => {
    const { progress, creditedHints } = L.reconcile({ hints_remaining: 2, reconcile_since: BASE }, [txn(RC1)], NOW);
    expect(creditedHints).toBe(10);
    expect(progress.hints_remaining).toBe(12);
    expect(progress.credited_txn_ids).toEqual([RC1]);
  });

  it('(b) reconcile run twice: the second run adds nothing', () => {
    const first = L.reconcile({ hints_remaining: 2, reconcile_since: BASE }, [txn(RC1)], NOW).progress;
    const second = L.reconcile(first, [txn(RC1)], NOW);
    expect(second.creditedHints).toBe(0);
    expect(second.progress.hints_remaining).toBe(12);
  });

  it('(e) a transaction from before the baseline (restore or alias) is never credited', () => {
    const r = L.reconcile({ hints_remaining: 2, reconcile_since: BASE }, [txn(RC_OLD, PACK10, BEFORE)], NOW);
    expect(r.creditedHints).toBe(0);
    expect(r.progress.hints_remaining).toBe(2);
  });

  it('(e) with no baseline yet, the baseline is set to now and nothing is credited', () => {
    const r = L.reconcile({ hints_remaining: 2 }, [txn(RC_OLD, PACK10, BEFORE), txn(RC1)], NOW);
    expect(r.creditedHints).toBe(0);
    expect(r.progress.reconcile_since).toBe(new Date(NOW).toISOString());
  });

  it('(f) a non-hint product (remove_ads) is ignored', () => {
    const r = L.reconcile({ hints_remaining: 2, reconcile_since: BASE }, [txn('o1_Rm5vT8yU1iO4pA7sD0fG3h', 'au.com.uniquegames.soundfind.remove_ads')], NOW);
    expect(r.creditedHints).toBe(0);
    expect(r.progress.hints_remaining).toBe(2);
    expect(r.progress.credited_txn_ids ?? []).toEqual([]);
  });
});

describe('hint ledger, wired (S40-C, SF-50)', () => {
  it('(c) a pack credited through the purchase path is not credited again by reconcile', () => {
    store({ hints_remaining: 2, reconcile_since: BASE });
    const bought = L.creditPurchaseNow(purchaseOf([txn(RC1)]), 10);
    expect(bought.creditedHints).toBe(10);
    expect(stored().hints_remaining).toBe(12);
    expect(L.reconcileHintPurchases({ nonSubscriptionTransactions: [txn(RC1)] }, NOW)).toBe(0);
    expect(stored().hints_remaining).toBe(12);
  });

  it('(i) DEF-53: a normal purchase, then reconcile with the list the store returns: no second credit', async () => {
    store({ hints_remaining: 0, reconcile_since: BASE, credited_txn_ids: [RC_OLD] });
    const listed = [txn(RC_OLD, PACK10, BEFORE), txn(RC1)];                 // the new pack, as RevenueCat lists it
    Purchases.getProducts.mockResolvedValueOnce({ products: [{ identifier: PACK10 }] });
    Purchases.purchaseStoreProduct.mockResolvedValueOnce(makePurchaseResult(listed));
    const { purchaseProduct } = await import('@/lib/purchases');
    const result = await purchaseProduct(PACK10);
    expect(result.hints).toBe(10);
    L.creditPurchaseNow(result.purchase, result.hints);                     // the page's credit
    expect(stored().hints_remaining).toBe(10);
    expect(stored().credited_txn_ids, 'no store order ID is kept').not.toContain(ORDER);
    expect(L.reconcileHintPurchases({ nonSubscriptionTransactions: listed }, NOW), 'next launch').toBe(0);
    expect(stored().hints_remaining).toBe(10);
  });

  it('(ii) the entry is not listed yet: credited once, and a later reconcile does not credit it again', async () => {
    store({ hints_remaining: 0, reconcile_since: BASE });
    Purchases.getProducts.mockResolvedValueOnce({ products: [{ identifier: PACK10 }] });
    Purchases.purchaseStoreProduct.mockResolvedValueOnce(makePurchaseResult([]));   // the purchase call's list lacks it
    const { purchaseProduct } = await import('@/lib/purchases');
    const result = await purchaseProduct(PACK10);
    L.creditPurchaseNow(result.purchase, result.hints);
    expect(stored().hints_remaining).toBe(10);
    // A later launch: RevenueCat now lists it, to the second (893 ms before the store's time).
    expect(L.reconcileHintPurchases({ nonSubscriptionTransactions: [txn(RC1)] }, NOW)).toBe(0);
    expect(stored().hints_remaining).toBe(10);
    // And a different, genuinely uncredited pack later is still credited (the claim is used once).
    expect(L.reconcileHintPurchases({ nonSubscriptionTransactions: [txn(RC1), txn(RC2, PACK10, '2026-10-13T01:00:01.000Z')] }, NOW)).toBe(10);
    expect(stored().hints_remaining).toBe(20);
  });

  it('(d) Settings Reset, then reconcile: no change', async () => {
    store({ hints_remaining: 12, reconcile_since: BASE, credited_txn_ids: [RC1], total_score: 500 });
    await mount(<Settings />);
    const resetBtn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Reset Game Data');
    expect(resetBtn, 'control: the Reset button is on the page').toBeDefined();
    await act(async () => { resetBtn.click(); });
    await sleep(100);
    const confirm = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Yes, Reset Everything'));
    await act(async () => { confirm.click(); });
    expect(stored().total_score, 'control: Reset cleared progress').toBeUndefined();
    expect(stored().hints_remaining).toBe(12);
    expect(L.reconcileHintPurchases({ nonSubscriptionTransactions: [txn(RC1)] }, NOW)).toBe(0);
    expect(stored().hints_remaining).toBe(12);
  });

  it('(g) off native: reconcile does nothing', () => {
    platform.native = false;
    store({ hints_remaining: 2, reconcile_since: BASE });
    expect(L.reconcileHintPurchases({ nonSubscriptionTransactions: [txn(RC1)] }, NOW)).toBe(0);
    expect(stored().hints_remaining).toBe(2);
  });

  it('(h) a game screen open during a reconcile credit: the credit survives the screen\'s next balance write', async () => {
    store({ id: 'local', current_level: 1, total_score: 0, hints_remaining: 5, games_played: 0, words_found: 0, best_streak: 0, reconcile_since: BASE });
    await mount(<Game />, '/Game?mode=standard&category=animals&level=1');
    await sleep(300);
    const hintButton = () => [...container.querySelectorAll('button')].find(b => b.querySelector('svg.lucide-lightbulb') && /^\d+$/.test(b.textContent.trim()));
    expect(hintButton()?.textContent.trim(), 'control: the header shows the stored balance').toBe('5');
    await act(async () => { L.reconcileHintPurchases({ nonSubscriptionTransactions: [txn(RC2)] }, NOW); });
    expect(stored().hints_remaining).toBe(15);
    await act(async () => { hintButton().click(); });   // the screen spends a hint and writes its balance
    expect(stored().hints_remaining).toBe(14);
  });
});
