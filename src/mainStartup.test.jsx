// @vitest-environment jsdom
// CR-86 (FB-24, Sentry SOUNDFIND-6): main.jsx's stale service-worker cleanup
// (CR-53) must never reject unhandled. In Electron's app:// page,
// getRegistrations() rejects ("The document is in an invalid state"), because
// the app scheme is not registered with allowServiceWorkers. That rejection
// reached Sentry as an unhandled promise rejection, 17 times.
// The REAL main.jsx runs here; only App, React's renderer and Sentry are replaced.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';

const sentry = vi.hoisted(() => ({ init: vi.fn() }));
vi.mock('@sentry/react', () => sentry);
vi.mock('@/App.jsx', () => ({ default: () => null }));
vi.mock('react-dom/client', () => ({ default: { createRoot: () => ({ render() {} }) }, createRoot: () => ({ render() {} }) }));
vi.mock('@/index.css', () => ({}));

const PKG_VERSION = JSON.parse(readFileSync('package.json', 'utf8')).version;
const BROWSER_UA = navigator.userAgent;
const ELECTRON_UA = `${BROWSER_UA} SoundFind/1.1.1 Electron/41.3.0`;

const unhandled = [];
const onUnhandled = reason => { unhandled.push(reason); };
const settle = () => new Promise(r => setTimeout(r, 20));

function setUA(ua) { Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => ua }); }
function setServiceWorker(sw) {
  if (sw === undefined) { delete navigator.serviceWorker; return; }
  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: sw });
}
async function runMain() {
  vi.resetModules();
  await import('./main.jsx');
  await settle();
}

beforeEach(() => {
  unhandled.length = 0;
  process.on('unhandledRejection', onUnhandled);
  document.body.innerHTML = '<div id="root"></div>';
  window.Capacitor = window.Capacitor || {};          // @capacitor/core sets this on every platform
  sentry.init.mockClear();
  setUA(BROWSER_UA);
});
afterEach(() => {
  process.off('unhandledRejection', onUnhandled);
  setServiceWorker(undefined);
  setUA(BROWSER_UA);
});

describe('startup service-worker cleanup (SOUNDFIND-6)', () => {
  it('Electron: a rejecting getRegistrations() never becomes an unhandled rejection', async () => {
    setUA(ELECTRON_UA);
    const err = new DOMException('Failed to get ServiceWorkerRegistration objects: The document is in an invalid state.', 'InvalidStateError');
    const getRegistrations = vi.fn(() => Promise.reject(err));
    setServiceWorker({ getRegistrations });
    await runMain();
    expect(sentry.init).toHaveBeenCalledTimes(1);      // control: main.jsx ran
    expect(unhandled).toEqual([]);
    expect(getRegistrations).not.toHaveBeenCalled();   // Electron is skipped, not just caught
  });

  it('any platform: a throwing or rejecting serviceWorker never becomes an unhandled rejection', async () => {
    setServiceWorker({ getRegistrations: vi.fn(() => Promise.reject(new Error('boom'))) });
    await runMain();
    expect(unhandled).toEqual([]);
    setServiceWorker({ getRegistrations: vi.fn(() => { throw new Error('sync boom'); }) });
    await expect(runMain()).resolves.toBeUndefined();  // startup does not throw either
    expect(unhandled).toEqual([]);
  });

  it('no serviceWorker at all: nothing is called and nothing rejects', async () => {
    setServiceWorker(undefined);
    await runMain();
    expect(sentry.init).toHaveBeenCalledTimes(1);
    expect(unhandled).toEqual([]);
  });

  it('web and native: stale workers are still unregistered (CR-53 unchanged)', async () => {
    const reg = { unregister: vi.fn(() => Promise.resolve(true)) };
    const getRegistrations = vi.fn(() => Promise.resolve([reg]));
    setServiceWorker({ getRegistrations });
    await runMain();
    expect(getRegistrations).toHaveBeenCalledTimes(1);
    expect(reg.unregister).toHaveBeenCalledTimes(1);
  });
});

describe('the Sentry release label', () => {
  it('equals soundfind@ plus the package.json version', async () => {
    setServiceWorker(undefined);
    await runMain();
    expect(PKG_VERSION).toMatch(/^\d+\.\d+\.\d+$/);    // control: the version was read
    expect(sentry.init.mock.calls[0][0].release).toBe(`soundfind@${PKG_VERSION}`);
  });
});
