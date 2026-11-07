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
const shareAmountMatch = html.match(/function shoppingShareAmountLabel\(item\) \{[\s\S]*?\n    \}/);
const shareSummaryMatch = html.match(/function shoppingShareSummary\(items\) \{[\s\S]*?\n    \}/);
assert.ok(parseMoneyMatch, 'parseKnownMoney muss im App-Bundle vorhanden sein');
assert.ok(formatEuroMatch, 'formatEuro muss im App-Bundle vorhanden sein');
assert.ok(shareAmountMatch, 'shoppingShareAmountLabel muss im App-Bundle vorhanden sein');
assert.ok(shareSummaryMatch, 'shoppingShareSummary muss im App-Bundle vorhanden sein');

const shoppingShareFunctions = new Function(
  `${parseMoneyMatch[0]}\n${offerAmountMatch[0]}\n${formatEuroMatch[0]}\n${shareAmountMatch[0]}\n${shareSummaryMatch[0]}; return { shoppingShareAmountLabel, shoppingShareSummary };`,
)();

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
    'Bekannter Angebotsbetrag 3,60 € · 1 Preis unbekannt · Kassenbetrag offen',
  );
  assert.match(html, /shoppingShareSummary\(pending\)/);
  assert.match(html, /Fehlende Artikel und Vorräte sind nicht enthalten/);
});

test('keeps unknown prices explicit and does not invent missing offers', () => {
  assert.equal(shoppingShareAmountLabel({ packCount: 4, offer: { price: 'Preis unbekannt' } }), 'Preis unbekannt');
  assert.match(html, /const amountLabel = item\.offer \? shoppingShareAmountLabel\(item\) : 'ergänzen'/);
  assert.doesNotMatch(html, /formatEuro\(unitPrice \* packCount\)/);
});

console.log('Shopping share cost checks passed');
