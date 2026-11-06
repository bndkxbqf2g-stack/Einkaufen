import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const parseMoneyMatch = html.match(/function parseKnownMoney\(value\) \{[\s\S]*?\n    \}/);
const offerAmountMatch = html.match(/function calculateOfferAmount\(items\) \{[\s\S]*?\n    \}/);
const formatEuroMatch = html.match(/function formatEuro\(value\) \{[\s\S]*?\n    \}/);
const shareAmountMatch = html.match(/function shoppingShareAmountLabel\(item\) \{[\s\S]*?\n    \}/);
assert.ok(parseMoneyMatch, 'parseKnownMoney muss im App-Bundle vorhanden sein');
assert.ok(offerAmountMatch, 'calculateOfferAmount muss im App-Bundle vorhanden sein');
assert.ok(formatEuroMatch, 'formatEuro muss im App-Bundle vorhanden sein');
assert.ok(shareAmountMatch, 'shoppingShareAmountLabel muss im App-Bundle vorhanden sein');

const shoppingShareAmountLabel = new Function(
  `${parseMoneyMatch[0]}\n${offerAmountMatch[0]}\n${formatEuroMatch[0]}\n${shareAmountMatch[0]}; return shoppingShareAmountLabel;`,
)();

test('shares known offer amounts with cent-accurate totals', () => {
  assert.equal(shoppingShareAmountLabel({ packCount: 3, offer: { price: '1,20 €' } }), '3,60 €');
  assert.equal(shoppingShareAmountLabel({ packCount: 2, offer: { price: '0,79 €' } }), '1,58 €');
});

test('keeps unknown prices explicit and does not invent missing offers', () => {
  assert.equal(shoppingShareAmountLabel({ packCount: 4, offer: { price: 'Preis unbekannt' } }), 'Preis unbekannt');
  assert.match(html, /const amountLabel = item\.offer \? shoppingShareAmountLabel\(item\) : 'ergänzen'/);
  assert.doesNotMatch(html, /formatEuro\(unitPrice \* packCount\)/);
});

console.log('Shopping share cost checks passed');
