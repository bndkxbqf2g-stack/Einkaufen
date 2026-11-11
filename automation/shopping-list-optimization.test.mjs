import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const files = await Promise.all(['ingredient-normalization.js', 'ingredient-quantity.js', 'shopping-list-optimization.js'].map(name => readFile(new URL(`../${name}`, import.meta.url), 'utf8')));
const scope = {};
for (const source of files) runInNewContext(source, scope);
const model = scope.AngebotskuecheShoppingListOptimizationModel;

test('removes fully stocked demand and keeps partial stock as remaining demand', () => {
  const result = model.optimizeShoppingList({
    demand: [{ name: 'Kartoffeln', amount: 1, unit: 'kg' }, { name: 'Milch', amount: 500, unit: 'ml' }],
    pantry: [{ name: 'Kartoffel', amount: 500, unit: 'g' }, { name: 'Milch', amount: 500, unit: 'ml' }],
  }, scope);
  assert.equal(result.items.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(result.items[0])), { name: 'Kartoffeln', identity: 'kartoffel', family: 'mass', unit: 'g', amount: 500, status: 'partially-covered' });
});

test('does not cross-match identities or incompatible unit families', () => {
  const result = model.optimizeShoppingList({
    demand: [{ name: 'Öl', amount: 1, unit: 'l' }, { name: 'Mehl', amount: 500, unit: 'g' }],
    pantry: [{ name: 'Olivenöl', amount: 1, unit: 'l' }, { name: 'Mehl', amount: 500, unit: 'ml' }],
  }, scope);
  assert.equal(result.items.length, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(result.items.map(item => item.amount))), [1000, 500]);
});

test('counts invalid demand and pantry entries without inventing quantities', () => {
  const result = model.optimizeShoppingList({ demand: [{ name: 'Salz', amount: 0, unit: 'g' }, { name: 'Mehl', amount: 100, unit: 'g' }], pantry: [{ name: 'Mehl', amount: 'x', unit: 'g' }] }, scope);
  assert.equal(result.invalidDemandCount, 1);
  assert.equal(result.invalidPantryCount, 1);
  assert.equal(result.items[0].amount, 100);
});
