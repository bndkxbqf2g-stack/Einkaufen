import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [rootHtml, publishedHtml, quantitySource, dayPlanningSource, costSource] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../ingredient-quantity.js', import.meta.url), 'utf8'),
  readFile(new URL('../day-planning.js', import.meta.url), 'utf8'),
  readFile(new URL('../shopping-costs.js', import.meta.url), 'utf8'),
]);

assert.equal(publishedHtml, rootHtml, 'Root- und dist-App müssen synchron sein');

function extractFunction(source, name) {
  const match = source.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n    \\}`));
  assert.ok(match, `${name} muss im App-Bundle vorhanden sein`);
  return match[0];
}

const normalizeIngredient = extractFunction(rootHtml, 'normalizeIngredient');
const shoppingIngredientKey = extractFunction(rootHtml, 'shoppingIngredientKey');
const shoppingIngredientIdentity = extractFunction(rootHtml, 'shoppingIngredientIdentity');
const shoppingPackCount = extractFunction(rootHtml, 'shoppingPackCount');
const getShoppingItems = extractFunction(rootHtml, 'getShoppingItems');

const quantityWindow = {};
runInNewContext(`${quantitySource}\n${dayPlanningSource}`, quantityWindow);
const costWindow = {};
runInNewContext(costSource, costWindow);

function buildShoppingItems({ lunches, dinners, peopleByDay, offers }) {
  const controls = { '#peopleSelect': { value: '2' } };
  const settings = { people: 2 };
  const getPlanPeople = index => peopleByDay[index] || settings.people;
  const identity = value => String(value ?? '').trim().toLowerCase();
  const getItems = new Function(
    'getActiveOffers',
    'getCurrentPlanMeals',
    'getMealIngredients',
    'isPantryIngredient',
    'shoppingIngredientKey',
    'shoppingIngredientIdentity',
    'matchingOfferCandidates',
    'manualShoppingItems',
    '$',
    'settings',
    'shoppingPackCount',
    'window',
    'getPlanPeople',
    'getCurrentPlanSections',
    `${normalizeIngredient}\n${shoppingIngredientKey}\n${shoppingIngredientIdentity}\n${shoppingPackCount}\n${getShoppingItems}\nreturn getShoppingItems;`,
  )(
    () => offers,
    () => lunches,
    meal => meal.ingredients || [],
    () => false,
    value => identity(value),
    value => identity(value),
    (ingredient, activeOffers) => activeOffers.filter(offer => identity(offer.name) === identity(ingredient)),
    [],
    selector => controls[selector],
    settings,
    new Function('window', `${shoppingPackCount}; return shoppingPackCount;`)(quantityWindow),
    quantityWindow,
    getPlanPeople,
    () => ({ lunches, dinners }),
  );
  return getItems();
}

test('uses the original day people for an optional dinner in the combined shopping quantity', () => {
  const items = buildShoppingItems({
    lunches: [
      { title: 'Mittag am ersten Tag', ingredients: ['500 g Hackfleisch'] },
      { title: 'Mittag am zweiten Tag', ingredients: ['1 Stück Zwiebel'] },
    ],
    dinners: [
      null,
      { title: 'Abendessen am zweiten Tag', ingredients: ['500 g Hackfleisch'] },
    ],
    peopleByDay: [2, 4],
    offers: [{ name: 'Hackfleisch', packSize: '500 g', price: '2,00 €' }],
  });

  const hackfleisch = items.find(item => item.name === 'Hackfleisch');
  assert.ok(hackfleisch, 'die gemeinsame Zutat muss in einer Position zusammengeführt werden');
  assert.equal(hackfleisch.count, 2);
  assert.equal(hackfleisch.portionUnits, 3);
  assert.equal(hackfleisch.packCount, 3, '500 g für 2 Personen plus 500 g für 4 Personen benötigen drei Packungen');
  assert.deepEqual(Array.from(hackfleisch.meals), ['Mittag am ersten Tag', 'Abendessen am zweiten Tag']);

  const summary = costWindow.AngebotskuecheCostModel.calculateOfferAmount(
    items,
    value => value === '2,00 €' ? 2 : null,
  );
  assert.equal(summary.totalCents, 600);
});

console.log('Planned shopping quantity checks passed');
