import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const MODE_LABELS = {
  standard: 'Standard Mode',
  audio: 'Audio Challenge',
  anagram: 'Anagram Hunt',
  spelling: 'Spelling Bee',
  association: 'Word Association',
};

export default function GameLoadingScreen({ mode, level }) {
  const modeLabel = MODE_LABELS[mode] || 'Loading Game';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl shadow-lg">
            <Search className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Word<span className="text-violet-600">Find</span>
            </h2>
          </div>
        </motion.div>

        {/* Mode and Level */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
            {modeLabel}
          </h3>
          <div className="inline-block px-4 py-2 bg-violet-100 dark:bg-violet-900/30 rounded-full">
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
              Level {level}
            </span>
          </div>
        </motion.div>

        {/* Animated Loading Indicator */}
        <motion.div
          className="flex gap-2 justify-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-violet-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.2,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          ))}
        </motion.div>

        {/* Subtext */}
        <motion.p
          className="text-sm text-slate-500 dark:text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Preparing your game...
        </motion.p>
      </div>
    </div>
  );
}