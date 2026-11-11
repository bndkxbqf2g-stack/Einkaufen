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

const record = { id: 'purchase-1', purchasedAt: '2026-11-11T18:30:00Z', market: 'EDEKA', totalCents: 2387, items: [], note: null };
const inputRecord = { ...record };
delete inputRecord.note;

test('loads, appends and preserves validated purchase records locally', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(store.load())), []);
  assert.deepEqual(JSON.parse(JSON.stringify(store.append(inputRecord))), record);
  assert.deepEqual(JSON.parse(JSON.stringify(store.load())), [record]);
});

test('rejects invalid records without overwriting existing data', () => {
  assert.equal(store.append({ ...inputRecord, totalCents: -1 }), null);
  assert.deepEqual(JSON.parse(JSON.stringify(store.load())), [record]);
  assert.equal(store.save([{ ...inputRecord, totalCents: -1 }]), false);
  assert.deepEqual(JSON.parse(JSON.stringify(store.load())), [record]);
});


test('summarizes confirmed purchases for the selected calendar month', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(store.summarizeMonth(store.load(), '2026-11'))), {
    month: '2026-11',
    recordCount: 1,
    actualSpendCents: 2387,
  });
  assert.deepEqual(JSON.parse(JSON.stringify(store.summarizeMonth(store.load(), '2026-10'))), {
    month: '2026-10',
    recordCount: 0,
    actualSpendCents: 0,
  });
  assert.equal(store.summarizeMonth(store.load(), 'invalid').actualSpendCents, null);
});
