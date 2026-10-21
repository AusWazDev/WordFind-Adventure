// @vitest-environment jsdom
// S25 (SF-74): the Windows app has no ads of any kind, no "Watch an Ad", no Remove Ads,
// and a hint shop that sells through the Microsoft Store (a stub reporting the store
// unavailable until SF-75). The web build and native are unchanged, and this file
// proves that too: every Windows case has its web or native twin.
//
// CONTROL: SF74_FORCE_WINDOWS=1 forces the Windows predicate true everywhere, so the
// web and native twins below must fail. That run is reported, not kept.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const platform = vi.hoisted(() => ({ native: false, windows: false }));
const online = vi.hoisted(() => ({ value: true }));
const toast = vi.hoisted(() => ({ info: vi.fn(), error: vi.fn(), success: vi.fn() }));
const purchaseProduct = vi.hoisted(() => vi.fn(async () => ({ hints: 10, purchase: { productId: 'p' } })));
const showInterstitial = vi.hoisted(() => vi.fn(async () => {}));

vi.mock('@/lib/platform', () => ({
  isWindowsApp: () => platform.windows || process.env.SF74_FORCE_WINDOWS === '1',
  isNative: () => platform.native,
  getPlatform: () => (platform.native ? 'android' : 'web'),
}));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => online.value }));
vi.mock('@/lib/admob', () => ({
  showInterstitialUntilClosed: (...a) => showInterstitial(...a),
  showRewarded: vi.fn(async () => true),
  initAdMob: vi.fn(),
}));
vi.mock('@/lib/purchases', async importOriginal => ({
  ...(await importOriginal()),
  purchaseProduct: (...a) => purchaseProduct(...a),
  restorePurchases: vi.fn(async () => ({ adsRemoved: false })),
  usePrice: () => null,
  useLowestPrice: () => null,
}));
vi.mock('sonner', async importOriginal => ({ ...(await importOriginal()), toast }));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), captureMessage: vi.fn(), addBreadcrumb: vi.fn(), withProfiler: c => c }));
vi.mock('@/components/game/voiceUtils', () => ({
  speakPhraseAndWord: vi.fn(), unlockAudio: vi.fn(async () => {}), stopAllAudio: vi.fn(),
}));

const { default: Home } = await import('./pages/Home');
const { default: Settings } = await import('./pages/Settings');
const { default: HintModal, WINDOWS_HINT_SOURCES, WINDOWS_BILLING, WINDOWS_STORE_UNAVAILABLE } = await import('./components/game/HintModal');
const { default: AdModal } = await import('./components/game/AdModal');
const { default: RemoveAdsModal } = await import('./components/game/RemoveAdsModal');
const { default: GameModeSelector, WINDOWS_OFFLINE_BANNER } = await import('./components/game/GameModeSelector');
const { interstitialDue } = await import('./lib/adCadence');
const { buyHintPack, hintShopStore, hintPackOptions } = await import('./lib/hintShop');
const { StoreUnavailableError } = await import('./lib/windowsStore');

let container, root;
const settle = () => act(async () => { await new Promise(r => setTimeout(r, 30)); });
const button = label => [...container.querySelectorAll('button')].find(b => b.textContent.includes(label));
const unsplashImages = () => [...document.querySelectorAll('img')].filter(i => /unsplash/.test(i.getAttribute('src') || ''));
async function mount(el) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root.render(el); });
  await settle();
}
const AD_TEXT = 'Your game starts in';

beforeEach(() => {
  platform.native = false; platform.windows = false; online.value = true;
  Object.values(toast).forEach(f => f.mockClear());
  purchaseProduct.mockClear(); showInterstitial.mockClear();
  localStorage.clear();
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  window.scrollTo = () => {};
});
afterEach(async () => { await act(async () => root?.unmount()); container?.remove(); });

// ── Home: the between-game ad ────────────────────────────────────────────────
async function homeToLevel(completed) {
  localStorage.setItem('wf_welcome_seen', 'true');
  localStorage.setItem('wf_tutorial_done', 'true');
  localStorage.setItem('games_completed_count', String(completed));
  await mount(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Game" element={<div>GAME PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  );
  await act(async () => { button('Standard').click(); }); await settle();
  await act(async () => { [...container.querySelectorAll('button')].find(b => /animals/i.test(b.textContent)).click(); }); await settle();
  await act(async () => { [...container.querySelectorAll('button')].find(b => /Easy/.test(b.textContent)).click(); }); await settle();
}

describe('Home: no between-game ad on Windows (B1)', () => {
  it('Windows, ad due (6 completed): straight to the game, no placeholder ad, no Unsplash image', async () => {
    platform.windows = true;
    await homeToLevel(6);
    expect(container.textContent).not.toContain(AD_TEXT);
    expect(container.textContent).toContain('GAME PAGE');
    expect(unsplashImages()).toHaveLength(0);
    expect(showInterstitial).not.toHaveBeenCalled();
  });
  it('web, ad due: the placeholder ad still shows (web unchanged)', { timeout: 20000 }, async () => {
    await homeToLevel(6);
    expect(container.textContent).toContain(AD_TEXT);
    expect(container.textContent).not.toContain('GAME PAGE');
  });
  it('native, ad due: the real interstitial is still requested (native unchanged)', async () => {
    platform.native = true;
    await homeToLevel(6);
    expect(showInterstitial).toHaveBeenCalledTimes(1);
  });
});

describe('the ad cadence (B1)', () => {
  it('Windows: never due, even 6 games on', () => {
    platform.windows = true;
    localStorage.setItem('games_completed_count', '6');
    expect(interstitialDue({ adsRemoved: false, isOnline: true })).toBe(false);
  });
  it('web: due at 6, as before', () => {
    localStorage.setItem('games_completed_count', '6');
    expect(interstitialDue({ adsRemoved: false, isOnline: true })).toBe(true);
  });
});

// ── AdModal and RemoveAdsModal, opened directly ──────────────────────────────
describe('no placeholder ad and no Remove Ads on Windows, wherever mounted (B1, B2)', () => {
  it('Windows: AdModal opened renders nothing and loads no Unsplash image', async () => {
    platform.windows = true;
    await mount(<AdModal isOpen onClose={() => {}} onRemoveAds={() => {}} />);
    expect(container.textContent).toBe('');
    expect(unsplashImages()).toHaveLength(0);
  });
  it('web: AdModal opened renders, with its Remove Ads upsell', async () => {
    await mount(<AdModal isOpen onClose={() => {}} onRemoveAds={() => {}} />);
    expect(document.body.textContent).toContain(AD_TEXT);
    expect(document.body.textContent).toContain('Remove Ads');
  });
  it('Windows: RemoveAdsModal opened renders nothing', async () => {
    platform.windows = true;
    await mount(<RemoveAdsModal isOpen onClose={() => {}} onSuccess={() => {}} />);
    expect(container.textContent).toBe('');
  });
  it('web: RemoveAdsModal opened renders', async () => {
    await mount(<RemoveAdsModal isOpen onClose={() => {}} onSuccess={() => {}} />);
    expect(document.body.textContent).toContain('No ads between games');
  });
});

describe('Settings: no Go Ad-Free and no Restore Purchases on Windows (B2)', () => {
  const mountSettings = () => mount(<MemoryRouter><Routes><Route path="*" element={<Settings />} /></Routes></MemoryRouter>);
  it('Windows: neither is shown', async () => {
    platform.windows = true;
    await mountSettings();
    expect(container.textContent, 'control: Settings rendered').toContain('Voice Type');
    expect(container.textContent).not.toContain('Go Ad-Free');
    expect(container.textContent).not.toContain('Restore Purchases');
  });
  it('native: both are still shown (native unchanged)', async () => {
    platform.native = true;
    await mountSettings();
    expect(container.textContent).toContain('Go Ad-Free');
    expect(container.textContent).toContain('Restore Purchases');
  });
});

// ── The hint shop ────────────────────────────────────────────────────────────
const handlers = () => ({ onClose: vi.fn(), onWatchAd: vi.fn(), onPurchase: vi.fn() });
async function openShop(h = handlers()) { await mount(<HintModal isOpen {...h} />); return h; }
// The views sit in AnimatePresence mode="wait": the pack list mounts after the menu's exit.
async function toPurchaseView() {
  await act(async () => { button('Buy Hint Pack').click(); });
  for (let i = 0; i < 100 && !document.body.textContent.includes('Best Value'); i++) {
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
  }
  expect(document.body.textContent, 'control: the pack list is showing').toContain('Best Value');
}

describe('HintModal on Windows (B1, B3, B5)', () => {
  beforeEach(() => { platform.windows = true; });
  it('online: no "Watch an Ad", the Windows hint sources, and "Buy Hint Pack"', async () => {
    await openShop();
    const t = document.body.textContent;
    expect(t).not.toContain('Watch an Ad');
    expect(t).not.toContain('Watch & Earn');
    expect(t).toContain(WINDOWS_HINT_SOURCES);
    expect(button('Buy Hint Pack')).toBeDefined();
    expect(t).toContain('5, 10 or 25 hints'); // S42
  });
  it('offline: still no "Watch an Ad" tile', async () => {
    online.value = false;
    await openShop();
    expect(document.body.textContent).not.toContain('Watch an Ad');
    expect(document.body.textContent).toContain('Go online to purchase hints');
  });
  it('purchase view: three packs, Microsoft Store billing, the calm unavailable message, Buy disabled', async () => {
    await openShop();
    await toPurchaseView();
    const t = document.body.textContent;
    for (const n of ['5 Hints', '10 Hints', '25 Hints']) expect(t).toContain(n); // S42
    expect(t).not.toMatch(/(^|\D)3 Hints/);
    expect(t).toContain(WINDOWS_BILLING);
    expect(t).not.toContain('App Store / Google Play');
    expect(t).toContain(WINDOWS_STORE_UNAVAILABLE);
    expect(t).not.toContain('Coming soon');
    const buy = button('Buy 10 Hints');
    expect(buy.disabled).toBe(true);
    expect(purchaseProduct).not.toHaveBeenCalled();
    expect(unsplashImages()).toHaveLength(0);
  });
});

describe('HintModal on the web and on native (unchanged)', () => {
  it('web: "Watch an Ad" and the original subtitle are still there', async () => {
    await openShop();
    expect(button('Watch an Ad')).toBeDefined();
    expect(document.body.textContent).toContain('Choose how to unlock your next hint');
    expect(document.body.textContent).not.toContain(WINDOWS_HINT_SOURCES);
    expect(document.body.textContent).toContain('3, 10 or 25 hints'); // unchanged by S42
  });
  it('web: the purchase view keeps the App Store / Google Play line and answers "Coming soon"', async () => {
    await openShop();
    await toPurchaseView();
    expect(document.body.textContent).toContain('Prices are indicative · Billed through the App Store / Google Play');
    for (const n of ['3 Hints', '10 Hints', '25 Hints']) expect(document.body.textContent).toContain(n); // unchanged by S42
    expect(document.body.textContent).not.toMatch(/(^|\D)5 Hints/); // "25 Hints" contains "5 Hints"
    expect(document.body.textContent).not.toContain(WINDOWS_STORE_UNAVAILABLE);
    await act(async () => { button('Buy 10 Hints').click(); });
    expect(toast.info).toHaveBeenCalledWith('Coming soon', expect.anything());
    expect(purchaseProduct).not.toHaveBeenCalled();
  });
  it('native: buying goes through RevenueCat (purchaseProduct) and credits the pack', async () => {
    platform.native = true;
    const h = await openShop();
    await toPurchaseView();
    await act(async () => { button('Buy 10 Hints').click(); });
    await settle();
    expect(purchaseProduct).toHaveBeenCalledWith('au.com.uniquegames.soundfind.hints_10');
    expect(h.onPurchase).toHaveBeenCalledWith(10, { productId: 'p' });
  });
});

describe('the purchase interface (A2)', () => {
  it('Windows: the store is "windows" and a purchase is refused as store-unavailable', async () => {
    platform.windows = true;
    expect(hintShopStore()).toBe('windows');
    await expect(buyHintPack('au.com.uniquegames.soundfind.hints_5')).rejects.toBeInstanceOf(StoreUnavailableError);
    expect(purchaseProduct).not.toHaveBeenCalled();
  });
  // S42 (21 Oct 2026): Windows sells 5, 10 and 25; iOS, Android and the web keep 3, 10 and 25.
  it('Windows: the packs are 5, 10 and 25 hints', () => {
    platform.windows = true;
    expect(hintPackOptions().map(o => [o.productId, o.hints])).toEqual([
      ['au.com.uniquegames.soundfind.hints_5', 5],
      ['au.com.uniquegames.soundfind.hints_10', 10],
      ['au.com.uniquegames.soundfind.hints_25', 25],
    ]);
  });
  it('native and web: the packs are still 3, 10 and 25 hints, with the native product IDs', () => {
    for (const native of [true, false]) {
      platform.native = native;
      expect(hintPackOptions().map(o => [o.productId, o.hints])).toEqual([
        ['au.com.uniquegames.soundfind.hints_3', 3],
        ['au.com.uniquegames.soundfind.hints_10', 10],
        ['au.com.uniquegames.soundfind.hints_25', 25],
      ]);
    }
  });
  it('native: the store is "native" and RevenueCat is called', async () => {
    platform.native = true;
    expect(hintShopStore()).toBe('native');
    await buyHintPack('au.com.uniquegames.soundfind.hints_3');
    expect(purchaseProduct).toHaveBeenCalledWith('au.com.uniquegames.soundfind.hints_3');
  });
  it('web: no store, "coming soon"', async () => {
    expect(hintShopStore()).toBe('none');
    expect(await buyHintPack('au.com.uniquegames.soundfind.hints_3')).toEqual({ comingSoon: true });
  });
});

// ── The offline banner (B5) ──────────────────────────────────────────────────
describe('the offline banner', () => {
  beforeEach(() => { online.value = false; });
  it('Windows: hint packs need a connection, no mention of ads', async () => {
    platform.windows = true;
    await mount(<GameModeSelector onSelectMode={() => {}} />);
    expect(container.textContent).toContain(WINDOWS_OFFLINE_BANNER);
    expect(container.textContent).not.toMatch(/\bads\b/);
  });
  it('native: the original line (native unchanged)', async () => {
    platform.native = true;
    await mount(<GameModeSelector onSelectMode={() => {}} />);
    expect(container.textContent).toContain("You're offline. Every mode still works. Ads and purchases need a connection.");
  });
  it('web: the original Audio Challenge line (web unchanged)', async () => {
    await mount(<GameModeSelector onSelectMode={() => {}} />);
    expect(container.textContent).toContain("You're offline. Audio Challenge is limited, and all other modes work normally.");
  });
});

// ── No dashes in any player-facing string this brief added (STANDING) ────────
describe('the new Windows strings carry no dashes', () => {
  it('none of em dash, en dash or double hyphen', () => {
    for (const s of [WINDOWS_HINT_SOURCES, WINDOWS_BILLING, WINDOWS_STORE_UNAVAILABLE, WINDOWS_OFFLINE_BANNER]) {
      expect(s).not.toMatch(/—|–|--/);
    }
  });
});
