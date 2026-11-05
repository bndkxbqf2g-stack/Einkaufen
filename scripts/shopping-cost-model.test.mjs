import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const moneyFunctionMatch = html.match(/function parseMoney\(value\) \{[\s\S]*?\n     \}/);
const functionMatch = html.match(/function parseKnownMoney\(value\) \{[\s\S]*?\n     \}/);
assert(moneyFunctionMatch, 'parseMoney muss im App-Bundle vorhanden sein');
assert(functionMatch, 'parseKnownMoney muss im App-Bundle vorhanden sein');
const parseKnownMoney = new Function(`${moneyFunctionMatch[0]}\n${functionMatch[0]}; return parseKnownMoney;`)();

assert.equal(parseKnownMoney('2,49 €'), 2.49);
assert.equal(parseKnownMoney('1.99 €'), 1.99);
assert.equal(parseKnownMoney('–'), null);
assert.equal(parseKnownMoney('Preis unbekannt'), null);
assert.match(html, /Bekannter Angebotsbetrag/);
assert.match(html, /Angebotsanker ohne Preisstatus · nicht geschätzt/);

console.log('Shopping cost model checks passed');

