import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'index.html'), 'utf8');
const published = await readFile(resolve(root, 'dist/index.html'), 'utf8');
const syncSource = await readFile(resolve(root, 'supabase-sync.js'), 'utf8');
const syncPublished = await readFile(resolve(root, 'dist/supabase-sync.js'), 'utf8');
const worker = await readFile(resolve(root, 'dist/server/index.js'), 'utf8');
const helpersStart = source.indexOf('    const backupArrayKeys = ');
const helpersEnd = source.indexOf('    function exportUserData()', helpersStart);

assert.ok(helpersStart >= 0 && helpersEnd > helpersStart, 'backup payload helpers are present');

const helpers = source.slice(helpersStart, helpersEnd);

const manualItemsStart = source.indexOf('    function normalizeManualShoppingItems(');
const manualItemsEnd = source.indexOf('    function normalizeRecipeMealPurpose(', manualItemsStart);
assert.ok(manualItemsStart >= 0 && manualItemsEnd > manualItemsStart, 'manual shopping item normalizer is present');

const manualShoppingNormalizer = vm.runInNewContext(
  `${source.slice(manualItemsStart, manualItemsEnd)}
normalizeManualShoppingItems`,
  {},
  { filename: 'manual-shopping-items.js' },
);
const manualItemsStartupStart = source.indexOf('    const normalizedManualShoppingItems =');
const manualItemsStartupEnd = source.indexOf('    if (!shoppingChecks', manualItemsStartupStart);
assert.ok(manualItemsStartupStart >= 0 && manualItemsStartupEnd > manualItemsStartupStart, 'manual shopping item startup normalization is present');
const manualItemsStartup = source.slice(manualItemsStartupStart, manualItemsStartupEnd);

function initializeManualShoppingItems(rawItems) {
  const storage = new Map();
  const sandbox = {
    manualShoppingItems: rawItems,
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
    },
    normalizeManualShoppingItems: manualShoppingNormalizer,
  };
  const result = vm.runInNewContext(
    `${manualItemsStartup}
({ items: manualShoppingItems, saved: localStorage.getItem('angebotskueche.manualShoppingItems') })`,
    sandbox,
    { filename: 'manual-shopping-items-startup.js' },
  );
  return result;
}



const shoppingChecksStart = source.indexOf('    function reconcileShoppingChecks(');
const shoppingChecksEnd = source.indexOf('    function renderShoppingGroupHeader', shoppingChecksStart);
assert.ok(shoppingChecksStart >= 0 && shoppingChecksEnd > shoppingChecksStart, 'shopping check reconciler is present');
const reconcileShoppingChecks = vm.runInNewContext(
  `${source.slice(shoppingChecksStart, shoppingChecksEnd)}
reconcileShoppingChecks`,
  {},
  { filename: 'shopping-checks.js' },
);

const pantryNormalizationStart = source.indexOf('    if (!Array.isArray(pantry)) {');
const pantryNormalizationEnd = source.indexOf('    if (!Array.isArray(dismissedRecipes))', pantryNormalizationStart);
assert.ok(pantryNormalizationStart >= 0 && pantryNormalizationEnd > pantryNormalizationStart, 'pantry normalization is present');
const pantryNormalization = source.slice(pantryNormalizationStart, pantryNormalizationEnd);

const recipeHistoryNormalizationStart = source.indexOf('    const rawRecipeHistory = ');
const recipeHistoryNormalizationEnd = source.indexOf('    if (!suggestionPreferences', recipeHistoryNormalizationStart);
assert.ok(recipeHistoryNormalizationStart >= 0 && recipeHistoryNormalizationEnd > recipeHistoryNormalizationStart, 'recipe history normalization is present');
const recipeHistoryNormalization = source.slice(recipeHistoryNormalizationStart, recipeHistoryNormalizationEnd);

function normalizeLegacyPantryAndHistory(pantryValue, historyValue) {
  const storage = new Map();
  const sandbox = {
    DEFAULT_PANTRY: ['Salz', 'Pfeffer', 'Gewürze', 'Öl', 'Essig', 'Brühe', 'Mehl', 'Zucker', 'Butter', 'Milch'],
    pantry: pantryValue,
    recipeHistory: historyValue,
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
    },
  };
  const result = vm.runInNewContext(
    `${pantryNormalization}
${recipeHistoryNormalization}
({ pantry, recipeHistory, pantrySaved: localStorage.getItem('angebotskueche.pantry'), historySaved: localStorage.getItem('angebotskueche.recipeHistory') })`,
    sandbox,
    { filename: 'pantry-history-normalization.js' },
  );
  return result;
}

function createPayloadHarness(initialEntries = [], currentSettings = { markets: 3 }) {
  const storage = new Map(initialEntries);
  const sandbox = {
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
    },
    settings: currentSettings,
    showToast() {},
    setTimeout() {},
    location: { reload() {} },
  };
  const applyUserDataPayload = vm.runInNewContext(
    `${helpers}\napplyUserDataPayload`,
    sandbox,
    { filename: 'user-data-payload.js' },
  );

  return { applyUserDataPayload, storage };
}



test('persists safe pantry and recipe history normalization before backup', () => {
  const legacyHistory = [
    'rezept-0',
    { legacy: true },
    ...Array.from({ length: 21 }, (_, index) => `rezept-${index + 1}`),
  ];
  const first = normalizeLegacyPantryAndHistory({ old: 'format' }, legacyHistory);
  const expectedHistory = ['rezept-0', ...Array.from({ length: 19 }, (_, index) => `rezept-${index + 1}`)];
  const expectedPantry = ['Salz', 'Pfeffer', 'Gewürze', 'Öl', 'Essig', 'Brühe', 'Mehl', 'Zucker', 'Butter', 'Milch'];

  assert.deepEqual([...first.pantry], expectedPantry);
  assert.deepEqual([...first.recipeHistory], expectedHistory);
  assert.equal(first.pantrySaved, JSON.stringify(expectedPantry));
  assert.equal(first.historySaved, JSON.stringify(expectedHistory));

  const reloaded = normalizeLegacyPantryAndHistory(JSON.parse(first.pantrySaved), JSON.parse(first.historySaved));
  assert.equal(reloaded.pantrySaved, null, 'normalized pantry is not rewritten on reload');
  assert.equal(reloaded.historySaved, null, 'normalized history is not rewritten on reload');
  assert.deepEqual([...reloaded.pantry], expectedPantry);
  assert.deepEqual([...reloaded.recipeHistory], expectedHistory);
});

test('keeps legacy manual shopping checks stable across reload and restore', () => {
  const first = initializeManualShoppingItems([{ name: 'Brot' }, { name: 'Brot' }, { name: 'Äpfel' }]);
  assert.deepEqual(first.items.map(item => item.id), [
    'manual-legacy-brot',
    'manual-legacy-brot-2',
    'manual-legacy-apfel',
  ]);
  assert.equal(first.saved, JSON.stringify(first.items));

  const checkKey = `manual-${first.items[0].id}`;
  const shoppingChecks = { [checkKey]: true };
  const reloaded = initializeManualShoppingItems(JSON.parse(first.saved));
  const restored = initializeManualShoppingItems(JSON.parse(JSON.stringify(first.items)));

  assert.equal(reloaded.saved, null, 'already-normalized items are not rewritten on reload');
  assert.equal(restored.saved, null, 'already-normalized backup items are not rewritten on restore');
  assert.deepEqual(reloaded.items, first.items);
  assert.deepEqual(restored.items, first.items);
  assert.equal(shoppingChecks[`manual-${reloaded.items[0].id}`], true);
  assert.equal(shoppingChecks[`manual-${restored.items[0].id}`], true);
});

test('round-trips legacy manual items, local fields, and shopping checks together', () => {
  const initialChecks = {
    'manual-manual-legacy-brot': true,
    'manual-manual-legacy-brot-2': true,
    'shopping-stale': true,
    'manual-false': false,
    'manual-text': 'false',
  };
  const { applyUserDataPayload, storage } = createPayloadHarness([
    ['angebotskueche.settings', JSON.stringify({ people: 4, markets: 3 })],
    ['angebotskueche.pantry', JSON.stringify(['Milch'])],
    ['angebotskueche.shoppingChecks', JSON.stringify(initialChecks)],
  ], { people: 4, markets: 3 });

  applyUserDataPayload({
    version: 1,
    manualShoppingItems: [{ name: 'Brot' }, { name: 'Brot' }],
  }, 'geladen', { mergeSettings: true });

  assert.equal(storage.get('angebotskueche.pantry'), JSON.stringify(['Milch']));
  assert.equal(storage.get('angebotskueche.shoppingChecks'), JSON.stringify(initialChecks), 'fehlendes Backup-Feld lässt lokale Checks erhalten');

  const firstReload = initializeManualShoppingItems(
    JSON.parse(storage.get('angebotskueche.manualShoppingItems')),
  );
  assert.deepEqual(firstReload.items.map(item => item.id), [
    'manual-legacy-brot',
    'manual-legacy-brot-2',
  ]);
  assert.equal(firstReload.saved, JSON.stringify(firstReload.items));

  const secondReload = initializeManualShoppingItems(JSON.parse(firstReload.saved));
  assert.equal(secondReload.saved, null, 'normalisierte IDs bleiben beim nächsten Reload stabil');

  const currentItems = secondReload.items.map(item => ({ id: `manual-${item.id}` }));
  assert.deepEqual(
    JSON.parse(JSON.stringify(reconcileShoppingChecks(JSON.parse(storage.get('angebotskueche.shoppingChecks')), currentItems))),
    {
      'manual-manual-legacy-brot': true,
      'manual-manual-legacy-brot-2': true,
    },
  );
});

test('keeps every local v1 field that an older cloud snapshot omits', () => {
  const localFields = {
    settings: { markets: 3 },
    pantry: ['Milch'],
    favorites: [{ name: 'Lieblingsrezept' }],
    dismissedRecipes: ['rezept-abgelehnt'],
    pinnedRecipes: ['rezept-favorit'],
    customOffers: [{ name: 'Haferdrink' }],
    shoppingChecks: { milch: true },
    manualShoppingItems: [{ id: 'manuell-1', name: 'Brot' }],
    recipeHistory: ['rezept-a'],
    liveOfferStatus: { marketA: 'loaded' },
    manualPlan: { monday: ['rezept-a'] },
    manualDinnerPlan: { '0': 'abendessen-a' },
    recipeRatings: { 'rezept-a': { rating: 5 } },
    suggestionPreferences: { sort: 'variety' },
  };
  const initial = Object.entries(localFields)
    .map(([key, value]) => [`angebotskueche.${key}`, JSON.stringify(value)]);
  const { applyUserDataPayload, storage } = createPayloadHarness(initial);

  applyUserDataPayload({ version: 1, pantry: ['Reis'] }, 'geladen');

  for (const [key, value] of Object.entries(localFields)) {
    const expected = key === 'pantry' ? ['Reis'] : value;
    assert.equal(storage.get(`angebotskueche.${key}`), JSON.stringify(expected), key);
  }
});

test('validates a restored payload before changing any local fields', () => {
  const initial = [
    ['angebotskueche.settings', JSON.stringify({ markets: 3 })],
    ['angebotskueche.pantry', JSON.stringify(['Milch'])],
  ];
  const { applyUserDataPayload, storage } = createPayloadHarness(initial);
  const before = [...storage.entries()];

  assert.throws(
    () => applyUserDataPayload({ version: 1, settings: { markets: 1 }, pantry: 'ungültig' }, 'geladen'),
    /invalid/,
  );
  assert.deepEqual([...storage.entries()], before);
});

test('rejects null settings before mutating any local fields', () => {
  const initial = [
    ['angebotskueche.settings', JSON.stringify({ markets: 3 })],
    ['angebotskueche.pantry', JSON.stringify(['Milch'])],
  ];
  const { applyUserDataPayload, storage } = createPayloadHarness(initial);
  const before = [...storage.entries()];

  assert.throws(
    () => applyUserDataPayload({ version: 1, settings: null, pantry: ['Reis'] }, 'geladen'),
    /invalid/,
  );
  assert.deepEqual([...storage.entries()], before);
});


test('local file restore preserves settings omitted by an older backup', () => {
  const currentSettings = {
    people: 4,
    days: 7,
    markets: 3,
    leftovers: false,
    evening: false,
    selectedMarkets: ['Aldi', 'Lidl'],
  };
  const { applyUserDataPayload, storage } = createPayloadHarness([
    ['angebotskueche.settings', JSON.stringify(currentSettings)],
  ], currentSettings);

  applyUserDataPayload({ version: 1, settings: { markets: 1 } }, 'geladen', { mergeSettings: true });

  assert.deepEqual(JSON.parse(storage.get('angebotskueche.settings')), {
    ...currentSettings,
    markets: 1,
  });
});

test('explains legacy-field preservation in the cloud-load confirmation', () => {
  assert.ok(source.includes(
    'Nur enthaltene Felder werden ersetzt; fehlende optionale Felder bleiben lokal erhalten.',
  ));
  assert.ok(syncSource.includes(
    'Nur enthaltene Felder werden ersetzt; fehlende optionale Felder bleiben lokal erhalten.',
  ));
  assert.equal(syncPublished, syncSource);
  assert.ok(worker.includes(
    'Nur enthaltene Felder werden ersetzt; fehlende optionale Felder bleiben lokal erhalten.',
  ));
  assert.ok(source.includes(
    "applyUserDataPayload(JSON.parse(reader.result), 'Daten geladen – die App wird aktualisiert.', { mergeSettings: true })",
  ));
  assert.ok(source.includes(
    "applyUserDataPayload(result.payload, 'Cloud-Daten geladen – die App wird aktualisiert.', { mergeSettings: true })",
  ));
  assert.ok(syncSource.includes(
    "app.applyPayload(remote.payload, 'Haushaltsdaten geladen – die App wird aktualisiert.', { mergeSettings: true })",
  ));
});

test('worker source and published index stay byte-identical after the build', () => {
  assert.equal(published, source);
});
