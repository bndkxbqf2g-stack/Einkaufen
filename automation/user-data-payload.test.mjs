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

function createPayloadHarness(initialEntries = []) {
  const storage = new Map(initialEntries);
  const sandbox = {
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
    },
    settings: { markets: 3 },
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

test('keeps local v1 fields that an older cloud snapshot omits', () => {
  const initial = [
    ['angebotskueche.settings', JSON.stringify({ markets: 3 })],
    ['angebotskueche.pantry', JSON.stringify(['Milch'])],
    ['angebotskueche.favorites', JSON.stringify([{ name: 'Lieblingsrezept' }])],
    ['angebotskueche.recipeHistory', JSON.stringify(['rezept-a'])],
    ['angebotskueche.suggestionPreferences', JSON.stringify({ sort: 'variety' })],
  ];
  const { applyUserDataPayload, storage } = createPayloadHarness(initial);

  applyUserDataPayload({ version: 1, pantry: ['Reis'] }, 'geladen');

  assert.equal(storage.get('angebotskueche.pantry'), JSON.stringify(['Reis']));
  assert.equal(storage.get('angebotskueche.settings'), JSON.stringify({ markets: 3 }));
  assert.equal(storage.get('angebotskueche.favorites'), JSON.stringify([{ name: 'Lieblingsrezept' }]));
  assert.equal(storage.get('angebotskueche.recipeHistory'), JSON.stringify(['rezept-a']));
  assert.equal(storage.get('angebotskueche.suggestionPreferences'), JSON.stringify({ sort: 'variety' }));
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
});

test('worker source and published index stay byte-identical after the build', () => {
  assert.equal(published, source);
});
