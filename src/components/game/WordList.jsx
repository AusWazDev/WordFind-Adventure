import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, Volume2, WifiOff, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { speakText, unlockAudio } from '@/components/game/voiceUtils';
import { getTrickyWordHint } from '@/components/game/gameUtils';
import { getSentence, hasSentence } from '@/components/game/trickySentences';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function WordList({
  words,
  foundWords,
  isAudioMode,
  revealedWords,
  onRevealWord,
  onHintCell,
  onPlayAudio,
  hintsRemaining,
  hintWord,
  category
}) {
  const isOnline = useOnlineStatus();

  const speakWord = async (word) => {
    // Unlock iOS audio engine on this user tap
    unlockAudio();

    // Load settings from localStorage (no Base44 needed)
    let settings = {};
    try {
      const raw = localStorage.getItem('wf_settings');
      if (raw) settings = JSON.parse(raw);
    } catch {}

    const upper = word.toUpperCase();
    // Always speak in lowercase — TTS engines can read ALL-CAPS as acronyms
    const spoken = word.toLowerCase();

    // 1. Pre-generated sentence available — use it (works offline, no latency)
    if (hasSentence(upper)) {
      const sentence = getSentence(upper);
      await speakText(`${spoken}... ${sentence}... ${spoken}.`, settings);
      onPlayAudio?.(word);
      return;
    }

    // 2. No pre-generated sentence — offline fallback: speak word twice
    if (!isOnline) {
      await speakText(`${spoken}... ${spoken}.`, settings);
      onPlayAudio?.(word);
      return;
    }

    // 3. Fallback — speak word twice clearly
    await speakText(`${spoken}... ${spoken}.`, settings);

    onPlayAudio?.(word);
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {isAudioMode ? 'Listen & Find' : 'Words to Find'}
        </h3>
        <div className="flex items-center gap-2">
          {isAudioMode && !isOnline && (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <WifiOff className="w-3 h-3" />
              Offline
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {foundWords.length} / {words.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence mode="popLayout">
          {[...words].sort((a, b) => {
            const aFound = foundWords.includes(a.toLowerCase());
            const bFound = foundWords.includes(b.toLowerCase());
            return aFound === bFound ? 0 : aFound ? 1 : -1;
          }).map((word, index) => {
            const isFound    = foundWords.includes(word.toLowerCase());
            const isRevealed = revealedWords?.includes(word) || revealedWords?.includes(word.toLowerCase());
            const showWord   = !isAudioMode || isFound || isRevealed;
            const trickyHint = getTrickyWordHint(word);

            return (
              <motion.div
                key={word}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all',
                  isFound
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200'
                    : hintWord === word.toLowerCase()
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 shadow-md'
                    : 'bg-muted border border-border'
                )}
              >
                {isFound && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 bg-emerald-500 rounded-full p-0.5"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}

                <div className="flex flex-col flex-1 min-w-0">
                  <span className={cn(
                    'font-medium text-sm',
                    isFound
                      ? 'text-emerald-700 line-through'
                      : hintWord === word.toLowerCase()
                      ? 'text-amber-700 font-bold'
                      : 'text-foreground'
                  )}>
                    {showWord ? word : '• • • • •'}
                  </span>
                  {showWord && !isFound && trickyHint && (
                    <span className="text-xs text-muted-foreground truncate mt-0.5">
                      {trickyHint}
                    </span>
                  )}
                </div>

                {isAudioMode && !isFound && (
                  <div className="flex gap-1">
                    {/* Eye — reveal word text (uses a hint) */}
                    {!isRevealed && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-11 w-11 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                        onClick={() => onRevealWord(word)}
                        disabled={hintsRemaining <= 0}
                        title="Reveal this word (uses a hint)"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Speaker — play audio (free) */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-11 w-11 text-violet-600 hover:text-violet-700 hover:bg-violet-100"
                      onClick={() => speakWord(word)}
                      title="Hear word with example sentence"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>

                    {/* Lightbulb — flash first letter on grid (uses a hint) */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-11 w-11 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                      onClick={() => onHintCell?.(word)}
                      disabled={hintsRemaining <= 0}
                      title="Show first letter in grid (uses a hint)"
                    >
                      <Lightbulb className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer note when offline and no pre-generated sentence available */}
      {isAudioMode && !isOnline && (
        <p className="text-xs text-muted-foreground text-center mt-3 pt-3 border-t border-border">
          Tricky words play with full sentences. Other words play word only offline.
        </p>
      )}
    </div>
  );
}
