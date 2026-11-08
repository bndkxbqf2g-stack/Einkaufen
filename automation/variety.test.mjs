import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [normalizationSource, rootSource, publishedSource, appSource, publishedAppSource] = await Promise.all([
  readFile(new URL('../ingredient-normalization.js', import.meta.url), 'utf8'),
  readFile(new URL('../variety.js', import.meta.url), 'utf8'),
  readFile(new URL('../dist/variety.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
]);

function loadModel(source) {
  const context = {};
  runInNewContext(normalizationSource, context);
  runInNewContext(source, context);
  return context.AngebotskuecheVarietyModel;
}

const model = loadModel(rootSource);
const plain = value => JSON.parse(JSON.stringify(value));

function meal(title, main, preparationMethod, extra = {}) {
  return { title, main, preparationMethod, ...extra };
}

test('normalisiert identische Gerichte mit Namensvarianten und zählt sie nicht doppelt', () => {
  const summary = model.summarizePlanVariety({
    lunches: [meal('Kartoffel-Gratin', 'Kartoffeln', 'Ofen'), meal('Kartoffel Gratin', 'Kartoffeln', 'Ofen')],
    dinners: [null, meal('Kartoffel Gratin', 'Kartoffeln', 'Ofen', { tags: ['Restetag'] })],
  });
  assert.equal(summary.entryCount, 3);
  assert.equal(summary.dishes.uniqueCount, 1);
  assert.equal(summary.status, 'repeated');
  assert.deepEqual(plain(summary.repeatedDishes), [{
    dish: 'Kartoffel-Gratin',
    entryIndexes: [0, 1, 2],
    restEntryIndexes: [2],
    repeatedAsLeftover: true,
  }]);
});

test('berücksichtigt Mittagessen und optionales Abendessen chronologisch', () => {
  const summary = model.summarizePlanVariety({
    lunches: [meal('Linsencurry', 'Linsen', 'Topf'), meal('Frittata', 'Eier', 'Pfanne')],
    dinners: [meal('Brotzeit', 'Brot', 'Kalt'), null],
  });
  assert.deepEqual(plain(summary.entries.map(entry => [entry.dayIndex, entry.slot])), [[0, 'lunch'], [0, 'dinner'], [1, 'lunch']]);
  assert.equal(summary.dishes.uniqueCount, 3);
  assert.equal(summary.mainIngredients.uniqueCount, 3);
  assert.equal(summary.preparationMethods.uniqueCount, 3);
  assert.equal(summary.status, 'varied');
});

test('trennt Gerichte, Hauptzutaten und Zubereitungsarten sowie fehlende Merkmale', () => {
  const summary = model.summarizePlanVariety({
    lunches: [meal('Curry', 'Linsen', 'Topf'), { title: 'Salat' }],
    dinners: [],
  });
  assert.equal(summary.dishes.uniqueCount, 2);
  assert.equal(summary.mainIngredients.status, 'partial');
  assert.equal(summary.mainIngredients.knownCount, 1);
  assert.equal(summary.mainIngredients.missingCount, 1);
  assert.equal(summary.preparationMethods.status, 'partial');
  assert.equal(summary.status, 'varied-by-dish');
  assert.equal(model.summarizePlanVariety({ lunches: [{ tags: ['Restetag'] }], dinners: [] }).status, 'unknown');
});

test('markiert bewusste Restewiederholung ohne sie als neue Abwechslung zu zählen', () => {
  const summary = model.summarizePlanVariety({
    lunches: [meal('Eintopf', 'Kartoffeln', 'Topf'), meal('Eintopf', 'Kartoffeln', 'Topf', { leftover: true })],
    dinners: [],
  });
  assert.equal(summary.dishes.uniqueCount, 1);
  assert.equal(summary.leftoverEntryCount, 1);
  assert.equal(summary.repeatedDishes[0].repeatedAsLeftover, true);
  assert.equal(summary.status, 'repeated');
});

test('bleibt bei Frühstücks-/Snack-/Getränkeabschnitten und fehlendem Plan leer', () => {
  assert.equal(model.summarizePlanVariety({ breakfasts: [meal('Frühstück', 'Brot', 'Kalt')], snacks: [meal('Snack', 'Obst', 'Kalt')] }).status, 'empty');
  assert.equal(model.summarizePlanVariety({}).entryCount, 0);
  assert.equal(appSource.includes('variety.js'), false);
  assert.equal(publishedAppSource, appSource);
});

test('Root- und dist-Rechenkern bleiben bytegleich', () => {
  assert.equal(publishedSource, rootSource);
});

console.log('Variety model checks passed');

