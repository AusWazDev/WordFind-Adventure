// @vitest-environment jsdom
// Daily free refill for Windows and web (CR-64, brief SF-3).
import { describe, it, expect, beforeEach } from 'vitest';
import {
  FREE_REFILL_KEY, FREE_REFILL_HINTS, FREE_REFILL_INTERVAL_MS,
  canClaimFreeRefill, claimFreeRefill, msUntilFreeRefill, formatRefillWait,
} from './freeHintRefill';

const T0 = Date.UTC(2026, 8, 30, 2, 0, 0);
const H = 60 * 60 * 1000;

beforeEach(() => localStorage.clear());

describe('free hint refill: 3 hints once every 24 hours', () => {
  it('uses a new key, and is 3 hints per 24 hours', () => {
    expect(FREE_REFILL_KEY).toBe('sf_free_hint_refill_at');
    expect(FREE_REFILL_HINTS).toBe(3);
    expect(FREE_REFILL_INTERVAL_MS).toBe(24 * H);
  });

  it('a first claim grants 3 hints and records the time', () => {
    expect(canClaimFreeRefill(T0)).toBe(true);
    expect(claimFreeRefill(T0)).toBe(3);
    expect(localStorage.getItem(FREE_REFILL_KEY)).toBe(String(T0));
  });

  it('a second claim inside 24 hours grants nothing', () => {
    claimFreeRefill(T0);
    expect(claimFreeRefill(T0 + 1)).toBe(0);
    expect(claimFreeRefill(T0 + 24 * H - 1)).toBe(0);
    expect(msUntilFreeRefill(T0 + 23 * H)).toBe(H);
  });

  it('exactly 24 hours later it can be claimed again', () => {
    claimFreeRefill(T0);
    expect(claimFreeRefill(T0 + 24 * H)).toBe(3);
  });

  it('writes no other localStorage key', () => {
    localStorage.setItem('wf_progress', '{"hints_remaining":0}');
    claimFreeRefill(T0);
    expect(Object.keys(localStorage).sort()).toEqual([FREE_REFILL_KEY, 'wf_progress']);
    expect(localStorage.getItem('wf_progress')).toBe('{"hints_remaining":0}');
  });

  it('a stored time in the future (clock moved back) does not lock the player out', () => {
    localStorage.setItem(FREE_REFILL_KEY, String(T0 + 10 * H));
    expect(canClaimFreeRefill(T0)).toBe(true);
  });

  it('an unreadable stored value does not lock the player out', () => {
    localStorage.setItem(FREE_REFILL_KEY, 'garbage');
    expect(canClaimFreeRefill(T0)).toBe(true);
  });

  it('formats the wait', () => {
    expect(formatRefillWait(H)).toBe('1h');
    expect(formatRefillWait(90 * 60000)).toBe('1h 30m');
    expect(formatRefillWait(59 * 1000)).toBe('1m');
  });
});
