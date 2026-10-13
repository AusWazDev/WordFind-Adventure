import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';

// A coach mark (S43, SF-64): a ring around the target and a small bubble beside it.
// No full-screen dim, no blur, no backdrop filter (SF-49). Both are pointer-transparent,
// except the bubble's link, so drags on the board pass straight through.
//
// containerRef: the positioned element the mark is drawn in.
// selectors: CSS selectors for the target(s) inside it (data-row/data-col, data-coach);
//   the ring encloses all of them.
export function useTargetRect(containerRef, selectors) {
  const [rect, setRect] = useState(null);
  const key = selectors.join('|');
  const measure = useCallback(() => {
    const box = containerRef.current;
    if (!box) return;
    const els = selectors.flatMap(s => [...box.querySelectorAll(s)]);
    if (!els.length) { setRect(null); return; }
    const b = box.getBoundingClientRect();
    const rs = els.map(e => e.getBoundingClientRect());
    setRect({
      top: Math.min(...rs.map(r => r.top)) - b.top,
      left: Math.min(...rs.map(r => r.left)) - b.left,
      right: Math.max(...rs.map(r => r.right)) - b.left,
      bottom: Math.max(...rs.map(r => r.bottom)) - b.top,
      width: b.width,
      height: b.height,
    });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // A child's layout effect runs before its parent's ref is attached, so measure again
  // in a passive effect, which runs once every ref is in place.
  useEffect(() => { measure(); }, [measure]);
  // Measure now, on every resize and orientation change, and once more after layout settles.
  useLayoutEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    const t = setTimeout(measure, 120);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      clearTimeout(t);
    };
  }, [measure]);
  return rect;
}

const BUBBLE_W = 280;

export default function CoachMark({ containerRef, selectors, dashed = false, heading, body, link, onLink }) {
  const rect = useTargetRect(containerRef, selectors);
  const below = !rect || rect.top < rect.height / 2;
  const left = rect ? Math.max(8, Math.min((rect.left + rect.right) / 2 - BUBBLE_W / 2, rect.width - BUBBLE_W - 8)) : 8;
  return (
    <>
      {rect && (
        <div
          data-testid="coach-ring"
          className={`pointer-events-none absolute z-20 rounded-xl border-2 border-amber-400 ${dashed ? 'border-dashed' : ''}`}
          style={{ top: rect.top - 4, left: rect.left - 4, width: rect.right - rect.left + 8, height: rect.bottom - rect.top + 8 }}
        />
      )}
      <div
        role="status"
        aria-live="polite"
        data-testid="coach"
        className="pointer-events-none absolute z-30"
        style={{
          width: BUBBLE_W, left,
          top: rect ? (below ? rect.bottom + 12 : rect.top - 12) : 8,
          transform: rect && !below ? 'translateY(-100%)' : undefined,
        }}
      >
        <motion.div
          key={heading}
          className="rounded-2xl bg-slate-900 text-white shadow-xl px-4 py-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <p className="font-bold text-sm">{heading}</p>
          {body && <p className="text-xs text-white/80 mt-1 leading-snug">{body}</p>}
          {link && (
            <button type="button" onClick={onLink} className="pointer-events-auto mt-2 min-h-[44px] text-xs font-semibold text-amber-300 underline">
              {link}
            </button>
          )}
        </motion.div>
      </div>
    </>
  );
}
