import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

export default function VictoryModal({
  isOpen,
  score,
  wordsFound,
  level,
  onNextLevel,
  onReplay,
  onHome,
  bonusFound = false,
  bonusPoints = 0,
  hasBonusWord = false,
}) {
  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: bonusFound ? 180 : 100,
        spread: bonusFound ? 90 : 70,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen]);

  const levelNames = ['Easy', 'Medium', 'Hard', 'Expert', 'Master'];
  const stars = level >= 3 ? 3 : level >= 2 ? 2 : 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2"
            >
              Level Complete!
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 dark:text-slate-400 mb-6"
            >
              {levelNames[level - 1]} difficulty conquered
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-2 mb-6"
            >
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ rotate: -30, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                >
                  <Star 
                    className={`w-10 h-10 ${i <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} 
                  />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center gap-8 mb-8"
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-violet-600">{score}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">{wordsFound}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Words</p>
              </div>
            </motion.div>

            {/* Bonus word result — only shown on Master level */}
            {hasBonusWord && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.75 }}
                className={`mb-4 p-3 rounded-xl text-sm font-medium ${
                  bonusFound
                    ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {bonusFound ? (
                  <>
                    <p className="font-bold">🌟 Bonus word found!</p>
                    <p className="text-xs opacity-80">+{bonusPoints} bonus points included</p>
                  </>
                ) : (
                  <p>🔍 Bonus word not found this time</p>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col gap-3"
            >
              {level < 5 && (
                <Button
                  onClick={onNextLevel}
                  className="w-full h-12 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-xl font-semibold"
                >
                  Next Level <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onReplay}
                  className="flex-1 h-12 rounded-xl"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Replay
                </Button>
                <Button
                  variant="outline"
                  onClick={onHome}
                  className="flex-1 h-12 rounded-xl"
                >
                  <Home className="w-4 h-4 mr-2" /> Home
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}