import React, { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { getPlatform, isWindowsApp } from '@/lib/platform';
import { useBackHandler } from '@/lib/backButton';

// CR-146 (SF-92): an always-available tip for players who can't hear the words.
// The app can't detect silent mode or a volume of 0 (SF-90), so the tip is offered
// rather than triggered. In-app only: no link out, no network, works offline.
// Shown by WordList in audio mode only, which covers Audio Challenge and the
// audio-mode Daily ("Sound Check").

export const CANT_HEAR_HEADING = "Can't hear the words?";

export const CANT_HEAR_TEXT = {
  ios:     'Check the volume is up and silent mode is off.',
  android: 'Check the media volume is up.',
  windows: "Check the volume is up, and that SoundFind isn't muted in the volume mixer.",
  web:     'Check your device volume is up.',
};

// Uses the app's existing platform helpers (src/lib/platform.js). The Windows app
// is Electron, where getPlatform() reports 'web', so it is asked first.
export function cantHearPlatform() {
  if (isWindowsApp()) return 'windows';
  const p = getPlatform();
  return p === 'ios' || p === 'android' ? p : 'web';
}

export default function CantHearTip() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const headingId = useId();
  const toggleRef = useRef(null);
  const closeRef = useRef(null);
  const wasOpen = useRef(false);

  // Android Back closes the open tip before it leaves the game (CR-110 rule b).
  useBackHandler('modal', () => setOpen(false), open);

  // Focus moves into the panel when it opens, and back to the link when it closes.
  useEffect(() => {
    if (open) closeRef.current?.focus();
    else if (wasOpen.current) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <div className="mt-3 pt-3 border-t border-border text-center">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="min-h-[44px] px-2 text-xs font-medium text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:text-violet-700"
      >
        {CANT_HEAR_HEADING}
      </button>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }}
          className="relative mt-2 rounded-xl bg-muted p-3 pr-12 text-left"
        >
          <h4 id={headingId} className="text-sm font-semibold text-foreground">{CANT_HEAR_HEADING}</h4>
          <p className="text-sm text-muted-foreground mt-1">{CANT_HEAR_TEXT[cantHearPlatform()]}</p>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute top-0 right-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
