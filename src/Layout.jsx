import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Home, Trophy, BarChart2, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, page: 'Home' },
  { label: 'Leaderboard', icon: Trophy, page: 'Leaderboard' },
  { label: 'Stats', icon: BarChart2, page: 'Stats' },
  { label: 'Settings', icon: Settings, page: 'Settings' },
];

const NAV_ORDER = NAV_ITEMS.map(n => n.page);
const HIDE_NAV_PAGES = ['Game', 'DailyChallenge'];

// Track which tab is "root" for each tab
const TAB_ROOTS = {
  Home: createPageUrl('Home'),
  Leaderboard: createPageUrl('Leaderboard'),
  Stats: createPageUrl('Stats'),
  Settings: createPageUrl('Settings'),
};

// Remember scroll positions per page
const scrollPositions = {};

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV_PAGES.includes(currentPageName);
  const prevPageRef = useRef(currentPageName);
  const mainRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine slide direction
  const prevIdx = NAV_ORDER.indexOf(prevPageRef.current);
  const currIdx = NAV_ORDER.indexOf(currentPageName);
  const direction = currIdx >= prevIdx ? 1 : -1;

  // Apply system dark mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e) => document.documentElement.classList.toggle('dark', e.matches);
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Save/restore scroll position on page change
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.scrollTop = scrollPositions[currentPageName] || 0;

    const onScroll = () => { scrollPositions[currentPageName] = el.scrollTop; };
    el.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      el.removeEventListener('scroll', onScroll);
      prevPageRef.current = currentPageName;
    };
  }, [currentPageName]);

  const handleTabPress = useCallback((page) => {
    const rootUrl = TAB_ROOTS[page];
    if (currentPageName === page) {
      // Already on this tab's root page — scroll to top
      if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to tab root
      navigate(rootUrl);
    }
  }, [currentPageName, navigate]);

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <style>{`
        body {
          padding-top: env(safe-area-inset-top);
          overscroll-behavior: none;
        }
        button, a, [role="button"] {
          -webkit-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .bottom-nav {
          padding-bottom: env(safe-area-inset-bottom);
        }
        .page-content {
          padding-bottom: calc(4rem + env(safe-area-inset-bottom));
        }
      `}</style>

      <main
        ref={mainRef}
        className={`flex-1 overflow-y-auto ${showNav ? 'page-content' : ''}`}
        style={{ position: 'relative' }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPageName}
            custom={direction}
            variants={showNav ? variants : {}}
            initial={showNav ? 'enter' : false}
            animate={showNav ? 'center' : false}
            exit={showNav ? 'exit' : false}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className={`bottom-nav fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-50 transition-transform duration-200 ${showNav ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}>
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map(({ label, icon: Icon, page }) => {
            const isActive = currentPageName === page;
            return (
              <button
                key={page}
                onClick={() => handleTabPress(page)}
                className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-1 h-1 bg-violet-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}