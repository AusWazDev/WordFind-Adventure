import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { scrambleWord } from '@/components/game/gameUtils';

export default function AnagramWordList({ words, foundWords, hintWord }) {
  // Stable scrambles per word (re-scramble button)
  const [scrambles, setScrambles] = useState(() => {
    const m = {};
    words.forEach(w => { m[w] = scrambleWord(w); });
    return m;
  });

  const reshuffleWord = (word) => {
    setScrambles(prev => ({ ...prev, [word]: scrambleWord(word) }));
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Unscramble & Find</h3>
        <span className="text-sm text-muted-foreground">{foundWords.length} / {words.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence mode="popLayout">
          {[...words].sort((a, b) => {
            const aFound = foundWords.includes(a.toLowerCase());
            const bFound = foundWords.includes(b.toLowerCase());
            return aFound === bFound ? 0 : aFound ? 1 : -1;
          }).map((word, index) => {
            const isFound = foundWords.includes(word.toLowerCase());
            const isHinted = hintWord === word.toLowerCase();
            return (
              <motion.div
                key={word}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative flex items-center gap-1 px-3 py-2 rounded-xl transition-all",
                  isFound
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200"
                    : isHinted
                    ? "bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 shadow-md"
                    : "bg-muted border border-border"
                )}
              >
                {isFound && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 bg-emerald-500 rounded-full p-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                <span className={cn(
                  "font-mono font-bold text-sm flex-1 tracking-widest",
                  isFound ? "text-emerald-700 line-through"
                    : isHinted ? "text-amber-700"
                    : "text-violet-700"
                )}>
                  {isFound ? word : scrambles[word] || word}
                </span>
                {!isFound && (
                  <button onClick={() => reshuffleWord(word)}
                    className="flex items-center justify-center h-11 w-11 text-muted-foreground hover:text-violet-500 transition-colors rounded-lg">
                    <Shuffle className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">Letters are scrambled — figure out the word, then find it in the grid!</p>
    </div>
  );
}