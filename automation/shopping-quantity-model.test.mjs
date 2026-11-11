import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateShoppingQuantities, normalizeIngredientName, parseIngredient, parseQuantity } from './shopping-quantity-model.mjs';

test('parses g, kg, ml, l and Stück with decimal commas', () => {
  assert.deepEqual(parseQuantity('1,5 kg'), { quantity: 1500, unit: 'g' });
  assert.deepEqual(parseQuantity('250 ml'), { quantity: 250, unit: 'ml' });
  assert.deepEqual(parseQuantity('6 Stück'), { quantity: 6, unit: 'piece' });
});

test('normalizes names without inventing singular/plural matches', () => {
  assert.equal(normalizeIngredientName('  Äpfel, frisch  '), 'apfel frisch');
  assert.notEqual(normalizeIngredientName('Tomate'), normalizeIngredientName('Tomaten'));
});

test('parses measured ingredients and unqualified piece counts', () => {
  assert.deepEqual(parseIngredient('500 g Tomaten'), { name: 'tomaten', quantity: 500, unit: 'g', raw: '500 g Tomaten' });
  assert.deepEqual(parseIngredient('2 Eier'), { name: 'eier', quantity: 2, unit: 'piece', raw: '2 Eier' });
  assert.equal(parseIngredient('Salz nach Geschmack').quantity, null);
});

test('aggregates normalized ingredients and applies the person factor', () => {
  const [item] = calculateShoppingQuantities({ people: 2, ingredients: [{ name: 'Tomaten', quantity: 300, unit: 'g' }, { name: ' tomaten ', quantity: 200, unit: 'g' }] });
  assert.equal(item.required, 1000);
  assert.equal(item.quantityStatus, 'known');
});

test('subtracts quantity-aware pantry stock once and rounds packages up', () => {
  const [item] = calculateShoppingQuantities({ ingredients: [{ name: 'Milch', quantity: 1500, unit: 'ml' }], pantry: [{ name: 'Milch', quantity: 1, unit: 'l' }], packSizes: { milch: '500 ml' } });
  assert.equal(item.available, 1000);
  assert.equal(item.remaining, 500);
  assert.equal(item.packs, 1);
});

test('rounds 1200 g to three 500 g packages', () => {
  const [item] = calculateShoppingQuantities({ ingredients: [{ name: 'Reis', quantity: 1200, unit: 'g' }], packSizes: { reis: '500 g' } });
  assert.equal(item.packs, 3);
});

test('marks incompatible quantities and legacy string stock as unknown', () => {
  const incompatible = calculateShoppingQuantities({ ingredients: ['500 g Mehl'], pantry: [{ name: 'Mehl', quantity: 1, unit: 'Stück' }] })[0];
  assert.equal(incompatible.quantityStatus, 'unknown');
  assert.equal(incompatible.remaining, null);
  const legacy = calculateShoppingQuantities({ ingredients: ['500 ml Milch'], pantry: ['Milch'] })[0];
  assert.equal(legacy.quantityStatus, 'unknown');
  assert.equal(legacy.available, null);
});

test('does not invent values for unknown ingredient quantities', () => {
  const [item] = calculateShoppingQuantities({ ingredients: ['Pfeffer'] });
  assert.equal(item.quantityStatus, 'unknown');
  assert.equal(item.required, null);
  assert.equal(item.packs, null);
});

