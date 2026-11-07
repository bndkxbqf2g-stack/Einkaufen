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
const shoppingPackCount = extractFunction('shoppingPackCount');
const getShoppingItems = extractFunction('getShoppingItems');

const ingredientKeys = new Function(
  `${normalizeIngredient}
${shoppingIngredientKey}
${shoppingIngredientIdentity}
return { shoppingIngredientKey, shoppingIngredientIdentity };`,
)();
const packCount = new Function(`${shoppingPackCount}; return shoppingPackCount;`)();

function createShoppingItems(meals, manualItems = []) {
  const getItems = new Function(
    'getActiveOffers',
    'getCurrentPlanMeals',
    'getMealIngredients',
    'isPantryIngredient',
    'shoppingIngredientKey',
    'shoppingIngredientIdentity',
    'offerMatchesIngredient',
    'sortedSelectedMarkets',
    'compareOfferCandidates',
    'manualShoppingItems',
    '$',
    'settings',
    'shoppingPackCount',
    `${getShoppingItems}
return getShoppingItems;`,
  )(
    () => [],
    () => meals,
    meal => meal.ingredients || [],
    () => false,
    ingredientKeys.shoppingIngredientKey,
    ingredientKeys.shoppingIngredientIdentity,
    () => false,
    () => [],
    () => 0,
    manualItems,
    () => ({ value: '2' }),
    { people: 2 },
    packCount,
  );
  return getItems();
}

test('führt Singular und Plural gemeinsamer Zutaten in einer Position zusammen', () => {
  const items = createShoppingItems([
    { title: 'Gericht 1', ingredients: ['Tomaten'] },
    { title: 'Gericht 2', ingredients: ['Tomate'] },
  ]);

  assert.equal(ingredientKeys.shoppingIngredientKey('Tomaten'), 'tomaten');
  assert.equal(ingredientKeys.shoppingIngredientKey('Tomate'), 'tomate');
  assert.equal(ingredientKeys.shoppingIngredientIdentity('Tomaten'), ingredientKeys.shoppingIngredientIdentity('Tomate'));
  assert.equal(items.length, 1);
  assert.equal(items[0].count, 2);
  assert.equal(items[0].packCount, 1);
  assert.equal(items[0].id, 'shopping-tomaten', 'der erste bestehende Schlüssel bleibt für shoppingChecks stabil');
  assert.deepEqual(items[0].meals, ['Gericht 1', 'Gericht 2']);
});

test('trennt weiterhin unterschiedliche Zutaten und Varianten bei manuellen Artikeln', () => {
  const items = createShoppingItems(
    [{ title: 'Gericht', ingredients: ['Milch'] }],
    [{ id: 'manual-1', name: 'Buttermilch' }],
  );

  assert.equal(items.length, 2);
  assert.deepEqual(items.map(item => item.name).sort(), ['Buttermilch', 'Milch']);
});
