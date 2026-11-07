import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const match = html.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n    \\}`));
  assert.ok(match, `${name} muss im App-Bundle vorhanden sein`);
  return match[0];
}

const normalizeIngredient = extractFunction('normalizeIngredient');
const shoppingIngredientKey = extractFunction('shoppingIngredientKey');
const shoppingIngredientIdentity = extractFunction('shoppingIngredientIdentity');
const classifyPantryCandidates = extractFunction('classifyPantryCandidates');

const classify = new Function(
  `${normalizeIngredient}
${shoppingIngredientKey}
${shoppingIngredientIdentity}
${classifyPantryCandidates}
return classifyPantryCandidates;`,
)();

test('behandelt Singular-/Pluralvarianten beim Hinzufügen als denselben Vorrat', () => {
  const result = classify(['Tomate', 'Salz'], ['Tomaten', 'rote Zwiebeln', 'SALZ']);

  assert.deepEqual(result.added, ['rote Zwiebeln']);
  assert.deepEqual(result.duplicates, ['Tomaten', 'SALZ']);
});

test('bewahrt den zuerst gespeicherten Vorratsnamen und ignoriert leere Identitäten', () => {
  const result = classify(['Öl'], ['!!!', 'Olivenöl']);

  assert.deepEqual(result.added, ['Olivenöl']);
  assert.deepEqual(result.duplicates, []);
});

console.log('Pantry input checks passed');
