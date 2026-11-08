import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [normalization, quantitySource, pantrySource, rootSource, distSource] = await Promise.all([
  readFile(new URL('../ingredient-normalization.js', import.meta.url), 'utf8'),
  readFile(new URL('../ingredient-quantity.js', import.meta.url), 'utf8'),
  readFile(new URL('../pantry-quantity.js', import.meta.url), 'utf8'),
  readFile(new URL('../pantry-shopping-coverage.js', import.meta.url), 'utf8'),
  readFile(new URL('../dist/pantry-shopping-coverage.js', import.meta.url), 'utf8'),
]);

function loadModel(source = rootSource) {
  const context = {};
  runInNewContext(normalization, context);
  runInNewContext(quantitySource, context);
  runInNewContext(pantrySource, context);
  runInNewContext(source, context);
  return context.AngebotskuechePantryShoppingCoverageModel;
}

const model = loadModel();
const plain = value => JSON.parse(JSON.stringify(value));
const basis = (amount, unit, family = unit === 'g' || unit === 'kg' ? 'mass' : unit === 'ml' || unit === 'l' ? 'volume' : 'count') => ({ valid: true, amount, unit, family });

test('meldet vollständige und teilweise Vorratsdeckung ohne Vorratsmutation', () => {
  const pantry = { milch: { name: 'Milch', amount: 1, unit: 'l' } };
  const items = [{ name: 'Milch', quantityBasis: basis(500, 'ml') }, { name: 'Brot', quantityBasis: basis(2, 'piece') }];
  const result = model.summarizeShoppingPantryCoverage(items, pantry);
  assert.equal(result.groups[0].status, 'covered');
  assert.equal(result.groups[0].coveredAmount, 500);
  assert.equal(result.groups[0].remainingDemand, 0);
  assert.equal(result.groups[1].status, 'unknown');
  assert.deepEqual(pantry, { milch: { name: 'Milch', amount: 1, unit: 'l' } });
});

test('aggregiert mehrere Bedarfseinträge derselben Identität vor der Abdeckung', () => {
  const result = model.summarizeShoppingPantryCoverage([
    { name: 'Milch', quantityBasis: basis(500, 'ml') },
    { name: 'Milch', quantityBasis: basis(1, 'l') },
  ], { milch: { name: 'Milch', amount: 1, unit: 'l' } });
  assert.equal(result.groups.length, 1);
  assert.equal(result.groups[0].demand, 1500);
  assert.equal(result.groups[0].coveredAmount, 1000);
  assert.equal(result.groups[0].remainingDemand, 500);
  assert.equal(result.groups[0].status, 'partially-covered');
  assert.deepEqual(plain(result.positions.map(position => position.status)), ['partially-covered', 'partially-covered']);
});

test('lässt inkompatible oder unbekannte Mengen ohne stille Reduktion', () => {
  const result = model.summarizeShoppingPantryCoverage([
    { name: 'Öl', quantityBasis: basis(500, 'g') },
    { name: 'Salz', quantityBasis: { valid: false } },
  ], { ol: { name: 'Öl', amount: 1, unit: 'l' } });
  assert.equal(result.groups[0].status, 'incompatible');
  assert.equal(result.groups[0].coveredAmount, null);
  assert.equal(result.groups[0].remainingDemand, null);
  assert.equal(result.positions[1].status, 'legacy');
});

test('manuelle und mengenlose Legacy-Positionen bleiben unverändert klassifiziert', () => {
  const items = [
    { name: 'Küchenrolle', manual: true, manualQuantity: 2 },
    { name: 'Gewürze', count: 1 },
  ];
  const result = model.summarizeShoppingPantryCoverage(items, {});
  assert.deepEqual(plain(result.legacyPositions), [
    { index: 0, name: 'Küchenrolle', status: 'legacy' },
    { index: 1, name: 'Gewürze', status: 'legacy' },
  ]);
  assert.deepEqual(plain(result.positions), plain(result.legacyPositions));
});

test('Root- und dist-Adapter bleiben synchron', () => {
  assert.equal(distSource, rootSource);
  assert.ok(loadModel(distSource));
});

console.log('Pantry shopping coverage adapter checks passed');

