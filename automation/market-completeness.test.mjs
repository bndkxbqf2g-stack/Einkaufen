
import assert from 'node:assert/strict';
import { buildMarketCompletenessReport, assessMarketCompleteness, COMPLETENESS_STATES, readOfferSnapshots } from './market-completeness.mjs';
import test from 'node:test';

const sourceMetadata = {
  market: 'Aldi',
  store: 'ALDI SÜD',
  sourceUrl: 'https://example.test/aldi',
  fetchedAt: '2026-11-06T12:00:00.000Z',
  validUntil: '12.11.2026',
  parser: 'kaufda-offer-cards-v6',
  recognizedCount: 87,
  targetOfferCount: 410,
  loadedOfferCardCount: 428,
  targetReached: true,
  offers: Array.from({ length: 87 }, () => ({ name: 'Kartoffeln' })),
};

test('marks a source complete only when its explicit target is reached', () => {
  const result = assessMarketCompleteness(sourceMetadata);

  assert.equal(result.status, COMPLETENESS_STATES.COMPLETE);
  assert.deepEqual(result.evidence, {
    expectedOfferCount: 410,
    loadedOfferCardCount: 428,
    recognizedOfferCount: 87,
    targetReached: true,
  });
  assert.match(result.reason, /410/);
});

test('marks a source partial when the source explicitly reports an unreached target', () => {
  const result = assessMarketCompleteness({
    ...sourceMetadata,
    loadedOfferCardCount: 398,
    targetReached: false,
  });

  assert.equal(result.status, COMPLETENESS_STATES.PARTIAL);
  assert.equal(result.evidence.expectedOfferCount, 410);
  assert.equal(result.evidence.loadedOfferCardCount, 398);
});

test('keeps completeness unknown when the source provides no expected count', () => {
  const result = assessMarketCompleteness({
    ...sourceMetadata,
    targetOfferCount: undefined,
    loadedOfferCardCount: undefined,
    targetReached: undefined,
  });

  assert.equal(result.status, COMPLETENESS_STATES.UNKNOWN);
  assert.equal(result.evidence.expectedOfferCount, null);
  assert.equal(result.evidence.loadedOfferCardCount, null);
  assert.equal(result.evidence.recognizedOfferCount, 87);
  assert.match(result.reason, /unbekannt/);
});

test('never infers an expected count from recognized offers', () => {
  const result = assessMarketCompleteness({
    market: 'Lidl',
    offers: [{ name: 'Kartoffeln' }, { name: 'Joghurt' }],
    recognizedCount: 2,
  });

  assert.equal(result.status, COMPLETENESS_STATES.UNKNOWN);
  assert.equal(result.evidence.expectedOfferCount, null);
  assert.equal(result.evidence.recognizedOfferCount, 2);
});

test('does not treat zero as a source target and handles a missing loaded count safely', () => {
  const result = assessMarketCompleteness({
    market: 'Kaufland',
    targetOfferCount: 0,
    targetReached: true,
    recognizedCount: 49,
  });

  assert.equal(result.status, COMPLETENESS_STATES.UNKNOWN);
  assert.equal(result.evidence.expectedOfferCount, null);
  assert.equal(result.evidence.loadedOfferCardCount, null);
});

test('builds a stable report and summary for all snapshots', () => {
  const report = buildMarketCompletenessReport([
    sourceMetadata,
    { market: 'EDEKA', recognizedCount: 68, offers: Array.from({ length: 68 }, () => ({})) },
    { market: 'Netto', targetOfferCount: 10, loadedOfferCardCount: 8, targetReached: false },
  ]);

  assert.deepEqual(report.summary, { complete: 1, partial: 1, unknown: 1 });
  assert.deepEqual(report.markets.map(market => market.market), ['Aldi', 'EDEKA', 'Netto']);
});

test('reads committed offer snapshots without inventing source targets', async () => {
  const snapshots = await readOfferSnapshots(new URL('../generated/', import.meta.url));
  assert.ok(snapshots.length > 0);
  const report = buildMarketCompletenessReport(snapshots);
  assert.equal(report.markets.length, snapshots.length);

  snapshots.forEach((snapshot, index) => {
    if (snapshot.targetOfferCount === undefined || snapshot.targetOfferCount === null || snapshot.targetOfferCount === 0) {
      assert.equal(report.markets[index].evidence.expectedOfferCount, null, snapshot.market);
    }
  });
});

