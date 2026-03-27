import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, CheckCircle, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';


const REMOVE_ADS_PRICE = '$2.99';

export default function RemoveAdsModal({ isOpen, onClose, onSuccess }) {
  const [success, setSuccess] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = () => {
    // In-app purchase: handled by the native store billing layer.
    // onSuccess() is called only after a confirmed store transaction.
    // TODO: replace with RevenueCat purchase call on release.
    alert(`In-app purchases will be available on release.\nRemove Ads — ${REMOVE_ADS_PRICE} (one-time)`);
  };

  const handleClose = () => {
    if (purchasing) return;
    setSuccess(false);
    onClose();
  };

  const perks = [
    'No ads before every game',
    'Smoother, uninterrupted gameplay',
    'Support the developer ♥',
    'Instant & permanent — no subscription',
  ];

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
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-8 text-center"
              >
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-9 h-9 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Ads Removed! 🎉</h3>
                <p className="text-slate-500 mt-1">Enjoy uninterrupted word-finding!</p>
              </motion.div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-5 h-5 text-amber-500" />
                      <h2 className="text-2xl font-bold text-slate-800">Go Ad-Free</h2>
                    </div>
                    <p className="text-slate-500 text-sm">One-time purchase, no subscription</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Price badge */}
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-center text-white mb-5 shadow-lg shadow-amber-200">
                  <p className="text-amber-100 text-sm mb-1">One-time price</p>
                  <p className="text-5xl font-bold">{REMOVE_ADS_PRICE}</p>
                  <p className="text-amber-100 text-sm mt-1">Forever — not a subscription</p>
                </div>

                {/* Perks */}
                <div className="space-y-2 mb-5">
                  {perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{perk}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <p className="text-xs text-slate-400">Secure payment · Instant delivery</p>
                </div>

                <Button
                  onClick={handlePurchase}
                  className="w-full h-12 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl font-semibold shadow-md shadow-amber-200"
                >
                  {`Remove Ads — ${REMOVE_ADS_PRICE}`}
                </Button>
                <p className="text-center text-xs text-slate-400 mt-1">Billed through the App Store / Google Play</p>

                <div className="flex items-center gap-1.5 justify-center mt-3">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <p className="text-xs text-slate-400">Purchases support the developer</p>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}