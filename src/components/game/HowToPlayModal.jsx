import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Search, Shuffle, Brain, Eye, ChevronRight, ChevronLeft, Hand, Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Slide content ────────────────────────────────────────────────────────────

const slides = [
  // Slide 1: Finding words
  {
    id: 'basics',
    title: 'Finding Words',
    subtitle: 'The core mechanic',
    icon: Hand,
    content: (
      <div className="space-y-5">
        {/* Mini grid demo */}
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-3 flex justify-center">
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {[
              ['W','O','R','D','S'],
              ['A','K','N','I','G'],
              ['L','H','T','N','H'],
              ['K','G','N','O','T'],
              ['S','W','O','R','D'],
            ].map((row, r) =>
              row.map((letter, c) => (
                <div
                  key={`${r}-${c}`}
                  className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold',
                    r === 0
                      ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
                      : r === 4
                      ? 'bg-gradient-to-br from-teal-400 to-teal-500 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  )}
                >
                  {letter}
                </div>
              ))
            )}
          </div>
        </div>

        <ol className="space-y-3">
          {[
            'Press and hold on the first letter',
            'Drag in any direction through the word',
            'Release — it turns green when correct',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-sm font-bold text-violet-500 dark:text-violet-400 shrink-0">{i + 1}.</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{step}</span>
            </li>
          ))}
        </ol>

        <p className="text-sm text-slate-400 dark:text-slate-500">
          Words can go horizontally, vertically, or diagonally — forwards or backwards.
        </p>
      </div>
    ),
  },

  // Slide 2: Audio Challenge
  {
    id: 'audio',
    title: 'Audio Challenge',
    subtitle: 'The signature mode',
    icon: Volume2,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Words are hidden. Tap the speaker to hear each word spoken in a sentence, then find its spelling in the grid.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Perfect for tricky English words — the ones that <em>sound</em> nothing like they're spelled.
        </p>
        <div className="space-y-2.5">
          {[
            ['Silent letters', 'KNIGHT, YACHT, DEBT'],
            ['Homophones', 'FLOUR / FLOWER'],
            ['-OUGH words', 'TOUGH, THROUGH, THOUGH'],
          ].map(([label, example]) => (
            <div key={label} className="flex items-baseline gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-2" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
              <span className="text-sm text-slate-400 dark:text-slate-500">— {example}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // Slide 3: Game modes overview
  {
    id: 'modes',
    title: 'Game Modes',
    subtitle: 'Five ways to play',
    icon: Sparkles,
    content: (
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {[
          { icon: Volume2,  name: 'Audio Challenge',   desc: 'Hear the word, find the spelling.' },
          { icon: Eye,      name: 'Mystery Word',       desc: 'Leftover letters spell a hidden bonus word.' },
          { icon: Search,   name: 'Standard',           desc: 'Classic word search — word list visible.' },
          { icon: Brain,    name: 'Word Association',   desc: 'A clue shown instead of the word — find the match.' },
          { icon: Shuffle,  name: 'Anagram Hunt',       desc: 'Words are scrambled — unscramble then find.' },
        ].map(({ icon: Icon, name, desc }) => (
          <div key={name} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30 shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },

  // Slide 4: Hints
  {
    id: 'hints',
    title: 'Hints',
    subtitle: 'Getting help',
    icon: Lightbulb,
    content: (
      <div className="space-y-5">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          You start with <span className="font-semibold text-slate-800 dark:text-slate-100">12 free hints</span>. Use them wisely!
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Lightbulb</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Flashes the first letter on the grid.{' '}
                <span className="text-amber-600 dark:text-amber-400 font-medium">−25% score</span> for that word.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30 shrink-0">
              <Eye className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Eye <span className="font-normal text-slate-400 dark:text-slate-500">(Audio Challenge only)</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Reveals the word text.{' '}
                <span className="text-amber-600 dark:text-amber-400 font-medium">−50% score</span> for that word.
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-400 dark:text-slate-500">
          Run out? Watch a short ad to earn one, or buy a hint pack.
        </p>
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
          style={{
            paddingTop: 'max(1rem, env(safe-area-inset-top))',
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal — responsive width, flex column so content only scrolls when truly needed */}
          <motion.div
            className="relative w-full max-w-sm sm:max-w-md md:max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[85dvh]"
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header — fixed, never scrolls */}
            <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-violet-500 to-indigo-600">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/75 text-xs font-medium">{slide.subtitle}</p>
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

            {/* Content — stable scroll wrapper outside animation so scrollbar never flashes on transition */}
            <div className="min-h-0 overflow-y-auto no-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  className="px-5 py-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {slide.content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation — fixed, never scrolls */}
            <div className="shrink-0 px-5 pb-5 pt-2 flex items-center gap-3">
              {!isFirst && (
                <motion.button
                  onClick={() => setCurrentSlide(i => i - 1)}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </motion.button>
              )}
              <motion.button
                onClick={isLast ? handleClose : () => setCurrentSlide(i => i + 1)}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:shadow-md hover:shadow-violet-200 dark:hover:shadow-violet-900 transition-all"
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
