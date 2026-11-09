import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const modelSource = readFileSync(new URL('../shopping-costs.js', import.meta.url), 'utf8');
const publishedModelSource = readFileSync(new URL('../dist/shopping-costs.js', import.meta.url), 'utf8');
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

test('keeps the published cost model synchronized with the root module', () => {
  assert.equal(publishedModelSource, modelSource);
});

test('sums only explicit offer prices in integer cents and keeps unknown prices visible', () => {
  const summary = model.calculateOfferAmount([
    { id: 'known', packCount: 2, offer: { price: '1,20 €' } },
    { id: 'unknown', packCount: 1, offer: { price: 'Preis unbekannt' } },
  ], parseEuro);

  assert.equal(summary.totalCents, 240);
  assert.equal(summary.total, 2.4);
  assert.equal(summary.knownOfferPackCount, 2);
  assert.equal(summary.unknownPricePackCount, 1);
  assert.equal(summary.estimatedPackCount, 3);
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

test('exposes one canonical, traceable contract for known, unknown, missing, and manual items', () => {
  const summary = model.summarizeShoppingCosts([
    { id: 'known', packCount: 2, offer: { price: '1,20 €' } },
    { id: 'unknown', packCount: 1, offer: { price: 'Preis unbekannt' } },
    { id: 'missing', packCount: 1, offer: null },
    { id: 'manual', packCount: 3, manual: true, offer: null },
  ], parseEuro);

  assert.equal(summary.itemCount, 4);
  assert.equal(summary.classifiedItemCount, summary.itemCount);
  assert.equal(summary.offerItemCount, 2);
  assert.equal(summary.knownOfferCount, 1);
  assert.equal(summary.unknownPriceCount, 1);
  assert.equal(summary.missingCount, 2);
  assert.equal(summary.manualMissingCount, 1);
  assert.equal(summary.unanchoredMissingCount, 1);
  assert.equal(summary.knownOfferTotalCents, 240);
  assert.equal(summary.knownOfferTotal, 2.4);
  assert.equal(summary.estimatedPackCount, 7);
  assert.equal(summary.offerEstimatedPackCount, 3);
  assert.equal(summary.missingPackCount, 4);
  assert.deepEqual(Array.from(summary.knownOfferItems, item => item.id), ['known']);
  assert.deepEqual(Array.from(summary.unknownPriceItems, item => item.id), ['unknown']);
  assert.deepEqual(Array.from(summary.manualMissingItems, item => item.id), ['manual']);
  assert.deepEqual(Array.from(summary.unanchoredMissingItems, item => item.id), ['missing']);

  const noKnownPrice = model.summarizeShoppingCosts([
    { id: 'unknown-only', packCount: 1, offer: { price: 'Preis unbekannt' } },
  ], parseEuro);
  assert.equal(noKnownPrice.knownOfferTotal, null);
  assert.equal(noKnownPrice.knownOfferTotalCents, null);
});

test('behandelt unsichere Centbeträge konservativ als unbekannt', () => {
  const nearLimitEuro = Number.MAX_SAFE_INTEGER / 100;
  const summary = model.calculateOfferAmount([
    { id: 'first', packCount: 1, offer: { price: 'near-limit' } },
    { id: 'overflow', packCount: 1, offer: { price: 'near-limit' } },
  ], () => nearLimitEuro);

  assert.equal(summary.totalCents, Number.MAX_SAFE_INTEGER);
  assert.equal(summary.knownOfferCount, 1);
  assert.deepEqual(Array.from(summary.unknownItems, item => item.id), ['overflow']);

  const unsafeSingle = model.calculateOfferAmount([
    { id: 'unsafe-single', packCount: 1, offer: { price: 'too-large' } },
  ], () => 100_000_000_000_000);

  assert.equal(unsafeSingle.totalCents, 0);
  assert.equal(unsafeSingle.knownOfferCount, 0);
  assert.deepEqual(Array.from(unsafeSingle.unknownItems, item => item.id), ['unsafe-single']);
});

test('treats invalid or nonpositive pack counts as one pack', () => {
  const summary = model.calculateOfferAmount([
    { id: 'invalid', packCount: 0, offer: { price: '1,10 €' } },
    { id: 'missing', packCount: -2, offer: { price: '1,10 €' } },
  ], parseEuro);

  assert.equal(summary.totalCents, 220);
});

