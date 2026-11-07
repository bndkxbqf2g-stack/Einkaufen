import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const costModelSource = await readFile(new URL('../shopping-costs.js', import.meta.url), 'utf8');
const browserGlobal = {};
runInNewContext(costModelSource, browserGlobal);
const costModel = browserGlobal.AngebotskuecheCostModel;

const parseMoneyMatch = published.match(/function parseKnownMoney\(value\) \{[\s\S]*?\n    \}/);
const packCountMatch = published.match(/function shoppingPackCount\(item, people\) \{[\s\S]*?\n    \}/);
assert.ok(parseMoneyMatch, 'parseKnownMoney muss im App-Bundle vorhanden sein');
assert.ok(packCountMatch, 'shoppingPackCount muss im App-Bundle vorhanden sein');
const parseKnownMoney = new Function(`${parseMoneyMatch[0]}; return parseKnownMoney;`)();
const shoppingPackCount = new Function(`${packCountMatch[0]}; return shoppingPackCount;`)();

test('Planpreis und Einkaufssumme nutzen bei drei Personen dieselbe Packungsbasis', () => {
  const meals = [
    { slot: 'lunch', title: 'Mittagessen' },
    { slot: 'dinner', title: 'Abendessen' },
  ];
  const items = [
    { id: 'lunch-tomaten', meal: meals[0], count: 1, offer: { price: '1,20 €' } },
    { id: 'lunch-kartoffeln', meal: meals[0], count: 1, offer: { price: '0,79 €' } },
    { id: 'dinner-tomaten', meal: meals[1], count: 1, offer: { price: '1,20 €' } },
    { id: 'dinner-kartoffeln', meal: meals[1], count: 1, offer: { price: '0,79 €' } },
  ];
  const withPackCounts = items.map(item => ({ ...item, packCount: shoppingPackCount(item, 3) }));
  const shoppingTotal = costModel.calculateOfferAmount(withPackCounts, parseKnownMoney);

  assert.deepEqual(withPackCounts.map(item => item.packCount), [2, 2, 2, 2]);
  assert.equal(shoppingTotal.totalCents, 796);
  assert.equal(shoppingTotal.total, 7.96);
  assert.equal(Math.round((1.20 + 0.79) * 1.5 * 2 * 100), 597, 'die frühere anteilige Planrechnung wäre abweichend');

  const planRenderer = source.slice(source.indexOf('function renderPlan'), source.indexOf('function renderPlanSuggestions'));
  assert.match(planRenderer, /summarizeShoppingCosts\(getShoppingItems\(\)\.filter\(item => !item\.manual\), parseKnownMoney\)/);
  assert.doesNotMatch(planRenderer, /pricedMeals\.reduce\([\s\S]*\* multiplier/);
});

test('Root- und dist-Bundle bleiben synchron', () => {
  assert.equal(published, source);
});

console.log('Plan/shopping cost parity checks passed');
