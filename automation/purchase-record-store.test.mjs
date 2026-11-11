import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [recordSource, storeSource] = await Promise.all([
  readFile(new URL('../purchase-record.js', import.meta.url), 'utf8'),
  readFile(new URL('../purchase-record-store.js', import.meta.url), 'utf8'),
]);
const memory = new Map();
const storage = {
  getItem: key => memory.has(key) ? memory.get(key) : null,
  setItem: (key, value) => memory.set(key, value),
};
const scope = { localStorage: storage };
runInNewContext(recordSource, scope);
runInNewContext(storeSource, scope);
const store = scope.AngebotskuechePurchaseRecordStore;

const record = { id: 'purchase-1', purchasedAt: '2026-11-11T18:30:00Z', market: 'EDEKA', totalCents: 2387, items: [] };

test('loads, appends and preserves validated purchase records locally', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(store.load())), []);
  assert.deepEqual(JSON.parse(JSON.stringify(store.append(record))), record);
  assert.deepEqual(JSON.parse(JSON.stringify(store.load())), [record]);
});

test('rejects invalid records without overwriting existing data', () => {
  assert.equal(store.append({ ...record, totalCents: -1 }), null);
  assert.deepEqual(JSON.parse(JSON.stringify(store.load())), [record]);
  assert.equal(store.save([{ ...record, totalCents: -1 }]), false);
  assert.deepEqual(JSON.parse(JSON.stringify(store.load())), [record]);
});
