// Deterministically generates a daily challenge config from today's date
const CHALLENGE_TEMPLATES = [
  { title: "Beast Mode", description: "Hunt animals before time runs out!", category: "animals", mode: "standard", level: 3, time_limit: 120, bonus_multiplier: 3, reward_hints: 2 },
  { title: "Galaxy Brain", description: "Navigate the cosmos with anagrams!", category: "space", mode: "anagram", level: 2, time_limit: 150, bonus_multiplier: 2.5, reward_hints: 2 },
  { title: "Tech Hunt", description: "Find technology words — expert level challenge!", category: "technology", mode: "standard", level: 3, time_limit: 180, bonus_multiplier: 3, reward_hints: 3 },
  { title: "Myth Busted", description: "Uncover mythological legends by clue!", category: "mythology", mode: "association", level: 2, time_limit: 120, bonus_multiplier: 2.5, reward_hints: 2 },
  { title: "Ocean Deep", description: "Dive into ocean words on expert difficulty!", category: "ocean", mode: "standard", level: 4, time_limit: 0, bonus_multiplier: 2, reward_hints: 3 },
  { title: "Scramble Scientist", description: "Unscramble scientific terms!", category: "science", mode: "anagram", level: 3, time_limit: 150, bonus_multiplier: 3, reward_hints: 2 },
  { title: "Emotional Journey", description: "Find emotions against the clock!", category: "emotions", mode: "standard", level: 2, time_limit: 90, bonus_multiplier: 2, reward_hints: 1 },
  { title: "History Lesson", description: "Discover history through clues!", category: "history", mode: "association", level: 3, time_limit: 0, bonus_multiplier: 2.5, reward_hints: 2 },
  { title: "Sound Check", description: "Audio challenge — listen and find!", category: "music", mode: "audio", level: 2, time_limit: 180, bonus_multiplier: 2.5, reward_hints: 2 },
  { title: "World Tour", description: "Find countries in record time!", category: "countries", mode: "standard", level: 3, time_limit: 120, bonus_multiplier: 2, reward_hints: 2 },
  { title: "Nature Sprint", description: "Sprint through nature words!", category: "nature", mode: "standard", level: 2, time_limit: 90, bonus_multiplier: 2, reward_hints: 1 },
  { title: "Food for Thought", description: "Find delicious foods using clues!", category: "food", mode: "association", level: 2, time_limit: 150, bonus_multiplier: 2.5, reward_hints: 2 },
  { title: "Grandmaster", description: "Maximum difficulty — no time limit, all categories!", category: "random", mode: "standard", level: 4, time_limit: 0, bonus_multiplier: 4, reward_hints: 3 },
  { title: "Color Coded", description: "Find colors at lightning speed!", category: "colors", mode: "standard", level: 2, time_limit: 60, bonus_multiplier: 3, reward_hints: 2 },
];

const pad2 = n => String(n).padStart(2, '0');

// The player's LOCAL calendar date as YYYY-MM-DD (CR-61). Used for the wf_daily
// record key, the streak lookup and the template index. toISOString() was UTC,
// so in Australia every morning before 10:00 (11:00 in summer) fell on
// yesterday's key. Records written before CR-61 keep their UTC keys.
export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function previousLocalDateKey(date = new Date()) {
  return localDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1));
}

// Whole local calendar days since 1 Jan 1970. Built from the local Y/M/D through
// Date.UTC, so daylight-saving changes cannot shift it. Consecutive days always
// differ by exactly 1, so consecutive days never share a template. The old
// YYYYMMDD % 14 jumped by 70 (a multiple of 14) from the 31st to the 1st, which
// repeated the template six times a year.
function localDayNumber(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

export function getDailyChallengeConfig(now = new Date()) {
  const dayIndex = localDayNumber(now) % CHALLENGE_TEMPLATES.length;
  const template = CHALLENGE_TEMPLATES[dayIndex];
  return { ...template, date: localDateKey(now) };
}

export function formatTimeLimit(seconds) {
  if (!seconds) return 'No time limit';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s > 0 ? s + 's' : ''}`.trim() : `${s}s`;
}

export function formatCountdown(secondsLeft) {
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}