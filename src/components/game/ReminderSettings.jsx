import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function TimeSelector({ value, onChange }) {
  const [hours, minutes] = value.split(':').map(Number);

  const pad = (n) => String(n).padStart(2, '0');

  const adjustHours = (delta) => {
    const newH = (hours + delta + 24) % 24;
    onChange(`${pad(newH)}:${pad(minutes)}`);
  };
  const adjustMinutes = (delta) => {
    const newM = (minutes + delta + 60) % 60;
    onChange(`${pad(hours)}:${pad(newM)}`);
  };

  const btnClass = "flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors";

  return (
    <div className="flex items-center gap-3">
      {/* Hours */}
      <div className="flex flex-col items-center gap-1">
        <button onClick={() => adjustHours(1)} className={btnClass}><ChevronUp className="w-4 h-4" /></button>
        <div className="w-14 h-12 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-xl font-bold text-slate-800 dark:text-slate-100 select-none">
          {pad(hours)}
        </div>
        <button onClick={() => adjustHours(-1)} className={btnClass}><ChevronDown className="w-4 h-4" /></button>
      </div>
      <span className="text-2xl font-bold text-slate-500 dark:text-slate-400 mb-0.5">:</span>
      {/* Minutes */}
      <div className="flex flex-col items-center gap-1">
        <button onClick={() => adjustMinutes(5)} className={btnClass}><ChevronUp className="w-4 h-4" /></button>
        <div className="w-14 h-12 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-xl font-bold text-slate-800 dark:text-slate-100 select-none">
          {pad(minutes)}
        </div>
        <button onClick={() => adjustMinutes(-5)} className={btnClass}><ChevronDown className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

const STORAGE_KEY = 'wordfind_reminder';

function getStoredReminder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { enabled: false, time: '09:00' };
  } catch {
    return { enabled: false, time: '09:00' };
  }
}

function saveReminder(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Schedules a notification for the next occurrence of the given HH:MM time
function scheduleNextNotification(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();

  // Clear any existing timer
  const existingId = parseInt(localStorage.getItem('wordfind_reminder_timer'));
  if (!isNaN(existingId)) clearTimeout(existingId);

  const timerId = setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification("⏰ WordFind Daily Challenge!", {
        body: "Your daily challenge is waiting — keep your streak alive! 🔥",
        icon: "/favicon.ico",
      });
    }
    // Reschedule for tomorrow
    scheduleNextNotification(time);
  }, delay);

  localStorage.setItem('wordfind_reminder_timer', String(timerId));
}

export default function ReminderSettings() {
  const [reminder, setReminder] = useState(getStoredReminder);
  const [permissionState, setPermissionState] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
    // Re-schedule if reminder is still enabled on mount
    const stored = getStoredReminder();
    if (stored.enabled && Notification.permission === 'granted') {
      scheduleNextNotification(stored.time);
    }
  }, []);

  const handleToggle = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser.');
      return;
    }

    if (!reminder.enabled) {
      // Request permission
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      if (permission !== 'granted') {
        toast.error('Please allow notifications in your browser to set reminders.');
        return;
      }
      const updated = { ...reminder, enabled: true };
      setReminder(updated);
      saveReminder(updated);
      scheduleNextNotification(reminder.time);
      toast.success(`Daily reminder set for ${reminder.time}!`);
    } else {
      const updated = { ...reminder, enabled: false };
      setReminder(updated);
      saveReminder(updated);
      const existingId = parseInt(localStorage.getItem('wordfind_reminder_timer'));
      if (!isNaN(existingId)) clearTimeout(existingId);
      toast.info('Daily reminder disabled.');
    }
  };

  const handleTimeChange = (newTime) => {
    const updated = { ...reminder, time: newTime };
    setReminder(updated);
    saveReminder(updated);
    if (reminder.enabled && Notification.permission === 'granted') {
      scheduleNextNotification(newTime);
      toast.success(`Reminder updated to ${newTime}`);
    }
  };

  const notificationsBlocked = permissionState === 'denied';

  return (
    <div className="space-y-4">
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Daily Reminder</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {notificationsBlocked
              ? 'Blocked — enable notifications in browser settings'
              : reminder.enabled
              ? `Reminder set for ${reminder.time} every day`
              : 'Get notified to play the daily challenge'}
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={notificationsBlocked}
          className={cn(
            "relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40",
            reminder.enabled ? "bg-violet-600" : "bg-slate-300"
          )}
        >
          <span className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
            reminder.enabled ? "translate-x-6" : "translate-x-0"
          )} />
        </button>
      </div>

      {/* Time picker — only shown when enabled */}
      {reminder.enabled && !notificationsBlocked && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reminder Time</label>
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 px-3 py-1.5 rounded-xl">
              <Check className="w-3 h-3" /> Active
            </span>
          </div>
          <TimeSelector value={reminder.time} onChange={handleTimeChange} />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            You'll be notified at this time every day while the app is open.
          </p>
        </div>
      )}

      {/* Blocked state hint */}
      {notificationsBlocked && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-700">
          <BellOff className="w-4 h-4 shrink-0" />
          Notifications are blocked. Please allow them in your browser's site settings, then come back here.
        </div>
      )}
    </div>
  );
}