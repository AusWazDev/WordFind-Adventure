// @vitest-environment jsdom
// S41 (SF-52): every completed game counts toward the interstitial cadence, normal
// and Daily alike, and a due interstitial shows before the NEXT game starts on every
// start path (Home's level picker, Next Level, Replay, starting the Daily). The real
// pages are driven; only the board (a stub that reports each word with its real
// positions), audio and the ad SDK are replaced.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const platform = vi.hoisted(() => ({ native: true }));
vi.mock('@/lib/platform', () => ({ isNative: () => platform.native, getPlatform: () => (platform.native ? 'android' : 'web') }));
// SF-57 (DEF-54): the ad SDK is the plugin as it really behaves (see
// admobPluginMock.testutil.js): showInterstitial() resolves while the ad is still on
// screen, and only the Dismissed event says it has closed. CR-96's original mock
// resolved on dismissal, which the real plugin never does, so it hid DEF-54.
vi.mock('@capacitor-community/admob', async () => (await import('@/lib/admobPluginMock.testutil')).admobModule);
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), addBreadcrumb: vi.fn() }));
const { plugin } = await import('@/lib/admobPluginMock.testutil');
const showInterstitial = plugin.AdMob.showInterstitial;
const ad = { resolve: () => plugin.dismiss() };
vi.mock('@/lib/purchases', () => ({ purchaseProduct: vi.fn(), usePrice: () => null, useLowestPrice: () => null, PURCHASE_OPTIONS: [] }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
// SF-55d: the real victory screen fires canvas-confetti, whose first animation frame
// draws on a 2D context jsdom does not have (getContext returns null), so it threw
// an unhandled error after the screen opened and npm test exited 1.
vi.mock('canvas-confetti', () => ({ default: Object.assign(vi.fn(), { reset: vi.fn() }) })); // reset: SF-61 cleanup
vi.mock('@/components/game/voiceUtils', () => ({
  speakPhraseAndWord: vi.fn(), speakFixedPhrase: vi.fn(), unlockAudio: vi.fn(async () => {}),
  preloadGameAudio: vi.fn(), stopAllAudio: vi.fn(), speakWord: vi.fn(),
}));
// The board: one button per word, reporting the word with its stored cells.
vi.mock('@/components/game/GameBoard', () => ({
  default: ({ wordPositions, onWordFound }) => (
    <div data-testid="board">
      {Object.entries(wordPositions || {}).map(([w, cells]) => (
        <button key={w} data-find={w} onClick={() => onWordFound(w, cells)}>{w}</button>
      ))}
    </div>
  ),
}));

const { default: Game } = await import('@/pages/Game');
const { default: DailyChallenge } = await import('@/pages/DailyChallenge');
const { default: DailyChallengeCard } = await import('@/components/game/DailyChallengeCard');

let container, root, path;
function Probe() { const l = useLocation(); path = l.pathname + l.search; return null; }
async function mount(entry, element) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[entry]}>
        <Probe />
        <Routes>
          <Route path="/Game" element={element ?? <Game />} />
          <Route path="/DailyChallenge" element={element ?? <DailyChallenge />} />
          <Route path="/Home" element={element ?? <div>home</div>} />
          <Route path="*" element={element ?? <div>other</div>} />
        </Routes>
      </MemoryRouter>,
    );
  });
}
const sleep = ms => act(async () => { await new Promise(r => setTimeout(r, ms)); });
const button = label => [...container.querySelectorAll('button')].find(b => b.textContent.includes(label));
async function findAllWords() {
  // A new game can reuse a word (and React its button), so clear last game's marks.
  container.querySelectorAll('[data-done]').forEach(b => b.removeAttribute('data-done'));
  for (let i = 0; i < 40; i++) {
    const next = container.querySelector('[data-find]:not([data-done])');
    if (!next) break;
    next.setAttribute('data-done', '1');
    await act(async () => { next.click(); });
    await sleep(20);
  }
}
async function waitFor(fn, ms = 3000) { for (let t = 0; t < ms && !fn(); t += 50) await sleep(50); return fn(); }

// jsdom measures every element as 0×0, and the pages render the board only once it
// has a size, so give elements a size for these tests (restored after each).
const realRect = Element.prototype.getBoundingClientRect;
beforeEach(() => {
  Element.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 400, bottom: 400, width: 400, height: 400, toJSON() {} });
});
afterEach(() => { Element.prototype.getBoundingClientRect = realRect; });

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('wf_welcome_seen', 'true');
  localStorage.setItem('wf_tutorial_done', 'true'); // SF-64: or Home resumes the tutorial
  plugin.reset();
  platform.native = true;
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});
afterEach(async () => { plugin.dismiss(); await act(async () => root?.unmount()); container?.remove(); });

// Five games already completed and no ad yet: the next completion is the 6th.
const fiveDone = () => { localStorage.setItem('games_completed_count', '5'); localStorage.setItem('last_ad_completed_at', '0'); };

async function winAGame() {
  await mount('/Game?mode=standard&category=animals&level=1');
  await findAllWords();
  expect(await waitFor(() => !!button('Next Level')), 'control: the victory screen appeared').toBe(true);
}

describe('S41: interstitial before the next game, on every start path (SF-52)', () => {
  it('(a) the 6th completed game, then Next Level: the ad shows first, and the next level waits for it', async () => {
    fiveDone();
    await winAGame();
    expect(localStorage.getItem('games_completed_count')).toBe('6');
    await act(async () => { button('Next Level').click(); });
    await sleep(50);
    expect(showInterstitial).toHaveBeenCalledTimes(1);
    expect(path).toContain('level=1');                       // still waiting on the ad
    await act(async () => { ad.resolve(); });
    expect(await waitFor(() => path.includes('level=2'))).toBe(true);
  });

  it('(b) the 6th completed game, then Replay: the ad shows first, and the new board waits for it', async () => {
    fiveDone();
    await winAGame();
    await act(async () => { button('Replay').click(); });
    await sleep(50);
    expect(showInterstitial).toHaveBeenCalledTimes(1);
    expect(button('Replay'), 'the victory screen stays until the ad closes').toBeDefined();
    await act(async () => { ad.resolve(); });
    expect(await waitFor(() => !button('Replay'))).toBe(true);
  });

  it('(a/b control) the 5th completed game: no ad on Next Level', async () => {
    localStorage.setItem('games_completed_count', '4');
    await winAGame();
    await act(async () => { button('Next Level').click(); });
    expect(await waitFor(() => path.includes('level=2'))).toBe(true);
    expect(showInterstitial).not.toHaveBeenCalled();
  });

  it('(c) a Daily completion advances the count', async () => {
    localStorage.setItem('games_completed_count', '2');
    await mount('/DailyChallenge');
    await findAllWords();
    expect(await waitFor(() => localStorage.getItem('games_completed_count') === '3')).toBe(true);
  });

  it('(c) starting the Daily: a due ad shows first, and the Daily opens only after it closes', async () => {
    fiveDone(); localStorage.setItem('games_completed_count', '6');
    await mount('/Home', <DailyChallengeCard />);
    expect(button('Play'), 'control: the card shows its Play button').toBeDefined();
    await act(async () => { button('Play').click(); });
    await sleep(50);
    expect(showInterstitial).toHaveBeenCalledTimes(1);
    expect(path).toBe('/Home');                                // the Daily (and its timer) has not started
    await act(async () => { ad.resolve(); });
    expect(await waitFor(() => path.startsWith('/DailyChallenge'))).toBe(true);
  });

  it('(d) ads removed: no interstitial on Next Level, Replay or starting the Daily', async () => {
    fiveDone(); localStorage.setItem('ads_removed', 'true');
    await winAGame();
    await act(async () => { button('Replay').click(); });
    expect(await waitFor(() => !button('Replay'))).toBe(true);
    await findAllWords();
    expect(await waitFor(() => !!button('Next Level'))).toBe(true);
    await act(async () => { button('Next Level').click(); });
    expect(await waitFor(() => path.includes('level=2'))).toBe(true);
    await act(async () => root.unmount()); container.remove();
    await mount('/Home', <DailyChallengeCard />);
    await act(async () => { button('Play').click(); });
    expect(await waitFor(() => path.startsWith('/DailyChallenge'))).toBe(true);
    expect(showInterstitial).not.toHaveBeenCalled();
  });

  it('(e) off native: no native interstitial on Next Level, Replay or starting the Daily', async () => {
    platform.native = false;
    fiveDone();
    await winAGame();
    await act(async () => { button('Replay').click(); });
    expect(await waitFor(() => !button('Replay'))).toBe(true);
    await findAllWords();
    expect(await waitFor(() => !!button('Next Level'))).toBe(true);
    await act(async () => { button('Next Level').click(); });
    expect(await waitFor(() => path.includes('level=2'))).toBe(true);
    await act(async () => root.unmount()); container.remove();
    await mount('/Home', <DailyChallengeCard />);
    await act(async () => { button('Play').click(); });
    expect(await waitFor(() => path.startsWith('/DailyChallenge'))).toBe(true);
    expect(showInterstitial).not.toHaveBeenCalled();
    // The off-native turn is not used up by these paths: Home's placeholder still sees it due.
    expect(localStorage.getItem('last_ad_completed_at')).toBe('0');
  });
});
