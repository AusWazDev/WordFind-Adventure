import { useSyncExternalStore } from 'react';
import { Purchases, PRODUCT_CATEGORY } from '@revenuecat/purchases-capacitor';
import * as Sentry from '@sentry/react';
import { getPlatform } from './platform';

const API_KEYS = {
  ios:     'appl_uaNkxxIRCiSXwfwQkJvoCSyQuSF',
  android: 'goog_OEJqYzZnWDfnJvQbFsRyVhFXqVo', // RevenueCat public SDK key (public by design), CR-88
};

// Store prices from RevenueCat (FB-1, CR-74). Each entry is the store's own
// priceString, already formatted for the player's storefront, plus its numeric
// price for ordering. Nothing here ever holds a figure of our own: until the
// store answers, a price is null and the screens show no figure.
const _prices = {};
const _amounts = {};
const _listeners = new Set();

export const REMOVE_ADS_PRODUCT_ID = 'au.com.uniquegames.soundfind.remove_ads';

const HINT_PACK_MAP = {
  'au.com.uniquegames.soundfind.hints_3':  3,
  'au.com.uniquegames.soundfind.hints_10': 10,
  'au.com.uniquegames.soundfind.hints_25': 25,
};

export const PURCHASE_OPTIONS = [
  { productId: 'au.com.uniquegames.soundfind.hints_3',  hints: 3,  label: 'Starter',    gradient: 'from-amber-400 to-orange-500',   shadow: 'shadow-amber-200',  popular: false },
  { productId: 'au.com.uniquegames.soundfind.hints_10', hints: 10, label: 'Best Value',  gradient: 'from-violet-500 to-indigo-600',  shadow: 'shadow-violet-200', popular: true  },
  { productId: 'au.com.uniquegames.soundfind.hints_25', hints: 25, label: 'Power Pack',  gradient: 'from-emerald-400 to-teal-500',   shadow: 'shadow-emerald-200', popular: false },
];

export function subscribePrices(listener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

// The store's priceString for a product once loaded, otherwise null.
export function getPrice(productId) {
  return _prices[productId] ?? null;
}

// The cheapest loaded price among `productIds`, as the store formats it, or null.
export function getLowestPrice(productIds) {
  let best = null;
  for (const id of productIds) {
    if (_prices[id] != null && (best == null || _amounts[id] < _amounts[best])) best = id;
  }
  return best == null ? null : _prices[best];
}

// Re-render when prices arrive, so a screen opened before the store answered
// still shows them.
// The same snapshot serves as the server snapshot, so a first render done by
// renderToString (the FB-2 guard test) reads the cache too.
export function usePrice(productId) {
  const snapshot = () => getPrice(productId);
  return useSyncExternalStore(subscribePrices, snapshot, snapshot);
}

export function useLowestPrice(productIds) {
  const snapshot = () => getLowestPrice(productIds);
  return useSyncExternalStore(subscribePrices, snapshot, snapshot);
}

async function fetchAndCachePrices() {
  try {
    const { current } = await Purchases.getOfferings();
    if (!current) return;
    current.availablePackages.forEach(pkg => {
      const product = pkg.storeProduct ?? pkg.product;
      const id = product?.identifier ?? product?.productIdentifier;
      if (id && product?.priceString) {
        _prices[id] = product.priceString;
        _amounts[id] = typeof product.price === 'number' ? product.price : Number.POSITIVE_INFINITY;
      }
    });
    _listeners.forEach(listener => listener());
  } catch (e) {
    Sentry.addBreadcrumb({ category: 'purchases', message: 'fetchAndCachePrices failed — using fallbacks', data: { error: String(e) }, level: 'warning' });
  }
}

export async function initPurchases() {
  const apiKey = API_KEYS[getPlatform()];
  if (!apiKey) return;
  try {
    await Purchases.configure({ apiKey });
    await Promise.all([syncAdFreeStatus(), fetchAndCachePrices()]);
  } catch (e) {
    console.warn('[Purchases] init failed:', e);
    Sentry.captureException(e, { tags: { context: 'purchases_init' } });
  }
}


async function syncAdFreeStatus() {
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    if (customerInfo.entitlements.active['remove_ads']) {
      localStorage.setItem('ads_removed', 'true');
    }
  } catch {
    // Non-fatal — user may be offline
  }
}

// Returns { hints: number } for hint packs or { removeAds: true } for remove_ads.
// Throws on user cancel or store error.
export async function purchaseProduct(productId) {
  const { products } = await Purchases.getProducts({
    productIdentifiers: [productId],
    type: PRODUCT_CATEGORY.NON_SUBSCRIPTION,
  });
  if (!products?.length) throw new Error('Product not found in store');

  await Purchases.purchaseStoreProduct({ product: products[0] });

  if (productId === REMOVE_ADS_PRODUCT_ID) {
    localStorage.setItem('ads_removed', 'true');
    return { removeAds: true };
  }
  const hints = HINT_PACK_MAP[productId];
  if (hints) return { hints };
  throw new Error(`Unknown product: ${productId}`);
}

// Restores previous non-consumable purchases. Returns { adsRemoved: boolean }.
export async function restorePurchases() {
  const { customerInfo } = await Purchases.restorePurchases();
  const adsRestored = !!customerInfo.entitlements.active['remove_ads'];
  if (adsRestored) localStorage.setItem('ads_removed', 'true');
  return { adsRemoved: adsRestored };
}
