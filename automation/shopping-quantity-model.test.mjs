import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateShoppingQuantities, parseIngredient } from './shopping-quantity-model.mjs';

test('parses metric quantities and normalizes names', () => {
  assert.deepEqual(parseIngredient('1,5 kg Tomaten'), { name: 'tomaten', quantity: 1500, unit: 'g', raw: '1,5 kg Tomaten' });
});

test('aggregates meals, subtracts stock once and rounds packs up', () => {
  const result = calculateShoppingQuantities({
    people: 2,
    ingredients: ['500 g Tomaten', '250 g Tomaten'],
    pantry: [{ name: 'Tomaten', quantity: 400, unit: 'g' }],
    packSizes: { tomaten: { quantity: 500, unit: 'g' } }
  });
  assert.equal(result[0].required, 1500);
  assert.equal(result[0].available, 400);
  assert.equal(result[0].remaining, 1100);
  assert.equal(result[0].packs, 3);
});

test('keeps legacy string pantry as unknown quantity', () => {
  const result = calculateShoppingQuantities({ ingredients: ['1 l Milch'], pantry: ['Milch'] });
  assert.equal(result[0].quantityStatus, 'unknown');
  assert.equal(result[0].packs, null);
});

test('does not invent a conversion for incompatible units', () => {
  const result = calculateShoppingQuantities({ ingredients: ['2 Stück Eier'], pantry: [{ name: 'Eier', quantity: 100, unit: 'g' }] });
  assert.equal(result[0].quantityStatus, 'unknown');
  assert.equal(result[0].available, null);
});

