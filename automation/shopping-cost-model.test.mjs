import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const functionMatch = html.match(/function parseKnownMoney\(value\) \{[\s\S]*?\n    \}/);
assert.ok(functionMatch, 'parseKnownMoney muss im App-Bundle vorhanden sein');
const parseKnownMoney = new Function(`${functionMatch[0]}; return parseKnownMoney;`)();

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

test('keeps unknown offer prices out of the displayed subtotal and shared list', () => {
  assert.match(html, /Bekannter Angebotsbetrag/);
  assert.match(html, /knownOfferItems/);
  assert.match(html, /Unbekannte Preise sind im bekannten Angebotsbetrag nicht enthalten/);
  assert.match(html, /Preis unbekannt/);
  assert.doesNotMatch(html, /parseMoney\(item\.offer\.price\)\s*\*\s*\(item\.packCount/);
});

console.log('Shopping cost model checks passed');
