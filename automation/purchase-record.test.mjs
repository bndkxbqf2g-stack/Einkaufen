import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = await readFile(new URL('../purchase-record.js', import.meta.url), 'utf8');
const scope = {};
runInNewContext(source, scope);
const model = scope.AngebotskuechePurchaseRecordModel;

test('normalizes a complete purchase record without changing values', () => {
  const result = model.normalizePurchaseRecord({
    id: 'purchase-1',
    purchasedAt: '2026-11-11T18:30:00Z',
    market: 'EDEKA',
    totalCents: 2387,
    items: [{ name: 'Kartoffeln', totalCents: 499, count: 1 }],
    note: 'Kassenbon geprüft',
  });
  assert.deepEqual(result, {
    id: 'purchase-1',
    purchasedAt: '2026-11-11T18:30:00Z',
    market: 'EDEKA',
    totalCents: 2387,
    items: [{ name: 'Kartoffeln', totalCents: 499, count: 1 }],
    note: 'Kassenbon geprüft',
  });
});

test('rejects incomplete or unsafe money and item values', () => {
  assert.equal(model.normalizePurchaseRecord({}), null);
  assert.equal(model.normalizePurchaseRecord({
    id: 'x', purchasedAt: 'now', market: 'A', totalCents: -1, items: [],
  }), null);
  assert.equal(model.normalizePurchaseRecord({
    id: 'x', purchasedAt: 'now', market: 'A', totalCents: 100, items: [{ name: 'x', totalCents: 100, count: 0 }],
  }), null);
  assert.equal(model.cents(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
  assert.equal(model.cents(Number.MAX_SAFE_INTEGER + 1), null);
});
