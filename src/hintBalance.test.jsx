// @vitest-environment jsdom
// SF-66b B1: one hint default. Every reader (Game, the Daily, Home, the hint ledger's
// credit path) counts a missing, non-numeric, non-finite or negative stored balance as
// the starting 12. Part A found the ledger counting a missing balance as 0, so a pack
// bought by a player shown 12 left them with only the pack.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const PACK = 'au.com.uniquegames.soundfind.hints_3';
vi.mock('@/lib/platform', () => ({ isWindowsApp: () => false, isNative: () => true, getPlatform: () => 'android' }));
vi.mock('@capacitor-community/admob', async () => (await import('@/lib/admobPluginMock.testutil')).admobModule);
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), captureMessage: vi.fn(), addBreadcrumb: vi.fn() }));
vi.mock('@/lib/purchases', () => ({
  purchaseProduct: vi.fn(), restorePurchases: vi.fn(), usePrice: () => null, useLowestPrice: () => null, getPrice: () => null,
  PURCHASE_OPTIONS: [], HINT_PACK_MAP: { 'au.com.uniquegames.soundfind.hints_3': 3 }, REMOVE_ADS_PRODUCT_ID: 'x',
}));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
vi.mock('canvas-confetti', () => ({ default: Object.assign(vi.fn(), { reset: vi.fn() }) }));
vi.mock('@/components/game/voiceUtils', () => ({
  speakPhraseAndWord: vi.fn(), speakFixedPhrase: vi.fn(), unlockAudio: vi.fn(async () => {}),
  preloadGameAudio: vi.fn(), stopAllAudio: vi.fn(), speakWord: vi.fn(),
}));
vi.mock('@/components/game/GameBoard', () => ({ default: () => <div data-testid="board" /> }));

const { hintBalance } = await import('@/lib/hintBalance');
const { creditPurchaseNow, reconcileHintPurchases } = await import('@/lib/hintLedger');
const { default: Game } = await import('@/pages/Game');
const { default: DailyChallenge } = await import('@/pages/DailyChallenge');
const { default: Home } = await import('@/pages/Home');

const BAD = { missing: undefined, 'a string': 'x', null: null, negative: -3, 'not finite': Infinity };
const LEDGER = { credited_txn_ids: [], reconcile_since: '2026-10-12T00:00:00.000Z' };
const withBalance = v => (v === undefined ? { ...LEDGER } : { ...LEDGER, hints_remaining: v });
const stored = () => JSON.parse(localStorage.getItem('wf_progress'));
const purchase = id => ({ productId: PACK, purchaseDate: '2026-10-14T00:00:00.000Z', listed: [{ productIdentifier: PACK, transactionIdentifier: id, purchaseDate: '2026-10-14T00:00:00.000Z' }] });

let container, root;
const sleep = ms => act(async () => { await new Promise(r => setTimeout(r, ms)); });
async function mount(entry, element) {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  await act(async () => { root.render(<MemoryRouter initialEntries={[entry]}><Routes><Route path="*" element={element} /></Routes></MemoryRouter>); });
  await sleep(50);
}
const realRect = Element.prototype.getBoundingClientRect;
beforeEach(() => {
  Element.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 400, bottom: 400, width: 400, height: 400, toJSON() {} });
  localStorage.clear();
  localStorage.setItem('wf_welcome_seen', 'true'); localStorage.setItem('wf_tutorial_done', 'true'); localStorage.setItem('ads_removed', 'true');
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});
afterEach(async () => { Element.prototype.getBoundingClientRect = realRect; await act(async () => root?.unmount()); container?.remove(); root = null; });

describe('a pack bought with no valid stored balance gives 12 plus the pack', () => {
  for (const [name, v] of Object.entries(BAD)) {
    it(`purchase path, balance ${name}`, () => {
      localStorage.setItem('wf_progress', JSON.stringify(withBalance(v)));
      expect(creditPurchaseNow(purchase('rc_A'), 3).progress.hints_remaining).toBe(15);
    });
  }
  it('reconcile path, balance missing', () => {
    localStorage.setItem('wf_progress', JSON.stringify(withBalance(undefined)));
    const credited = reconcileHintPurchases({ nonSubscriptionTransactions: [{ productIdentifier: PACK, transactionIdentifier: 'rc_B', purchaseDate: '2026-10-14T00:00:00.000Z' }] }, Date.parse('2026-10-14T00:01:00.000Z'));
    expect(credited, 'control: the pack was credited').toBe(3);
    expect(stored().hints_remaining).toBe(15);
  });
  it('control case: a valid balance is added to as it is', () => {
    localStorage.setItem('wf_progress', JSON.stringify(withBalance(4)));
    expect(creditPurchaseNow(purchase('rc_C'), 3).progress.hints_remaining).toBe(7);
  });
});

describe('every reader returns 12 for a missing or invalid balance', () => {
  for (const [name, v] of Object.entries(BAD)) {
    it(`hintBalance, ${name}`, () => { expect(hintBalance(withBalance(v))).toBe(12); });
  }
  it('hintBalance keeps a valid balance, 0 included', () => {
    expect(hintBalance({ hints_remaining: 0 })).toBe(0);
    expect(hintBalance({ hints_remaining: 7 })).toBe(7);
  });

  for (const [name, v] of Object.entries(BAD)) {
    it(`Home shows 12, balance ${name}`, async () => {
      localStorage.setItem('wf_progress', JSON.stringify({ ...withBalance(v), games_played: 1 }));
      await mount('/Home', <Home />);
      const pill = [...container.querySelectorAll('span')].map(s => s.textContent);
      expect(container.textContent, 'control: Home rendered').toContain('SoundFind');
      expect(pill).toContain('12');
    });
    it(`Game shows 12, balance ${name}`, async () => {
      localStorage.setItem('wf_progress', JSON.stringify(withBalance(v)));
      await mount('/Game?mode=standard&category=animals&level=1', <Game />);
      expect(container.querySelector('[aria-label="Hint, 12 left"]')).not.toBeNull();
    });
    it(`the Daily shows 12, balance ${name}`, async () => {
      localStorage.setItem('wf_progress', JSON.stringify(withBalance(v)));
      await mount('/DailyChallenge', <DailyChallenge />);
      expect(container.textContent).toContain('Hint (12)');
    });
  }
});
