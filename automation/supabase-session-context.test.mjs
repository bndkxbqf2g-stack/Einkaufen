import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = (await readFile(new URL('../dist/supabase-sync.js', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
const published = await readFile(new URL('../supabase-sync.js', import.meta.url), 'utf8');
assert.equal(published, source, 'published Supabase sync bundle must stay byte-identical to the source');

const clearMatch = source.match(/  function clearLocalHouseholdContext\(\) \{[\s\S]*?\n  \}/);
const updateMatch = source.match(/  function updateSession\(nextSession\) \{[\s\S]*?\n  \}/);
const signOutMatch = source.match(/  async function signOut\(\) \{[\s\S]*?\n  \}/);
assert.ok(clearMatch, 'household context cleaner is present');
assert.ok(updateMatch, 'session update helper is present');
assert.ok(signOutMatch, 'signOut is present');

function createSessionHarness(initialStorage, initialUser = 'user-1') {
  const storage = new Map(Object.entries(initialStorage));
  const localStorage = {
    get length() { return storage.size; },
    key(index) { return [...storage.keys()][index] ?? null; },
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
  };
  const context = vm.runInNewContext(`(() => {
    const HOUSEHOLD_KEY = 'angebotskueche.supabase.household';
    const LOCAL_DATA_HOUSEHOLD_KEY = 'angebotskueche.supabase.localHousehold';
    const REVISION_KEY_PREFIX = 'angebotskueche.supabase.revision.';
    let session = { user: { id: ${JSON.stringify(initialUser)} } };
    let households = [{ household_id: 'house-old' }];
    let selectedHouseholdId = 'house-old';
    function safeRemove(key) { localStorage.removeItem(key); }
    ${clearMatch[0]}
    ${updateMatch[0]}
    return {
      updateSession,
      get snapshot() { return { session, households, selectedHouseholdId }; },
    };
  })()`, { localStorage });
  return {
    storage,
    updateSession: context.updateSession,
    get snapshot() { return context.snapshot; },
  };
}

const oldContext = {
  'angebotskueche.supabase.household': 'house-old',
  'angebotskueche.supabase.localHousehold': 'house-old',
  'angebotskueche.supabase.revision.house-old': '7',
  'angebotskueche.supabase.revision.other': '3',
  'angebotskueche.settings': '{"people":4}',
  'angebotskueche.pantry': '["Brot"]',
};

test('signing out clears household and revision context but preserves local app data', () => {
  const harness = createSessionHarness(oldContext);
  harness.updateSession(null);

  assert.equal(harness.storage.has('angebotskueche.supabase.household'), false);
  assert.equal(harness.storage.has('angebotskueche.supabase.localHousehold'), false);
  assert.equal(harness.storage.has('angebotskueche.supabase.revision.house-old'), false);
  assert.equal(harness.storage.has('angebotskueche.supabase.revision.other'), false);
  assert.equal(harness.storage.get('angebotskueche.settings'), '{"people":4}');
  assert.equal(harness.storage.get('angebotskueche.pantry'), '["Brot"]');
  assert.equal(harness.snapshot.session, null);
  assert.equal(harness.snapshot.households.length, 0);
  assert.equal(harness.snapshot.selectedHouseholdId, null);
});

test('switching to the next user starts without the previous household context', () => {
  const harness = createSessionHarness(oldContext);
  harness.updateSession({ user: { id: 'user-2' } });

  assert.equal(harness.snapshot.session.user.id, 'user-2');
  assert.equal(harness.snapshot.selectedHouseholdId, null);
  assert.equal(harness.snapshot.households.length, 0);
  assert.equal(harness.storage.has('angebotskueche.supabase.household'), false);
  assert.equal(harness.storage.has('angebotskueche.supabase.localHousehold'), false);
  assert.equal(harness.storage.has('angebotskueche.supabase.revision.house-old'), false);
  assert.equal(harness.storage.has('angebotskueche.supabase.revision.other'), false);
  assert.equal(harness.storage.get('angebotskueche.settings'), '{"people":4}');
});

test('signOut is wired to clear the local session context', () => {
  assert.match(signOutMatch[0], /updateSession\(null\)/);
  assert.doesNotMatch(signOutMatch[0], /localStorage\.clear\(\)/);
});
