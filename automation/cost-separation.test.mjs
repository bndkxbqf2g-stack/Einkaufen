import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = await readFile(new URL('../cost-separation.js', import.meta.url), 'utf8');
const scope = {};
runInNewContext(source, scope);
const model = scope.AngebotskuecheCostSeparationModel;

test('keeps cash register, consumption and travel costs separate', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(model.summarizeCostSeparation({
    cashRegisterCents: 4200,
    consumptionCostCents: 3900,
    travelCostCents: 600,
  }))), {
    cashRegisterCents: 4200, cashRegisterStatus: 'confirmed',
    consumptionCostCents: 3900, consumptionCostStatus: 'confirmed',
    travelCostCents: 600, travelCostStatus: 'separate',
    operatingCents: 8100, operatingStatus: 'confirmed',
    totalWithTravelCents: 8700, totalWithTravelStatus: 'confirmed',
  });
});

test('does not infer missing or invalid costs', () => {
  const result = model.summarizeCostSeparation({ cashRegisterCents: 4200, travelCostCents: -1 });
  assert.equal(result.consumptionCostCents, null);
  assert.equal(result.consumptionCostStatus, 'unknown');
  assert.equal(result.travelCostCents, null);
  assert.equal(result.operatingCents, null);
  assert.equal(result.totalWithTravelCents, null);
});
