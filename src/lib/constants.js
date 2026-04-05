// Shared game constants — single source of truth for labels used across multiple components.

export const LEVEL_NAMES = ['Easy', 'Medium', 'Hard', 'Expert', 'Master'];

export const CATEGORIES = [
  { value: 'random',            label: 'Random Mix' },
  { value: 'animals',           label: 'Animals' },
  { value: 'food',              label: 'Food' },
  { value: 'nature',            label: 'Nature' },
  { value: 'colors',            label: 'Colors' },
  { value: 'sports',            label: 'Sports' },
  { value: 'space',             label: 'Space' },
  { value: 'music',             label: 'Music' },
  { value: 'countries',         label: 'Countries' },
  { value: 'science',           label: 'Science' },
  { value: 'mythology',         label: 'Mythology' },
  { value: 'technology',        label: 'Technology' },
  { value: 'ocean',             label: 'Ocean' },
  { value: 'history',           label: 'History' },
  { value: 'emotions',          label: 'Emotions' },
  { value: 'tricky_mix',        label: 'Tricky Mix' },
  { value: 'tricky_silent',     label: 'Silent Letters' },
  { value: 'tricky_homophones', label: 'Homophones' },
  { value: 'tricky_ough',       label: '-OUGH Words' },
  { value: 'tricky_double',     label: 'Double Letters' },
  { value: 'tricky_misspelled', label: 'Misspelled' },
  { value: 'tricky_ise_ize',    label: '-ISE / -IZE' },
  { value: 'tricky_our_or',     label: '-OUR / -OR' },
];

// Object map for O(1) label lookups — derived from CATEGORIES so it never drifts.
export const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));
