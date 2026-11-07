import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const distHtml = fs.readFileSync(path.join(repoRoot, 'dist', 'index.html'), 'utf8');

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `Function ${name} must remain available`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Could not extract function ${name}`);
}

const normalizeIngredient = extractFunction(html, 'normalizeIngredient');
const shoppingIngredientKey = extractFunction(html, 'shoppingIngredientKey');
const shoppingIngredientIdentity = extractFunction(html, 'shoppingIngredientIdentity');
const { shoppingIngredientIdentity: identity } = new Function(
  normalizeIngredient,
  shoppingIngredientKey,
  shoppingIngredientIdentity,
  'return { shoppingIngredientIdentity };',
)();

test('matches plural planned ingredients with singular manual additions', () => {
  const plannedIngredient = 'Tomaten';
  const manualIngredient = 'Tomate';
  const items = new Map([[plannedIngredient, { name: plannedIngredient }]]);

  const existingKey = [...items.keys()].find(
    candidate => identity(candidate) === identity(manualIngredient),
  );

  assert.equal(identity(plannedIngredient), identity(manualIngredient));
  assert.equal(existingKey, plannedIngredient);
  assert.match(
    html,
    /const existingKey = \[\.\.\.items\.keys\(\)\]\.find\(candidate => shoppingIngredientIdentity\(candidate\) === shoppingIngredientIdentity\(ingredient\)\);/,
  );
});

test('keeps the published bundle in sync with the source page', () => {
  assert.equal(distHtml, html);
});

console.log('Shopping item deduplication checks passed');
