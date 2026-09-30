// Free hint refill for builds with no ads and no purchases: the Windows
// (Electron) and web builds, i.e. !isNative() (CR-64, brief SF-3).
// Replaces the simulated "Watch an Ad", whose Skip still granted a hint, so it
// handed out unlimited free hints. Now: 3 free hints, once every 24 hours.
//
// Stored under a NEW key; no existing localStorage key is touched.

export const FREE_REFILL_KEY = 'sf_free_hint_refill_at';
export const FREE_REFILL_HINTS = 3;
export const FREE_REFILL_INTERVAL_MS = 24 * 60 * 60 * 1000;

function lastClaimedAt() {
  try {
    const raw = localStorage.getItem(FREE_REFILL_KEY);
    if (raw === null) return null;
    const t = Number(raw);
    return Number.isFinite(t) ? t : null;
  } catch {
    return null;
  }
}

// Milliseconds until the next refill can be claimed; 0 means available now.
// A stored time in the future (the device clock was moved back) is treated as
// invalid rather than locking the player out.
export function msUntilFreeRefill(now = Date.now()) {
  const last = lastClaimedAt();
  if (last === null || last > now) return 0;
  return Math.max(0, last + FREE_REFILL_INTERVAL_MS - now);
}

export function canClaimFreeRefill(now = Date.now()) {
  return msUntilFreeRefill(now) === 0;
}

// Records the claim and returns the number of hints granted (0 if not yet due).
export function claimFreeRefill(now = Date.now()) {
  if (!canClaimFreeRefill(now)) return 0;
  try {
    localStorage.setItem(FREE_REFILL_KEY, String(now));
  } catch {
    return 0;
  }
  return FREE_REFILL_HINTS;
}

export function formatRefillWait(ms) {
  const totalMinutes = Math.ceil(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
