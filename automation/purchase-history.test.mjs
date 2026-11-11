import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [storeSource, historySource] = await Promise.all([
  readFile(new URL('../purchase-record-store.js', import.meta.url), 'utf8'),
  readFile(new URL('../purchase-history.js', import.meta.url), 'utf8'),
]);
const scope = {};
runInNewContext(storeSource, scope);
runInNewContext(historySource, scope);
const history = scope.AngebotskuechePurchaseHistory;

test('formats valid calendar months for the local history', () => {
  assert.match(history.monthLabel('2026-11'), /November 2026/);
  assert.equal(history.monthLabel('invalid'), 'Ungültiger Monat');
});

test('keeps current-month aggregation delegated to the validated store', () => {
  const records = [{
    id: 'purchase-1',
    purchasedAt: '2026-11-11T18:30:00Z',
    market: 'EDEKA',
    totalCents: 2387,
    items: [],
  }];
  const summary = history.currentMonth(records, new Date('2026-11-20T10:00:00Z'));
  assert.deepEqual(JSON.parse(JSON.stringify(summary)), {
    month: '2026-11',
    recordCount: 1,
    actualSpendCents: 2387,
  });
});
