import React from 'react';
import { motion } from 'framer-motion';
import { Search, Volume2, ChevronRight, Shuffle, Brain, Mic, WifiOff, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const REQUIRES_ONLINE  = new Set(['association']);
const DEGRADED_OFFLINE = new Set(['audio']);

// Non-audio modes shown below the hero card
const OTHER_MODES = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Classic word search with visible word list',
    icon: Search,
    gradient: 'from-violet-500 to-indigo-600',
    bgGradient: 'from-violet-50 to-indigo-50',
  },
  {
    id: 'anagram',
    name: 'Anagram Hunt',
    description: 'Words shown scrambled — unscramble then find them',
    icon: Shuffle,
    gradient: 'from-pink-500 to-rose-600',
    bgGradient: 'from-pink-50 to-rose-50',
    badge: 'New!',
  },
  {
    id: 'spelling',
    name: 'Spelling Bee',
    description: 'Spell each word correctly to reveal it',
    icon: Mic,
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    badge: 'New!',
  },
  {
    id: 'association',
    name: 'Word Association',
    description: 'Find words by their clue, not the word itself',
    offlineDescription: 'Requires internet for AI-generated clues',
    icon: Brain,
    gradient: 'from-cyan-500 to-blue-600',
    bgGradient: 'from-cyan-50 to-blue-50',
    badge: 'New!',
  },
];

export default function GameModeSelector({ onSelectMode }) {
  const isOnline = useOnlineStatus();
  const audioOffline = !isOnline;

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 text-center">
        Choose Game Mode
      </h3>

      {/* Offline banner */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You're offline. Some modes are unavailable or limited.</span>
        </motion.div>
      )}

      {/* ── Audio Challenge hero card ─────────────────────────────────────── */}
      <motion.button
        onClick={() => onSelectMode('audio')}
        className={cn(
          'w-full rounded-2xl text-left overflow-hidden relative',
          'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
          'shadow-lg shadow-orange-200 dark:shadow-orange-900',
          'hover:shadow-xl hover:shadow-orange-300 transition-all',
          'border-2 border-amber-300'
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/10 translate-y-6 -translate-x-6 pointer-events-none" />

        <div className="relative p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
                <Volume2 className="w-6 h-6 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-white text-base">Audio Challenge</h4>
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-white/25 text-white text-[10px] font-bold rounded-full">
                    <Sparkles className="w-2.5 h-2.5" /> Featured
                  </span>
                  {audioOffline && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-black/20 text-white/80 text-[10px] font-medium rounded-full">
                      <WifiOff className="w-2.5 h-2.5" /> Limited offline
                    </span>
                  )}
                </div>
                <p className="text-white/90 text-xs mt-1 leading-snug">
                  {audioOffline
                    ? 'Words spoken only — example sentences need internet'
                    : 'Hear the word, find its spelling. Great for tricky words like KNIGHT, YACHT and RECEIPT'}
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-white/70 shrink-0 mt-1" />
          </div>

          {/* Word type pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {['Silent Letters', 'Homophones', '-OUGH Words', 'Double Letters', 'Misspelled'].map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-medium rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.button>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400 font-medium">other modes</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* ── Other modes ───────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {OTHER_MODES.map((mode, index) => {
          const Icon = mode.icon;
          const isDisabled = !isOnline && REQUIRES_ONLINE.has(mode.id);
          const description = (!isOnline && mode.offlineDescription) ? mode.offlineDescription : mode.description;

          return (
            <motion.button
              key={mode.id}
              onClick={() => !isDisabled && onSelectMode(mode.id)}
              disabled={isDisabled}
              className={cn(
                'w-full p-3.5 rounded-2xl border-2 transition-all text-left',
                isDisabled
                  ? 'border-transparent bg-muted opacity-50 cursor-not-allowed'
                  : `bg-gradient-to-br ${mode.bgGradient} border-transparent hover:shadow-md hover:border-violet-200 cursor-pointer`
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.07 }}
              whileHover={isDisabled ? {} : { scale: 1.02, x: 4 }}
              whileTap={isDisabled ? {} : { scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-xl bg-gradient-to-br shadow-sm shrink-0',
                  isDisabled ? 'bg-muted shadow-none' : mode.gradient
                )}>
                  {isDisabled
                    ? <WifiOff className="w-4 h-4 text-muted-foreground" />
                    : <Icon className="w-4 h-4 text-white" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={cn(
                      'font-bold text-sm',
                      isDisabled ? 'text-muted-foreground' : 'text-slate-800'
                    )}>
                      {mode.name}
                    </h4>
                    {mode.badge && !isDisabled && (
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-violet-400 to-indigo-500 text-white text-[10px] font-medium rounded-full">
                        {mode.badge}
                      </span>
                    )}
                    {isDisabled && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded-full">
                        <WifiOff className="w-2.5 h-2.5" /> Offline
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    'text-xs mt-0.5',
                    isDisabled ? 'text-muted-foreground' : 'text-slate-600'
                  )}>
                    {description}
                  </p>
                </div>

                {!isDisabled && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
