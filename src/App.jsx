import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Toaster } from 'sonner'
import { pagesConfig } from './pages.config'
import { HashRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import * as Sentry from '@sentry/react';
import PageNotFound from './lib/PageNotFound';
import SplashScreen from './components/game/SplashScreen';
import { isNative } from './lib/platform';
import { initAdMob } from './lib/admob';
import { initPurchases } from './lib/purchases';
import { installBackButton } from './lib/backButton';
import { createPageUrl } from './utils';

// Reset #root scroll to top on every page navigation.
// Without this, the new page briefly inherits the previous page's scroll
// position, causing a visible flash/jump on iOS WKWebView.
function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const root = document.getElementById('root');
    if (root) root.scrollTop = 0;
  }, [pathname]);
  return null;
}

// Android Back (SF-65, U7): one listener, installed once, Android only. Its
// priority logic is resolveBack in lib/backButton.js.
export const HOME_PATHS = ['/', '/Home'];
export function BackButtonBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const locRef = useRef(location);
  locRef.current = location;
  useEffect(() => {
    let remove = null;
    let cancelled = false;
    installBackButton(CapApp, {
      goHome: () => navigate(createPageUrl('Home')),
      onHome: () => HOME_PATHS.includes(locRef.current.pathname),
    }).then(r => { if (cancelled) r?.(); else remove = r; });
    return () => { cancelled = true; remove?.(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout
  ? <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (isNative()) {
      initAdMob();
      initPurchases();
    }
  }, []);

  return (
    <Router>
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}
      <ScrollToTop />
      <BackButtonBridge />
      <Routes>
        <Route path="/" element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        } />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </Router>
  );
}

export default Sentry.withProfiler(App);
