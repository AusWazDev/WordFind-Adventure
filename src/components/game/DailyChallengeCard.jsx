import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, CheckCircle2, Flame } from 'lucide-react';
import { getDailyRecord } from '@/components/game/offlineStorage';
import { getDailyChallengeConfig } from '@/components/game/DailyChallengeUtils';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

const MODE_LABELS = {
  standard:     'Word Find',
  audio:        'Audio',
  anagram:      'Anagram',
  association:  'Clue Hunt',
  mystery_word: 'Mystery Word',
};

export default function DailyChallengeCard() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const challenge = getDailyChallengeConfig();

  useEffect(() => {
    const record = getDailyRecord(challenge.date);
    if (record) {
      setCompleted(record.completed || false);
      setStreak(record.streak || 0);
    }
    setLoading(false);
  }, []);

  const handleStart = () => {
    const params = new URLSearchParams({
      mode: challenge.mode,
      category: challenge.category,
      level: String(challenge.level),
      daily: '1',
    });
    navigate(createPageUrl('DailyChallenge') + '?' + params.toString());
  };

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-4"
    >
      <div className={`relative overflow-hidden rounded-2xl border ${completed ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800' : 'border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800'}`}>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className={`p-2 rounded-xl shrink-0 ${completed ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-amber-100 dark:bg-amber-800'}`}>
            <Calendar className={`w-4 h-4 ${completed ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`text-xs font-semibold uppercase tracking-wide ${completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>Daily Challenge</p>
              {streak > 0 && (
                <div className="flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{streak}</span>
                </div>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{challenge.title}</p>
          </div>
          {completed ? (
            <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Done
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm shrink-0"
            >
              Play <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}