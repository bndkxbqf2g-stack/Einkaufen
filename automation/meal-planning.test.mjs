import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { test } from 'node:test';

const source = await readFile(new URL('../meal-planning.js', import.meta.url), 'utf8');
const window = {};
vm.runInNewContext(source, { window });
const model = window.AngebotskuecheMealModel;

test('normalisiert unbekannte Mahlzeitenzwecke rückwärtskompatibel zu Flexibel', () => {
  assert.equal(model.normalizeRecipeMealPurpose('unbekannt'), 'Flexibel');
  assert.equal(model.normalizeRecipeMealPurpose('Frühstück'), 'Frühstück');
});

test('lässt im Wochenplan nur Mittagessen und optionales Abendessen zu', () => {
  assert.equal(model.mealPurposeAllowsSlot({ mealPurpose: 'Hauptgericht' }, 'lunch'), true);
  assert.equal(model.mealPurposeAllowsSlot({ mealPurpose: 'Flexibel' }, 'lunch'), true);
  assert.equal(model.mealPurposeAllowsSlot({ mealPurpose: 'Frühstück' }, 'lunch'), false);
  assert.equal(model.mealPurposeAllowsSlot({ mealPurpose: 'Snack' }, 'lunch'), false);
  assert.equal(model.mealPurposeAllowsSlot({ mealPurpose: 'Getränk' }, 'lunch'), false);
  assert.equal(model.mealPurposeAllowsSlot({ mealPurpose: 'Brotzeit' }, 'dinner'), true);
  assert.equal(model.mealPurposeAllowsSlot({ mealPurpose: 'Flexibel' }, 'dinner'), true);
  assert.equal(model.mealPurposeAllowsSlot({ mealPurpose: 'Hauptgericht' }, 'dinner'), false);
  assert.equal(model.mealPurposeAllowsSlot({ mealPurpose: 'Frühstück' }, 'dinner'), false);
  assert.equal(model.mealPurposeAllowsSlot({ mealPurpose: 'Snack' }, 'dinner'), false);
  assert.equal(model.mealPurposeAllowsSlot({ mealPurpose: 'Getränk' }, 'dinner'), false);
});

console.log('Meal slot policy checks passed');
