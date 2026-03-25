import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const scrollRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    const el = scrollRef.current;
    if (el && el.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      setPullDist(Math.min(delta * 0.5, THRESHOLD * 1.3));
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDist >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDist(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPullDist(0);
    startY.current = null;
  }, [pullDist, refreshing, onRefresh]);

  const progress = Math.min(pullDist / THRESHOLD, 1);
  const triggered = pullDist >= THRESHOLD;

  return (
    <div
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {(pullDist > 4 || refreshing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: refreshing ? THRESHOLD : pullDist }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center overflow-hidden"
          >
            <motion.div
              animate={{ rotate: refreshing ? 360 : progress * 270 }}
              transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
                triggered ? 'bg-violet-500 text-white' : 'bg-white text-violet-400 border border-slate-200'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}