import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../dist/server/index.js';

const recipeRequest = new Request('https://example.test/api/recipe?url=https%3A%2F%2Fwww.chefkoch.de%2Frezepte%2Ftest');
const previousFetch = globalThis.fetch;

function mockRecipePage(payload) {
  globalThis.fetch = async () => new Response(`<script type="application/ld+json">${JSON.stringify(payload)}</script>`, {
    headers: { 'content-type': 'text/html' },
  });
}

test.afterEach(() => {
  globalThis.fetch = previousFetch;
});

test('skips a malformed Recipe candidate and imports a later valid candidate', async () => {
  const validRecipe = { '@type': 'Recipe', name: 'Test-Curry', recipeIngredient: ['Paprika', 'Öl'] };
  const page = `<script type="application/ld+json">${JSON.stringify({
    '@graph': [
      { '@type': 'Recipe', recipeIngredient: [{}] },
      validRecipe,
    ],
  })}</script>`;
  globalThis.fetch = async () => new Response(page, { headers: { 'content-type': 'text/html' } });

  const response = await worker.fetch(recipeRequest);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    name: 'Test-Curry',
    ingredients: ['Paprika', 'Öl'],
    instructions: '',
    vegetarian: null,
  });
});

test('parses complete source durations and leaves unknown audience metadata open', async () => {
  mockRecipePage({
    '@type': 'Recipe',
    name: 'Zeit-Curry',
    recipeIngredient: ['Paprika'],
    totalTime: 'PT1H30M',
  });

  const response = await worker.fetch(recipeRequest);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    name: 'Zeit-Curry',
    ingredients: ['Paprika'],
    instructions: '',
    time: 90,
    vegetarian: null,
  });
});

test('preserves an explicitly vegetarian keyword while leaving missing metadata unknown', async () => {
  mockRecipePage({
    '@type': 'Recipe',
    name: 'Grünes Curry',
    recipeIngredient: ['Paprika'],
    keywords: ['vegetarian'],
  });

  const response = await worker.fetch(recipeRequest);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    name: 'Grünes Curry',
    ingredients: ['Paprika'],
    instructions: '',
    vegetarian: true,
  });
});

test('rejects object-only ingredients instead of importing [object Object]', async () => {
  mockRecipePage({ '@type': 'Recipe', name: 'Ungültiges Rezept', recipeIngredient: [{ text: 'Paprika' }] });

  const response = await worker.fetch(recipeRequest);
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { error: 'Keine strukturierten Rezeptdaten gefunden.' });
});

test('rejects an unapproved recipe host before making an external request', async () => {
  let fetchCalled = false;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error('unexpected external request');
  };

  const response = await worker.fetch(new Request('https://example.test/api/recipe?url=https%3A%2F%2Fexample.com%2Frezept'));
  assert.equal(response.status, 400);
  assert.equal(fetchCalled, false);
});

