import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('uses the dinner meal day people for deterministic shopping quantities', () => {
  for (const relativePath of ['index.html', 'dist/index.html']) {
    const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
    assert.match(
      source,
      /people: meal\?\.people \?\? \(typeof getPlanPeople === 'function' \? getPlanPeople\(index\) : globalPeople\)/,
      relativePath,
    );
  }
});
