// @vitest-environment jsdom
// One playback channel (CR-63, brief SF-9). AudioContext, XHR and
// speechSynthesis are mocked; XHR responses are released by hand so the
// order of fetch completion can be controlled.
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────────
const sources = [];        // every AudioBufferSourceNode created, in order
const pending = new Map(); // url -> XHR awaiting release

class MockAudioContext {
  constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
  resume() { return Promise.resolve(); }
  createBufferSource() {
    const src = { buffer: null, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null };
    sources.push(src);
    return src;
  }
  decodeAudioData(ab) { return Promise.resolve({ duration: 0.5, url: ab.url }); }
}

class MockXHR {
  open(_m, url) { this.url = url; }
  send() { pending.set(this.url, this); }
  respond(status = 200) {
    this.status = status;
    this.response = { url: this.url };
    this.onload();
  }
}

const speech = {
  speaking: false,
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: () => [{ name: 'Karen', lang: 'en-AU', localService: true }],
  onvoiceschanged: null,
};

let voice;
beforeAll(async () => {
  window.AudioContext = MockAudioContext;
  window.XMLHttpRequest = MockXHR;
  window.speechSynthesis = speech;
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  voice = await import('./voiceUtils');
});

const flush = () => new Promise(r => setTimeout(r, 0));
const release = async (url, status = 200) => {
  const xhr = pending.get(url);
  if (!xhr) throw new Error(`no pending request for ${url}`);
  pending.delete(url);
  xhr.respond(status);
  await flush();
};
const sourcesFor = url => sources.filter(s => s.buffer?.url === url);
const W = word => `/audio/female/${word}.mp3`;
const P = key => `/audio/phrases/female_${key}.mp3`;

beforeEach(() => {
  sources.length = 0;
  pending.clear();
  speech.speak.mockClear();
  speech.cancel.mockClear();
});

// ── (a) a second play stops every source from the first ──────────────────────
describe('(a) newest play stops everything already playing', () => {
  it('finding the word mid-announcement stops both repetitions of the announcement', async () => {
    voice.speakWordAudio('CAT');
    await release(W('CAT'));
    const announcement = sourcesFor(W('CAT'));
    expect(announcement).toHaveLength(2); // the word twice, 400 ms apart
    expect(announcement.every(s => s.start.mock.calls.length === 1)).toBe(true);

    voice.speakPhraseAndWord('great_you_found', 'CAT', 'Great! You found cat!');
    for (const s of announcement) {
      expect(s.stop).toHaveBeenCalled();
      expect(s.disconnect).toHaveBeenCalled();
    }
  });

  it('two quick finds: the first phrase is stopped when the second starts', async () => {
    voice.speakPhraseAndWord('great_you_found', 'DOG', 'Great! You found dog!');
    await release(P('great_you_found'));
    await release(W('DOG'));
    const first = sources.slice();
    expect(first).toHaveLength(2);
    voice.speakPhraseAndWord('great_you_found', 'EEL', 'Great! You found eel!');
    for (const s of first) expect(s.stop).toHaveBeenCalled();
  });
});

// ── (b) a stale fetch never starts ───────────────────────────────────────────
describe('(b) a play whose fetch resolves after a newer play never starts', () => {
  it('the older announcement stays silent when its MP3 arrives late', async () => {
    voice.speakWordAudio('EMU');   // older request, fetch in flight
    voice.speakWordAudio('OWL');   // newer request
    await release(W('OWL'));
    expect(sourcesFor(W('OWL'))).toHaveLength(2);
    await release(W('EMU'));       // older fetch completes last
    expect(sourcesFor(W('EMU'))).toHaveLength(0);
    expect(sourcesFor(W('OWL')).every(s => s.stop.mock.calls.length === 0)).toBe(true);
  });

  it('leaving the game (stopAllAudio) while a fetch is in flight: nothing plays afterwards', async () => {
    voice.speakWordAudio('YAK');
    voice.stopAllAudio();
    await release(W('YAK'));
    expect(sourcesFor(W('YAK'))).toHaveLength(0);
  });
});

// ── (c) stopAllAudio also cancels speech ─────────────────────────────────────
describe('(c) stopAllAudio cancels the Web Speech fallback too', () => {
  it('cancels speech started by the fallback path', async () => {
    await voice.speakText('hello', {});
    expect(speech.speak).toHaveBeenCalledTimes(1);
    speech.cancel.mockClear();
    voice.stopAllAudio();
    expect(speech.cancel).toHaveBeenCalledTimes(1);
  });

  it('a new MP3 play cancels fallback speech that is still talking (no MP3 and speech together)', async () => {
    const p = voice.speakWordAudio('GNU');
    await release(W('GNU'), 404); // MP3 missing -> Web Speech fallback
    await p;
    expect(speech.speak).toHaveBeenCalledTimes(1);
    speech.cancel.mockClear();
    voice.speakWordAudio('ANT');
    expect(speech.cancel).toHaveBeenCalled();
  });

  it('does not cancel the DEF-38 unlock utterance when no speech of ours is active', async () => {
    voice.stopAllAudio(); // clear any tracked speech from earlier tests
    await voice.unlockAudio();
    speech.cancel.mockClear();
    voice.stopAllAudio();
    expect(speech.cancel).not.toHaveBeenCalled();
  });
});
