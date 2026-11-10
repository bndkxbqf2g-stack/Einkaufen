import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [normalization, quantitySource, pantrySource, rootSource, distSource, indexSource, distIndexSource] = await Promise.all([
  readFile(new URL('../ingredient-normalization.js', import.meta.url), 'utf8'),
  readFile(new URL('../ingredient-quantity.js', import.meta.url), 'utf8'),
  readFile(new URL('../pantry-quantity.js', import.meta.url), 'utf8'),
  readFile(new URL('../pantry-shopping-coverage.js', import.meta.url), 'utf8'),
  readFile(new URL('../dist/pantry-shopping-coverage.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
]);

function loadModel(source = rootSource) {
  const context = {};
  runInNewContext(normalization, context);
  runInNewContext(quantitySource, context);
  runInNewContext(pantrySource, context);
  runInNewContext(source, context);
  return context.AngebotskuechePantryShoppingCoverageModel;
}

function loadQuantityModel() {
  const context = {};
  runInNewContext(normalization, context);
  runInNewContext(quantitySource, context);
  return context.AngebotskuecheIngredientQuantityModel;
}

const model = loadModel();
const quantityModel = loadQuantityModel();
const plain = value => JSON.parse(JSON.stringify(value));
const basis = (amount, unit, family = unit === 'g' || unit === 'kg' ? 'mass' : unit === 'ml' || unit === 'l' ? 'volume' : 'count') => ({ valid: true, amount, unit, family });

const coverageMatch = distIndexSource.match(/function combinePantryCoverage\([^)]*\) \{[\s\S]*?\n    \}/);
assert.ok(coverageMatch, 'combinePantryCoverage muss im App-Bundle vorhanden sein');
const combinePantryCoverage = new Function(`${coverageMatch[0]}; return combinePantryCoverage;`)();


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

test('zählt Legacy- und mengenfähige Vorratsdeckung je Zutat nur einmal', () => {
  const result = combinePantryCoverage(
    { coveredItems: ['Milch'] },
    { coveredItems: ['milch'], partialItems: ['Öl'] },
  );

  assert.deepEqual(result.coveredItems, ['Milch', 'Öl']);
  assert.equal(result.coveredCount, 2);
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

test('zeigt bei teilweiser Vorratsdeckung den gedeckten Anteil und den Restbedarf an', () => {
  assert.match(indexSource, /function shoppingPantryCoverageLabel\(item\)/);
  assert.match(indexSource, /Vorrat deckt \$\{covered\} · Restbedarf \$\{remaining\}/);
  assert.match(indexSource, /shoppingPantryCoverageLabel\(item\)/);
  assert.match(distIndexSource, /function shoppingPantryCoverageLabel\(item\)/);
  assert.match(distIndexSource, /shoppingPantryCoverageLabel\(item\)/);
});

test('zeigt bei explizitem Bedarf auch ohne Angebotsanker die benötigte Menge an', () => {
  assert.match(indexSource, /function shoppingQuantityLabel\(item\)/);
  assert.match(indexSource, /Bedarf \$\{label\}/);
  assert.match(indexSource, /shoppingQuantityLabel\(item\)/);
  assert.match(distIndexSource, /function shoppingQuantityLabel\(item\)/);
  assert.match(distIndexSource, /shoppingQuantityLabel\(item\)/);
});

test('bindet die mengenbasierte Coverage nur für explizite Bedarfe in beide App-Artefakte ein', () => {
  assert.equal(distIndexSource, indexSource);
  assert.match(indexSource, /pantry-shopping-coverage\.js/);
  assert.match(indexSource, /applyPantryCoverageToShoppingItems/);
  assert.match(indexSource, /isPantryIngredient\(ingredient\) && !parsedIngredient\?\.explicit/);
  assert.match(indexSource, /pantryQuantityModel\?\.getQuantity/);
});

test('wendet partielle Deckung erst nach der Bedarfssumme an und lässt Packungsrundung danach zu', () => {
  const items = [
    { name: 'Milch', count: 1, portionUnits: 1, meals: ['Mittag'], quantityBasis: basis(1000, 'g'), offer: { packSize: '500 g' } },
    { name: 'Milch', count: 1, portionUnits: 1, meals: ['Abend'], quantityBasis: basis(500, 'g'), offer: { packSize: '500 g' } },
  ];
  const result = model.applyPantryCoverageToShoppingItems(items, { milch: { name: 'Milch', amount: 500, unit: 'g' } });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].quantityBasis.amount, 1000);
  assert.equal(result.items[0].pantryCoverage, 'partially-covered');
  assert.equal(result.items[0].count, 2);
  assert.equal(quantityModel.calculateExactPackCount(result.items[0]), 2);
});

test('entfernt vollständig gedeckte Mengen, ohne Vorratsdaten zu verändern', () => {
  const pantry = { milch: { name: 'Milch', amount: 1, unit: 'l' } };
  const result = model.applyPantryCoverageToShoppingItems([
    { name: 'Milch', count: 1, quantityBasis: basis(500, 'ml') },
  ], pantry);
  assert.deepEqual(plain(result.items), []);
  assert.equal(result.coverage.coveredCount, 1);
  assert.deepEqual(pantry, { milch: { name: 'Milch', amount: 1, unit: 'l' } });
});

test('liefert bei unbekanntem, null/negativem oder inkompatiblem Vorrat den vollen Bedarf zurück', () => {
  const item = { name: 'Öl', count: 1, quantityBasis: basis(500, 'g'), offer: { packSize: '500 g' } };
  for (const pantry of [
    {},
    { ol: { name: 'Öl', amount: 0, unit: 'l' } },
    { ol: { name: 'Öl', amount: -1, unit: 'l' } },
    { ol: { name: 'Öl', amount: 1, unit: 'l' } },
  ]) {
    const result = model.applyPantryCoverageToShoppingItems([item], pantry);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].quantityBasis.amount, 500);
    assert.equal(result.items[0].pantryCoverage, result.coverage.groups[0].status);
    assert.notEqual(result.coverage.groups[0].status, 'covered');
  }
});

test('belässt manuelle und mengenlose Legacy-Positionen unverändert', () => {
  const items = [
    { name: 'Küchenrolle', manual: true, manualQuantity: 2 },
    { name: 'Gewürze', count: 1 },
  ];
  const result = model.applyPantryCoverageToShoppingItems(items, {});
  assert.deepEqual(plain(result.items), plain(items));
});

test('markiert eine übergroße aggregierte Nachfrage als unbekannt', () => {
  const result = model.summarizeShoppingPantryCoverage([
    { name: 'Mehl', quantityBasis: basis(600000000, 'g') },
    { name: 'Mehl', quantityBasis: basis(600000000, 'g') },
  ], { mehl: { name: 'Mehl', amount: 1, unit: 'kg' } });

  assert.equal(result.groups.length, 1);
  assert.equal(result.groups[0].status, 'unknown');
  assert.equal(result.groups[0].demand, null);
  assert.equal(result.groups[0].coveredAmount, null);
  assert.equal(result.groups[0].remainingDemand, null);
});

console.log('Pantry shopping coverage adapter checks passed');


