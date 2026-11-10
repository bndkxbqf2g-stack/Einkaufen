import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const files = [
  'ingredient-normalization.js',
  'ingredient-quantity.js',
  'pantry-quantity.js',
  'pantry-shopping-coverage.js',
  'shopping-costs.js',
];
const context = {};
for (const file of files) {
  runInNewContext(await readFile(new URL(`../${file}`, import.meta.url), 'utf8'), context);
}

const quantity = context.AngebotskuecheIngredientQuantityModel;
const coverage = context.AngebotskuechePantryShoppingCoverageModel;
const costs = context.AngebotskuecheCostModel;
const parseEuro = value => {
  const match = String(value || '').match(/^(\d+),(\d{2}) €$/);
  return match ? Number(match[1]) + Number(match[2]) / 100 : null;
};

function quantityBasis(raw) {
  const parsed = quantity.parseRecipeIngredient(raw);
  return quantity.addRecipeQuantity(quantity.createQuantityBasis(), parsed, 1);
}

test('verbindet synthetischen Plan, Teilvorrat, Packungsbedarf und Vergleichskosten', () => {
  const offer = {
    price: '2,00 €',
    regularPrice: '2,49 €',
    packSize: '500 g',
    validUntil: '12.11.2026',
  };
  const items = [
    { name: 'Hackfleisch', count: 1, meals: ['Mittagessen'], quantityBasis: quantityBasis('500 g Hackfleisch'), offer },
    { name: 'Hackfleisch', count: 1, meals: ['Abendessen'], quantityBasis: quantityBasis('500 g Hackfleisch'), offer },
  ];
  const pantry = { hackfleisch: { name: 'Hackfleisch', amount: 250, unit: 'g' } };

  const result = coverage.applyPantryCoverageToShoppingItems(items, pantry);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].pantryCoverage, 'partially-covered');
  assert.equal(result.items[0].quantityBasis.amount, 750);
  assert.equal(result.items[0].pantryCoveredAmount, 250);
  assert.equal(result.items[0].pantryRemainingDemand, 750);
  assert.deepEqual(Array.from(result.items[0].meals), ['Mittagessen', 'Abendessen']);
  assert.equal(quantity.calculateExactPackCount(result.items[0]), 2);
  assert.deepEqual(pantry, { hackfleisch: { name: 'Hackfleisch', amount: 250, unit: 'g' } });

  const shoppingItem = {
    ...result.items[0],
    packCount: quantity.calculateExactPackCount(result.items[0]),
  };
  const summary = costs.summarizeShoppingCosts([shoppingItem], parseEuro, () => true);
  assert.equal(summary.knownOfferTotalCents, 400);
  assert.equal(summary.knownRegularTotalCents, 498);
  assert.equal(summary.knownSavingsCents, 98);
  assert.equal(summary.knownOfferCount, 1);
  assert.equal(summary.knownComparisonCount, 1);
  assert.equal(summary.missingCount, 0);
});

console.log('Synthetic local shopping flow checks passed');
