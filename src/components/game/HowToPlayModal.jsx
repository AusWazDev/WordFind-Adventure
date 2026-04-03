import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Search, Shuffle, Brain, Eye, ChevronRight, ChevronLeft, Hand, Lightbulb, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Slide content ────────────────────────────────────────────────────────────

const slides = [
  // Slide 1: How to find words
  {
    id: 'basics',
    title: 'Finding Words',
    subtitle: 'The core mechanic',
    icon: Hand,
    iconGradient: 'from-violet-500 to-indigo-600',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Words are hidden in the letter grid — horizontally, vertically, and diagonally, both forwards and backwards.
        </p>
        {/* Visual demo grid */}
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-3 flex justify-center">
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {[
              ['W','O','R','D','S'],
              ['A','K','N','I','G'],
              ['L','H','T','N','H'],
              ['K','G','N','O','T'],
              ['S','W','O','R','D'],
            ].map((row, r) =>
              row.map((letter, c) => {
                const isHighlighted = (r === 0) || (r === 4 && c >= 0);
                const isWord = r === 0 || (r === 4);
                return (
                  <div
                    key={`${r}-${c}`}
                    className={cn(
                      'w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold',
                      r === 4
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                        : r === 0
                        ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    )}
                  >
                    {letter}
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-violet-600">1</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">Press and hold on the first letter of a word</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-violet-600">2</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">Drag in any direction to select the letters</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-violet-600">3</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">Release to submit — the word turns green if correct</p>
          </div>
        </div>
      </div>
    ),
  },

  // Slide 2: Audio Challenge — highlighted
  {
    id: 'audio',
    title: 'Audio Challenge',
    subtitle: '★ The signature mode',
    icon: Volume2,
    iconGradient: 'from-amber-400 to-orange-500',
    featured: true,
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-3 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed font-medium">
            Words are hidden from view. Tap the speaker to hear the word spoken in a sentence, then find its spelling in the grid.
          </p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Perfect for tricky English words — the ones that sound nothing like they are spelled. Did you know KNIGHT sounds identical to NIGHT? Or that THOUGH, TOUGH and THROUGH all use the same letters but sound completely different?
        </p>
        <div className="space-y-1.5">
          {[
            { label: 'Silent Letters', example: 'KNIGHT, YACHT, DEBT' },
            { label: 'Homophones', example: 'FLOUR / FLOWER' },
            { label: '-OUGH Words', example: 'TOUGH, THROUGH, THOUGH' },
            { label: 'Double Letters', example: 'OCCASION, EMBARRASS' },
            { label: 'Commonly Misspelled', example: 'DEFINITELY, RHYTHM' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
              <span className="text-xs text-slate-400">— {item.example}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          Tricky word categories work fully offline — great for long flights!
        </p>
      </div>
    ),
  },

  // Slide 3: Other modes
  {
    id: 'modes',
    title: 'Other Modes',
    subtitle: 'More ways to play',
    icon: Sparkles,
    iconGradient: 'from-violet-500 to-pink-500',
    content: (
      <div className="space-y-3">
        {[
          {
            icon: Search,
            name: 'Standard',
            gradient: 'from-violet-500 to-indigo-600',
            bg: 'from-violet-50 to-indigo-50',
            desc: 'Classic word search — words are visible, find them all in the grid.',
          },
          {
            icon: Eye,
            name: 'Mystery Word',
            gradient: 'from-indigo-500 to-violet-600',
            bg: 'from-indigo-50 to-violet-50',
            desc: 'Find every word in the grid — the unused letters spell out a hidden mystery word.',
          },
          {
            icon: Shuffle,
            name: 'Anagram Hunt',
            gradient: 'from-pink-500 to-rose-600',
            bg: 'from-pink-50 to-rose-50',
            desc: 'Words are shown scrambled. Unscramble them mentally, then find them.',
          },
          {
            icon: Brain,
            name: 'Word Association',
            gradient: 'from-cyan-500 to-blue-600',
            bg: 'from-cyan-50 to-blue-50',
            desc: 'Each word is replaced with a hand-crafted clue. Read the clue and find the matching word in the grid.',
          },
        ].map(mode => {
          const Icon = mode.icon;
          return (
            <div key={mode.name} className={cn('flex items-start gap-3 p-2.5 rounded-xl bg-gradient-to-br', mode.bg)}>
              <div className={cn('p-1.5 rounded-lg bg-gradient-to-br shrink-0', mode.gradient)}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{mode.name}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">{mode.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    ),
  },

  // Slide 4: Hints and scoring
  {
    id: 'hints',
    title: 'Hints & Scoring',
    subtitle: 'Getting help and earning points',
    icon: Lightbulb,
    iconGradient: 'from-amber-500 to-yellow-500',
    content: (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Hints</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">You start with <span className="font-semibold text-slate-700 dark:text-slate-200">12 free hints</span>. Use them wisely!</p>
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold">Lightbulb</span> (Standard, Anagram, Association, Mystery Word) — flashes the first letter of a word on the grid. Applies a <span className="font-semibold text-amber-600">−25% score penalty</span> for that word.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Eye className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold">Eye</span> (Audio Challenge only) — reveals the word text. Applies a <span className="font-semibold text-amber-600">−50% score penalty</span> for that word.
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Run out of hints? Watch a short ad to earn one free hint, or purchase a bundle.</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Scoring</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Word length', detail: 'Longer words score more' },
              { label: 'Difficulty', detail: 'Higher levels multiply your score' },
              { label: 'Audio mode', detail: '+50% bonus on every word' },
              { label: 'Tricky words', detail: '+50% bonus for hard spellings' },
            ].map(item => (
              <div key={item.label} className="bg-slate-100 dark:bg-slate-800 rounded-xl p-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2.5 border border-emerald-200 dark:border-emerald-800">
          <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-700 dark:text-emerald-300">Your progress and score are saved automatically between sessions.</p>
        </div>
      </div>
    ),
  },
];

// ─── Modal component ──────────────────────────────────────────────────────────

export default function HowToPlayModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const isLast = currentSlide === slides.length - 1;
  const isFirst = currentSlide === 0;

  const handleClose = () => {
    setCurrentSlide(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className={cn(
              'px-5 pt-5 pb-4',
              slide.featured
                ? 'bg-gradient-to-br from-teal-500 to-indigo-600'
                : 'bg-gradient-to-br from-violet-500 to-indigo-600'
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-medium">{slide.subtitle}</p>
                    <h2 className="text-white font-bold text-lg leading-tight">{slide.title}</h2>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mt-4">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={cn(
                      'rounded-full transition-all',
                      i === currentSlide
                        ? 'w-5 h-1.5 bg-white'
                        : 'w-1.5 h-1.5 bg-white/40'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="px-5 py-4 overflow-y-auto"
                style={{ maxHeight: 'min(60dvh, 500px)' }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {slide.content}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="px-5 pb-5 flex items-center gap-3">
              {!isFirst && (
                <motion.button
                  onClick={() => setCurrentSlide(i => i - 1)}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium transition-colors hover:bg-slate-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </motion.button>
              )}
              <motion.button
                onClick={isLast ? handleClose : () => setCurrentSlide(i => i + 1)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-sm font-bold transition-all',
                  slide.featured
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-md hover:shadow-orange-200'
                    : 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:shadow-md hover:shadow-violet-200'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {isLast ? "Let's Play!" : 'Next'}
                {!isLast && <ChevronRight className="w-4 h-4" />}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
