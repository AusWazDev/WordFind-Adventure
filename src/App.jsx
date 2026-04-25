import { useState } from 'react';
import { Toaster } from 'sonner'
import { pagesConfig } from './pages.config'
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import PageNotFound from './lib/PageNotFound';
import SplashScreen from './components/game/SplashScreen';

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
