import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [source, published] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
]);

assert.equal(published, source, 'published bundle must stay byte-identical to the source');

function extractBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, startMarker + ' must remain present');
  return source.slice(start, end);
}

const sourceUrlForDisplay = extractBetween(
  'function sourceUrlForDisplay(value) {',
  '\n\n    function validateOfferPayload',
);
const recipeSourceUrl = extractBetween(
  'function recipeSourceUrl(recipe) {',
  '\n\n    function decoratePlanSourceLinks',
);
const offerImageUrl = extractBetween(
  'function offerImageUrl(offer) {',
  '\n\n    function renderOfferVisual',
);

const favorites = [{ name: 'Lieblingsrezept', url: 'https://recipes.example/favorite' }];
const normalizeIngredient = value => String(value ?? '').trim().toLowerCase();
const model = new Function(
  'URL',
  'favorites',
  'normalizeIngredient',
  sourceUrlForDisplay + '\n' + recipeSourceUrl + '\n' + offerImageUrl +
  '\nreturn { sourceUrlForDisplay, recipeSourceUrl, offerImageUrl };',
)(URL, favorites, normalizeIngredient);

test('akzeptiert nur sichere HTTPS-Quellen ohne Zugangsdaten', () => {
  assert.equal(model.sourceUrlForDisplay('https://recipes.example/rezept'), 'https://recipes.example/rezept');
  for (const value of [
    'http://recipes.example/rezept',
    'javascript:alert(1)',
    'data:text/html,<svg>',
    'https://user:pass@recipes.example/rezept',
    'not-a-url',
  ]) {
    assert.equal(model.sourceUrlForDisplay(value), '', value);
  }
});

test('begrenzt Rezeptquellen auf sichere HTTPS-URLs und behält den Favoriten-Fallback', () => {
  assert.equal(model.recipeSourceUrl({ title: 'Neues Rezept', url: 'https://recipes.example/neu' }), 'https://recipes.example/neu');
  assert.equal(model.recipeSourceUrl({ title: 'Neues Rezept', url: 'javascript:alert(1)' }), '');
  assert.equal(model.recipeSourceUrl({ title: 'Lieblingsrezept' }), 'https://recipes.example/favorite');
  assert.equal(model.recipeSourceUrl({ title: 'Lieblingsrezept', url: 'http://recipes.example/alt' }), '');
});

test('verwendet für Angebotsbilder ebenfalls nur sichere HTTPS-URLs', () => {
  assert.equal(model.offerImageUrl({ imageUrl: 'https://images.example/offer.png' }), 'https://images.example/offer.png');
  assert.equal(model.offerImageUrl({ imageUrl: 'http://images.example/offer.png' }), '');
  assert.equal(model.offerImageUrl({ imageUrl: 'data:image/svg+xml,<svg>' }), '');
});

console.log('Source URL safety checks passed');

test('verwendet im Favoritenpfad dieselbe sichere Rezeptquelle', () => {
  assert.match(source, /const sourceUrl = recipeSourceUrl\(\{ title: item\.name, url: item\.url \}\);/);
  assert.match(source, /\$\{sourceUrl \? `<a class="source-note"/);
  assert.doesNotMatch(source, /\$\{item\.url \? `<a class="source-note" href="\$\{escapeHtml\(item\.url\)/);
});
