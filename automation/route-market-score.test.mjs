import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = await readFile(new URL('../route-market-score.js', import.meta.url), 'utf8');
const scope = {};
runInNewContext(source, scope);
const model = scope.AngebotskuecheRouteMarketScoreModel;

test('ranks complete markets by coverage then known travel and total cost', () => {
  const result = model.evaluateMarketRoutes({ requiredItems: ['Milch', 'Brot', 'Eier'], markets: [
    { id: 'B', availableItems: ['Milch', 'Brot', 'Eier'], travelCostCents: 500, shoppingCostCents: 4200 },
    { id: 'A', availableItems: ['Milch', 'Brot'], travelCostCents: 200, shoppingCostCents: 4300 },
  ]});
  assert.equal(result.requiredCount, 3);
  assert.deepEqual(JSON.parse(JSON.stringify(result.markets.map(m => m.id))), ['B', 'A']);
  assert.equal(result.markets[0].coverageRatio, 1);
  assert.equal(result.markets[0].totalCents, 4700);
  assert.equal(result.markets[0].status, 'complete');
});

test('keeps unknown travel costs out of total and ranks them after known costs', () => {
  const result = model.evaluateMarketRoutes({ requiredItems: ['Milch'], markets: [
    { id: 'unknown', availableItems: ['Milch'], shoppingCostCents: 100 },
    { id: 'known', availableItems: ['Milch'], travelCostCents: 0, shoppingCostCents: 100 },
  ]});
  assert.deepEqual(JSON.parse(JSON.stringify(result.markets.map(m => m.id))), ['known', 'unknown']);
  assert.equal(result.markets[1].totalCents, null);
  assert.equal(result.markets[1].status, 'unknown-total');
});

test('handles empty markets and stable ties without inventing values', () => {
  const result = model.evaluateMarketRoutes({ requiredItems: [], markets: [
    { id: 'first', availableItems: [], travelCostCents: 0, shoppingCostCents: 0 },
    { id: 'second', availableItems: [], travelCostCents: 0, shoppingCostCents: 0 },
  ]});
  assert.equal(result.requiredCount, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(result.markets.map(m => m.id))), ['first', 'second']);
  assert.equal(result.markets[0].coverageRatio, 0);
  assert.equal(result.markets[0].totalCents, 0);
});

test('rejects negative, fractional and overflowing costs', () => {
  const result = model.evaluateMarketRoutes({ requiredItems: ['Mehl'], markets: [
    { id: 'invalid', availableItems: ['Mehl'], travelCostCents: -1, shoppingCostCents: 1.5 },
    { id: 'overflow', availableItems: ['Mehl'], travelCostCents: Number.MAX_SAFE_INTEGER, shoppingCostCents: 1 },
  ]});
  assert.equal(result.markets[0].totalCents, null);
  assert.equal(result.markets[1].totalCents, null);
});
