import { Purchases, PRODUCT_CATEGORY } from '@revenuecat/purchases-capacitor';
import * as Sentry from '@sentry/react';
import { getPlatform } from './platform';

const API_KEYS = {
  ios:     'appl_uaNkxxIRCiSXwfwQkJvoCSyQuSF',
  android: '', // TODO: add once Google Play goes to production
};

const _prices = {};

export const REMOVE_ADS_PRODUCT_ID = 'au.com.uniquegames.soundfind.remove_ads';

const HINT_PACK_MAP = {
  'au.com.uniquegames.soundfind.hints_3':  3,
  'au.com.uniquegames.soundfind.hints_10': 10,
  'au.com.uniquegames.soundfind.hints_25': 25,
};

export const PURCHASE_OPTIONS = [
  { productId: 'au.com.uniquegames.soundfind.hints_3',  hints: 3,  price: 'US$0.99', label: 'Starter',    gradient: 'from-amber-400 to-orange-500',   shadow: 'shadow-amber-200',  popular: false },
  { productId: 'au.com.uniquegames.soundfind.hints_10', hints: 10, price: 'US$1.99', label: 'Best Value',  gradient: 'from-violet-500 to-indigo-600',  shadow: 'shadow-violet-200', popular: true  },
  { productId: 'au.com.uniquegames.soundfind.hints_25', hints: 25, price: 'US$3.99', label: 'Power Pack',  gradient: 'from-emerald-400 to-teal-500',   shadow: 'shadow-emerald-200', popular: false },
];

export function getPrice(productId, fallback) {
  return _prices[productId] || fallback;
}

async function fetchAndCachePrices() {
  try {
    const { current } = await Purchases.getOfferings();
    if (!current) return;
    current.availablePackages.forEach(pkg => {
      const product = pkg.storeProduct ?? pkg.product;
      const id = product?.identifier ?? product?.productIdentifier;
      if (id && product?.priceString) _prices[id] = product.priceString;
    });
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
