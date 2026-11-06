import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const normalizeMatch = html.match(/function normalizeIngredient\(value\) \{[\s\S]*?\n    \}/);
const variantsMatch = html.match(/function ingredientWordVariants\(word\) \{[\s\S]*?\n    \}/);
const compoundStemsMatch = html.match(/const safeCompoundIngredientStems = new Set\(\[[\s\S]*?\]\);/);
const matcherMatch = html.match(/function offerMatchesIngredient\(ingredient, offer\) \{[\s\S]*?\n    \}/);

assert.ok(normalizeMatch, 'normalizeIngredient muss im App-Bundle vorhanden sein');
assert.ok(variantsMatch, 'ingredientWordVariants muss im App-Bundle vorhanden sein');
assert.ok(compoundStemsMatch, 'safeCompoundIngredientStems muss im App-Bundle vorhanden sein');
assert.ok(matcherMatch, 'offerMatchesIngredient muss im App-Bundle vorhanden sein');

const offerMatchesIngredient = new Function(
  `${normalizeMatch[0]}\n${variantsMatch[0]}\n${compoundStemsMatch[0]}\n${matcherMatch[0]}; return offerMatchesIngredient;`,
)();

function matches(ingredient, offerName) {
  return offerMatchesIngredient(ingredient, { name: offerName });
}

test('verwechselt Butter nicht mit Buttermilch', () => {
  assert.equal(matches('Butter', 'Reine Buttermilch'), false);
  assert.equal(matches('Butter', 'Butter'), true);
});

test('erkennt häufige Singular-Plural-Flexionen ohne Teilstring-Match', () => {
  assert.equal(matches('Tomate', 'Tomaten'), true);
  assert.equal(matches('Tomaten', 'Tomate'), true);
  assert.equal(matches('Kartoffeln', 'Kartoffel'), true);
});

test('erkennt abgesicherte Produktkomposita mit der Zutat als Endbestandteil', () => {
  assert.equal(matches('Butter', 'Süßrahmbutter'), true);
  assert.equal(matches('Mehl', 'Weizenmehl Type 405'), true);
  assert.equal(matches('Tomaten', 'Cocktail Rispentomaten'), true);
  assert.equal(matches('Tomaten', 'Pflaumentomaten'), true);
});

test('vermeidet zusammengesetzte Produktnamen als ungesicherten Treffer', () => {
  assert.equal(matches('Butter', 'Butterkekse'), false);
  assert.equal(matches('Butter', 'Buttermilch'), false);
  assert.equal(matches('Milch', 'Buttermilch'), false);
  assert.equal(matches('Milch', 'Hafermilch'), false);
  assert.equal(matches('Milch', 'Kokosmilch'), false);
  assert.equal(matches('Tomate', 'Tomatensauce'), false);
});
