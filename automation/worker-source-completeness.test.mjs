import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../worker/index.js', import.meta.url), 'utf8');

test('worker forwards only validated source completeness metadata', () => {
  assert.match(source, /function sourceCompletenessMetadata\(value\)/);
  assert.match(source, /Number\.isInteger\(expected\) && expected > 0/);
  assert.match(source, /Number\.isInteger\(observed\) && observed >= 0 && observed <= expected/);
  assert.match(source, /\.\.\.sourceCompletenessMetadata\(payload\)/);
  assert.match(source, /\.\.\.sourceCompletenessMetadata\(parsed\)/);
});
