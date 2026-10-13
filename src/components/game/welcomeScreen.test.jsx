// @vitest-environment jsdom
// SF-63 (S42): the welcome's demo board, audio, buttons and offline chip.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const platform = vi.hoisted(() => ({ native: false }));
vi.mock('@/lib/platform', () => ({ isNative: () => platform.native, getPlatform: () => (platform.native ? 'android' : 'web') }));
const voice = vi.hoisted(() => ({ calls: [] }));
vi.mock('@/components/game/voiceUtils', () => ({
  unlockAudio: vi.fn(async () => { voice.calls.push('unlockAudio'); }),
  speakWordAudio: vi.fn(async (...a) => { voice.calls.push(['speakWordAudio', ...a]); }),
  speakSentenceAudio: vi.fn(async () => { voice.calls.push('speakSentenceAudio'); }),
  preloadGameAudio: vi.fn((...a) => { voice.calls.push(['preloadGameAudio', ...a]); }),
  stopAllAudio: vi.fn(() => { voice.calls.push('stopAllAudio'); }),
}));

const W = await import('./WelcomeScreen');
const { default: WelcomeScreen, DEMO_CELLS, DEMO_STEP_MS } = W;

let reduced = false;
let container, root;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  reduced = false; platform.native = false; voice.calls = [];
  localStorage.clear();
  window.matchMedia = q => ({ matches: reduced && /prefers-reduced-motion: reduce/.test(q), addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 jsdom', configurable: true });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.useRealTimers(); });

const render = (props = {}) => act(async () => root.render(<WelcomeScreen onShowMeHow={vi.fn()} onSkip={vi.fn()} {...props} />));
const advance = ms => act(async () => { vi.advanceTimersByTime(ms); });
const cell = col => container.querySelector(`[data-row="2"][data-col="${col}"]`);
const selectedCount = () => DEMO_CELLS.filter(c => cell(c.col).className.includes('from-violet-500')).length;
const foundCount = () => DEMO_CELLS.filter(c => cell(c.col).className.includes('from-emerald-400')).length;
const button = text => [...container.querySelectorAll('button')].find(b => b.textContent.trim() === text || b.getAttribute('aria-label') === text);
const RUN = DEMO_STEP_MS * (DEMO_CELLS.length + 1);

describe('the demo board (SF-63)', () => {
  it('highlights KNIGHT one cell at a time, then shows it found; it plays once', async () => {
    await render();
    expect(container.querySelectorAll('[data-row]').length, 'control: a 6×6 board').toBe(36);
    expect(selectedCount()).toBe(0);
    for (let i = 1; i <= DEMO_CELLS.length; i++) {
      await advance(DEMO_STEP_MS);
      expect(selectedCount(), `after step ${i}`).toBe(i);
    }
    await advance(DEMO_STEP_MS);
    expect(foundCount()).toBe(6);
    expect(selectedCount()).toBe(0);
    await advance(RUN * 3); // no loop: it stays found
    expect(foundCount()).toBe(6);
    expect(selectedCount()).toBe(0);
  });

  it('a tap on the board replays it', async () => {
    await render();
    await advance(RUN);
    expect(foundCount()).toBe(6);
    await act(async () => { button('Replay the demo').click(); });
    expect(foundCount()).toBe(0);
    await advance(DEMO_STEP_MS * 3);
    expect(selectedCount()).toBe(3);
    await advance(RUN);
    expect(foundCount()).toBe(6);
  });

  it('under reduced motion: KNIGHT is found at once, with no step-by-step highlight', async () => {
    reduced = true;
    await render();
    expect(foundCount()).toBe(6);
    await advance(DEMO_STEP_MS);
    expect(selectedCount()).toBe(0);
  });
});

describe('audio and buttons (SF-63)', () => {
  it('preloads KNIGHT on arrival and plays nothing by itself', async () => {
    await render();
    await advance(RUN);
    expect(voice.calls).toEqual([['preloadGameAudio', ['KNIGHT'], expect.any(Object)]]);
  });

  it('"Hear it" unlocks audio, then plays KNIGHT through speakWordAudio with the current settings', async () => {
    localStorage.setItem('wf_settings', JSON.stringify({ audio_voice: 'male' }));
    await render();
    voice.calls = [];
    await act(async () => { button('Hear the word KNIGHT').click(); });
    expect(voice.calls).toEqual(['unlockAudio', ['speakWordAudio', 'KNIGHT', expect.objectContaining({ audio_voice: 'male' })]]);
    expect(button('Hear the word KNIGHT').textContent.trim()).toBe('Hear it');
  });

  for (const [label, prop] of [['Show me how', 'onShowMeHow'], ['Skip, just play', 'onSkip']]) {
    it(`"${label}" stops audio, marks the welcome seen, and hands over`, async () => {
      const handler = vi.fn();
      await render({ [prop]: handler });
      voice.calls = [];
      await act(async () => { button(label).click(); });
      expect(voice.calls).toEqual(['stopAllAudio']);
      expect(localStorage.getItem('wf_welcome_seen')).toBe('true');
      expect(handler).toHaveBeenCalledTimes(1);
    });
  }
});

describe('the offline chip (SF-63)', () => {
  const chips = () => [...container.querySelectorAll('span.rounded-full')].map(s => s.textContent);
  it('native: "Works offline"', async () => {
    platform.native = true;
    await render();
    expect(chips()).toEqual(['5 game modes', 'Natural voices', 'Works offline']);
  });
  it('Windows (Electron): "Works offline"', async () => {
    Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 Electron/41.3.0', configurable: true });
    await render();
    expect(chips()[2]).toBe('Works offline');
  });
  it('web: "Most modes work offline"', async () => {
    await render();
    expect(chips()[2]).toBe('Most modes work offline');
  });
});
