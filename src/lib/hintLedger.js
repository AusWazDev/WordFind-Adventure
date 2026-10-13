// Hint-pack ledger (S40-C, SF-50, P1): a hint pack that the store charged but the
// app never credited (the app died between the charge and the credit) is credited
// on a later launch, exactly once.
//
// Two NEW fields inside wf_progress (the key and its other fields are unchanged):
//   credited_txn_ids  RevenueCat transaction IDs already credited, by either path,
//                     plus purchase-path claims (see "What the ledger records")
//   reconcile_since   ISO time; only transactions on or after it are reconciled
//
// Why a baseline: a reinstall with device backup off starts with an empty ledger,
// and Restore Purchases can alias the new install to the old RevenueCat customer
// (seen on the tablet, 12 Oct 2026), whose nonSubscriptionTransactions lists every
// old, already-spent pack. Without a baseline they would all be credited again.
// The baseline is set when it is missing (a new install, or the first launch of this
// version), before any purchase is possible. It has NO safety margin: device-store
// clock skew can only push a purchase made right after the baseline to before it,
// which loses that one recovery (today's behaviour); a margin the other way would
// re-credit packs bought just before an upgrade, which the old version credited
// without recording an ID.
import { toast } from 'sonner';
import { isNative } from '@/lib/platform';
import { HINT_PACK_MAP } from '@/lib/purchases';
import { getLocalProgress, saveLocalProgress, loadProgress } from '@/components/game/offlineStorage';
import { hintBalance } from '@/lib/hintBalance';

export const PROGRESS_CHANGED_EVENT = 'soundfind-progress-changed';

const ids = progress => (Array.isArray(progress?.credited_txn_ids) ? progress.credited_txn_ids : []);
// A credit adds to the balance the player sees: a missing or invalid one counts as 12, as on
// every screen (SF-66b B1). It used to count as 0, so a pack replaced 12 with its own size.
const hints = progress => hintBalance(progress);

// Pure. Sets the baseline if it is missing; never credits anything.
export function withBaseline(progress, now) {
  if (progress?.reconcile_since) return progress;
  return { ...progress, reconcile_since: new Date(now).toISOString() };
}

// What the ledger records (DEF-53, SF-56). The purchase result's transaction ID is
// the STORE's ID (a Google Play order ID; a StoreKit ID on iOS), while
// customerInfo.nonSubscriptionTransactions lists RevenueCat's OWN ID for the same
// purchase, and no field carries the same value on both sides (SF-56 A1). So the
// ledger records RevenueCat's ID, taken from the customerInfo the purchase call
// returns, which already lists the new entry (SF-56 A2). When that entry cannot be
// found, the purchase path records a claim instead, "pending:<product>:<ms>", and a
// later reconcile treats the first listed entry for that product within
// MATCH_WINDOW_MS of the claim as already credited, recording its ID and
// "matched:<product>:<ms>" so the claim is used once. Claims live in
// credited_txn_ids, which only ever grows (offlineStorage), as IDs do.
export const MATCH_WINDOW_MS = 2000; // the store's time and RevenueCat's differed by 893 ms (SF-55)

const pendingClaim = (productId, ms) => `pending:${productId}:${ms}`;
const matchedClaim = (productId, ms) => `matched:${productId}:${ms}`;

// Pure. Add `amount` and record `recordId` together; nothing if already recorded.
function recordAndCredit(progress, recordId, amount) {
  if (recordId && ids(progress).includes(recordId)) return { progress, creditedHints: 0 };
  return {
    progress: {
      ...progress,
      hints_remaining: hints(progress) + amount,
      ...(recordId ? { credited_txn_ids: [...ids(progress), recordId] } : {}),
    },
    creditedHints: amount,
  };
}

// Pure. The listed entry for this purchase: same product, not yet recorded, within
// MATCH_WINDOW_MS of the store's purchase time, latest purchaseDate first.
export function findListedEntry(progress, purchase) {
  const at = Date.parse(purchase?.purchaseDate);
  const recorded = ids(progress);
  return (purchase?.listed || [])
    .filter(e => e?.productIdentifier === purchase.productId && e.transactionIdentifier && !recorded.includes(e.transactionIdentifier))
    .filter(e => Number.isFinite(Date.parse(e.purchaseDate)) && Number.isFinite(at) && Math.abs(Date.parse(e.purchaseDate) - at) <= MATCH_WINDOW_MS)
    .sort((a, b) => Date.parse(b.purchaseDate) - Date.parse(a.purchaseDate))[0] || null;
}

// Pure. The purchase path. `purchase` is { productId, purchaseDate, listed } from
// purchaseProduct. Always credits once; records RevenueCat's ID for the purchase, or
// a pending claim when the entry is not listed, so a reconcile never credits it again.
export function creditPurchase(progress, purchase, amount, now = Date.now()) {
  const entry = findListedEntry(progress, purchase);
  if (entry) return recordAndCredit(progress, entry.transactionIdentifier, amount);
  const at = Date.parse(purchase?.purchaseDate);
  return recordAndCredit(progress, pendingClaim(purchase?.productId, Number.isFinite(at) ? at : now), amount);
}

// Pure. The pending claim (if any) that a listed entry answers.
function claimFor(recorded, t) {
  const at = Date.parse(t.purchaseDate);
  return recorded.find(r => {
    const m = /^pending:(.+):(\d+)$/.exec(r);
    return m && m[1] === t.productIdentifier && Math.abs(Number(m[2]) - at) <= MATCH_WINDOW_MS
      && !recorded.includes(matchedClaim(m[1], m[2]));
  });
}

// Pure. Credit every hint-pack transaction on or after the baseline that is not yet
// recorded. Without a baseline nothing is credited (the caller sets one first). An
// entry that answers a pending claim is recorded but not credited: the purchase path
// already credited it.
export function reconcile(progress, transactions, now) {
  const since = Date.parse(progress?.reconcile_since);
  if (!Number.isFinite(since)) return { progress: withBaseline(progress, now), creditedHints: 0 };
  let next = progress;
  let creditedHints = 0;
  for (const t of transactions || []) {
    const amount = HINT_PACK_MAP[t?.productIdentifier];
    if (!amount || !t.transactionIdentifier) continue;
    if (!(Date.parse(t.purchaseDate) >= since)) continue;
    if (ids(next).includes(t.transactionIdentifier)) continue;
    const claim = claimFor(ids(next), t);
    if (claim) {
      const [, product, ms] = /^pending:(.+):(\d+)$/.exec(claim);
      next = { ...next, credited_txn_ids: [...ids(next), t.transactionIdentifier, matchedClaim(product, ms)] };
      continue;
    }
    next = recordAndCredit(next, t.transactionIdentifier, amount).progress;
    creditedHints += amount;
  }
  return { progress: next, creditedHints };
}

// Wiring. Called by initPurchases before Purchases.configure, so before any purchase.
export async function ensureReconcileBaseline(now = Date.now()) {
  if (!isNative()) return;
  const current = await loadProgress(); // seeds wf_progress first if it is missing
  if (!current.reconcile_since) saveLocalProgress({ reconcile_since: withBaseline(current, now).reconcile_since });
}

// Wiring. Called by initPurchases with the customerInfo it fetched. One write for
// balance and IDs; then any open screen re-reads the balance (H2) and a toast says why.
export function reconcileHintPurchases(customerInfo, now = Date.now()) {
  if (!isNative() || !customerInfo) return 0;
  const current = getLocalProgress();
  if (!current) return 0;
  const { progress, creditedHints } = reconcile(current, customerInfo.nonSubscriptionTransactions, now);
  if (progress === current) return 0;
  saveLocalProgress({
    hints_remaining: progress.hints_remaining,
    credited_txn_ids: progress.credited_txn_ids,
    reconcile_since: progress.reconcile_since,
  });
  if (creditedHints > 0) {
    window.dispatchEvent(new CustomEvent(PROGRESS_CHANGED_EVENT));
    toast.success(`Added ${creditedHints} hints from an earlier purchase`);
  }
  return creditedHints;
}

// Wiring. The pages' purchase path: credit from the stored progress, in one write.
// `purchase` is purchaseProduct's { productId, purchaseDate, listed }.
export function creditPurchaseNow(purchase, amount) {
  const current = getLocalProgress() || {};
  const { progress, creditedHints } = creditPurchase(current, purchase, amount);
  if (creditedHints > 0) {
    saveLocalProgress({
      hints_remaining: progress.hints_remaining,
      ...(progress.credited_txn_ids ? { credited_txn_ids: progress.credited_txn_ids } : {}),
    });
  }
  return { progress: getLocalProgress() || progress, creditedHints };
}
