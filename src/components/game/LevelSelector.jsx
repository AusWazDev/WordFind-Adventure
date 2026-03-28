import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Zap, Brain, Flame, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';

const levels = [
  { 
    id: 1, 
    name: 'Easy', 
    description: '8×8 grid • 6 words',
    icon: Star,
    gradient: 'from-emerald-400 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50',
    unlocked: true
  },
  { 
    id: 2, 
    name: 'Medium', 
    description: '10×10 grid • 12 words',
    icon: Zap,
    gradient: 'from-blue-400 to-indigo-500',
    bgGradient: 'from-blue-50 to-indigo-50',
    unlocked: true
  },
  { 
    id: 3, 
    name: 'Hard', 
    description: '12×12 grid • 18 words',
    icon: Brain,
    gradient: 'from-violet-400 to-purple-500',
    bgGradient: 'from-violet-50 to-purple-50',
    unlocked: true
  },
  {
    id: 4,
    name: 'Expert',
    description: '15×15 grid • 24 words',
    icon: Flame,
    gradient: 'from-orange-400 to-red-500',
    bgGradient: 'from-orange-50 to-red-50',
    unlocked: true
  },
  {
    id: 5,
    name: 'Master',
    description: '15×15 grid • 25 words • crossword',
    icon: Skull,
    gradient: 'from-rose-600 to-red-900',
    bgGradient: 'from-rose-50 to-red-100',
    unlocked: true
  },
];

export default function LevelSelector({ currentLevel, onSelectLevel, unlockedLevels = 5 }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 text-center">Select Difficulty</h3>
      <div className="grid grid-cols-2 gap-2">
        {levels.map((level, index) => {
          const Icon = level.icon;
          const isUnlocked = index < unlockedLevels;
          const isSelected = currentLevel === level.id;
          const isMaster = level.id === 5;

          return (
            <motion.button
              key={level.id}
              onClick={() => isUnlocked && onSelectLevel(level.id)}
              disabled={!isUnlocked}
              className={cn(
                "relative p-2 rounded-2xl border-2 transition-all text-left",
                isMaster && "col-span-2",
                isUnlocked 
                  ? `bg-gradient-to-br ${level.bgGradient} hover:shadow-md cursor-pointer`
                  : "bg-slate-100 dark:bg-slate-800 cursor-not-allowed",
                isSelected
                  ? "border-violet-500 ring-2 ring-violet-300 ring-offset-1"
                  : "border-transparent"
              )}
              whileHover={isUnlocked ? { scale: 1.02 } : {}}
              whileTap={isUnlocked ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={cn(
                  "p-1.5 rounded-lg bg-gradient-to-br shadow-sm flex items-center justify-center shrink-0",
                  isUnlocked ? level.gradient : "from-slate-300 to-slate-400"
                )}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <h4 className={cn(
                  "font-bold text-sm leading-tight flex-1",
                  isUnlocked ? "text-slate-800" : "text-slate-400"
                )}>
                  {level.name}
                </h4>
                {!isUnlocked && (
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </div>
              <p className={cn(
                "text-[11px] leading-tight line-clamp-2",
                isUnlocked ? "text-slate-600 dark:text-slate-400" : "text-slate-400"
              )}>
                {level.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}