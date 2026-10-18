// @vitest-environment jsdom
// SF-49b: no full-screen overlay uses a backdrop blur; each keeps its dim. The same
// rule as the hint shop (SF-49, hintModalOverlay.test.jsx): on the Android tablet
// a full-screen blur made every repaint behind a modal slow (SF-47). The small
// icon chips and the bottom nav bar are deliberately not covered here.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/platform', () => ({ isWindowsApp: () => false, isNative: () => true, getPlatform: () => 'android' }));
vi.mock('@/lib/admob', () => ({ showRewarded: vi.fn(async () => false), showInterstitial: vi.fn(async () => {}) }));
vi.mock('@/lib/purchases', () => ({
  purchaseProduct: vi.fn(), usePrice: () => null, useLowestPrice: () => null,
  REMOVE_ADS_PRODUCT_ID: 'au.com.uniquegames.soundfind.remove_ads', PURCHASE_OPTIONS: [],
}));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
// SF-55d: VictoryModal fires canvas-confetti, whose first animation frame draws on a
// 2D context jsdom does not have, so it threw an unhandled error (npm test exit 1).
vi.mock('canvas-confetti', () => ({ default: Object.assign(vi.fn(), { reset: vi.fn() }) })); // reset: SF-61 cleanup

const { default: VictoryModal } = await import('./VictoryModal');
const { default: RemoveAdsModal } = await import('./RemoveAdsModal');
const { default: AdModal } = await import('./AdModal');

let container, root;
beforeEach(() => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

const noop = () => {};
const OVERLAYS = [
  ['VictoryModal', 'bg-black/50', () => <VictoryModal isOpen score={100} wordsFound={6} level={1} onNextLevel={noop} onReplay={noop} onHome={noop} />],
  ['RemoveAdsModal', 'bg-black/60', () => <RemoveAdsModal isOpen onClose={noop} onSuccess={noop} />],
  ['AdModal', 'bg-black/70', () => <AdModal isOpen onClose={noop} onRemoveAds={noop} />],
];

describe('full-screen overlays: dim, no backdrop blur (SF-49b)', () => {
  for (const [name, dim, el] of OVERLAYS) {
    it(`${name}: the dimmed backdrop renders, full-screen (control), and has no backdrop blur`, async () => {
      await act(async () => { root.render(el()); });
      const backdrop = [...container.querySelectorAll('div')].find(d => d.className.split(/\s+/).includes(dim));
      expect(backdrop, `${name}: no element with ${dim}`).toBeDefined();
      expect(backdrop.className.split(/\s+/), `${name}: the dim covers the screen`).toContain('inset-0');
      expect(backdrop.className.split(/\s+/).filter(c => c.startsWith('backdrop-')), `${name}: backdrop blur`).toEqual([]);
    });
  }
});
