import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

import {
  summarizeComparisonPriceCandidates,
  SUMMARY_STATES,
} from './comparison-price-candidates.mjs';

const asOf = '2026-11-09T12:00:00.000Z';
const provenance = sourceName => ({
  sourceName,
  sourceUrl: `https://${sourceName.toLowerCase()}.example/offers`,
  fetchedAt: '2026-11-09T08:00:00.000Z',
  validUntil: '12.11.2026',
  verified: true,
  confidence: 'high',
});

function candidate(candidateKey, offerPriceCents, options = {}) {
  const suffix = String(candidateKey).replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const packageKey = options.packageKey ?? '500-g';
  return {
    candidateKey,
    productKey: options.productKey ?? 'Butter',
    packageKey,
    marketKey: options.marketKey ?? 'Aldi',
    comparison: {
      asOf,
      offer: { priceCents: offerPriceCents, packageKey, provenance: provenance(`Offer-${suffix}`) },
      regular: { priceCents: options.regularPriceCents ?? offerPriceCents + 100, packageKey, provenance: provenance(`Regular-${suffix}`) },
    },
  };
}

test('wählt den niedrigsten belegten Angebotspreis mit stabilem Markt-/Kandidaten-Tie-Break', () => {
  const entries = [
    candidate('zwei', 149, { marketKey: 'Lidl' }),
    candidate('teuer', 199, { marketKey: 'Aldi' }),
    candidate('eins', 149, { marketKey: 'Aldi' }),
  ];
  const summary = summarizeComparisonPriceCandidates(entries);
  const reversed = summarizeComparisonPriceCandidates([...entries].reverse());

  assert.equal(summary.status, SUMMARY_STATES.COMPLETE);
  assert.equal(summary.reason, 'verified-lowest-price');
  assert.equal(summary.totalPriceCents, 149);
  assert.equal(summary.groups.length, 1);
  assert.equal(summary.groups[0].selected.candidateKey, 'eins');
  assert.equal(summary.groups[0].selected.marketKey, 'aldi');
  assert.deepEqual(reversed, summary);
});

test('summiert mehrere Produkt-/Packungsgruppen nur aus den ausgewählten verified-Kandidaten', () => {
  const summary = summarizeComparisonPriceCandidates([
    candidate('butter-aldi', 149),
    candidate('butter-lidl', 129, { marketKey: 'Lidl' }),
    candidate('milk-aldi', 99, { productKey: 'Milch', packageKey: '1-l' }),
  ]);

  assert.equal(summary.status, SUMMARY_STATES.COMPLETE);
  assert.equal(summary.totalPriceCents, 228);
  assert.deepEqual(summary.groups.map(group => group.selected.candidateKey), ['butter-lidl', 'milk-aldi']);
});

test('akzeptiert nur verified mit positiver Ersparnis und bleibt bei unvollständigen Keys unknown', () => {
  const notVerified = candidate('not-saving', 199, { regularPriceCents: 199 });
  const missingMarket = candidate('missing-market', 99, { marketKey: '' });
  const summary = summarizeComparisonPriceCandidates([notVerified, missingMarket]);

  assert.equal(summary.status, SUMMARY_STATES.INSUFFICIENT_DATA);
  assert.equal(summary.totalPriceCents, null);
  assert.equal(summary.reason, 'incomplete-candidate-key');
  assert.equal(summary.groups[0].status, SUMMARY_STATES.INSUFFICIENT_DATA);
  assert.equal(summary.groups[0].reason, 'incomplete-candidate-evidence');
  assert.equal(summary.groups[0].candidates[0].reason, 'comparison-not-verified');
  assert.equal(summary.groups[0].selected, null);
  assert.equal(summary.ungrouped[0].reason, 'incomplete-candidate-key');
});

test('gibt bei fehlender Evidenz oder unsicherer Cent-Gesamtsumme null/insufficient_data zurück', () => {
  const incomplete = candidate('incomplete', 99);
  incomplete.comparison.regular.provenance = undefined;
  const missingEvidence = summarizeComparisonPriceCandidates([candidate('complete', 149), incomplete]);
  assert.equal(missingEvidence.status, SUMMARY_STATES.INSUFFICIENT_DATA);
  assert.equal(missingEvidence.totalPriceCents, null);
  assert.equal(missingEvidence.reason, 'incomplete-candidate-evidence');

  const large = 4_503_599_627_370_500;
  const overflow = summarizeComparisonPriceCandidates([
    candidate('large-a', large, { productKey: 'A' }),
    candidate('large-b', large, { productKey: 'B' }),
  ]);
  assert.equal(overflow.status, SUMMARY_STATES.INSUFFICIENT_DATA);
  assert.equal(overflow.reason, 'unsafe-total');
  assert.equal(overflow.totalPriceCents, null);
});

test('mutiert Eingaben nicht und verwendet keine Netzwerk- oder Produktionspfade', async () => {
  const entries = [candidate('stable', 149)];
  const before = structuredClone(entries);
  const summary = summarizeComparisonPriceCandidates(entries);
  const source = await readFile(new URL('./comparison-price-candidates.mjs', import.meta.url), 'utf8');

  assert.deepEqual(entries, before);
  assert.equal(summary.totalPriceCents, 149);
  assert.doesNotMatch(source, /fetch\s*\(|localStorage|supabase|writeFile|appendFile|UPDATE|INSERT/i);
});

console.log('Comparison price candidate checks passed');

