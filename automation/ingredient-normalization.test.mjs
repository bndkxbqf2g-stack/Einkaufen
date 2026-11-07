import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [source, distSource, html, distHtml] = await Promise.all([
  readFile(new URL('../ingredient-normalization.js', import.meta.url), 'utf8'),
  readFile(new URL('../dist/ingredient-normalization.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
]);

const browserGlobal = {};
runInNewContext(source, browserGlobal);
const model = browserGlobal.AngebotskuecheIngredientModel;

test('keeps the shared ingredient normalization module synchronized', () => {
  assert.equal(source, distSource);
  assert.equal(html, distHtml);
  assert.match(html, /<script src="\.\/ingredient-normalization\.js"><\/script>\s*<script src="\.\/shopping-costs\.js"><\/script>/);
});

test('normalizes stable ingredient identities for app and pantry coverage', () => {
  assert.equal(model.normalizeIngredient('Rote Zwiebeln!'), 'rote zwiebeln ');
  assert.equal(model.shoppingIngredientKey('Rote Zwiebeln'), 'zwiebeln');
  assert.equal(model.shoppingIngredientIdentity('Rote Zwiebeln'), 'zwiebel');
  assert.equal(model.shoppingIngredientIdentity('Zwiebel'), 'zwiebel');
});

console.log('Ingredient normalization checks passed');
