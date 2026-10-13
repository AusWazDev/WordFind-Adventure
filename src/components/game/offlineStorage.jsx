/**
 * Local-only storage helpers for GameProgress and UserSettings.
 * All data is stored in localStorage — no external backend required.
 */

const PROGRESS_KEY = 'wf_progress';
const SETTINGS_KEY = 'wf_settings';

// ─── GameProgress ────────────────────────────────────────────────────────────

export function getLocalProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// The hint ledger's two fields (S40-C, SF-50) never move backwards, whoever writes:
// screens write their whole progress object, which may predate a reconcile credit.
// credited_txn_ids only grows (union); reconcile_since, once set, is kept.
function mergeProgress(existing, data) {
  const merged = { ...existing, ...data };
  if (Array.isArray(existing.credited_txn_ids) || Array.isArray(data.credited_txn_ids)) {
    merged.credited_txn_ids = [...new Set([...(existing.credited_txn_ids || []), ...(data.credited_txn_ids || [])])];
  }
  if (existing.reconcile_since) merged.reconcile_since = existing.reconcile_since;
  return merged;
}

export function saveLocalProgress(data) {
  try {
    const existing = getLocalProgress() || {};
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(mergeProgress(existing, data)));
  } catch (err) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      // Storage full — clear old daily records to free space, then retry
      console.warn('SoundFind: localStorage full, clearing old daily records');
      try {
        localStorage.removeItem(DAILY_KEY);
        const existing = getLocalProgress() || {};
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(mergeProgress(existing, data)));
      } catch {
        console.error('SoundFind: could not save progress — device storage is full');
      }
    }
  }
}

export async function loadProgress() {
  const local = getLocalProgress();
  if (local) return local;
  const seed = {
    id: 'local', current_level: 1, total_score: 0, hints_remaining: 12,
    games_played: 0, words_found: 0, best_streak: 0,
  };
  saveLocalProgress(seed);
  return seed;
}

// The hint balance as game logic reads it: a stored number, or the starting 12 when the
// field is missing or not a number (the same default the screens load with).
export const hintCount = progress => (typeof progress?.hints_remaining === 'number' ? progress.hints_remaining : 12);

// SF-66b (A4): every progress write reads the STORED progress at the moment it writes
// and changes only the fields that write owns. `change` is an object of those fields, or
// a function of the stored progress returning them. Screens used to save the whole
// object they loaded when they opened, which put back a stale balance (SF-66c: a
// rewarded hint lost, a spent hint refunded). Returns the progress as now stored.
export function changeProgress(change) {
  const stored = getLocalProgress() || {};
  const fields = typeof change === 'function' ? change(stored) : change;
  saveLocalProgress(fields);
  return getLocalProgress() || { ...stored, ...fields };
}

// Kept for its callers' signature. The `progress` argument is IGNORED since SF-66b:
// only `data`'s fields are written, on top of what is stored.
export async function updateProgress(_ignored, _progress, data) {
  return changeProgress(data);
}

// ─── UserSettings ─────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  id: 'local',
  audio_voice: 'female',
  // SF-60: audio_rate and audio_pitch are no longer read (the Backup Voice has a
  // fixed rate and pitch). They stay so existing saved settings are untouched.
  audio_rate: 0.9,
  audio_pitch: 1,
  sound_effects_volume: 0.8,
  theme: 'default',
};

export function getLocalSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveLocalSettings(data) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  } catch (err) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      console.warn('SoundFind: localStorage full, could not save settings');
    }
  }
}

export async function loadSettings() {
  return getLocalSettings();
}

// ─── DailyChallengeProgress ───────────────────────────────────────────────────

const DAILY_KEY = 'wf_daily';

function getDailyStore() {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDailyStore(store) {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(store));
  } catch (err) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      console.warn('SoundFind: localStorage full, could not save daily record');
    }
  }
}

export function getDailyRecord(date) {
  return getDailyStore()[date] || null;
}

export function saveDailyRecord(date, data) {
  const store = getDailyStore();
  store[date] = { ...(store[date] || {}), ...data };
  saveDailyStore(store);
  return store[date];
}

export function getAllDailyRecords() {
  return Object.values(getDailyStore());
}