import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assessComparisonPriceEvidence,
  COMPARISON_STATES,
  summarizeComparisonPriceEvidence,
} from './comparison-price-evidence.mjs';

const asOf = '2026-11-09T12:00:00.000Z';
const provenance = sourceName => ({
  sourceName,
  sourceUrl: `https://${sourceName.toLowerCase()}.example/offers?location=private`,
  fetchedAt: '2026-11-09T08:00:00.000Z',
  validUntil: '12.11.2026',
  verified: true,
  confidence: 'high',
});
const validEntry = {
  asOf,
  offer: { priceCents: 249, packageKey: '500-g', provenance: provenance('Offerquelle') },
  regular: { priceCents: 399, packageKey: '500-g', provenance: provenance('Regelpreisquelle') },
};

test('berechnet eine belegte Ersparnis nur aus expliziten, packungsgleichen Quellenwerten', () => {
  assert.deepEqual(assessComparisonPriceEvidence(validEntry), {
    status: COMPARISON_STATES.VERIFIED,
    reason: 'verified-saving',
    offerPriceCents: 249,
    regularPriceCents: 399,
    packageKey: '500-g',
    priceDeltaCents: 150,
    savingCents: 150,
    savingPercent: 37.59,
    provenance: {
      offer: { sourceName: 'Offerquelle', sourceUrl: 'https://offerquelle.example/offers', fetchedAt: '2026-11-09T08:00:00.000Z', validUntil: '2026-11-12' },
      regular: { sourceName: 'Regelpreisquelle', sourceUrl: 'https://regelpreisquelle.example/offers', fetchedAt: '2026-11-09T08:00:00.000Z', validUntil: '2026-11-12' },
    },
  });
});

test('liefert keine Ersparnis für gleichen oder höheren Angebotspreis', () => {
  const equal = assessComparisonPriceEvidence({ ...validEntry, regular: { ...validEntry.regular, priceCents: 249 } });
  const higher = assessComparisonPriceEvidence({ ...validEntry, offer: { ...validEntry.offer, priceCents: 499 } });

  assert.equal(equal.status, COMPARISON_STATES.NOT_CHEAPER);
  assert.equal(equal.reason, 'equal-price');
  assert.equal(equal.savingCents, null);
  assert.equal(higher.status, COMPARISON_STATES.NOT_CHEAPER);
  assert.equal(higher.priceDeltaCents, -100);
  assert.equal(higher.savingPercent, null);
});

test('behandelt fehlende, ungültige oder nicht vergleichbare Preise als unknown', () => {
  assert.equal(assessComparisonPriceEvidence({ ...validEntry, offer: { ...validEntry.offer, priceCents: 0 } }).reason, 'missing-or-invalid-price');
  assert.equal(assessComparisonPriceEvidence({ ...validEntry, regular: { ...validEntry.regular, priceCents: '2,99 €' } }).reason, 'missing-or-invalid-price');
  assert.equal(assessComparisonPriceEvidence({ ...validEntry, regular: { ...validEntry.regular, packageKey: '1-kg' } }).reason, 'incomparable-package');
  assert.equal(assessComparisonPriceEvidence({ ...validEntry, asOf: undefined }).reason, 'missing-as-of');
});

test('behandelt fehlende, abgelaufene, manuelle und unsichere Quellen als unknown', () => {
  const missing = assessComparisonPriceEvidence({ ...validEntry, regular: { ...validEntry.regular, provenance: undefined } });
  const expired = assessComparisonPriceEvidence({ ...validEntry, offer: { ...validEntry.offer, provenance: { ...provenance('Alt'), validUntil: '08.11.2026' } } });
  const manual = assessComparisonPriceEvidence({ ...validEntry, regular: { ...validEntry.regular, provenance: { ...provenance('Manuell'), manual: true } } });
  const uncertain = assessComparisonPriceEvidence({ ...validEntry, offer: { ...validEntry.offer, provenance: { ...provenance('Unsicher'), confidence: 'medium' } } });

  assert.equal(missing.reason, 'missing-provenance');
  assert.equal(expired.reason, 'expired-source');
  assert.equal(manual.reason, 'manual-source');
  assert.equal(uncertain.reason, 'uncertain-source');
  for (const result of [missing, expired, manual, uncertain]) {
    assert.equal(result.status, COMPARISON_STATES.UNKNOWN);
    assert.equal(result.savingCents, null);
    assert.equal(result.provenance, null);
  }
});

test('verlangt sichere HTTPS-Quellen und verwirft zukünftige Quellenstände', () => {
  const insecure = assessComparisonPriceEvidence({ ...validEntry, offer: { ...validEntry.offer, provenance: { ...provenance('HTTP'), sourceUrl: 'http://http.example/offers' } } });
  const future = assessComparisonPriceEvidence({ ...validEntry, regular: { ...validEntry.regular, provenance: { ...provenance('Zukunft'), fetchedAt: '2026-11-10T08:00:00.000Z' } } });

  assert.equal(insecure.reason, 'incomplete-provenance');
  assert.equal(future.reason, 'future-source');
});

test('summarizes entries deterministically without mutating input', () => {
  const entries = [validEntry, { ...validEntry, regular: { ...validEntry.regular, priceCents: 249 } }];
  const before = structuredClone(entries);
  const summary = summarizeComparisonPriceEvidence(entries, { asOf });

  assert.deepEqual(entries, before);
  assert.deepEqual(summary.counts, { verified: 1, 'not-cheaper': 1, unknown: 0 });
  assert.equal(summary.entries.length, 2);
});

test('verwendet keine Netzwerk-, Speicher- oder Produktionspfade', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('./comparison-price-evidence.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /fetch\s*\(|localStorage|supabase|writeFile|appendFile|UPDATE|INSERT/i);
});

console.log('Comparison price evidence checks passed');

