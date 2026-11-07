import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const modelSource = readFileSync(new URL('../shopping-costs.js', import.meta.url), 'utf8');
const browserGlobal = {};
runInNewContext(modelSource, browserGlobal);
const model = browserGlobal.AngebotskuecheCostModel;

const parseEuro = value => {
  const match = String(value || '').match(/^(\d+)(?:,(\d{1,2}))? €$/);
  if (!match) return null;
  return Number(match[1]) + Number('0.' + (match[2] || '0'));
};

test('exposes a browser-safe deterministic cost model', () => {
  assert.equal(typeof model.calculateOfferAmount, 'function');
  assert.equal(typeof model.summarizeShoppingCosts, 'function');
  assert.equal(model.normalizePackCount('2.2'), 3);
  assert.equal(model.normalizePackCount('invalid'), 1);
});

test('sums only explicit offer prices in integer cents and keeps unknown prices visible', () => {
  const summary = model.calculateOfferAmount([
    { id: 'known', packCount: 2, offer: { price: '1,20 €' } },
    { id: 'unknown', packCount: 1, offer: { price: 'Preis unbekannt' } },
  ], parseEuro);

  assert.equal(summary.totalCents, 240);
  assert.equal(summary.total, 2.4);
  assert.deepEqual(Array.from(summary.knownItems, item => item.id), ['known']);
  assert.deepEqual(Array.from(summary.unknownItems, item => item.id), ['unknown']);
});

test('separates missing items from offer items without assigning a price', () => {
  const summary = model.summarizeShoppingCosts([
    { id: 'known', packCount: 1, offer: { price: '2,49 €' } },
    { id: 'unknown', packCount: 1, offer: { price: 'Preis unbekannt' } },
    { id: 'missing', packCount: 1, offer: null },
  ], parseEuro);

  assert.equal(summary.totalCents, 249);
  assert.equal(summary.knownItems.length, 1);
  assert.equal(summary.unknownItems.length, 1);
  assert.equal(summary.missingCount, 1);
  assert.deepEqual(Array.from(summary.missingItems, item => item.id), ['missing']);
});

test('treats invalid or nonpositive pack counts as one pack', () => {
  const summary = model.calculateOfferAmount([
    { id: 'invalid', packCount: 0, offer: { price: '1,10 €' } },
    { id: 'missing', packCount: -2, offer: { price: '1,10 €' } },
  ], parseEuro);

  assert.equal(summary.totalCents, 220);
});
