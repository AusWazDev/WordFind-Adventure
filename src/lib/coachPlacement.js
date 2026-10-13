// Where the tutorial's coach bubble goes (G2, SF-66b): never over the step's target
// cells, the cells of the word the step asks for, or its own outlined control.
// Pure, so every step can be checked at any viewport without a browser.
//
// All rects are { left, top, right, bottom } in the container's coordinates.
//   container  { width, height } of the positioned element the bubble is drawn in
//   board      the board's rect;  list  the word list's rect (may be null)
//   avoid      rects the bubble must not intersect
//   bubble     { w, h } of the bubble at the size being tried
// Order: above the board, then below the board in the word-list area, then over the part
// of the board furthest from what it must avoid. Returns { left, top, where } or null.

export const GAP = 8;
const STEP = 4;

export const intersects = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
const rectAt = (left, top, { w, h }) => ({ left, top, right: left + w, bottom: top + h });
const centreOf = rs => {
  const l = Math.min(...rs.map(r => r.left)), r = Math.max(...rs.map(x => x.right));
  const t = Math.min(...rs.map(x => x.top)), b = Math.max(...rs.map(x => x.bottom));
  return { x: (l + r) / 2, y: (t + b) / 2 };
};

export function placeBubble({ container, board, list, avoid = [], bubble }) {
  const fits = r => r.left >= 0 && r.top >= 0 && r.right <= container.width && r.bottom <= container.height
    && !avoid.some(a => intersects(r, a));
  const maxLeft = Math.max(0, container.width - bubble.w - GAP);
  const aim = avoid.length ? centreOf(avoid) : { x: container.width / 2, y: 0 };
  // Horizontal choices for a band: centred on what it points at, then each edge.
  const lefts = [...new Set([
    Math.max(GAP, Math.min(aim.x - bubble.w / 2, maxLeft)), GAP, maxLeft,
  ].map(Math.round))];

  // 1. Above the board.
  const aboveTop = board.top - GAP - bubble.h;
  for (const left of lefts) {
    const r = rectAt(left, aboveTop, bubble);
    if (fits(r)) return { left, top: aboveTop, where: 'above' };
  }

  // 2. Below the board, in the word-list area (from just under the board down).
  const bottomLimit = Math.max(list ? list.bottom : 0, container.height);
  for (let top = board.bottom + GAP; top + bubble.h <= bottomLimit; top += STEP) {
    for (const left of lefts) {
      const r = rectAt(left, top, bubble);
      if (fits(r)) return { left, top, where: 'list' };
    }
  }

  // 3. Over the board, in the part furthest from what it must avoid.
  const xs = [board.left + GAP, (board.left + board.right - bubble.w) / 2, board.right - GAP - bubble.w];
  const ys = [board.top + GAP, (board.top + board.bottom - bubble.h) / 2, board.bottom - GAP - bubble.h];
  const spots = xs.flatMap(x => ys.map(y => ({ left: Math.round(x), top: Math.round(y) })))
    .filter(p => fits(rectAt(p.left, p.top, bubble)))
    .map(p => {
      // Furthest from the nearest thing it must avoid.
      const cx = p.left + bubble.w / 2, cy = p.top + bubble.h / 2;
      const d = avoid.length
        ? Math.min(...avoid.map(a => Math.hypot(cx - (a.left + a.right) / 2, cy - (a.top + a.bottom) / 2)))
        : Math.hypot(cx - aim.x, cy - aim.y);
      return { ...p, d };
    })
    .sort((a, b) => b.d - a.d);
  if (spots.length) return { left: spots[0].left, top: spots[0].top, where: 'board' };
  return null;
}
