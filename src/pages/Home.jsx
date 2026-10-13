import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Trophy, Lightbulb, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GameModeSelector from '@/components/game/GameModeSelector';
import CategorySelector from '@/components/game/CategorySelector';
import AudioCategorySelector from '@/components/game/AudioCategorySelector';
import LevelSelector from '@/components/game/LevelSelector';
import DailyChallengeCard from '@/components/game/DailyChallengeCard';
import AdModal from '@/components/game/AdModal';
import RemoveAdsModal from '@/components/game/RemoveAdsModal';
import { isNative } from '@/lib/platform';
import { showInterstitialBeforeGame, interstitialDue, markInterstitialShown } from '@/lib/adCadence';
import WelcomeScreen from '@/components/game/WelcomeScreen';
import { useWelcomeDue, settleWelcomeForPlayers, hasSeenWelcome, hasPlayed } from '@/lib/welcome';
import { hasDoneTutorial, TUTORIAL_FIRST, TUTORIAL_REPLAY } from '@/lib/tutorial';

// "Skip, just play" starts Standard level 1 here. Home's category picker has no
// preselected option; Random is its first and catch-all choice (CategorySelector), and
// draws from every category, as a null category does (SF-63).
export const WELCOME_SKIP_START = { mode: 'standard', category: 'random', level: 1 };
import { createPageUrl } from '@/utils';
import { HIT_FROM_28 } from '@/lib/touchTarget';
import { useBackHandler } from '@/lib/backButton';
import { loadProgress, getLocalProgress } from '@/components/game/offlineStorage';
import { PROGRESS_CHANGED_EVENT } from '@/lib/hintLedger';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function Home() {
  const navigate = useNavigate();
  const [step, setStep] = useState('mode');
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  // The saved progress on the first render, so the header chip is there from the
  // first frame (FB-2, CR-75); the effect below still seeds it when there is none.
  const [progress, setProgress] = useState(() => getLocalProgress()
    ?? { current_level: 1, total_score: 0, hints_remaining: 12, games_played: 0, words_found: 0 });
  const [showAd, setShowAd] = useState(false);
  const [showRemoveAds, setShowRemoveAds] = useState(false);
  const [pendingGameUrl, setPendingGameUrl] = useState(null);
  const [adsRemoved, setAdsRemoved] = useState(() => localStorage.getItem('ads_removed') === 'true');
  const isOnline = useOnlineStatus();

  // Onboarding state. The welcome is due for a new player only (S42, SF-63); a player
  // with games played who never saw it has it marked seen, quietly.
  const welcomeDue = useWelcomeDue();
  const location = useLocation();
  // The tutorial's first run ends by asking Home to start the first puzzle, so that it
  // goes through startLevel without the tutorial importing any ad or progress code (S43).
  const startFirstPuzzle = !!location.state?.startFirstPuzzle;
  // Resume: a player who saw the welcome but has neither finished the tutorial nor a
  // game goes back to the tutorial's first run. A player with games played never does.
  const resumeTutorial = !welcomeDue && !startFirstPuzzle && hasSeenWelcome() && !hasDoneTutorial() && !hasPlayed();

  useEffect(() => {
    settleWelcomeForPlayers();
    loadProgressData().catch(console.error);
  }, []);

  useEffect(() => {
    if (!startFirstPuzzle) return;
    navigate(location.pathname, { replace: true, state: null }); // so Back never restarts it
    startLevel(WELCOME_SKIP_START.mode, WELCOME_SKIP_START.category, WELCOME_SKIP_START.level);
  }, [startFirstPuzzle]); // eslint-disable-line react-hooks/exhaustive-deps

  // A reconcile credit (S40-C, SF-50) updates the hint count shown here.
  useEffect(() => {
    const reread = () => { const p = getLocalProgress(); if (p) setProgress(p); };
    window.addEventListener(PROGRESS_CHANGED_EVENT, reread);
    return () => window.removeEventListener(PROGRESS_CHANGED_EVENT, reread);
  }, []);

  const loadProgressData = async () => {
    try {
      const p = await loadProgress();
      setProgress(p);
    } catch (err) {
      console.error('SoundFind: failed to load progress', err);
      // Fall back to defaults so the app remains usable
      setProgress({ current_level: 1, total_score: 0, hints_remaining: 12, games_played: 0, words_found: 0 });
    }
  };

  const handleSelectMode = (mode) => {
    setSelectedMode(mode);
    setStep('category');
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setStep('level');
  };

  // The one way a game starts from Home: the level picker and the welcome's
  // "Skip, just play" both call it, so ads, progress and hints behave the same (SF-63).
  const handleSelectLevel = (level) => startLevel(selectedMode, selectedCategory, level);

  const startLevel = async (mode, category, level) => {
    const url = createPageUrl('Game') + `?mode=${mode}&category=${category}&level=${level}`;
    if (adsRemoved || !isOnline) { navigate(url); return; } // skip ad if offline or ads removed
    // CR-15: Gate ads on completed games, not game starts. The cadence lives in
    // src/lib/adCadence.js (S41, SF-52), shared with every other start path.
    if (isNative()) {
      await showInterstitialBeforeGame({ adsRemoved, isOnline }); // resolves on dismiss, or at once if none is due
      navigate(url);
    } else if (interstitialDue({ adsRemoved, isOnline })) {
      markInterstitialShown();
      setPendingGameUrl(url);
      setShowAd(true); // web / Electron fallback: React AdModal
    } else {
      navigate(url);
    }
  };

  const handleAdClosed = () => {
    setShowAd(false);
    if (pendingGameUrl) { navigate(pendingGameUrl); setPendingGameUrl(null); }
  };

  const handleRemoveAdsSuccess = () => {
    localStorage.setItem('ads_removed', 'true');
    setAdsRemoved(true);
    setShowAd(false);
    if (pendingGameUrl) { navigate(pendingGameUrl); setPendingGameUrl(null); }
  };

  const backLabel = step === 'level' ? '← Back to categories' : '← Back to modes';
  const backStep  = step === 'level' ? 'category' : 'mode';
  // Android Back (SF-66): with the picker past its first stage, Back does what the
  // picker's own back button does (rule f, a 'page' handler); at the mode stage
  // nothing is registered, so Home minimises (rule g).
  useBackHandler('page', () => setStep(backStep), step !== 'mode');

  const adModals = (
    <>
      <AdModal
        isOpen={showAd}
        onClose={handleAdClosed}
        onRemoveAds={() => { setShowAd(false); setShowRemoveAds(true); }}
      />
      <RemoveAdsModal
        isOpen={showRemoveAds}
        onClose={() => setShowRemoveAds(false)}
        onSuccess={handleRemoveAdsSuccess}
      />
    </>
  );

  // The welcome renders INSTEAD of Home (S42, SF-63): none of Home's own content is
  // mounted, and Layout leaves out the blurred bottom nav while it is due. The ad
  // modals stay, so "Skip, just play" behaves exactly like a level choice.
  if (resumeTutorial) return <Navigate to={TUTORIAL_FIRST} replace />;
  if (startFirstPuzzle) return adModals; // starting the first puzzle; nothing else to show

  if (welcomeDue) {
    return (
      <>
        <WelcomeScreen
          onShowMeHow={() => navigate(TUTORIAL_FIRST)}
          onSkip={() => startLevel(WELCOME_SKIP_START.mode, WELCOME_SKIP_START.category, WELCOME_SKIP_START.level)}
        />
        {adModals}
      </>
    );
  }

  return (
    <PullToRefresh onRefresh={loadProgressData}>
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-lg md:max-w-2xl mx-auto px-4 pt-5 pb-4">

          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-3">
              <img
                src="/icon.png"
                alt="SoundFind"
                style={{
                  width: '40px', height: '40px',
                  borderRadius: 'calc(40px * 0.2237)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  display: 'block',
                }}
              />
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Sound<span className="text-violet-600">Find</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* How to Play: opens the guided first game in replay mode (S43, SF-64) */}
              <motion.button
                onClick={() => navigate(TUTORIAL_REPLAY)}
                aria-label="How to Play"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-sm hover:shadow-md transition-all ${HIT_FROM_28}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">How to Play</span>
              </motion.button>

              {progress && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{progress.total_score || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lightbulb className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{progress.hints_remaining ?? 12}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Daily Challenge */}
          {step === 'mode' && <DailyChallengeCard />}

          {/* Main card */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-4 md:p-6 border border-transparent dark:border-slate-700"
          >
            {step !== 'mode' && (
              <Button
                variant="ghost"
                className="mb-4 -ml-2"
                onClick={() => setStep(backStep)}
              >
                {backLabel}
              </Button>
            )}

            {step === 'mode' && (
              <GameModeSelector onSelectMode={handleSelectMode} />
            )}

            {step === 'category' && selectedMode === 'audio' && (
              <AudioCategorySelector onSelectCategory={handleSelectCategory} />
            )}

            {step === 'category' && selectedMode !== 'audio' && (
              <CategorySelector onSelectCategory={handleSelectCategory} />
            )}

            {step === 'level' && (
              <LevelSelector
                currentLevel={progress?.current_level || 1}
                onSelectLevel={handleSelectLevel}
              />
            )}
          </motion.div>

        </div>

        {adModals}
      </div>
    </PullToRefresh>
  );
}
