// @vitest-environment jsdom
// SF-46, decision S40: the hint-pack purchase view says where hints are kept.
// The line sits under the pack list, so it shows wherever the list shows: on
// native, and off native where the list is the placeholder shop.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const platform = { native: false };
vi.mock('@/lib/platform', () => ({ isNative: () => platform.native, getPlatform: () => (platform.native ? 'android' : 'web') }));
vi.mock('@/lib/admob', () => ({ showRewarded: vi.fn(async () => true) }));
vi.mock('@/lib/purchases', () => ({
  purchaseProduct: vi.fn(),
  usePrice: () => null,
  useLowestPrice: () => null,
  PURCHASE_OPTIONS: [
    { productId: 'au.com.uniquegames.soundfind.hints_3', hints: 3, label: 'Starter', gradient: '', popular: false },
    { productId: 'au.com.uniquegames.soundfind.hints_10', hints: 10, label: 'Best Value', gradient: '', popular: true },
  ],
}));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: () => true }));

const { default: HintModal } = await import('./HintModal');

const NOTE = "Hints are saved on this device and aren't linked to an account. Unused hints can be lost if you delete the app.";
let container, root;
const text = () => container.textContent;
const button = label => [...container.querySelectorAll('button')].find(b => b.textContent.includes(label));
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function openPurchaseView() {
  await act(async () => { root.render(<HintModal isOpen onClose={() => {}} onWatchAd={() => {}} onPurchase={() => {}} />); });
  await act(async () => { button('Buy Hint Pack').click(); });
  // The views sit in AnimatePresence mode="wait": the pack list mounts after the menu's exit.
  for (let i = 0; i < 100 && !text().includes('Best Value'); i++) await act(async () => { await sleep(20); });
  expect(text()).toContain('Best Value');                       // control: the pack list is showing
}

beforeEach(() => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

describe('the hint-pack purchase view says hints are kept on the device (SF-46, S40)', () => {
  it('native: the line shows under the pack list, once', async () => {
    platform.native = true;
    await openPurchaseView();
    expect(text().split(NOTE).length - 1).toBe(1);
  });
  it('off native: the line shows with the placeholder pack list too', async () => {
    platform.native = false;
    await openPurchaseView();
    expect(text().split(NOTE).length - 1).toBe(1);
  });
  it('the options menu (before choosing to buy) does not carry the line', async () => {
    platform.native = true;
    await act(async () => { root.render(<HintModal isOpen onClose={() => {}} onWatchAd={() => {}} onPurchase={() => {}} />); });
    expect(text()).toContain('Buy Hint Pack');
    expect(text()).not.toContain(NOTE);
  });
  it('the line has no double hyphen and claims nothing about backup', () => {
    expect(NOTE.includes('--')).toBe(false);
    expect(/backup|restore/i.test(NOTE)).toBe(false);
  });
});
