import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Coins, Sparkles, Star, Shield, WifiOff, Gift, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';
import { isNative } from '@/lib/platform';
import { showRewarded } from '@/lib/admob';
import * as Sentry from '@sentry/react';
import { purchaseProduct, PURCHASE_OPTIONS, getPrice } from '@/lib/purchases';
import { claimFreeRefill, msUntilFreeRefill, formatRefillWait, FREE_REFILL_HINTS } from '@/lib/freeHintRefill';

// Windows and web (CR-64): no ads and no purchases, so the only offer is a
// daily free refill. Replaces the simulated AdPlayer, whose Skip still granted
// a hint and whose image was a third-party (Unsplash) request.
function FreeRefillCard({ onFreeHints }) {
  const waitMs = msUntilFreeRefill();

  const handleClaim = () => {
    const granted = claimFreeRefill();
    if (granted > 0) onFreeHints(granted);
  };

  if (waitMs === 0) {
    return (
      <motion.button
        onClick={handleClaim}
        className="w-full p-4 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl text-white text-left flex items-center gap-4 hover:shadow-lg hover:shadow-violet-200 transition-shadow"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="p-3 bg-white/20 rounded-xl">
          <Gift className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold">Get {FREE_REFILL_HINTS} free hints</h3>
          <p className="text-violet-200 text-sm">Once a day, on the house</p>
        </div>
        <span className="ml-auto text-white/60 text-sm font-medium">FREE</span>
      </motion.button>
    );
  }

  return (
    <div className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-left flex items-center gap-4">
      <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-xl">
        <Clock className="w-6 h-6 text-slate-500" />
      </div>
      <div>
        <h3 className="font-bold text-slate-600 dark:text-slate-300">Free hints refill daily</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Next {FREE_REFILL_HINTS} free hints in {formatRefillWait(waitMs)}</p>
      </div>
    </div>
  );
}

function PurchaseView({ onPurchase }) {
  const [selected, setSelected] = useState('au.com.uniquegames.soundfind.hints_10');
  const [purchasing, setPurchasing] = useState(false);

  const selectedOption = PURCHASE_OPTIONS.find(o => o.productId === selected);

  const handlePurchase = async () => {
    if (purchasing) return;
    if (!isNative()) {
      toast.info('Coming soon', { description: 'Hint packs will be available at launch on the App Store and Google Play.' });
      return;
    }
    setPurchasing(true);
    try {
      const result = await purchaseProduct(selected);
      if (result.hints) onPurchase(result.hints);
    } catch (e) {
      if (!e?.message?.includes('cancel')) {
        toast.error('Purchase failed', { description: 'Please try again.' });
        Sentry.captureException(e, { tags: { context: 'hint_purchase' } });
      }
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="space-y-3">
      {PURCHASE_OPTIONS.map(option => (
        <motion.button
          key={option.productId}
          onClick={() => setSelected(option.productId)}
          className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${
            selected === option.productId
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
                <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">Popular</span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{option.label}</p>
          </div>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{getPrice(option.productId, option.price)}</span>
        </motion.button>
      ))}

      <div className="flex items-center justify-center gap-2 py-1">
        <Shield className="w-4 h-4 text-slate-400" />
        <p className="text-xs text-slate-400 dark:text-slate-500">Prices are indicative · Billed through the App Store / Google Play</p>
      </div>

      <Button
        onClick={handlePurchase}
        disabled={purchasing}
        className="w-full h-12 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-xl font-semibold"
      >
        {purchasing
          ? 'Processing…'
          : `Buy ${selectedOption?.hints} Hints — ${getPrice(selected, selectedOption?.price)}`}
      </Button>
    </div>
  );
}

export default function HintModal({ isOpen, onClose, onWatchAd, onPurchase, onFreeHints }) {
  const native = isNative();
  const [view, setView] = useState('options');
  const isOnline = useOnlineStatus();

  const handleWatchAdNative = async () => {
    handleClose();
    const rewarded = await showRewarded();
    if (rewarded) {
      onWatchAd();
    } else {
      toast.info('No ad available right now', { description: 'Try again in a moment.' });
    }
  };

  const handleFreeHints = (amount) => {
    setView('options');
    onFreeHints?.(amount);
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
            <div className="flex justify-between items-start mb-5">
              <div>
                {view === 'options'  && <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Need a Hint? 💡</h2>}
                {view === 'purchase' && <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Get More Hints</h2>}
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {view === 'options'  && (native ? 'Choose how to unlock your next hint' : "You're out of hints")}
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
                  {!native && <FreeRefillCard onFreeHints={handleFreeHints} />}

                  {native && <>
                  {isOnline ? (
                    <motion.button
                      onClick={handleWatchAdNative}
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
                  ) : (
                    <div className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-left flex items-center gap-4 opacity-60">
                      <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-xl">
                        <WifiOff className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-500 dark:text-slate-400">Watch an Ad</h3>
                        <p className="text-slate-400 text-sm">Go online to earn a free hint</p>
                      </div>
                    </div>
                  )}

                  {isOnline ? (
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
                  ) : (
                    <div className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-left flex items-center gap-4 opacity-60">
                      <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-xl">
                        <WifiOff className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-500 dark:text-slate-400">Buy Hint Pack</h3>
                        <p className="text-slate-400 text-sm">Go online to purchase hints</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 justify-center pt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <p className="text-xs text-slate-400 dark:text-slate-500">Purchases support the developer</p>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                  </>}
                </motion.div>
              )}

              {native && view === 'purchase' && (
                <motion.div key="purchase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PurchaseView onPurchase={handlePurchaseDone} />
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
