// The hint balance, read one way everywhere (SF-66b B1): Game, the Daily, Home and the
// hint ledger's credit path. A missing, non-numeric, non-finite or negative stored value
// counts as the starting 12, the same value loadProgress seeds. Readers only: nothing
// here writes, and Settings Reset still keeps a stored value exactly as stored (S6).
export const STARTING_HINTS = 12;

export function hintBalance(progress) {
  const v = progress?.hints_remaining;
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : STARTING_HINTS;
}
