/**
 * voiceUtils.jsx
 *
 * Text-to-speech with:
 *   - iOS Safari unlock (requires user gesture before audio plays)
 *   - Patient voice loading (iOS can take 2-3s to expose enhanced voices)
 *   - Neural/enhanced voice prioritisation
 *   - Chrome long-utterance keep-alive fix
 */
import * as Sentry from '@sentry/react';
import { getPlatform } from '@/lib/platform';
import { isElectronPage } from '@/lib/staleServiceWorkers';

// ─── iOS audio unlock ─────────────────────────────────────────────────────────
let iosUnlocked = false;

export async function unlockAudio() {
  // Unlock Web Speech API (iOS requires a gesture before speechSynthesis plays)
  if (!iosUnlocked && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance('');
    utterance.volume = 0;
    utterance.onend = () => { iosUnlocked = true; };
    window.speechSynthesis.speak(utterance);
  }
  // Unlock Web Audio API — Android/iOS suspend AudioContext until first user gesture.
  // Await it so the context is running before any audio is scheduled. Any state
  // that is not 'running' is handled, including iOS's 'interrupted' (FB-10, CR-77).
  await ensureAudioRunning();
}

// ─── Voice loader — patient version for iOS ───────────────────────────────────
// iOS Safari loads voices asynchronously and slowly. We poll up to 5 seconds
// rather than giving up after 1 second, which was causing the robotic fallback.

let cachedVoices = null;

export function getVoices() {
  // Return cached voices if already loaded
  if (cachedVoices && cachedVoices.length > 0) {
    return Promise.resolve(cachedVoices);
  }

  return new Promise(resolve => {
    // NOTE: Do NOT cache the synchronous result from the first getVoices() call.
    // On Chrome/Windows, getVoices() returns only local (Microsoft) voices synchronously,
    // then fires voiceschanged a moment later with the full list including Google voices.
    // Caching early locks in the robotic Microsoft voice instead of Google US English.
    // Always wait for voiceschanged (or the poll) so the full voice list is cached.

    let resolved = false;
    let poll = null;

    const onChanged = () => {
      if (resolved) return;
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        resolved = true;
        cachedVoices = v;
        clearInterval(poll); // the voices came by the event, so stop polling too (CR-82)
        window.speechSynthesis.onvoiceschanged = null;
        resolve(v);
      }
    };

    window.speechSynthesis.onvoiceschanged = onChanged;

    // Trigger voice loading on browsers that need an explicit call (Chrome, some Android)
    window.speechSynthesis.getVoices();

    // Poll every 200ms for up to 5 seconds — iOS enhanced voices
    // (Karen, Siri, Daniel etc.) often appear 1-3s after page load.
    // On Chrome, voiceschanged fires before the first poll tick so this is a no-op.
    let elapsed = 0;
    poll = setInterval(() => {
      if (resolved) { clearInterval(poll); return; } // resolved by the event before this started
      elapsed += 200;
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0 && !resolved) {
        resolved = true;
        cachedVoices = v;
        clearInterval(poll);
        window.speechSynthesis.onvoiceschanged = null;
        resolve(v);
      }
      if (elapsed >= 5000 && !resolved) {
        resolved = true;
        clearInterval(poll);
        resolve(window.speechSynthesis.getVoices()); // whatever we have
      }
    }, 200);
  });
}

// Pre-warm the voice list as early as possible so they're ready when needed
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getVoices();
}

// ─── Voice scoring ────────────────────────────────────────────────────────────
// iOS exposes enhanced voices with names like:
//   "Karen (Enhanced)", "Daniel (Enhanced)", "Samantha (Enhanced)"
// These are significantly better than the base versions.
// Windows Edge exposes neural voices like "Microsoft Aria Online (Natural)"

const QUALITY_MARKERS = [
  'enhanced',   // iOS enhanced voices — best on iPhone/iPad
  'premium',    // iOS premium voices
  'neural',     // Windows/Android neural voices
  'wavenet',    // Google WaveNet
  'natural',    // Microsoft Natural voices
  'online',     // Often indicates higher quality cloud voices
  'google',     // Google TTS voices — excellent quality in Chrome
];

// Female voices ordered by quality per platform
const FEMALE_VOICES = [
  // iOS enhanced (best)
  'Karen',        // Australian — very natural on iOS
  'Samantha',     // US — classic iOS high quality
  'Tessa',        // South African
  'Moira',        // Irish
  'Fiona',        // Scottish
  'Ava',          // US
  'Victoria',     // US
  'Allison',      // US
  'Susan',        // US
  // Google
  'Google US English',
  'Google UK English Female',
  'Google Australian English',
  // Windows
  'Zira',
  'Hazel',
  // Fallback markers
  'female', 'woman',
];

// Male voices ordered by quality per platform
const MALE_VOICES = [
  // iOS enhanced (best)
  'Daniel',       // UK — very natural on iOS
  'Alex',         // US — macOS classic
  'Oliver',       // UK
  'Arthur',       // UK
  'Aaron',        // US
  'Fred',         // macOS
  // Google
  'Google UK English Male',
  // Windows
  'David', 'Mark', 'James',
  // Fallback markers
  'male', 'man',
];

function scoreVoice(voice, genderPref) {
  let score = 0;
  const nameLower = voice.name.toLowerCase();

  // Biggest bonus for enhanced/neural quality markers
  if (QUALITY_MARKERS.some(m => nameLower.includes(m))) score += 200;

  // English language
  if (voice.lang && voice.lang.startsWith('en')) score += 30;

  // Local/on-device — small bonus, but NOT for old Windows Desktop SAPI voices
  // (e.g. "Microsoft Zira Desktop", "Microsoft David Desktop" — very robotic)
  if (voice.localService && !nameLower.includes('desktop')) score += 15;

  // Actively penalise old Windows Desktop SAPI voices
  if (nameLower.includes('desktop')) score -= 100;

  // Named voice match
  const preferredList = genderPref === 'female' ? FEMALE_VOICES : MALE_VOICES;
  const rankIndex = preferredList.findIndex(n => nameLower.includes(n.toLowerCase()));
  if (rankIndex !== -1) score += Math.max(0, 60 - rankIndex * 3);

  return score;
}

export function getPreferredVoice(voices, genderPreference = 'female') {
  if (!voices || voices.length === 0) return null;

  const englishVoices = voices.filter(v => v.lang && v.lang.startsWith('en'));
  const pool = englishVoices.length > 0 ? englishVoices : voices;

  const scored = pool
    .map(v => ({ voice: v, score: scoreVoice(v, genderPreference) }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.voice || null;
}

// ─── One playback channel (CR-63, brief SF-9) ─────────────────────────────────
// At most one thing speaks at a time, and the newest request wins. Every public
// play function calls beginPlay(), which stops everything playing and bumps the
// generation. After each await, a play checks its generation is still current
// and gives up if a newer play (or stopAllAudio) has happened since.

const _activeSources = new Set();
let _generation = 0;
// True only while an utterance started by speakText is queued or speaking. The
// DEF-38 unlock utterance in unlockAudio() is deliberately NOT tracked, so
// stopAllAudio() never cancels it.
let _speechActive = false;

export function stopAllAudio() {
  _generation++;
  for (const src of _activeSources) {
    src.onended = null;
    try { src.stop(); } catch { /* already stopped */ }
    try { src.disconnect(); } catch { /* already disconnected */ }
  }
  _activeSources.clear();
  if (_speechActive && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  _speechActive = false;
}

function beginPlay() {
  stopAllAudio();
  return _generation;
}

const isCurrent = generation => generation === _generation;

// ─── Main speak function ──────────────────────────────────────────────────────
export const BACKUP_VOICE_RATE = 0.9;
export const BACKUP_VOICE_PITCH = 1.0;

export async function speakText(text, settings = {}) {
  if (!('speechSynthesis' in window)) return;
  const generation = beginPlay();

  window.speechSynthesis.cancel();

  // Brief pause after cancel — Chrome needs this to reset
  await new Promise(resolve => setTimeout(resolve, 150));
  if (!isCurrent(generation)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const genderPref = settings.audio_voice || 'female';

  // SF-60: a fixed, natural rate and pitch. The stored audio_rate and audio_pitch
  // (wf_settings) are no longer read; their sliders were removed.
  utterance.rate   = BACKUP_VOICE_RATE;
  utterance.volume = 1;
  utterance.pitch  = BACKUP_VOICE_PITCH;

  // Select best voice
  const voices = await getVoices();
  if (!isCurrent(generation)) return;
  const voice = getPreferredVoice(voices, genderPref);
  if (voice) utterance.voice = voice;

  // Chrome keep-alive fix for long utterances
  const keepAlive = setInterval(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      clearInterval(keepAlive);
    }
  }, 5000);

  const finished = () => {
    clearInterval(keepAlive);
    if (isCurrent(generation)) _speechActive = false;
  };
  utterance.onend   = finished;
  utterance.onerror = finished;

  _speechActive = true;
  window.speechSynthesis.speak(utterance);
}

// ─── Web Audio API — gapless, seamless playback ───────────────────────────────
// Uses a shared AudioContext for sample-accurate scheduling.
// Unlocked on the first user gesture via unlockAudio().

let _audioCtx = null;

function createAudioContext() {
  return new (window.AudioContext || window.webkitAudioContext)();
}

function getAudioContext() {
  if (!_audioCtx) _audioCtx = createAudioContext();
  return _audioCtx;
}

// ─── Interruptions (FB-10, CR-77) ─────────────────────────────────────────────
// On iOS a screen lock, a call or backgrounding leaves the context 'interrupted'
// (WebKit-only), 'suspended', or occasionally 'running' but silent. Before this,
// only 'suspended' was ever resumed, so after a lock every play was silent until
// a force-quit. Now every play awaits ensureAudioRunning(), and returning to the
// foreground rebuilds the context. AudioBuffers are not tied to a context, so
// the decoded cache below survives a rebuild.

const RESUME_TIMEOUT_MS = 400;

function withTimeout(promise, ms) {
  return Promise.race([Promise.resolve(promise).catch(() => {}), new Promise(r => setTimeout(r, ms))]);
}

function rebuildAudioContext() {
  const old = _audioCtx;
  _audioCtx = createAudioContext();
  if (old) { try { old.close(); } catch { /* already closed */ } } // not awaited: close can hang when interrupted
  return _audioCtx;
}

// Returns a context that is running, or the best one available. resume() is
// called synchronously at the top, so when this runs inside a tap handler the
// call is still inside the user gesture iOS requires.
export async function ensureAudioRunning() {
  if (typeof window === 'undefined' || !(window.AudioContext || window.webkitAudioContext)) return null;
  let ctx = getAudioContext();
  if (ctx.state === 'running') return ctx;
  await withTimeout(ctx.resume(), RESUME_TIMEOUT_MS);
  if (ctx.state === 'running') return ctx;
  // Still not running: WebKit can leave a context stuck after an interruption.
  ctx = rebuildAudioContext();
  if (ctx.state !== 'running') await withTimeout(ctx.resume(), RESUME_TIMEOUT_MS);
  return ctx;
}

// Back in the foreground: stop whatever was playing, clear any speech stuck in
// the queue, and replace the context so a 'running but silent' one cannot linger.
function recoverAudioAfterInterruption() {
  stopAllAudio();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch { /* not available */ }
  }
  if (!_audioCtx) return; // nothing has played yet
  rebuildAudioContext();
  // Outside a gesture the new context may stay suspended; the next play's
  // ensureAudioRunning() resumes it inside the tap.
  withTimeout(_audioCtx.resume(), RESUME_TIMEOUT_MS);
}

// Going to the background (CR-79): stop what is playing and suspend the context
// ourselves, before iOS acts. Left alone, an idle context gets WebKit's
// "override interruption" and then iOS's lock stopper, which refuses the
// restart (-16980); a playing one is interrupted and left 'interrupted' with
// its clock frozen. A script-suspended context is resumed by the next tap's
// ensureAudioRunning(). The iOS AppDelegate also suspends all media playback.
function suspendAudioForBackground() {
  stopAllAudio();
  if (!_audioCtx) return;
  try { Promise.resolve(_audioCtx.suspend()).catch(() => {}); } catch { /* closed */ }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') suspendAudioForBackground();
    else if (document.visibilityState === 'visible') recoverAudioAfterInterruption();
  });
}
if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', event => { if (event.persisted) recoverAudioAfterInterruption(); });
}

// In-memory cache of decoded AudioBuffers — keyed by URL.
// Avoids re-fetching and re-decoding on every tap; makes repeat plays instant.
const _bufferCache = new Map();

// XHR is used instead of fetch() because Capacitor's WKWebView custom URL scheme
// (capacitor://) does not reliably stream ArrayBuffer responses through the fetch API.
// XHR with responseType='arraybuffer' works correctly for both https:// and capacitor://.
function fetchArrayBuffer(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      // status 0 = local/custom scheme (capacitor://, file://) — treat as success
      if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
        resolve(xhr.response);
      } else {
        reject(new Error(`HTTP ${xhr.status} for ${url}`));
      }
    };
    xhr.onerror = () => reject(new Error(`Network error for ${url}`));
    xhr.send();
  });
}

// ─── Why a recording failed (SF-60) ───────────────────────────────────────────
// Every failure on the recorded path carries a reason: 'fetch', 'decode',
// 'closed-context', 'play', or (unlabelled) 'other'. A 'closed-context' failure
// is retried once on the current context; any other goes to the Backup Voice.
function audioPathError(reason, cause) {
  const err = new Error(`recorded audio failed: ${reason}`);
  err.audioReason = reason;
  err.cause = cause;
  return err;
}
const reasonOf = err => err?.audioReason || 'other';

// The context a step used has gone: closed, or replaced by rebuildAudioContext().
// Chromium rejects a decode still running when its context closes with
// InvalidStateError ("Audio context is going away"); see SF-60 in the Change Register.
function contextGone(ctx, err) {
  return ctx !== _audioCtx || ctx?.state === 'closed' || err?.name === 'InvalidStateError';
}

async function fetchBuffer(url) {
  if (_bufferCache.has(url)) return _bufferCache.get(url);
  let arrayBuffer;
  try {
    arrayBuffer = await fetchArrayBuffer(url);
  } catch (e) {
    throw audioPathError('fetch', e);
  }
  // SF-60: decode on the context that is current NOW, not one captured before the
  // fetch was awaited (a rebuild during the fetch closes the old one).
  const ctx = getAudioContext();
  let buf;
  try {
    buf = await ctx.decodeAudioData(arrayBuffer);
  } catch (e) {
    throw audioPathError(contextGone(ctx, e) ? 'closed-context' : 'decode', e);
  }
  _bufferCache.set(url, buf);
  return buf;
}

/**
 * Preload audio files for the current game in the background.
 * Call this after game data is available — fires-and-forgets so it never
 * blocks the UI. 404s (missing sentence files) are silently ignored.
 */
export function preloadGameAudio(words, settings = {}) {
  const gender = settings.audio_voice || 'female';
  const urls = [];

  for (const word of words) {
    const upper = word.toUpperCase();
    urls.push(`/audio/${gender}/${upper}.mp3`);
    urls.push(`/audio/sentences/${gender}_${upper}.mp3`);
  }

  for (const key of ['great_you_found', 'game_complete', 'all_words_found', 'hidden_word_was']) {
    urls.push(`/audio/phrases/${gender}_${key}.mp3`);
  }

  urls.forEach(url => fetchBuffer(url).catch(() => {}));
}

// Schedule one or more pre-decoded AudioBuffers to play back-to-back with
// zero gap. Buffers are passed in playback order.
// Every source is tracked so stopAllAudio() can stop it (CR-63). When `sources`
// is given, the sources started are also collected into it.
function scheduleBuffers(buffers, startTime, sources) {
  const ctx = getAudioContext();
  let t = startTime;
  for (const buf of buffers) {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    _activeSources.add(src);
    src.onended = () => { _activeSources.delete(src); };
    src.start(t);
    sources?.push(src);
    t += buf.duration;
  }
  return t; // returns the time when the last buffer ends
}

// ─── Stalled playback (FB-10, CR-82) ──────────────────────────────────────────
// On iOS 26 the first play after returning to the foreground can stall: the
// context reports 'running' but currentTime never moves, so nothing is heard.
// Measured on device (SF-MAC-M): 11 of 11 foregrounds stalled, and closing and
// rebuilding the context, then replaying, recovered 11 of 11 within ~0.3 s.
// So each play is checked once, STALL_CHECK_MS after it is scheduled. If the
// clock has not moved, the play's sources are stopped, the context is rebuilt
// (the decoded _bufferCache is kept) and the sound is replayed, once. A play that
// was stopped or replaced in the meantime (CR-63) is left alone.
const STALL_CHECK_MS = 300;

const wait = ms => new Promise(r => setTimeout(r, ms));

function stopSources(sources) {
  for (const src of sources) {
    src.onended = null;
    try { src.stop(); } catch { /* already stopped */ }
    try { src.disconnect(); } catch { /* already disconnected */ }
    _activeSources.delete(src);
  }
}

// Runs `schedule` on ctx, labelling a failure to start playback (SF-60): a context
// that is closed or has been replaced is 'closed-context', anything else 'play'.
function startOn(ctx, schedule, sources) {
  try {
    return schedule(ctx, sources);
  } catch (e) {
    throw audioPathError(contextGone(ctx, e) ? 'closed-context' : 'play', e);
  }
}

// `schedule(ctx, sources)` schedules the sound on ctx and returns its end time.
async function playWatched(generation, schedule) {
  let ctx = await ensureAudioRunning();
  if (!isCurrent(generation)) return;
  let sources = [];
  let startedAt = ctx.currentTime;
  let endTime = startOn(ctx, schedule, sources);
  await wait(STALL_CHECK_MS);
  if (!isCurrent(generation)) return;            // stopped or replaced: no retry

  if (ctx.currentTime <= startedAt) {
    stopSources(sources);
    rebuildAudioContext();
    ctx = await ensureAudioRunning();
    if (!isCurrent(generation)) return;
    Sentry.addBreadcrumb({ category: 'audio', message: 'playback stalled; rebuilt the context and replayed', level: 'warning' });
    sources = [];
    startedAt = ctx.currentTime;
    endTime = startOn(ctx, schedule, sources);    // the one and only replay
    await wait(STALL_CHECK_MS);
    if (!isCurrent(generation)) return;
    if (ctx.currentTime <= startedAt) {
      Sentry.addBreadcrumb({ category: 'audio', message: 'playback still stalled after the replay; not retried', level: 'warning' });
      return;
    }
  }
  await wait(Math.max(0, (endTime - ctx.currentTime) * 1000 + 50));
}

// SF-60: a recording that failed because its context was closed or replaced is
// tried ONCE more, on the current context. Any other failure, or a second one,
// is thrown to the caller, which falls back to the Backup Voice.
async function withContextRetry(generation, attempt) {
  try {
    return await attempt();
  } catch (e) {
    if (reasonOf(e) !== 'closed-context' || !isCurrent(generation)) throw e;
    return attempt();
  }
}

// SF-60: each Backup Voice fallback sends one Sentry warning, at most one per
// reason per app session. Only the reason, the platform, whether the device
// reports itself online, and the word are sent. A failure to report never stops
// the Backup Voice from speaking.
const _fallbackReasonsReported = new Set();

function platformTag() {
  try {
    const p = getPlatform();
    return p === 'web' && isElectronPage() ? 'electron' : p;
  } catch { return 'unknown'; }
}

function reportFallback(err, word) {
  const reason = reasonOf(err);
  if (_fallbackReasonsReported.has(reason)) return;
  _fallbackReasonsReported.add(reason);
  try {
    Sentry.captureMessage('Backup Voice used: recorded audio failed', {
      level: 'warning',
      tags: {
        voice_fallback_reason: reason,
        platform: platformTag(),
        online: String(typeof navigator !== 'undefined' ? navigator.onLine : 'unknown'),
      },
      extra: word ? { word } : undefined,
    });
  } catch { /* reporting must never block the Backup Voice */ }
}

async function fallBackToBackupVoice(err, word, text, settings) {
  reportFallback(err, word);
  await speakText(text, settings);
}

// Fetch all urls in parallel, then play them gaplessly in sequence — unless a
// newer play started while the fetch was in flight.
async function playSeamless(generation, ...urls) {
  const buffers = await Promise.all(urls.map(fetchBuffer));
  if (!isCurrent(generation)) return;
  await playWatched(generation, (ctx, sources) => scheduleBuffers(buffers, ctx.currentTime + 0.05, sources));
}

/**
 * Speak a word using its pre-generated MP3, played twice with a natural
 * 400ms pause between repetitions. Falls back to Web Speech API.
 */
export async function speakWordAudio(word, settings = {}) {
  const gender = settings.audio_voice || 'female';
  const upper  = word.toUpperCase();
  const url    = `/audio/${gender}/${upper}.mp3`;
  const generation = beginPlay();

  try {
    await withContextRetry(generation, async () => {
      const buf = await fetchBuffer(url);
      if (!isCurrent(generation)) return;
      await playWatched(generation, (ctx, sources) => {
        const t1 = ctx.currentTime + 0.05;
        const t2 = t1 + buf.duration + 0.4;   // 400ms gap — intentional for word repetition
        scheduleBuffers([buf], t1, sources);
        return scheduleBuffers([buf], t2, sources);
      });
    });
  } catch (err) {
    if (!isCurrent(generation)) return;
    const spoken = word.toLowerCase();
    await fallBackToBackupVoice(err, upper, `${spoken}... ${spoken}.`, settings);
  }
}

/**
 * Play a sentence MP3 for a tricky word in Audio Challenge.
 * Each file contains the full spoken audio: "word... sentence... word."
 * Falls back to Web Speech API using the sentence text.
 */
export async function speakSentenceAudio(word, sentence, settings = {}) {
  const gender = settings.audio_voice || 'female';
  const upper  = word.toUpperCase();
  const generation = beginPlay();

  try {
    await withContextRetry(generation, () => playSeamless(generation, `/audio/sentences/${gender}_${upper}.mp3`));
  } catch (err) {
    if (!isCurrent(generation)) return;
    const spoken = word.toLowerCase();
    await fallBackToBackupVoice(err, upper, `${spoken}... ${sentence}... ${spoken}.`, settings);
  }
}

/**
 * Play a fixed phrase MP3 followed immediately by a word MP3 — gapless.
 * Used for "Great! You found [word]" and "Amazing! The hidden word was [word]".
 * Falls back to speakText(fallbackText) on any error.
 */
export async function speakPhraseAndWord(phraseKey, word, fallbackText, settings = {}) {
  const gender = settings.audio_voice || 'female';
  const upper  = word.toUpperCase();
  const generation = beginPlay();

  try {
    await withContextRetry(generation, () => playSeamless(
      generation,
      `/audio/phrases/${gender}_${phraseKey}.mp3`,
      `/audio/${gender}/${upper}.mp3`
    ));
  } catch (err) {
    if (!isCurrent(generation)) return;
    await fallBackToBackupVoice(err, upper, fallbackText, settings);
  }
}

/**
 * Play a fixed phrase MP3 with no following word.
 * Used for "Incredible! All words found! Now find the hidden bonus word!".
 * Falls back to speakText(fallbackText) on any error.
 */
export async function speakFixedPhrase(phraseKey, fallbackText, settings = {}) {
  const gender = settings.audio_voice || 'female';
  const generation = beginPlay();

  try {
    await withContextRetry(generation, () => playSeamless(generation, `/audio/phrases/${gender}_${phraseKey}.mp3`));
  } catch (err) {
    if (!isCurrent(generation)) return;
    await fallBackToBackupVoice(err, undefined, fallbackText, settings);
  }
}

// ─── Debug ────────────────────────────────────────────────────────────────────

