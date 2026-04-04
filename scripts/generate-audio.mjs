#!/usr/bin/env node
/**
 * scripts/generate-audio.mjs
 *
 * Batch-generates ElevenLabs MP3 audio for every game word and fixed phrase.
 * Run once to populate public/audio/ — skips existing files so it's fully resumable.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk_... node scripts/generate-audio.mjs
 *
 * Dry run (see what would be generated, no API calls):
 *   ELEVENLABS_API_KEY=sk_... node scripts/generate-audio.mjs --dry-run
 *
 * Output layout:
 *   public/audio/female/<WORD>.mp3           — spoken once, clean
 *   public/audio/male/<WORD>.mp3
 *   public/audio/phrases/female_<key>.mp3   — fixed in-game phrases
 *   public/audio/phrases/male_<key>.mp3
 *
 * Phrase keys:
 *   great_you_found    → "Great! You found"
 *   all_words_found    → "Incredible! All words found! Now find the hidden bonus word!"
 *   hidden_word_was    → "Amazing! The hidden word was..."
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const DRY_RUN   = process.argv.includes('--dry-run');

// ─── Config ──────────────────────────────────────────────────────────────────

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Error: ELEVENLABS_API_KEY environment variable is not set.');
  console.error('Usage: ELEVENLABS_API_KEY=sk_... node scripts/generate-audio.mjs');
  process.exit(1);
}

// Voice IDs (ElevenLabs v1 pre-made voices)
const VOICES = {
  female: 'M7ya1YbaeFaPXljg9BpK',  // Hannah — natural Australian English
  male:   'iIg0uI51lssRFauz7W21',  // Neil   — soft Australian accent
};

const MODEL = 'eleven_turbo_v2_5';  // Fast + cheap; great quality for single words

// Fixed phrases played during gameplay (phrase prefix, then word MP3 plays separately)
const PHRASES = {
  great_you_found:  'Great! You found',
  all_words_found:  'Incredible! All words found! Now find the hidden bonus word!',
  hidden_word_was:  'Amazing! The hidden word was...',
};

// API rate limiting — Starter plan allows ~2 concurrent requests
const CONCURRENCY = 2;
const DELAY_MS    = 250;  // between each request in a worker

// ─── Word collection ──────────────────────────────────────────────────────────
// Reads gameUtils.jsx as text and extracts every uppercase quoted string.
// This automatically picks up wordLists, categoryBonusWordPairs, trickyWordGroups,
// and coreAudioWords without maintaining a separate copy of the data.

function collectWords() {
  const src = readFileSync(
    join(ROOT, 'src/components/game/gameUtils.jsx'),
    'utf8'
  );

  // Match every 'UPPERCASEWORD' literal in the source
  const matches = src.match(/'([A-Z]{2,})'/g) || [];
  const words   = [...new Set(matches.map(m => m.slice(1, -1)))];

  // Keep only plausible game words: 2–20 alpha chars, no digits/punctuation
  return words.filter(w => /^[A-Z]{2,20}$/.test(w)).sort();
}

// ─── ElevenLabs API ───────────────────────────────────────────────────────────

async function generateAudio(text, voiceId) {
  const url      = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const response = await fetch(url, {
    method:  'POST',
    headers: {
      'xi-api-key':   API_KEY,
      'Content-Type': 'application/json',
      'Accept':       'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: {
        stability:        0.55,
        similarity_boost: 0.75,
        style:            0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '(no body)');
    throw new Error(`HTTP ${response.status}: ${body}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// ─── Progress tracking ────────────────────────────────────────────────────────

let generated = 0;
let skipped   = 0;
let errors    = 0;
let total     = 0;

function printProgress() {
  const done = generated + skipped + errors;
  process.stdout.write(`\r  ${done}/${total}  (gen:${generated} skip:${skipped} err:${errors})  `);
}

// ─── Rate-limited worker pool ─────────────────────────────────────────────────

async function runPool(items, processor) {
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const item = items[idx++];
      await processor(item);
      printProgress();
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write('\n');
}

// ─── Word generator ───────────────────────────────────────────────────────────

async function generateWordAudio(word, gender, voiceId) {
  const outPath = join(ROOT, `public/audio/${gender}/${word}.mp3`);
  if (existsSync(outPath)) { skipped++; return; }
  if (DRY_RUN)             { generated++; return; }

  try {
    // Lowercase so ElevenLabs pronounces it as a word, not acronym.
    // Single utterance with trailing period — natural falling inflection.
    const text  = word.toLowerCase() + '.';
    const audio = await generateAudio(text, voiceId);
    writeFileSync(outPath, audio);
    generated++;
  } catch (err) {
    console.error(`\n  [error] ${gender}/${word}: ${err.message}`);
    errors++;
  }
}

// ─── Phrase generator ─────────────────────────────────────────────────────────

async function generatePhraseAudio(key, text, gender, voiceId) {
  const outPath = join(ROOT, `public/audio/phrases/${gender}_${key}.mp3`);
  if (existsSync(outPath)) {
    console.log(`  skip  ${gender}_${key}`);
    skipped++;
    return;
  }
  if (DRY_RUN) {
    console.log(`  [dry] ${gender}_${key}: "${text}"`);
    generated++;
    return;
  }

  try {
    const audio = await generateAudio(text, voiceId);
    writeFileSync(outPath, audio);
    console.log(`  ✓     ${gender}_${key}`);
    generated++;
  } catch (err) {
    console.error(`  ✗     ${gender}_${key}: ${err.message}`);
    errors++;
  }

  await new Promise(r => setTimeout(r, 400));
}

// ─── Sentence collection ─────────────────────────────────────────────────────
// Reads trickySentences.jsx and extracts every WORD → sentence pair.
// The full spoken text for each file is: "word... sentence... word."

function collectSentences() {
  const src = readFileSync(
    join(ROOT, 'src/components/game/trickySentences.jsx'),
    'utf8'
  );
  const map = {};
  const regex = /([A-Z]{2,}):\s+"([^"]+)"/g;
  let m;
  while ((m = regex.exec(src)) !== null) {
    const word = m[1];
    const sentence = m[2];
    map[word] = `${word.toLowerCase()}... ${sentence}... ${word.toLowerCase()}.`;
  }
  return map;
}

// ─── Sentence generator ───────────────────────────────────────────────────────

async function generateSentenceAudio(word, text, gender, voiceId) {
  const outPath = join(ROOT, `public/audio/sentences/${gender}_${word}.mp3`);
  if (existsSync(outPath)) { skipped++; return; }
  if (DRY_RUN)             { generated++; return; }

  try {
    const audio = await generateAudio(text, voiceId);
    writeFileSync(outPath, audio);
    generated++;
  } catch (err) {
    console.error(`\n  [error] sentences/${gender}_${word}: ${err.message}`);
    errors++;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (DRY_RUN) console.log('[DRY RUN — no API calls will be made]\n');

  // Ensure output directories exist
  for (const dir of ['female', 'male', 'phrases', 'sentences']) {
    mkdirSync(join(ROOT, 'public/audio', dir), { recursive: true });
  }

  const words = collectWords();
  console.log(`Collected ${words.length} unique words from gameUtils.jsx\n`);

  // ── Phase 1: Word audio ──────────────────────────────────────────────────
  for (const [gender, voiceId] of Object.entries(VOICES)) {
    console.log(`Generating ${gender} word audio...`);
    total     = words.length;
    generated = 0; skipped = 0; errors = 0;

    await runPool(words, item => generateWordAudio(item, gender, voiceId));

    console.log(`  Done — gen:${generated} skip:${skipped} err:${errors}\n`);
  }

  // ── Phase 2: Phrase audio ────────────────────────────────────────────────
  for (const [gender, voiceId] of Object.entries(VOICES)) {
    console.log(`Generating ${gender} phrase audio...`);
    generated = 0; skipped = 0; errors = 0;

    for (const [key, text] of Object.entries(PHRASES)) {
      await generatePhraseAudio(key, text, gender, voiceId);
    }

    console.log(`  Done — gen:${generated} skip:${skipped} err:${errors}\n`);
  }

  // ── Phase 3: Sentence audio ──────────────────────────────────────────────
  const sentences = collectSentences();
  const sentenceWords = Object.keys(sentences).sort();
  console.log(`Collected ${sentenceWords.length} sentences from trickySentences.jsx\n`);

  for (const [gender, voiceId] of Object.entries(VOICES)) {
    console.log(`Generating ${gender} sentence audio...`);
    total     = sentenceWords.length;
    generated = 0; skipped = 0; errors = 0;

    await runPool(
      sentenceWords,
      word => generateSentenceAudio(word, sentences[word], gender, voiceId)
    );

    console.log(`  Done — gen:${generated} skip:${skipped} err:${errors}\n`);
  }

  const totalErrors = errors;
  console.log('All done.');
  if (totalErrors > 0) {
    console.log(`${totalErrors} error(s) — re-run the script to retry failed files.`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\nFatal:', err);
  process.exit(1);
});
