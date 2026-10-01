import React, { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, BarChart2, Settings } from 'lucide-react';
import { getLocalSettings } from '@/components/game/offlineStorage';

// CR-66 (decision S3): the Leaderboard tab is removed.
const NAV_ITEMS = [
  { label: 'Home', icon: Home, page: 'Home' },
  { label: 'Stats', icon: BarChart2, page: 'Stats' },
  { label: 'Settings', icon: Settings, page: 'Settings' },
];

const HIDE_NAV_PAGES = ['Game', 'DailyChallenge'];

// Track which tab is "root" for each tab
const TAB_ROOTS = {
  Home: createPageUrl('Home'),
  Stats: createPageUrl('Stats'),
  Settings: createPageUrl('Settings'),
};

// Remember scroll positions per page
const scrollPositions = {};

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV_PAGES.includes(currentPageName);
  const mainRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Apply theme — reads user preference (default/light/dark), falls back to system
  useEffect(() => {
    function applyTheme() {
      const theme = getLocalSettings().theme || 'default';
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // 'default' — follow system preference
        root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    }
    applyTheme();
    // Re-apply when Settings page changes the theme
    window.addEventListener('soundfind-theme-changed', applyTheme);
    return () => window.removeEventListener('soundfind-theme-changed', applyTheme);
  }, []);

  // Save/restore scroll position on page change. A layout effect, so the
  // restored position is in place before the first paint (FB-2, CR-75).
  useLayoutEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.scrollTop = scrollPositions[currentPageName] || 0;

    const onScroll = () => { scrollPositions[currentPageName] = el.scrollTop; };
    el.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      el.removeEventListener('scroll', onScroll);
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
        {/* FB-2 (CR-75): pages render directly, with no page-level slide; the old
            wait-for-exit page transition left a blank frame on every tab change. */}
        {children}
      </main>

      {/* The nav bar shows and hides instantly, in step with page-content's padding. */}
      <nav className={`bottom-nav fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-50 ${showNav ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}>
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