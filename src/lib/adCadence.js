// Interstitial cadence, in one place (S41, SF-52).
//
// Every completed game counts, normal and Daily alike (recordCompletedGame). When at
// least AD_FREQUENCY games have been completed since the last ad shown (SF-57), the
// interstitial is due and shows before the NEXT game starts, whichever way it starts:
// Home's level picker, Next Level, Replay, starting the Daily, or the Daily's Try
// Again. The next game waits until the ad is dismissed (DEF-54, SF-57).
//
// The gates are the ones Home has always applied (CR-15): ads not removed, online,
// and the cadence threshold. The native interstitial is native only; off native,
// Home keeps its placeholder AdModal (interstitialDue + markInterstitialShown), and
// the other start paths show nothing and do not use up the turn.
//
// The storage keys are unchanged (they are published): games_completed_count and
// last_ad_completed_at.
import { isNative, isWindowsApp } from '@/lib/platform';
import { showInterstitialUntilClosed } from '@/lib/admob';

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
  if (isWindowsApp()) return false; // S25 (SF-74): no ads of any kind on Windows
  if (adsRemoved || !isOnline) return false;
  const completedCount = readInt(COUNT_KEY);
  const lastAdAt = readInt(LAST_AD_KEY); // 0 when no ad has been shown
  // SF-57: at least AD_FREQUENCY completions since the last ad SHOWN, so two ads are
  // never fewer than 6 completed games apart (the privacy policy: "at most, after every
  // 6 completed games"). The old rule (a new multiple of 6) let an ad at 11 be followed
  // by one at 12. A long gap still gives one ad; the next is 6 completions after it.
  return completedCount - lastAdAt >= AD_FREQUENCY;
}

export function markInterstitialShown() {
  localStorage.setItem(LAST_AD_KEY, String(readInt(COUNT_KEY)));
}

let inFlight = null;

// For every start path: on native, if an ad is due, show it and resolve only when it is
// dismissed, or at once if it fails to load or show (DEF-54, SF-57); the caller starts
// the next game, and any timer, afterwards. The ad is recorded (last_ad_completed_at)
// only when it is actually on screen, so a failed ad leaves it due for the next start.
// A second call while one is showing waits for the same ad rather than requesting another.
export function showInterstitialBeforeGame(gates) {
  if (inFlight) return inFlight;
  if (!isNative() || !interstitialDue(gates)) return Promise.resolve(false);
  inFlight = showInterstitialUntilClosed({ onShowed: markInterstitialShown })
    .catch(() => false)
    .finally(() => { inFlight = null; });
  return inFlight;
}
