// @vitest-environment jsdom
// Leaderboard tab removed (CR-66, brief SF-6, decision S3). Renders the real
// App (HashRouter, pages.config, Layout, PageNotFound).
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/platform', () => ({ isNative: () => false, getPlatform: () => 'web' }));
vi.mock('./lib/platform', () => ({ isNative: () => false, getPlatform: () => 'web' }));

// Every mount is tracked and unmounted after its test, and each test reads only the
// container renderAt returned to it. SF-59: these were shared module variables, so a
// test that timed out kept rendering into them and broke the next test as well.
const mounts = [];

async function renderAt(hash) {
  window.location.hash = hash;
  const { default: App } = await import('./App');
  const container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);
  const root = createRoot(container);
  mounts.push({ container, root });
  await act(async () => { root.render(<App />); });
  await act(async () => { await new Promise(r => setTimeout(r, 50)); });
  return container;
}

const navLabels = container => [...container.querySelectorAll('nav.bottom-nav button')].map(b => b.textContent.trim());

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('wf_welcome_seen', 'true');
  localStorage.setItem('wf_tutorial_done', 'true'); // SF-64: or Home resumes the tutorial
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
  window.scrollTo = () => {};
  Element.prototype.scrollTo = () => {};
});

afterEach(async () => {
  for (const { container, root } of mounts.splice(0)) {
    await act(async () => root.unmount());
    container.remove();
  }
});

// The first test pays for importing the whole app.
const SLOW = { timeout: 60000 };

describe('bottom navigation', () => {
  it('has exactly three tabs: Home, Stats, Settings', SLOW, async () => {
    const container = await renderAt('#/Home');
    expect(navLabels(container).length).toBeGreaterThan(0); // control: the nav rendered at all
    expect(navLabels(container)).toEqual(['Home', 'Stats', 'Settings']);
  });
});

describe('an old #/Leaderboard link', () => {
  it('renders the Page Not Found screen, not a Leaderboard page', async () => {
    const container = await renderAt('#/Leaderboard');
    expect(container.textContent).toContain('Page Not Found');
    expect(container.textContent).toContain('"Leaderboard"');
    expect(container.textContent).not.toContain('Global Leaderboard Coming Soon');
  });

  it('"Go Home" navigates in the router (CR-34), with no page reload', async () => {
    const container = await renderAt('#/Leaderboard');
    const hrefBefore = window.location.href.split('#')[0];
    const goHome = [...container.querySelectorAll('button')].find(b => b.textContent.includes('Go Home'));
    await act(async () => { goHome.click(); });
    expect(window.location.hash).toBe('#/');
    expect(window.location.href.split('#')[0]).toBe(hrefBefore);
    expect(container.textContent).not.toContain('Page Not Found');
  });
});
