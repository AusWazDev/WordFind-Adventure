// The guided first game (S43, SF-64): its one storage key and its routes. Imports
// nothing, so the Tutorial page can use it without reaching any storage, ad or hint
// module (tutorialIsolation.test.js scans for that).
export const TUTORIAL_KEY = 'wf_tutorial_done';
export const TUTORIAL_FIRST = '/Tutorial?mode=first';
export const TUTORIAL_REPLAY = '/Tutorial?mode=replay';

export function hasDoneTutorial() {
  try { return localStorage.getItem(TUTORIAL_KEY) === 'true'; } catch { return false; }
}

// Set on finish or skip only, never on start.
export function markTutorialDone() {
  try { localStorage.setItem(TUTORIAL_KEY, 'true'); } catch { /* storage unavailable */ }
}
