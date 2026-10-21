// The Microsoft Store purchase bridge for the Windows app (S25, SF-75).
//
// The page reaches the Store only through window.soundfindStore, the three calls
// electron/preload.cjs exposes (getProducts, purchase, reportFulfillment). Each
// resolves to the addon's { ok, hresult, status } answer; it never rejects for a
// Store failure. Anything other than a clean answer, including 0x803F6107 (the
// Store does not know this app, as in an unpackaged run), means "store unavailable".
//
// The interface the hint shop (src/lib/hintShop.js) relies on, unchanged from SF-74:
//   isWindowsStoreAvailable()          -> boolean
//   getWindowsPrice(productId)         -> the Store's formatted price, or null
//   subscribeWindowsPrices(listener)   -> unsubscribe function; call listener on change
//   purchaseWindowsHintPack(productId) -> Promise<{ hints, purchase, credited }>;
//                                         throws on cancel or failure
// plus initWindowsStore(), called once at launch by App.jsx.
//
// productId is the shop's key (WINDOWS_PURCHASE_OPTIONS below). Its last segment is
// the Partner Center product ID (hints_5, hints_10, hints_25; decision S42), which
// the Store returns as InAppOfferToken. Prices come from the Store. Windows has NO
// hints_3: that pack is iOS and Android only (PURCHASE_OPTIONS in purchases.js,
// unchanged), and a Store product outside the Windows list is ignored.
//
// Fulfilment (the developer's ruling on SF-75, Option 1). Developer-managed
// consumables: the Store will not sell a pack again until its fulfilment is
// reported. For each charge:
//   1. a tracking ID (a new GUID) is saved in wf_ms_store_pending, BEFORE the credit;
//   2. the hints are credited through the ledger keyed on that tracking ID
//      (hintLedger.creditPurchase), so a credit can never apply twice;
//   3. fulfilment is reported with that tracking ID, AFTER the credit; the pending
//      entry is removed only when the Store accepts the report.
// On every launch each saved entry is finished the same way: credited if not yet
// credited, then reported again with the same tracking ID. AlreadyPurchased means
// an earlier charge was never reported: it is credited and reported too.
// KNOWN LIMIT: a charge whose result the app never received (the app died while
// the Store dialog was open) has no saved entry; it is recovered on the next
// attempt to buy that same pack, which the Store answers with AlreadyPurchased.
import { toast } from 'sonner';
import { creditPurchaseNow, PROGRESS_CHANGED_EVENT } from '@/lib/hintLedger';

// New keys (SF-75). Neither is cleared by Reset: a pending entry is a charge the
// player has paid for, and Store IDs are not progress.
const PENDING_KEY = 'wf_ms_store_pending'; // [{ trackingId, offerToken, storeId }]
const STORE_IDS_KEY = 'wf_ms_store_ids';   // { offerToken: storeId }, remembered once seen

const S_OK = 0;
const PURCHASE = { SUCCEEDED: 0, ALREADY_PURCHASED: 1, NOT_PURCHASED: 2 };
const CONSUMABLE_SUCCEEDED = 0;

export class StoreUnavailableError extends Error {
  constructor() {
    super('Microsoft Store unavailable');
    this.name = 'StoreUnavailableError';
  }
}

const offerTokenFor = productId => String(productId).split('.').pop();

// The Windows packs (S42): 5, 10 and 25 hints, in the shop's order and look. Its own
// list, so the native list (PURCHASE_OPTIONS in purchases.js) is never read or changed.
export const WINDOWS_PURCHASE_OPTIONS = [
  { productId: 'au.com.uniquegames.soundfind.hints_5',  hints: 5,  label: 'Starter',    gradient: 'from-amber-400 to-orange-500',  shadow: 'shadow-amber-200',   popular: false },
  { productId: 'au.com.uniquegames.soundfind.hints_10', hints: 10, label: 'Best Value', gradient: 'from-violet-500 to-indigo-600', shadow: 'shadow-violet-200',  popular: true  },
  { productId: 'au.com.uniquegames.soundfind.hints_25', hints: 25, label: 'Power Pack', gradient: 'from-emerald-400 to-teal-500',  shadow: 'shadow-emerald-200', popular: false },
];
// Hints per pack, keyed by the Partner Center product ID (the Store's InAppOfferToken).
export const WINDOWS_HINT_PACKS = Object.fromEntries(
  WINDOWS_PURCHASE_OPTIONS.map(o => [offerTokenFor(o.productId), o.hints]),
);
const bridge = () => (typeof window !== 'undefined' ? window.soundfindStore : undefined);

let available = false;
let prices = {}; // shop productId -> formatted price
const listeners = new Set();
const notify = () => listeners.forEach(l => l());

function readJson(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the in-memory flow continues.
  }
}
const readPending = () => {
  const list = readJson(PENDING_KEY, []);
  return Array.isArray(list) ? list : [];
};
const storeIds = () => readJson(STORE_IDS_KEY, {});

export function isWindowsStoreAvailable() {
  return available;
}

export function getWindowsPrice(productId) {
  return prices[productId] ?? null;
}

export function subscribeWindowsPrices(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Loads products and prices; remembers each Store ID. Sets `available`.
async function loadProducts() {
  const b = bridge();
  if (!b) return false;
  let answer;
  try {
    answer = await b.getProducts();
  } catch {
    answer = null;
  }
  if (!answer?.ok || answer.hresult !== S_OK) {
    available = false;
    prices = {};
    notify();
    return false;
  }
  const ids = { ...storeIds() };
  const next = {};
  for (const p of answer.products || []) {
    if (!p?.offerToken || !p.storeId) continue;
    ids[p.offerToken] = p.storeId;
    const shopId = WINDOWS_PURCHASE_OPTIONS.find(o => offerTokenFor(o.productId) === p.offerToken)?.productId;
    if (shopId && p.price) next[shopId] = p.price;
  }
  writeJson(STORE_IDS_KEY, ids);
  prices = next;
  available = true;
  notify();
  return true;
}

function newTrackingId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  // Fallback: an RFC 4122 version 4 GUID from getRandomValues.
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// Credit (through the ledger, keyed on the tracking ID), then report. Returns the
// hints credited now (0 if this tracking ID was credited before).
async function finish(entry) {
  const amount = WINDOWS_HINT_PACKS[entry.offerToken] ?? 0;
  const { creditedHints } = creditPurchaseNow(
    { platform: 'windows', productId: entry.offerToken, trackingId: entry.trackingId }, amount,
  );
  let answer = null;
  try {
    answer = await bridge()?.reportFulfillment(entry.storeId, entry.trackingId);
  } catch {
    answer = null;
  }
  if (answer?.ok && answer.status === CONSUMABLE_SUCCEEDED) {
    writeJson(PENDING_KEY, readPending().filter(p => p.trackingId !== entry.trackingId));
  }
  return creditedHints;
}

// Launch: load products, then finish every saved purchase.
export async function initWindowsStore() {
  await loadProducts();
  let credited = 0;
  for (const entry of readPending()) credited += await finish(entry);
  if (credited > 0) {
    window.dispatchEvent(new CustomEvent(PROGRESS_CHANGED_EVENT));
    toast.success(`Added ${credited} hints from an earlier purchase`);
  }
  return credited;
}

export async function purchaseWindowsHintPack(productId) {
  const offerToken = offerTokenFor(productId);
  const hints = WINDOWS_HINT_PACKS[offerToken];
  const storeId = storeIds()[offerToken];
  const b = bridge();
  if (!available || !b || !hints || !storeId) throw new StoreUnavailableError();

  let answer;
  try {
    answer = await b.purchase(storeId);
  } catch {
    answer = null;
  }
  if (!answer?.ok) throw new StoreUnavailableError();

  if (answer.status === PURCHASE.SUCCEEDED || answer.status === PURCHASE.ALREADY_PURCHASED) {
    // AlreadyPurchased with a saved entry for this pack: that entry is the charge.
    const saved = answer.status === PURCHASE.ALREADY_PURCHASED
      ? readPending().find(p => p.storeId === storeId)
      : null;
    const entry = saved || { trackingId: newTrackingId(), offerToken, storeId };
    if (!saved) writeJson(PENDING_KEY, [...readPending(), entry]); // saved BEFORE the credit
    const credited = await finish(entry);
    return { hints, purchase: { platform: 'windows', productId: offerToken, trackingId: entry.trackingId }, credited };
  }
  if (answer.status === PURCHASE.NOT_PURCHASED) throw new Error('Purchase cancelled');
  throw new Error(`Microsoft Store purchase failed (status ${answer.status}, hresult ${answer.hresult})`);
}

// Tests only: reset the module's in-memory state.
export function __resetWindowsStoreForTests() {
  available = false;
  prices = {};
  listeners.clear();
}
