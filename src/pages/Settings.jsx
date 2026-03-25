import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { Volume2, Palette, Target, Sparkles, Save, Bell, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { speakText } from '@/components/game/voiceUtils';
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

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const s = getLocalSettings();
    setSettings(s);
    setLoading(false);
  };

  const handleUpdate = (field, value) => {
    if (!settings) return;
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    saveLocalSettings(updated);
  };

  const testVoice = () => {
    if (settings) {
      speakText("Hello! This is how I will sound in the game. Great job finding those words!", settings);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    toast.success('Settings saved successfully!');
    setSaving(false);
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    toast.success('All game data deleted.');
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
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
        </motion.div>

        <div className="space-y-4">
          {/* Game Preferences */}
          <motion.div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-transparent dark:border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Target className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Game Preferences</h2>
            </div>

            <div className="space-y-4">
              {/* Default Difficulty */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Default Difficulty Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(level => (
                    <button
                      key={level}
                      onClick={() => handleUpdate('default_difficulty', level)}
                      className={cn(
                        "py-3 px-3 rounded-lg font-medium transition-all min-h-[44px]",
                        settings?.default_difficulty === level
                          ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                      )}
                    >
                      {['Easy', 'Medium', 'Hard', 'Expert'][level - 1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Preferred Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['random', 'animals', 'food', 'nature', 'colors', 'sports'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleUpdate('preferred_category', cat)}
                      className={cn(
                        "py-3 px-3 rounded-lg font-medium transition-all capitalize min-h-[44px]",
                        settings?.preferred_category === cat
                          ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

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
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg"
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

              {/* Test Voice Button */}
              <Button
                onClick={testVoice}
                variant="outline"
                className="w-full"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Test Voice
              </Button>

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
            </div>
          </motion.div>

          {/* Reminder Settings */}
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

          {/* Theme Settings */}
          <motion.div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-transparent dark:border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Palette className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Theme</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'default', name: 'Default', colors: 'from-violet-400 to-indigo-500' },
                { id: 'dark', name: 'Dark', colors: 'from-slate-700 to-slate-900' },
                { id: 'ocean', name: 'Ocean', colors: 'from-blue-400 to-cyan-500' },
                { id: 'forest', name: 'Forest', colors: 'from-green-400 to-emerald-600' }
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => handleUpdate('theme', theme.id)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all min-h-[44px]",
                    settings?.theme === theme.id
                      ? "border-violet-500 shadow-lg"
                      : "border-slate-200 dark:border-slate-600 hover:border-violet-300"
                  )}
                >
                  <div className={cn(
                    "w-full h-12 rounded-lg bg-gradient-to-r mb-2",
                    theme.colors
                  )} />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{theme.name}</p>
                  {settings?.theme === theme.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-xl font-semibold"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Saving...' : 'All Changes Auto-Saved'}
            </Button>
          </motion.div>

          {/* Delete Account */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-xl font-semibold"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Delete Account?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your game progress, settings, and account data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Yes, Delete Everything
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