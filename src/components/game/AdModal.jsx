import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';


const AD_IMAGES = [
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&h=250&fit=crop',
  'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=500&h=250&fit=crop',
  'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=500&h=250&fit=crop',
];

const AD_DURATION = 5; // seconds before skip becomes available / auto-continue

export default function AdModal({ isOpen, onClose, onRemoveAds }) {
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [canSkip, setCanSkip] = useState(false);
  const [adImage] = useState(() => AD_IMAGES[Math.floor(Math.random() * AD_IMAGES.length)]);

  useEffect(() => {
    if (!isOpen) return;
    setCountdown(AD_DURATION);
    setCanSkip(false);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSkip = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-0 max-w-sm w-full shadow-2xl overflow-hidden"
          >
            {/* Ad image */}
            <div className="relative">
              <img src={adImage} alt="Ad" className="w-full h-44 object-cover" />
              <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-bold">
                AD
              </div>
              {!canSkip ? (
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-md font-medium">
                  {countdown}s
                </div>
              ) : (
                <button
                  onClick={handleSkip}
                  className="absolute top-3 right-3 bg-white text-slate-800 text-xs px-3 py-1 rounded-md font-bold hover:bg-slate-100 transition flex items-center gap-1"
                >
                  Skip <X className="w-3 h-3" />
                </button>
              )}
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                <motion.div
                  className="h-full bg-violet-400"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: AD_DURATION, ease: 'linear' }}
                />
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {canSkip ? 'Ready to play!' : `Your game starts in ${countdown}s…`}
                </p>
              </div>

              {/* Remove ads upsell */}
              <motion.button
                onClick={onRemoveAds}
                className="w-full p-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl text-white text-left flex items-center gap-3 hover:shadow-lg hover:shadow-amber-200 transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-2 bg-white/20 rounded-xl">
                  <Crown className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">Remove Ads Forever</h3>
                  <p className="text-amber-100 text-xs">One-time purchase — play ad-free!</p>
                </div>
                <Sparkles className="w-4 h-4 text-white/70" />
              </motion.button>

              {canSkip && (
                <Button
                  onClick={handleSkip}
                  className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-xl h-11 font-semibold"
                >
                  Play Now →
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}