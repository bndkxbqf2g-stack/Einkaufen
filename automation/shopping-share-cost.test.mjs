import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const modelSource = await readFile(new URL('../shopping-costs.js', import.meta.url), 'utf8');
const browserGlobal = {};
runInNewContext(modelSource, browserGlobal);
const costModel = browserGlobal.AngebotskuecheCostModel;
const parseMoneyMatch = html.match(/function parseKnownMoney\(value\) \{[\s\S]*?\n    \}/);
const formatEuroMatch = html.match(/function formatEuro\(value\) \{[\s\S]*?\n    \}/);
const costSummaryMatch = html.match(/function getShoppingCostSummary\(items = getShoppingItems\(\)\) \{[\s\S]*?\n    \}/);
const shareAmountMatch = html.match(/function shoppingShareAmountLabel\(item\) \{[\s\S]*?\n    \}/);
const shareSummaryMatch = html.match(/function shoppingShareSummary\(items\) \{[\s\S]*?\n    \}/);
assert.ok(parseMoneyMatch, 'parseKnownMoney muss im App-Bundle vorhanden sein');
assert.ok(formatEuroMatch, 'formatEuro muss im App-Bundle vorhanden sein');
assert.ok(costSummaryMatch, 'getShoppingCostSummary muss im App-Bundle vorhanden sein');
assert.ok(shareAmountMatch, 'shoppingShareAmountLabel muss im App-Bundle vorhanden sein');
assert.ok(shareSummaryMatch, 'shoppingShareSummary muss im App-Bundle vorhanden sein');

const parseKnownMoney = new Function(`${parseMoneyMatch[0]}; return parseKnownMoney;`)();
const calculateOfferAmount = items => costModel.calculateOfferAmount(items, parseKnownMoney);
const getShoppingCostSummary = items => costModel.summarizeShoppingCosts(items, parseKnownMoney);
const shoppingShareFunctions = new Function('calculateOfferAmount', 'getShoppingCostSummary', `${formatEuroMatch[0]}\n${shareAmountMatch[0]}\n${shareSummaryMatch[0]}; return { shoppingShareAmountLabel, shoppingShareSummary };`)(calculateOfferAmount, getShoppingCostSummary);

const { shoppingShareAmountLabel, shoppingShareSummary } = shoppingShareFunctions;

test('shares known offer amounts with cent-accurate totals', () => {
  assert.equal(shoppingShareAmountLabel({ packCount: 3, offer: { price: '1,20 €' } }), '3,60 €');
  assert.equal(shoppingShareAmountLabel({ packCount: 2, offer: { price: '0,79 €' } }), '1,58 €');
});

test('shares the known subtotal and open cash boundary explicitly', () => {
  assert.equal(
    shoppingShareSummary([
      { packCount: 3, offer: { price: '1,20 €' } },
      { packCount: 1, offer: { price: 'Preis unbekannt' } },
    ]),
    'Bekannter Angebotsbetrag 3,60 € · 1 Preis unbekannt · 2 Vergleichepreise unbekannt · Kassenbetrag offen',
  );
  assert.match(html, /shoppingShareSummary\(pending\)/);
  assert.match(html, /Fehlende Artikel und Vorräte sind nicht enthalten/);
});

test('keeps manual and unanchored items explicit in a shared list summary', () => {
  assert.equal(
    shoppingShareSummary([
      { packCount: 1, offer: { price: '2,49 €' } },
      { packCount: 1, offer: null, manual: true },
      { packCount: 1, offer: null },
    ]),
    'Bekannter Angebotsbetrag 2,49 € · 1 Vergleichspreis unbekannt · 1 manueller Artikel ohne Angebotsanker · 1 weiterer Artikel ohne Angebotsanker · Kassenbetrag offen',
  );
});

test('keeps unknown prices explicit and does not invent missing offers', () => {
  assert.equal(shoppingShareAmountLabel({ packCount: 4, offer: { price: 'Preis unbekannt' } }), 'Preis unbekannt');
  assert.match(html, /const amountLabel = item\.offer \? shoppingShareAmountLabel\(item\) : 'ergänzen'/);
  assert.doesNotMatch(html, /formatEuro\(unitPrice \* packCount\)/);
});

test('offers market-scoped progress actions without changing the checklist contract', () => {
  assert.match(html, /data-shopping-group-check/);
  assert.match(html, /data-shopping-group-state="check"/);
  assert.match(html, /data-shopping-group-state="clear"/);
  assert.match(html, /getShoppingItems\(\)\.filter\(item => \(item\.offer\?\.store \|\| 'Ergänzen'\) === group\)/);
  assert.match(html, /localStorage\.setItem\('angebotskueche\.shoppingChecks', JSON\.stringify\(shoppingChecks\)\)/);
  assert.match(html, /itemNote = `\$\{checkedCount\}\/\$\{groupItems\.length\} erledigt/);
});
console.log('Shopping share cost checks passed');


test('teilt verifizierte Vergleichssumme getrennt vom Angebotsbetrag', () => {
  assert.equal(
    shoppingShareSummary([
      { packCount: 2, offer: { price: '1,20 €', regularPrice: '1,50 €' } },
      { packCount: 1, offer: { price: '0,89 €', regularPrice: '–' } },
    ]),
    'Bekannter Angebotsbetrag 3,29 € · Regulärer Vergleichsanteil 3,00 € · rechnerische Differenz 0,60 € · 1 Vergleichspreis unbekannt · Kassenbetrag offen',
  );
});
