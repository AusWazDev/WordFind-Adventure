import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, WifiOff, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { isNative, isWindowsApp } from '@/lib/platform';
import { MODE_LABELS } from '@/lib/constants';
import { MODE_ICONS } from '@/lib/modeIcons';

// S25 (SF-74): Windows has no ads; only hint packs need a connection there.
export const WINDOWS_OFFLINE_BANNER = "You're offline. Every mode still works. Hint packs need a connection.";

const REQUIRES_ONLINE  = new Set(); // No modes currently require online — reserved for future use
const DEGRADED_OFFLINE = new Set(['audio']);

// Flat tiles shown below the two hero cards
const OTHER_MODES = [
  {
    id: 'standard',
    name: MODE_LABELS.standard,
    description: 'Classic word search with a visible word list',
    icon: MODE_ICONS.standard,
    gradient: 'from-violet-500 to-indigo-600',
    bgGradient: 'from-violet-50 to-indigo-50',
  },
  {
    id: 'association',
    name: MODE_LABELS.association,
    description: 'Find words using hand-crafted clues. Works fully offline',
    icon: MODE_ICONS.association,
    gradient: 'from-cyan-500 to-blue-600',
    bgGradient: 'from-cyan-50 to-blue-50',
    badge: 'New!',
  },
  {
    id: 'anagram',
    name: MODE_LABELS.anagram,
    description: 'Words shown scrambled. Unscramble then find them',
    icon: MODE_ICONS.anagram,
    gradient: 'from-pink-500 to-rose-600',
    bgGradient: 'from-pink-50 to-rose-50',
    badge: 'New!',
  },
];

export default function GameModeSelector({ onSelectMode }) {
  const isOnline = useOnlineStatus();
  const audioOffline = !isOnline;
  // Sentence clips come from the network only on the web. iOS and Android bundle
  // them, and Electron serves its bundled dist/ under app:// (CR-88).
  // isWindowsApp() is isElectronPage() (platform.js), asked through the one predicate (SF-74).
  const sentencesNeedNetwork = !isNative() && !isWindowsApp();

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 text-center">
        Choose Game Mode
      </h3>

      {/* Offline banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
          <WifiOff className="w-4 h-4 shrink-0" />
          {/* Native and Electron bundle all audio, so every mode works offline (CR-90). */}
          <span>{sentencesNeedNetwork
            ? "You're offline. Audio Challenge is limited, and all other modes work normally."
            : isWindowsApp()
              ? WINDOWS_OFFLINE_BANNER
              : "You're offline. Every mode still works. Ads and purchases need a connection."}</span>
        </div>
      )}

      {/* ── Hero 1 · Audio Challenge ──────────────────────────────────────── */}
      <motion.button
        onClick={() => onSelectMode('audio')}
        className={cn(
          'w-full rounded-2xl text-left overflow-hidden relative',
          'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
          'shadow-lg shadow-orange-200 dark:shadow-orange-900',
          'hover:shadow-xl hover:shadow-orange-300 transition-all',
          'border-2 border-amber-300'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/10 translate-y-6 -translate-x-6 pointer-events-none" />

        <div className="relative p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
                <MODE_ICONS.audio className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-white text-base">{MODE_LABELS.audio}</h4>
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-white/25 text-white text-[10px] font-bold rounded-full">
                    <Sparkles className="w-2.5 h-2.5" /> Featured
                  </span>
                  {audioOffline && sentencesNeedNetwork && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-black/20 text-white/80 text-[10px] font-medium rounded-full">
                      <WifiOff className="w-2.5 h-2.5" /> Limited offline
                    </span>
                  )}
                </div>
                <p className="text-white/90 text-xs mt-1 leading-snug">
                  {audioOffline && sentencesNeedNetwork
                    ? 'Words spoken only (example sentences need internet)'
                    : 'Hear the word, find its spelling. Great for tricky words like KNIGHT, YACHT and RECEIPT'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70 shrink-0 mt-1" />
          </div>

        </div>
      </motion.button>

      {/* ── Hero 2 · Mystery Word ─────────────────────────────────────────── */}
      <motion.button
        onClick={() => onSelectMode('mystery_word')}
        className={cn(
          'w-full rounded-2xl text-left overflow-hidden relative',
          'bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700',
          'shadow-md shadow-purple-200 dark:shadow-purple-900',
          'hover:shadow-lg hover:shadow-purple-300 transition-all',
          'border border-indigo-400'
        )}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-6 translate-x-6 pointer-events-none" />
        <div className="absolute bottom-0 left-4 w-14 h-14 rounded-full bg-white/10 translate-y-4 pointer-events-none" />

        <div className="relative p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
                <MODE_ICONS.mystery_word className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-white text-sm">{MODE_LABELS.mystery_word}</h4>
                  <span className="px-2 py-0.5 bg-white/25 text-white text-[10px] font-bold rounded-full">
                    ✨ New!
                  </span>
                </div>
                <p className="text-white/85 text-xs mt-1 leading-snug">
                  Find every word in the grid. The remaining letters reveal a hidden mystery word
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/70 shrink-0 mt-1" />
          </div>

        </div>
      </motion.button>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400 font-medium">more modes</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* ── Flat tiles ────────────────────────────────────────────────────── */}
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
