import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Trophy, Target, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const levelNames = ['Easy', 'Medium', 'Hard', 'Expert', 'Master'];

const modeLabels = {
  standard: 'Standard',
  audio: 'Audio Challenge',
  anagram: 'Anagram Hunt',
  spelling: 'Spelling Bee',
  association: 'Word Association',
  mystery_word: 'Mystery Word',
};

const categoryLabels = {
  random: 'Random Mix', animals: 'Animals', food: 'Food', nature: 'Nature',
  colors: 'Colors', sports: 'Sports', space: 'Space', music: 'Music',
  countries: 'Countries', science: 'Science', mythology: 'Mythology',
  technology: 'Technology', ocean: 'Ocean', history: 'History', emotions: 'Emotions',
  tricky_mix: 'Tricky Mix', tricky_silent: 'Silent Letters',
  tricky_homophones: 'Homophones', tricky_ough: '-OUGH Words',
  tricky_double: 'Double Letters', tricky_misspelled: 'Misspelled',
  tricky_ise_ize: '-ISE / -IZE', tricky_our_or: '-OUR / -OR',
};

export default function GameHeader({
  score,
  hintsRemaining,
  wordsFound,
  totalWords,
  level,
  gameMode,
  category,
  onBack,
  onUseHint,
  isAudioMode,
  audioEnabled,
  onToggleAudio,
  compact = false,   // true in landscape — single row, no progress bar
}) {
  const progress = (wordsFound / totalWords) * 100;
  const levelLabel    = levelNames[level - 1] ?? `Level ${level}`;
  const modeLabel     = modeLabels[gameMode]  ?? 'Standard';
  const categoryLabel = category ? (categoryLabels[category] ?? category) : null;
  // Subtitle: show mode (if not standard) and/or category
  const subtitleParts = [];
  if (gameMode && gameMode !== 'standard') subtitleParts.push(modeLabel);
  if (categoryLabel) subtitleParts.push(categoryLabel);
  const subtitle = subtitleParts.join(' · ');

  if (compact) {
    // ── Compact landscape header — everything on one row ────────────────────
    return (
      <div className="bg-card rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2">
        {/* Back */}
        <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-foreground h-8 w-8 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>

        {/* Level badge */}
        <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-medium rounded-full shrink-0">
          {levelLabel}
        </span>

        {/* Category / mode subtitle pill */}
        {subtitle ? (
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full shrink-0 truncate max-w-[200px]">
            {subtitle}
          </span>
        ) : isAudioMode && (
          <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1 shrink-0">
            <Volume2 className="w-3 h-3" /> Audio
          </span>
        )}

        {/* Progress bar — fills available space */}
        <div className="flex-1 min-w-0">
          <Progress value={progress} className="h-1.5 bg-muted" />
        </div>

        {/* Word count */}
        <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-lg shrink-0">
          <Target className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-bold text-foreground">{wordsFound}/{totalWords}</span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-1 bg-gradient-to-r from-amber-50 to-orange-50 px-2 py-1 rounded-lg shrink-0">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-bold text-amber-700">{score}</span>
        </div>

        {/* Hint button */}
        <motion.button
          onClick={onUseHint}
          className="flex items-center gap-1 bg-gradient-to-r from-violet-50 to-indigo-50 px-2 py-1 rounded-lg hover:from-violet-100 hover:to-indigo-100 transition-all shrink-0"
          whileTap={{ scale: 0.95 }}
        >
          <Lightbulb className="w-3.5 h-3.5 text-violet-600" />
          <span className="text-xs font-bold text-violet-700">{hintsRemaining}</span>
        </motion.button>

        {/* Audio toggle */}
        {isAudioMode && (
          <Button variant="ghost" size="icon" onClick={onToggleAudio} className="text-muted-foreground hover:text-foreground h-8 w-8 shrink-0">
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        )}
      </div>
    );
  }

  // ── Full portrait header ───────────────────────────────────────────────────
  return (
    <div className="bg-card rounded-2xl shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold rounded-full">
              {levelLabel}
            </span>
            {isAudioMode && !subtitle && (
              <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> Audio
              </span>
            )}
          </div>
          {subtitle && (
            <span className="px-3 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full mt-0.5">
              {subtitle}
            </span>
          )}
        </div>

        {isAudioMode && (
          <Button variant="ghost" size="icon" onClick={onToggleAudio} className="text-muted-foreground hover:text-foreground">
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <motion.div
          className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <Trophy className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-amber-700">{score}</span>
        </motion.div>

        <motion.button
          onClick={onUseHint}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2 rounded-xl hover:from-violet-100 hover:to-indigo-100 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Lightbulb className="w-5 h-5 text-violet-600" />
          <span className="font-bold text-violet-700">{hintsRemaining}</span>
        </motion.button>

        <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-xl">
          <Target className="w-5 h-5 text-muted-foreground" />
          <span className="font-bold text-foreground">{wordsFound}/{totalWords}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2 bg-muted" />
        <p className="text-xs text-muted-foreground text-center">
          {totalWords - wordsFound} words remaining
        </p>
      </div>
    </div>
  );
}
