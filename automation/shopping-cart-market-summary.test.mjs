import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [html, publishedHtml, costSource] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../shopping-costs.js', import.meta.url), 'utf8'),
]);

const parseMoneyMatch = html.match(/function parseKnownMoney\(value\) \{[\s\S]*?\n    \}/);
const formatEuroMatch = html.match(/function formatEuro\(value\) \{[\s\S]*?\n    \}/);
const shareSummaryMatch = html.match(/function shoppingShareSummary\(items\) \{[\s\S]*?\n    \}/);
const groupSummaryMatch = html.match(/function formatShoppingGroupOfferSummary\(group, items\) \{[\s\S]*?\n    \}/);
assert.ok(parseMoneyMatch && formatEuroMatch && shareSummaryMatch && groupSummaryMatch);

const costGlobal = {};
runInNewContext(costSource, costGlobal);
const costModel = costGlobal.AngebotskuecheCostModel;
const parseKnownMoney = new Function(`${parseMoneyMatch[0]}; return parseKnownMoney;`)();
const formatEuro = new Function(`${formatEuroMatch[0]}; return formatEuro;`)();
const getShoppingCostSummary = items => costModel.summarizeShoppingCosts(items, parseKnownMoney);
const shoppingShareSummary = new Function(
  'getShoppingCostSummary',
  'formatEuro',
  `${shareSummaryMatch[0]}; return shoppingShareSummary;`,
)(getShoppingCostSummary, formatEuro);
const formatShoppingGroupOfferSummary = new Function(
  'calculateOfferAmount',
  'calculateOfferComparison',
  'parseKnownMoney',
  'isShoppingOfferCostUsable',
  'formatEuro',
  `${groupSummaryMatch[0]}; return formatShoppingGroupOfferSummary;`,
)(costModel.calculateOfferAmount, costModel.calculateOfferComparison, parseKnownMoney, () => true, formatEuro);

test('hält gemischte Mittag-/Abendessen-Positionen in Kosten- und geteilter Liste getrennt nachvollziehbar', () => {
  const sharedLunchDinner = {
    id: 'milk-lunch-dinner',
    name: 'Milch',
    meals: ['Mittagessen', 'Abendessen'],
    count: 2,
    packCount: 3,
    offer: { store: 'Aldi', price: '1,20 €', regularPrice: '1,50 €' },
  };
  const unknownOffer = {
    id: 'bread-lunch',
    name: 'Brot',
    meals: ['Mittagessen'],
    count: 1,
    packCount: 1,
    offer: { store: 'Lidl', price: 'Preis unbekannt', regularPrice: '–' },
  };
  const manual = { id: 'manual-dinner', name: 'Küchenrolle', meals: ['Abendessen'], count: 1, packCount: 1, manual: true, offer: null };
  const unanchored = { id: 'unanchored-dinner', name: 'Zwiebeln', meals: ['Abendessen'], count: 1, packCount: 1, offer: null };
  const items = [sharedLunchDinner, unknownOffer, manual, unanchored];
  const summary = getShoppingCostSummary(items);

  assert.equal(summary.itemCount, 4);
  assert.equal(summary.knownOfferTotalCents, 360);
  assert.equal(summary.knownOfferPackCount, 3);
  assert.equal(summary.knownOfferCount, 1);
  assert.equal(summary.unknownPriceCount, 1);
  assert.equal(summary.manualMissingCount, 1);
  assert.equal(summary.unanchoredMissingCount, 1);
  assert.equal(summary.knownOfferCoveragePercent, 25);
  assert.equal(summary.knownComparisonTotalCents, 360);
  assert.equal(summary.knownSavingsCents, 90);

  assert.equal(
    shoppingShareSummary(items),
    'Bekannter Angebotsbetrag 3,60 € · 1 Preis unbekannt · Regulärer Vergleichsanteil 4,50 € · rechnerische Differenz 0,90 € · 1 Vergleichspreis unbekannt · 1 manueller Artikel ohne Angebotsanker · 1 weiterer Artikel ohne Angebotsanker · Kassenbetrag offen',
  );
  assert.equal(
    formatShoppingGroupOfferSummary('Aldi', [sharedLunchDinner]),
    'Bekannte Angebotssumme 3,60 € · Regulärer Vergleichsanteil 4,50 € · Differenz 0,90 €',
  );
  assert.equal(formatShoppingGroupOfferSummary('Lidl', [unknownOffer]), '1 Preis unbekannt · 1 Vergleichspreis unbekannt');
  assert.equal(formatShoppingGroupOfferSummary('Ergänzen', [manual, unanchored]), '');
});

test('Root- und dist-App bleiben für den Warenkorb-/Marktgruppenpfad synchron', () => {
  assert.equal(publishedHtml, html);
});

console.log('Shopping cart market summary checks passed');
