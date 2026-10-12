// Interstitial cadence, in one place (S41, SF-52).
//
// Every completed game counts, normal and Daily alike (recordCompletedGame). When
// the count crosses a new multiple of AD_FREQUENCY, the interstitial is due and
// shows before the NEXT game starts, whichever way it starts: Home's level picker,
// Next Level, Replay, starting the Daily, or the Daily's Try Again.
//
// The gates are the ones Home has always applied (CR-15): ads not removed, online,
// and the cadence threshold. The native interstitial is native only; off native,
// Home keeps its placeholder AdModal (interstitialDue + markInterstitialShown), and
// the other start paths show nothing and do not use up the turn.
//
// The storage keys are unchanged (they are published): games_completed_count and
// last_ad_completed_at.
import { isNative } from '@/lib/platform';
import { showInterstitial } from '@/lib/admob';

export const AD_FREQUENCY = 6; // show interstitial after every 6th completed game (not start)
const COUNT_KEY = 'games_completed_count';
const LAST_AD_KEY = 'last_ad_completed_at';

const readInt = key => parseInt(localStorage.getItem(key) || '0');

// A completed game: all words found (and, in Mystery Word, the bonus found or skipped).
export function recordCompletedGame() {
  const completed = readInt(COUNT_KEY) + 1;
  localStorage.setItem(COUNT_KEY, String(completed));
  return completed;
}

// Whether an interstitial is due before the next game. Defaults read the same
// state Home reads: the ads_removed flag and the browser's online status.
export function interstitialDue({
  adsRemoved = localStorage.getItem('ads_removed') === 'true',
  isOnline = typeof navigator === 'undefined' ? true : navigator.onLine,
} = {}) {
  if (adsRemoved || !isOnline) return false;
  const completedCount = readInt(COUNT_KEY);
  const lastAdAt = readInt(LAST_AD_KEY);
  // A new multiple of AD_FREQUENCY completions since the last ad was shown.
  return completedCount >= AD_FREQUENCY &&
    Math.floor(completedCount / AD_FREQUENCY) > Math.floor(lastAdAt / AD_FREQUENCY);
}

export function markInterstitialShown() {
  localStorage.setItem(LAST_AD_KEY, String(readInt(COUNT_KEY)));
}

let inFlight = null;

// For every start path: on native, if an ad is due, show it and resolve when it is
// dismissed (or fails); the caller starts the game afterwards. A second call while
// one is showing waits for the same ad rather than requesting another.
export function showInterstitialBeforeGame(gates) {
  if (inFlight) return inFlight;
  if (!isNative() || !interstitialDue(gates)) return Promise.resolve(false);
  markInterstitialShown();
  inFlight = Promise.resolve(showInterstitial())
    .catch(() => {})
    .then(() => true)
    .finally(() => { inFlight = null; });
  return inFlight;
}
