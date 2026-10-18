// @vitest-environment jsdom
// S41 (SF-74): the Daily streak award, Windows only. 2 hints each time the streak
// reaches a multiple of 3, once per milestone, per run of the streak.
// The predicate here is the REAL one (no platform mock): jsdom is not Electron, so a
// claim without an explicit `windows` option must pay nothing, as on the web.
import { describe, it, expect, beforeEach } from 'vitest';
import {
  claimStreakAward, streakAwardDue, streakRunStart, STREAK_AWARD_KEY, STREAK_AWARD_HINTS,
} from './streakReward';

const WIN = { windows: true };
const guard = () => JSON.parse(localStorage.getItem(STREAK_AWARD_KEY) || 'null');

beforeEach(() => localStorage.clear());

describe('the run a streak belongs to', () => {
  it('a 3 day streak ending 30 Sep started 28 Sep', () => {
    expect(streakRunStart('2026-09-30', 3)).toBe('2026-09-28');
  });
  it('across a month boundary: 6 days ending 2 Oct started 27 Sep', () => {
    expect(streakRunStart('2026-10-02', 6)).toBe('2026-09-27');
  });
});

describe('S41 behaviour', () => {
  it('reaching 3 pays 2, once; claiming 3 again pays nothing', () => {
    expect(claimStreakAward('2026-09-30', 3, WIN)).toBe(STREAK_AWARD_HINTS);
    expect(STREAK_AWARD_HINTS).toBe(2);
    expect(guard()).toEqual({ run_start: '2026-09-28', paid_through: 3 });
    expect(claimStreakAward('2026-09-30', 3, WIN)).toBe(0);
  });
  it('the same run reaching 6, then 9, pays each time', () => {
    expect(claimStreakAward('2026-09-30', 3, WIN)).toBe(2);
    expect(claimStreakAward('2026-10-03', 6, WIN)).toBe(2);
    expect(claimStreakAward('2026-10-06', 9, WIN)).toBe(2);
    expect(guard()).toEqual({ run_start: '2026-09-28', paid_through: 9 });
  });
  it('a broken streak that rebuilds to 3 pays again (a new run)', () => {
    expect(claimStreakAward('2026-09-30', 3, WIN)).toBe(2);
    // The streak broke; a new run of 3 ends 10 Oct (started 8 Oct).
    expect(claimStreakAward('2026-10-10', 3, WIN)).toBe(2);
    expect(guard()).toEqual({ run_start: '2026-10-08', paid_through: 3 });
  });
  it('streaks that are not a multiple of 3 pay nothing and record nothing', () => {
    for (const s of [1, 2, 4, 5, 7]) expect(claimStreakAward('2026-09-30', s, WIN)).toBe(0);
    expect(guard()).toBeNull();
  });
  it('a lower milestone in a run already paid higher pays nothing', () => {
    localStorage.setItem(STREAK_AWARD_KEY, JSON.stringify({ run_start: '2026-09-28', paid_through: 6 }));
    expect(streakAwardDue('2026-09-30', 3)).toBe(false);
  });
});

describe('never off Windows', () => {
  it('explicitly not Windows: pays nothing, records nothing', () => {
    expect(claimStreakAward('2026-09-30', 3, { windows: false })).toBe(0);
    expect(guard()).toBeNull();
  });
  it('the real predicate in a browser page (the web): pays nothing, records nothing', () => {
    expect(claimStreakAward('2026-09-30', 3)).toBe(0);
    expect(guard()).toBeNull();
  });
});
