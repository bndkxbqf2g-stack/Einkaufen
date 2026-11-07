import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const normalizeMatch = html.match(/function normalizeIngredient\(value\) \{[\s\S]*?\n    \}/);
const variantsMatch = html.match(/function ingredientWordVariants\(word\) \{[\s\S]*?\n    \}/);
const compoundPatternsMatch = html.match(/const safeCompoundIngredientPatterns = \{[\s\S]*?\n    \};/);
const compoundExclusionsMatch = html.match(/const unsafeCompoundOfferContexts = \{[\s\S]*?\n    \};/);
const textMatch = html.match(/function ingredientTextMatches\(needle, haystack\) \{[\s\S]*?\n    \}/);
const matcherMatch = html.match(/function offerMatchesIngredient\(ingredient, offer\) \{[\s\S]*?\n    \}/);

assert.ok(normalizeMatch, 'normalizeIngredient muss im App-Bundle vorhanden sein');
assert.ok(variantsMatch, 'ingredientWordVariants muss im App-Bundle vorhanden sein');
assert.ok(compoundPatternsMatch, 'safeCompoundIngredientPatterns muss im App-Bundle vorhanden sein');
assert.ok(compoundExclusionsMatch, 'unsafeCompoundOfferContexts muss im App-Bundle vorhanden sein');
assert.ok(textMatch, 'ingredientTextMatches muss im App-Bundle vorhanden sein');
assert.ok(matcherMatch, 'offerMatchesIngredient muss im App-Bundle vorhanden sein');

const offerMatchesIngredient = new Function(
  `${normalizeMatch[0]}\n${variantsMatch[0]}\n${compoundPatternsMatch[0]}\n${compoundExclusionsMatch[0]}\n${textMatch[0]}\n${matcherMatch[0]}; return offerMatchesIngredient;`,
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
  assert.equal(matches('Tomaten', 'Honigtomaten'), true);
  assert.equal(matches('Tomaten', 'Minipflaumentomaten'), true);
});

test('behält belegte Angebotsformen aus den vorhandenen Marktsnapshots', () => {
  assert.equal(matches('Paprika', 'Spitzpaprika rot'), true);
  assert.equal(matches('Kartoffeln', 'Speisekartoffeln festkochend'), true);
  assert.equal(matches('Sahne', 'Bio Schlagsahne'), true);
  assert.equal(matches('Hähnchen', 'Frische Maishähnchenschenkel'), true);
  assert.equal(matches('Hähnchen', 'Hähnchenbrustfilet'), true);
  assert.equal(matches('Joghurt', 'Bio Fruchtjoghurt pur'), true);
  assert.equal(matches('Hackfleisch', 'Rinderhackfleisch'), true);
  assert.equal(matches('Brot', 'Roggenbrötchen'), true);
  assert.equal(matches('Brot', 'Bauernbrot'), true);
  assert.equal(matches('Schinken', 'Delikatess Schinkenwürfel'), true);
  assert.equal(matches('Schnitzel', 'Hähnchenschnitzel XXL'), true);
  assert.equal(matches('Möhren', 'Snackmöhren'), true);
  assert.equal(matches('Nudeln', 'Eiernudeln'), true);
  assert.equal(matches('Frischkäse', 'Frischkäsezubereitung'), true);
  assert.equal(matches('Salat', 'Bio Feldsalat'), true);
  assert.equal(matches('Salami', 'Delikatess Edelsalami'), true);
  assert.equal(matches('Hokkaido-Kürbis', 'Deutscher Speisekürbis Butternut'), true);
});

test('vermeidet zusammengesetzte Produktnamen als ungesicherten Treffer', () => {
  assert.equal(matches('Butter', 'Butterkekse'), false);
  assert.equal(matches('Butter', 'Buttermilch'), false);
  assert.equal(matches('Milch', 'Buttermilch'), false);
  assert.equal(matches('Milch', 'Hafermilch'), false);
  assert.equal(matches('Milch', 'Kokosmilch'), false);
  assert.equal(matches('Tomate', 'Tomatensauce'), false);
  assert.equal(matches('Kartoffeln', 'Süßkartoffeln'), false);
  assert.equal(matches('Kartoffeln', 'Marzipankartoffeln'), false);
  assert.equal(matches('Reis', 'Milchreis'), false);
  assert.equal(matches('Eier', 'Eiernudeln'), false);
  assert.equal(matches('Brot', 'Brotaufstrich'), false);
  assert.equal(matches('Brot', 'Mini-Marzipanbrote'), false);
  assert.equal(matches('Brot', 'Schoko Brötchen'), false);
  assert.equal(matches('Sahne', 'Sahnejoghurt'), false);
  assert.equal(matches('Salat', 'Kartoffelsalat'), false);
  assert.equal(matches('Salat', 'Salatgurke'), false);
  assert.equal(matches('Salami', 'Steinofenpizza Edelsalami XXL'), false);
});
