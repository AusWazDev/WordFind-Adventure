import { AdMob, MaxAdContentRating, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import * as Sentry from '@sentry/react';
import { getPlatform } from './platform';

// Child-directed ads (CR-60, brief SF-7, decision S1: every player is treated
// as a possible child). The plugin applies these in initialize() BEFORE the SDK
// starts, on iOS and Android, so they cover every request and every format.
// Only ever pass `true`: on iOS the plugin sets a flag only when it is true, so
// `false` could not clear one. TFCD is deprecated by Google in favour of
// ageRestrictedTreatment, which this plugin version does not expose (K7).
// tagForUnderAgeOfConsent is deliberately NOT set here (CR-60 amendment g):
// Google says TFCD and TFUA "shouldn't both simultaneously be set to true".
// TFUA goes only on the UMP consent request below.
export const CHILD_DIRECTED_CONFIG = {
  initializeForTesting: false,
  tagForChildDirectedTreatment: true,
  maxAdContentRating: MaxAdContentRating.General,
};

// Non-personalised ads on every request (the plugin adds the "npa": "1" extra).
const AD_REQUEST_OPTIONS = { npa: true };

// UMP: tag the consent request as under the age of consent so the SDK asks for
// no consent. The consent and privacy-options forms are never shown: showing
// one is the only path by which UMP can raise the ATT prompt.
export const CONSENT_REQUEST = { tagForUnderAgeOfConsent: true };

const AD_UNITS = {
  android: {
    interstitial: 'ca-app-pub-1060374954785370/7201714073',
    rewarded:     'ca-app-pub-1060374954785370/5473699434',
  },
  ios: {
    interstitial: 'ca-app-pub-1060374954785370/8928590640',
    rewarded:     'ca-app-pub-1060374954785370/2712182023',
  },
};

// Google's published test ad units (SF-57): every non-release build uses these, so a
// developer's device never requests live ads. Interstitial and rewarded, from
// developers.google.com/admob/android/test-ads and .../ios/test-ads.
export const TEST_AD_UNITS = {
  android: {
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded:     'ca-app-pub-3940256099942544/5224354917',
  },
  ios: {
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded:     'ca-app-pub-3940256099942544/1712485313',
  },
};
export const PRODUCTION_AD_UNITS = AD_UNITS;

// Which build this is, from the native shell rather than the JS bundle (the bundle is
// identical in a debug APK and a release AAB). Capacitor sets window.Capacitor.DEBUG
// from the app itself: on Android, the FLAG_DEBUGGABLE of the installed app (Bridge
// isDevMode); on iOS, isDevEnvironment (#if DEBUG, or Info.plist CAPACITOR_DEBUG).
// A release AAB is not debuggable (Play refuses debuggable uploads), so it reads false
// and gets production IDs; only a debug build reads true.
export function isDebugBuild(win = typeof window === 'undefined' ? undefined : window) {
  return win?.Capacitor?.DEBUG === true;
}

export function adUnitsFor(platform, debugBuild) {
  return (debugBuild ? TEST_AD_UNITS : PRODUCTION_AD_UNITS)[platform] ?? null;
}

function getAdUnits() {
  return adUnitsFor(getPlatform(), isDebugBuild());
}

export async function initAdMob() {
  const units = getAdUnits();
  if (!units) return;
  // Consent info first; a failure here must never block ads or the game.
  try {
    const info = await AdMob.requestConsentInfo(CONSENT_REQUEST);
    Sentry.addBreadcrumb({ category: 'admob', message: 'consent info', data: { status: info?.status, canRequestAds: info?.canRequestAds }, level: 'info' });
  } catch (e) {
    console.warn('[AdMob] requestConsentInfo failed:', e);
    Sentry.addBreadcrumb({ category: 'admob', message: 'requestConsentInfo failed', data: { error: String(e) }, level: 'warning' });
  }
  try {
    await AdMob.initialize(CHILD_DIRECTED_CONFIG);
    prepareInterstitial();
  } catch (e) {
    console.warn('[AdMob] init failed:', e);
    Sentry.captureException(e, { tags: { context: 'admob_init' } });
  }
}

// SF-66b B2. A failed load is retried ONCE, INTERSTITIAL_RETRY_MS later; if that fails
// too, nothing more is requested until the next show attempt (which reloads). A loaded ad
// older than INTERSTITIAL_MAX_AGE_MS is treated as not prepared at show time and
// reloaded: Google's interstitials expire after an hour.
export const INTERSTITIAL_RETRY_MS = 60 * 1000;
export const INTERSTITIAL_MAX_AGE_MS = 50 * 60 * 1000;
let loadedAt = null;      // when the current interstitial finished loading, or null
let retryTimer = null;    // the one pending retry, if any

export async function prepareInterstitial({ retry = false } = {}) {
  const units = getAdUnits();
  if (!units) return;
  try {
    await AdMob.prepareInterstitial({ adId: units.interstitial, ...AD_REQUEST_OPTIONS });
    loadedAt = Date.now();
  } catch (e) {
    loadedAt = null;
    console.warn('[AdMob] prepareInterstitial failed:', e);
    Sentry.addBreadcrumb({ category: 'admob', message: 'prepareInterstitial failed', data: { error: String(e), retry }, level: 'warning' });
    if (!retry && !retryTimer) {
      retryTimer = setTimeout(() => { retryTimer = null; prepareInterstitial({ retry: true }); }, INTERSTITIAL_RETRY_MS);
    }
  }
}

// Tests only.
export const __resetInterstitialState = () => { loadedAt = null; clearTimeout(retryTimer); retryTimer = null; };

// Show the preloaded interstitial and resolve only when it is GONE (DEF-54, SF-57).
// The plugin's own AdMob.showInterstitial() resolves straight after show()/present()
// (@capacitor-community/admob 8.0.0: Android AdInterstitialExecutor.java:69-70, iOS
// AdInterstitialExecutor.swift:39-40), while the ad is still on screen. So this waits
// for the plugin's events instead: Dismissed (the close control, or Back once the ad
// allows it) resolves true; FailedToShow, or a rejected show (not loaded: Android
// :57-62, iOS :43), resolves false at once. onShowed runs on the Showed event, when
// the ad is actually on screen. Resolves exactly once; every listener is removed.
// No timeout: an ad left open (or the app backgrounded) keeps the next game waiting.
export function showInterstitialUntilClosed({ onShowed } = {}) {
  return new Promise(resolve => {
    let settled = false;
    const handles = [];
    const finish = (dismissed, error) => {
      if (settled) return;
      settled = true;
      if (error) {
        console.warn('[AdMob] interstitial did not show:', error);
        Sentry.addBreadcrumb({ category: 'admob', message: 'interstitial did not show', data: { error: String(error) }, level: 'warning' });
      }
      Promise.all(handles).then(hs => hs.forEach(h => h?.remove?.())).catch(() => {});
      resolve(dismissed);
      loadedAt = null; // shown, failed or expired: this ad is used up
      prepareInterstitial(); // fire-and-forget pre-load for next time
    };
    const listen = (event, fn) => handles.push(Promise.resolve(AdMob.addListener(event, fn)));
    // An ad loaded more than INTERSTITIAL_MAX_AGE_MS ago is not shown: it counts as not
    // prepared, so finish() reloads it, as for any ad that cannot be shown (B2).
    if (loadedAt !== null && Date.now() - loadedAt > INTERSTITIAL_MAX_AGE_MS) {
      finish(false, 'interstitial older than 50 minutes');
      return;
    }
    listen(InterstitialAdPluginEvents.Showed, () => { if (!settled) onShowed?.(); });
    listen(InterstitialAdPluginEvents.Dismissed, () => finish(true));
    listen(InterstitialAdPluginEvents.FailedToShow, e => finish(false, e?.message || 'failed to show'));
    Promise.all(handles)
      .then(() => AdMob.showInterstitial())
      .catch(e => finish(false, e?.message || e));
  });
}

// Show rewarded video. Returns true if reward was granted, false if skipped or error.
export async function showRewarded() {
  const units = getAdUnits();
  if (!units) return false;
  try {
    await AdMob.prepareRewardVideoAd({ adId: units.rewarded, ...AD_REQUEST_OPTIONS });
    const reward = await AdMob.showRewardVideoAd();
    return !!reward;
  } catch (e) {
    console.warn('[AdMob] showRewarded failed:', e);
    Sentry.addBreadcrumb({ category: 'admob', message: 'showRewarded failed', data: { error: String(e) }, level: 'warning' });
    return false;
  }
}
