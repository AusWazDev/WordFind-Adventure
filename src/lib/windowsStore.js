// The Microsoft Store purchase bridge for the Windows app (S25).
//
// ⚠️ STUB (SF-74). SF-75 replaces the bodies below with the Windows.Services.Store
// bridge. Until then the store reports itself unavailable: no prices, and every
// purchase is refused with StoreUnavailableError. The hint shop shows a calm
// "store isn't available" message on that, never "Coming soon".
//
// The interface SF-75 fills, and the hint shop (src/lib/hintShop.js) relies on:
//   isWindowsStoreAvailable()          -> boolean
//   getWindowsPrice(productId)         -> the Store's formatted price, or null
//   subscribeWindowsPrices(listener)   -> unsubscribe function; call listener on change
//   purchaseWindowsHintPack(productId) -> Promise<{ hints }>; throws on cancel or failure
// productId is the shop's key (PURCHASE_OPTIONS in purchases.js). Mapping it to the
// Partner Center add-on (hints_3, hints_10, hints_25) is SF-75's.

export class StoreUnavailableError extends Error {
  constructor() {
    super('Microsoft Store unavailable');
    this.name = 'StoreUnavailableError';
  }
}

export function isWindowsStoreAvailable() {
  return false;
}

export function getWindowsPrice() {
  return null;
}

export function subscribeWindowsPrices() {
  return () => {};
}

export async function purchaseWindowsHintPack() {
  throw new StoreUnavailableError();
}
