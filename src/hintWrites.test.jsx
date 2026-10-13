// @vitest-environment jsdom
// SF-66b (A4): every progress write builds on the STORED progress and changes only the
// fields it owns. SF-66c found the Daily's replay (a Daily already completed today)
// saving the whole object the screen loaded when it opened, which put back the balance
// from then: a rewarded hint was lost and a spent hint refunded. S6: Settings Reset
// never writes a balance it did not read.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const PACK = 'au.com.uniquegames.soundfind.hints_10';
const AT = '2026-10-13T11:00:00.000Z';
vi.mock('@/lib/platform', () => ({ isNative: () => true, getPlatform: () => 'android' }));
vi.mock('@capacitor-community/admob', async () => (await import('@/lib/admobPluginMock.testutil')).admobModule);
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), captureMessage: vi.fn(), addBreadcrumb: vi.fn() }));
vi.mock('@/lib/admob', async importOriginal => ({ ...(await importOriginal()), showRewarded: vi.fn(async () => true) }));
vi.mock('@/lib/purchases', () => ({
  purchaseProduct: vi.fn(async () => ({ hints: 10, purchase: { productId: 'au.com.uniquegames.soundfind.hints_10', purchaseDate: '2026-10-13T11:00:00.000Z', listed: [{ productIdentifier: 'au.com.uniquegames.soundfind.hints_10', transactionIdentifier: 'rc_TEST_1', purchaseDate: '2026-10-13T11:00:00.000Z' }] } })),
  restorePurchases: vi.fn(), usePrice: () => null, useLowestPrice: () => null, getPrice: () => null,
  PURCHASE_OPTIONS: [{ productId: 'au.com.uniquegames.soundfind.hints_10', hints: 10, label: 'Best Value', gradient: '', shadow: '', popular: true }],
  HINT_PACK_MAP: { 'au.com.uniquegames.soundfind.hints_10': 10 }, REMOVE_ADS_PRODUCT_ID: 'x',
}));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
vi.mock('canvas-confetti', () => ({ default: Object.assign(vi.fn(), { reset: vi.fn() }) }));
vi.mock('@/components/game/voiceUtils', () => ({
  speakPhraseAndWord: vi.fn(), speakFixedPhrase: vi.fn(), unlockAudio: vi.fn(async () => {}),
  preloadGameAudio: vi.fn(), stopAllAudio: vi.fn(), speakWord: vi.fn(), testVoice: vi.fn(),
}));
vi.mock('@/components/game/GameBoard', () => ({
  default: ({ wordPositions, onWordFound }) => (
    <div data-testid="board">
      {Object.entries(wordPositions || {}).map(([w, cells]) => (
        <button key={w} data-find={w} onClick={() => onWordFound(w, cells)}>{w}</button>
      ))}
    </div>
  ),
}));

const { default: Game } = await import('@/pages/Game');
const { default: DailyChallenge } = await import('@/pages/DailyChallenge');
const { default: Settings } = await import('@/pages/Settings');
const { localDateKey } = await import('@/components/game/DailyChallengeUtils');
const { saveDailyRecord } = await import('@/components/game/offlineStorage');
const { reconcileHintPurchases } = await import('@/lib/hintLedger');

let container, root;
const sleep = ms => act(async () => { await new Promise(r => setTimeout(r, ms)); });
async function waitFor(fn, ms = 3000) { for (let t = 0; t < ms && !fn(); t += 50) await sleep(50); return fn(); }
const button = label => [...document.body.querySelectorAll('button')].find(b => b.textContent.includes(label) || b.getAttribute('aria-label') === label);
const click = async label => { const b = button(label); if (!b) throw new Error(`no button "${label}"`); await act(async () => { b.click(); }); await sleep(50); };
const stored = () => JSON.parse(localStorage.getItem('wf_progress'));
const setStored = p => localStorage.setItem('wf_progress', JSON.stringify(p));
async function mount(entry) {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  await act(async () => {
    root.render(<MemoryRouter initialEntries={[entry]}><Routes>
      <Route path="/Game" element={<Game />} /><Route path="/DailyChallenge" element={<DailyChallenge />} />
      <Route path="/Settings" element={<Settings />} /><Route path="*" element={<div />} />
    </Routes></MemoryRouter>);
  });
}
async function inPlay() { expect(await waitFor(() => !!container.querySelector('[data-find]')), 'control: the game is in play').toBe(true); }
async function findAll() {
  for (let i = 0; i < 40; i++) { const n = container.querySelector('[data-find]:not([data-done])'); if (!n) break; n.setAttribute('data-done', '1'); await act(async () => { n.click(); }); await sleep(20); }
  await sleep(300);
}
const pill = n => button(`Hint, ${n} left`) || button(`Hint (${n})`);
async function earnAnAdHint(n) {
  await act(async () => { pill(n).click(); });
  expect(await waitFor(() => !!button('Watch an Ad')), 'control: the hint shop opened').toBe(true);
  await click('Watch an Ad');
}
async function buyTenHints(n) {
  await act(async () => { pill(n).click(); });
  await sleep(400);
  await click('Buy Hint Pack');
  expect(await waitFor(() => !!button('Buy 10 Hints')), 'control: the purchase view opened').toBe(true);
  await click('Buy 10 Hints'); await sleep(100);
}
const replayToday = () => saveDailyRecord(localDateKey(), { completed: true, score: 1, words_found: 1 });

const realRect = Element.prototype.getBoundingClientRect;
beforeEach(() => {
  Element.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 400, bottom: 400, width: 400, height: 400, toJSON() {} });
  localStorage.clear();
  localStorage.setItem('wf_welcome_seen', 'true'); localStorage.setItem('wf_tutorial_done', 'true'); localStorage.setItem('ads_removed', 'true');
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});
afterEach(async () => { Element.prototype.getBoundingClientRect = realRect; await act(async () => root?.unmount()); container?.remove(); root = null; });

describe('Daily replay (already completed today): finishing never changes the balance', () => {
  it('a rewarded hint earned during the replay is kept', async () => {
    setStored({ hints_remaining: 0, credited_txn_ids: [], reconcile_since: '2026-10-12T00:00:00.000Z' });
    replayToday();
    await mount('/DailyChallenge'); await inPlay();
    await earnAnAdHint(0);
    expect(stored().hints_remaining, 'control: the ad hint was stored').toBe(1);
    await findAll();
    expect(stored().hints_remaining).toBe(1);
    expect(stored().games_played, 'control: the replay was saved').toBe(1);
  });

  it('a hint spent during the replay is not refunded', async () => {
    setStored({ hints_remaining: 3 });
    replayToday();
    await mount('/DailyChallenge'); await inPlay();
    await act(async () => { pill(3).click(); }); await sleep(50);
    expect(stored().hints_remaining, 'control: the spend was stored').toBe(2);
    await findAll();
    expect(stored().hints_remaining).toBe(2);
  });

  it('a purchase made while it is open is kept, a hint spent after it is not refunded, and a reconcile credits nothing again', async () => {
    setStored({ hints_remaining: 0, credited_txn_ids: [], reconcile_since: '2026-10-12T00:00:00.000Z' });
    replayToday();
    await mount('/DailyChallenge'); await inPlay();
    await buyTenHints(0);
    expect(stored().hints_remaining, 'control: the pack was credited').toBe(10);
    await act(async () => { pill(10).click(); }); await sleep(50);
    expect(stored().hints_remaining, 'control: the spend was stored').toBe(9);
    await findAll();
    expect(stored().hints_remaining).toBe(9);
    expect(stored().credited_txn_ids).toContain('rc_TEST_1');
    const again = reconcileHintPurchases({ nonSubscriptionTransactions: [{ productIdentifier: PACK, transactionIdentifier: 'rc_TEST_1', purchaseDate: AT }] }, Date.parse(AT) + 60000);
    expect(again).toBe(0);
    expect(stored().hints_remaining).toBe(9);
  });

  it('with no hint actions, the balance is unchanged', async () => {
    setStored({ hints_remaining: 5, total_score: 7, games_played: 2 });
    replayToday();
    await mount('/DailyChallenge'); await inPlay();
    await findAll();
    expect(stored().games_played, 'control: the replay was saved').toBe(3);
    expect(stored().hints_remaining).toBe(5);
  });

  it('a balance changed by another writer while the Daily is open is not put back', async () => {
    setStored({ hints_remaining: 4 });
    replayToday();
    await mount('/DailyChallenge'); await inPlay();
    setStored({ ...stored(), hints_remaining: 6 }); // e.g. a credit written elsewhere
    await findAll();
    expect(stored().hints_remaining).toBe(6);
  });
});

describe('Daily first completion and the Game', () => {
  it('the day\'s reward is added to the stored balance, after a hint spent in the game', async () => {
    setStored({ hints_remaining: 3 });
    await mount('/DailyChallenge'); await inPlay();
    await act(async () => { pill(3).click(); }); await sleep(50);
    await findAll();
    expect(await waitFor(() => /Challenge Complete/i.test(container.textContent)), 'control: the Daily is complete').toBe(true);
    const reward = stored().hints_remaining - 2;
    expect(reward, 'the reward is added to 2, the balance after the spend').toBeGreaterThan(0);
  });

  it('Game: a rewarded hint is kept through victory, and victory does not write the balance', async () => {
    setStored({ hints_remaining: 0 });
    await mount('/Game?mode=standard&category=animals&level=1'); await inPlay();
    await earnAnAdHint(0);
    setStored({ ...stored(), hints_remaining: 4 }); // another writer, after the screen's last read
    await findAll();
    expect(await waitFor(() => !!button('Next Level')), 'control: the victory screen appeared').toBe(true);
    expect(stored().hints_remaining).toBe(4);
    expect(stored().games_played, 'control: the victory was saved').toBe(1);
  });
});

describe('S6: Settings Reset never writes a balance it did not read', () => {
  async function resetFromSettings() {
    await mount('/Settings');
    await click('Reset Game Data');
    expect(await waitFor(() => !!button('Yes, Reset Everything')), 'control: the confirmation opened').toBe(true);
    await click('Yes, Reset Everything');
  }

  it('a valid stored count is kept, with the ledger', async () => {
    setStored({ hints_remaining: 7, credited_txn_ids: ['rc_A'], reconcile_since: '2026-10-12T00:00:00.000Z', games_played: 4 });
    await resetFromSettings();
    expect(stored()).toEqual({ hints_remaining: 7, credited_txn_ids: ['rc_A'], reconcile_since: '2026-10-12T00:00:00.000Z' });
  });

  it('a missing count stays missing (never 0)', async () => {
    setStored({ games_played: 4, credited_txn_ids: [] });
    await resetFromSettings();
    expect(stored().games_played, 'control: Reset ran').toBeUndefined();
    expect('hints_remaining' in stored()).toBe(false);
  });

  it('an invalid count is left exactly as stored', async () => {
    setStored({ hints_remaining: 'x', games_played: 4 });
    await resetFromSettings();
    expect(stored().games_played, 'control: Reset ran').toBeUndefined();
    expect(stored().hints_remaining).toBe('x');
  });
});
