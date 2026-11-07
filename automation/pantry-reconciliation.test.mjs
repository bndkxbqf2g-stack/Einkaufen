import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const normalizeMatch = html.match(/function normalizeIngredient\(value\) \{[\s\S]*?\n    \}/);
const variantsMatch = html.match(/function ingredientWordVariants\(word\) \{[\s\S]*?\n    \}/);
const compoundPatternsMatch = html.match(/const safeCompoundIngredientPatterns = \{[\s\S]*?\n    \};/);
const compoundExclusionsMatch = html.match(/const unsafeCompoundOfferContexts = \{[\s\S]*?\n    \};/);
const textMatch = html.match(/function ingredientTextMatches\(needle, haystack\) \{[\s\S]*?\n    \}/);
const overlapMatch = html.match(/function ingredientsOverlap\(first, second\) \{[\s\S]*?\n    \}/);
const pantryMatch = html.match(/function isPantryIngredient\(ingredient\) \{[\s\S]*?\n    \}/);

assert.ok(normalizeMatch, 'normalizeIngredient muss im App-Bundle vorhanden sein');
assert.ok(variantsMatch, 'ingredientWordVariants muss im App-Bundle vorhanden sein');
assert.ok(compoundPatternsMatch, 'safeCompoundIngredientPatterns muss im App-Bundle vorhanden sein');
assert.ok(compoundExclusionsMatch, 'unsafeCompoundOfferContexts muss im App-Bundle vorhanden sein');
assert.ok(textMatch, 'ingredientTextMatches muss im App-Bundle vorhanden sein');
assert.ok(overlapMatch, 'ingredientsOverlap muss im App-Bundle vorhanden sein');
assert.ok(pantryMatch, 'isPantryIngredient muss im App-Bundle vorhanden sein');

function createHarness(pantryItems) {
  return new Function(
    `const pantry = ${JSON.stringify(pantryItems)};\n`
      + `${normalizeMatch[0]}\n${variantsMatch[0]}\n${compoundPatternsMatch[0]}\n`
      + `${compoundExclusionsMatch[0]}\n${textMatch[0]}\n${overlapMatch[0]}\n${pantryMatch[0]};\n`
      + 'return { isPantryIngredient, ingredientsOverlap };',
  )();
}

function pantryHas(pantryItems, ingredient) {
  return createHarness(pantryItems).isPantryIngredient(ingredient);
}

test('trennt Milch sicher von Buttermilch und Pflanzenmilch', () => {
  assert.equal(pantryHas(['Milch'], 'Milch'), true);
  assert.equal(pantryHas(['Milch'], 'Buttermilch'), false);
  assert.equal(pantryHas(['Milch'], 'Hafermilch'), false);
  assert.equal(pantryHas(['Milch'], 'Kokosmilch'), false);
});

test('erhält belegte Vorrats-Komposita und Flexionen', () => {
  assert.equal(pantryHas(['Butter'], 'Süßrahmbutter'), true);
  assert.equal(pantryHas(['Mehl'], 'Weizenmehl'), true);
  assert.equal(pantryHas(['Tomate'], 'Tomaten'), true);
  assert.equal(pantryHas(['Öl'], 'Olivenöl'), true);
});

test('verhindert falsche Resteverwendung bei unterschiedlichen Milcharten', () => {
  const { ingredientsOverlap } = createHarness([]);

  assert.equal(ingredientsOverlap('Milch', 'Buttermilch'), false);
  assert.equal(ingredientsOverlap('Milch', 'Hafermilch'), false);
  assert.equal(ingredientsOverlap('Tomate', 'Tomaten'), true);
  assert.equal(ingredientsOverlap('Mehl', 'Weizenmehl'), true);
});
