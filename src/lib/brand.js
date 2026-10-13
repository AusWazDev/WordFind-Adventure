// Shared brand styles (G4, SF-66b). Home in the Default setting is the reference: these
// are Home's own classes, lifted out so the welcome, the tutorial and its finish screen
// use them instead of their own. Class strings only; nothing here imports anything.

// Home's page background, light and dark (Home.jsx).
export const HOME_BACKGROUND = 'bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950';

// Home's heading text colour (its wordmark and headings).
export const HEADING_TEXT = 'text-slate-800 dark:text-slate-100';

// Home's secondary text colour (the level and category pickers' smaller text).
export const SECONDARY_TEXT = 'text-slate-600 dark:text-slate-400';

// Home's How to Play pill: its secondary button style.
export const PILL_BUTTON = 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-sm hover:shadow-md transition-all';

// The one primary button: the welcome's "Show me how" and the finish screen's button.
export const PRIMARY_BUTTON = 'w-full flex items-center justify-center py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-violet-600 to-indigo-600';
