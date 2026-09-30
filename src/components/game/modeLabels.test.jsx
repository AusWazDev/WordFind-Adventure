// @vitest-environment jsdom
// One set of mode names everywhere (CR-66, brief SF-6, decision S2).
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it, expect, afterEach } from 'vitest';
// Imported statically, at collection time: a dynamic import inside the first
// test paid for loading framer-motion and hit the 5 s per-test timeout under load.
import GameLoadingScreen from './GameLoadingScreen';

const LONG = {
  standard: 'Standard',
  audio: 'Audio Challenge',
  anagram: 'Anagram Hunt',
  association: 'Word Association',
  mystery_word: 'Mystery Word',
};
const SHORT_ONLY = ['Word Find', 'Clue Hunt'];

// Vitest runs from the repo root (package.json's "test" script).
const SRC = join(process.cwd(), 'src');
function sourceFiles(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return sourceFiles(p);
    return /\.(js|jsx)$/.test(name) && !name.includes('.test.') ? [p] : [];
  });
}

// Every id: 'label' map in src/. A file counts as a label map only if it pairs
// at least three of the five mode ids with a quoted string, which excludes
// stray matches such as a comment reading "audio: word... sentence...".
const PAIR = /\b(standard|audio|anagram|association|mystery_word)\s*:\s*'([^']+)'/g;
function labelMaps() {
  const maps = [];
  for (const file of sourceFiles(SRC)) {
    const pairs = [...readFileSync(file, 'utf8').matchAll(PAIR)].map(m => ({ id: m[1], label: m[2] }));
    const ids = new Set(pairs.map(p => p.id));
    if (ids.size >= 3) maps.push({ file: relative(SRC, file).replace(/\\/g, '/'), pairs, ids });
  }
  return maps;
}

describe('mode-label census', () => {
  const maps = labelMaps();

  it('the apparatus finds the label maps (control)', () => {
    const files = maps.map(m => m.file).sort();
    expect(files).toEqual(expect.arrayContaining([
      'components/game/DailyChallengeCard.jsx',
      'components/game/GameHeader.jsx',
      'components/game/GameLoadingScreen.jsx',
    ]));
  });

  it('every label map uses the long set', () => {
    const wrong = maps.flatMap(m => m.pairs
      .filter(p => p.label !== LONG[p.id])
      .map(p => `${m.file}: ${p.id} -> '${p.label}' (want '${LONG[p.id]}')`));
    expect(wrong).toEqual([]);
  });

  it('every label map covers all five modes', () => {
    const missing = maps.flatMap(m => Object.keys(LONG)
      .filter(id => !m.ids.has(id))
      .map(id => `${m.file}: no ${id}`));
    expect(missing).toEqual([]);
  });

  it('no short-set label appears as a string anywhere in src', () => {
    const hits = [];
    for (const file of sourceFiles(SRC)) {
      const text = readFileSync(file, 'utf8');
      for (const label of SHORT_ONLY) {
        if (text.includes(`'${label}'`) || text.includes(`"${label}"`) || text.includes(`>${label}<`)) {
          hits.push(`${relative(SRC, file)}: ${label}`);
        }
      }
    }
    expect(hits).toEqual([]);
  });
});

// DailyChallengeCard.MODE_LABELS is never rendered (the card shows only its
// heading, the template title and Play), so the census above is its only pin.
// The loading screen IS player-visible: it shows the label while a game builds.
describe('the loading screen shows the long name for every mode', () => {
  let container;
  let root;
  afterEach(async () => {
    await act(async () => root?.unmount());
    container?.remove();
  });

  for (const [mode, label] of Object.entries(LONG)) {
    it(`${mode} reads "${label}"`, async () => {
      container = document.createElement('div');
      document.body.appendChild(container);
      root = createRoot(container);
      await act(async () => { root.render(<MemoryRouter><GameLoadingScreen mode={mode} level={1} /></MemoryRouter>); });
      expect(container.textContent).toContain(label);
      expect(container.textContent).not.toContain('Loading Game');
      expect(container.textContent).not.toContain(`${label} Mode`);
    });
  }
});
