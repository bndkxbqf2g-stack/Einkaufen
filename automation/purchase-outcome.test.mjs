import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = await readFile(new URL('../purchase-outcome.js', import.meta.url), 'utf8');
const scope = {};
runInNewContext(source, scope);
const model = scope.AngebotskuechePurchaseOutcomeModel;

test('evaluates a complete purchase against the plan', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(model.evaluatePurchaseOutcome({ plannedCents: 10000, actualCents: 9000 }))), {
    plannedCents: 10000, actualCents: 9000, absoluteDifferenceCents: -1000, percentageDifference: -10, status: 'under-budget',
  });
  assert.equal(model.evaluatePurchaseOutcome({ plannedCents: 10000, actualCents: 10000 }).status, 'on-budget');
  assert.equal(model.evaluatePurchaseOutcome({ plannedCents: 10000, actualCents: 11000 }).status, 'over-budget');
});

test('keeps missing and invalid values unknown', () => {
  const missing = model.evaluatePurchaseOutcome({ plannedCents: 1000 });
  assert.equal(missing.actualCents, null);
  assert.equal(missing.absoluteDifferenceCents, null);
  assert.equal(missing.percentageDifference, null);
  assert.equal(missing.status, 'unknown');
  const invalid = model.evaluatePurchaseOutcome({ plannedCents: -1, actualCents: '900' });
  assert.equal(invalid.status, 'unknown');
  assert.equal(invalid.plannedCents, null);
  assert.equal(invalid.actualCents, null);
});

test('does not invent a percentage for a zero plan', () => {
  const result = model.evaluatePurchaseOutcome({ plannedCents: 0, actualCents: 0 });
  assert.equal(result.absoluteDifferenceCents, 0);
  assert.equal(result.percentageDifference, null);
  assert.equal(result.status, 'on-budget');
});
