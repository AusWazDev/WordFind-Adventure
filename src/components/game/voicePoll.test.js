// @vitest-environment jsdom
// getVoices() polls speechSynthesis every 200 ms until voices appear. When the
// voices arrive through onvoiceschanged first (Chrome, Android), the poll used to
// keep running for the life of the page, because both of its clearInterval calls
// required the result not to have arrived yet. (Found in SF-25, fixed in CR-82.)
import { it, expect, vi, beforeAll, afterAll } from 'vitest';

let voices = [];
const getVoicesCalls = vi.fn(() => voices);
const wait = ms => new Promise(r => setTimeout(r, ms));

beforeAll(async () => {
  window.speechSynthesis = { speaking: false, speak: vi.fn(), cancel: vi.fn(), pause: vi.fn(), resume: vi.fn(), getVoices: getVoicesCalls, onvoiceschanged: null };
  await import('./voiceUtils');          // the module starts the voice poll on import
});
afterAll(() => wait(250));

it('the voice poll stops once onvoiceschanged has delivered the voices', async () => {
  await wait(450);
  expect(getVoicesCalls.mock.calls.length).toBeGreaterThan(2); // control: the poll is running
  voices = [{ name: 'Karen', lang: 'en-AU', localService: true, default: true }];
  window.speechSynthesis.onvoiceschanged();                  // voices arrive by the event, not the poll
  await wait(250);                                           // let a tick that was already due run
  const after = getVoicesCalls.mock.calls.length;
  await wait(700);                                           // three more ticks' worth
  expect(getVoicesCalls.mock.calls.length).toBe(after);      // no more polling
});
