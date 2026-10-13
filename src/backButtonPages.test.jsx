// @vitest-environment jsdom
// SF-65 (U7): Android Back on the real pages, through the one installed listener.
// The listener is driven by a fake @capacitor/app plugin that records its listeners;
// pressing Back calls the 'backButton' listener exactly as Capacitor would.
// Rules: b (a modal closes as its Close does), c (Game and Daily in play: the header
// Back), d (Victory: Home with no ad call), f (Settings' own Back; Stats, which has
// none, goes Home), g (Home minimises).
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const platform = vi.hoisted(() => ({ native: true }));
vi.mock('@/lib/platform', () => ({ isNative: () => !!platform.native, getPlatform: () => (platform.native === 'ios' ? 'ios' : platform.native ? 'android' : 'web') }));
vi.mock('@capacitor-community/admob', async () => (await import('@/lib/admobPluginMock.testutil')).admobModule);
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), captureMessage: vi.fn(), addBreadcrumb: vi.fn(), withProfiler: c => c }));
vi.mock('@/lib/purchases', () => ({ initPurchases: vi.fn(), purchaseProduct: vi.fn(), restorePurchases: vi.fn(), usePrice: () => null, useLowestPrice: () => null, getPrice: () => null, PURCHASE_OPTIONS: [], REMOVE_ADS_PRODUCT_ID: 'x', HINT_PACK_MAP: {} }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
vi.mock('canvas-confetti', () => ({ default: Object.assign(vi.fn(), { reset: vi.fn() }) }));
vi.mock('@/components/game/voiceUtils', () => ({
  speakPhraseAndWord: vi.fn(), speakFixedPhrase: vi.fn(), unlockAudio: vi.fn(async () => {}),
  preloadGameAudio: vi.fn(), stopAllAudio: vi.fn(), speakWord: vi.fn(), speakWordAudio: vi.fn(async () => {}),
  speakSentenceAudio: vi.fn(async () => {}),
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
// Every ad function the pages can reach, wrapped in a spy that still runs the real code.
const adSpies = vi.hoisted(() => ({}));
const wrap = (name, real) => Object.fromEntries(Object.entries(real).map(([k, v]) => [k, typeof v === 'function' ? (adSpies[`${name}.${k}`] = vi.fn(v)) : v]));
vi.mock('@/lib/adCadence', async importOriginal => wrap('adCadence', await importOriginal()));
vi.mock('@/lib/admob', async importOriginal => wrap('admob', await importOriginal()));

const { plugin } = await import('@/lib/admobPluginMock.testutil');
const { installBackButton, __resetBackButton, resolveBack, registeredHandlers } = await import('@/lib/backButton');
// Which rule Back would apply now (so a rule's own handler cannot pass by the default Home path).
const ruleNow = () => resolveBack({ handlers: registeredHandlers(), onHome: false }).rule;
const { BackButtonBridge } = await import('@/App');
const { default: Game } = await import('@/pages/Game');
const { default: DailyChallenge } = await import('@/pages/DailyChallenge');
const { default: Settings } = await import('@/pages/Settings');
const { default: Stats } = await import('@/pages/Stats');

// The fake @capacitor/app plugin.
let listeners, CapApp;
const makeApp = () => {
  listeners = {};
  CapApp = {
    addListener: vi.fn(async (n, fn) => { listeners[n] = fn; return { remove: () => { delete listeners[n]; } }; }),
    minimizeApp: vi.fn(async () => {}), exitApp: vi.fn(async () => {}),
  };
};
vi.mock('@capacitor/app', () => ({ App: new Proxy({}, { get: (_, k) => CapApp[k] }) }));

let container, root, path, state;
function Probe() { const l = useLocation(); path = l.pathname + l.search; state = l.state; return null; }
async function mount(entry, extra = []) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[...extra, entry]} initialIndex={extra.length}>
        <Probe />
        <BackButtonBridge />
        <Routes>
          <Route path="/Game" element={<Game />} />
          <Route path="/DailyChallenge" element={<DailyChallenge />} />
          <Route path="/Settings" element={<Settings />} />
          <Route path="/Stats" element={<Stats />} />
          <Route path="/Home" element={<div data-testid="home">home</div>} />
          <Route path="/" element={<div data-testid="home">home</div>} />
          <Route path="*" element={<div>other</div>} />
        </Routes>
      </MemoryRouter>,
    );
  });
  await sleep(0); // the bridge installs asynchronously
}
const sleep = ms => act(async () => { await new Promise(r => setTimeout(r, ms)); });
const button = label => [...document.body.querySelectorAll('button')] // the dialogs render in a portal
  .find(b => b.textContent.includes(label) || b.getAttribute('aria-label') === label);
const back = () => act(async () => { listeners.backButton({ canGoBack: true }); });
async function waitFor(fn, ms = 3000) { for (let t = 0; t < ms && !fn(); t += 50) await sleep(50); return fn(); }
async function findAllWords() {
  for (let i = 0; i < 40; i++) {
    const next = container.querySelector('[data-find]:not([data-done])');
    if (!next) break;
    next.setAttribute('data-done', '1');
    await act(async () => { next.click(); });
    await sleep(20);
  }
}
const adCalls = () => Object.fromEntries(Object.entries(adSpies).map(([k, s]) => [k, s.mock.calls.length]));
const pluginAdCalls = () => ['showInterstitial', 'prepareInterstitial', 'showRewardVideoAd', 'prepareRewardVideoAd'].reduce((n, k) => n + plugin.AdMob[k].mock.calls.length, 0);

const realRect = Element.prototype.getBoundingClientRect;
beforeEach(() => {
  Element.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 400, bottom: 400, width: 400, height: 400, toJSON() {} });
  localStorage.clear();
  localStorage.setItem('wf_welcome_seen', 'true');
  localStorage.setItem('wf_tutorial_done', 'true');
  plugin.reset();
  platform.native = true;
  __resetBackButton();
  makeApp();
  Object.values(adSpies).forEach(s => s.mockClear());
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});
afterEach(async () => {
  plugin.dismiss();
  Element.prototype.getBoundingClientRect = realRect;
  await act(async () => root?.unmount());
  container?.remove(); root = null;
  __resetBackButton();
});

describe('the listener (SF-65)', () => {
  it('the bridge installs exactly one backButton listener on Android', async () => {
    await mount('/Home');
    expect(CapApp.addListener.mock.calls.map(c => c[0]).filter(n => n === 'backButton')).toEqual(['backButton']);
  });
});

describe('rule c: Game and Daily during play call the header Back', () => {
  it('Game: Back goes Home, as the header Back does', async () => {
    await mount('/Game?mode=standard&category=animals&level=1');
    expect(await waitFor(() => !!container.querySelector('[data-find]')), 'control: the game is in play').toBe(true);
    expect(ruleNow()).toBe('c');
    await back();
    expect(path).toBe('/Home');
  });

  it('Daily: Back goes Home, as the header Home does', async () => {
    await mount('/DailyChallenge');
    expect(await waitFor(() => !!container.querySelector('[data-find]')), 'control: the Daily is in play').toBe(true);
    expect(ruleNow()).toBe('c');
    await back();
    expect(path).toBe('/Home');
  });
});

describe('rule d: Victory goes Home with no ad', () => {
  it('Game: with an ad DUE, Back on Victory goes Home and calls no ad function', async () => {
    localStorage.setItem('games_completed_count', '5'); localStorage.setItem('last_ad_completed_at', '0');
    await mount('/Game?mode=standard&category=animals&level=1');
    await findAllWords();
    expect(await waitFor(() => !!button('Next Level')), 'control: the victory screen appeared').toBe(true);
    expect(localStorage.getItem('games_completed_count'), 'control: an ad is due on Next Level').toBe('6');
    expect(ruleNow()).toBe('d');
    const before = adCalls();
    const pluginBefore = pluginAdCalls();
    await back();
    await sleep(50);
    expect(path).toBe('/Home');
    expect(adCalls()).toEqual(before);
    expect(pluginAdCalls()).toBe(pluginBefore);
    expect(adSpies['adCadence.showInterstitialBeforeGame']).not.toHaveBeenCalled();
  });

  it('Daily: Back on Challenge Complete goes Home and calls no ad function', async () => {
    await mount('/DailyChallenge');
    expect(await waitFor(() => !!container.querySelector('[data-find]'))).toBe(true);
    await findAllWords();
    expect(await waitFor(() => /Challenge Complete/i.test(container.textContent)), 'control: the Daily is complete').toBe(true);
    expect(ruleNow()).toBe('d');
    const before = adCalls();
    await back();
    await sleep(50);
    expect(path).toBe('/Home');
    expect(adCalls()).toEqual(before);
    expect(adSpies['adCadence.showInterstitialBeforeGame']).not.toHaveBeenCalled();
  });
});

describe('rule b: a modal closes through its own close function, and nothing else happens', () => {
  it('Game: with the hint modal open, Back closes it and stays in the game', async () => {
    localStorage.setItem('wf_progress', JSON.stringify({ id: 'local', current_level: 1, total_score: 0, hints_remaining: 0, games_played: 0, words_found: 0, best_streak: 0 }));
    await mount('/Game?mode=standard&category=animals&level=1');
    expect(await waitFor(() => !!container.querySelector('[data-find]'))).toBe(true);
    await act(async () => { button('Hint, 0 left').click(); });
    expect(await waitFor(() => !!document.querySelector('[aria-label="Close"]')), 'control: the hint modal opened').toBe(true);
    await back();
    expect(await waitFor(() => !document.querySelector('[aria-label="Close"]'))).toBe(true);
    expect(path).toContain('/Game');
  });

  it('Settings: with the Reset confirmation open, Back closes it as Cancel does; nothing is reset', async () => {
    localStorage.setItem('wf_progress', JSON.stringify({ id: 'local', current_level: 4, total_score: 10, hints_remaining: 3, games_played: 2, words_found: 9, best_streak: 0 }));
    const progress = localStorage.getItem('wf_progress');
    await mount('/Settings', ['/Home']);
    await act(async () => { button('Reset').click(); });
    expect(await waitFor(() => !!button('Cancel')), 'control: the confirmation opened').toBe(true);
    await back();
    expect(await waitFor(() => !button('Cancel'))).toBe(true);
    expect(path).toBe('/Settings');
    expect(localStorage.getItem('wf_progress')).toBe(progress);
  });
});

describe('rule b: the Remove Ads sheet', () => {
  it('Settings: with Go Ad-Free open, Back closes it and stays on Settings', async () => {
    await mount('/Settings', ['/Home']);
    await act(async () => { button('Go Ad-Free').click(); });
    expect(await waitFor(() => !!document.querySelector('[aria-label="Close"]')), 'control: the sheet opened').toBe(true);
    expect(ruleNow()).toBe('b');
    await back();
    expect(await waitFor(() => !document.querySelector('[aria-label="Close"]'))).toBe(true);
    expect(path).toBe('/Settings');
  });
});

describe('rule f: secondary pages', () => {
  it('Settings: Back does what its Back control does (navigate(-1))', async () => {
    await mount('/Settings', ['/Stats']);
    expect(ruleNow()).toBe('f');
    await back();
    expect(path).toBe('/Stats');
  });

  it('Stats has no Back control: Back goes Home through the router', async () => {
    await mount('/Stats');
    expect(registeredHandlers()).toEqual([]);
    await back();
    expect(path).toBe('/Home');
    expect(CapApp.minimizeApp).not.toHaveBeenCalled();
  });
});

describe('rule g: Home minimises', () => {
  it('on Home, Back calls minimizeApp, never exitApp, and stays on Home', async () => {
    await mount('/Home');
    await back();
    expect(CapApp.minimizeApp).toHaveBeenCalledTimes(1);
    expect(CapApp.exitApp).not.toHaveBeenCalled();
    expect(path).toBe('/Home');
  });
});

describe('rule a: a native screen in front', () => {
  it('while the app is inactive (an ad or a purchase sheet is up), Back does nothing', async () => {
    await mount('/Stats');
    await act(async () => { listeners.appStateChange({ isActive: false }); });
    await back();
    expect(path).toBe('/Stats');
    expect(CapApp.minimizeApp).not.toHaveBeenCalled();
    await act(async () => { listeners.appStateChange({ isActive: true }); });
    await back();
    expect(path, 'control: once active again, Back works').toBe('/Home');
  });
});

describe('never registered off Android', () => {
  for (const p of ['web (and Electron)', 'iOS']) {
    it(`${p}: the bridge registers no listener`, async () => {
      platform.native = p === 'iOS' ? 'ios' : false;
      await mount('/Home');
      expect(CapApp.addListener).not.toHaveBeenCalled();
      expect(listeners).toEqual({});
    });
  }
  it('installBackButton returns null and registers nothing on iOS', async () => {
    platform.native = 'ios';
    expect(await installBackButton(CapApp, { goHome() {}, onHome: () => true })).toBeNull();
    expect(CapApp.addListener).not.toHaveBeenCalled();
  });
});
