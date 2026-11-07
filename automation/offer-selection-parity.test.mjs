import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.equal(published, source, 'published bundle must stay byte-identical to the source');

const parseMoneyMatch = published.match(/function parseKnownMoney\(value\) \{[\s\S]*?\n    \}/);
const packageSizeMatch = published.match(/function parseKnownPackageSize\(value\) \{[\s\S]*?\n    \}/);
const compareMatch = published.match(/function compareOfferCandidates\(first, second\) \{[\s\S]*?\n    \}/);
const selectorMatch = published.match(/function matchingOfferCandidates\(ingredient, activeOffers = getActiveOffers\(\)\) \{[\s\S]*?\n    \}/);

for (const [name, match] of Object.entries({ parseKnownMoney: parseMoneyMatch, parseKnownPackageSize: packageSizeMatch, compareOfferCandidates: compareMatch, matchingOfferCandidates: selectorMatch })) {
  assert.ok(match, name + ' muss im veröffentlichten App-Bundle vorhanden sein');
}

const parseKnownMoney = new Function(parseMoneyMatch[0] + '; return parseKnownMoney;')();
const parseKnownPackageSize = new Function(packageSizeMatch[0] + '; return parseKnownPackageSize;')();
const compareOfferCandidates = new Function(
  parseMoneyMatch[0] + '\n' + packageSizeMatch[0] + '\n' + compareMatch[0] + '; return compareOfferCandidates;',
)();
const matchingOfferCandidates = new Function(
  'offerMatchesIngredient',
  'compareOfferCandidates',
  selectorMatch[0] + '; return matchingOfferCandidates;',
)(
  (ingredient, offer) => String(offer?.name || '').toLowerCase().includes(String(ingredient || '').toLowerCase()),
  compareOfferCandidates,
);

const offers = [
  { id: 'aldi-tomaten', name: 'Tomaten', store: 'Aldi', relevance: 80, packSize: '500 g', price: '2,49 €' },
  { id: 'edeka-tomaten', name: 'Tomaten', store: 'EDEKA', relevance: 90, packSize: '500 g', price: '4,99 €' },
  { id: 'aldi-kartoffeln', name: 'Kartoffeln', store: 'Aldi', relevance: 80, packSize: '1 kg', price: '1,49 €' },
];

function selectedOffer(ingredient) {
  return matchingOfferCandidates(ingredient, offers)[0];
}

test('Plan und Einkaufsliste verwenden dieselbe Relevanzrangfolge', () => {
  assert.equal(selectedOffer('Tomaten').id, 'edeka-tomaten');
  assert.equal(selectedOffer('Kartoffeln').id, 'aldi-kartoffeln');

  const recipeMatchBlock = published.slice(
    published.indexOf('function getRecipeMatchDetails'),
    published.indexOf('function estimateMatchCost'),
  );
  const shoppingBlock = published.slice(
    published.indexOf('function getShoppingItems'),
    published.indexOf('function reconcileShoppingChecks'),
  );

  assert.match(recipeMatchBlock, /matchingOfferCandidates\(ingredient, activeOffers\)/);
  assert.match(shoppingBlock, /matchingOfferCandidates\(ingredient, activeOffers\)/);
  assert.doesNotMatch(shoppingBlock, /const marketOrder = sortedSelectedMarkets\(\)/);
});

test('Mittagessen plus optionales Abendessen behalten dieselbe Angebots- und Kostenbasis', () => {
  const meals = [
    ['Tomaten', 'Kartoffeln'],
    ['Tomaten', 'Kartoffeln'],
  ];
  const planOffers = meals.flatMap(ingredients => ingredients.map(selectedOffer));
  const planCents = planOffers.reduce((sum, offer) => sum + Math.round(parseKnownMoney(offer.price) * 100), 0);

  const ingredientCounts = new Map();
  for (const ingredients of meals) {
    for (const ingredient of ingredients) ingredientCounts.set(ingredient, (ingredientCounts.get(ingredient) || 0) + 1);
  }
  const shoppingCents = [...ingredientCounts].reduce((sum, [ingredient, count]) => {
    return sum + Math.round(parseKnownMoney(selectedOffer(ingredient).price) * 100) * count;
  }, 0);

  assert.equal(planCents, 1296);
  assert.equal(shoppingCents, planCents);
});

console.log('Offer selection parity checks passed');
