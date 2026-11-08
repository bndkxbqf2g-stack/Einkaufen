import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

assert.equal(published, source, 'published bundle must stay byte-identical to the source');

test('announces transient action feedback to assistive technology', () => {
  const toast = source.match(/<div class="toast" id="toast"[^>]*>/)?.[0] || '';
  assert.match(toast, /\brole="status"/, 'the toast needs a status role');
  assert.match(toast, /\baria-live="polite"/, 'the toast needs a polite live region');
  assert.match(toast, /\baria-atomic="true"/, 'the toast message should be announced as one unit');
});

test('announces pantry and manual shopping input feedback', () => {
  for (const id of ['pantryStatus', 'shoppingItemStatus']) {
    const status = source.match(new RegExp(`<div class="source-note" id="${id}"[^>]*>`))?.[0] || '';
    assert.match(status, /\brole="status"/, `${id} needs a status role`);
    assert.match(status, /\baria-live="polite"/, `${id} needs a polite live region`);
    assert.match(status, /\baria-atomic="true"/, `${id} should be announced as one unit`);
  }
});


test('gives rating buttons an explicit accessible name', () => {
  const buttons = [...source.matchAll(/<button data-rating="(\\d)"([^>]*)>/g)];
  assert.equal(buttons.length, 5, 'the rating control should expose five choices');
  buttons.forEach(([markup, rating, attributes]) => {
    assert.match(attributes, new RegExp(`aria-label="${rating} von 5 Sternen"`), markup);
  });
});
