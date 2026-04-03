import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const WELCOME_KEY = 'wf_welcome_seen';

export function hasSeenWelcome() {
  try {
    return localStorage.getItem(WELCOME_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markWelcomeSeen() {
  try {
    localStorage.setItem(WELCOME_KEY, 'true');
  } catch {}
}

export default function WelcomeScreen({ onDone, onShowHowToPlay }) {

  const handlePlay = () => {
    markWelcomeSeen();
    onDone();
  };

  const handleHowToPlay = () => {
    markWelcomeSeen();
    onShowHowToPlay();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #0f0e1a 0%, #1a1830 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent)', transform: 'translate(-30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', transform: 'translate(30%, 30%)' }}
      />

      {/*
        Use a flex column with min-height 100dvh and justify-center so content
        is centred on all screen sizes. padding-top/bottom accounts for iOS
        safe areas (notch, home indicator) via env() variables.
      */}
      <div
        className="relative flex flex-col items-center justify-center w-full min-h-screen px-4"
        style={{
          minHeight: '100dvh',
          paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="w-full max-w-sm">

          {/* Logo / title */}
          <motion.div
            className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <img
              src="/icon.png"
              alt="SoundFind"
              className="mb-4 mx-auto"
              style={{
                width: '72px', height: '72px',
                borderRadius: 'calc(72px * 0.2237)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
              }}
            />
            <h1 className="text-4xl font-black text-white tracking-tight">
              Sound<span className="text-violet-400">Find</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">Hear it. Find it.</p>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            className="space-y-3 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Audio Challenge — featured */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 p-4 shadow-lg shadow-indigo-900/40">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-6 translate-x-6 pointer-events-none" />
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/20 shrink-0">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-sm">Audio Challenge</p>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-white/25 text-white text-[10px] font-bold rounded-full">
                      <Sparkles className="w-2.5 h-2.5" /> Signature
                    </span>
                  </div>
                  <p className="text-white/85 text-xs mt-0.5 leading-snug">
                    Hear the word, find its spelling. Perfect for silent letters, homophones and tricky spellings.
                  </p>
                </div>
              </div>
            </div>

            {/* Other features */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '🔤', title: 'Word Search',   desc: 'Classic grid gameplay' },
                { icon: '🔀', title: 'Anagram Hunt',  desc: 'Unscramble & find' },
                { icon: '🔍', title: 'Mystery Word',  desc: 'Hidden word challenge' },
                { icon: '✈️', title: 'Offline Play',  desc: 'Works on a plane' },
              ].map(item => (
                <div key={item.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-white text-xs font-semibold mt-1">{item.title}</p>
                  <p className="text-white/50 text-[10px] mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            className="space-y-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={handlePlay}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-indigo-700 font-black text-base shadow-xl shadow-black/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Playing
              <ChevronRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              onClick={handleHowToPlay}
              className="w-full py-3 rounded-2xl bg-white/10 backdrop-blur-sm text-white font-semibold text-sm border border-white/20"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              How to Play
            </motion.button>
          </motion.div>

          <p className="text-center text-white/30 text-xs mt-6">
            Your progress is saved automatically
          </p>

        </div>
      </div>
    </motion.div>
  );
}
