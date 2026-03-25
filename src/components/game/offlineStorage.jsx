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

export function saveLocalProgress(data) {
  try {
    const existing = getLocalProgress() || {};
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...existing, ...data }));
  } catch (err) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      // Storage full — clear old daily records to free space, then retry
      console.warn('SoundFind: localStorage full, clearing old daily records');
      try {
        localStorage.removeItem(DAILY_KEY);
        const existing = getLocalProgress() || {};
        localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...existing, ...data }));
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
    id: 'local', current_level: 1, total_score: 0, hints_remaining: 3,
    games_played: 0, words_found: 0, best_streak: 0,
  };
  saveLocalProgress(seed);
  return seed;
}

export async function updateProgress(_ignored, progress, data) {
  const merged = { ...(progress || {}), ...data };
  saveLocalProgress(merged);
  return merged;
}

// ─── UserSettings ─────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  id: 'local',
  default_difficulty: 1,
  preferred_category: 'random',
  audio_voice: 'female',
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