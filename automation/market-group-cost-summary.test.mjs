import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [rootHtml, distHtml, costSource] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../shopping-costs.js', import.meta.url), 'utf8'),
]);

assert.equal(distHtml, rootHtml, 'Root- und dist-Bundle müssen synchron sein');

const browserGlobal = {};
runInNewContext(costSource, browserGlobal);
const costModel = browserGlobal.AngebotskuecheCostModel;
const match = distHtml.match(/function formatShoppingGroupOfferSummary\([^)]*\) \{[\s\S]*?\n    \}/);
assert.ok(match, 'Marktgruppen-Kostenzusammenfassung muss im Bundle vorhanden sein');

const formatEuro = value => `${Number(value).toFixed(2).replace('.', ',')} €`;
const parseKnownMoney = value => value === '1,20 €' || value === '2,49 €'
  ? Number(value.replace(',', '.').replace(' €', ''))
  : null;
const isShoppingOfferCostUsable = offer => offer?.price === '1,20 €';
const formatGroupSummary = new Function(
  'calculateOfferAmount',
  'formatEuro',
  'parseKnownMoney',
  'isShoppingOfferCostUsable',
  `${match[0]}
return formatShoppingGroupOfferSummary;`,
)(
  costModel.calculateOfferAmount,
  formatEuro,
  parseKnownMoney,
  isShoppingOfferCostUsable,
);

test('zeigt in Marktgruppen nur verifizierte Angebotspreise als bekannte Summe', () => {
  const summary = formatGroupSummary('Aldi', [
    { id: 'verified', packCount: 1, offer: { price: '1,20 €' } },
    { id: 'uncertain', packCount: 1, offer: { price: '2,49 €' } },
  ]);

  assert.match(summary, /Bekannte Angebotssumme 1,20 €/);
  assert.match(summary, /1 Preis unbekannt/);
});

test('zeigt für Ergänzen keine Markt- oder Preissumme', () => {
  assert.equal(formatGroupSummary('Ergänzen', []), '');
});
