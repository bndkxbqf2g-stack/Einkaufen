import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'dist/supabase-sync.js'), 'utf8');
const html = await readFile(resolve(root, 'dist/index.html'), 'utf8');
const context = {
  window: {},
  document: { getElementById: () => null },
  localStorage: { getItem: () => null, setItem: () => {} },
  TextEncoder,
};
vm.runInNewContext(source, context, { filename: 'supabase-sync.js' });
const sync = context.window.angebotskuecheSupabaseSync;

function createSyncHarness({ remoteState = null, confirm = true, initialStorage = {} } = {}) {
  const storage = new Map(Object.entries(initialStorage));
  const elements = new Map();
  const rpcCalls = [];
  const appliedPayloads = [];
  let confirmationCount = 0;
  let state = remoteState;
  const makeElement = () => ({
    value: '',
    textContent: '',
    disabled: false,
    hidden: false,
    children: [],
    listeners: {},
    replaceChildren() { this.children = []; },
    appendChild(child) { this.children.push(child); },
    addEventListener(name, callback) { this.listeners[name] = callback; },
    remove() {},
  });
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, makeElement());
      return elements.get(id);
    },
    createElement: makeElement,
    head: { appendChild() {} },
  };
  const session = { user: { id: 'user-1', email: 'test@example.com' } };
  const client = {
    auth: {
      onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
      async getSession() { return { data: { session }, error: null }; },
    },
    async rpc(name, args = {}) {
      rpcCalls.push({ name, args });
      if (name === 'list_my_households') {
        return { data: [{ household_id: 'house-1', name: 'Testhaushalt', role: 'owner' }], error: null };
      }
      if (name === 'get_household_state') {
        return { data: state ? [state] : [], error: null };
      }
      if (name === 'save_household_state') {
        const revision = state ? Number(state.revision) + 1 : 1;
        state = { payload: args.p_payload, revision: String(revision), updated_at: '2026-11-06T12:00:00Z' };
        return { data: [{ revision: String(revision), updated_at: state.updated_at }], error: null };
      }
      throw new Error(`Unexpected RPC: ${name}`);
    },
  };
  const window = {
    supabase: { createClient: () => client },
    confirm: () => { confirmationCount += 1; return confirm; },
  };
  const localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
  };
  const sandbox = { window, document, localStorage, TextEncoder };
  vm.runInNewContext(source, sandbox, { filename: 'supabase-sync-harness.js' });
  const api = window.angebotskuecheSupabaseSync;
  const validPayload = { version: 1, settings: { people: 2 }, pantry: [] };
  return {
    api,
    rpcCalls,
    storage,
    appliedPayloads,
    get confirmationCount() { return confirmationCount; },
    async initialize() {
      await api.initialize({
        buildPayload: () => validPayload,
        validatePayload: payload => api.validatePayload(payload),
        applyPayload: payload => appliedPayloads.push(payload),
        showToast() {},
      });
    },
  };
}

test('accepts the existing app payload, including recipe history', () => {
  const payload = { version: 1, settings: {}, pantry: [], recipeHistory: [] };
  assert.ok(sync.validatePayload(payload) > 0);
});

test('enforces the database array item limit', () => {
  assert.throws(() => sync.validatePayload({ version: 1, pantry: Array(5001).fill('x') }), /pantry/);
  assert.throws(() => sync.validatePayload({ version: 1, recipeHistory: Array(5001).fill('x') }), /recipeHistory/);
});

test('measures UTF-8 bytes and rejects payloads over 600000 bytes', () => {
  const payload = { version: 1, notes: '🥨'.repeat(150001) };
  assert.throws(() => sync.validatePayload(payload), /600.000 Bytes/);
});

test('uses a pinned Supabase SDK and never embeds a privileged key', () => {
  assert.match(source, /supabase-js@2\.119\.0/);
  assert.doesNotMatch(source, /service[_-]?role|sb_secret_/i);
});

test('keeps the static app inline script syntactically valid', () => {
  const inlineScript = html.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(inlineScript, 'main app script is present');
  assert.doesNotThrow(() => new vm.Script(inlineScript[1]));
});

test('requires confirmation before the first local upload and uses revision zero', async () => {
  const harness = createSyncHarness();
  await harness.initialize();
  assert.equal(await harness.api.save(), true);
  assert.equal(harness.confirmationCount, 1);
  const saveCall = harness.rpcCalls.find(call => call.name === 'save_household_state');
  assert.equal(saveCall.args.p_expected_revision, '0');
  assert.equal(harness.storage.get('angebotskueche.supabase.revision.house-1'), '1');
  assert.equal(harness.storage.get('angebotskueche.supabase.localHousehold'), 'house-1');
});

test('refuses to overwrite a newer household revision', async () => {
  const harness = createSyncHarness({
    remoteState: { payload: { version: 1, settings: {} }, revision: '2', updated_at: '2026-11-06T12:00:00Z' },
    initialStorage: {
      'angebotskueche.supabase.household': 'house-1',
      'angebotskueche.supabase.localHousehold': 'house-1',
      'angebotskueche.supabase.revision.house-1': '1',
    },
  });
  await harness.initialize();
  await assert.rejects(harness.api.save(), /Cloud-Stand ist neuer/);
  assert.equal(harness.rpcCalls.some(call => call.name === 'save_household_state'), false);
});

test('canceling cloud load does not replace or mark local app data', async () => {
  const harness = createSyncHarness({
    remoteState: { payload: { version: 1, settings: { people: 5 } }, revision: '3', updated_at: '2026-11-06T12:00:00Z' },
    confirm: false,
  });
  await harness.initialize();
  assert.equal(await harness.api.load(), false);
  assert.equal(harness.appliedPayloads.length, 0);
  assert.equal(harness.storage.has('angebotskueche.supabase.localHousehold'), false);
  assert.equal(harness.storage.has('angebotskueche.supabase.revision.house-1'), false);
});

test('confirmed cloud load applies the payload and remembers its revision', async () => {
  const payload = { version: 1, settings: { people: 4 }, pantry: [] };
  const harness = createSyncHarness({
    remoteState: { payload, revision: '4', updated_at: '2026-11-06T12:00:00Z' },
  });
  await harness.initialize();
  assert.equal(await harness.api.load(), true);
  assert.equal(harness.confirmationCount, 1);
  assert.equal(harness.appliedPayloads.length, 1);
  assert.equal(harness.appliedPayloads[0].settings.people, 4);
  assert.equal(harness.storage.get('angebotskueche.supabase.localHousehold'), 'house-1');
  assert.equal(harness.storage.get('angebotskueche.supabase.revision.house-1'), '4');
});
