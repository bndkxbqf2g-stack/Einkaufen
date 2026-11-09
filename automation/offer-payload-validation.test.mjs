import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
assert.equal(published, html, 'published bundle must stay byte-identical to the source');

const helperMatch = html.match(/(    function validateOfferPayload\(payload, expectedMarket, now = new Date\(\)\) \{[\s\S]*?\n    \})\r?\n\r?\n    function offerCoverageLabel/);
assert.ok(helperMatch, 'offer payload validator is present');

const offerEndDate = value => {
  const match = String(value || '').match(/^(?:(\d{1,2})\.(\d{1,2})\.(\d{4})|(\d{4})-(\d{2})-(\d{2}))$/);
  if (!match) return null;
  const day = Number(match[1] || match[6]);
  const month = Number(match[2] || match[5]);
  const year = Number(match[3] || match[4]);
  const date = new Date(year, month - 1, day, 23, 59, 59, 999);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
};
const canonicalMarketName = value => ['Aldi', 'Kaufland', 'EDEKA', 'Lidl', 'Penny', 'Netto'].find(name => name.toLowerCase() === String(value || '').trim().toLowerCase()) || '';
const sourceUrlForDisplay = value => {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' && url.hostname && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
};
const normalizeSourceTimestamp = value => {
  const timestamp = value ? new Date(value) : null;
  return timestamp && Number.isFinite(timestamp.getTime()) ? timestamp.toISOString() : '';
};
const validateOfferPayload = vm.runInNewContext(`(${helperMatch[1]})`, {
  canonicalMarketName,
  normalizeSourceTimestamp,
  offerEndDate,
  sourceUrlForDisplay,
});

const now = new Date('2026-11-08T12:00:00.000Z');
const valid = {
  market: 'Lidl',
  sourceUrl: 'https://example.test/lidl',
  fetchedAt: '2026-11-08T10:00:00.000Z',
  validUntil: '12.11.2026',
  recognizedCount: 1,
  offers: [{ name: 'Kartoffeln', price: '1,99 €', validUntil: '12.11.2026' }],
};

test('accepts a complete current source payload and optional recognizedCount omission', () => {
  assert.equal(validateOfferPayload(valid, 'Lidl', now), '');
  assert.equal(validateOfferPayload({ ...valid, recognizedCount: undefined }, 'Lidl', now), '');
});

test('rejects empty, expired, mismatched and malformed source payloads', () => {
  const cases = [
    [{ ...valid, offers: [] }, /Leerer Angebotsdatensatz/],
    [{ ...valid, validUntil: '07.11.2026' }, /abgelaufen/],
    [{ ...valid, market: 'Aldi' }, /anderen Markt/],
    [{ ...valid, sourceUrl: 'http://example.test/lidl' }, /HTTPS-Quelle/],
    [{ ...valid, fetchedAt: 'nicht-datiert' }, /UTC-Abrufzeitpunkt/],
    [{ ...valid, recognizedCount: 2 }, /widersprüchlich/],
    [{ ...valid, offers: [{ name: 'Kartoffeln', price: '1.99', validUntil: '12.11.2026' }] }, /ungültige Angebotsdaten/],
    [{ ...valid, offers: [{ name: 'Verfügbar seit', price: '1,99 €', validUntil: '12.11.2026' }] }, /ungültige Angebotsdaten/],
  ];
  for (const [payload, expected] of cases) assert.match(validateOfferPayload(payload, 'Lidl', now), expected);
});

test('refresh path validates the payload before replacing a market stand', () => {
  assert.match(html, /const payloadError = validateOfferPayload\(payload, market\)/);
  assert.match(html, /successfulMarkets = new Set\(successful\.map\(result => result\.market\)\)/);
  assert.match(html, /offers = retainUnrefreshedAutomaticOffers\(offers, successfulMarkets\)/);
});

console.log('Offer payload validation checks passed');



test('rejects future source timestamps before stale-order checks', () => {
  const snapshotExpiredBeforeFetch = {
    ...valid,
    fetchedAt: '2026-11-13T10:00:00.000Z',
    validUntil: '12.11.2026',
    offers: [{ name: 'Kartoffeln', price: '1,99 €', validUntil: '12.11.2026' }],
  };
  assert.match(validateOfferPayload(snapshotExpiredBeforeFetch, 'Lidl', now), /in der Zukunft/);

  const offerExpiredBeforeFetch = {
    ...valid,
    fetchedAt: '2026-11-13T10:00:00.000Z',
    validUntil: '15.11.2026',
    offers: [{ name: 'Kartoffeln', price: '1,99 €', validUntil: '12.11.2026' }],
  };
  assert.match(validateOfferPayload(offerExpiredBeforeFetch, 'Lidl', now), /in der Zukunft/);
});


test('rejects source timestamps in the future', () => {
  const future = {
    ...valid,
    fetchedAt: '2026-11-13T10:00:00.000Z',
    validUntil: '15.11.2026',
    offers: [{ name: 'Kartoffeln', price: '1,99 €', validUntil: '15.11.2026' }],
  };

  assert.match(validateOfferPayload(future, 'Lidl', now), /Zukunft/);
});
