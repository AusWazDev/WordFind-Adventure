import React from 'react';
import { Check, Volume2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// The tutorial's word list (S43, SF-64). It matches WordList's look, but WordList cannot
// be reused: it imports offlineStorage (for the audio settings) and wires its hint
// buttons to the real balance. Here every action is the tutorial's own, and costs nothing.
//
// words: [{ word, hidden, dimmed, speaker, hint }] in display order.
export default function TutorialWordList({ words, foundWords, hintWord, onPlay, onHint }) {
  return (
    <div className="bg-card rounded-2xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">Words to Find</h3>
        <span className="text-sm text-muted-foreground">{foundWords.length} / {words.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {words.map(({ word, hidden, dimmed, speaker, hint }) => {
          const isFound = foundWords.includes(word);
          const isHinted = hintWord === word;
          const showWord = isFound || !hidden;
          return (
            <div
              key={word}
              data-word={word}
              className={cn(
                'relative flex items-center gap-2 px-3 py-2 rounded-xl transition-opacity',
                isFound
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200'
                  : isHinted
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 shadow-md'
                  : 'bg-muted border border-border',
                dimmed && !isFound && 'opacity-50'
              )}
            >
              {isFound && (
                <div className="absolute -right-1 -top-1 bg-emerald-500 rounded-full p-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <span className={cn(
                'flex-1 min-w-0 font-medium text-sm',
                !showWord && 'whitespace-nowrap',
                isFound ? 'text-emerald-700 line-through' : 'text-foreground'
              )}>
                {showWord ? word : '• • • • •'}
              </span>
              {speaker && !isFound && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-11 w-11 text-violet-600 hover:text-violet-700 hover:bg-violet-100"
                  onClick={() => onPlay(word)}
                  aria-label="Play word"
                  data-coach="word-play"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
              {hint && !isFound && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-11 w-11 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                  onClick={() => onHint(word)}
                  aria-label="Hint: show first letter"
                  data-coach="word-hint"
                >
                  <Lightbulb className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
