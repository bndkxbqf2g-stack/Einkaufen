import assert from 'node:assert/strict';
import test from 'node:test';

import { createOfferHistoryObservation, offerHistoryKey } from './offer-history.mjs';

const result = {
  market: 'Lidl',
  store: 'Lidl',
  location: 'Zellingen',
  sourceUrl: 'https://example.test/prospect',
  fetchedAt: '2026-11-10T08:00:00.000Z',
};
const sourceOffer = {
  name: 'Äpfel',
  price: '1,99 €',
  regularPrice: '2,49 €',
  packSize: '1 kg',
  validUntil: '12.11.2026',
  imageUrl: '',
};

test('preserves an explicit regular price in historical offer observations', () => {
  assert.equal(createOfferHistoryObservation(result, sourceOffer).regularPrice, '2,49 €');
});

test('keeps legacy observations compatible and refreshes the same offer identity', () => {
  const legacy = createOfferHistoryObservation(result, { ...sourceOffer, regularPrice: undefined });
  const current = createOfferHistoryObservation(result, sourceOffer);
  assert.equal(legacy.regularPrice, undefined);
  assert.equal(offerHistoryKey(legacy), offerHistoryKey(current));
});
