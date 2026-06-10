import { AdMob } from '@capacitor-community/admob';
import * as Sentry from '@sentry/react';
import { getPlatform } from './platform';

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
  try {
    await AdMob.initialize({ initializeForTesting: false });
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
    await AdMob.prepareInterstitial({ adId: units.interstitial });
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
    await AdMob.prepareRewardVideoAd({ adId: units.rewarded });
    const reward = await AdMob.showRewardVideoAd();
    return !!reward;
  } catch (e) {
    console.warn('[AdMob] showRewarded failed:', e);
    Sentry.addBreadcrumb({ category: 'admob', message: 'showRewarded failed', data: { error: String(e) }, level: 'warning' });
    return false;
  }
}
