/**
 * voiceUtils.jsx
 *
 * Text-to-speech with:
 *   - iOS Safari unlock (requires user gesture before audio plays)
 *   - Patient voice loading (iOS can take 2-3s to expose enhanced voices)
 *   - Neural/enhanced voice prioritisation
 *   - Chrome long-utterance keep-alive fix
 */

// ─── iOS audio unlock ─────────────────────────────────────────────────────────
let iosUnlocked = false;

export function unlockAudio() {
  // Unlock Web Speech API (iOS requires a gesture before speechSynthesis plays)
  if (!iosUnlocked && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance('');
    utterance.volume = 0;
    utterance.onend = () => { iosUnlocked = true; };
    window.speechSynthesis.speak(utterance);
  }
  // Unlock Web Audio API (iOS suspends AudioContext until first user gesture)
  if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
    getAudioContext();
  }
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

    const onChanged = () => {
      if (resolved) return;
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        resolved = true;
        cachedVoices = v;
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
    const poll = setInterval(() => {
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

// ─── Main speak function ──────────────────────────────────────────────────────
export async function speakText(text, settings = {}) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  // Brief pause after cancel — Chrome needs this to reset
  await new Promise(resolve => setTimeout(resolve, 150));

  const utterance = new SpeechSynthesisUtterance(text);
  const genderPref = settings.audio_voice || 'female';

  utterance.rate   = settings.audio_rate  ?? 0.78;  // deliberate pace — clearer for spelling
  utterance.volume = 1;
  utterance.pitch  = settings.audio_pitch ?? 1.0;

  // Select best voice
  const voices = await getVoices();
  const voice = getPreferredVoice(voices, genderPref);
  if (voice) {
    utterance.voice = voice;
    // On iOS, enhanced voices sound best at pitch 1.0 — avoid tweaking
    if (!voice.name.toLowerCase().includes('enhanced')) {
      utterance.pitch = genderPref === 'female'
        ? Math.min((settings.audio_pitch ?? 1.0) * 1.05, 1.4)
        : Math.max((settings.audio_pitch ?? 1.0) * 0.92, 0.7);
    }
  }

  // Chrome keep-alive fix for long utterances
  const keepAlive = setInterval(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      clearInterval(keepAlive);
    }
  }, 5000);

  utterance.onend   = () => clearInterval(keepAlive);
  utterance.onerror = () => clearInterval(keepAlive);

  window.speechSynthesis.speak(utterance);
}

// ─── Web Audio API — gapless, seamless playback ───────────────────────────────
// Uses a shared AudioContext for sample-accurate scheduling.
// Unlocked on the first user gesture via unlockAudio().

let _audioCtx = null;

function getAudioContext() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

// In-memory cache of decoded AudioBuffers — keyed by URL.
// Avoids re-fetching and re-decoding on every tap; makes repeat plays instant.
const _bufferCache = new Map();

async function fetchBuffer(url) {
  if (_bufferCache.has(url)) return _bufferCache.get(url);
  const ctx = getAudioContext();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = await ctx.decodeAudioData(await res.arrayBuffer());
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
function scheduleBuffers(buffers, startTime) {
  const ctx = getAudioContext();
  let t = startTime;
  for (const buf of buffers) {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(t);
    t += buf.duration;
  }
  return t; // returns the time when the last buffer ends
}

// Fetch all urls in parallel, then play them gaplessly in sequence.
async function playSeamless(...urls) {
  const buffers = await Promise.all(urls.map(fetchBuffer));
  const ctx     = getAudioContext();
  const endTime = scheduleBuffers(buffers, ctx.currentTime + 0.05);
  return new Promise(r => setTimeout(r, (endTime - ctx.currentTime) * 1000 + 50));
}

/**
 * Speak a word using its pre-generated MP3, played twice with a natural
 * 400ms pause between repetitions. Falls back to Web Speech API.
 */
export async function speakWordAudio(word, settings = {}) {
  const gender = settings.audio_voice || 'female';
  const upper  = word.toUpperCase();
  const url    = `/audio/${gender}/${upper}.mp3`;

  try {
    const buf = await fetchBuffer(url);
    const ctx = getAudioContext();
    const t1  = ctx.currentTime + 0.05;
    const t2  = t1 + buf.duration + 0.4;   // 400ms gap — intentional for word repetition
    scheduleBuffers([buf], t1);
    scheduleBuffers([buf], t2);
    await new Promise(r => setTimeout(r, (t2 + buf.duration - ctx.currentTime) * 1000 + 50));
  } catch {
    const spoken = word.toLowerCase();
    await speakText(`${spoken}... ${spoken}.`, settings);
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

  try {
    await playSeamless(`/audio/sentences/${gender}_${upper}.mp3`);
  } catch {
    const spoken = word.toLowerCase();
    await speakText(`${spoken}... ${sentence}... ${spoken}.`, settings);
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

  try {
    await playSeamless(
      `/audio/phrases/${gender}_${phraseKey}.mp3`,
      `/audio/${gender}/${upper}.mp3`
    );
  } catch {
    await speakText(fallbackText, settings);
  }
}

/**
 * Play a fixed phrase MP3 with no following word.
 * Used for "Incredible! All words found! Now find the hidden bonus word!".
 * Falls back to speakText(fallbackText) on any error.
 */
export async function speakFixedPhrase(phraseKey, fallbackText, settings = {}) {
  const gender = settings.audio_voice || 'female';

  try {
    await playSeamless(`/audio/phrases/${gender}_${phraseKey}.mp3`);
  } catch {
    await speakText(fallbackText, settings);
  }
}

// ─── Debug ────────────────────────────────────────────────────────────────────

/**
 * Debug helper — call from browser console to see what voices are available
 * and how they score on the current device:
 *
 *   (async () => { const m = await import('/src/components/game/voiceUtils.jsx'); console.table(await m.diagnoseVoices()); })()
 */
export async function diagnoseVoices() {
  const voices = await getVoices();
  return voices
    .map(v => ({
      name: v.name,
      lang: v.lang,
      local: v.localService,
      score_f: scoreVoice(v, 'female'),
      score_m: scoreVoice(v, 'male'),
    }))
    .sort((a, b) => b.score_f - a.score_f)
    .slice(0, 15);
}
