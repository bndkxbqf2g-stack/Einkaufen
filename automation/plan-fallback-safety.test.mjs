import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const helperStart = source.indexOf('function sanitizeFallbackMeal(meal) {');
const helperEnd = source.indexOf(String.fromCharCode(10) + '    function getCurrentPlanMeals', helperStart);
const helper = source.slice(helperStart, helperEnd);

test('removes unverifiable offer claims from the offline plan fallback', () => {
  assert.ok(helperStart >= 0 && helperEnd > helperStart, 'fallback sanitizer must be present');
  assert.ok(helper.includes("store: '', cost: '', costSource: 'unknown'"));
  assert.ok(helper.includes("score: 0"));
  assert.ok(helper.includes("note: 'Angebotsbezug offen'"));
  assert.ok(source.includes('selected[index] = sanitizeFallbackMeal(fallback[fallbackIndex] || planBase[index] || planBase[0]);'));
});

test('keeps the published frontend synchronized with the source page', () => {
  assert.equal(published, source);
});

console.log('Offline plan fallback safety checks passed');