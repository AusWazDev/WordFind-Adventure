// @vitest-environment jsdom
// S25 (SF-75): Microsoft Store hint packs on Windows. The addon is replaced here by a
// fake window.soundfindStore (the preload's three calls); the ledger, storage and
// windowsStore.js are real. A mocked bridge cannot prove the real Store calls work:
// the package flight proves that.
//
// CONTROLS (run by hand, reported, not kept):
//   1. In hintLedger.creditPurchase, credit a Windows purchase without its tracking-ID
//      record and without the hasWindowsRecord guard: "credits once" and the launch
//      tests must fail.
//   2. In windowsStore.finish, report fulfilment before the credit: the order test
//      must fail.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const toast = vi.hoisted(() => ({ info: vi.fn(), error: vi.fn(), success: vi.fn() }));
vi.mock('@/lib/platform', () => ({ isWindowsApp: () => true, isNative: () => false, getPlatform: () => 'web' }));
vi.mock('@revenuecat/purchases-capacitor', () => ({
  Purchases: { configure: vi.fn(), getCustomerInfo: vi.fn(), getOfferings: vi.fn(), getProducts: vi.fn(), purchaseStoreProduct: vi.fn(), restorePurchases: vi.fn() },
  PRODUCT_CATEGORY: { NON_SUBSCRIPTION: 'NON_SUBSCRIPTION' },
}));
vi.mock('@/lib/admob', () => ({ showRewarded: vi.fn(async () => false), initAdMob: vi.fn() }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
vi.mock('sonner', async importOriginal => ({ ...(await importOriginal()), toast }));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), addBreadcrumb: vi.fn() }));

const W = await import('@/lib/windowsStore');
const { default: HintModal } = await import('@/components/game/HintModal');

const PACK3 = 'au.com.uniquegames.soundfind.hints_3';
const PACK10 = 'au.com.uniquegames.soundfind.hints_10';
const PRODUCTS = [
  { storeId: '9NBLGGH4R315', offerToken: 'hints_3', title: '3 Hints', price: '$1.49' },
  { storeId: '9NBLGGH4R316', offerToken: 'hints_10', title: '10 Hints', price: '$3.99' },
  { storeId: '9NBLGGH4R317', offerToken: 'hints_25', title: '25 Hints', price: '$7.99' },
];
const STORE_UNKNOWN_APP = 0x803F6107 | 0; // signed, as the addon reports an HRESULT

let bridge;
function makeBridge({ products = { ok: true, hresult: 0, status: 0, products: PRODUCTS }, purchase = 0, report = 0 } = {}) {
  return {
    getProducts: vi.fn(async () => products),
    purchase: vi.fn(async () => ({ ok: true, hresult: 0, status: purchase })),
    reportFulfillment: vi.fn(async () => ({ ok: true, hresult: 0, status: report })),
  };
}
const balance = () => JSON.parse(localStorage.getItem('wf_progress') || '{}').hints_remaining;
const pending = () => JSON.parse(localStorage.getItem('wf_ms_store_pending') || '[]');
const records = () => JSON.parse(localStorage.getItem('wf_progress') || '{}').credited_txn_ids || [];

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('wf_progress', JSON.stringify({ hints_remaining: 5 }));
  W.__resetWindowsStoreForTests();
  bridge = makeBridge();
  window.soundfindStore = bridge;
  Object.values(toast).forEach(f => f.mockClear());
});
afterEach(() => {
  delete window.soundfindStore;
});

describe('prices (SF-75 C)', () => {
  it('shows the Store price for each pack, keyed by the shop ID, and remembers Store IDs', async () => {
    await W.initWindowsStore();
    expect(W.isWindowsStoreAvailable()).toBe(true);
    expect(W.getWindowsPrice(PACK3)).toBe('$1.49');
    expect(W.getWindowsPrice(PACK10)).toBe('$3.99');
    expect(JSON.parse(localStorage.getItem('wf_ms_store_ids'))).toEqual({ hints_3: '9NBLGGH4R315', hints_10: '9NBLGGH4R316', hints_25: '9NBLGGH4R317' });
  });

  it('the hint shop shows those prices and no ad', async () => {
    await W.initWindowsStore();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => { root.render(<HintModal isOpen onClose={() => {}} onWatchAd={() => {}} onPurchase={() => {}} />); });
    await act(async () => { await new Promise(r => setTimeout(r, 30)); });
    expect(document.body.textContent).toContain('from $1.49');
    expect(document.body.textContent).not.toContain('Watch an Ad');
    const shop = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Buy Hint Pack'));
    await act(async () => { shop.click(); });
    await act(async () => { await new Promise(r => setTimeout(r, 400)); });
    expect(document.body.textContent).toContain('$7.99');
    expect(document.body.textContent).toContain('Buy 10 Hints ($3.99)');
    expect(document.querySelector('[data-testid="store-unavailable"]')).toBeNull();
    await act(async () => { root.unmount(); });
    container.remove();
  });
});

describe('purchase (SF-75 C)', () => {
  beforeEach(async () => { await W.initWindowsStore(); });

  it('succeeds: credits once, reports with the saved tracking ID, clears the entry', async () => {
    const result = await W.purchaseWindowsHintPack(PACK3);
    expect(result.hints).toBe(3);
    expect(result.credited).toBe(3);
    expect(balance()).toBe(8);
    expect(bridge.purchase).toHaveBeenCalledWith('9NBLGGH4R315');
    const [storeId, trackingId] = bridge.reportFulfillment.mock.calls[0];
    expect(storeId).toBe('9NBLGGH4R315');
    expect(trackingId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(records()).toEqual([`windows:hints_3:${trackingId}`]);
    expect(pending()).toEqual([]);
  });

  it('cancelled: no credit, no saved entry, no report', async () => {
    bridge.purchase.mockResolvedValueOnce({ ok: true, hresult: 0, status: 2 });
    await expect(W.purchaseWindowsHintPack(PACK3)).rejects.toThrow(/cancel/);
    expect(balance()).toBe(5);
    expect(pending()).toEqual([]);
    expect(bridge.reportFulfillment).not.toHaveBeenCalled();
  });

  it('fails (server error): throws a non-cancel error, no credit', async () => {
    bridge.purchase.mockResolvedValueOnce({ ok: true, hresult: 0, status: 4 });
    const err = await W.purchaseWindowsHintPack(PACK3).catch(e => e);
    expect(err.message).not.toMatch(/cancel/);
    expect(err.name).not.toBe('StoreUnavailableError');
    expect(balance()).toBe(5);
    expect(bridge.reportFulfillment).not.toHaveBeenCalled();
  });

  it('already owned, nothing saved: credits the pack and reports it', async () => {
    bridge.purchase.mockResolvedValueOnce({ ok: true, hresult: 0, status: 1 });
    const result = await W.purchaseWindowsHintPack(PACK3);
    expect(result.credited).toBe(3);
    expect(balance()).toBe(8);
    expect(bridge.reportFulfillment).toHaveBeenCalledTimes(1);
    expect(pending()).toEqual([]);
  });

  it('already owned with a saved, credited entry: reports it again, credits nothing more', async () => {
    bridge.reportFulfillment.mockResolvedValueOnce({ ok: true, hresult: 0, status: 2 }); // report lost
    await W.purchaseWindowsHintPack(PACK3);
    expect(balance()).toBe(8);
    const saved = pending();
    expect(saved).toHaveLength(1);
    bridge.purchase.mockResolvedValueOnce({ ok: true, hresult: 0, status: 1 });
    const again = await W.purchaseWindowsHintPack(PACK3);
    expect(again.credited).toBe(0);
    expect(balance()).toBe(8);
    expect(bridge.reportFulfillment.mock.calls[1][1]).toBe(saved[0].trackingId);
    expect(pending()).toEqual([]);
  });

  it('order: tracking ID saved before the credit, report after the credit', async () => {
    const writes = [];
    const setItem = Storage.prototype.setItem;
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (k, v) {
      writes.push(k);
      return setItem.call(this, k, v);
    });
    let atReport = null;
    bridge.reportFulfillment.mockImplementationOnce(async (storeId, trackingId) => {
      atReport = { balance: balance(), pending: pending().map(p => p.trackingId), trackingId };
      return { ok: true, hresult: 0, status: 0 };
    });
    await W.purchaseWindowsHintPack(PACK3);
    spy.mockRestore();
    expect(writes.indexOf('wf_ms_store_pending')).toBeGreaterThanOrEqual(0);
    expect(writes.indexOf('wf_ms_store_pending')).toBeLessThan(writes.indexOf('wf_progress'));
    expect(atReport.balance).toBe(8);
    expect(atReport.pending).toEqual([atReport.trackingId]);
  });
});

describe('launch reconciliation (SF-75 C)', () => {
  it('credits a saved, uncredited purchase once and reports it with the same tracking ID', async () => {
    const trackingId = '0f8fad5b-d9cb-469f-a165-70867728950e';
    localStorage.setItem('wf_ms_store_pending', JSON.stringify([{ trackingId, offerToken: 'hints_10', storeId: '9NBLGGH4R316' }]));
    bridge.reportFulfillment.mockResolvedValueOnce({ ok: true, hresult: 0, status: 2 }); // first report lost
    expect(await W.initWindowsStore()).toBe(10);
    expect(balance()).toBe(15);
    expect(pending()).toHaveLength(1);
    expect(toast.success).toHaveBeenCalledWith('Added 10 hints from an earlier purchase');

    expect(await W.initWindowsStore()).toBe(0); // next launch: no double credit
    expect(balance()).toBe(15);
    expect(bridge.reportFulfillment.mock.calls.map(c => c[1])).toEqual([trackingId, trackingId]);
    expect(pending()).toEqual([]);
  });

  it('a purchase credited before the app died is reported at launch, never credited again', async () => {
    await W.initWindowsStore();
    bridge.reportFulfillment.mockResolvedValueOnce({ ok: true, hresult: 0, status: 3 });
    await W.purchaseWindowsHintPack(PACK10);
    expect(balance()).toBe(15);
    W.__resetWindowsStoreForTests();
    expect(await W.initWindowsStore()).toBe(0);
    expect(balance()).toBe(15);
    expect(pending()).toEqual([]);
  });
});

describe('store unavailable (SF-75 C)', () => {
  it('no bridge (not the packaged app): unavailable, purchase refused', async () => {
    delete window.soundfindStore;
    await W.initWindowsStore();
    expect(W.isWindowsStoreAvailable()).toBe(false);
    await expect(W.purchaseWindowsHintPack(PACK3)).rejects.toBeInstanceOf(W.StoreUnavailableError);
  });

  it('0x803F6107 (the Store does not know the app): unavailable, no prices', async () => {
    window.soundfindStore = makeBridge({ products: { ok: true, hresult: STORE_UNKNOWN_APP, status: 0, products: [] } });
    await W.initWindowsStore();
    expect(W.isWindowsStoreAvailable()).toBe(false);
    expect(W.getWindowsPrice(PACK3)).toBeNull();
    await expect(W.purchaseWindowsHintPack(PACK3)).rejects.toBeInstanceOf(W.StoreUnavailableError);
  });

  it('a failed call (addon not loaded, ok false): unavailable', async () => {
    window.soundfindStore = makeBridge({ products: { ok: false, hresult: 0, status: -1, products: [] } });
    await W.initWindowsStore();
    expect(W.isWindowsStoreAvailable()).toBe(false);
  });

  it('a purchase answered ok false: StoreUnavailableError, no credit', async () => {
    await W.initWindowsStore();
    bridge.purchase.mockResolvedValueOnce({ ok: false, hresult: 0, status: -1 });
    await expect(W.purchaseWindowsHintPack(PACK3)).rejects.toBeInstanceOf(W.StoreUnavailableError);
    expect(balance()).toBe(5);
  });
});
