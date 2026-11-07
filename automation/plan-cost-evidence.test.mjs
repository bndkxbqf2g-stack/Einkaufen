import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const estimateStart = source.indexOf('function estimateMealCost(recipe) {');
const estimateEnd = source.indexOf(String.fromCharCode(10) + '    function favoriteAsCandidate', estimateStart);
const estimate = source.slice(estimateStart, estimateEnd);

test('does not fall back to a static recipe cost without verified offers', () => {
  assert.ok(estimateStart >= 0 && estimateEnd > estimateStart, 'estimateMealCost must be present');
  assert.ok(estimate.includes("if (match.matchedOffers.length < 2) return '';"));
  assert.ok(estimate.includes("if (offerPrices.some(price => price === null)) return '';"));
  assert.equal(estimate.includes('fallback'), false);
  assert.equal(estimate.includes('Math.max'), false);
});

test('marks partial plan costs as unknown instead of zero', () => {
  assert.ok(source.includes("costSource: cost ? 'offer-subtotal' : 'unknown'"));
  assert.ok(source.includes("meal.costSource === 'offer-subtotal' && parseKnownMoney(meal.cost) !== null"));
  assert.ok(source.includes("unknownMeals ? '–' : formatEuro(knownOfferTotal)"));
  assert.ok(source.includes('Preis unbekannt'));
});

test('keeps the published frontend synchronized with the source page', () => {
  assert.equal(published, source);
});

console.log('Unknown plan cost checks passed');