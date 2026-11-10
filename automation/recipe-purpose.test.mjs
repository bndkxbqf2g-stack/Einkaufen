import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const normalizeMatch = html.match(/function normalizeRecipeMealPurpose\(value\) \{[\s\S]*?\n    \}/);
const purposeMatch = html.match(/function recipeMealPurpose\(recipe\) \{[\s\S]*?\n    \}/);
const patchMatch = html.match(/function recipeMealPurposePatch\(existing, selected, changed\) \{[\s\S]*?\n    \}/);
assert.ok(normalizeMatch, 'meal-purpose normalizer muss im App-Bundle vorhanden sein');
assert.ok(purposeMatch, 'meal-purpose fallback helper muss im App-Bundle vorhanden sein');
assert.ok(patchMatch, 'meal-purpose patch helper muss im App-Bundle vorhanden sein');

const recipeMealPurpose = new Function(`${normalizeMatch[0]}\n${purposeMatch[0]}; return recipeMealPurpose;`)();
const recipeMealPurposePatch = new Function(`${normalizeMatch[0]}\n${patchMatch[0]}; return recipeMealPurposePatch;`)();

test('treats legacy and invalid recipe purposes as Flexibel', () => {
  assert.equal(recipeMealPurpose({ name: 'Altes Rezept' }), 'Flexibel');
  assert.equal(recipeMealPurpose({ name: 'Ungültig', mealPurpose: 'Dessert' }), 'Flexibel');
  assert.equal(recipeMealPurpose({ name: 'Frühstück', mealPurpose: 'Frühstück' }), 'Frühstück');
});

test('stores only explicit meal-purpose choices for legacy edits', () => {
  assert.deepEqual(recipeMealPurposePatch(null, 'Snack', false), { mealPurpose: 'Snack' });
  assert.deepEqual(recipeMealPurposePatch({ name: 'Legacy' }, 'Snack', false), {});
  assert.deepEqual(recipeMealPurposePatch({ name: 'Legacy' }, 'Snack', true), { mealPurpose: 'Snack' });
  assert.deepEqual(recipeMealPurposePatch({ mealPurpose: 'Frühstück' }, 'Flexibel', false), { mealPurpose: 'Flexibel' });
});

test('exposes the purpose selection and displays the fallback consistently', () => {
  assert.match(html, /id="recipeMealPurpose"/);
  for (const purpose of ['Hauptgericht', 'Frühstück', 'Brotzeit', 'Snack', 'Getränk', 'Flexibel']) {
    assert.match(html, new RegExp(`value="${purpose}"`));
  }
  assert.match(html, /Mahlzeitenzweck \(optional, Standard: Flexibel\)/);
  assert.match(html, /Mahlzeitenzweck: \$\{escapeHtml\(purposeLabel\)\}/);
  assert.match(html, /\$\{recipeMealPurpose\(recipe\)\} · \$\{mealDurationLabel\(recipe\)\}/);
});

console.log('Recipe purpose checks passed');
