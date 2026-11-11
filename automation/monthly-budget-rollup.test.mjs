import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = await readFile(new URL('../budget-transparency.js', import.meta.url), 'utf8');
const scope = {};
runInNewContext(source, scope);
const model = scope.AngebotskuecheBudgetModel;

test('normalizes valid month keys and rejects invalid months', () => {
  assert.equal(model.normalizeMonthKey('2026-01'), '2026-01');
  assert.equal(model.normalizeMonthKey('2026-13'), null);
  assert.equal(model.normalizeMonthKey('2026-1'), null);
});

test('rolls up monthly plan, actual and travel costs independently', () => {
  assert.deepEqual(model.summarizeMonthlyBudget([
    { month: '2026-02', plannedExpenseCents: 1200, actualSpendCents: 900, travelCostCents: 200, unresolvedPositionCount: 1 },
    { month: '2026-01', plannedExpenseCents: 3000, actualSpendCents: 2500 },
    { month: '2026-02', plannedExpenseCents: 800, actualSpendCents: 100, travelCostCents: 50, unresolvedPositionCount: 2 },
    { month: 'not-a-month', plannedExpenseCents: 9999 },
  ]), [
    { month: '2026-01', plannedExpenseCents: 3000, actualSpendCents: 2500, travelCostCents: null, unresolvedPositionCount: 0 },
    { month: '2026-02', plannedExpenseCents: 2000, actualSpendCents: 1000, travelCostCents: 250, unresolvedPositionCount: 3 },
  ]);
});
