import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('published worker serves the same shell artifacts as dist', async () => {
  const [workerModule, publishedIndex, publishedWorker] = await Promise.all([
    import('../dist/server/index.js'),
    readFile(resolve(root, 'dist/index.html'), 'utf8'),
    readFile(resolve(root, 'dist/sw.js'), 'utf8'),
  ]);
  const worker = workerModule.default;
  const page = await worker.fetch(new Request('https://app.example/'));
  const serviceWorker = await worker.fetch(new Request('https://app.example/sw.js'));

  assert.equal(await page.text(), publishedIndex);
  assert.equal(await serviceWorker.text(), publishedWorker);
});
