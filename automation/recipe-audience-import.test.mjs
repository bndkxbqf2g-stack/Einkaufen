import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const dist = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

const parserMatch = source.match(/function parseRecipeJsonLd\(html\) \{[\s\S]*?\r?\n    \}/);
const favoriteNormalizationMatch = source.match(/favorites = favorites\.map\(item => \{[\s\S]*?\r?\n    \}\);/);

assert.ok(parserMatch, 'parseRecipeJsonLd must be present');
assert.ok(favoriteNormalizationMatch, 'favorite normalization must be present');

test('leitet Familienstatus aus generischem Rezeptimport nicht ab', () => {
  assert.doesNotMatch(parserMatch[0], /familyFriendly\s*:\s*true/);
  assert.match(parserMatch[0], /recipeIngredient/);
});

test('überschreibt unbekannten Familienstatus bestehender Favoriten nicht mit Seed-Daten', () => {
  assert.match(favoriteNormalizationMatch[0], /typeof item\.familyFriendly === 'boolean'/);
  assert.doesNotMatch(favoriteNormalizationMatch[0], /item\.familyFriendly \?\? builtIn\.familyFriendly/);
});

test('hält den veröffentlichten Plan-Bundle synchron', () => {
  assert.equal(dist, source);
});

console.log('Recipe audience import checks passed');
