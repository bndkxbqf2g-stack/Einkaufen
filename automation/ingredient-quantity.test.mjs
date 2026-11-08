import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const rootModule = await readFile(new URL('../ingredient-quantity.js', import.meta.url), 'utf8');
const distModule = await readFile(new URL('../dist/ingredient-quantity.js', import.meta.url), 'utf8');
const rootHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const distHtml = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

assert.equal(distModule, rootModule, 'Root- und dist-Mengenmodul müssen synchron sein');
assert.equal(distHtml, rootHtml, 'Root- und dist-Bundle müssen synchron sein');
assert.match(rootHtml, /<script src="\.\/ingredient-quantity\.js"><\/script>/);

const quantityWindow = {};
runInNewContext(distModule, quantityWindow);
const quantityModel = quantityWindow.AngebotskuecheIngredientQuantityModel;
assert.ok(quantityModel, 'Mengenmodell muss global verfügbar sein');

function extractFunction(source, name) {
  const match = source.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n    \\}`));
  assert.ok(match, `${name} muss im App-Bundle vorhanden sein`);
  return match[0];
}

const normalizeIngredient = extractFunction(distHtml, 'normalizeIngredient');
const shoppingIngredientKey = extractFunction(distHtml, 'shoppingIngredientKey');
const shoppingIngredientIdentity = extractFunction(distHtml, 'shoppingIngredientIdentity');
const shoppingPackCount = extractFunction(distHtml, 'shoppingPackCount');
const getShoppingItems = extractFunction(distHtml, 'getShoppingItems');
const ingredientKeys = new Function(
  `${normalizeIngredient}
${shoppingIngredientKey}
${shoppingIngredientIdentity}
return { shoppingIngredientKey, shoppingIngredientIdentity };`,
)();
const packCount = new Function('window', `${shoppingPackCount}; return shoppingPackCount;`)(quantityWindow);

function buildItems(meals, peopleByDay, offers = []) {
  const globalPeople = peopleByDay[0] || 2;
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
    `${getShoppingItems}
return getShoppingItems;`,
  )(
    () => offers,
    () => meals,
    meal => meal.ingredients || [],
    () => false,
    ingredientKeys.shoppingIngredientKey,
    ingredientKeys.shoppingIngredientIdentity,
    (ingredient, activeOffers) => activeOffers.filter(offer => String(offer.name).toLowerCase() === String(ingredient).toLowerCase()),
    [],
    () => ({ value: String(globalPeople) }),
    { people: globalPeople },
    packCount,
    { ...quantityWindow, AngebotskuecheDayPlanningModel: { portionUnitsForPeople: people => Number(people) / 2 } },
    index => peopleByDay[index] || globalPeople,
  );
  return getItems();
}

test('parst nur eindeutige Mengen und normiert unterstützte Angebots-Packungen', () => {
  assert.deepEqual(
    { ...quantityModel.parseRecipeIngredient('500 g Hackfleisch') },
    { raw: '500 g Hackfleisch', name: 'Hackfleisch', explicit: true, family: 'mass', unit: 'g', amount: 500 },
  );
  assert.equal(quantityModel.parseRecipeIngredient('1,5 l Milch').amount, 1500);
  assert.equal(quantityModel.parseRecipeIngredient('2 Stück Eier').amount, 2);
  assert.equal(quantityModel.parseRecipeIngredient('2 x 200 g Fisch').amount, 400);
  assert.equal(quantityModel.parseRecipeIngredient('1 Bund Petersilie').explicit, false);
  assert.equal(quantityModel.parseRecipeIngredient('2 EL Öl').explicit, false);
  assert.equal(quantityModel.parseRecipeIngredient('Hackfleisch').explicit, false);
  assert.equal(quantityModel.parseOfferPackSize('2,5 kg').amount, 2500);
  assert.equal(quantityModel.parseOfferPackSize('0,33 l').amount, 330);
  assert.deepEqual({ ...quantityModel.parseOfferPackSize('3er Pack') }, { family: 'count', unit: 'piece', amount: 3 });
  assert.equal(quantityModel.parseOfferPackSize('1 Packung'), null);
});

test('berechnet Packungen für 2, 3 und 4 Personen deterministisch', () => {
  const meal = [{ title: 'Hackgericht', ingredients: ['500 g Hackfleisch'] }];
  const offer = [{ name: 'Hackfleisch', packSize: '500 g', price: '2,00 €' }];
  assert.deepEqual(
    [2, 3, 4].map(people => buildItems(meal, [people], offer)[0].packCount),
    [1, 2, 2],
  );
});

test('summiert mehrere Gerichte und speist die bestehende Kostenermittlung', async () => {
  const offers = [
    { name: 'Hackfleisch', packSize: '500 g', price: '2,00 €' },
    { name: 'Sahne', packSize: '500 ml', price: '1,50 €' },
    { name: 'Eier', packSize: '10 Stück', price: '2,29 €' },
  ];
  const items = buildItems([
    { title: 'Gericht A', ingredients: ['500 g Hackfleisch', '250 ml Sahne', '2 Stück Eier'] },
    { title: 'Gericht B', ingredients: ['500 g Hackfleisch', '250 ml Sahne', '2 Stück Eier'] },
  ], [2, 4], offers);
  const byName = Object.fromEntries(items.map(item => [item.name, item]));
  assert.equal(byName.Hackfleisch.count, 2);
  assert.equal(byName.Hackfleisch.packCount, 3);
  assert.equal(byName.Sahne.packCount, 2);
  assert.equal(byName.Eier.packCount, 1);

  const costWindow = {};
  runInNewContext(await readFile(new URL('../shopping-costs.js', import.meta.url), 'utf8'), costWindow);
  const total = costWindow.AngebotskuecheCostModel.calculateOfferAmount(
    items,
    value => Number(String(value).replace(',', '.').replace(' €', '')),
  );
  assert.equal(total.totalCents, 1129);
});

test('unbekannte Einheiten, Textzutaten und inkompatible Packungen nutzen den Legacy-Fallback', () => {
  const unknown = buildItems(
    [{ title: 'Kräutergericht', ingredients: ['1 Bund Petersilie'] }],
    [4],
    [{ name: '1 Bund Petersilie', packSize: '1 Bund', price: '1,00 €' }],
  )[0];
  assert.equal(unknown.quantityBasis.valid, false);
  assert.equal(unknown.packCount, 2);

  const textOnly = buildItems(
    [{ title: 'Textgericht', ingredients: ['Hackfleisch'] }],
    [4],
    [{ name: 'Hackfleisch', packSize: '500 g', price: '2,00 €' }],
  )[0];
  assert.equal(textOnly.packCount, 2);

  let basis = quantityModel.createQuantityBasis();
  basis = quantityModel.addRecipeQuantity(basis, quantityModel.parseRecipeIngredient('500 g Hackfleisch'), 2);
  assert.equal(quantityModel.calculateExactPackCount({ quantityBasis: basis, offer: { packSize: '1 l' } }), null);
});

test('explizite Rezeptmengen bleiben bei der Angebotszuordnung matchbar', () => {
  const variants = extractFunction(distHtml, 'ingredientWordVariants');
  const compoundPatterns = distHtml.match(/const safeCompoundIngredientPatterns = \{[\s\S]*?\n    \};/);
  const compoundExclusions = distHtml.match(/const unsafeCompoundOfferContexts = \{[\s\S]*?\n    \};/);
  const textMatches = extractFunction(distHtml, 'ingredientTextMatches');
  const matcher = extractFunction(distHtml, 'offerMatchesIngredient');
  assert.ok(compoundPatterns && compoundExclusions);
  const matches = new Function(
    'window',
    `${normalizeIngredient}
${variants}
${compoundPatterns[0]}
${compoundExclusions[0]}
${textMatches}
${matcher}
return offerMatchesIngredient;`,
  )(quantityWindow);
  assert.equal(matches('500 g Hackfleisch', { name: 'Rinderhackfleisch' }), true);
});

console.log('Ingredient quantity and packaging checks passed');
