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

console.log('Market stop recommendation checks passed');

