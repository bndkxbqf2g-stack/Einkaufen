import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const parseMoneyMatch = html.match(/function parseKnownMoney\(value\) \{[\s\S]*?\n    \}/);
const packageSizeMatch = html.match(/function parseKnownPackageSize\(value\) \{[\s\S]*?\n    \}/);
const compareMatch = html.match(/function compareOfferCandidates\(first, second\) \{[\s\S]*?\n    \}/);
assert.ok(parseMoneyMatch, 'parseKnownMoney muss im App-Bundle vorhanden sein');
assert.ok(packageSizeMatch, 'parseKnownPackageSize muss im App-Bundle vorhanden sein');
assert.ok(compareMatch, 'compareOfferCandidates muss im App-Bundle vorhanden sein');
const parseKnownMoney = new Function(`${parseMoneyMatch[0]}; return parseKnownMoney;`)();
const parseKnownPackageSize = new Function(`${packageSizeMatch[0]}; return parseKnownPackageSize;`)();
const compareOfferCandidates = new Function(`${parseMoneyMatch[0]}\n${packageSizeMatch[0]}\n${compareMatch[0]}; return compareOfferCandidates;`)();

function bestCandidate(offers) {
  return [...offers].sort(compareOfferCandidates)[0];
}

test('höhere Relevanz schlägt einen niedrigeren Packungspreis', () => {
  const selected = bestCandidate([
    { id: 'relevant', relevance: 90, packSize: '500 g', price: '4,99 €' },
    { id: 'cheap', relevance: 80, packSize: '500 g', price: '1,99 €' },
  ]);

  assert.equal(selected.id, 'relevant');
});

test('gleiche Packungsgröße und Relevanz wählen den günstigeren bekannten Packungspreis', () => {
  const selected = bestCandidate([
    { id: 'expensive', relevance: 80, packSize: '500 g', price: '3,49 €' },
    { id: 'cheap', relevance: 80, packSize: '500 g', price: '2,49 €' },
  ]);

  assert.equal(selected.id, 'cheap');
});

test('äquivalente Schreibweisen derselben Packungsmenge werden normalisiert', () => {
  assert.deepEqual(parseKnownPackageSize('500 g'), { amount: 500, unit: 'g' });
  assert.deepEqual(parseKnownPackageSize('0,5 kg'), { amount: 500, unit: 'g' });
  const selected = bestCandidate([
    { id: 'written-in-grams', relevance: 80, packSize: '500 g', price: '2,49 €' },
    { id: 'written-in-kilograms', relevance: 80, packSize: '0,5 kg', price: '1,99 €' },
  ]);

  assert.equal(selected.id, 'written-in-kilograms');
});

test('ungleiche oder fehlende Packungsgrößen lösen keinen Preisvergleich aus', () => {
  const expensive = { id: 'first', relevance: 80, packSize: '500 g', price: '4,99 €' };
  const differentSize = { id: 'different-size', relevance: 80, packSize: '1 kg', price: '1,99 €' };
  const missingSize = { id: 'missing-size', relevance: 80, packSize: '1 Packung', price: '1,49 €' };

  assert.equal(compareOfferCandidates(expensive, differentSize), 0);
  assert.equal(compareOfferCandidates(expensive, missingSize), 0);
  assert.equal(bestCandidate([expensive, differentSize]).id, 'first');
  assert.equal(bestCandidate([expensive, missingSize]).id, 'first');
});

test('unbekannte Grundpreise werden nicht als Nullpreise bevorzugt', () => {
  const unitPrice = { id: 'unit-price', relevance: 80, packSize: '500 g', price: '1,99 €/kg' };
  const packagePrice = { id: 'package-price', relevance: 80, packSize: '500 g', price: '2,49 €' };

  assert.equal(parseKnownMoney(unitPrice.price), null);
  assert.equal(compareOfferCandidates(unitPrice, packagePrice), 0);
  assert.equal(bestCandidate([unitPrice, packagePrice]).id, 'unit-price');
});
