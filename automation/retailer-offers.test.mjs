import assert from 'node:assert/strict';
import test from 'node:test';
import { parseAldiOffers, parseKauflandOffers } from './retailer-offers.mjs';

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


test('preserves decimal package quantities in Kaufland offer names', () => {
  const parsed = parseKauflandOffers(`
    <p>Gültig vom 02.11. bis 07.11.</p>
    <a>PEPSI Cola je 0,33-l-Dose(1 l = 2.10) / (1 l = 1.79)**-22%0.69 0.89</a>
  `);

  assert.deepEqual(parsed.offers.map(({ name, price, packSize }) => ({ name, price, packSize })), [{
    name: 'PEPSI Cola je 0,33-l-Dose',
    price: '0,69 €',
    packSize: '0,33 l'
  }]);
});

test('rejects negative and ambiguous German price tokens instead of truncating them', () => {
  const parsed = parseAldiOffers(`
    <p>Gültig vom 06.11.2026 bis 12.11.2026</p>
    <a>Äpfel -1,99 €</a>
    <a>Birnen 1,234 €</a>
  `);

  assert.deepEqual(parsed.offers, []);
});

test('preserves German thousands grouping and decimal amounts', () => {
  const parsed = parseAldiOffers(`
    <p>Gültig vom 06.11.2026 bis 12.11.2026</p>
    <a>Kartoffeln 1.234 €</a>
    <a>Olivenöl 1.234,56 €</a>
  `);

  assert.deepEqual(parsed.offers.map(offer => ({ name: offer.name, price: offer.price })), [
    { name: 'Kartoffeln', price: '1.234 €' },
    { name: 'Olivenöl', price: '1.234,56 €' },
  ]);
});

test('ignores unit-price expressions before the actual offer price', () => {
  const parsed = parseAldiOffers(`
    <p>Gültig vom 06.11.2026 bis 12.11.2026</p>
    <a>Naturjoghurt 1 kg = 1,58 € 0,79 €</a>
  `);

  assert.equal(parsed.offers[0].price, '0,79 €');
});

