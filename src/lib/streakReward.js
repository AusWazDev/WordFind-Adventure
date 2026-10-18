// The Daily streak award, Windows only (S41, SF-74).
//
// A Daily streak pays STREAK_AWARD_HINTS each time it reaches a multiple of
// STREAK_MILESTONE (3, 6, 9 ...), once per milestone. The streak is the existing
// Daily streak (DailyChallenge.jsx: yesterday completed, so today's streak is
// yesterday's plus one), stored on each wf_daily record. Nothing here changes it.
//
// "Once per milestone" is per RUN of the streak. A run is named by the date it
// started: today's date minus (streak - 1) days. The guard records the run and the
// highest milestone already paid in it:
//   reaching 3, then 6, 9 ... in one run pays each time;
//   a broken streak that rebuilds to 3 is a new run, so it pays again;
//   a same-day replay never reaches here (DailyChallenge returns early, S28).
// The guard is written BEFORE the hints are credited, so an interruption between the
// two can only under-pay, never pay twice.
//
// New key (no existing key is reused): wf_daily_streak_awards
//   { "run_start": "YYYY-MM-DD", "paid_through": <highest milestone paid> }
import { isWindowsApp } from '@/lib/platform';
import { localDateKey } from '@/components/game/DailyChallengeUtils';

export const STREAK_AWARD_KEY = 'wf_daily_streak_awards';
export const STREAK_MILESTONE = 3;
export const STREAK_AWARD_HINTS = 2;

// The local date key on which a streak of `streak` days ending on `dateKey` began.
export function streakRunStart(dateKey, streak) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return localDateKey(new Date(y, m - 1, d - (streak - 1)));
}

function readGuard() {
  try {
    const raw = localStorage.getItem(STREAK_AWARD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Whether a streak of `streak` ending on `dateKey` earns the award, given the guard.
export function streakAwardDue(dateKey, streak, guard = readGuard()) {
  if (!Number.isInteger(streak) || streak <= 0 || streak % STREAK_MILESTONE !== 0) return false;
  const runStart = streakRunStart(dateKey, streak);
  return !(guard && guard.run_start === runStart && guard.paid_through >= streak);
}

// Records the award if it is due and returns the hints to add: STREAK_AWARD_HINTS or 0.
// Never pays off Windows.
export function claimStreakAward(dateKey, streak, { windows = isWindowsApp() } = {}) {
  if (!windows) return 0;
  if (!streakAwardDue(dateKey, streak)) return 0;
  localStorage.setItem(STREAK_AWARD_KEY, JSON.stringify({
    run_start: streakRunStart(dateKey, streak),
    paid_through: streak,
  }));
  return STREAK_AWARD_HINTS;
}
