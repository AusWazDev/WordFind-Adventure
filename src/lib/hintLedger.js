// Hint-pack ledger (S40-C, SF-50, P1): a hint pack that the store charged but the
// app never credited (the app died between the charge and the credit) is credited
// on a later launch, exactly once.
//
// Two NEW fields inside wf_progress (the key and its other fields are unchanged):
//   credited_txn_ids  store transaction IDs already credited, by either path
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

export const PROGRESS_CHANGED_EVENT = 'soundfind-progress-changed';

const ids = progress => (Array.isArray(progress?.credited_txn_ids) ? progress.credited_txn_ids : []);
const hints = progress => (typeof progress?.hints_remaining === 'number' ? progress.hints_remaining : 0);

// Pure. Sets the baseline if it is missing; never credits anything.
export function withBaseline(progress, now) {
  if (progress?.reconcile_since) return progress;
  return { ...progress, reconcile_since: new Date(now).toISOString() };
}

// Pure. The purchase path: credit `amount` for transaction `txnId` unless it is
// already recorded. Balance and ID change together. With no ID (the SDK always
// returns one; this is a fallback) the hints are credited and nothing is recorded.
export function creditPurchase(progress, txnId, amount) {
  if (txnId && ids(progress).includes(txnId)) return { progress, creditedHints: 0 };
  return {
    progress: {
      ...progress,
      hints_remaining: hints(progress) + amount,
      ...(txnId ? { credited_txn_ids: [...ids(progress), txnId] } : {}),
    },
    creditedHints: amount,
  };
}

// Pure. Credit every hint-pack transaction on or after the baseline that is not yet
// recorded. Without a baseline nothing is credited (the caller sets one first).
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
    next = creditPurchase(next, t.transactionIdentifier, amount).progress;
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
export function creditPurchaseNow(txnId, amount) {
  const current = getLocalProgress() || {};
  const { progress, creditedHints } = creditPurchase(current, txnId, amount);
  if (creditedHints > 0) {
    saveLocalProgress({
      hints_remaining: progress.hints_remaining,
      ...(progress.credited_txn_ids ? { credited_txn_ids: progress.credited_txn_ids } : {}),
    });
  }
  return { progress: getLocalProgress() || progress, creditedHints };
}
