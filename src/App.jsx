import { useState, useEffect, useLayoutEffect } from 'react';
import { Toaster } from 'sonner'
import { pagesConfig } from './pages.config'
import { HashRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import PageNotFound from './lib/PageNotFound';
import SplashScreen from './components/game/SplashScreen';

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

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout
  ? <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}
      <ScrollToTop />
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
