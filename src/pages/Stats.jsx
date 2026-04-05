import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { getLocalProgress, getAllDailyRecords } from '@/components/game/offlineStorage';
import { Trophy, Zap, Flame, Search, Target, BarChart2, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORY_COLORS = {
  animals: '#8b5cf6',
  food: '#f59e0b',
  nature: '#10b981',
  colors: '#ec4899',
  sports: '#3b82f6',
  space: '#6366f1',
  music: '#f97316',
  countries: '#14b8a6',
  science: '#06b6d4',
  mythology: '#a855f7',
  technology: '#64748b',
  ocean: '#0ea5e9',
  history: '#b45309',
  emotions: '#ef4444',
  random: '#94a3b8',
};

function StatCard({ icon: Icon, iconColor, label, value, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconColor}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-sm">
        <p className="font-semibold capitalize text-slate-700 dark:text-slate-200">{label}</p>
        <p className="text-violet-600">{payload[0].value} games</p>
      </div>
    );
  }
  return null;
};

export default function Stats() {
  const [progress, setProgress] = useState(null);
  const [challengeProgress, setChallengeProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    setProgress(getLocalProgress());
    setChallengeProgress(getAllDailyRecords());
    setLoading(false);
  };

  // Derive category chart data from daily challenge history
  const categoryData = React.useMemo(() => {
    const counts = {};
    challengeProgress.forEach(cp => {
      if (cp.category) {
        counts[cp.category] = (counts[cp.category] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [challengeProgress]);

  const gamesPlayed = progress?.games_played || 0;
  const totalScore = progress?.total_score || 0;
  const avgScore = gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0;
  const bestStreak = progress?.best_streak || 0;
  const wordsFound = progress?.words_found || 0;
  const dailyCompleted = challengeProgress.filter(c => c.completed).length;

  const statCards = [
    { icon: Trophy, iconColor: 'bg-amber-400', label: 'Total Score', value: totalScore.toLocaleString() },
    { icon: BarChart2, iconColor: 'bg-violet-500', label: 'Avg Score / Game', value: avgScore.toLocaleString(), sub: `across ${gamesPlayed} games` },
    { icon: Flame, iconColor: 'bg-orange-400', label: 'Longest Streak', value: bestStreak },
    { icon: Search, iconColor: 'bg-emerald-500', label: 'Words Found', value: wordsFound.toLocaleString() },
    { icon: Zap, iconColor: 'bg-indigo-500', label: 'Games Played', value: gamesPlayed },
    { icon: Star, iconColor: 'bg-pink-500', label: 'Daily Challenges Done', value: dailyCompleted },
  ];

  return (
    <PullToRefresh onRefresh={loadStats}>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Stats</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Your game history at a glance</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 gap-3">
              {statCards.map((card, i) => (
                <motion.div key={card.label} transition={{ delay: i * 0.06 }}>
                  <StatCard {...card} />
                </motion.div>
              ))}
            </div>

            {/* Category Chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-violet-500" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Daily Challenges by Category</h2>
              </div>

              {categoryData.length === 0 ? (
                <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-8">
                  Complete some daily challenges to see category stats!
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {categoryData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLORS[entry.name] || '#8b5cf6'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}