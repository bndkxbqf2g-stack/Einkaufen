import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  buildOfferSourceCompletenessEvidence,
  buildOfferSourceCompletenessReport,
  EVIDENCE_BASES,
  readOfferSourceCompletenessReport,
} from './market-completeness-evidence.mjs';

const sourceMetadata = {
  market: 'Aldi',
  store: 'ALDI SÜD',
  sourceUrl: 'https://www.kaufda.de/search?query=ALDI&lat=49.9&lng=9.8',
  fetchedAt: '2026-11-06T12:00:00.000Z',
  validUntil: '12.11.2026',
  parser: 'kaufda-offer-cards-v6',
  recognizedCount: 87,
  targetOfferCount: 410,
  loadedOfferCardCount: 428,
  targetReached: true,
  offers: Array.from({ length: 87 }, () => ({ name: 'Kartoffeln' })),
};

test('keeps lazy-load and recognized counts separate from source completeness', () => {
  const [evidence] = buildOfferSourceCompletenessEvidence([sourceMetadata]);

  assert.equal(evidence.observation.recognizedOfferCount, 87);
  assert.equal(evidence.observation.load.targetOfferCount, 410);
  assert.equal(evidence.observation.load.loadedOfferCardCount, 428);
  assert.equal(evidence.completeness.status, 'unknown');
  assert.equal(evidence.completeness.expectedTotalOfferCount, null);
  assert.equal(evidence.completeness.observedTotalOfferCount, null);
  assert.equal(evidence.completeness.basis, EVIDENCE_BASES.MISSING_SOURCE_TOTALS);
});

test('accepts completeness only from both explicit source-scoped totals', () => {
  const [complete] = buildOfferSourceCompletenessEvidence([{
    ...sourceMetadata,
    sourceExpectedTotalCount: 428,
    sourceObservedTotalCount: 428,
  }]);
  const [partial] = buildOfferSourceCompletenessEvidence([{
    ...sourceMetadata,
    sourceExpectedTotalCount: 100,
    sourceObservedTotalCount: 98,
  }]);

  assert.equal(complete.completeness.status, 'complete');
  assert.equal(complete.completeness.basis, EVIDENCE_BASES.EXPLICIT_SOURCE_TOTALS);
  assert.equal(partial.completeness.status, 'partial');
  assert.equal(partial.completeness.basis, EVIDENCE_BASES.EXPLICIT_SOURCE_TOTALS);
});

test('keeps an explicit observed source count but remains unknown without an expectation', () => {
  const [evidence] = buildOfferSourceCompletenessEvidence([{
    market: 'EDEKA',
    sourceObservedTotalCount: 98,
  }]);

  assert.equal(evidence.completeness.status, 'unknown');
  assert.equal(evidence.completeness.basis, EVIDENCE_BASES.MISSING_EXPECTED_TOTAL);
  assert.equal(evidence.completeness.expectedTotalOfferCount, null);
  assert.equal(evidence.completeness.observedTotalOfferCount, 98);
});

test('does not infer an expected count from offers or a reached load target', () => {
  const [evidence] = buildOfferSourceCompletenessEvidence([{
    market: 'Lidl',
    targetOfferCount: 1000,
    loadedOfferCardCount: 1004,
    targetReached: true,
    recognizedCount: 2,
    offers: [{ name: 'Milch' }, { name: 'Brot' }],
  }]);

  assert.equal(evidence.observation.recognizedOfferCount, 2);
  assert.equal(evidence.completeness.status, 'unknown');
  assert.equal(evidence.completeness.expectedTotalOfferCount, null);
});

test('keeps evidence source-scoped and removes sensitive source query parameters', () => {
  const report = buildOfferSourceCompletenessReport([
    { ...sourceMetadata, market: 'Netto', parser: 'retailer-v1', sourceUrl: 'https://example.test/netto?city=Zellingen&zip=97225' },
    { ...sourceMetadata, market: 'Aldi', parser: 'kaufda-v6', sourceUrl: 'https://example.test/aldi?city=Zellingen&zip=97225' },
  ]);

  assert.deepEqual(report.sources.map(source => source.scope.market), ['Aldi', 'Netto']);
  assert.equal(report.sources[0].scope.sourceUrl, 'https://example.test/aldi');
  assert.doesNotMatch(JSON.stringify(report), /Zellingen|97225|city|zip/i);
  assert.notEqual(report.sources[0].sourceKey, report.sources[1].sourceKey);
});

test('sorts source evidence deterministically without changing input snapshots', () => {
  const snapshots = [
    { ...sourceMetadata, market: 'Netto', fetchedAt: '2026-11-06T12:02:00.000Z' },
    { ...sourceMetadata, market: 'Aldi', fetchedAt: '2026-11-06T12:01:00.000Z' },
  ];
  const before = structuredClone(snapshots);
  const report = buildOfferSourceCompletenessReport(snapshots);

  assert.deepEqual(snapshots, before);
  assert.deepEqual(report.sources.map(source => source.scope.market), ['Aldi', 'Netto']);
  assert.deepEqual(report.summary, {
    total: 2,
    completeness: { complete: 0, partial: 0, unknown: 2 },
  });
});

test('reports the committed snapshots as unknown where no source expectation exists', async () => {
  const report = await readOfferSourceCompletenessReport(new URL('../generated/', import.meta.url));

  assert.ok(report.sources.length > 0);
  assert.equal(report.summary.total, report.sources.length);
  assert.ok(report.sources.every(source => source.completeness.status === 'unknown'));
  assert.ok(report.sources.every(source => source.completeness.expectedTotalOfferCount === null));
});

test('keeps the module independent from application and cloud writes', async () => {
  const source = await readFile(new URL('./market-completeness-evidence.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /localStorage|supabase|fetch\s*\(|writeFile|appendFile|unlink|UPDATE|INSERT/i);
});

