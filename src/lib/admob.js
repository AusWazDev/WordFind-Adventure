import { AdMob, MaxAdContentRating } from '@capacitor-community/admob';
import * as Sentry from '@sentry/react';
import { getPlatform } from './platform';

// Child-directed ads (CR-60, brief SF-7, decision S1: every player is treated
// as a possible child). The plugin applies these in initialize() BEFORE the SDK
// starts, on iOS and Android, so they cover every request and every format.
// Only ever pass `true`: on iOS the plugin sets a flag only when it is true, so
// `false` could not clear one. TFCD and TFUA are deprecated by Google in favour
// of ageRestrictedTreatment, which this plugin version does not expose (K7);
// Google applies the most conservative treatment when both are set.
export const CHILD_DIRECTED_CONFIG = {
  initializeForTesting: false,
  tagForChildDirectedTreatment: true,
  tagForUnderAgeOfConsent: true,
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

function getAdUnits() {
  return AD_UNITS[getPlatform()] ?? null;
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

export async function prepareInterstitial() {
  const units = getAdUnits();
  if (!units) return;
  try {
    await AdMob.prepareInterstitial({ adId: units.interstitial, ...AD_REQUEST_OPTIONS });
  } catch (e) {
    console.warn('[AdMob] prepareInterstitial failed:', e);
    Sentry.addBreadcrumb({ category: 'admob', message: 'prepareInterstitial failed', data: { error: String(e) }, level: 'warning' });
  }
}

// Show preloaded interstitial. Resolves when dismissed (or immediately on error).
export async function showInterstitial() {
  try {
    await AdMob.showInterstitial();
  } catch (e) {
    console.warn('[AdMob] showInterstitial failed:', e);
    Sentry.addBreadcrumb({ category: 'admob', message: 'showInterstitial failed', data: { error: String(e) }, level: 'warning' });
  }
  prepareInterstitial(); // fire-and-forget pre-load for next time
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
