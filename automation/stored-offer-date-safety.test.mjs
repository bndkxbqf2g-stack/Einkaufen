import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const helperStart = source.indexOf('function normalizeSeedOffer');
const helperEnd = source.indexOf('let offers =', helperStart);
const helpers = source.slice(helperStart, helperEnd);
const context = { defaultOfferEnd: () => '31.12.2099' };
vm.runInNewContext(`${helpers}\\nglobalThis.normalizeSeedOffer = normalizeSeedOffer; globalThis.normalizeStoredCustomOffer = normalizeStoredCustomOffer;`, context);

test('keeps the demo fallback date separate from stored custom offers', () => {
  const seed = context.normalizeSeedOffer({ name: 'Demo' });
  assert.equal(seed.source, 'Demo-Import');
  assert.equal(seed.validUntil, '31.12.2099');
  const legacy = context.normalizeStoredCustomOffer({ name: 'Alter Import' });
  assert.equal(legacy.validUntil, '');
  assert.equal(legacy.source, 'manueller Import');
});

test('preserves an explicit stored offer date', () => {
  const stored = context.normalizeStoredCustomOffer({ name: 'Datierter Import', validUntil: '31.12.2099', source: 'Prospekt' });
  assert.equal(stored.validUntil, '31.12.2099');
  assert.equal(stored.source, 'Prospekt');
});

test('keeps the published frontend synchronized with the source page', () => {
  assert.equal(published, source);
});

console.log('Stored offer date safety checks passed');