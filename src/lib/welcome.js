// The first-launch welcome (S42, SF-63): who sees it, and a small store so that Home
// (which shows it) and Layout (which must not mount the blurred nav while it shows)
// agree, and both update the moment it closes.
import { useSyncExternalStore } from 'react';
import { getLocalProgress } from '@/components/game/offlineStorage';

const WELCOME_KEY = 'wf_welcome_seen';
const listeners = new Set();
const notify = () => listeners.forEach(l => l());

export function hasSeenWelcome() {
  try { return localStorage.getItem(WELCOME_KEY) === 'true'; } catch { return false; }
}

// A player who has finished a game. Settings Reset rewrites wf_progress without
// games_played, so a reset player counts as new again.
export function hasPlayed() {
  return Number(getLocalProgress()?.games_played ?? 0) > 0;
}

export const isWelcomeDue = () => !hasSeenWelcome() && !hasPlayed();

export function markWelcomeSeen() {
  try { localStorage.setItem(WELCOME_KEY, 'true'); } catch { /* storage unavailable */ }
  notify();
}

// A player with games played never sees the welcome; record that quietly.
export function settleWelcomeForPlayers() {
  if (!hasSeenWelcome() && hasPlayed()) markWelcomeSeen();
}

const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
export const useWelcomeDue = () => useSyncExternalStore(subscribe, isWelcomeDue, isWelcomeDue);
