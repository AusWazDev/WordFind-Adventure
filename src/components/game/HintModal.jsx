import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Coins, Sparkles, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';


const PURCHASE_OPTIONS = [
  {
    id: 'starter',
    hints: 3,
    price: '$0.99',
    label: 'Starter',
    gradient: 'from-amber-400 to-orange-500',
    shadow: 'shadow-amber-200',
    popular: false,
  },
  {
    id: 'value',
    hints: 10,
    price: '$1.99',
    label: 'Best Value',
    gradient: 'from-violet-500 to-indigo-600',
    shadow: 'shadow-violet-200',
    popular: true,
  },
  {
    id: 'pro',
    hints: 25,
    price: '$3.99',
    label: 'Power Pack',
    gradient: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-emerald-200',
    popular: false,
  },
];

function AdPlayer({ onComplete, onSkip }) {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const AD_DURATION = 15; // seconds

  useEffect(() => {
    const skipTimer = setTimeout(() => setCanSkip(true), 5000);
    const interval = setInterval(() => {
      setAdProgress(prev => {
        const next = prev + (100 / AD_DURATION);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return next;
      });
    }, 1000);

    const cdInterval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(skipTimer);
      clearInterval(interval);
      clearInterval(cdInterval);
    };
  }, [onComplete]);

  const adImages = [
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&h=200&fit=crop',
  ];

  return (
    <div className="text-center">
      <div className="relative rounded-2xl overflow-hidden mb-4 bg-slate-900">
        <img
          src={adImages[0]}
          alt="Advertisement"
          className="w-full h-40 object-cover opacity-80"
        />
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-medium">
          AD
        </div>
        {!canSkip && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
            Skip in {countdown}s
          </div>
        )}
        {canSkip && (
          <button
            onClick={onSkip}
            className="absolute top-2 right-2 bg-white text-slate-800 text-xs px-3 py-1 rounded-md font-bold hover:bg-slate-100 transition"
          >
            Skip Ad →
          </button>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <motion.div
            className="h-full bg-violet-400"
            style={{ width: `${adProgress}%` }}
          />
        </div>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm">Watch the full ad to earn your hint</p>
    </div>
  );
}

function PurchaseView({ onPurchase, onClose }) {
  const [selected, setSelected] = useState('value');

  const handlePurchase = () => {
    const option = PURCHASE_OPTIONS.find(o => o.id === selected);
    // In-app purchase: handled by the native store billing layer.
    // Calling onPurchase here only after a confirmed transaction from the store.
    // For now, show a native-style notice.
    alert(`In-app purchases will be available on release.\nSelected: ${option.hints} hints — ${option.price}`);
  };

  return (
    <div className="space-y-3">
      {PURCHASE_OPTIONS.map(option => (
        <motion.button
          key={option.id}
          onClick={() => setSelected(option.id)}
          className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${
            selected === option.id
              ? 'border-violet-500 bg-violet-50 dark:bg-violet-950'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-300'
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <div className={`p-3 bg-gradient-to-br ${option.gradient} rounded-xl`}>
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-100">{option.hints} Hints</span>
              {option.popular && (
                <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">
                  Popular
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{option.label}</p>
          </div>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{option.price}</span>
        </motion.button>
      ))}

      <div className="flex items-center justify-center gap-2 py-1">
        <Shield className="w-4 h-4 text-slate-400" />
        <p className="text-xs text-slate-400 dark:text-slate-500">Prices are indicative · Billed through the App Store / Google Play</p>
      </div>

      <Button
        onClick={handlePurchase}
        className="w-full h-12 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-xl font-semibold"
      >
        {`Buy ${PURCHASE_OPTIONS.find(o => o.id === selected)?.hints} Hints — ${PURCHASE_OPTIONS.find(o => o.id === selected)?.price}`}
      </Button>
    </div>
  );
}

export default function HintModal({ isOpen, onClose, onWatchAd, onPurchase }) {
  const [view, setView] = useState('options'); // 'options' | 'ad' | 'purchase'

  const handleAdComplete = () => {
    setView('options');
    onWatchAd();
  };

  const handleAdSkip = () => {
    setView('options');
    // Partial reward - still give 1 hint if they watched at least 5 seconds
    onWatchAd();
  };

  const handlePurchaseDone = (amount) => {
    setView('options');
    onPurchase(amount);
  };

  const handleClose = () => {
    setView('options');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                {view === 'options' && <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Need a Hint? 💡</h2>}
                {view === 'ad' && <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Watch & Earn</h2>}
                {view === 'purchase' && <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Get More Hints</h2>}
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {view === 'options' && 'Choose how to unlock your next hint'}
                  {view === 'ad' && 'Watch a short ad for a free hint'}
                  {view === 'purchase' && 'One-time purchase, no subscription'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {view === 'options' && (
                <motion.div
                  key="options"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {/* Watch Ad */}
                  <motion.button
                    onClick={() => setView('ad')}
                    className="w-full p-4 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl text-white text-left flex items-center gap-4 hover:shadow-lg hover:shadow-violet-200 transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Play className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">Watch an Ad</h3>
                      <p className="text-violet-200 text-sm">Get 1 free hint — ~15 seconds</p>
                    </div>
                    <span className="ml-auto text-white/60 text-sm font-medium">FREE</span>
                  </motion.button>

                  {/* Purchase */}
                  <motion.button
                    onClick={() => setView('purchase')}
                    className="w-full p-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl text-white text-left flex items-center gap-4 hover:shadow-lg hover:shadow-amber-200 transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">Buy Hint Pack</h3>
                      <p className="text-amber-100 text-sm">3, 10 or 25 hints</p>
                    </div>
                    <span className="ml-auto text-white/80 text-sm font-medium">from $0.99</span>
                  </motion.button>

                  <div className="flex items-center gap-1.5 justify-center pt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <p className="text-xs text-slate-400 dark:text-slate-500">Purchases support the developer</p>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                </motion.div>
              )}

              {view === 'ad' && (
                <motion.div key="ad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AdPlayer onComplete={handleAdComplete} onSkip={handleAdSkip} />
                  <Button variant="ghost" className="w-full mt-2 text-slate-400" onClick={() => setView('options')}>
                    ← Back
                  </Button>
                </motion.div>
              )}

              {view === 'purchase' && (
                <motion.div key="purchase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PurchaseView onPurchase={handlePurchaseDone} onClose={handleClose} />
                  <Button variant="ghost" className="w-full mt-2 text-slate-400" onClick={() => setView('options')}>
                    ← Back
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}