import assert from 'node:assert/strict';
import test from 'node:test';
import { offerPackSize } from './offer-normalization.mjs';

test('uses an explicit package size from the product title', () => {
  assert.equal(offerPackSize('Gouda gerieben 150 g'), '150 g');
});

test('reads a package size before the offer price and ignores the unit-price denominator', () => {
  assert.equal(offerPackSize('Naturjoghurt', 'Naturjoghurt 500 g 0,79 € / 100 g'), '500 g');
});

test('normalizes explicit multipacks and piece counts', () => {
  assert.equal(offerPackSize('Mozzarella', 'Mozzarella 2x200g 2,49 €'), '2 x 200g');
  assert.equal(offerPackSize('Eier', 'Eier 10 Stück 2,79 €'), '10 Stück');
});

test('does not mistake a unit-price denominator for the package size', () => {
  assert.equal(offerPackSize('Olivenöl', 'Olivenöl 3,99 € / 100 ml'), '1 Packung');
});

test('retains the neutral fallback when no size is explicit', () => {
  assert.equal(offerPackSize('Tomaten', 'Tomaten 1,49 €'), '1 Packung');
});

