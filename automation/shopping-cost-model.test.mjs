import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const parseMoneyMatch = html.match(/function parseKnownMoney\(value\) \{[\s\S]*?\n    \}/);
const offerAmountMatch = html.match(/function calculateOfferAmount\(items\) \{[\s\S]*?\n    \}/);
assert.ok(parseMoneyMatch, 'parseKnownMoney muss im App-Bundle vorhanden sein');
assert.ok(offerAmountMatch, 'calculateOfferAmount muss im App-Bundle vorhanden sein');
const parseKnownMoney = new Function(`${parseMoneyMatch[0]}; return parseKnownMoney;`)();
const calculateOfferAmount = new Function(`${parseMoneyMatch[0]}\n${offerAmountMatch[0]}; return calculateOfferAmount;`)();

test('parses only explicit positive euro amounts', () => {
  assert.equal(parseKnownMoney('2,49 €'), 2.49);
  assert.equal(parseKnownMoney('1.99 €'), 1.99);
  assert.equal(parseKnownMoney('ab 0,79 €'), 0.79);
  assert.equal(parseKnownMoney('0,00 €'), null);
  assert.equal(parseKnownMoney(''), null);
  assert.equal(parseKnownMoney('not a price'), null);
  assert.equal(parseKnownMoney('–'), null);
  assert.equal(parseKnownMoney('Preis unbekannt'), null);
});

test('calculates known offer amounts in cents and keeps unknown positions separate', () => {
  const result = calculateOfferAmount([
    { id: 'known', packCount: 3, offer: { price: '1,20 €' } },
    { id: 'unknown', packCount: 4, offer: { price: 'Preis unbekannt' } },
    { id: 'empty', packCount: 2, offer: { price: '' } },
    { id: 'invalid', packCount: 1, offer: { price: 'not a price' } },
  ]);

  assert.equal(result.totalCents, 360);
  assert.equal(result.total, 3.6);
  assert.deepEqual(result.knownItems.map(item => item.id), ['known']);
  assert.deepEqual(result.unknownItems.map(item => item.id), ['unknown', 'empty', 'invalid']);
});

test('keeps unknown offer prices out of the displayed subtotal and shared list', () => {
  assert.match(html, /Bekannter Angebotsbetrag/);
  assert.match(html, /const offerSummary = calculateOfferAmount\(offerItems\)/);
  assert.match(html, /knownOfferItems/);
  assert.match(html, /Unbekannte Preise sind im bekannten Angebotsbetrag nicht enthalten/);
  assert.match(html, /Preis unbekannt/);
  assert.doesNotMatch(html, /const pricedOfferItems =/);
});

console.log('Shopping cost model checks passed');
