// Android Back (U7, SF-65). One listener, registered once at app level, on Android only.
// Screens say what Back means for them by registering a handler while it applies
// (useBackHandler); resolveBack picks one by priority. It imports only the App plugin and
// the platform helpers, so it reaches no ad, hint or progress code.
import { useEffect, useRef } from 'react';
import { isNative, getPlatform } from '@/lib/platform';

// Priority, first match wins (SF-65 rules a to g):
//   a) a native ad or purchase screen is up  -> nothing
//   b) 'modal'    -> its own close function
//   c) 'game'     -> the header Back function (Game, Daily, during play)
//   d) 'victory'  -> Home, no ad (the end screen's Home path)
//   e) 'tutorial' -> as Skip, but to Home
//   f) 'page'     -> the page's own Back control, or Home when it has none
//   g) Home or the welcome -> minimise the app
export const KINDS = ['modal', 'game', 'victory', 'tutorial', 'page'];

export function resolveBack({ nativeScreenUp = false, handlers = [], onHome = false }) {
  if (nativeScreenUp) return { action: 'none', rule: 'a' };
  for (const [kind, rule] of [['modal', 'b'], ['game', 'c'], ['victory', 'd'], ['tutorial', 'e'], ['page', 'f']]) {
    const top = [...handlers].reverse().find(h => h.kind === kind); // the most recent of that kind
    if (top) return { action: 'handler', rule, handler: top.handler };
  }
  if (onHome) return { action: 'minimize', rule: 'g' };
  return { action: 'home', rule: 'f' };
}

// ── The registry ───────────────────────────────────────────────────────────
const handlers = [];
export const registeredHandlers = () => handlers.slice();

export function registerBack(kind, handler) {
  if (!KINDS.includes(kind)) throw new Error(`unknown Back kind: ${kind}`);
  const entry = { kind, handler };
  handlers.push(entry);
  return () => { const i = handlers.indexOf(entry); if (i >= 0) handlers.splice(i, 1); };
}

// Registers `handler` for `kind` while `active`. The latest handler is always called,
// so a component need not memoise it.
export function useBackHandler(kind, handler, active = true) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => (active ? registerBack(kind, () => ref.current()) : undefined), [kind, active]);
}

// ── The single listener ────────────────────────────────────────────────────
export const isAndroidApp = () => isNative() && getPlatform() === 'android';

let installed = null;
// Installs the listener once, on Android only (a no-op on iOS, web and Electron).
// nav: { goHome(), onHome() } from the router. Returns a remove function, or null.
export async function installBackButton(App, nav) {
  if (!isAndroidApp() || installed) return null;
  installed = 'pending'; // claimed before the first await, so a second call cannot install twice
  let appActive = true;
  // When a native screen (an AdMob interstitial, a Play purchase sheet) is in front,
  // MainActivity is paused and Android sends Back to that screen, not to us. Tracking
  // the app's active state ignores any Back that still arrives meanwhile (rule a).
  const stateSub = await App.addListener('appStateChange', ({ isActive }) => { appActive = isActive; });
  const backSub = await App.addListener('backButton', () => {
    const r = resolveBack({ nativeScreenUp: !appActive, handlers, onHome: nav.onHome() });
    if (r.action === 'handler') r.handler();
    else if (r.action === 'home') nav.goHome();
    else if (r.action === 'minimize') App.minimizeApp();
  });
  installed = () => { stateSub.remove(); backSub.remove(); installed = null; };
  return installed;
}

// Tests only: clears the registry and the installed listener's claim.
export const __resetBackButton = () => { installed = null; handlers.length = 0; };
