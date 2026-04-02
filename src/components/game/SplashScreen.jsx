import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

// ── SplashScreen ──────────────────────────────────────────────────────────────
// Shows on every cold app launch. Sequence:
//   - Background is IMMEDIATELY opaque (blocks Home from showing through)
//   - Content fades in over 400ms
//   - Hold 2000ms
//   - Entire splash fades out 300ms → onComplete → Home takes over
// Design mirrors the approved CR-19 mockup.
// ─────────────────────────────────────────────────────────────────────────────

const FADE_IN_MS  = 400;
const HOLD_MS     = 2000;
const FADE_OUT_MS = 300;

export default function SplashScreen({ onComplete }) {
  const overlayControls = useAnimation();  // controls the whole overlay (fade out)
  const contentControls = useAnimation();  // controls just the content (fade in)

  useEffect(() => {
    let cancelled = false;

    async function runSequence() {
      // Content fades in — background is already fully opaque
      await contentControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: FADE_IN_MS / 1000, ease: 'easeOut' },
      });
      if (cancelled) return;

      // Hold
      await new Promise(resolve => setTimeout(resolve, HOLD_MS));
      if (cancelled) return;

      // Entire overlay fades out (content + background together)
      await overlayControls.start({
        opacity: 0,
        transition: { duration: FADE_OUT_MS / 1000, ease: 'easeIn' },
      });
      if (cancelled) return;

      onComplete();
    }

    runSequence();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    // Outer div — immediately opaque, blocks Home, fades out at the end
    <motion.div
      initial={{ opacity: 1 }}
      animate={overlayControls}
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          9999,
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        background:      'linear-gradient(160deg, #0f0e1a 0%, #1a1830 100%)',
        userSelect:      'none',
        WebkitUserSelect:'none',
      }}
    >
      {/* Soft radial glow behind the icon */}
      <div style={{
        position: 'absolute',
        width:  '70vmin',
        height: '70vmin',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Content — fades in over 400ms */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={contentControls}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {/* Icon */}
        <img
          src="/icon.png"
          alt="SoundFind"
          style={{
            width:        '40vmin',
            height:       '40vmin',
            borderRadius: 'calc(40vmin * 0.2237)',
            boxShadow:    '0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
            display:      'block',
            marginBottom: 'calc(40vmin * 0.10)',
          }}
        />

        {/* App name — "Sound" white, "Find" violet */}
        <div style={{
          fontSize:      'clamp(28px, 11.5vmin, 52px)',
          fontWeight:    700,
          fontFamily:    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
          letterSpacing: '-0.02em',
          lineHeight:    1,
          marginBottom:  '2.4vmin',
          textShadow:    '0 2px 12px rgba(0,0,0,0.4)',
        }}>
          <span style={{ color: '#ffffff' }}>Sound</span>
          <span style={{ color: '#a78bfa' }}>Find</span>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize:      'clamp(12px, 4.2vmin, 18px)',
          fontWeight:    400,
          fontFamily:    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
          color:         'rgba(196,181,253,0.72)',
          letterSpacing: '0.01em',
          marginBottom:  '10vmin',
        }}>
          Find the words. Feel the sound.
        </div>

        {/* Loader dots */}
        <div style={{ display: 'flex', gap: '2vmin', alignItems: 'center' }}>
          {[0.3, 0.5, 0.7].map((opacity, i) => (
            <div
              key={i}
              style={{
                width:        'clamp(6px, 1.4vmin, 10px)',
                height:       'clamp(6px, 1.4vmin, 10px)',
                borderRadius: '50%',
                background:   `rgba(167,139,250,${opacity})`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
