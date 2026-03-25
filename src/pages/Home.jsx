import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Volume2, Trophy, Lightbulb, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GameModeSelector from '@/components/game/GameModeSelector';
import CategorySelector from '@/components/game/CategorySelector';
import AudioCategorySelector from '@/components/game/AudioCategorySelector';
import LevelSelector from '@/components/game/LevelSelector';
import DailyChallengeCard from '@/components/game/DailyChallengeCard';
import AdModal from '@/components/game/AdModal';
import RemoveAdsModal from '@/components/game/RemoveAdsModal';
import HowToPlayModal from '@/components/game/HowToPlayModal';
import WelcomeScreen, { hasSeenWelcome } from '@/components/game/WelcomeScreen';
import { createPageUrl } from '@/utils';
import { loadProgress } from '@/components/game/offlineStorage';
import PullToRefresh from '@/components/ui/PullToRefresh';

const AD_FREQUENCY = 3;

export default function Home() {
  const navigate = useNavigate();
  const [step, setStep] = useState('mode');
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [progress, setProgress] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [showRemoveAds, setShowRemoveAds] = useState(false);
  const [pendingGameUrl, setPendingGameUrl] = useState(null);
  const [adsRemoved, setAdsRemoved] = useState(() => localStorage.getItem('ads_removed') === 'true');

  // Onboarding state
  const [showWelcome, setShowWelcome] = useState(() => !hasSeenWelcome());
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    loadProgressData().catch(console.error);
  }, []);

  const loadProgressData = async () => {
    try {
      const p = await loadProgress();
      setProgress(p);
    } catch (err) {
      console.error('SoundFind: failed to load progress', err);
      // Fall back to defaults so the app remains usable
      setProgress({ current_level: 1, total_score: 0, hints_remaining: 3, games_played: 0, words_found: 0 });
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

  const handleSelectLevel = (level) => {
    const url = createPageUrl('Game') + `?mode=${selectedMode}&category=${selectedCategory}&level=${level}`;
    if (adsRemoved) { navigate(url); return; }
    const gameCount = parseInt(localStorage.getItem('game_start_count') || '0') + 1;
    localStorage.setItem('game_start_count', String(gameCount));
    if (gameCount % AD_FREQUENCY === 0) {
      setPendingGameUrl(url);
      setShowAd(true);
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

  return (
    <PullToRefresh onRefresh={loadProgressData}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-4">

          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl shadow-md shadow-violet-200">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Sound<span className="text-violet-600">Find</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* How to Play button — always accessible */}
              <motion.button
                onClick={() => setShowHowToPlay(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                How to Play
              </motion.button>

              {progress && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{progress.total_score || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lightbulb className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{progress.hints_remaining || 3}</span>
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
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
        <HowToPlayModal
          isOpen={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
        />
      </div>

      {/* Welcome screen — shown once on first launch, renders over everything */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomeScreen
            onDone={() => setShowWelcome(false)}
            onShowHowToPlay={() => {
              setShowWelcome(false);
              setShowHowToPlay(true);
            }}
          />
        )}
      </AnimatePresence>
    </PullToRefresh>
  );
}
