import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SpellingBeeWordList({ words, foundWords, hintWord, activeSpellingWord, onSpellingAttempt }) {
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const attempt = input.trim().toUpperCase();
    const result = onSpellingAttempt(attempt);
    if (result) {
      setInput('');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const unfoundWords = words.filter(w => !foundWords.includes(w.toLowerCase()));
  const nextWord = unfoundWords[0];

  return (
    <div className="bg-card rounded-2xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Spelling Bee</h3>
        <span className="text-sm text-muted-foreground">{foundWords.length} / {words.length}</span>
      </div>

      {nextWord && (
        <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <p className="text-xs text-emerald-600 font-medium mb-1">Spell the next hidden word:</p>
          <div className="flex items-center gap-2 mb-3">
            {Array.from({ length: nextWord.length }).map((_, i) => (
              <div key={i} className={cn(
                "w-8 h-8 border-2 rounded-lg flex items-center justify-center font-bold text-sm",
                hintWord === nextWord.toLowerCase() && i === 0
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-emerald-300 bg-card text-muted-foreground"
              )}>
                {hintWord === nextWord.toLowerCase() && i === 0 ? nextWord[0] : '_'}
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-1">({nextWord.length} letters)</span>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your answer..."
              className={cn(
                "flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium uppercase tracking-wider outline-none transition-all",
                shake ? "border-red-400 bg-red-50 animate-pulse" : "border-emerald-300 focus:border-emerald-500 bg-background text-foreground"
              )}
              autoComplete="off"
            />
            <button type="submit"
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence>
          {[...words].sort((a, b) => {
            const aFound = foundWords.includes(a.toLowerCase());
            const bFound = foundWords.includes(b.toLowerCase());
            return aFound === bFound ? 0 : aFound ? 1 : -1;
          }).map((word, index) => {
            const isFound = foundWords.includes(word.toLowerCase());
            return (
              <motion.div key={word}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative flex items-center justify-center px-2 py-2 rounded-xl text-center",
                  isFound
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200"
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
                  "font-medium text-xs",
                  isFound ? "text-emerald-700" : "text-muted-foreground"
                )}>
                  {isFound ? word : '• • •'}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">Find the word in the grid, then spell it correctly!</p>
    </div>
  );
}