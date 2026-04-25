import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getClue } from '@/components/game/gameUtils';

export default function AssociationWordList({ words, foundWords, hintWord, revealedWords, onRevealWord, onHintCell, hintsRemaining }) {
  return (
    <div className="bg-card rounded-2xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Find by Clue</h3>
        <span className="text-sm text-muted-foreground">{foundWords.length} / {words.length}</span>
      </div>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {[...words].sort((a, b) => {
            const aFound = foundWords.includes(a.toLowerCase());
            const bFound = foundWords.includes(b.toLowerCase());
            return aFound === bFound ? 0 : aFound ? 1 : -1;
          }).map((word, index) => {
            const isFound = foundWords.includes(word.toLowerCase());
            const isRevealed = revealedWords?.includes(word) || revealedWords?.includes(word.toLowerCase());
            const isHinted = hintWord === word.toLowerCase();
            return (
              <motion.div
                key={word}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all",
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
                <span className="text-muted-foreground text-xs w-4 shrink-0">{index + 1}.</span>
                <span className={cn(
                  "text-sm flex-1",
                  isFound ? "text-emerald-700 line-through font-medium"
                    : isHinted ? "text-amber-700 font-semibold"
                    : "text-foreground"
                )}>
                  {isFound || isRevealed ? word : getClue(word)}
                </span>
                {!isFound && !isRevealed && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => onRevealWord(word)}
                      className="flex items-center justify-center h-11 w-11 text-muted-foreground hover:text-amber-500 transition-colors rounded-lg"
                      title="Use a hint to reveal"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {onHintCell && (
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={!!hintWord}
                        className={`h-11 w-11 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 ${hintWord ? 'opacity-40 cursor-not-allowed' : ''}`}
                        onClick={() => onHintCell(word)}
                        title="Flash first letter on grid (uses a hint, −25% score penalty)"
                      >
                        <Lightbulb className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">Read the clue and find the hidden word in the grid!</p>
    </div>
  );
}