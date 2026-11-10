import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const workerSource = await readFile(new URL('../worker/index.js', import.meta.url), 'utf8');
const dist = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const server = await readFile(new URL('../dist/server/index.js', import.meta.url), 'utf8');

test('zeigt fehlende Packungsgrößen ausdrücklich als unbekannt', () => {
  assert.match(source, /function offerPackSizeLabel[\s\S]*?Packungsgröße unbekannt/);
  assert.doesNotMatch(source, /item\.offer\.packSize \|\| '1 Packung'/);
  assert.doesNotMatch(source, /offer\.packSize \|\| '1 Packung'/);
  assert.match(workerSource, /function offerPackSize[\s\S]*?return match \?[^:]+: ''/);
  assert.doesNotMatch(workerSource, /packSize: String\(item\.packSize \|\| '1 Packung'\)/);
  assert.match(server, /Packungsgröße unbekannt/);
  assert.doesNotMatch(server, /packSize: String\(item\.packSize \|\| '1 Packung'\)/);
});

test('hält den veröffentlichten Plan-Bundle synchron', () => {
  assert.equal(dist, source);
});

console.log('Unknown offer package-size checks passed');
