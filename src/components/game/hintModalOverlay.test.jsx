// @vitest-environment jsdom
// SF-49 (D-A): the hint shop overlay keeps its dark dim but has no backdrop blur.
// Measured on the Android tablet (SF-47): with the blur, changing packs gave 49 to 50
// slow frames per four taps; without it, 5.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/platform', () => ({ isWindowsApp: () => false, isNative: () => true, getPlatform: () => 'android' }));
vi.mock('@/lib/admob', () => ({ showRewarded: vi.fn(async () => true) }));
vi.mock('@/lib/purchases', () => ({
  purchaseProduct: vi.fn(),
  usePrice: () => null,
  useLowestPrice: () => null,
  PURCHASE_OPTIONS: [{ productId: 'au.com.uniquegames.soundfind.hints_10', hints: 10, label: 'Best Value', gradient: '', popular: true }],
}));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));

const { default: HintModal } = await import('./HintModal');

let container, root;
const onClose = vi.fn();
beforeEach(async () => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  onClose.mockClear();
  await act(async () => { root.render(<HintModal isOpen onClose={onClose} onWatchAd={() => {}} onPurchase={() => {}} />); });
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

const overlay = () => container.querySelector('div.fixed.inset-0');

describe('hint shop overlay: dim, no backdrop blur (SF-49, D-A)', () => {
  it('control: the overlay renders, full-screen, above the page', () => {
    expect(overlay()).not.toBeNull();
    expect(overlay().className).toContain('z-50');
  });
  it('keeps the dark dim', () => {
    expect(overlay().className.split(/\s+/)).toContain('bg-black/60');
  });
  it('has no backdrop blur class', () => {
    expect(overlay().className.split(/\s+/).filter(c => c.startsWith('backdrop-'))).toEqual([]);
  });
  it('a click on the dim still closes the shop', async () => {
    await act(async () => { overlay().click(); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
