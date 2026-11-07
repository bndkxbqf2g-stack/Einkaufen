import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const dinnerStart = source.indexOf('function renderDinnerCard');
const dinnerEnd = source.indexOf('function renderPlan', dinnerStart);
const dinnerRenderer = source.slice(dinnerStart, dinnerEnd);

test('does not turn an unknown dinner price into zero euros', () => {
  assert.match(dinnerRenderer, /const cost = parseKnownMoney\(dinner\.cost\);/);
  assert.match(dinnerRenderer, /const costLabel = cost === null \? 'Preis unbekannt'/);
  assert.equal(dinnerRenderer.includes('(cost * (people / 2)).toFixed'), false);
});

test('keeps the published frontend synchronized with the source page', () => {
  assert.equal(published, source);
});

console.log('Dinner cost transparency checks passed');