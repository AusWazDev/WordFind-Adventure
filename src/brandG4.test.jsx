// @vitest-environment jsdom
// SF-66b B3/B5 (G4): Home is unchanged by the wordmark extraction (compared with its DOM
// before it, homeHeader.fixture.html); the welcome uses Home's wordmark, background and
// button styles, follows the theme, and has no inline hex colour, blur or backdrop
// filter; the tutorial's files have no inline hex colour either.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/platform', () => ({ isWindowsApp: () => false, isNative: () => false, getPlatform: () => 'web' }));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), addBreadcrumb: vi.fn() }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
vi.mock('@/components/game/voiceUtils', () => ({
  unlockAudio: vi.fn(async () => {}), speakWordAudio: vi.fn(async () => {}), preloadGameAudio: vi.fn(), stopAllAudio: vi.fn(),
}));

const { default: Home } = await import('@/pages/Home');
const { default: WelcomeScreen } = await import('@/components/game/WelcomeScreen');
const { PRIMARY_BUTTON, PILL_BUTTON, HOME_BACKGROUND } = await import('@/lib/brand');

const SRC = join(process.cwd(), 'src');
// A hex colour: #rgb, #rgba, #rrggbb or #rrggbbaa, not followed by more hex or a word.
export const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z])/g;

let container, root;
async function mount(element, entry = '/Home') {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  await act(async () => { root.render(<MemoryRouter initialEntries={[entry]}><Routes><Route path="*" element={element} /></Routes></MemoryRouter>); });
}
beforeEach(() => {
  localStorage.clear();
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});
afterEach(async () => { await act(async () => root?.unmount()); container?.remove(); root = null; });

describe('Home does not change (the wordmark extraction)', () => {
  it("Home's header and page background match the DOM from before the extraction", async () => {
    localStorage.setItem('wf_welcome_seen', 'true'); localStorage.setItem('wf_tutorial_done', 'true');
    localStorage.setItem('wf_progress', JSON.stringify({ hints_remaining: 7, total_score: 120, games_played: 3 }));
    await mount(<Home />);
    const header = container.querySelector('h1').closest('div.flex.items-center.justify-between');
    const page = container.querySelector('h1').closest('.min-h-full');
    const now = `<!-- page class: ${page.className} -->\n${header.outerHTML}\n`;
    const before = readFileSync(join(SRC, 'homeHeader.fixture.html'), 'utf8').replace(/\r\n/g, '\n');
    expect(before, 'control: the fixture holds the wordmark').toContain('Sound<span class="text-violet-600">Find</span>');
    expect(now).toBe(before);
  });
});

describe('the welcome takes Home\'s brand', () => {
  beforeEach(async () => { await mount(<WelcomeScreen onShowMeHow={() => {}} onSkip={() => {}} />); });

  it("uses Home's wordmark at a larger size: Home's weight and two theme colours", () => {
    const h1 = container.querySelector('h1');
    expect(h1.className).toBe('text-5xl font-bold text-slate-800 dark:text-slate-100');
    expect(h1.querySelector('span').className).toBe('text-violet-600');
    expect(h1.textContent).toBe('SoundFind');
  });

  it("takes Home's background, with its dark variant, and no black weight", () => {
    const page = container.firstElementChild;
    for (const c of HOME_BACKGROUND.split(' ')) expect(page.className.split(' ')).toContain(c);
    expect(container.innerHTML).not.toMatch(/font-black/);
  });

  it('its primary button is the shared one; its secondary uses the How to Play pill', () => {
    const button = label => [...container.querySelectorAll('button')].find(b => b.textContent.trim() === label);
    expect(button('Show me how').className).toBe(PRIMARY_BUTTON);
    expect(button('Skip, just play').className.startsWith(PILL_BUTTON)).toBe(true);
  });

  it('no inline hex colour, no blur and no backdrop filter in the rendered welcome', () => {
    const els = [container, ...container.querySelectorAll('*')];
    expect(els.length, 'control: the welcome rendered').toBeGreaterThan(20);
    const hex = els.filter(el => (el.getAttribute('style') || '').match(HEX) || (el.getAttribute('class') || '').match(HEX));
    expect(hex.map(el => el.outerHTML.slice(0, 80))).toEqual([]);
    const blurred = els.filter(el => /(^|\s)(backdrop-)?blur(-|\s|$)/.test(el.getAttribute('class') || '') || /blur\(/.test(el.getAttribute('style') || ''));
    expect(blurred.map(el => el.outerHTML.slice(0, 80))).toEqual([]);
  });
});

describe('no inline hex colour in the welcome, tutorial and finish-screen source', () => {
  const FILES = ['components/game/WelcomeScreen.jsx', 'pages/Tutorial.jsx', 'components/game/CoachMark.jsx',
    'components/game/TutorialWordList.jsx', 'components/game/Wordmark.jsx', 'lib/brand.js', 'lib/modeIcons.js'];
  it('control: the scan finds a hex colour where there is one', () => {
    expect("style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}".match(HEX)).toEqual(['#7c3aed', '#4f46e5']);
    expect('location.hash = "#/Home"'.match(HEX)).toBeNull();
  });
  for (const f of FILES) {
    it(f, () => {
      const code = readFileSync(join(SRC, f), 'utf8');
      expect(code.length, 'control: the file was read').toBeGreaterThan(100);
      expect(code.match(HEX) || []).toEqual([]);
    });
  }
});
