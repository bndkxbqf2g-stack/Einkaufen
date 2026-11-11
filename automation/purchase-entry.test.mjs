import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [recordSource, entrySource] = await Promise.all([
  readFile(new URL('../purchase-record.js', import.meta.url), 'utf8'),
  readFile(new URL('../purchase-entry.js', import.meta.url), 'utf8'),
]);
const scope = {};
runInNewContext(recordSource, scope);
runInNewContext(entrySource, scope);
const entry = scope.AngebotskuechePurchaseEntry;

test('parses only explicit euro amounts into safe cents', () => {
  assert.equal(entry.parseEuroToCents('42,87 €'), 4287);
  assert.equal(entry.parseEuroToCents('1.234,50'), 123450);
  assert.equal(entry.parseEuroToCents('0,00'), 0);
  assert.equal(entry.parseEuroToCents('kostenlos'), null);
  assert.equal(entry.parseEuroToCents('12,345'), null);
});

test('builds a validated local purchase record without inferred items', () => {
  const result = entry.buildRecord({
    id: 'purchase-test',
    purchasedAt: '2026-11-11T12:00:00Z',
    market: 'EDEKA',
    totalCents: 4287,
    note: 'Kassenbon geprüft',
  });
  assert.deepEqual(JSON.parse(JSON.stringify(result)), {
    id: 'purchase-test',
    purchasedAt: '2026-11-11T12:00:00Z',
    market: 'EDEKA',
    totalCents: 4287,
    items: [],
    note: 'Kassenbon geprüft',
  });
});
