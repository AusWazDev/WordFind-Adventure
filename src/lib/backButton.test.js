// SF-65 (U7): the Back priority, as one pure function, and the one-listener installer.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const platform = vi.hoisted(() => ({ name: 'android' }));
vi.mock('@/lib/platform', () => ({ isWindowsApp: () => false, isNative: () => platform.name !== 'web', getPlatform: () => platform.name }));

const { resolveBack, registerBack, registeredHandlers, installBackButton, __resetBackButton } = await import('./backButton');

const h = kind => ({ kind, handler: vi.fn() });
const ALL = ['modal', 'game', 'victory', 'tutorial', 'page'].map(h);

describe('resolveBack: the first match wins (rules a to g)', () => {
  it('a) a native ad or purchase screen is up: nothing, whatever else is registered', () => {
    expect(resolveBack({ nativeScreenUp: true, handlers: ALL, onHome: true })).toEqual({ action: 'none', rule: 'a' });
  });
  it('b) a modal beats everything below it', () => {
    expect(resolveBack({ handlers: ALL, onHome: true })).toMatchObject({ action: 'handler', rule: 'b', handler: ALL[0].handler });
  });
  it('c) game, when no modal is open', () => {
    expect(resolveBack({ handlers: ALL.slice(1) })).toMatchObject({ rule: 'c', handler: ALL[1].handler });
  });
  it('d) victory, when nothing above it is registered', () => {
    expect(resolveBack({ handlers: ALL.slice(2) })).toMatchObject({ rule: 'd', handler: ALL[2].handler });
  });
  it('e) tutorial', () => {
    expect(resolveBack({ handlers: ALL.slice(3) })).toMatchObject({ rule: 'e', handler: ALL[3].handler });
  });
  it('f) a page with its own Back control', () => {
    expect(resolveBack({ handlers: ALL.slice(4), onHome: true })).toMatchObject({ rule: 'f', handler: ALL[4].handler });
  });
  it('f) a page with none: Home through the router', () => {
    expect(resolveBack({ handlers: [], onHome: false })).toEqual({ action: 'home', rule: 'f' });
  });
  it('g) Home or the welcome: minimise', () => {
    expect(resolveBack({ handlers: [], onHome: true })).toEqual({ action: 'minimize', rule: 'g' });
  });
  it('of two modals, the most recently opened closes first', () => {
    const [m1, m2] = [h('modal'), h('modal')];
    expect(resolveBack({ handlers: [m1, m2] }).handler).toBe(m2.handler);
  });
});

describe('the registry', () => {
  beforeEach(() => __resetBackButton());
  it('registers and removes', () => {
    const fn = vi.fn();
    const remove = registerBack('page', fn);
    expect(registeredHandlers()).toEqual([{ kind: 'page', handler: fn }]);
    remove();
    expect(registeredHandlers()).toEqual([]);
  });
  it('refuses an unknown kind', () => {
    expect(() => registerBack('sheet', () => {})).toThrow(/unknown Back kind/);
  });
});

describe('installBackButton: Android only, once', () => {
  let App;
  beforeEach(() => {
    __resetBackButton();
    App = { addListener: vi.fn(async () => ({ remove: vi.fn() })), minimizeApp: vi.fn(), exitApp: vi.fn() };
  });
  const nav = { goHome: vi.fn(), onHome: () => true };

  for (const name of ['ios', 'web']) {
    it(`${name}: never registers (web covers Electron, which Capacitor reports as web)`, async () => {
      platform.name = name;
      expect(await installBackButton(App, nav)).toBeNull();
      expect(App.addListener).not.toHaveBeenCalled();
    });
  }
  it('android: registers backButton and appStateChange, once even when called twice at once', async () => {
    platform.name = 'android';
    const [first, second] = await Promise.all([installBackButton(App, nav), installBackButton(App, nav)]);
    expect(typeof first).toBe('function');
    expect(second).toBeNull();
    expect(App.addListener.mock.calls.map(c => c[0]).sort()).toEqual(['appStateChange', 'backButton']);
  });
});

describe('isolation: backButton.js reaches no ad, hint or progress code', () => {
  it('imports only react and the platform helpers', () => {
    const src = readFileSync(join(process.cwd(), 'src/lib/backButton.js'), 'utf8');
    const specs = [...src.matchAll(/^\s*import[^'"]*['"]([^'"]+)['"]/gm)].map(m => m[1]);
    expect(specs, 'control: the scan found the imports').toContain('react');
    expect(specs.sort()).toEqual(['@/lib/platform', 'react']);
  });
});
