// @vitest-environment jsdom
// SF-57 (DEF-54): the interstitial flow against the ad plugin as it really behaves
// (admobPluginMock.testutil.js: showInterstitial resolves while the ad is still on
// screen; Dismissed says it has closed). (i) the remaining start paths wait for
// Dismissed; (ii) a load or show failure continues at once; (iii) the cadence gap;
// (iv) debug builds use Google's test ad units, release builds the production ones.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const platform = vi.hoisted(() => ({ native: true }));
vi.mock('@/lib/platform', () => ({ isWindowsApp: () => false, isNative: () => platform.native, getPlatform: () => (platform.native ? 'android' : 'web') }));
vi.mock('@capacitor-community/admob', async () => (await import('@/lib/admobPluginMock.testutil')).admobModule);
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), addBreadcrumb: vi.fn() }));
vi.mock('@/lib/purchases', () => ({ purchaseProduct: vi.fn(), restorePurchases: vi.fn(), usePrice: () => null, useLowestPrice: () => null, PURCHASE_OPTIONS: [], REMOVE_ADS_PRODUCT_ID: 'x', HINT_PACK_MAP: {} }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
vi.mock('@/components/game/voiceUtils', () => ({
  speakPhraseAndWord: vi.fn(), speakFixedPhrase: vi.fn(), unlockAudio: vi.fn(async () => {}),
  preloadGameAudio: vi.fn(), stopAllAudio: vi.fn(), speakWord: vi.fn(),
}));
vi.mock('@/components/game/GameBoard', () => ({ default: () => <div data-testid="board" /> }));
// The Daily's time limit is shortened to 1 s for the Try Again test only.
const daily = vi.hoisted(() => ({ shortTimer: false }));
vi.mock('@/components/game/DailyChallengeUtils', async importOriginal => {
  const real = await importOriginal();
  return { ...real, dailyTimeLimit: (t, n) => (daily.shortTimer ? 1 : real.dailyTimeLimit(t, n)) };
});

const { plugin } = await import('@/lib/admobPluginMock.testutil');
const cadence = await import('@/lib/adCadence');
const admob = await import('@/lib/admob');
const { default: Home } = await import('@/pages/Home');
const { default: DailyChallenge } = await import('@/pages/DailyChallenge');

let container, root, path;
function Probe() { const l = useLocation(); path = l.pathname + l.search; return null; }
async function mount(entry, element) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(<MemoryRouter initialEntries={[entry]}><Probe /><Routes><Route path="*" element={element} /></Routes></MemoryRouter>);
  });
}
const sleep = ms => act(async () => { await new Promise(r => setTimeout(r, ms)); });
const button = label => [...container.querySelectorAll('button')].find(b => b.textContent.includes(label));
async function waitFor(fn, ms = 3000) { for (let t = 0; t < ms && !fn(); t += 50) await sleep(50); return fn(); }
const setCounters = (done, lastAd) => {
  localStorage.setItem('games_completed_count', String(done));
  if (lastAd === null) localStorage.removeItem('last_ad_completed_at'); else localStorage.setItem('last_ad_completed_at', String(lastAd));
};
const lastAd = () => localStorage.getItem('last_ad_completed_at');
const realRect = Element.prototype.getBoundingClientRect;

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('wf_welcome_seen', 'true');
  localStorage.setItem('wf_tutorial_done', 'true'); // SF-64: or Home resumes the tutorial
  plugin.reset();
  platform.native = true;
  daily.shortTimer = false;
  Element.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 400, bottom: 400, width: 400, height: 400, toJSON() {} });
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});
afterEach(async () => {
  plugin.dismiss();
  Element.prototype.getBoundingClientRect = realRect;
  if (root) await act(async () => root.unmount());
  container?.remove(); root = null;
});

describe('(i) every start path waits for the ad to be dismissed (DEF-54)', () => {
  it('Home level picker: the game opens only after Dismissed, not when showInterstitial resolves', async () => {
    setCounters(6, null);
    await mount('/Home', <Home />);
    await act(async () => { button('Standard').click(); });
    await act(async () => { button('Animals').click(); });
    await act(async () => { button('Easy').click(); });
    await sleep(200);
    expect(plugin.AdMob.showInterstitial).toHaveBeenCalledTimes(1);
    expect(path, 'still on Home while the ad is on screen').toBe('/Home');
    await act(async () => { plugin.dismiss(); });
    expect(await waitFor(() => path.startsWith('/Game'))).toBe(true);
  });

  it('Daily Try Again: the new board and its timer start only after Dismissed', async () => {
    daily.shortTimer = true;
    setCounters(6, null);
    await mount('/DailyChallenge', <DailyChallenge />);
    expect(await waitFor(() => !!button('Try Again'), 4000), "control: the Daily ran out of time").toBe(true);
    await act(async () => { button('Try Again').click(); });
    await sleep(1500);                                       // longer than the 1 s timer
    expect(plugin.AdMob.showInterstitial).toHaveBeenCalledTimes(1);
    expect(button('Try Again'), "the Time's Up card stays: no new board, no timer").toBeDefined();
    await act(async () => { plugin.dismiss(); });
    expect(await waitFor(() => !button('Try Again'), 800), 'the new board starts after Dismissed').toBe(true);
  });

  it('listeners are removed after use, and a second Dismissed changes nothing', async () => {
    setCounters(6, null);
    let resolved = 0;
    const p = cadence.showInterstitialBeforeGame().then(v => { resolved++; return v; });
    await sleep(50);
    expect(plugin.listenerCount()).toBeGreaterThan(0);
    await act(async () => { plugin.dismiss(); plugin.dismiss(); });
    expect(await p).toBe(true);
    await sleep(50);
    expect(resolved).toBe(1);
    expect(plugin.listenerCount()).toBe(0);
  });
});

describe('(ii) a load or show failure continues at once, and does not count as an ad', () => {
  for (const mode of ['notLoaded', 'failToShow']) {
    it(`${mode}: showInterstitialBeforeGame resolves false at once; last_ad_completed_at unchanged`, async () => {
      setCounters(6, null);
      plugin.mode = mode;
      const result = await Promise.race([
        cadence.showInterstitialBeforeGame(),
        new Promise(r => setTimeout(() => r('HUNG'), 1000)),
      ]);
      expect(result).toBe(false);
      expect(lastAd()).toBeNull();
      expect(cadence.interstitialDue({ adsRemoved: false, isOnline: true }), 'still due for the next start').toBe(true);
    });
  }
});

describe('(iii) the cadence gap: never fewer than 6 completed games between ads', () => {
  const due = () => cadence.interstitialDue({ adsRemoved: false, isOnline: true });
  it('after an ad shown at 11: none due at 12 to 16; one due at 17', () => {
    for (let n = 12; n <= 16; n++) { setCounters(n, 11); expect(due(), `at ${n}`).toBe(false); }
    setCounters(17, 11); expect(due()).toBe(true);
  });
  it('10 completions and no ad: one due; once shown, none for the next 5', async () => {
    setCounters(10, null);
    expect(due()).toBe(true);
    const shown = cadence.showInterstitialBeforeGame();
    await sleep(50);
    await act(async () => { plugin.dismiss(); });
    expect(await shown).toBe(true);
    expect(lastAd()).toBe('10');
    for (let n = 10; n <= 15; n++) { setCounters(n, 10); expect(due(), `at ${n}`).toBe(false); }
    setCounters(16, 10); expect(due()).toBe(true);
  });
  it('an ad that fails to show does not move last_ad_completed_at', async () => {
    setCounters(13, 6);
    plugin.mode = 'failToShow';
    expect(await cadence.showInterstitialBeforeGame()).toBe(false);
    expect(lastAd()).toBe('6');
  });
});

describe('(iv) ad units: Google test units in debug builds only, production units in release', () => {
  const GOOGLE_TEST_PUBLISHER = 'ca-app-pub-3940256099942544/';
  for (const platformName of ['android', 'ios']) {
    it(`${platformName}: release resolves to the production units, with no test unit`, () => {
      const units = admob.adUnitsFor(platformName, false);
      expect(units).toBe(admob.PRODUCTION_AD_UNITS[platformName]);
      expect(Object.values(units).some(id => id.startsWith(GOOGLE_TEST_PUBLISHER))).toBe(false);
    });
    it(`${platformName}: debug resolves to Google's test units only`, () => {
      const units = admob.adUnitsFor(platformName, true);
      expect(units).toBe(admob.TEST_AD_UNITS[platformName]);
      expect(Object.values(units).every(id => id.startsWith(GOOGLE_TEST_PUBLISHER))).toBe(true);
    });
  }
  it('the build flag comes from Capacitor (window.Capacitor.DEBUG), true only when exactly true', () => {
    expect(admob.isDebugBuild({ Capacitor: { DEBUG: true } })).toBe(true);
    expect(admob.isDebugBuild({ Capacitor: { DEBUG: false } })).toBe(false);
    expect(admob.isDebugBuild({ Capacitor: {} })).toBe(false);
    expect(admob.isDebugBuild({})).toBe(false);
    expect(admob.isDebugBuild(undefined)).toBe(false);
  });
});
