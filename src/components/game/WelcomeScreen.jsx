import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, BookOpen } from 'lucide-react';

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
      className="fixed inset-0 z-50"
      style={{ background: 'linear-gradient(160deg, #0f0e1a 0%, #1a1830 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4), transparent)', transform: 'translate(-35%, -35%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #14b8a6, transparent)', transform: 'translate(35%, 35%)' }}
      />

      <div
        className="relative flex flex-col items-center justify-center w-full px-6"
        style={{
          minHeight: '100dvh',
          paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="w-full max-w-sm flex flex-col items-center gap-8">

          {/* Icon + branding */}
          <motion.div
            className="text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <img
              src="/icon.png"
              alt="SoundFind"
              className="mb-5 mx-auto"
              style={{
                width: '88px', height: '88px',
                borderRadius: 'calc(88px * 0.2237)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
              }}
            />
            <h1 className="text-5xl font-black text-white tracking-tight leading-none">
              Sound<span className="text-violet-400">Find</span>
            </h1>
            <p className="text-white/50 text-sm mt-2 tracking-wide uppercase font-medium">
              Hear it. Find it.
            </p>
          </motion.div>

          {/* One-liner pitch */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/8"
          >
            {['5 game modes', 'Natural voices', 'Works offline'].map((item, i) => (
              <React.Fragment key={item}>
                {i > 0 && <span className="text-white/20 text-xs">·</span>}
                <span className="text-white/70 text-xs font-medium">{item}</span>
              </React.Fragment>
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.div
            className="w-full space-y-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {/* Primary — violet/indigo gradient matching the app's hero cards */}
            <motion.button
              onClick={handlePlay}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base text-white shadow-xl shadow-violet-900/40"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Playing
              <ChevronRight className="w-5 h-5" />
            </motion.button>

            {/* Secondary — teal outline, clearly different from primary */}
            <motion.button
              onClick={handleHowToPlay}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm text-teal-300 border-2 border-teal-500/50 bg-teal-500/10"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <BookOpen className="w-4 h-4" />
              How to Play
            </motion.button>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
