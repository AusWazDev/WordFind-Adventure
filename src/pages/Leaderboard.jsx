import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users } from 'lucide-react';
import { getLocalProgress } from '@/components/game/offlineStorage';

export default function Leaderboard() {
  const progress = getLocalProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Leaderboard</h1>
        </motion.div>

        {/* Your stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-violet-200 dark:border-slate-700 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Trophy className="w-5 h-5 text-violet-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Your Stats</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-violet-600">{progress?.total_score ?? 0}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">{progress?.games_played ?? 0}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Games Played</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">{progress?.words_found ?? 0}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Words Found</p>
            </div>
          </div>
        </motion.div>

        {/* Coming soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-100 dark:border-slate-700 text-center"
        >
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-violet-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Global Leaderboard Coming Soon
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Challenge friends and compete globally — this feature is on its way!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
