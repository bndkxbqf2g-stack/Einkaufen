import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MONTHLY_BUDGET_CENTS,
  monthForPurchaseDate,
  summarizePurchaseRecords,
  validatePurchaseRecord,
  validatePurchaseRecords,
} from './purchase-records.mjs';

test('normalizes a manual purchase record and derives its month deterministically', () => {
  assert.deepEqual(
    validatePurchaseRecord({
      id: '  einkauf-1 ',
      purchaseDate: '2026-11-07',
      month: '2026-11',
      totalCents: 1234,
      market: '  Kaufland ',
      source: 'manual',
    }),
    {
      id: 'einkauf-1',
      purchaseDate: '2026-11-07',
      month: '2026-11',
      totalCents: 1234,
      market: 'Kaufland',
      source: 'manual',
    },
  );
  assert.equal(monthForPurchaseDate('2028-02-29'), '2028-02');
});

test('rejects malformed, inconsistent, or non-manual purchase records', () => {
  assert.throws(
    () => validatePurchaseRecord({ id: 'x', purchaseDate: '2026-02-30', month: '2026-02', totalCents: 100, source: 'manual' }),
    /purchaseDate/,
  );
  assert.throws(
    () => validatePurchaseRecord({ id: 'x', purchaseDate: '2026-11-07', month: '2026-10', totalCents: 100, source: 'manual' }),
    /month/,
  );
  assert.throws(
    () => validatePurchaseRecord({ id: 'x', purchaseDate: '2026-11-07', month: '2026-11', totalCents: -1, source: 'manual' }),
    /totalCents/,
  );
  assert.throws(
    () => validatePurchaseRecord({ id: 'x', purchaseDate: '2026-11-07', month: '2026-11', totalCents: Number.MAX_SAFE_INTEGER + 1, source: 'manual' }),
    /totalCents/,
  );
  assert.throws(
    () => validatePurchaseRecord({ id: 'x', purchaseDate: '2026-11-07', month: '2026-11', totalCents: 100, source: 'receipt' }),
    /source/,
  );
});

test('rejects duplicate IDs and invalid record lists before summarizing', () => {
  const record = { id: 'x', purchaseDate: '2026-11-07', month: '2026-11', totalCents: 100, source: 'manual' };
  assert.throws(() => validatePurchaseRecords([record, { ...record }]), /doppelt/);
  assert.throws(() => summarizePurchaseRecords(record, '2026-11'), /Liste/);
  assert.throws(() => summarizePurchaseRecords([], '2026-13'), /month/);
  assert.throws(() => summarizePurchaseRecords([], '0000-01'), /month/);
});

test('summarizes only the requested month and keeps plan values separate', () => {
  const summary = summarizePurchaseRecords([
    { id: 'nov-1', purchaseDate: '2026-11-01', month: '2026-11', totalCents: 25_000, source: 'manual' },
    { id: 'nov-2', purchaseDate: '2026-11-15', month: '2026-11', totalCents: 20_000, market: 'Aldi', source: 'manual' },
    { id: 'dec-1', purchaseDate: '2026-12-01', month: '2026-12', totalCents: 99_999, source: 'manual' },
  ], '2026-11');

  assert.equal(summary.recordCount, 2);
  assert.equal(summary.totalCents, 45_000);
  assert.equal(summary.targetCents, MONTHLY_BUDGET_CENTS);
  assert.equal(summary.remainingCents, -5_000);
  assert.equal(summary.overTarget, true);
});

console.log('Purchase record core checks passed');
test('rejects a monthly sum that exceeds the safe integer range', () => {
  const first = { id: 'large-1', purchaseDate: '2026-11-07', month: '2026-11', totalCents: Number.MAX_SAFE_INTEGER, source: 'manual' };
  const second = { id: 'large-2', purchaseDate: '2026-11-08', month: '2026-11', totalCents: 1, source: 'manual' };

  assert.throws(() => summarizePurchaseRecords([first, second], '2026-11'), /Monatsgesamtbetrag/);
});
