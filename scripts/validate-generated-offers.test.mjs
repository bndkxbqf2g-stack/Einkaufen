import assert from 'node:assert/strict';
import { validateOfferPayload } from './validate-generated-offers.mjs';

const validUntil = '31.12.2099';
const base = {
  market: 'Testmarkt',
  sourceUrl: 'https://example.test/offers',
  parser: 'test-v1',
  fetchedAt: '2026-11-05T09:00:00.000Z',
  validUntil,
  offers: [{ name: 'Kartoffeln 2 kg', price: '2,49 €', category: 'Lebensmittel' }]
};

assert.equal(validateOfferPayload(base).count, 1);
assert.throws(() => validateOfferPayload({ ...base, offers: [] }), /offers ist leer/);
assert.throws(() => validateOfferPayload({ ...base, validUntil: '01.01.2020' }), /abgelaufen/);
assert.throws(() => validateOfferPayload({ ...base, recognizedCount: 2 }), /recognizedCount/);
assert.throws(() => validateOfferPayload({ ...base, offers: [{ ...base.offers[0] }, { ...base.offers[0] }] }), /doppeltes Angebot/);
console.log('Generated offer validation checks passed');

