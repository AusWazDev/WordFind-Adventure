// @vitest-environment jsdom
// FB-10 (CR-77): after the screen locks or the app is backgrounded, iOS leaves
// the shared AudioContext 'interrupted' (or, in WebKit, 'running' but silent),
// and before this fix nothing ever resumed or rebuilt it, so every later play
// was silent until the app was force-quit. These tests assert that the next
// play after such an interruption reaches a RUNNING context, and that the
// decoded-audio cache survives a rebuild.
import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest';

const contexts = [];
class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.t0 = performance.now(); // the clock runs while 'running', as a real context's does, so
                                 // CR-82's stall check sees healthy plays (stalls: audioStall.test.js)
    this.destination = {};
    this.started = [];       // { state } at the moment each source started
    this.resumeWorks = true; // false = WebKit's stuck-after-interruption case
    this.closed = false;
    contexts.push(this);
  }
  get currentTime() { return this.state === 'running' ? (performance.now() - this.t0) / 1000 : 0; }
  resume() {
    if (this.resumeWorks && !this.closed) this.state = 'running';
    return Promise.resolve();
  }
  close() { this.closed = true; this.state = 'closed'; return Promise.resolve(); }
  suspend() {
    this.suspendCalls = (this.suspendCalls ?? 0) + 1;
    if (this.state === 'running') this.state = 'suspended';
    return Promise.resolve();
  }
  createBufferSource() {
    const ctx = this;
    return {
      buffer: null, onended: null, connect() {}, disconnect() {}, stop() { stops.push(ctx); },
      start() { ctx.started.push({ state: ctx.state }); },
    };
  }
  decodeAudioData(ab) { decodes.push(ab.url); return Promise.resolve({ duration: 0.2, url: ab.url }); }
}
const decodes = [];
const stops = [];

class MockXHR {
  open(_m, url) { this.url = url; }
  send() { this.status = 200; this.response = { url: this.url }; queueMicrotask(() => this.onload()); }
}

// One voice, so voiceUtils' 200 ms voice poll (started on import, and again by
// any speech fallback) stops on its first tick. With none it ran for 5 s and
// could fire after the environment was torn down: "window is not defined" at
// voiceUtils.jsx:71, failing a green run (SF-25).
const VOICES = [{ name: 'Karen', lang: 'en-AU', localService: true, default: true }];
const speech = { speaking: false, speak: vi.fn(), cancel: vi.fn(), pause: vi.fn(), resume: vi.fn(), getVoices: () => VOICES, onvoiceschanged: null };

let voice;
beforeAll(async () => {
  window.AudioContext = MockAudioContext;
  window.XMLHttpRequest = MockXHR;
  window.speechSynthesis = speech;
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  voice = await import('./voiceUtils');
});

const settle = () => new Promise(r => setTimeout(r, 0));
const current = () => contexts[contexts.length - 1];
const playWord = async word => { voice.speakWordAudio(word); for (let i = 0; i < 6; i++) await settle(); };
function setVisibility(state) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
  document.dispatchEvent(new Event('visibilitychange'));
}

beforeEach(() => {
  speech.cancel.mockClear();
  speech.speak.mockClear();
});

// Before the environment is torn down: stop audio, so any pending CR-82 stall
// check returns without touching `window`, and let any voice poll started
// during the tests reach its first tick, and so stop.
const VOICE_POLL_MS = 200;
const STALL_CHECK_MS = 300;
afterAll(() => { voice.stopAllAudio(); return new Promise(r => setTimeout(r, Math.max(VOICE_POLL_MS, STALL_CHECK_MS) + 100)); });

describe('audio after an interruption (FB-10)', () => {
  it('control: a normal play starts sources on a running context', async () => {
    await playWord('CAT');
    expect(contexts.length).toBeGreaterThan(0);
    expect(current().started.length).toBeGreaterThan(0);
    expect(current().started.every(s => s.state === 'running')).toBe(true);
  });

  it("lock/unlock: a context left 'interrupted' is resumed before the next play", async () => {
    const locked = current();
    locked.state = 'interrupted'; // screen locked
    setVisibility('hidden');
    setVisibility('visible');     // unlocked
    const before = new Map(contexts.map(c => [c, c.started.length]));
    await playWord('DOG');
    const startedNow = contexts.flatMap(c => c.started.slice(before.get(c) ?? 0));
    expect(startedNow.length).toBe(2);                         // the word, twice
    expect(startedNow.every(s => s.state === 'running')).toBe(true);
    expect(locked.started.length).toBe(before.get(locked));    // nothing scheduled on the interrupted one
  });

  it("WebKit stuck case: resume() leaves it 'interrupted', so the context is rebuilt and the cache kept", async () => {
    const before = contexts.length;
    const ctx = current();
    ctx.state = 'interrupted';
    ctx.resumeWorks = false;       // resume() does nothing on this context
    const decodesBefore = decodes.length;
    await playWord('CAT');         // CAT was decoded in the first test
    expect(contexts.length).toBeGreaterThan(before);          // a new context was built
    expect(ctx.closed).toBe(true);                           // the stuck one was closed
    const started = current().started;
    expect(started.length).toBeGreaterThan(0);
    expect(started.every(s => s.state === 'running')).toBe(true);
    expect(decodes.length).toBe(decodesBefore);              // CAT came from the cache, not re-decoded
  });

  it('returning to the foreground stops playing audio and cancels stuck speech', async () => {
    voice.speakWordAudio('FISH');
    setVisibility('hidden');
    setVisibility('visible');
    expect(speech.cancel).toHaveBeenCalled();
  });

  // CR-79: suspend before iOS acts, so neither stuck path (idle: "override
  // interruption" then the lock stopper; playing: left 'interrupted') is reached.
  it('going to the background stops audio and suspends the context; the next play is on a running context', async () => {
    voice.speakWordAudio('CAT');                 // cached, so sources start almost at once
    for (let i = 0; i < 6; i++) await settle();
    const ctx = current();
    expect(ctx.state).toBe('running');           // control: playing before the lock
    const stopsBefore = stops.length;
    setVisibility('hidden');                     // screen locked
    expect(ctx.suspendCalls ?? 0).toBe(1);
    expect(ctx.state).toBe('suspended');
    expect(stops.length).toBeGreaterThan(stopsBefore); // what was playing was stopped
    setVisibility('visible');                    // unlocked
    const before = new Map(contexts.map(c => [c, c.started.length]));
    await playWord('DOG');
    const startedNow = contexts.flatMap(c => c.started.slice(before.get(c) ?? 0));
    expect(startedNow.length).toBe(2);
    expect(startedNow.every(s => s.state === 'running')).toBe(true);
  });
});
