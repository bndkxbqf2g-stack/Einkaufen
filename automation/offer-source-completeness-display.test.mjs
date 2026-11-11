import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

assert.equal(published, source, 'published bundle must stay byte-identical to the source');

const helperMatch = source.match(/    function offerCoverageLabel\([^)]*\) \{[\s\S]*?\n    \}/);
assert.ok(helperMatch, 'offerCoverageLabel must be present in the app bundle');

const context = {};
vm.runInNewContext(`${helperMatch[0]}
globalThis.offerCoverageLabel = offerCoverageLabel;`, context);
const { offerCoverageLabel } = context;

test('shows complete or partial source completeness only for explicit valid totals', () => {
  assert.equal(offerCoverageLabel({
    sourceExpectedTotalCount: 428,
    sourceObservedTotalCount: 428,
  }), 'Quellenvollständigkeit belegt (428/428)');

  assert.equal(offerCoverageLabel({
    sourceExpectedTotalCount: 100,
    sourceObservedTotalCount: 98,
  }), 'Quellenvollständigkeit teilweise belegt (98/100)');
});

test('keeps missing and invalid source totals unknown', () => {
  for (const live of [
    {},
    { sourceObservedTotalCount: 98 },
    { sourceExpectedTotalCount: 100 },
    { sourceExpectedTotalCount: 0, sourceObservedTotalCount: 0 },
    { sourceExpectedTotalCount: -1, sourceObservedTotalCount: 100 },
    { sourceExpectedTotalCount: 100, sourceObservedTotalCount: -1 },
    { sourceExpectedTotalCount: 100, sourceObservedTotalCount: 101 },
    { sourceExpectedTotalCount: '100', sourceObservedTotalCount: 98 },
    { sourceExpectedTotalCount: 100, sourceObservedTotalCount: '98' },
  ]) {
    assert.equal(offerCoverageLabel(live), 'Angebotsumfang unbekannt');
  }
});

test('never promotes load or recognized counts to source completeness', () => {
  const targetReached = {
    targetOfferCount: 1000,
    loadedOfferCardCount: 1004,
    targetReached: true,
  };
  assert.equal(
    offerCoverageLabel(targetReached),
    '1.004 Karten geladen; Ladeziel 1.000 erreicht, Gesamtumfang nicht belegt',
  );
  assert.equal(
    offerCoverageLabel({ recognizedCount: 1004 }),
    'Angebotsumfang unbekannt',
  );

  assert.equal(
    offerCoverageLabel({
      ...targetReached,
      sourceExpectedTotalCount: 100,
      sourceObservedTotalCount: 98,
    }),
    'Quellenvollständigkeit teilweise belegt (98/100)',
  );
});

assert.match(source, /sourceExpectedTotalCount: result\.payload\.sourceExpectedTotalCount/);
assert.match(source, /sourceObservedTotalCount: result\.payload\.sourceObservedTotalCount/);

console.log('Offer source completeness display checks passed');
