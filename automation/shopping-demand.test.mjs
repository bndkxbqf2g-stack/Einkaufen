import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const files = await Promise.all(['ingredient-normalization.js', 'ingredient-quantity.js', 'pantry-quantity.js', 'pantry-shopping-coverage.js', 'shopping-demand.js'].map(name => readFile(new URL(`../${name}`, import.meta.url), 'utf8')));
const scope = {};
for (const source of files) runInNewContext(source, scope);
const model = scope.AngebotskuecheShoppingDemandModel;

test('aggregates mixed meal quantities by ingredient identity and people', () => {
  const items = model.buildShoppingDemand([
    { title: 'Mittag', people: 2, ingredients: ['500 g Hackfleisch'] },
    { title: 'Abend', people: 4, ingredients: ['500 g Hackfleisch', '2 Stück Zwiebeln'] },
  ], scope);
  assert.equal(items.length, 2);
  const meat = items.find(item => item.name === 'Hackfleisch');
  assert.equal(meat.quantityBasis.amount, 1500);
  assert.equal(meat.count, 2);
  assert.deepEqual(meat.meals, ['Mittag', 'Abend']);
  const onions = items.find(item => item.name === 'Zwiebeln');
  assert.equal(onions.quantityBasis.amount, 4);
});

test('delegates pantry reconciliation without changing demand semantics', () => {
  const items = model.buildShoppingDemand([{ title: 'Suppe', people: 2, ingredients: ['500 g Kartoffeln'] }], scope);
  const result = model.applyPantryCoverage(items, { Kartoffeln: { amount: 250, unit: 'g', family: 'mass' } }, scope);
  assert.ok(result && Array.isArray(result.items));
  assert.equal(result.coverage.positions[0].remainingDemand, 250);
});
