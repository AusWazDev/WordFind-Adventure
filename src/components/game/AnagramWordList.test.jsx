// @vitest-environment jsdom
// Anagram list must stay scrambled when the SAME mounted component receives new
// words, which is what Replay (initGame) and Next Level (same-route navigate) do
// (CR-62, brief SF-2).
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import AnagramWordList from './AnagramWordList';

const FIRST  = ['LION', 'TIGER', 'ZEBRA'];
// Includes repeated-letter words, where a naive shuffle can return the answer.
const SECOND = ['BOOK', 'COFFEE', 'EGG', 'PUPPY'];

let container;
let root;

const render = async words => {
  await act(async () => {
    root.render(<AnagramWordList words={words} foundWords={[]} hintWord={null} hintsRemaining={5} />);
  });
};

// The scrambled text shown for each word, in display order.
const shown = () => [...container.querySelectorAll('span.font-mono')].map(s => s.textContent);
const sortLetters = w => [...w].sort().join('');

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe('AnagramWordList scrambles', () => {
  it('the apparatus: first render shows one scramble per word, none plain', async () => {
    await render(FIRST);
    const texts = shown();
    expect(texts).toHaveLength(FIRST.length);
    for (const w of FIRST) expect(texts).not.toContain(w);
  });

  it('after new words arrive on the same mounted list, no answer is shown in plain', async () => {
    await render(FIRST);
    await render(SECOND);
    const texts = shown();
    expect(texts).toHaveLength(SECOND.length);
    for (const w of SECOND) expect(texts).not.toContain(w);
  });

  it('every shown scramble is an anagram of one of the current words', async () => {
    await render(FIRST);
    await render(SECOND);
    const want = SECOND.map(sortLetters).sort();
    expect(shown().map(sortLetters).sort()).toEqual(want);
  });

  it('never shows the answer for repeated-letter words, over many renders', async () => {
    for (let i = 0; i < 50; i++) {
      await render(i % 2 ? FIRST : SECOND);
      const words = i % 2 ? FIRST : SECOND;
      for (const w of words) expect(shown()).not.toContain(w);
    }
  });

  it('the per-word reshuffle button still works and stays scrambled', async () => {
    await render(SECOND);
    const shuffleButtons = [...container.querySelectorAll('button')];
    expect(shuffleButtons.length).toBeGreaterThanOrEqual(SECOND.length);
    for (let i = 0; i < 20; i++) {
      await act(async () => { shuffleButtons[0].click(); });
      for (const w of SECOND) expect(shown()).not.toContain(w);
    }
    expect(shown().map(sortLetters).sort()).toEqual(SECOND.map(sortLetters).sort());
  });
});
