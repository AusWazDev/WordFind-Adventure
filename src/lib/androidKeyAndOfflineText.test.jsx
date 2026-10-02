// @vitest-environment jsdom
// CR-88. (a) Native Android configures RevenueCat with its public SDK key ("goog_…"):
// initPurchases no longer returns early on Android. (b) The Audio Challenge tile's
// offline line "example sentences need internet" shows only where sentences really
// come from the network: the web. iOS and Android bundle the clips, and Electron
// serves its bundled dist/ under app://.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const platform = vi.hoisted(() => ({ native: true, name: 'android' }));
vi.mock('@/lib/platform', () => ({ isNative: () => platform.native, getPlatform: () => platform.name }));
const online = vi.hoisted(() => ({ value: false }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => online.value }));
const Purchases = vi.hoisted(() => ({
  configure: vi.fn(async () => {}),
  getCustomerInfo: vi.fn(async () => ({ customerInfo: { entitlements: { active: {} } } })),
  getProducts: vi.fn(async () => ({ products: [] })),
}));
vi.mock('@revenuecat/purchases-capacitor', () => ({ Purchases, PRODUCT_CATEGORY: { NON_SUBSCRIPTION: 'NON_SUBSCRIPTION' } }));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), addBreadcrumb: vi.fn() }));

const { initPurchases } = await import('./purchases');
const { default: GameModeSelector } = await import('@/components/game/GameModeSelector');

const OFFLINE_LINE = 'example sentences need internet';
const BROWSER_UA = navigator.userAgent;
const setUA = ua => Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => ua });
const tile = () => renderToString(<GameModeSelector onSelectMode={() => {}} />);

beforeEach(() => { Purchases.configure.mockClear(); platform.native = true; platform.name = 'android'; online.value = false; setUA(BROWSER_UA); });

describe('(a) Android RevenueCat key (CR-88)', () => {
  it('initPurchases on Android configures RevenueCat with a "goog_" public key', async () => {
    await initPurchases();
    expect(Purchases.configure).toHaveBeenCalledTimes(1);
    const { apiKey } = Purchases.configure.mock.calls[0][0];
    expect(typeof apiKey).toBe('string');
    expect(apiKey.length).toBeGreaterThan(5);
    expect(apiKey.startsWith('goog_')).toBe(true);
  });
  it('control: a platform with no key still returns early', async () => {
    platform.name = 'web';
    await initPurchases();
    expect(Purchases.configure).not.toHaveBeenCalled();
  });
});

describe('(b) the offline "need internet" line (CR-88)', () => {
  it('native, offline: not shown, and the normal description is', () => {
    const html = tile();
    expect(html).not.toContain(OFFLINE_LINE);
    expect(html).toContain('Hear the word, find its spelling');
  });
  it('web, offline: still shown (sentences come from the network there)', () => {
    platform.native = false; platform.name = 'web';
    expect(tile()).toContain(OFFLINE_LINE);              // control: the line can render
  });
  it('Electron, offline: not shown (bundled audio under app://)', () => {
    platform.native = false; platform.name = 'web';
    setUA(`${BROWSER_UA} Electron/41.3.0`);
    expect(tile()).not.toContain(OFFLINE_LINE);
  });
  it('native, online: the normal description', () => {
    online.value = true;
    expect(tile()).not.toContain(OFFLINE_LINE);
  });
});
