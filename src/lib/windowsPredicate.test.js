// @vitest-environment jsdom
// SF-74: the Windows predicate (platform.js isWindowsApp), the real one, unmocked.
// True only for the Electron app; false for a browser page (the web build) and for a
// Capacitor page (iOS, Android).
import { describe, it, expect, afterEach } from 'vitest';
import { isWindowsApp } from './platform';
import { isElectronPage } from './staleServiceWorkers';

const BROWSER_UA = navigator.userAgent;
const setUA = ua => Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => ua });
afterEach(() => setUA(BROWSER_UA));

describe('isWindowsApp', () => {
  it('a browser page (the web build): false', () => {
    expect(location.protocol).not.toBe('app:');
    expect(isWindowsApp()).toBe(false);
  });
  it('the Electron app (its user agent carries "Electron/"): true', () => {
    setUA(`${BROWSER_UA} Electron/41.3.0`);
    expect(isWindowsApp()).toBe(true);
  });
  it('a Capacitor page (iOS, Android user agents carry no "Electron/"): false', () => {
    setUA('Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36');
    expect(isWindowsApp()).toBe(false);
    expect(isElectronPage(navigator, { protocol: 'capacitor:' })).toBe(false);
  });
  it('the Electron app\'s own origin, app://localhost: true by protocol alone', () => {
    expect(isElectronPage({ userAgent: '' }, { protocol: 'app:' })).toBe(true);
  });
});
