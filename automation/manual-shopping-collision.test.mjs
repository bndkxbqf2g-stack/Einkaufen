import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('keeps a manual article when a recipe article has the same normalized key', () => {
  for (const relativePath of ['index.html', 'dist/index.html']) {
    const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
    assert.ok(source.includes('let manualKey = key;'));
    assert.ok(source.includes('while (items.has(manualKey))'));
    assert.ok(source.includes('items.set(manualKey'));
  }
});
