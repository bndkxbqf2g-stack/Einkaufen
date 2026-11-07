import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateOfferPayload } from './validate-generated-offers.mjs';

const now = new Date('2026-11-07T12:00:00.000Z');
const base = {
  market: 'Testmarkt',
  sourceUrl: 'https://example.test/offers',
  parser: 'test-v1',
  fetchedAt: '2026-11-07T09:00:00.000Z',
  validUntil: '07.11.2026',
  offers: [{ name: 'Kartoffeln 2 kg', price: '2,49 €', category: 'Lebensmittel' }]
};

test('akzeptiert eine gültige Angebotsdatei mit Tagesdatum', () => {
  assert.equal(validateOfferPayload(base, 'valid.json', now).count, 1);
});

test('weist unvollständige oder inkonsistente Dateien zurück', () => {
  assert.throws(() => validateOfferPayload({ ...base, offers: [] }, 'empty.json', now), /offers ist leer/);
  assert.throws(() => validateOfferPayload({ ...base, validUntil: '06.11.2026' }, 'expired.json', now), /abgelaufen/);
  assert.throws(() => validateOfferPayload({ ...base, recognizedCount: 2 }, 'count.json', now), /recognizedCount/);
  assert.throws(
    () => validateOfferPayload({ ...base, offers: [{ ...base.offers[0] }, { ...base.offers[0] }] }, 'duplicate.json', now),
    /doppeltes Angebot/
  );
});

test('akzeptiert ISO-Zeitstempel und optionale recognizedCount-Felder', () => {
  assert.equal(
    validateOfferPayload(
      { ...base, validUntil: '2026-11-08T00:00:00.000Z', recognizedCount: 1 },
      'iso.json',
      now
    ).market,
    'Testmarkt'
  );
});

console.log('Generated offer validation checks passed');
