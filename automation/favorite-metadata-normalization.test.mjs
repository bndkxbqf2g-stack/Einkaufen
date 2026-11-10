import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const dist = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const normalizationMatch = source.match(/favorites = favorites\.map\(item => \{[\s\S]*?\r?\n    \}\);/);

assert.ok(normalizationMatch, 'favorite normalization must be present');

test('behält unbekannte Dauer- und Aufwandswerte persönlicher Favoriten offen', () => {
  assert.match(normalizationMatch[0], /time: normalizeMealDuration\(item\.time\)/);
  assert.match(normalizationMatch[0], /difficulty: typeof item\.difficulty === 'string'/);
  assert.doesNotMatch(normalizationMatch[0], /time: item\.time \|\| builtIn\.time/);
  assert.doesNotMatch(normalizationMatch[0], /difficulty: item\.difficulty \|\| builtIn\.difficulty/);
});

test('hält den veröffentlichten Plan-Bundle synchron', () => {
  assert.equal(dist, source);
});

console.log('Favorite metadata normalization checks passed');
