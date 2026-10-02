// @vitest-environment jsdom
// FB-10 (CR-82): on iOS 26 the first play after returning to the foreground can
// STALL: the AudioContext reports 'running' but currentTime never moves, so the
// play is silent. SF-MAC-M measured 11 of 11 foregrounds stalling, and one
// close-and-rebuild of the context plus a replay recovering 11 of 11.
// voiceUtils checks each Web Audio play once, ~300 ms after scheduling it; if
// the clock has not moved, it rebuilds the context and replays that sound once.
import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest';

const breadcrumbs = [];
vi.mock('@sentry/react', () => ({ addBreadcrumb: b => breadcrumbs.push(b) }));

let stallNewContexts = false; // true = every context built from now on stalls too
const contexts = [];
class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.stalled = stallNewContexts;
    this.t0 = performance.now();
    this.destination = {};
    this.started = [];   // the buffer url of every source started on this context
    this.closed = false;
    contexts.push(this);
  }
  // A healthy context's clock follows real time; a stalled one stays at 0.
  get currentTime() { return this.stalled ? 0 : (performance.now() - this.t0) / 1000; }
  resume() { if (!this.closed) this.state = 'running'; return Promise.resolve(); }
  suspend() { return Promise.resolve(); }
  close() { this.closed = true; this.state = 'closed'; return Promise.resolve(); }
  createBufferSource() {
    const ctx = this;
    return { buffer: null, onended: null, connect() {}, disconnect() {}, stop() {}, start() { ctx.started.push(this.buffer.url); } };
  }
  decodeAudioData(ab) { return Promise.resolve({ duration: 0.2, url: ab.url }); }
}
class MockXHR {
  open(_m, url) { this.url = url; }
  send() { this.status = 200; this.response = { url: this.url }; queueMicrotask(() => this.onload()); }
}
const VOICES = [{ name: 'Karen', lang: 'en-AU', localService: true, default: true }];

let voice;
beforeAll(async () => {
  window.AudioContext = MockAudioContext;
  window.XMLHttpRequest = MockXHR;
  window.speechSynthesis = { speaking: false, speak: vi.fn(), cancel: vi.fn(), pause: vi.fn(), resume: vi.fn(), getVoices: () => VOICES, onvoiceschanged: null };
  window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
  voice = await import('./voiceUtils');
});

const wait = ms => new Promise(r => setTimeout(r, ms));
const CAT = '/audio/female/CAT.mp3';
const DOG = '/audio/female/DOG.mp3';
// Starts since the current test began (fresh() records where each context was).
let base = new Map();
const startsOf = (url, list = contexts) => list.reduce((n, c) => n + c.started.slice(base.get(c) ?? 0).filter(u => u === url).length, 0);
// A healthy, running context to start each test from, and nothing playing.
async function fresh({ stalled = false } = {}) {
  voice.stopAllAudio();
  stallNewContexts = false;
  await wait(10);
  const ctx = await voice.ensureAudioRunning();
  ctx.stalled = stalled;
  breadcrumbs.length = 0;
  base = new Map(contexts.map(x => [x, x.started.length]));
  return ctx;
}

beforeEach(() => { stallNewContexts = false; });
afterAll(async () => { voice.stopAllAudio(); await wait(400); });

describe('stalled Web Audio playback is rebuilt and replayed once (FB-10, CR-82)', () => {
  it('a stalled context gets exactly one rebuild and one replay', async () => {
    const ctx = await fresh({ stalled: true });
    const before = contexts.length;
    voice.speakWordAudio('CAT');
    await wait(800);                                   // past the check, the replay and the replay's check
    expect(contexts.length).toBe(before + 1);          // one rebuild
    expect(ctx.closed).toBe(true);                     // the stalled context was closed
    expect(startsOf(CAT, [ctx])).toBe(2);              // the original play (the word, twice)
    expect(startsOf(CAT, contexts.slice(before))).toBe(2); // exactly one replay, on the new context
    expect(breadcrumbs.filter(b => b.category === 'audio').map(b => b.message)).toEqual(['playback stalled; rebuilt the context and replayed']);
  });

  it('a healthy context gets no retry', async () => {
    const ctx = await fresh();
    const before = contexts.length;
    voice.speakWordAudio('CAT');
    await wait(800);
    expect(contexts.length).toBe(before);              // no rebuild
    expect(ctx.closed).toBe(false);
    expect(startsOf(CAT, [ctx])).toBe(2);              // played once
    expect(breadcrumbs).toEqual([]);
  });

  it('a sound stopped before the check (FB-6 stop) gets no retry and no second playback', async () => {
    const ctx = await fresh({ stalled: true });
    const before = contexts.length;
    voice.speakWordAudio('CAT');
    await wait(100);
    voice.stopAllAudio();                              // stopped before the 300 ms check
    await wait(800);
    expect(contexts.length).toBe(before);
    expect(ctx.closed).toBe(false);
    expect(startsOf(CAT)).toBeGreaterThan(0);          // control: it did start
    expect(startsOf(CAT, contexts.slice(before))).toBe(0);
    expect(breadcrumbs).toEqual([]);
  });

  it('a sound replaced by a newer one before the check (FB-6) gets no retry; only the newer one can be retried', async () => {
    const ctx = await fresh({ stalled: true });
    const before = contexts.length;
    voice.speakWordAudio('CAT');
    await wait(100);
    voice.speakWordAudio('DOG');                       // newer play replaces CAT before its check
    await wait(900);
    expect(startsOf(CAT)).toBe(2);         // CAT played once, never replayed
    expect(startsOf(CAT, contexts.slice(before))).toBe(0);
    expect(startsOf(DOG, contexts.slice(before))).toBe(2); // DOG, also stalled, got its own one replay
    expect(contexts.length).toBe(before + 1);
    expect(ctx.closed).toBe(true);
  });

  it('a second stall on the replay does not trigger a third play', async () => {
    const ctx = await fresh({ stalled: true });
    stallNewContexts = true;                           // the rebuilt context stalls too
    const before = contexts.length;
    voice.speakWordAudio('CAT');
    await wait(1100);
    expect(contexts.length).toBe(before + 1);          // rebuilt once, not twice
    expect(startsOf(CAT, [ctx])).toBe(2);
    expect(startsOf(CAT, contexts.slice(before))).toBe(2); // one replay only
    expect(breadcrumbs.map(b => b.message)).toEqual([
      'playback stalled; rebuilt the context and replayed',
      'playback still stalled after the replay; not retried',
    ]);
  });
});
