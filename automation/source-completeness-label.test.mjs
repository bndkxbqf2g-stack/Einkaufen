import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('keeps source completeness separate from loading targets', () => {
  assert.match(source, /Quellenvollständigkeit \$\{status\} \(\$\{observed\}\/\$\{expected\}\)/);
  assert.match(source, /Angebotsumfang unbekannt/);
  assert.match(source, /Ladeziel .* Gesamtumfang nicht belegt/);
});
