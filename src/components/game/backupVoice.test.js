// @vitest-environment jsdom
// SF-60: the Backup Voice has a fixed rate and pitch; a recording whose context was
// closed or replaced is retried once on the current context; each fallback to the
// Backup Voice is reported to Sentry, once per reason per session.
//
// The AudioContext double copies real behaviour, not an assumption (SF-60):
//  - The Web Audio spec's decodeAudioData steps reject only when the document is
//    not fully active; nothing checks for a closed context.
//    (https://webaudio.github.io/web-audio-api/, decodeAudioData)
//  - Chromium (third_party/blink/renderer/modules/webaudio/base_audio_context.cc)
//    has no closed check in decodeAudioData either, so a decode STARTED after
//    close resolves; but closing a context runs RejectPendingDecodeAudioDataResolvers,
//    which rejects every decode still RUNNING with InvalidStateError,
//    "Audio context is going away".
//  - currentTime moves only while the context is running.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sentry = vi.hoisted(() => ({ captureMessage: vi.fn(), captureException: vi.fn(), addBreadcrumb: vi.fn() }));
vi.mock('@sentry/react', () => sentry);
vi.mock('@/lib/platform', () => ({ isWindowsApp: () => false, isNative: () => true, getPlatform: () => 'android' }));

// ── Web Audio double ────────────────────────────────────────────────────────
let contexts = [];
class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.stuck = false;           // when true, resume() cannot bring it back (WebKit after an interruption)
    this.t0 = performance.now();
    this.pending = [];            // decodes still running
    this.decodeCalls = 0;
    this.sources = [];
    this.destination = {};
    contexts.push(this);
  }
  get currentTime() { return this.state === 'running' ? (performance.now() - this.t0) / 1000 : 0; }
  resume() { if (!this.stuck && this.state !== 'closed') this.state = 'running'; return Promise.resolve(); }
  suspend() { if (this.state !== 'closed') this.state = 'suspended'; return Promise.resolve(); }
  close() {
    this.state = 'closed';
    for (const d of this.pending.splice(0)) d.reject(new DOMException('Audio context is going away', 'InvalidStateError'));
    return Promise.resolve();
  }
  decodeAudioData() {
    this.decodeCalls++;
    return new Promise((resolve, reject) => this.pending.push({ resolve: () => resolve({ duration: 0.2, decodedOn: this }), reject }));
  }
  finishDecodes() { for (const d of this.pending.splice(0)) d.resolve(); }
  createBufferSource() {
    const src = { ctx: this, buffer: null, connect() {}, disconnect() {}, start: vi.fn(), stop() {}, onended: null };
    this.sources.push(src);
    return src;
  }
}
const started = ctx => ctx.sources.filter(s => s.start.mock.calls.length > 0);

// ── XHR double: each request waits until the test answers it ───────────────
let xhrs = [];
class MockXHR {
  open(_m, url) { this.url = url; }
  send() { xhrs.push(this); }
  respond(status = 200) { this.status = status; this.response = new ArrayBuffer(8); this.onload(); }
}

// ── speechSynthesis double ─────────────────────────────────────────────────
const VOICES = [
  { name: 'Karen', lang: 'en-AU', localService: true },    // female, not "enhanced"
  { name: 'Daniel', lang: 'en-GB', localService: true },   // male
];
const speech = { speaking: false, speak: vi.fn(), cancel: vi.fn(), pause: vi.fn(), resume: vi.fn(), getVoices: () => VOICES, onvoiceschanged: null };

const until = async (fn, ms = 3000) => { for (let t = 0; t < ms && !fn(); t += 10) await new Promise(r => setTimeout(r, 10)); return fn(); };

let voice;
beforeEach(async () => {
  contexts = []; xhrs = [];
  speech.speak.mockClear(); sentry.captureMessage.mockClear();
  localStorage.clear();
  window.AudioContext = MockAudioContext;
  window.XMLHttpRequest = MockXHR;
  window.speechSynthesis = speech;
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  vi.resetModules();                      // a fresh module: a fresh per-session report limit
  voice = await import('./voiceUtils');
});

// Make the current context fail to resume, then let the app rebuild it, which
// closes it (voiceUtils ensureAudioRunning -> rebuildAudioContext).
async function rebuildCurrentContext() {
  const old = contexts.at(-1);
  old.state = 'interrupted';
  old.stuck = true;
  await voice.ensureAudioRunning();
  expect(old.state, 'control: the old context was closed').toBe('closed');
  return contexts.at(-1);
}

describe('(b) the Backup Voice has a fixed rate and pitch (SF-60)', () => {
  for (const [gender, expectedVoice] of [['female', 'Karen'], ['male', 'Daniel']]) {
    it(`${gender}: rate 0.9 and pitch 1.0, whatever is stored (audio_rate 2, audio_pitch 1.8)`, async () => {
      localStorage.setItem('wf_settings', JSON.stringify({ audio_voice: gender, audio_rate: 2, audio_pitch: 1.8 }));
      const { getLocalSettings } = await import('./offlineStorage');
      await voice.speakText('rain', getLocalSettings());
      expect(speech.speak).toHaveBeenCalledTimes(1);
      const u = speech.speak.mock.calls[0][0];
      expect(u.voice?.name, 'voice selection by gender is unchanged').toBe(expectedVoice);
      expect(u.rate).toBe(0.9);
      expect(u.pitch).toBe(1.0);
    });
  }
});

describe('(c) a closed or replaced context: decode on the current one, retry once (SF-60)', () => {
  it('(c1) closed mid-fetch: the decode runs on the NEW context and the recording plays twice, no Backup Voice', async () => {
    await voice.ensureAudioRunning();
    const a = contexts.at(-1);
    const play = voice.speakWordAudio('knight', { audio_voice: 'female' });
    await until(() => xhrs.length === 1);
    const b = await rebuildCurrentContext();           // A closes while the file is still loading
    xhrs[0].respond(200);
    await until(() => b.pending.length === 1);
    expect(a.decodeCalls, 'nothing is decoded on the closed context').toBe(0);
    b.finishDecodes();
    await play;
    expect(started(b).length, 'the gapless double play, on the current context').toBe(2);
    expect(speech.speak).not.toHaveBeenCalled();
    expect(sentry.captureMessage).not.toHaveBeenCalled();
  });

  it('(c2) closed mid-decode: the decode is rejected, retried once on the new context, and plays; no Backup Voice', async () => {
    await voice.ensureAudioRunning();
    const a = contexts.at(-1);
    const play = voice.speakWordAudio('knight', { audio_voice: 'female' });
    await until(() => xhrs.length === 1);
    xhrs[0].respond(200);
    await until(() => a.pending.length === 1);
    const b = await rebuildCurrentContext();           // rejects A's running decode
    await until(() => xhrs.length === 2);
    expect(xhrs.length, 'retried once: the file is loaded again').toBe(2);
    xhrs[1].respond(200);
    await until(() => b.pending.length === 1);
    b.finishDecodes();
    await play;
    expect(started(b).length).toBe(2);
    expect(started(a).length).toBe(0);
    expect(speech.speak, 'no speechSynthesis call').not.toHaveBeenCalled();
    expect(sentry.captureMessage).not.toHaveBeenCalled();
  });
});

describe('(d) the Backup Voice fallback and its Sentry report (SF-60)', () => {
  // Both attempts lose their context mid-decode.
  async function failTwice(word) {
    const start = xhrs.length;   // read before the play: its first request is sent synchronously
    const play = voice.speakWordAudio(word, { audio_voice: 'female' });
    for (let attempt = 0; attempt < 2; attempt++) {
      expect(await until(() => xhrs.length === start + attempt + 1), `attempt ${attempt + 1} loaded the file`).toBe(true);
      const ctx = contexts.at(-1);
      xhrs.at(-1).respond(200);
      await until(() => ctx.pending.length === 1);
      await rebuildCurrentContext();
    }
    await play;
  }

  it('a recording that fails twice falls back once, with one warning tagged closed-context; a second failure sends no second event', async () => {
    await voice.ensureAudioRunning();
    await failTwice('knight');
    expect(speech.speak).toHaveBeenCalledTimes(1);
    expect(speech.speak.mock.calls[0][0].text).toBe('knight... knight.');
    expect(sentry.captureMessage).toHaveBeenCalledTimes(1);
    const [message, context] = sentry.captureMessage.mock.calls[0];
    expect(message).toMatch(/Backup Voice/);
    expect(context.level).toBe('warning');
    expect(context.tags).toEqual({ voice_fallback_reason: 'closed-context', platform: 'android', online: String(navigator.onLine) });
    expect(context.extra).toEqual({ word: 'KNIGHT' });

    await failTwice('night');
    expect(speech.speak, 'control: the second failure did fall back').toHaveBeenCalledTimes(2);
    expect(sentry.captureMessage, 'one event per reason per session').toHaveBeenCalledTimes(1);
  });

  it('a failed fetch is not retried, falls back once, and is tagged fetch', async () => {
    const play = voice.speakWordAudio('knight', { audio_voice: 'female' });
    await until(() => xhrs.length === 1);
    xhrs[0].respond(404);
    await play;
    expect(xhrs.length).toBe(1);
    expect(speech.speak).toHaveBeenCalledTimes(1);
    expect(sentry.captureMessage).toHaveBeenCalledTimes(1);
    expect(sentry.captureMessage.mock.calls[0][1].tags.voice_fallback_reason).toBe('fetch');
  });
});
