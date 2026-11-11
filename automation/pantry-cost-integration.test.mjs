import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [normalizationSource, quantitySource, pantrySource, coverageSource, costSource] = await Promise.all([
  readFile(new URL('../ingredient-normalization.js', import.meta.url), 'utf8'),
  readFile(new URL('../ingredient-quantity.js', import.meta.url), 'utf8'),
  readFile(new URL('../pantry-quantity.js', import.meta.url), 'utf8'),
  readFile(new URL('../pantry-shopping-coverage.js', import.meta.url), 'utf8'),
  readFile(new URL('../shopping-costs.js', import.meta.url), 'utf8'),
]);

const context = {};
runInNewContext(normalizationSource, context);
runInNewContext(quantitySource, context);
runInNewContext(pantrySource, context);
runInNewContext(coverageSource, context);
runInNewContext(costSource, context);

const quantity = context.AngebotskuecheIngredientQuantityModel;
const coverage = context.AngebotskuechePantryShoppingCoverageModel;
const costs = context.AngebotskuecheCostModel;
const basis = (amount, unit, family = unit === 'g' ? 'mass' : unit === 'ml' ? 'volume' : 'count') => ({ valid: true, amount, unit, family });
const parseEuro = value => {
  const match = String(value || '').match(/^(\d+)(?:,(\d{1,2}))? €$/);
  return match ? Number(match[1]) + Number(`0.${match[2] || '0'}`) : null;
};

test('führt Teildeckung, unbekannte und inkompatible Vorräte konservativ bis zur Packungs- und Kostenberechnung fort', () => {
  const pantry = {
    milch: { name: 'Milch', amount: 1, unit: 'l' },
    ol: { name: 'Öl', amount: 1, unit: 'l' },
  };
  const items = [
    { id: 'milch', name: 'Milch', count: 1, quantityBasis: basis(1500, 'ml'), offer: { packSize: '500 ml', price: '1,20 €' } },
    { id: 'oel', name: 'Öl', count: 1, quantityBasis: basis(500, 'g'), offer: { packSize: '500 g', price: '2,00 €' } },
    { id: 'mehl', name: 'Mehl', count: 1, quantityBasis: basis(600, 'g'), offer: { packSize: '500 g', price: '0,80 €' } },
    { id: 'salz', name: 'Salz', count: 1, quantityBasis: basis(500, 'g'), offer: { packSize: '500 g', price: 'Preis unbekannt' } },
  ];
  const result = coverage.applyPantryCoverageToShoppingItems(items, pantry);
  const byId = Object.fromEntries(result.items.map(item => [item.id, item]));

  assert.equal(result.coverage.groups.find(group => group.name === 'Milch').status, 'partially-covered');
  assert.equal(byId.milch.quantityBasis.amount, 500);
  assert.equal(byId.milch.pantryRemainingDemand, 500);
  assert.equal(result.coverage.groups.find(group => group.name === 'Öl').status, 'incompatible');
  assert.equal(byId.oel.quantityBasis.amount, 500);
  assert.equal(result.coverage.groups.find(group => group.name === 'Mehl').status, 'unknown');
  assert.equal(byId.mehl.quantityBasis.amount, 600);
  assert.equal(byId.salz.quantityBasis.amount, 500);

  const costItems = result.items.map(item => ({ ...item, packCount: quantity.calculateExactPackCount(item) }));
  const summary = costs.summarizeShoppingCosts(costItems, parseEuro);
  assert.deepEqual([...costItems.map(item => item.packCount)], [1, 1, 2, 1]);
  assert.equal(summary.knownOfferTotalCents, 480);
  assert.equal(summary.knownOfferCount, 3);
  assert.equal(summary.unknownPriceCount, 1);
  assert.equal(summary.unknownPricePackCount, 1);
  assert.deepEqual(pantry, {
    milch: { name: 'Milch', amount: 1, unit: 'l' },
    ol: { name: 'Öl', amount: 1, unit: 'l' },
  });
});

console.log('Pantry-to-cost integration checks passed');
