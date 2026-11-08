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
const marketSummaryMatch = html.match(/function formatShoppingGroupOfferSummary\(group, items\) \{[\s\S]*?\n    \}/);
assert.ok(parseMoneyMatch, 'parseKnownMoney muss im App-Bundle vorhanden sein');
assert.ok(formatEuroMatch, 'formatEuro muss im App-Bundle vorhanden sein');
assert.ok(marketSummaryMatch, 'formatShoppingGroupOfferSummary muss im App-Bundle vorhanden sein');
const parseKnownMoney = new Function(`${parseMoneyMatch[0]}; return parseKnownMoney;`)();
const calculateOfferAmount = items => costModel.calculateOfferAmount(items, parseKnownMoney);
const formatShoppingGroupOfferSummary = new Function('calculateOfferAmount', `${formatEuroMatch[0]}\n${marketSummaryMatch[0]}; return formatShoppingGroupOfferSummary;`)(calculateOfferAmount);

test('parses only explicit positive euro amounts', () => {
  assert.equal(parseKnownMoney('2,49 €'), 2.49);
  assert.equal(parseKnownMoney('1.99 €'), 1.99);
  assert.equal(parseKnownMoney('ab 0,79 €'), 0.79);
  assert.equal(parseKnownMoney('-1,99 €'), null);
  assert.equal(parseKnownMoney('−1,99 €'), null);
  assert.equal(parseKnownMoney('– 1,99 €'), null);
  assert.equal(parseKnownMoney('1.234 €'), 1234);
  assert.equal(parseKnownMoney('1.234,56 €'), 1234.56);
  assert.equal(parseKnownMoney('1,234 €'), null);
  assert.equal(parseKnownMoney('12.345.678 €'), 12345678);
  assert.equal(parseKnownMoney('2,49 € - 0,50 €'), 2.49);
  assert.equal(parseKnownMoney('0,00 €'), null);
  assert.equal(parseKnownMoney('2,49 €/kg'), null);
  assert.equal(parseKnownMoney('2,49 € / 100 g'), null);
  assert.equal(parseKnownMoney('2,49 € pro kg'), null);
  assert.equal(parseKnownMoney('2,49 € pro Kilogramm'), null);
  assert.equal(parseKnownMoney('1,99 € pro Liter'), null);
  assert.equal(parseKnownMoney('1,99 € pro 1 Liter'), null);
  assert.equal(parseKnownMoney('1,99 € je Liter'), null);
  assert.equal(parseKnownMoney('1,99 € / Liter'), null);
  assert.equal(parseKnownMoney('0,39 € je 100 Milliliter'), null);
  assert.equal(parseKnownMoney('0,39 € je 100 Gramm'), null);
  assert.equal(parseKnownMoney('2,49 € (500 g Packung)'), 2.49);
  assert.equal(parseKnownMoney('2,49 € je 500 g Packung'), 2.49);
  assert.equal(parseKnownMoney('2,49 € pro 500 g Packung'), 2.49);
  assert.equal(parseKnownMoney('2,49 € je 500 ml Flasche'), 2.49);
  assert.equal(parseKnownMoney('2,49 € (1 kg = 4,98 €/kg)'), 2.49);
  assert.equal(parseKnownMoney(''), null);
  assert.equal(parseKnownMoney('not a price'), null);
  assert.equal(parseKnownMoney('–'), null);
  assert.equal(parseKnownMoney('Preis unbekannt'), null);
});

test('keeps unit-price denominators out of known purchase amounts', () => {
  const result = calculateOfferAmount([
    { id: 'unit-price', packCount: 2, offer: { price: '2,49 €/kg' } },
  ]);

  assert.equal(result.totalCents, 0);
  assert.equal(result.knownItems.length, 0);
  assert.deepEqual(Array.from(result.unknownItems, item => item.id), ['unit-price']);
});

test('does not count a negative euro amount as a purchasable offer price', () => {
  const result = calculateOfferAmount([
    { id: 'negative', packCount: 1, offer: { price: '−1,99 €' } },
  ]);

  assert.equal(result.totalCents, 0);
  assert.equal(result.knownItems.length, 0);
  assert.deepEqual(Array.from(result.unknownItems, item => item.id), ['negative']);
});

test('normalizes explicit German thousands groups and rejects unsupported decimal precision', () => {
  const result = calculateOfferAmount([
    { id: 'grouped-whole', packCount: 1, offer: { price: '1.234 €' } },
    { id: 'grouped-cents', packCount: 1, offer: { price: '1.234,56 €' } },
    { id: 'ambiguous-comma', packCount: 1, offer: { price: '1,234 €' } },
  ]);

  assert.equal(result.totalCents, 246856);
  assert.deepEqual(Array.from(result.knownItems, item => item.id), ['grouped-whole', 'grouped-cents']);
  assert.deepEqual(Array.from(result.unknownItems, item => item.id), ['ambiguous-comma']);
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
  assert.deepEqual(Array.from(result.knownItems, item => item.id), ['known']);
  assert.deepEqual(Array.from(result.unknownItems, item => item.id), ['unknown', 'empty', 'invalid']);
});

test('does not format absent or non-finite amounts as a zero price', () => {
  const formatEuro = new Function(`${formatEuroMatch[0]}; return formatEuro;`)();

  assert.equal(formatEuro(null), '–');
  assert.equal(formatEuro(undefined), '–');
  assert.equal(formatEuro(Number.NaN), '–');
  assert.equal(formatEuro(0), '0,00 €');
});

test('keeps unknown offer prices out of the displayed subtotal and shared list', () => {
  assert.match(html, /Bekannter Angebotsbetrag/);
  assert.match(html, /return window\.AngebotskuecheCostModel\.summarizeShoppingCosts\(items, parseKnownMoney\)/);
  assert.match(html, /knownOfferItems/);
  assert.match(html, /function getShoppingCostSummary\(items = getShoppingItems\(\)\)/);
  assert.match(html, /const costSummary = getShoppingCostSummary\(items\)/);
  assert.match(html, /Unbekannte Preise sind im bekannten Angebotsbetrag nicht enthalten/);
  assert.match(html, /Preis unbekannt/);
  assert.doesNotMatch(html, /const pricedOfferItems =/);
});

test('shows each market subtotal in cents and keeps unknown prices visible', () => {
  const aldiSummary = formatShoppingGroupOfferSummary('Aldi', [
    { id: 'known', packCount: 2, offer: { price: '1,20 €' } },
    { id: 'unknown', packCount: 1, offer: { price: 'Preis unbekannt' } },
  ]);
  const lidlSummary = formatShoppingGroupOfferSummary('Lidl', [
    { id: 'known', packCount: 3, offer: { price: '0,89 €' } },
  ]);

  assert.equal(aldiSummary, 'Bekannte Angebotssumme 2,40 € · 1 Preis unbekannt');
  assert.equal(lidlSummary, 'Bekannte Angebotssumme 2,67 €');
  assert.equal(formatShoppingGroupOfferSummary('Aldi', [{ offer: { price: '' } }]), '1 Preis unbekannt');
  assert.equal(formatShoppingGroupOfferSummary('Ergänzen', [{ offer: null }]), '');
  assert.match(html, /renderShoppingGroupHeader\(group, groupItems\)/);
});

console.log('Shopping cost model checks passed');
