// CR-53's launch cleanup of stale service workers, guarded (CR-86, FB-24, Sentry
// SOUNDFIND-6).
//
// Why the cleanup exists: iOS 1.0.1 and Android versionCode 1 and 2 shipped the
// web build's Workbox service worker, which intercepts capacitor:// audio, so
// audio silently falls back to speech (CR-53, CR-55). Upgraded devices can still
// hold that worker, so it is unregistered on every launch. That stays.
//
// What changed: in Electron, the page is app://localhost, and the app scheme is
// not registered with allowServiceWorkers, so getRegistrations() rejects with
// "The document is in an invalid state". The old code had no catch, and the
// rejection reached Sentry unhandled. Electron never had a service worker to
// clean up (vite leaves the PWA plugin out of the electron build), so it is
// skipped, and any rejection anywhere else is caught.
//
// The condition for running is unchanged: `window.Capacitor`, which
// @capacitor/core sets on every platform, web included.

export function isElectronPage(nav = navigator, loc = location) {
  return loc?.protocol === 'app:' || /\bElectron\//.test(nav?.userAgent || '');
}

// Resolves to what it did; never rejects.
export async function unregisterStaleServiceWorkers({ nav = navigator, win = window } = {}) {
  try {
    if (!win?.Capacitor) return 'skipped';
    if (!nav || !('serviceWorker' in nav) || typeof nav.serviceWorker?.getRegistrations !== 'function') return 'unsupported';
    if (isElectronPage(nav, win.location)) return 'skipped (electron)';
    const regs = await nav.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r => Promise.resolve().then(() => r.unregister()).catch(() => false)));
    return 'done';
  } catch {
    return 'failed';
  }
}
