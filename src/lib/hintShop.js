// The hint shop's one door for prices and purchases (S25, SF-74).
//
// HintModal asks this module, never a store directly:
//   native (iOS, Android): RevenueCat, through purchases.js, exactly as before.
//   Windows app:           the Microsoft Store, through windowsStore.js (SF-75).
//   web:                   no store; buying is answered "coming soon", as before.
import { useSyncExternalStore } from 'react';
import { isNative, isWindowsApp } from '@/lib/platform';
import { purchaseProduct, usePrice, useLowestPrice } from '@/lib/purchases';
import {
  isWindowsStoreAvailable, getWindowsPrice, subscribeWindowsPrices, purchaseWindowsHintPack,
} from '@/lib/windowsStore';

// Which store sells hint packs here: 'native', 'windows' or 'none' (web).
export function hintShopStore() {
  if (isNative()) return 'native';
  if (isWindowsApp()) return 'windows';
  return 'none';
}

// The price of the first pack that has one, in the shop's order (smallest pack first).
// The Store returns formatted prices only, so the order is the comparison.
function windowsLowest(productIds) {
  for (const id of productIds) {
    const p = getWindowsPrice(id);
    if (p != null) return p;
  }
  return null;
}

// Hooks are always called in the same order; the platform decides which value is used.
export function usePackPrice(productId) {
  const native = usePrice(productId);
  const snap = () => getWindowsPrice(productId);
  const windows = useSyncExternalStore(subscribeWindowsPrices, snap, snap);
  return hintShopStore() === 'windows' ? windows : native;
}

export function useLowestPackPrice(productIds) {
  const native = useLowestPrice(productIds);
  const snap = () => windowsLowest(productIds);
  const windows = useSyncExternalStore(subscribeWindowsPrices, snap, snap);
  return hintShopStore() === 'windows' ? windows : native;
}

// Whether a purchase can be attempted now. The web never can (it answers "coming soon").
export function isHintStoreAvailable() {
  const store = hintShopStore();
  if (store === 'native') return true;
  if (store === 'windows') return isWindowsStoreAvailable();
  return false;
}

// Buys one pack. Resolves to purchaseProduct's own result on native ({ hints, purchase }),
// { hints, purchase, credited } on Windows (already credited), or { comingSoon: true } on the web. Throws on cancel or failure,
// and on Windows with StoreUnavailableError while the store is unavailable.
export async function buyHintPack(productId) {
  const store = hintShopStore();
  if (store === 'native') return purchaseProduct(productId);
  if (store === 'windows') return purchaseWindowsHintPack(productId);
  return { comingSoon: true };
}
