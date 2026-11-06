
import assert from 'node:assert/strict';
import { buildMarketCompletenessReport, assessMarketCompleteness, COMPLETENESS_STATES, LOAD_STATES, readOfferSnapshots } from './market-completeness.mjs';
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

test('reports a reached lazy-load target without claiming market completeness', () => {
  const result = assessMarketCompleteness(sourceMetadata);

  assert.equal(result.loadEvidence.status, LOAD_STATES.TARGET_REACHED);
  assert.deepEqual(result.loadEvidence, {
    status: LOAD_STATES.TARGET_REACHED,
    targetOfferCount: 410,
    loadedOfferCardCount: 428,
    targetReached: true,
    reason: 'Das explizite Ladeziel der Quelle wurde erreicht (428/410); dies belegt keine Markt- oder Prospektvollständigkeit.',
  });
  assert.equal(result.completeness.status, COMPLETENESS_STATES.UNKNOWN);
  assert.equal(result.completeness.expectedTotalOfferCount, null);
  assert.match(result.completeness.reason, /Gesamtvollständigkeit bleibt unbekannt/);
});

test('reports an unreached lazy-load target separately from completeness', () => {
  const result = assessMarketCompleteness({
    ...sourceMetadata,
    loadedOfferCardCount: 398,
    targetReached: false,
  });

  assert.equal(result.loadEvidence.status, LOAD_STATES.TARGET_NOT_REACHED);
  assert.equal(result.loadEvidence.targetOfferCount, 410);
  assert.equal(result.loadEvidence.loadedOfferCardCount, 398);
  assert.equal(result.completeness.status, COMPLETENESS_STATES.UNKNOWN);
});

test('marks completeness complete only with explicit source-scoped total counts', () => {
  const result = assessMarketCompleteness({
    ...sourceMetadata,
    sourceExpectedTotalCount: 428,
    sourceObservedTotalCount: 428,
  });

  assert.equal(result.completeness.status, COMPLETENESS_STATES.COMPLETE);
  assert.equal(result.completeness.expectedTotalOfferCount, 428);
  assert.equal(result.completeness.observedTotalOfferCount, 428);
  assert.match(result.completeness.reason, /ausdrücklich belegte Soll-Gesamtzahl/);
});

test('marks explicitly measured source totals partial when the total is not reached', () => {
  const result = assessMarketCompleteness({
    market: 'EDEKA',
    sourceExpectedTotalCount: 100,
    sourceObservedTotalCount: 98,
  });

  assert.equal(result.completeness.status, COMPLETENESS_STATES.PARTIAL);
  assert.equal(result.completeness.expectedTotalOfferCount, 100);
  assert.equal(result.completeness.observedTotalOfferCount, 98);
});

test('keeps completeness unknown when the source provides no expected total', () => {
  const result = assessMarketCompleteness({
    ...sourceMetadata,
    targetOfferCount: undefined,
    loadedOfferCardCount: undefined,
    targetReached: undefined,
  });

  assert.equal(result.loadEvidence.status, LOAD_STATES.UNKNOWN);
  assert.equal(result.completeness.status, COMPLETENESS_STATES.UNKNOWN);
  assert.equal(result.completeness.expectedTotalOfferCount, null);
  assert.equal(result.completeness.observedTotalOfferCount, null);
  assert.equal(result.recognizedOfferCount, 87);
});

test('never infers a source total from recognized offers or lazy-load targets', () => {
  const result = assessMarketCompleteness({
    market: 'Lidl',
    targetOfferCount: 1000,
    loadedOfferCardCount: 1004,
    targetReached: true,
    offers: [{ name: 'Kartoffeln' }, { name: 'Joghurt' }],
    recognizedCount: 2,
  });

  assert.equal(result.loadEvidence.status, LOAD_STATES.TARGET_REACHED);
  assert.equal(result.completeness.status, COMPLETENESS_STATES.UNKNOWN);
  assert.equal(result.completeness.expectedTotalOfferCount, null);
  assert.equal(result.recognizedOfferCount, 2);
});

test('does not treat zero as a source target and handles missing load metadata safely', () => {
  const result = assessMarketCompleteness({
    market: 'Kaufland',
    targetOfferCount: 0,
    targetReached: true,
    recognizedCount: 49,
  });

  assert.equal(result.loadEvidence.status, LOAD_STATES.UNKNOWN);
  assert.equal(result.loadEvidence.targetOfferCount, null);
  assert.equal(result.loadEvidence.loadedOfferCardCount, null);
  assert.equal(result.completeness.status, COMPLETENESS_STATES.UNKNOWN);
});

test('removes sensitive location query parameters from report source locations', () => {
  const result = assessMarketCompleteness({
    ...sourceMetadata,
    sourceUrl: 'https://www.kaufda.de/search?query=Aldi&lat=49.901699199999996&lng=9.812895&city=Zellingen&zip=97225',
  });

  assert.equal(result.sourceUrl, 'https://www.kaufda.de/search');
  assert.doesNotMatch(JSON.stringify(result), /lat|lng|city|zip|9\.812895|97225/i);
});

test('builds separate load and completeness summaries', () => {
  const report = buildMarketCompletenessReport([
    { ...sourceMetadata },
    { market: 'EDEKA', targetOfferCount: 10, loadedOfferCardCount: 8, targetReached: false },
    { market: 'Netto', sourceExpectedTotalCount: 10, sourceObservedTotalCount: 10 },
  ]);

  assert.deepEqual(report.summary, {
    load: { target_reached: 1, target_not_reached: 1, unknown: 1 },
    completeness: { complete: 1, partial: 0, unknown: 2 },
  });
  assert.deepEqual(report.markets.map(market => market.market), ['Aldi', 'EDEKA', 'Netto']);
});

test('reads committed offer snapshots without inventing source totals', async () => {
  const snapshots = await readOfferSnapshots(new URL('../generated/', import.meta.url));
  assert.ok(snapshots.length > 0);
  const report = buildMarketCompletenessReport(snapshots);
  assert.equal(report.markets.length, snapshots.length);

  snapshots.forEach((snapshot, index) => {
    assert.equal(report.markets[index].completeness.expectedTotalOfferCount, null, snapshot.market);
    assert.equal(report.markets[index].completeness.status, COMPLETENESS_STATES.UNKNOWN, snapshot.market);
  });
});

