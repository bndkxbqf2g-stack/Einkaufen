import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [html, normalizationSource, modelSource] = await Promise.all([
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../ingredient-normalization.js', import.meta.url), 'utf8'),
  readFile(new URL('../shopping-costs.js', import.meta.url), 'utf8'),
]);
const browserGlobal = {};
runInNewContext(`${normalizationSource}\n${modelSource}`, browserGlobal);
const model = browserGlobal.AngebotskuecheCostModel;

test('summarizes pantry coverage without inventing quantities', () => {
  const result = model.summarizePantryCoverage(
    ['Salz', '  Zwiebel ', '', null, 'Öl'],
    ingredient => ['salz', 'öl'].includes(String(ingredient).toLowerCase()),
  );

  assert.equal(result.coveredCount, 2);
  assert.equal(result.uncoveredCount, 1);
  assert.deepEqual(Array.from(result.coveredItems), ['Salz', 'Öl']);
  assert.deepEqual(Array.from(result.uncoveredItems), ['Zwiebel']);
});

test('deduplicates shared pantry ingredients by stable identity', () => {
  const result = model.summarizePantryCoverage(
    ['Tomaten', 'Tomate', '  rote Zwiebeln ', 'Zwiebel'],
    ingredient => ['tomate', 'rote zwiebeln'].includes(String(ingredient).toLowerCase()),
  );

  assert.equal(result.coveredCount, 2);
  assert.equal(result.uncoveredCount, 0);
  assert.deepEqual(Array.from(result.coveredItems), ['Tomaten', 'rote Zwiebeln']);
  assert.deepEqual(Array.from(result.uncoveredItems), []);
});

test('keeps all ingredients uncovered when no pantry predicate is supplied', () => {
  const result = model.summarizePantryCoverage(['Reis', 'Tomaten']);

  assert.equal(result.coveredCount, 0);
  assert.equal(result.uncoveredCount, 2);
});

test('renders pantry coverage as a separate shopping-list status', () => {
  assert.match(html, /summarizePantryCoverage/);
  assert.match(html, /Vorratszutat/);
  assert.match(html, /id="shoppingPantryDetail"/);
  assert.match(html, /id="shoppingPantryDetail" role="status" aria-live="polite"/);
  assert.match(html, /Vorratsabgleich: \$\{pantryPreview\.join/);
  assert.match(html, /fehlende Artikel und Vorräte sind im Angebotswert nicht enthalten/);
});

console.log('Pantry coverage checks passed');
