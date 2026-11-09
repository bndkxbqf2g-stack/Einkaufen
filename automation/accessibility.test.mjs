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
  const buttons = [...source.matchAll(/<button data-rating="([1-5])"([^>]*)>/g)];
  assert.equal(buttons.length, 5, 'the rating control should expose five choices');
  buttons.forEach(([markup, rating, attributes]) => {
    assert.match(attributes, new RegExp(`aria-label="${rating} von 5 Sternen"`), markup);
  });
});


test('associates visible import fields with explicit labels', () => {
  for (const id of ['recipeName', 'recipeUrl', 'offerInput']) {
    assert.match(source, new RegExp(`<label[^>]*for="${id}"[^>]*>`), `${id} needs an explicit label`);
  }
});
test('gives each shopping market group an accessible name', () => {
  assert.match(
    source,
    /<section class="shopping-group" aria-label="\$\{escapeHtml\(marketDisplayName\(group\)\)\}">/,
    'shopping market groups need an accessible name',
  );
});
test('announces shopping progress changes', () => {
  const openNote = source.match(/<div class="shopping-stat-note" id="shoppingOpenNote"[^>]*>/)?.[0] || '';
  for (const attribute of ['role="status"', 'aria-live="polite"', 'aria-atomic="true"']) {
    assert.match(openNote, new RegExp(attribute), `shoppingOpenNote needs ${attribute}`);
  }
  assert.match(
    source,
    /<span class="shopping-group-progress" role="status" aria-live="polite" aria-atomic="true">\$\{escapeHtml\(itemNote\)\}<\/span>/,
    'shopping group progress needs a polite atomic live region',
  );
});
test('dismisses open modal with Escape', () => {
  assert.match(source, /function dismissOpenModalOnEscape\(event\)/);
  assert.match(source, /if \(event\.key !== 'Escape'\) return;/);
  assert.match(source, /document\.querySelector\('\.modal-backdrop\.open'\)/);
  assert.match(source, /event\.preventDefault\(\)/);
  assert.match(source, /modal\.querySelector\('\.close'\)\?\.click\(\)/);
  assert.match(source, /document\.addEventListener\('keydown', dismissOpenModalOnEscape\)/);
});
test('returns modal focus to connected opener after close', () => {
  assert.match(source, /const modalOpeners = new WeakMap\(\)/);
  assert.match(source, /function isFocusableModalOpener\(element\)/);
  assert.match(source, /element\.isConnected/);
  assert.match(source, /element\.tabIndex < 0/);
  assert.match(source, /modalOpeners\.set\(modal, isFocusableModalOpener\(opener\)/);
  assert.match(source, /modalOpeners\.delete\(modal\)/);
  assert.match(source, /if \(isFocusableModalOpener\(opener\)\) opener\.focus\(\)/);
  assert.match(source, /modalFocusObserver\.observe\(modal, \{ attributes: true, attributeFilter: \['class'\] \}\)/);
});
