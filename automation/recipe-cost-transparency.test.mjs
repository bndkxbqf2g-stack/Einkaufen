import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const suggestionStart = source.indexOf('function renderSuggestions');
const detailStart = source.indexOf('function openRecipeDetail');
const scoringStart = source.indexOf('function estimateMatchCost');
const suggestionRenderer = source.slice(suggestionStart, detailStart);
const detailRenderer = source.slice(detailStart, scoringStart);
const scoringRenderer = source.slice(scoringStart, source.indexOf('function recipeHasRecentOverlap', scoringStart));

test('does not use static recipe costs as offer evidence', () => {
  assert.match(scoringRenderer, /function estimateMatchCost\(matchedOffers\)/);
  assert.match(scoringRenderer, /Preis unbekannt/);
  assert.equal(source.includes('parseMoney(recipe.cost || 0)'), false);
  assert.match(suggestionRenderer, /estimatedCostLabel = match\.estimatedCost === 'Preis unbekannt'/);
  assert.match(detailRenderer, /const estimatedCostLabel = match\.estimatedCost \|\| 'Preis unbekannt'/);
});

test('keeps the published frontend synchronized with the source page', () => {
  assert.equal(published, source);
});

console.log('Recipe cost transparency checks passed');