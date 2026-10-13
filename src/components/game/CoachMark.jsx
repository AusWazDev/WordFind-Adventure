import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { placeBubble, GAP } from '@/lib/coachPlacement';

// A coach bubble (S43, SF-64; G2 and G5, SF-66b). The targets mark themselves: a target
// cell or control draws its own outline (GameBoard `coachCells`, TutorialWordList
// `coachTarget`), so nothing positioned has to line up with them. Only this bubble is
// positioned. No full-screen dim, no blur, no backdrop filter (SF-49). The bubble is
// pointer-transparent except its link and "More", so drags pass straight through.
//
// SF-66b finding: the old separately drawn ring, and this bubble, sat 12 px low, because
// the page container's `space-y-3` gives every child after the first a top margin, and
// an absolutely positioned element keeps it. The bubble now sets its margin to 0.

// Rects of everything matching `selectors` inside the container, in its coordinates.
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
  useRemeasure(containerRef, measure);
  return rect;
}

// Measure now, after refs attach, on resize and rotation, when the container changes size
// (rows changing height as words are found), and once more after layout settles.
function useRemeasure(containerRef, measure) {
  useEffect(() => { measure(); }, [measure]);
  useLayoutEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    const t = setTimeout(measure, 120);
    const ro = typeof ResizeObserver === 'function' && containerRef.current ? new ResizeObserver(() => measure()) : null;
    if (ro) ro.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      clearTimeout(t);
      ro?.disconnect();
    };
  }, [measure]); // eslint-disable-line react-hooks/exhaustive-deps
}

const rel = (el, b) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left - b.left, top: r.top - b.top, right: r.right - b.left, bottom: r.bottom - b.top };
};

export const BUBBLE_W = 280;
const BOX = 'rounded-2xl bg-slate-900 text-white shadow-xl px-4 py-3';

function Content({ heading, body, link, onLink, compact, onMore, live }) {
  const tab = live ? undefined : -1;
  return (
    <>
      <p className="font-bold text-sm">{heading}</p>
      {compact && (body || link) && (
        <button type="button" tabIndex={tab} onClick={onMore} className="pointer-events-auto mt-1 min-h-[44px] text-xs font-semibold text-amber-300 underline">
          More
        </button>
      )}
      {!compact && body && <p className="text-xs text-white/80 mt-1 leading-snug">{body}</p>}
      {!compact && link && (
        <button type="button" tabIndex={tab} onClick={onLink} className="pointer-events-auto mt-2 min-h-[44px] text-xs font-semibold text-amber-300 underline">
          {link}
        </button>
      )}
    </>
  );
}

// avoid: selectors of what the bubble must never cover (the step's target cells, the
// cells of the word the step asks for, and its outlined control).
// boardSelector / listSelector: the board and the word list, inside the container.
export default function CoachMark({ containerRef, avoid = [], boardSelector, listSelector, heading, body, link, onLink }) {
  const fullRef = useRef(null);     // hidden copies, measured at the bubble's width
  const compactRef = useRef(null);
  const [pos, setPos] = useState(null);           // { left, top, w, compact }
  const [expanded, setExpanded] = useState(false); // "More" tapped on a compact bubble
  useEffect(() => { setExpanded(false); }, [heading]);
  const key = `${avoid.join('|')}#${heading}#${body}#${link}#${expanded}`;

  const place = useCallback(() => {
    const box = containerRef.current;
    if (!box || !fullRef.current || !compactRef.current) return;
    const b = box.getBoundingClientRect();
    const board = rel(box.querySelector(boardSelector), b);
    if (!board) return;
    const container = { width: b.width, height: b.height };
    const list = rel(box.querySelector(listSelector), b);
    const rects = avoid.flatMap(s => [...box.querySelectorAll(s)]).map(e => rel(e, b));
    const w = Math.min(BUBBLE_W, Math.max(0, b.width - 2 * GAP));
    const tryAt = h => placeBubble({ container, board, list, avoid: rects, bubble: { w, h } });
    const full = tryAt(fullRef.current.offsetHeight);
    if (full) { setPos({ ...full, w, compact: false }); return; }
    const small = tryAt(compactRef.current.offsetHeight);
    // Nothing fits even heading-only: the top-left of the container, as before G2.
    setPos({ ...(small || { left: GAP, top: GAP, where: 'none' }), w, compact: !expanded });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  useRemeasure(containerRef, place);

  const compact = !!pos?.compact && !expanded;
  const width = pos?.w ?? BUBBLE_W;
  const measureStyle = { position: 'absolute', left: 0, top: 0, width, visibility: 'hidden', pointerEvents: 'none' };
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="coach"
      data-coach-bubble=""
      data-coach-where={pos?.where}
      className="pointer-events-none absolute z-30"
      style={{
        margin: 0, // never inherit the container's space-y margin (the SF-66b offset)
        width,
        left: pos?.left ?? 0,
        top: pos?.top ?? 0,
        visibility: pos ? 'visible' : 'hidden',
      }}
    >
      <motion.div
        key={heading}
        className={BOX}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <Content heading={heading} body={body} link={link} onLink={onLink} compact={compact} onMore={() => setExpanded(true)} live />
      </motion.div>
      <div ref={fullRef} aria-hidden="true" className={BOX} style={measureStyle}><Content heading={heading} body={body} link={link} compact={false} /></div>
      <div ref={compactRef} aria-hidden="true" className={BOX} style={measureStyle}><Content heading={heading} body={body} link={link} compact /></div>
    </div>
  );
}
