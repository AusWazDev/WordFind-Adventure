// @vitest-environment jsdom
// CR-90. Offline on native (iOS, Android) and Electron, every mode works: all audio is
// bundled. So the dashboard banner says so, and the Audio Challenge "Limited offline"
// badge is gone. The web keeps its current wording and badge (the CR-88 rule).
import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const platform = vi.hoisted(() => ({ native: true }));
vi.mock('@/lib/platform', () => ({ isNative: () => platform.native, getPlatform: () => (platform.native ? 'android' : 'web') }));
const online = vi.hoisted(() => ({ value: false }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => online.value }));

const { default: GameModeSelector } = await import('./GameModeSelector');

const NEW_TEXT = "You're offline. Every mode still works — ads and purchases need a connection.";
const OLD_TEXT = "You're offline. Audio Challenge is limited — all other modes work normally.";
const BADGE = 'Limited offline';
const BROWSER_UA = navigator.userAgent;
const setUA = ua => Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => ua });
const html = () => renderToString(<GameModeSelector onSelectMode={() => {}} />).replace(/&#x27;/g, "'");
const count = (s, sub) => s.split(sub).length - 1;

beforeEach(() => { platform.native = true; online.value = false; setUA(BROWSER_UA); });

describe('offline banner and badge (CR-90)', () => {
  it('native, offline: the new banner, no old text, no "Limited offline" badge', () => {
    const h = html();
    expect(count(h, NEW_TEXT)).toBe(1);
    expect(count(h, OLD_TEXT)).toBe(0);
    expect(count(h, BADGE)).toBe(0);
  });
  it('Electron, offline: the same as native', () => {
    platform.native = false;
    setUA(`${BROWSER_UA} Electron/41.3.0`);
    const h = html();
    expect(count(h, NEW_TEXT)).toBe(1);
    expect(count(h, OLD_TEXT)).toBe(0);
    expect(count(h, BADGE)).toBe(0);
  });
  it('control, web offline: the current wording and badge still render', () => {
    platform.native = false;
    const h = html();
    expect(count(h, OLD_TEXT)).toBe(1);
    expect(count(h, BADGE)).toBe(1);
    expect(count(h, NEW_TEXT)).toBe(0);
  });
  it('online: no banner and no badge on any platform', () => {
    online.value = true;
    for (const native of [true, false]) {
      platform.native = native;
      const h = html();
      expect(count(h, NEW_TEXT) + count(h, OLD_TEXT) + count(h, BADGE)).toBe(0);
    }
  });
  it('the new text has no double hyphen', () => {
    expect(NEW_TEXT.includes('--')).toBe(false);
  });
});
