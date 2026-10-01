// @vitest-environment jsdom
// FB-15 (CR-81): the Home screen's selectors paint their buttons on the first
// frame. AudioCategorySelector's cards mounted with framer-motion's
// initial={{ opacity: 0, ... }} and a stagger, so the Audio Challenge category
// step rendered invisible and faded in, every time it was entered. The other
// three selectors already had no entry animation; this guards all four.
//
// renderToString runs no effects or animations, so it is the markup the player
// sees before anything animates. Labels are written out here rather than read
// from the components, so the test does not share their data.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import GameModeSelector from './GameModeSelector';
import CategorySelector from './CategorySelector';
import AudioCategorySelector from './AudioCategorySelector';
import LevelSelector from './LevelSelector';

const noop = () => {};
const SELECTORS = {
  GameModeSelector: {
    el: <GameModeSelector onSelectMode={noop} />,
    labels: ['Audio Challenge', 'Mystery Word', 'Standard', 'Word Association', 'Anagram Hunt'],
  },
  CategorySelector: {
    el: <CategorySelector onSelectCategory={noop} />,
    labels: ['Random', 'Animals', 'Food', 'Nature', 'Colors', 'Sports', 'Space', 'Music', 'Countries', 'Science', 'Mythology', 'Technology', 'Ocean', 'History', 'Emotions'],
  },
  AudioCategorySelector: {
    el: <AudioCategorySelector onSelectCategory={noop} />,
    labels: ['Tricky Mix', 'Silent Letters', 'Homophones', '-OUGH Words', 'Double Letters', 'Commonly Misspelled', '-ISE or -IZE?', '-OUR or -OR?'],
  },
  LevelSelector: {
    el: <LevelSelector currentLevel={1} onSelectLevel={noop} />,
    labels: ['Easy', 'Medium', 'Hard', 'Expert', 'Master'],
  },
};

const parse = html => new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
const hidden = el => /opacity:\s*0(?![.\d])/.test(el.getAttribute('style') || '');

describe('Home selectors paint their buttons on the first frame (FB-15)', () => {
  for (const [name, s] of Object.entries(SELECTORS)) {
    it(`${name}: ${s.labels.length} buttons, none hidden, every label shown`, () => {
      const doc = parse(renderToString(s.el));
      const buttons = [...doc.querySelectorAll('button')];
      expect(buttons.length, `${name} button count`).toBe(s.labels.length);   // control: the query works
      const hiddenButtons = buttons.filter(b => hidden(b) || [...b.querySelectorAll('[style]')].some(hidden));
      expect(hiddenButtons.map(b => b.textContent.slice(0, 30)), `${name} buttons with opacity:0`).toEqual([]);
      const text = doc.body.textContent;
      expect(s.labels.filter(l => !text.includes(l)), `${name} labels missing`).toEqual([]);
    });
  }
});
