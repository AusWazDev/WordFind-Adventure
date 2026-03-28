import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Sparkles, BookOpen, Link, AlignJustify, Type, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Tricky word categories ───────────────────────────────────────────────────
// Each maps to a category ID passed to the game.
// 'tricky_mix' signals gameUtils to pull from all tricky groups equally.

const trickyCategories = [
  {
    id: 'tricky_mix',
    name: 'Tricky Mix',
    description: 'A blend of all tricky word types — the ultimate challenge',
    tagline: 'Recommended',
    icon: Sparkles,
    gradient: 'from-amber-400 to-orange-500',
    bgGradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-300',
    featured: true,
  },
  {
    id: 'tricky_silent',
    name: 'Silent Letters',
    description: 'KNIGHT, YACHT, LAMB, DEBT — letters that hide in plain sight',
    tagline: 'Popular',
    icon: Volume2,
    gradient: 'from-violet-500 to-indigo-600',
    bgGradient: 'from-violet-50 to-indigo-50',
    borderColor: 'border-violet-200',
  },
  {
    id: 'tricky_homophones',
    name: 'Homophones',
    description: 'FLOUR / FLOWER, KNIGHT / NIGHT — same sound, different spelling',
    icon: Link,
    gradient: 'from-pink-500 to-rose-600',
    bgGradient: 'from-pink-50 to-rose-50',
    borderColor: 'border-pink-200',
  },
  {
    id: 'tricky_ough',
    name: '-OUGH Words',
    description: 'TOUGH, THROUGH, THOUGH, COUGH — seven different sounds, one spelling',
    icon: AlignJustify,
    gradient: 'from-teal-500 to-cyan-600',
    bgGradient: 'from-teal-50 to-cyan-50',
    borderColor: 'border-teal-200',
  },
  {
    id: 'tricky_double',
    name: 'Double Letters',
    description: 'OCCASION, NECESSARY, EMBARRASS — spot the hidden doubles',
    icon: Type,
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'tricky_misspelled',
    name: 'Commonly Misspelled',
    description: 'DEFINITELY, WEDNESDAY, RHYTHM — words that trip everyone up',
    icon: BookOpen,
    gradient: 'from-emerald-500 to-green-600',
    bgGradient: 'from-emerald-50 to-green-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'tricky_ise_ize',
    name: '-ISE or -IZE?',
    description: 'REALISE / REALIZE, ORGANISE / ORGANIZE — UK vs US spelling',
    icon: PenLine,
    gradient: 'from-fuchsia-500 to-purple-600',
    bgGradient: 'from-fuchsia-50 to-purple-50',
    borderColor: 'border-fuchsia-200',
  },
  {
    id: 'tricky_our_or',
    name: '-OUR or -OR?',
    description: 'COLOUR / COLOR, HONOUR / HONOR — British vs American English',
    icon: BookOpen,
    gradient: 'from-orange-500 to-red-600',
    bgGradient: 'from-orange-50 to-red-50',
    borderColor: 'border-orange-200',
  },
];

export default function AudioCategorySelector({ onSelectCategory }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold mb-1">
          <Volume2 className="w-3 h-3" />
          Audio Challenge
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Choose Your Challenge
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Listen carefully — find the word by its spelling, not just its sound
        </p>
      </div>

      {/* Featured card — Tricky Mix */}
      {trickyCategories.filter(c => c.featured).map((cat) => {
        const Icon = cat.icon;
        return (
          <motion.button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            onHoverStart={() => setHoveredId(cat.id)}
            onHoverEnd={() => setHoveredId(null)}
            className={cn(
              'w-full p-4 rounded-2xl border-2 text-left transition-all',
              `bg-gradient-to-br ${cat.bgGradient}`,
              cat.borderColor,
              'hover:shadow-lg'
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-3 rounded-xl bg-gradient-to-br shadow-md shrink-0',
                cat.gradient
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-slate-800">{cat.name}</h4>
                  {cat.tagline && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold rounded-full">
                      {cat.tagline}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{cat.description}</p>
              </div>
            </div>
          </motion.button>
        );
      })}

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400 font-medium">or focus on one type</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* Grid of specific categories */}
      <div className="grid grid-cols-2 gap-2">
        {trickyCategories.filter(c => !c.featured).map((cat, index) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                'p-3 rounded-2xl border-2 text-left transition-all',
                `bg-gradient-to-br ${cat.bgGradient}`,
                'border-transparent hover:shadow-md',
                hoveredId === cat.id && cat.borderColor
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.06 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onHoverStart={() => setHoveredId(cat.id)}
              onHoverEnd={() => setHoveredId(null)}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={cn(
                  'w-8 h-8 rounded-lg bg-gradient-to-br shadow-sm flex items-center justify-center shrink-0',
                  cat.gradient
                )}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm leading-tight">
                  {cat.name}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                {cat.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
