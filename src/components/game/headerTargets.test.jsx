// @vitest-environment jsdom
// SF-61 (U5, U6): the game header's small buttons get 44 px touch areas (an ::after
// hit area, so the visible size is unchanged), their labels say what they do, the
// score and hint pills have dark variants, and RemoveAdsModal has a dark card.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('@/lib/platform', () => ({ isWindowsApp: () => false, isNative: () => true, getPlatform: () => 'android' }));
vi.mock('@/lib/purchases', () => ({ purchaseProduct: vi.fn(), usePrice: () => null, REMOVE_ADS_PRODUCT_ID: 'x' }));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), captureMessage: vi.fn(), addBreadcrumb: vi.fn() }));

const { default: GameHeader } = await import('./GameHeader');
const { default: RemoveAdsModal } = await import('./RemoveAdsModal');
const { HIT_FROM_32, HIT_FROM_36, HIT_PILL_FROM_24, HIT_Y_FROM_36 } = await import('@/lib/touchTarget');

let container, root;
async function render(el) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(el));
}
afterEach(async () => { await act(async () => root?.unmount()); container?.remove(); });

const header = (props) => (
  <GameHeader score={120} hintsRemaining={3} wordsFound={2} totalWords={6} level={1} gameMode="audio" category="animals"
    onBack={() => {}} onUseHint={() => {}} isAudioMode audioEnabled onToggleAudio={() => {}} {...props} />
);
const byLabel = label => container.querySelector(`button[aria-label="${label}"]`);
const hasAll = (el, classes) => classes.split(' ').every(c => el.classList.contains(c));

describe('game header touch targets and labels (SF-61)', () => {
  it('compact: Back and Audio (32 px) and the hint pill (24 px tall) get 44 px hit areas; labels', async () => {
    await render(header({ compact: true }));
    const back = byLabel('Back'), mute = byLabel('Mute sound'), hint = byLabel('Hint, 3 left');
    expect([back, mute, hint].every(Boolean), 'control: all three found by label').toBe(true);
    expect(back.classList.contains('h-8'), 'visible size unchanged').toBe(true);
    expect(hasAll(back, HIT_FROM_32)).toBe(true);
    expect(hasAll(mute, HIT_FROM_32)).toBe(true);
    expect(hasAll(hint, HIT_PILL_FROM_24)).toBe(true);
  });

  it('portrait: Back and Audio (36 px) and the hint pill (36 px tall) get 44 px hit areas', async () => {
    await render(header({ compact: false }));
    expect(hasAll(byLabel('Back'), HIT_FROM_36)).toBe(true);
    expect(hasAll(byLabel('Mute sound'), HIT_FROM_36)).toBe(true);
    expect(hasAll(byLabel('Hint, 3 left'), HIT_Y_FROM_36)).toBe(true);
  });

  it('the sound toggle is labelled by its state', async () => {
    await render(header({ compact: true, audioEnabled: false }));
    expect(byLabel('Unmute sound')).not.toBeNull();
    expect(byLabel('Mute sound')).toBeNull();
  });

  for (const compact of [true, false]) {
    it(`${compact ? 'compact' : 'portrait'}: the score and hint pills have dark variants`, async () => {
      await render(header({ compact }));
      const hint = byLabel('Hint, 3 left');
      const score = [...container.querySelectorAll('div')].find(d => /from-amber-50/.test(d.className) && d.textContent.includes('120'));
      expect(score, 'control: the score pill found').toBeTruthy();
      for (const c of ['dark:from-amber-950/30', 'dark:to-orange-950/30']) expect(score.classList.contains(c)).toBe(true);
      for (const c of ['dark:from-violet-950/30', 'dark:to-indigo-950/30']) expect(hint.classList.contains(c)).toBe(true);
    });
  }
});

describe('RemoveAdsModal dark mode (SF-61, U5)', () => {
  it('the card, headings and body text have dark variants; Close is labelled and 44 px', async () => {
    await render(<RemoveAdsModal isOpen onClose={() => {}} onSuccess={() => {}} />);
    const card = [...container.querySelectorAll('div')].find(d => d.classList.contains('rounded-3xl'));
    expect(card.classList.contains('dark:bg-slate-900')).toBe(true);
    const title = [...container.querySelectorAll('h2')].find(h => h.textContent.includes('Go Ad-Free'));
    expect(title.classList.contains('dark:text-slate-100')).toBe(true);
    const close = byLabel('Close');
    expect(close).not.toBeNull();
    expect(hasAll(close, HIT_FROM_36)).toBe(true);
  });
});
