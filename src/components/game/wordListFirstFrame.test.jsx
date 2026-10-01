// @vitest-environment jsdom
// FB-13 (CR-80): the in-game word list paints its rows on the first frame. Each
// row used to mount with framer-motion's initial={{ opacity: 0, y: 10 }} and a
// per-row delay, so the list rendered invisible and cascaded in, on every new
// game and again on Replay / Next Level.
//
// First frame: renderToString runs no effects or animations, so it is the
// markup the player sees before anything animates. Replay / Next Level: the same
// mounted component gets new words, and the DOM is read straight after the
// commit, before any animation frame could have run.
import React from 'react';
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, afterEach } from 'vitest';
import WordList from './WordList';
import AnagramWordList from './AnagramWordList';
import AssociationWordList from './AssociationWordList';
import { getClue } from './gameUtils';

const FIRST  = ['LION', 'TIGER', 'ZEBRA', 'MONKEY'];
const SECOND = ['APPLE', 'BANANA', 'CHERRY'];
const sortLetters = w => [...w.toUpperCase()].sort().join('');

const LISTS = {
  WordList: {
    el: words => <WordList words={words} foundWords={[]} isAudioMode={false} revealedWords={[]} onRevealWord={() => {}} onHintCell={() => {}} hintsRemaining={5} hintWord={null} category={null} />,
    // standard mode shows each word in capitals
    shows: (doc, words) => words.every(w => doc.body.textContent.includes(w.toUpperCase())),
  },
  AnagramWordList: {
    el: words => <AnagramWordList words={words} foundWords={[]} hintWord={null} onHintCell={() => {}} hintsRemaining={5} />,
    // one scramble per word: same letters, and for words over one letter, not the plain word
    shows: (doc, words) => {
      const shown = [...doc.querySelectorAll('span.font-mono')].map(s => s.textContent);
      return shown.length === words.length
        && words.every(w => shown.some(s => sortLetters(s) === sortLetters(w)))
        && shown.every(s => !words.includes(s));
    },
  },
  AssociationWordList: {
    el: words => <AssociationWordList words={words} foundWords={[]} hintWord={null} revealedWords={[]} onRevealWord={() => {}} onHintCell={() => {}} hintsRemaining={5} />,
    // association mode shows each word's clue, not the word
    shows: (doc, words) => words.every(w => doc.body.textContent.includes(getClue(w))),
  },
};

const parse = html => new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
// A row is the keyed element directly inside the list's grid / stack container.
const rowsOf = root => [...root.querySelectorAll('div.grid > div, div.space-y-2 > div')];
const hidden = el => /opacity:\s*0(?![.\d])/.test(el.getAttribute('style') || '');

let mounted = [];
afterEach(async () => {
  for (const { root, container } of mounted) { await act(async () => root.unmount()); container.remove(); }
  mounted = [];
});

for (const [name, list] of Object.entries(LISTS)) {
  describe(`${name}: rows are visible on the first frame (FB-13)`, () => {
    it('first render: one row per word, none hidden, every word shown', () => {
      const doc = parse(renderToString(list.el(FIRST)));
      const rows = rowsOf(doc);
      expect(rows.length).toBe(FIRST.length);            // control: the rows are found
      expect(rows.filter(hidden).length).toBe(0);
      expect(list.shows(doc, FIRST)).toBe(true);
    });

    it('a new word set (Replay / Next Level, same mounted list): new rows are visible at once', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);
      mounted.push({ root, container });
      await act(async () => root.render(list.el(FIRST)));
      await act(async () => root.render(list.el(SECOND)));
      const rows = rowsOf(container);
      expect(rows.length).toBe(SECOND.length);
      expect(rows.filter(hidden).length).toBe(0);
      expect(list.shows(document, SECOND)).toBe(true);
    });
  });
}
