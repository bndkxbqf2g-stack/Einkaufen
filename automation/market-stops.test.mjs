import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [rootSource, publishedSource, appSource, publishedAppSource] = await Promise.all([
  readFile(new URL('../market-stops.js', import.meta.url), 'utf8'),
  readFile(new URL('../dist/market-stops.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
]);

function loadModel(source) {
  const context = {};
  runInNewContext(source, context);
  return context.AngebotskuecheMarketStopsModel;
}

const model = loadModel(rootSource);
const plain = value => JSON.parse(JSON.stringify(value));
const validInput = {
  baseBasketCents: 10_000,
  alternativeBasketCents: 8_000,
  travelCostCents: 300,
  minNetSavingsCents: 500,
  marketLimit: 2,
  selectedMarkets: ['Aldi'],
  additionalMarket: 'Lidl',
};

test('empfiehlt einen zusätzlichen Markt nur bei deutlicher Nettoersparnis', () => {
  assert.deepEqual(plain(model.recommendAdditionalMarket(validInput)), {
    recommended: true,
    status: 'recommended',
    reason: 'net-savings-exceeds-threshold',
    baseBasketCents: 10_000,
    alternativeBasketCents: 8_000,
    grossSavingsCents: 2_000,
    travelCostCents: 300,
    netSavingsCents: 1_700,
    thresholdCents: 500,
    marketLimit: 2,
    selectedMarkets: ['Aldi'],
    additionalMarket: 'Lidl',
  });
});

test('empfiehlt bei nicht erreichter Schwelle oder höheren Fahrtkosten keinen weiteren Stopp', () => {
  assert.equal(model.recommendAdditionalMarket({ ...validInput, alternativeBasketCents: 9_000, travelCostCents: 200, minNetSavingsCents: 800 }).status, 'not-recommended');
  assert.equal(model.recommendAdditionalMarket({ ...validInput, alternativeBasketCents: 9_000, travelCostCents: 1_200, minNetSavingsCents: 100 }).netSavingsCents, -200);
  assert.equal(model.recommendAdditionalMarket({ ...validInput, alternativeBasketCents: 9_000, travelCostCents: 1_200, minNetSavingsCents: 100 }).recommended, false);
});

test('behandelt fehlende, ungültige und unbekannte Werte konservativ', () => {
  assert.equal(model.recommendAdditionalMarket({ ...validInput, alternativeBasketCents: null }).status, 'unknown');
  assert.equal(model.recommendAdditionalMarket({ ...validInput, travelCostCents: -1 }).status, 'unknown');
  assert.equal(model.recommendAdditionalMarket({ ...validInput, minNetSavingsCents: 'unbekannt' }).status, 'unknown');
  assert.equal(model.recommendAdditionalMarket({ ...validInput, selectedMarkets: ['Aldi', 'aldi'] }).reason, 'insufficient-or-invalid-data');
  assert.equal(model.recommendAdditionalMarket({ ...validInput, additionalMarket: ' Aldi ' }).reason, 'invalid-market-assignment');
});

test('bleibt bei unsicherer Cent-Aggregation unknown und mutiert Eingaben nicht', () => {
  const input = {
    ...validInput,
    baseBasketCents: 0,
    alternativeBasketCents: Number.MAX_SAFE_INTEGER,
    travelCostCents: 1,
  };
  const before = structuredClone(input);
  const result = model.recommendAdditionalMarket(input);

  assert.equal(result.status, 'unknown');
  assert.equal(result.reason, 'unsafe-cent-aggregate');
  assert.equal(result.grossSavingsCents, null);
  assert.equal(result.netSavingsCents, null);
  assert.deepEqual(input, before);
});

test('beachtet das Marktlimit und verändert keine bestehenden Legacy-Felder', () => {
  const result = model.recommendAdditionalMarket({ ...validInput, marketLimit: 1 });
  assert.deepEqual({ status: result.status, reason: result.reason, netSavingsCents: result.netSavingsCents }, {
    status: 'not-recommended',
    reason: 'market-limit-reached',
    netSavingsCents: null,
  });
  assert.ok(appSource.includes("id=\"marketsSelect\""));
  assert.ok(appSource.includes("settings.markets"));
  assert.equal(publishedAppSource, appSource);
});

test('Root- und dist-Rechenkern bleiben bytegleich', () => {
  assert.equal(publishedSource, rootSource);
});


test('ordnet unbekannte Marktdistanzen deterministisch hinter bekannten Werten', () => {
  function loadSorter(source, marketDetails, selectedMarkets) {
    const helper = source.match(/function parseMarketDistanceKm\(value\) \{[\s\S]*?\n    \}/);
    const sorter = source.match(/function sortedSelectedMarkets\(\) \{[\s\S]*?\n    \}/);
    assert.ok(helper && sorter, 'market sorting helpers must remain directly testable');
    const factory = runInNewContext('(function() { ' + helper[0] + sorter[0] + ' return sortedSelectedMarkets; })', { marketDetails, settings: { selectedMarkets } });
    return factory()();
  }

  const marketDetails = {
    Aldi: { distance: '4,8 km' },
    Lidl: { distance: '6,2 km' },
    Tie: { distance: '4,8 km' },
    Bring: { distance: 'Cloud-Browser' },
  };
  const expected = ['Tie', 'Aldi', 'Lidl', 'Bring'];
  assert.deepEqual(loadSorter(appSource, marketDetails, ['Bring', 'Tie', 'Aldi', 'Lidl']), expected);
  assert.deepEqual(loadSorter(publishedAppSource, marketDetails, ['Bring', 'Tie', 'Aldi', 'Lidl']), expected);
});

test('kennzeichnet Anzeigeentfernungen ohne Routendaten eindeutig', () => {
  function loadDistanceLabel(source, value) {
    const helper = source.match(/function parseMarketDistanceKm\(value\) \{[\s\S]*?\n    \}/);
    const label = source.match(/function marketDistanceLabel\(value\) \{[\s\S]*?\n    \}/);
    assert.ok(helper && label, 'market distance labels must remain directly testable');
    const factory = runInNewContext('(function() { ' + helper[0] + label[0] + ' return marketDistanceLabel; })');
    return factory()(value);
  }

  assert.equal(loadDistanceLabel(appSource, '4,8 km'), '4,8 km · statische Anzeigeentfernung');
  assert.equal(loadDistanceLabel(appSource, 'Cloud-Browser'), 'Cloud-Browser · keine Routendaten');
  assert.equal(loadDistanceLabel(publishedAppSource, 'Cloud-Browser'), 'Cloud-Browser · keine Routendaten');
});
console.log('Market stop recommendation checks passed');



test('empfiehlt ohne ausgewählten Ausgangsmarkt keinen zusätzlichen Stopp', () => {
  const result = model.recommendAdditionalMarket({ ...validInput, selectedMarkets: [] });

  assert.equal(result.status, 'unknown');
  assert.equal(result.reason, 'insufficient-or-invalid-data');
  assert.equal(result.recommended, false);
});
