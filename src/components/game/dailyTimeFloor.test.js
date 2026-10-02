// CR-85 (S27 floor): a timed Daily's limit is the larger of the word-count limit
// (CR-84) and the template's limit before CR-84, so S27 never gives less time
// than before. The old limits are written out here, from the values CR-84
// removed (5366bc3^), rather than read from the code under test.
import { describe, it, expect } from 'vitest';
import { CHALLENGE_TEMPLATES, dailyTimeLimit } from './DailyChallengeUtils';

const OLD_LIMIT = {
  'Beast Mode': 120, 'Galaxy Brain': 150, 'Tech Hunt': 180, 'Myth Busted': 120,
  'Scramble Scientist': 150, 'Emotional Journey': 90, 'Sound Check': 180,
  'World Tour': 120, 'Nature Sprint': 90, 'Food for Thought': 150, 'Color Coded': 60,
};
const UNTIMED = ['Ocean Deep', 'History Lesson', 'Grandmaster'];
const byTitle = t => CHALLENGE_TEMPLATES.find(x => x.title === t);

describe('the Daily time floor (S27, CR-85)', () => {
  it('control: all 14 templates are found, 11 timed and 3 untimed', () => {
    expect(CHALLENGE_TEMPLATES.length).toBe(14);
    expect(Object.keys(OLD_LIMIT).every(byTitle)).toBe(true);
    expect(UNTIMED.every(byTitle)).toBe(true);
  });

  it('Galaxy Brain at 9 words gets its old 2:30, not 2:15', () => {
    expect(dailyTimeLimit(byTitle('Galaxy Brain'), 9)).toBe(150);
  });

  it('Tech Hunt at 14 words gets its old 3:00, not 2:48', () => {
    expect(dailyTimeLimit(byTitle('Tech Hunt'), 14)).toBe(180);
  });

  it('a template whose scaled limit is higher keeps the scaled one', () => {
    expect(dailyTimeLimit(byTitle('Color Coded'), 10)).toBe(120);       // 10 x 12 s > 60 s
    expect(dailyTimeLimit(byTitle('Scramble Scientist'), 15)).toBe(225); // 15 x 15 s > 150 s
  });

  it('every timed template, at 9 to 15 words, gets at least its old limit', () => {
    const short = [];
    for (const [title, old] of Object.entries(OLD_LIMIT)) {
      for (let n = 9; n <= 15; n++) if (dailyTimeLimit(byTitle(title), n) < old) short.push(`${title} at ${n} words`);
    }
    expect(short).toEqual([]);
  });

  it('untimed templates stay untimed', () => {
    for (const t of UNTIMED) expect(dailyTimeLimit(byTitle(t), 20)).toBe(0);
  });
});
