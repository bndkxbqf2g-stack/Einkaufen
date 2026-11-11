import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePaths = ['index.html', 'dist/index.html', 'dist/server/index.js'];

test('preserves recipe audience tri-state when projecting a recipe into a planned meal', () => {
  for (const relativePath of sourcePaths) {
    const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
    assert.match(
      source,
      /familyFriendly: typeof recipe\.familyFriendly === 'boolean' \? recipe\.familyFriendly : null/,
      relativePath,
    );
  }
});
