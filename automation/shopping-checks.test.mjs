import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const declaration = html.match(/function reconcileShoppingChecks\(checks, items\) \{[\s\S]*?\n    \}/);
assert.ok(declaration, 'reconcileShoppingChecks muss im App-Bundle vorhanden sein');
const reconcileShoppingChecks = new Function(
  `${declaration[0]}; return reconcileShoppingChecks;`,
)();

test('entfernt veraltete oder nicht-boolesche Checks und erhält aktuelle stabile IDs', () => {
  const checks = reconcileShoppingChecks({
    'shopping-tomaten': true,
    'shopping-gurken': true,
    'manual-manual-1': true,
    'shopping-false': false,
    'shopping-text': 'false',
  }, [
    { id: 'shopping-gurken' },
    { id: 'manual-manual-1' },
  ]);

  assert.deepEqual(checks, {
    'shopping-gurken': true,
    'manual-manual-1': true,
  });
});

test('entfernt einen Check, wenn der Artikel durch einen Planwechsel nicht mehr aktuell ist', () => {
  const beforePlanChange = reconcileShoppingChecks(
    { 'shopping-tomaten': true },
    [{ id: 'shopping-tomaten' }],
  );
  assert.deepEqual(beforePlanChange, { 'shopping-tomaten': true });

  const afterPlanChange = reconcileShoppingChecks(
    beforePlanChange,
    [{ id: 'shopping-gurken' }],
  );
  assert.deepEqual(afterPlanChange, {});
});

test('der Einkaufslisten-Renderer persistiert die bereinigte Checkliste', () => {
  assert.match(
    html,
    /const normalizedShoppingChecks = reconcileShoppingChecks\(shoppingChecks, items\);/,
  );
});
