import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const packCountMatch = html.match(/function shoppingPackCount\(item, people\) \{[\s\S]*?\n    \}/);
assert.ok(packCountMatch, 'shoppingPackCount muss im App-Bundle vorhanden sein');
assert.match(html, /const packCount = shoppingPackCount\(item, people\);/);
const shoppingPackCount = new Function(`${packCountMatch[0]}; return shoppingPackCount;`)();

test('manuelle Artikel übernehmen eine optionale Packungszahl unabhängig von Personen', () => {
  assert.equal(shoppingPackCount({ manual: true, count: 1 }, 2), 1);
  assert.equal(shoppingPackCount({ manual: true, count: 1 }, 4), 1);
  assert.equal(shoppingPackCount({ manual: true, manualQuantity: 3 }, 2), 3);
  assert.equal(shoppingPackCount({ manual: true, manualQuantity: 3 }, 4), 3);
  assert.equal(shoppingPackCount({ manual: true, manualQuantity: 0 }, 2), 1);
});

test('Rezeptzutaten behalten die bisherige personenabhängige Skalierung', () => {
  assert.equal(shoppingPackCount({ count: 1 }, 2), 1);
  assert.equal(shoppingPackCount({ count: 1 }, 4), 2);
  assert.equal(shoppingPackCount({ count: 2 }, 3), 3);
});
