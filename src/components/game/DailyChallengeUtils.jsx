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

export function getDailyChallengeConfig() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
  // Deterministic index from date
  const dayIndex = Math.abs(
    today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  ) % CHALLENGE_TEMPLATES.length;
  const template = CHALLENGE_TEMPLATES[dayIndex];
  return { ...template, date: dateStr };
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