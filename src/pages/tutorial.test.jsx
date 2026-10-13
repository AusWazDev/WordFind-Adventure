// @vitest-environment jsdom
// SF-64 (S43): the guided first game, played on the real GameBoard with real drags.
// Isolation (b): with localStorage.setItem and every ad and hint function spied on, the
// only write is wf_tutorial_done and nothing in the ad or hint code is called.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const platform = vi.hoisted(() => ({ native: false }));
vi.mock('@/lib/platform', () => ({ isNative: () => platform.native, getPlatform: () => (platform.native ? 'android' : 'web') }));
const voice = vi.hoisted(() => ({ calls: [] }));
vi.mock('@/components/game/voiceUtils', () => ({
  unlockAudio: vi.fn(async () => { voice.calls.push('unlockAudio'); }),
  speakWordAudio: vi.fn(async (...a) => { voice.calls.push(['speakWordAudio', ...a]); }),
  speakSentenceAudio: vi.fn(async (...a) => { voice.calls.push(['speakSentenceAudio', ...a]); }),
  stopAllAudio: vi.fn(() => { voice.calls.push('stopAllAudio'); }),
  preloadGameAudio: vi.fn(),
}));
// Every ad and hint function, spied on (the tutorial must call none of them).
const spies = vi.hoisted(() => ({}));
const spyModule = (name, keys) => Object.fromEntries(keys.map(k => [k, (spies[`${name}.${k}`] = vi.fn())]));
vi.mock('@/lib/admob', () => spyModule('admob', ['initAdMob', 'prepareInterstitial', 'showInterstitialUntilClosed', 'showRewarded', 'isDebugBuild', 'adUnitsFor']));
vi.mock('@/lib/adCadence', () => spyModule('adCadence', ['recordCompletedGame', 'interstitialDue', 'markInterstitialShown', 'showInterstitialBeforeGame']));
vi.mock('@/lib/hintLedger', () => ({ PROGRESS_CHANGED_EVENT: 'x', ...spyModule('hintLedger', ['creditPurchaseNow', 'reconcileHintPurchases', 'ensureReconcileBaseline', 'reconcile', 'creditPurchase', 'findListedEntry', 'withBaseline']) }));
vi.mock('@/lib/purchases', () => ({ PURCHASE_OPTIONS: [], REMOVE_ADS_PRODUCT_ID: 'x', ...spyModule('purchases', ['initPurchases', 'purchaseProduct', 'restorePurchases', 'getPrice', 'usePrice', 'useLowestPrice']) }));

const { default: Layout } = await import('@/Layout');
const { default: Tutorial, FOUND_ADVANCE_MS, MISS_ADVANCE_MS } = await import('./Tutorial');
const { getSentence } = await import('@/components/game/trickySentences');

let container, root, location, setItem;
function Where() { location = useLocation(); return <div data-testid="home" />; }
async function render(mode) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[`/Tutorial?mode=${mode}`]}>
        <Routes>
          <Route path="/Tutorial" element={<Layout currentPageName="Tutorial"><Tutorial /></Layout>} />
          <Route path="/Home" element={<Where />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}
let reduced = false;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  localStorage.clear();
  platform.native = false; voice.calls = []; location = null; reduced = false;
  Object.values(spies).forEach(s => s.mockClear());
  window.matchMedia = q => ({ matches: reduced && /prefers-reduced-motion: reduce/.test(q), addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  Element.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, right: 600, bottom: 600, width: 600, height: 600, x: 0, y: 0 });
  setItem = vi.spyOn(Storage.prototype, 'setItem');
});
afterEach(async () => { await act(async () => root?.unmount()); container?.remove(); vi.useRealTimers(); vi.restoreAllMocks(); });

const advance = ms => act(async () => { vi.advanceTimersByTime(ms); });
const coach = () => container.querySelector('[data-testid="coach"]')?.textContent || '';
const board = () => container.querySelector('[data-row="0"][data-col="0"]').parentElement.parentElement;
const at = ([r, c]) => ({ clientX: c * 100 + 50, clientY: r * 100 + 50, bubbles: true });
const drag = async (from, to) => {
  for (const [type, p] of [['mousedown', from], ['mousemove', to], ['mouseup', to]]) {
    await act(async () => { board().dispatchEvent(new MouseEvent(type, at(p))); });
  }
};
const missShown = () => container.querySelectorAll('[data-miss]').length > 0;
const click = async label => {
  const b = [...container.querySelectorAll('button')].find(x => x.textContent.trim() === label || x.getAttribute('aria-label') === label);
  if (!b) throw new Error(`no button "${label}"`);
  await act(async () => { b.click(); });
};
const rowText = word => container.querySelector(`[data-word="${word}"]`).textContent;
const isGold = ([r, c]) => container.querySelector(`[data-row="${r}"][data-col="${c}"]`).className.includes('from-amber-400');
const writes = () => setItem.mock.calls.map(c => c[0]);
const noAdOrHintCalls = () => Object.entries(spies).filter(([, s]) => s.mock.calls.length).map(([k]) => k);

const LAMB = [[0, 0], [0, 3]], KNIGHT = [[5, 0], [5, 5]], THUMB = [[0, 5], [4, 5]], SOCW = [[1, 0], [1, 3]];

async function stepOne() {
  await drag(...LAMB);
  expect(coach()).toContain('Found LAMB!');
  await advance(FOUND_ADVANCE_MS);
}
async function stepTwo() {
  await drag(...SOCW);
  expect(coach()).toContain('No penalty');
  await advance(MISS_ADVANCE_MS);
}
async function stepThree() {
  await click("Can't hear? Show the word");
  await drag(...KNIGHT);
  expect(coach()).toContain('Found KNIGHT!');
  await advance(FOUND_ADVANCE_MS);
}
async function stepFour() {
  await click('Hint: show first letter');
  await drag(...THUMB);
  expect(coach()).toContain('Found THUMB!');
  await advance(FOUND_ADVANCE_MS);
}

describe('the whole first run (SF-64)', () => {
  it('each step waits for its own action; the only write is wf_tutorial_done; no ad or hint code is called', async () => {
    await render('first');
    expect(writes(), 'nothing is written on start').toEqual([]);
    expect(localStorage.getItem('wf_tutorial_done')).toBeNull();

    // Step 1: only LAMB advances it.
    expect(coach()).toContain('Find LAMB');
    expect(container.querySelector('[data-testid="coach-hand"]'), 'the hand shows the drag').not.toBeNull();
    expect(rowText('KNIGHT')).toContain('• • • • •');
    await drag(...SOCW);
    expect(missShown(), 'a miss shows the real miss display').toBe(true);
    await click('Play word');
    await advance(FOUND_ADVANCE_MS + MISS_ADVANCE_MS);
    expect(coach(), 'a miss or a speaker tap does not advance step 1').toContain('Find LAMB');
    await stepOne();

    // Step 2: the lightbulb does not advance it; a miss does.
    expect(coach()).toContain("What if you're wrong?");
    await click('Hint: show first letter');
    await advance(MISS_ADVANCE_MS);
    expect(coach()).toContain("What if you're wrong?");
    await stepTwo();

    // Step 3: the lightbulb does not; the speaker plays the sentence clip; finding KNIGHT does.
    expect(coach()).toContain('Some words are hidden');
    await click('Hint: show first letter');
    expect(coach()).toContain('Some words are hidden');
    voice.calls = [];
    await click('Play word');
    expect(voice.calls).toEqual(['unlockAudio', ['speakSentenceAudio', 'KNIGHT', getSentence('KNIGHT'), expect.objectContaining({ audio_voice: 'female' })]]);
    expect(coach()).toContain('Now find it on the board');
    await drag(...KNIGHT);
    expect(coach()).toContain('Found KNIGHT!');
    await advance(FOUND_ADVANCE_MS);

    // Step 4: the hint marks T for free; finding THUMB finishes.
    expect(coach()).toContain('Stuck? Use a hint');
    await stepFour();
    expect(container.textContent).toContain("You're ready to play");

    await click('Play your first puzzle');
    expect(location.pathname).toBe('/Home');
    expect(location.state).toEqual({ startFirstPuzzle: true });
    expect(localStorage.getItem('wf_tutorial_done')).toBe('true');
    expect(voice.calls).toContain('stopAllAudio');
    expect(writes()).toEqual(['wf_tutorial_done']);
    expect(noAdOrHintCalls()).toEqual([]);
  });
});

describe('step details (SF-64)', () => {
  it('KNIGHT and THUMB dragged early are ignored, with no miss flash and a note', async () => {
    await render('first');
    await drag(...KNIGHT);
    expect(missShown()).toBe(false);
    expect(container.textContent).toContain("That one's for later. Find LAMB first.");
    await drag(...THUMB);
    expect(missShown()).toBe(false);
    expect(coach()).toContain('Find LAMB');
    expect(rowText('KNIGHT')).not.toContain('KNIGHT');
  });

  it('"Show the word" reveals KNIGHT for free', async () => {
    await render('first');
    await stepOne(); await stepTwo();
    expect(rowText('KNIGHT')).not.toContain('KNIGHT');
    await click("Can't hear? Show the word");
    expect(rowText('KNIGHT')).toContain('KNIGHT');
    expect(coach()).toContain('Now find it on the board');
    expect(writes()).toEqual([]);
    expect(noAdOrHintCalls()).toEqual([]);
  });

  it('the hint marks THUMB\'s T with the real gold hint style and spends nothing', async () => {
    await render('first');
    await stepOne(); await stepTwo(); await stepThree();
    expect(isGold([0, 5])).toBe(false);
    await click('Hint: show first letter');
    expect(isGold([0, 5])).toBe(true);
    expect(coach()).toContain('It starts here');
    expect(writes()).toEqual([]);
    expect(noAdOrHintCalls()).toEqual([]);
  });

  it('under reduced motion: no hand and no "Show me again"; the outline carries step 1', async () => {
    reduced = true;
    await render('first');
    expect(container.querySelector('[data-testid="coach-hand"]')).toBeNull();
    expect(coach()).not.toContain('Show me again');
    expect(container.querySelector('[data-testid="coach-ring"]')).not.toBeNull();
  });

  it('no blur, backdrop or nav on the Tutorial page', async () => {
    await render('first');
    const blurred = [...document.body.querySelectorAll('*')].filter(el =>
      /(^|\s)(backdrop-)?blur(-|$|\s)/.test(el.getAttribute('class') || '') || /blur\(/.test(`${el.style.backdropFilter} ${el.style.filter}`));
    expect(blurred.map(el => el.className)).toEqual([]);
    expect(document.querySelector('nav.bottom-nav')).toBeNull();
    expect(container.querySelector('[data-testid="coach-ring"]'), 'control: a coach mark is drawn').not.toBeNull();
  });
});

describe('Skip and finish in each mode (SF-64)', () => {
  it('first run, Skip: starts the first puzzle via Home, sets the flag, stops audio', async () => {
    await render('first');
    await click('Skip tutorial');
    expect(location.state).toEqual({ startFirstPuzzle: true });
    expect(localStorage.getItem('wf_tutorial_done')).toBe('true');
    expect(voice.calls).toContain('stopAllAudio');
  });

  it('replay, Skip: back to Home, sets the flag', async () => {
    await render('replay');
    await click('Skip tutorial');
    expect(location.pathname).toBe('/Home');
    expect(location.state).toBeNull();
    expect(localStorage.getItem('wf_tutorial_done')).toBe('true');
  });

  it('replay, finish: "Back to home", no "Replay this" line, no earn line on the web', async () => {
    await render('replay');
    await stepOne(); await stepTwo(); await stepThree(); await stepFour();
    const box = container.querySelector('[data-testid="hints-box"]').textContent;
    expect(box).toContain('You start with 12 free hints.');
    expect(box).toContain('Lightbulb on a word: lights up its first letter. That word scores 25% less.');
    expect(box).toContain('Lightbulb at the top: gives a hint on a random word.');
    expect(box).toContain('Eye (Audio Challenge and Word Association): shows the word. That word scores 50% less.');
    expect(box).not.toContain('Run out?');
    expect(container.textContent).not.toContain('Replay this any time from Settings.');
    await click('Back to home');
    expect(location.pathname).toBe('/Home');
    expect(location.state).toBeNull();
    expect(localStorage.getItem('wf_tutorial_done')).toBe('true');
  });

  it('first run, finish on Android or iOS: the earn and buy line, and "Replay this any time"', async () => {
    platform.native = true;
    await render('first');
    await stepOne(); await stepTwo(); await stepThree(); await stepFour();
    expect(container.querySelector('[data-testid="hints-box"]').textContent).toContain('Run out? Watch a short ad to earn one, or buy a hint pack.');
    expect(container.textContent).toContain('Replay this any time from Settings.');
    for (const label of ['Audio Challenge', 'Standard', 'Anagram Hunt', 'Word Association', 'Mystery Word']) expect(container.textContent).toContain(`${label}:`);
  });
});
