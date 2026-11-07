import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [clientSource, workerSource, workerPublished] = await Promise.all([
  readFile(new URL('../supabase-sync.js', import.meta.url), 'utf8'),
  readFile(new URL('../worker/index.js', import.meta.url), 'utf8'),
  readFile(new URL('../dist/server/index.js', import.meta.url), 'utf8'),
]);

function extractList(source, declaration) {
  const match = source.match(new RegExp(`\\b${declaration}\\s*=\\s*\\[([^\\]]*)\\]`));
  assert.ok(match, `${declaration} must be present`);
  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map(matchItem => matchItem[1]);
}

test('keeps client and worker array/object payload contracts aligned', () => {
  assert.deepEqual(
    extractList(clientSource, 'ARRAY_KEYS'),
    extractList(workerSource, 'arrays'),
  );
  assert.deepEqual(
    extractList(clientSource, 'OBJECT_KEYS'),
    extractList(workerSource, 'objects'),
  );
});

test('keeps the published worker contract aligned with its source', () => {
  assert.deepEqual(
    extractList(workerSource, 'arrays'),
    extractList(workerPublished, 'arrays'),
  );
  assert.deepEqual(
    extractList(workerSource, 'objects'),
    extractList(workerPublished, 'objects'),
  );
});

console.log('Sync contract parity checks passed');
