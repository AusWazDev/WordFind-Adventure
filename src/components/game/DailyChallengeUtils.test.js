// Daily Challenge date keys and template rotation (CR-61, brief SF-1).
// TZ is set before any Date is created; the first test proves it took effect.
process.env.TZ = 'Australia/Melbourne';

import { describe, it, expect, vi, afterEach } from 'vitest';
import { getDailyChallengeConfig, localDateKey, previousLocalDateKey } from './DailyChallengeUtils';

// Wall-clock times in Melbourne, written as UTC instants.
const at = iso => new Date(iso);

// Measure through the system clock, so the code under test is called exactly as
// the app calls it: getDailyChallengeConfig() with no argument.
const configAt = when => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(when); return getDailyChallengeConfig(); };
afterEach(() => vi.useRealTimers());

describe('the apparatus: the test really runs in Australia/Melbourne', () => {
  it('reports AEST (+10) in September and AEDT (+11) in December', () => {
    expect(new Date('2026-09-30T00:00:00Z').getTimezoneOffset()).toBe(-600);
    expect(new Date('2026-12-01T00:00:00Z').getTimezoneOffset()).toBe(-660);
  });
});

describe('record key is the local date (b)', () => {
  it('09:59 AEST on 30 Sep 2026 is keyed 2026-09-30, not the UTC date 2026-09-29', () => {
    const now = at('2026-09-29T23:59:00Z'); // 09:59 AEST, 30 Sep
    expect(configAt(now).date).toBe('2026-09-30');
  });

  it('10:01 AEST on 30 Sep 2026 is keyed 2026-09-30', () => {
    const now = at('2026-09-30T00:01:00Z'); // 10:01 AEST, 30 Sep
    expect(configAt(now).date).toBe('2026-09-30');
  });

  it('00:30 AEDT on 1 Jan 2027 is keyed 2027-01-01 (DST and year boundary)', () => {
    const now = at('2026-12-31T13:30:00Z'); // 00:30 AEDT, 1 Jan
    expect(configAt(now).date).toBe('2027-01-01');
  });

  it('localDateKey and previousLocalDateKey agree with the config key', () => {
    const now = at('2026-09-29T23:59:00Z');
    expect(localDateKey(now)).toBe('2026-09-30');
    expect(previousLocalDateKey(now)).toBe('2026-09-29');
    expect(previousLocalDateKey(at('2027-03-01T01:00:00Z'))).toBe('2027-02-28');
  });
});

describe('template rotation (c)', () => {
  // Noon local time each day avoids any doubt about which day is meant.
  const noonOn = (y, m, d) => new Date(y, m - 1, d, 12, 0, 0);

  it('31 Jul and 1 Aug 2026 get different templates', () => {
    expect(configAt(noonOn(2026, 7, 31)).title)
      .not.toBe(configAt(noonOn(2026, 8, 1)).title);
  });

  it('no two consecutive calendar days share a template, across a full year and a DST change', () => {
    const repeats = [];
    for (let i = 0; i < 366; i++) {
      const a = noonOn(2026, 9, 30 + i);
      const b = noonOn(2026, 9, 31 + i);
      if (configAt(a).title === configAt(b).title) {
        repeats.push(`${a.toDateString()} / ${b.toDateString()}`);
      }
    }
    expect(repeats).toEqual([]);
  });

  it('every one of the 14 templates is served within any 14 consecutive days', () => {
    const titles = new Set();
    for (let i = 0; i < 14; i++) titles.add(configAt(noonOn(2026, 10, 1 + i)).title);
    expect(titles.size).toBe(14);
  });

  it('the template is the same all day, from 00:00 to 23:59 local', () => {
    const early = configAt(new Date(2026, 9, 4, 0, 0, 1)).title; // DST starts 4 Oct 2026
    const late  = configAt(new Date(2026, 9, 4, 23, 59, 0)).title;
    expect(early).toBe(late);
  });
});
