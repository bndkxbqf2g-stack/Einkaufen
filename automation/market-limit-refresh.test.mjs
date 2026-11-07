import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

test('wendet ein geändertes Marktlimit vor der Planneuberechnung an', () => {
  const handlerStart = source.indexOf("$('#marketsSelect').addEventListener('change'");
  const handlerEnd = source.indexOf('\n', handlerStart);
  assert.ok(handlerStart >= 0, 'Marktlimit-Handler muss vorhanden sein');
  const handler = source.slice(handlerStart, handlerEnd);
  assert.ok(handler.indexOf('persistSettings()') < handler.indexOf('renderPlan()'));
  assert.match(source, /const requestedLimit = Number\(settings\.markets\)/);
});

test('behält die veröffentlichte Datei bytegenau synchron', () => {
  assert.equal(published, source);
});

console.log('Market limit refresh checks passed');
