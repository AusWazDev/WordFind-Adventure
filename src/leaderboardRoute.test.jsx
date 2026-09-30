// @vitest-environment jsdom
// Leaderboard tab removed (CR-66, brief SF-6, decision S3). Renders the real
// App (HashRouter, pages.config, Layout, PageNotFound).
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/platform', () => ({ isNative: () => false, getPlatform: () => 'web' }));
vi.mock('./lib/platform', () => ({ isNative: () => false, getPlatform: () => 'web' }));

let container;
let root;

async function renderAt(hash) {
  window.location.hash = hash;
  const { default: App } = await import('./App');
  container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root.render(<App />); });
  await act(async () => { await new Promise(r => setTimeout(r, 50)); });
}

const navLabels = () => [...container.querySelectorAll('nav.bottom-nav button')].map(b => b.textContent.trim());

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('wf_welcome_seen', 'true');
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
  window.scrollTo = () => {};
  Element.prototype.scrollTo = () => {};
});

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

// The first test pays for importing the whole app.
const SLOW = { timeout: 60000 };

describe('bottom navigation', () => {
  it('has exactly three tabs: Home, Stats, Settings', SLOW, async () => {
    await renderAt('#/Home');
    expect(navLabels().length).toBeGreaterThan(0); // control: the nav rendered at all
    expect(navLabels()).toEqual(['Home', 'Stats', 'Settings']);
  });
});

describe('an old #/Leaderboard link', () => {
  it('renders the Page Not Found screen, not a Leaderboard page', async () => {
    await renderAt('#/Leaderboard');
    expect(container.textContent).toContain('Page Not Found');
    expect(container.textContent).toContain('"Leaderboard"');
    expect(container.textContent).not.toContain('Global Leaderboard Coming Soon');
  });

  it('"Go Home" navigates in the router (CR-34), with no page reload', async () => {
    await renderAt('#/Leaderboard');
    const hrefBefore = window.location.href.split('#')[0];
    const goHome = [...container.querySelectorAll('button')].find(b => b.textContent.includes('Go Home'));
    await act(async () => { goHome.click(); });
    expect(window.location.hash).toBe('#/');
    expect(window.location.href.split('#')[0]).toBe(hrefBefore);
    expect(container.textContent).not.toContain('Page Not Found');
  });
});
