import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultSelectedMarkets = ['Aldi', 'Kaufland', 'Lidl', 'EDEKA'];
const expectedDefaults = {
  people: 2,
  days: 5,
  markets: 2,
  leftovers: true,
  evening: true,
  selectedMarkets: defaultSelectedMarkets,
};

function extract(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing ${startMarker}`);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(end, -1, `Missing ${endMarker}`);
  return source.slice(start, end);
}

function loadNormalizers(source, label) {
  const normalizeSettings = extract(
    source,
    'function normalizeSettings(raw)',
    'const settings = normalizeSettings(',
  );
  const normalizeSelectedMarkets = extract(
    source,
    'function normalizeSelectedMarkets(value)',
    'settings.selectedMarkets = normalizeSelectedMarkets',
  );
  const context = {
    DEFAULT_SELECTED_MARKETS: [...defaultSelectedMarkets],
    marketDetails: Object.fromEntries([
      'Aldi',
      'Kaufland',
      'Lidl',
      'EDEKA',
      'Penny',
      'Netto',
      'Marktkauf',
      'Bring',
    ].map(name => [name, {}])),
  };
  vm.runInNewContext(
    `${normalizeSettings}
${normalizeSelectedMarkets}
globalThis.normalizeSettings = normalizeSettings;
globalThis.normalizeSelectedMarkets = normalizeSelectedMarkets;`,
    context,
    { filename: label },
  );
  return {
    normalizeSettings: context.normalizeSettings,
    normalizeSelectedMarkets: context.normalizeSelectedMarkets,
  };
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

const sources = await Promise.all(
  ['index.html', 'dist/index.html'].map(async path => ({
    path,
    source: await readFile(resolve(root, path), 'utf8'),
  })),
);

function loadPersistedSettings(source, label) {
  const persistSettingsSource = extract(
    source,
    'function persistSettings()',
    'function calculateVariety',
  );
  const storage = new Map();
  const controls = {
    '#peopleSelect': { value: '4' },
    '#daysSelect': { value: '4' },
    '#marketsSelect': { value: '7' },
    '#leftoverToggle': { checked: false },
    '#eveningToggle': { checked: false },
  };
  const context = {
    settings: {
      people: 2,
      days: 5,
      markets: 2,
      leftovers: true,
      evening: true,
      selectedMarkets: ['Penny'],
      customSetting: 'preserved',
      personalPreferences: { variety: 'high' },
    },
    $: selector => controls[selector],
    localStorage: {
      setItem(key, value) {
        storage.set(key, String(value));
      },
    },
  };
  const persistSettings = vm.runInNewContext(
    `${persistSettingsSource}
persistSettings`,
    context,
    { filename: label },
  );
  persistSettings();
  return JSON.parse(storage.get('angebotskueche.settings'));
}


test('normalizes persisted settings without changing valid values', () => {
  for (const { path, source } of sources) {
    const { normalizeSettings, normalizeSelectedMarkets } = loadNormalizers(source, path);

    assert.deepEqual(plain(normalizeSettings({})), expectedDefaults, path);
    for (const raw of [null, [], 'legacy value', 42, true]) {
      assert.deepEqual(plain(normalizeSettings(raw)), expectedDefaults, `${path}: ${String(raw)}`);
    }

    const valid = normalizeSettings({
      people: '4',
      days: '4',
      markets: '7',
      leftovers: '0',
      evening: 'true',
      selectedMarkets: ['Penny'],
      customSetting: 'preserved',
    });
    assert.deepEqual(plain(valid), {
      people: 4,
      days: 4,
      markets: 7,
      leftovers: false,
      evening: true,
      selectedMarkets: ['Penny'],
      customSetting: 'preserved',
    }, `${path}: valid settings`);

    const legacy = normalizeSettings({
      people: 3,
      days: 5,
      markets: 1,
      leftovers: 0,
      evening: 1,
    });
    assert.deepEqual(plain(legacy), {
      ...expectedDefaults,
      people: 3,
      days: 5,
      markets: 1,
      leftovers: false,
      evening: true,
    }, `${path}: legacy numeric booleans`);

    const invalid = normalizeSettings({
      people: 'invalid',
      days: 3,
      markets: 8,
      leftovers: ' false ',
      evening: 'not-a-boolean',
      selectedMarkets: 'Aldi',
    });
    assert.deepEqual(plain(invalid), {
      ...expectedDefaults,
      leftovers: false,
    }, `${path}: invalid settings`);

    assert.deepEqual(plain(normalizeSelectedMarkets(['Kaufland', 'unknown', 'Aldi'])), ['Kaufland', 'Aldi'], `${path}: mixed markets`);
    assert.deepEqual(plain(normalizeSelectedMarkets(['unknown'])), defaultSelectedMarkets, `${path}: unknown markets`);
    assert.deepEqual(plain(normalizeSelectedMarkets([])), defaultSelectedMarkets, `${path}: empty markets`);
    assert.deepEqual(plain(normalizeSelectedMarkets(undefined)), defaultSelectedMarkets, `${path}: missing markets`);
  }
});


test('preserves unknown settings when known settings are persisted', () => {
  for (const { path, source } of sources) {
    assert.deepEqual(loadPersistedSettings(source, path), {
      people: 4,
      days: 4,
      markets: 7,
      leftovers: false,
      evening: false,
      selectedMarkets: ['Penny'],
      customSetting: 'preserved',
      personalPreferences: { variety: 'high' },
    }, path);
  }
});
