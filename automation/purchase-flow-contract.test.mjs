import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const names = ['ingredient-normalization.js', 'ingredient-quantity.js', 'shopping-list-optimization.js', 'purchase-outcome.js', 'route-market-score.js'];
const sources = await Promise.all(names.map(name => readFile(new URL(`../${name}`, import.meta.url), 'utf8')));
const scope = {};
for (const source of sources) runInNewContext(source, scope);

const shopping = scope.AngebotskuecheShoppingListOptimizationModel;
const outcome = scope.AngebotskuechePurchaseOutcomeModel;
const route = scope.AngebotskuecheRouteMarketScoreModel;

test('connects demand and pantry to purchase outcome and market route read-only', () => {
  const optimized = shopping.optimizeShoppingList({
    demand: [{ name: 'Kartoffeln', amount: 1000, unit: 'g' }],
    pantry: [{ name: 'Kartoffel', amount: 500, unit: 'g' }],
  }, scope);
  assert.equal(optimized.items.length, 1);
  assert.equal(optimized.items[0].amount, 500);

  const purchase = outcome.evaluatePurchaseOutcome({ plannedCents: 3000, actualCents: 2800 });
  assert.equal(purchase.status, 'under-budget');

  const routeScore = route.evaluateMarketRoutes({
    requiredItems: optimized.items.map(item => item.name),
    markets: [{ id: 'A', availableItems: ['Kartoffeln'], travelCostCents: 250, shoppingCostCents: 2800 }],
  });
  assert.equal(routeScore.markets[0].coverageCount, 1);
  assert.equal(routeScore.markets[0].totalCents, 3050);
});

test('keeps unknown values unknown across the contract', () => {
  const purchase = outcome.evaluatePurchaseOutcome({ plannedCents: 3000 });
  assert.equal(purchase.status, 'unknown');

  const routeScore = route.evaluateMarketRoutes({
    requiredItems: ['Kartoffeln'],
    markets: [{ id: 'A', availableItems: ['Kartoffeln'], shoppingCostCents: 2800 }],
  });
  assert.equal(routeScore.markets[0].totalCents, null);
  assert.equal(routeScore.markets[0].status, 'unknown-total');
});
