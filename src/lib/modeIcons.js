// The icon each game mode shows in the mode picker (GameModeSelector), by mode id. One
// source, so the tutorial's finish screen lists each mode with the picker's icon (G3,
// SF-66b). Icons only: the tutorial imports this, so it must stay free of app modules.
import { Search, Volume2, Shuffle, Brain, Eye } from 'lucide-react';

export const MODE_ICONS = {
  audio: Volume2,
  standard: Search,
  anagram: Shuffle,
  association: Brain,
  mystery_word: Eye,
};
