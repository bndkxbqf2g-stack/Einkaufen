import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

test('describes market selection without claiming route optimization', () => {
  assert.ok(source.includes('Marktauswahl und Stopplimit werden aus deinen Einstellungen übernommen.'));
  assert.ok(source.includes('Marktauswahl: ${marketLabel} · maximal ${used.length} ${used.length === 1 ? \'Stopp\' : \'Stopps\'}. Routenoptimierung und Fahrtkosten bleiben offen.'));
  assert.equal(source.includes('Einkaufsroute: ${marketLabel}'), false);
});

test('keeps the published frontend synchronized with the source page', () => {
  assert.equal(published, source);
});

console.log('Market selection transparency checks passed');