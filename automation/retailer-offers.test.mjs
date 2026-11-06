import assert from 'node:assert/strict';
import test from 'node:test';
import { parseAldiOffers } from './retailer-offers.mjs';

test('filters availability metadata and parses only explicit offer dates', () => {
  const parsed = parseAldiOffers(`
    <p>Gültig vom 06.11.2026 bis 12.11.2026</p>
    <a>Verfügbar seit 02.11.2026 1,99 €</a>
    <a>Äpfel 1,99 €</a>
  `);

  assert.equal(parsed.validUntil, '12.11.2026');
  assert.deepEqual(parsed.offers.map(offer => offer.name), ['Äpfel']);
});

test('does not invent an offer expiry when the source provides none', () => {
  const parsed = parseAldiOffers('<a>Äpfel 1,99 €</a>');

  assert.equal(parsed.validUntil, null);
  assert.equal(parsed.offers.length, 1);
});

test('keeps an explicitly advertised package size', () => {
  const parsed = parseAldiOffers(`
    <p>Gültig vom 06.11.2026 bis 12.11.2026</p>
    <a>Joghurt Natur 500 g 0,79 € / 100 g</a>
  `);

  assert.equal(parsed.offers[0].packSize, '500 g');
});
