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
const { installBackButton, __resetBackButton } = await import('@/lib/backButton');
const { HOME_BACKGROUND, HEADING_TEXT, PRIMARY_BUTTON } = await import('@/lib/brand');
const { MODE_ICONS } = await import('@/lib/modeIcons');

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
// The live bubble only: CoachMark also renders two hidden copies to measure (SF-66b).
const coach = () => container.querySelector('[data-testid="coach"] > :not([aria-hidden])')?.textContent || '';
// The bubble's full text (its hidden full copy): what it says once expanded.
const fullCoachText = () => container.querySelector('[data-testid="coach"] > [aria-hidden="true"]')?.textContent || '';
const board = () => container.querySelector('[data-row="0"][data-col="0"]').parentElement.parentElement;
const at = ([r, c]) => ({ clientX: c * 100 + 50, clientY: r * 100 + 50, bubbles: true });
const drag = async (from, to) => {
  for (const [type, p] of [['mousedown', from], ['mousemove', to], ['mouseup', to]]) {
    await act(async () => { board().dispatchEvent(new MouseEvent(type, at(p))); });
  }
};
const missShown = () => container.querySelectorAll('[data-miss]').length > 0;
const liveButton = label => [...container.querySelectorAll('button')]
  .filter(x => !x.closest('[aria-hidden="true"]'))
  .find(x => x.textContent.trim() === label || x.getAttribute('aria-label') === label);
const click = async label => {
  // jsdom gives every element the same box, so no spot clears the targets and the bubble
  // shows heading-only, with its link behind "More" (G2, SF-66b). Open it first.
  if (!liveButton(label) && liveButton('More')) await act(async () => { liveButton('More').click(); });
  const b = liveButton(label);
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
    expect(coach()).toContain("Can't spot it? Use a hint");
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
    expect(coach()).toContain('THUMB starts here');
    expect(writes()).toEqual([]);
    expect(noAdOrHintCalls()).toEqual([]);
  });

  it('under reduced motion: no hand and no "Show me again"; the outline carries step 1', async () => {
    reduced = true;
    await render('first');
    expect(container.querySelector('[data-testid="coach-hand"]')).toBeNull();
    expect(coach()).not.toContain('Show me again');
    expect(container.querySelectorAll('[data-coach-target="cell"]').length, 'LAMB\'s four cells mark themselves').toBe(4);
  });

  it('no blur, backdrop or nav on the Tutorial page', async () => {
    await render('first');
    const blurred = [...document.body.querySelectorAll('*')].filter(el =>
      /(^|\s)(backdrop-)?blur(-|$|\s)/.test(el.getAttribute('class') || '') || /blur\(/.test(`${el.style.backdropFilter} ${el.style.filter}`));
    expect(blurred.map(el => el.className)).toEqual([]);
    expect(document.querySelector('nav.bottom-nav')).toBeNull();
    expect(container.querySelector('[data-coach-target]'), 'control: a coach target is marked').not.toBeNull();
  });
});

describe('NIGHT in step 3 only (SF-64b)', () => {
  const NIGHT = [[5, 1], [5, 5]];
  const NIGHT_BACKWARDS = [[5, 5], [5, 1]];
  // Heading on the live bubble; body on its full copy (what it shows once expanded: in
  // jsdom every box is the same, so the bubble is heading-only, SF-66b).
  const fullCoach = () => container.querySelector('[data-testid="coach"]')?.textContent || '';
  const closeCall = () => coach().includes('So close!') && fullCoach().includes('Listen again. This one starts with a silent letter.');

  it('step 3: NIGHT, either way round, is a miss with the "So close!" note, and the step stays', async () => {
    await render('first');
    await stepOne(); await stepTwo();
    await drag(...NIGHT);
    expect(missShown()).toBe(true);
    expect(closeCall()).toBe(true);
    await advance(FOUND_ADVANCE_MS + MISS_ADVANCE_MS);
    expect(coach(), 'the step does not advance').not.toContain("Can't spot it? Use a hint");
    expect(rowText('KNIGHT')).not.toContain('KNIGHT');
    await drag(...NIGHT_BACKWARDS);
    expect(missShown()).toBe(true);
    expect(closeCall()).toBe(true);
  });

  it('steps 1 and 2: NIGHT is an ordinary miss with no note', async () => {
    await render('first');
    await drag(...NIGHT);
    expect(missShown()).toBe(true);
    expect(coach()).not.toContain('So close!');
    expect(coach()).toContain('Find LAMB');
    await stepOne();
    await drag(...NIGHT);
    expect(missShown()).toBe(true);
    expect(coach()).not.toContain('So close!');
    expect(coach(), 'step 2 moves on after any miss, as before').toContain('No penalty');
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

describe('Android Back on the Tutorial (SF-65, rule e)', () => {
  let listeners, CapApp, remove, goHome;
  beforeEach(async () => {
    __resetBackButton();
    platform.native = true; // Android
    listeners = {};
    CapApp = { addListener: async (n, fn) => { listeners[n] = fn; return { remove() {} }; }, minimizeApp: vi.fn(), exitApp: vi.fn() };
    goHome = vi.fn();
    remove = await installBackButton(CapApp, { goHome, onHome: () => location?.pathname === '/Home' });
  });
  afterEach(() => { remove?.(); __resetBackButton(); });

  for (const mode of ['first', 'replay']) {
    it(`${mode}: Back is Skip, but to Home: the flag is set, audio stops, no game starts, no ad, hint or progress call`, async () => {
      await render(mode);
      await act(async () => { listeners.backButton(); });
      expect(location.pathname).toBe('/Home');
      expect(location.state).toBeNull(); // first run goes Home, not into the first puzzle
      expect(localStorage.getItem('wf_tutorial_done')).toBe('true');
      expect(voice.calls).toContain('stopAllAudio');
      expect(writes()).toEqual(['wf_tutorial_done']);
      expect(noAdOrHintCalls()).toEqual([]);
      expect(goHome).not.toHaveBeenCalled(); // the tutorial's own handler ran, not the default
      expect(CapApp.minimizeApp).not.toHaveBeenCalled();
    });
  }
});

describe('G1 (SF-66b): step 4 shows THUMB and points at the lightbulb', () => {
  it('THUMB is visible in the word list from the start, like LAMB', async () => {
    await render('first');
    expect(rowText('LAMB'), 'control: LAMB is shown').toContain('LAMB');
    expect(rowText('THUMB')).toContain('THUMB');
  });

  it('step 4 copy: the ask, then after the tap; the balance line is gone', async () => {
    await render('first');
    await stepOne(); await stepTwo(); await stepThree();
    expect(coach()).toContain("Can't spot it? Use a hint");
    expect(fullCoachText()).toContain("Tap the lightbulb next to THUMB. It lights up where the word starts. This one's free.");
    await click('Hint: show first letter');
    expect(coach()).toContain('THUMB starts here');
    expect(fullCoachText()).toContain('Drag from the gold T down to the bottom of the word.');
    expect(container.textContent).not.toContain('In real games a hint uses one from your balance');
    await drag(...THUMB);
    expect(coach()).toContain('Found THUMB!');
  });
});

describe('G5 (SF-66b): targets are marked on the elements themselves', () => {
  const page = () => container.querySelector('[data-testid="tutorial-board"]').parentElement;
  // Every tutorial highlight: anything marked as a coach target, the old ring, or any
  // positioned element drawing an amber outline or border.
  const highlights = () => [...container.querySelectorAll('*')].filter(el =>
    el.hasAttribute('data-coach-target') || el.getAttribute('data-testid') === 'coach-ring'
    || (/(^|\s)absolute(\s|$)/.test(el.getAttribute('class') || '') && /(outline|border)-amber-400/.test(el.getAttribute('class') || '')));
  const cellKey = el => `${el.getAttribute('data-row')},${el.getAttribute('data-col')}`;
  const isTargetOrChild = (el, cellKeys, control) => {
    const host = el.closest('[data-row]') || el.closest('[data-coach]');
    if (!host) return false;
    if (host.hasAttribute('data-row')) return cellKeys.includes(cellKey(host));
    return host.getAttribute('data-coach') === control;
  };
  const keys = list => list.map(([r, c]) => `${r},${c}`);
  const expectOnTargets = (label, cellKeys, control = null) => {
    const hs = highlights();
    expect(hs.length, `${label}: control, something is highlighted`).toBeGreaterThan(0);
    const stray = hs.filter(el => !isTargetOrChild(el, cellKeys, control)).map(el => el.outerHTML.slice(0, 80));
    expect(stray, `${label}: every highlight is a target or its child`).toEqual([]);
    if (cellKeys.length) expect(hs.filter(el => el.hasAttribute('data-row')).map(cellKey).sort(), `${label}: every target cell is highlighted`).toEqual([...cellKeys].sort());
  };

  it('every highlighted element is a target cell or control, at every step', async () => {
    await render('first');
    expectOnTargets('step 1', keys([[0, 0], [0, 1], [0, 2], [0, 3]]));
    await stepOne();
    expectOnTargets('step 2', keys([[1, 0], [1, 1], [1, 2], [1, 3]]));
    expect(container.querySelector('[data-row="1"][data-col="0"]').className, 'step 2 is dashed').toContain('outline-dashed');
    await stepTwo();
    expectOnTargets('step 3', [], 'word-play');
    await click('Play word');
    expectOnTargets('step 3 after the speaker', [], 'word-play');
    await drag(...KNIGHT); await advance(FOUND_ADVANCE_MS);
    expectOnTargets('step 4', [], 'word-hint');
    await click('Hint: show first letter');
    expectOnTargets('step 4 after the tap', keys([[0, 5]]));
  });

  it('there is no tutorial overlay element other than the bubble', async () => {
    await render('first');
    // Positioned children of the page. Allowed, by name: the coach bubble, the Skip
    // button, and step 1's drag hand (a demonstration, not a highlight).
    const positioned = () => [...page().children].filter(el => /(^|\s)absolute(\s|$)/.test(el.getAttribute('class') || ''));
    const allowed = el => el.getAttribute('data-testid') === 'coach' || el.getAttribute('data-testid') === 'coach-hand' || el.textContent.trim() === 'Skip tutorial';
    expect(positioned().some(el => el.getAttribute('data-testid') === 'coach'), 'control: the bubble is found').toBe(true);
    expect(positioned().filter(el => !allowed(el)).map(el => el.outerHTML.slice(0, 80))).toEqual([]);
    await stepOne(); await stepTwo();
    expect(positioned().filter(el => !allowed(el)).map(el => el.outerHTML.slice(0, 80))).toEqual([]);
  });

  it('after a resize or rotation, the highlight is on the same cells', async () => {
    await render('first');
    const before = highlights().map(el => (el.hasAttribute('data-row') ? cellKey(el) : el.outerHTML.slice(0, 40))).sort();
    expect(before, 'control: LAMB is highlighted').toEqual(keys([[0, 0], [0, 1], [0, 2], [0, 3]]).sort());
    Element.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, right: 900, bottom: 500, width: 900, height: 500, x: 0, y: 0 });
    await act(async () => { window.dispatchEvent(new Event('resize')); window.dispatchEvent(new Event('orientationchange')); });
    await advance(200);
    const after = highlights().map(el => (el.hasAttribute('data-row') ? cellKey(el) : el.outerHTML.slice(0, 40))).sort();
    expect(after).toEqual(before);
  });
});

describe('G3 and G4 (SF-66b): the finish screen and the tutorial pages', () => {
  const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z])/;
  const classes = el => (el.getAttribute('class') || '').split(/\s+/);
  const noHexOrBlur = () => {
    const els = [...container.querySelectorAll('*')];
    expect(els.length, 'control: the page rendered').toBeGreaterThan(10);
    expect(els.filter(el => HEX.test(el.getAttribute('style') || '') || HEX.test(el.getAttribute('class') || '')).map(el => el.outerHTML.slice(0, 80))).toEqual([]);
    expect(els.filter(el => /(^|\s)(backdrop-)?blur(-|\s|$)/.test(el.getAttribute('class') || '')).map(el => el.outerHTML.slice(0, 80))).toEqual([]);
  };
  const toFinish = async () => { await stepOne(); await stepTwo(); await stepThree(); await stepFour(); };

  it("the finish: centred when it fits, top and scrolling when not; the welcome's width; Home's heading colour and background", async () => {
    await render('replay');
    await toFinish();
    const page = container.querySelector('[data-testid="finish-page"]');
    const content = container.querySelector('[data-testid="finish-content"]');
    expect(page, 'control: the finish screen is showing').not.toBeNull();
    for (const c of ['min-h-[100dvh]', 'flex', 'flex-col', ...HOME_BACKGROUND.split(' ')]) expect(classes(page)).toContain(c);
    for (const c of ['my-auto', 'w-full', 'max-w-sm', 'mx-auto']) expect(classes(content)).toContain(c);
    expect(classes(page)).not.toContain('overflow-hidden');
    expect(content.querySelector('h1').className).toBe(`text-2xl font-bold ${HEADING_TEXT}`);
    const button = [...container.querySelectorAll('button')].find(b => b.textContent.trim() === 'Back to home');
    expect(button.className).toBe(PRIMARY_BUTTON);
    noHexOrBlur();
  });

  it("each mode on the finish screen shows the mode picker's icon for it", async () => {
    await render('replay');
    await toFinish();
    const items = [...container.querySelectorAll('[data-testid="finish-content"] li')].filter(li => li.querySelector('[data-mode-icon]'));
    expect(items.length, 'all five modes').toBe(5);
    for (const li of items) {
      const id = li.querySelector('[data-mode-icon]').getAttribute('data-mode-icon');
      const probe = document.createElement('div');
      const r = createRoot(probe);
      await act(async () => { r.render(React.createElement(MODE_ICONS[id])); });
      const lucide = [...probe.querySelector('svg').classList].find(c => /^lucide-/.test(c));
      expect(li.querySelector('svg').classList.contains(lucide), `${id} uses ${lucide}`).toBe(true);
      await act(async () => r.unmount());
    }
  });

  it("the tutorial steps sit on Home's background, with no hex colour or blur", async () => {
    await render('first');
    const page = container.querySelector('[data-testid="tutorial-board"]').parentElement.parentElement;
    for (const c of HOME_BACKGROUND.split(' ')) expect(classes(page)).toContain(c);
    noHexOrBlur();
  });
});
