// @vitest-environment jsdom
// CR-146 (SF-92): the "Can't hear the words?" tip. The app can't detect silent mode
// or a volume of 0 (SF-90), so an always-available tip sits under the word list in
// audio mode: Audio Challenge, and the audio-mode Daily ("Sound Check"). Each
// platform gets its own text, chosen by the existing helpers in src/lib/platform.js
// (mocked here; the real Game, DailyChallenge, WordList and tip are driven).
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const platform = vi.hoisted(() => ({ name: 'ios', windows: false }));
vi.mock('@/lib/platform', () => ({
  isWindowsApp: () => platform.windows,
  isNative: () => !platform.windows && platform.name !== 'web',
  getPlatform: () => platform.name,
}));
vi.mock('@capacitor-community/admob', async () => (await import('@/lib/admobPluginMock.testutil')).admobModule);
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), captureMessage: vi.fn(), addBreadcrumb: vi.fn() }));
vi.mock('@/lib/purchases', () => ({
  purchaseProduct: vi.fn(), restorePurchases: vi.fn(), usePrice: () => null, useLowestPrice: () => null, getPrice: () => null,
  PURCHASE_OPTIONS: [], HINT_PACK_MAP: {}, REMOVE_ADS_PRODUCT_ID: 'x',
}));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
vi.mock('canvas-confetti', () => ({ default: Object.assign(vi.fn(), { reset: vi.fn() }) }));
vi.mock('@/components/game/voiceUtils', () => ({
  speakPhraseAndWord: vi.fn(), speakFixedPhrase: vi.fn(), unlockAudio: vi.fn(async () => {}),
  preloadGameAudio: vi.fn(), stopAllAudio: vi.fn(), speakWordAudio: vi.fn(), speakSentenceAudio: vi.fn(),
}));
vi.mock('@/components/game/GameBoard', () => ({ default: () => <div data-testid="board" /> }));
const daily = vi.hoisted(() => ({ template: null }));
vi.mock('@/components/game/DailyChallengeUtils', async importOriginal => {
  const actual = await importOriginal();
  return { ...actual, getDailyChallengeConfig: () => ({ ...(daily.template || actual.getDailyChallengeConfig()), date: '2026-11-24' }) };
});

const { CHALLENGE_TEMPLATES } = await import('@/components/game/DailyChallengeUtils');
const { default: Game } = await import('@/pages/Game');
const { default: DailyChallenge } = await import('@/pages/DailyChallenge');

const LINK = "Can't hear the words?";
const TEXT = {
  ios:     'Check the volume is up and silent mode is off.',
  android: 'Check the media volume is up.',
  windows: "Check the volume is up, and that SoundFind isn't muted in the volume mixer.",
  web:     'Check your device volume is up.',
};

let container, root;
const sleep = ms => act(async () => { await new Promise(r => setTimeout(r, ms)); });
async function mount(entry, element) {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  await act(async () => { root.render(<MemoryRouter initialEntries={[entry]}><Routes><Route path="*" element={element} /></Routes></MemoryRouter>); });
  await sleep(50);
}
const playGame = mode => mount(`/Game?mode=${mode}&level=1&category=animals`, <Game />);
const links = () => [...container.querySelectorAll('button')].filter(b => b.textContent === LINK);
const link = () => links()[0];
const panel = () => document.getElementById(link().getAttribute('aria-controls'));
const click = el => act(async () => { el.click(); });

const realRect = Element.prototype.getBoundingClientRect;
beforeEach(() => {
  platform.name = 'ios'; platform.windows = false; daily.template = null;
  Element.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 400, bottom: 400, width: 400, height: 400, toJSON() {} });
  localStorage.clear();
  localStorage.setItem('wf_welcome_seen', 'true'); localStorage.setItem('wf_tutorial_done', 'true'); localStorage.setItem('ads_removed', 'true');
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});
afterEach(async () => { Element.prototype.getBoundingClientRect = realRect; await act(async () => root?.unmount()); container?.remove(); root = null; });

describe('where the link appears', () => {
  it('Audio Challenge: one link, a real button named by its text', async () => {
    await playGame('audio');
    expect(container.textContent).toContain('Listen & Find');      // control: the audio word list rendered
    expect(links()).toHaveLength(1);
    expect(link().tagName).toBe('BUTTON');
    expect(link().getAttribute('type')).toBe('button');
    expect(link().getAttribute('aria-expanded')).toBe('false');
  });
  for (const mode of ['standard', 'mystery_word', 'anagram', 'association']) {
    it(`${mode}: no link`, async () => {
      await playGame(mode);
      expect(container.querySelector('[data-testid="board"]')).not.toBeNull(); // control: the game rendered
      expect(links()).toHaveLength(0);
    });
  }
  it('the audio Daily ("Sound Check"): the link', async () => {
    daily.template = CHALLENGE_TEMPLATES.find(t => t.mode === 'audio');
    expect(daily.template.title).toBe('Sound Check');
    await mount('/DailyChallenge', <DailyChallenge />);
    expect(container.textContent).toContain('Listen & Find');
    expect(links()).toHaveLength(1);
  });
  it('every other Daily type: no link', async () => {
    const others = CHALLENGE_TEMPLATES.filter(t => t.mode !== 'audio');
    expect(new Set(others.map(t => t.mode))).toEqual(new Set(['standard', 'anagram', 'association']));
    for (const mode of ['standard', 'anagram', 'association']) {
      daily.template = others.find(t => t.mode === mode);
      await mount('/DailyChallenge', <DailyChallenge />);
      expect(container.querySelector('[data-testid="board"]')).not.toBeNull();
      expect(links(), mode).toHaveLength(0);
      await act(async () => root.unmount()); container.remove(); root = null;
    }
  });
});

describe('each platform shows its own text', () => {
  const CASES = [
    ['iPhone and iPad', { name: 'ios', windows: false }, 'ios'],
    ['Android', { name: 'android', windows: false }, 'android'],
    ['Windows (Electron reports web)', { name: 'web', windows: true }, 'windows'],
    ['web', { name: 'web', windows: false }, 'web'],
  ];
  for (const [label, p, key] of CASES) {
    it(label, async () => {
      Object.assign(platform, p);
      await playGame('audio');
      await click(link());
      expect(panel().textContent).toContain(LINK);
      expect(panel().textContent).toContain(TEXT[key]);
      for (const [other, text] of Object.entries(TEXT)) if (other !== key) expect(panel().textContent).not.toContain(text);
    });
  }
});

describe('opening and closing', () => {
  it('opens on tap, and the close button closes it and returns focus to the link', async () => {
    await playGame('audio');
    expect(container.textContent).not.toContain(TEXT.ios);
    await click(link());
    expect(link().getAttribute('aria-expanded')).toBe('true');
    expect(container.textContent).toContain(TEXT.ios);
    const close = panel().querySelector('button[aria-label="Close"]');
    expect(document.activeElement).toBe(close);                    // focus moved into the tip
    await click(close);
    expect(container.textContent).not.toContain(TEXT.ios);
    expect(link().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(link());
  });
  it('Escape closes it', async () => {
    await playGame('audio');
    await click(link());
    await act(async () => { panel().querySelector('button[aria-label="Close"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
    expect(container.textContent).not.toContain(TEXT.ios);
  });
  it('tapping the link again closes it', async () => {
    await playGame('audio');
    await click(link());
    await click(link());
    expect(container.textContent).not.toContain(TEXT.ios);
  });
  it('Android Back closes the open tip first (a "modal" handler while open, none when shut)', async () => {
    const { registeredHandlers, resolveBack } = await import('@/lib/backButton');
    await playGame('audio');
    const modals = () => registeredHandlers().filter(h => h.kind === 'modal');
    expect(modals()).toHaveLength(0);
    await click(link());
    expect(modals()).toHaveLength(1);
    const back = resolveBack({ handlers: registeredHandlers() });
    expect(back.rule).toBe('b');                                   // the tip outranks the game's own Back
    await act(async () => { back.handler(); });
    expect(container.textContent).not.toContain(TEXT.ios);
    expect(modals()).toHaveLength(0);
  });
  it('has no link out', async () => {
    await playGame('audio');
    await click(link());
    expect(panel().querySelector('a')).toBeNull();
  });
});
