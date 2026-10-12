// A test double of @capacitor-community/admob 8.0.0's INTERSTITIAL behaviour, copied
// from its source (SF-57, DEF-54), not from what we would like it to do:
// - showInterstitial() resolves straight after show()/present(), while the ad is still
//   on screen (Android AdInterstitialExecutor.java:69-70; iOS AdInterstitialExecutor.swift:39-40);
// - "interstitialAdShowed" fires as the ad appears (FullscreenPluginCallback.kt:13-15);
// - "interstitialAdDismissed" fires only when the ad is closed (:24-26): call dismiss();
// - a show that fails fires "interstitialAdFailedToShow" (:17-22);
// - with no ad loaded, showInterstitial() rejects and fires "interstitialAdFailedToLoad"
//   (AdInterstitialExecutor.java:57-62; iOS rejects "Ad wasn't ready", :43).
// addListener returns a Promise of a handle with remove(), as the plugin's does.
import { vi } from 'vitest';

const listeners = new Map();
export const plugin = {
  mode: 'show',            // 'show' | 'notLoaded' | 'failToShow'
  emit(event, data) { [...(listeners.get(event) || [])].forEach(fn => fn(data)); },
  listenerCount() { return [...listeners.values()].reduce((n, s) => n + s.size, 0); },
  dismiss() { plugin.emit('interstitialAdDismissed'); },
  reset() { listeners.clear(); plugin.mode = 'show'; Object.values(plugin.AdMob).forEach(f => f.mockClear?.()); },
  AdMob: {
    addListener: vi.fn(async (event, fn) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(fn);
      return { remove: async () => { listeners.get(event)?.delete(fn); } };
    }),
    showInterstitial: vi.fn(async () => {
      if (plugin.mode === 'notLoaded') {
        plugin.emit('interstitialAdFailedToLoad', { code: -1, message: 'not prepared' });
        throw new Error('No Interstitial can be shown. It was not prepared or maybe it failed to be prepared.');
      }
      queueMicrotask(() => (plugin.mode === 'failToShow'
        ? plugin.emit('interstitialAdFailedToShow', { code: 0, message: 'failed to show' })
        : plugin.emit('interstitialAdShowed')));
    }),
    prepareInterstitial: vi.fn(async () => ({ adUnitId: 'x' })),
    prepareRewardVideoAd: vi.fn(async () => ({})),
    showRewardVideoAd: vi.fn(async () => ({ type: 'coins', amount: 1 })),
    initialize: vi.fn(async () => {}),
    requestConsentInfo: vi.fn(async () => ({})),
  },
};

export const admobModule = {
  AdMob: plugin.AdMob,
  MaxAdContentRating: { General: 'General' },
  InterstitialAdPluginEvents: {
    Loaded: 'interstitialAdLoaded',
    FailedToLoad: 'interstitialAdFailedToLoad',
    Showed: 'interstitialAdShowed',
    FailedToShow: 'interstitialAdFailedToShow',
    Dismissed: 'interstitialAdDismissed',
  },
};
