import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Volume2, ArrowLeft, Bell, Trash2, AlertTriangle, CheckCircle2, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { speakPhraseAndWord, unlockAudio } from '@/components/game/voiceUtils';
import { getLocalSettings, saveLocalSettings } from '@/components/game/offlineStorage';
import ReminderSettings from '@/components/game/ReminderSettings';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
}

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getLocalSettings();
    setSettings(s);
    setLoading(false);
  }, []);

  const handleUpdate = (field, value) => {
    if (!settings) return;
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    saveLocalSettings(updated);
    if (field === 'theme') {
      applyTheme(value);
      window.dispatchEvent(new Event('soundfind-theme-changed'));
    }
  };

  const testVoice = async () => {
    if (settings) {
      await unlockAudio();
      speakPhraseAndWord('great_you_found', 'RAIN', 'Great! You found rain!', settings);
    }
  };

  const handleResetData = () => {
    // DEF-23: preserve monetisation values across reset so players cannot
    // exploit the reset button to restore free hints or bypass IAP purchases.
    const adsRemoved      = localStorage.getItem('ads_removed');
    const savedProgress   = JSON.parse(localStorage.getItem('wf_progress') || '{}');
    const hintsRemaining  = savedProgress.hints_remaining ?? 0;

    // Clear all game-progress keys
    ['wf_progress', 'wf_settings', 'wf_daily', 'wf_welcome_seen',
     'games_completed_count', 'last_ad_completed_at'].forEach(key => {
      localStorage.removeItem(key);
    });

    // Restore monetisation values
    if (adsRemoved) localStorage.setItem('ads_removed', adsRemoved);
    localStorage.setItem('wf_progress', JSON.stringify({ hints_remaining: hintsRemaining }));

    toast.success('Game data cleared. Your hints and purchases are preserved.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Auto-saved</span>
          </div>
        </motion.div>

        <div className="space-y-4">

          {/* Audio Settings */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-transparent dark:border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Volume2 className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Audio Settings</h2>
            </div>

            <div className="space-y-4">

              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Voice Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['female', 'male'].map(voice => (
                    <button
                      key={voice}
                      onClick={() => handleUpdate('audio_voice', voice)}
                      className={cn(
                        "py-3 px-3 rounded-lg font-medium transition-all capitalize min-h-[44px]",
                        settings?.audio_voice === voice
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                      )}
                    >
                      {voice}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speech Rate */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Speech Speed: {settings?.audio_rate?.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings?.audio_rate || 0.9}
                  onChange={(e) => handleUpdate('audio_rate', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Voice Pitch */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Voice Pitch: {settings?.audio_pitch?.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings?.audio_pitch || 1}
                  onChange={(e) => handleUpdate('audio_pitch', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Sound Effects Volume */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sound Effects Volume: {Math.round((settings?.sound_effects_volume || 0.8) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings?.sound_effects_volume || 0.8}
                  onChange={(e) => handleUpdate('sound_effects_volume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>Muted</span>
                  <span>Loud</span>
                </div>
              </div>

              {/* Test Voice Button */}
              <Button
                onClick={testVoice}
                variant="outline"
                className="w-full"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Test Voice
              </Button>

            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-transparent dark:border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Appearance</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'default', label: 'Default', desc: 'Follows device' },
                { value: 'light',   label: 'Light',   desc: 'Always light'  },
                { value: 'dark',    label: 'Dark',    desc: 'Always dark'   },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => handleUpdate('theme', value)}
                  className={cn(
                    "py-3 px-2 rounded-lg font-medium transition-all flex flex-col items-center gap-1 min-h-[60px]",
                    settings?.theme === value
                      ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  )}
                >
                  <span className="text-sm font-semibold">{label}</span>
                  <span className={cn("text-xs", settings?.theme === value ? "text-white/80" : "text-slate-500 dark:text-slate-400")}>{desc}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Daily Challenge Reminders */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-transparent dark:border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Bell className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Daily Challenge Reminders</h2>
            </div>
            <ReminderSettings />
          </motion.div>

          {/* About & Legal */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-transparent dark:border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">About</h2>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Developer</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">Unique Interactive Games</span>
              </div>
              <div className="flex justify-between">
                <span>Version</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">1.0.0</span>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <a
                href="https://www.uniquegames.com.au/soundfind/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-violet-600 dark:text-violet-400 hover:underline"
              >
                Privacy Policy →
              </a>
              <a
                href="https://www.uniquegames.com.au/soundfind/terms/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-violet-600 dark:text-violet-400 hover:underline"
              >
                Terms of Service →
              </a>
              <a
                href="https://www.uniquegames.com.au/contact/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-violet-600 dark:text-violet-400 hover:underline"
              >
                Support & Contact →
              </a>
              <a
                href="https://www.uniquegames.com.au"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-violet-600 dark:text-violet-400 hover:underline"
              >
                uniquegames.com.au →
              </a>
            </div>
          </motion.div>

          {/* Reset Game Data */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-xl font-semibold"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Reset Game Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Reset Game Data?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently clear all your game progress, scores, hints and settings stored on this device. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetData}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Yes, Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
