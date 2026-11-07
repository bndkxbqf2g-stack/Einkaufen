import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const estimateMatch = source.match(/function estimateMealCost\\(recipe\\) \\{[\\s\\S]*?\\n    \\}/);

test('does not fall back to a static recipe cost without verified offers', () => {
  assert.ok(estimateMatch, 'estimateMealCost must be present');
  assert.match(estimateMatch[0], /matchedOffers\\.length < 2\\) return ''/);
  assert.match(estimateMatch[0], /offerPrices\\.some\\(price => price === null\\)\\) return ''/);
  assert.doesNotMatch(estimateMatch[0], /fallback|Math\\.max/);
});

test('marks partial plan costs as unknown instead of zero', () => {
  assert.match(source, /costSource: cost \\? 'offer-subtotal' : 'unknown'/);
  assert.match(source, /meal\\.costSource === 'offer-subtotal' && parseKnownMoney\\(meal\\.cost\\) !== null/);
  assert.match(source, /unknownMeals \\? '–' : formatEuro\\(knownOfferTotal)/);
  assert.match(source, /Preis unbekannt/);
});

test('keeps the published frontend synchronized with the source page', () => {
  assert.equal(published, source);
});

console.log('Unknown plan cost checks passed');