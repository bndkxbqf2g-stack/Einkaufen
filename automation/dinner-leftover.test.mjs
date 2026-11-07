import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const dist = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
assert.equal(dist, source, 'published bundle must stay byte-identical to the source');

function extractFunction(name) {
  const match = source.match(new RegExp('function ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\r?\\n    \\}'));
  assert.ok(match, name + ' muss im App-Bundle vorhanden sein');
  return match[0];
}

const normalizationStart = source.indexOf('    function normalizeIngredient(');
const normalizationEnd = source.indexOf('    function offerEndDate(', normalizationStart);
assert.ok(normalizationStart >= 0 && normalizationEnd > normalizationStart, 'ingredient normalization must be available');
const normalization = source.slice(normalizationStart, normalizationEnd);
const overlap = extractFunction('ingredientsOverlap');
const leftover = extractFunction('applyLeftoverPlan');
const sections = extractFunction('getCurrentPlanSections');

const context = {
  window: {},
  $: () => ({ checked: true }),
  buildCurrentPlanLunches: () => [
    { title: 'Mittag 1', ingredients: ['Brot'], tags: [], note: 'Mittag 1' },
    { title: 'Mittag 2', ingredients: ['Tomate'], tags: [], note: 'Mittag 2' },
  ],
  buildCurrentPlanDinners: () => [
    { title: 'Abend 1', ingredients: ['Tomaten'], tags: ['Abendessen'], note: 'Abend 1' },
    null,
  ],
  getMealIngredients: meal => Array.isArray(meal?.ingredients) ? meal.ingredients : [],
  isPantryIngredient: () => false,
};

runInNewContext(
  normalization + '\n' + overlap + '\n' + leftover + '\n' + sections + '\n'
    + 'globalThis.getCurrentPlanSections = getCurrentPlanSections;',
  context,
);

test('wertet optionale Abendessen in Tagesreihenfolge für Reste aus', () => {
  const result = context.getCurrentPlanSections();
  assert.equal(result.dinners.length, 2);
  assert.ok(result.dinners[0].plannedLeftovers.includes('Tomaten'), 'Abendessen muss Zutaten für den Folgetag markieren');
  assert.ok(result.lunches[1].reusedIngredients.includes('Tomate'), 'Folgetag muss die Zutat aus dem Abendessen als Rest erkennen');
  assert.ok(result.dinners[0].tags.includes('Abendessen'));
});

test('berücksichtigt die bestehende Singular-/Plural-Normalisierung', () => {
  const result = context.getCurrentPlanSections();
  assert.deepEqual(Array.from(result.dinners[0].plannedLeftovers), ['Tomaten']);
  assert.deepEqual(Array.from(result.lunches[1].reusedIngredients), ['Tomate']);
});

console.log('Dinner leftover integration checks passed');
