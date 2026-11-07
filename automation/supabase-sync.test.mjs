import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'dist/supabase-sync.js'), 'utf8');
const workerSource = await readFile(resolve(root, 'worker/index.js'), 'utf8');
const workerPublished = await readFile(resolve(root, 'dist/server/index.js'), 'utf8');
const html = await readFile(resolve(root, 'dist/index.html'), 'utf8');
const context = {
  window: {},
  document: { getElementById: () => null },
  localStorage: { getItem: () => null, setItem: () => {} },
  TextEncoder,
};
vm.runInNewContext(source, context, { filename: 'supabase-sync.js' });
const sync = context.window.angebotskuecheSupabaseSync;

function workerPayloadValidator() {
  const start = workerSource.indexOf('function validSyncPayload(payload) {');
  const end = workerSource.indexOf('\n\nasync function syncCloud', start);
  assert.ok(start >= 0 && end > start, 'worker payload validator is present');
  const workerContext = {};
  vm.runInNewContext(
    `${workerSource.slice(start, end)}\nglobalThis.validSyncPayload = validSyncPayload;`,
    workerContext,
    { filename: 'worker-payload-validator.js' },
  );
  return workerContext.validSyncPayload;
}

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

test('treats manualDinnerPlan as an object at both sync payload boundaries', () => {
  const payload = { version: 1, manualDinnerPlan: { '0': 'abendessen-a' } };
  const validateWorkerPayload = workerPayloadValidator();
  assert.doesNotThrow(() => sync.validatePayload(payload));
  assert.match(workerPublished, /manualDinnerPlan/);
  assert.equal(validateWorkerPayload(payload), true);
  assert.throws(
    () => sync.validatePayload({ ...payload, manualDinnerPlan: [] }),
    /manualDinnerPlan/,
  );
  assert.equal(validateWorkerPayload({ ...payload, manualDinnerPlan: [] }), false);
  assert.equal(validateWorkerPayload({ ...payload, manualDinnerPlan: null }), false);
});

test('bounds recipe history at the worker sync boundary', () => {
  const validateWorkerPayload = workerPayloadValidator();
  assert.equal(validateWorkerPayload({ version: 1, recipeHistory: [] }), true);
  assert.equal(validateWorkerPayload({ version: 1, recipeHistory: ['Rezept'] }), true);
  assert.equal(validateWorkerPayload({ version: 1, recipeHistory: {} }), false);
  assert.equal(validateWorkerPayload({ version: 1, recipeHistory: Array(5001).fill('Rezept') }), false);
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


test('shows an offline sync error instead of a misleading sign-in prompt', () => {
  assert.ok(html.includes('const syncReady = sync && await initializeSupabaseSync();'));
  assert.ok(html.includes("showToast('Supabase momentan nicht erreichbar. Lokale Daten bleiben auf diesem Gerät verfügbar.');"));
  assert.ok(html.includes('if (syncReady && await sync.hasSession()) { await sync.save(); return; }'));
  assert.ok(html.includes('if (syncReady && await sync.hasSession()) { await sync.load(); return; }'));
});

function extractCloudAction(source, name, nextMarker) {
  const start = source.indexOf(`    async function ${name}() {`);
  const end = source.indexOf(nextMarker, start);
  assert.ok(start >= 0 && end > start, `${name} is present`);
  return source.slice(start, end).trim();
}

async function runOfflineCloudAction(name, nextMarker) {
  const events = [];
  const button = { disabled: false };
  const storage = new Map([
    ['angebotskueche.settings', JSON.stringify({ people: 4, markets: 3 })],
    ['angebotskueche.pantry', JSON.stringify(['Milch', 'Brot'])],
  ]);
  const before = [...storage.entries()];
  const sync = {
    openSettings() { events.push({ type: 'settings' }); },
    async hasSession() { events.push({ type: 'session-check' }); return false; },
  };
  const sandbox = {
    window: { angebotskuecheSupabaseSync: sync },
    isGithubPagesHost: true,
    initializeSupabaseSync: async () => false,
    $: () => button,
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
    },
    showToast(message) { events.push({ type: 'toast', message }); },
    fetch: async () => { throw new Error('offline fallback should not run'); },
    buildUserDataPayload: () => ({ version: 1 }),
  };
  const action = vm.runInNewContext(`(${extractCloudAction(html, name, nextMarker)})`, sandbox);
  await action();
  return { events, button, storage, before };
}

test('offline GitHub Pages save/load keep the settings prompt out of the error path', async () => {
  for (const [name, nextMarker] of [['cloudSaveData', '    async function cloudLoadData() {'], ['cloudLoadData', '    function importUserData(file) {']]) {
    const result = await runOfflineCloudAction(name, nextMarker);
    assert.equal(result.button.disabled, false, `${name} re-enables its button`);
    assert.deepEqual([...result.storage.entries()], result.before, `${name} keeps local settings and pantry unchanged`);
    assert.equal(result.events.some(event => event.type === 'settings'), false, `${name} does not open settings offline`);
    assert.equal(result.events.some(event => event.type === 'session-check'), false, `${name} does not check a missing session offline`);
    assert.deepEqual(result.events.filter(event => event.type === 'toast').map(event => event.message), [
      'Supabase momentan nicht erreichbar. Lokale Daten bleiben auf diesem Gerät verfügbar.',
    ]);
  }
});

test('source freshness uses the timestamp reported by the offer source', () => {
  const declaration = html.match(/function normalizeSourceTimestamp\(value\) \{[\s\S]*?\n    \}/);
  assert.ok(declaration, 'source timestamp normalizer is present');
  const normalizeSourceTimestamp = vm.runInNewContext(`(${declaration[0]})`);

  assert.equal(normalizeSourceTimestamp('2026-11-05T14:57:27.423Z'), '2026-11-05T14:57:27.423Z');
  assert.equal(normalizeSourceTimestamp('not-a-timestamp'), '');
  assert.equal(normalizeSourceTimestamp(undefined), '');
  assert.match(html, /normalizeSourceTimestamp\(result\.payload\.fetchedAt\)/);
  assert.match(html, /Datenstand unbekannt/);
});

test('reports card load goals without claiming the prospect is complete', () => {
  const declaration = html.match(/function offerCoverageLabel\(live\) \{[\s\S]*?\n    \}/);
  assert.ok(declaration, 'offer coverage label helper is present');
  const coverage = vm.runInNewContext(`(${declaration[0]})`);

  assert.equal(
    coverage({ targetOfferCount: 1000, loadedOfferCardCount: 1004, targetReached: true }),
    '1.004 Karten geladen; Ladeziel 1.000 erreicht, Gesamtumfang nicht belegt'
  );
  assert.equal(
    coverage({ targetOfferCount: 1000, loadedOfferCardCount: 40, targetReached: false }),
    '40 von 1.000 Karten geladen; Ladeziel noch nicht erreicht'
  );
  assert.equal(
    coverage({ targetOfferCount: 1000, loadedOfferCardCount: 40 }),
    '40 von 1.000 Karten geladen; Status des Ladeziels unbekannt'
  );
  assert.equal(coverage({}), 'Angebotsumfang unbekannt');
  assert.match(html, /targetOfferCount: Number\(result\.payload\.targetOfferCount/);
});

test('labels the shopping offer subtotal and names what is excluded', () => {
  assert.match(html, /Angebotswert/);
  assert.match(html, /Packungsbedarf ist angenähert/);
  assert.match(html, /fehlende Artikel und Vorräte sind im Angebotswert nicht enthalten/);
});

test('retains stored offers for unrefreshed and failed markets', () => {
  const declaration = html.match(/function retainUnrefreshedAutomaticOffers\(currentOffers, refreshedMarkets\) \{[\s\S]*?\n    \}/);
  assert.ok(declaration, 'market offer retention helper is present');
  const retain = vm.runInNewContext(`(${declaration[0]})`, {
    isAutomaticLiveOffer: offer => offer.automatic,
    canonicalMarketName: market => String(market).toLowerCase(),
  });
  const current = [
    { store: 'Aldi', name: 'old Aldi offer', automatic: true },
    { store: 'Lidl', name: 'last Lidl offer', automatic: true },
    { store: 'Aldi', name: 'manual Aldi note', automatic: false },
  ];

  const retained = Array.from(retain(current, new Set(['aldi'])));
  assert.deepEqual(retained.map(offer => offer.name), ['last Lidl offer', 'manual Aldi note']);
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

function extractFrontendFunction(source, name) {
  const start = source.indexOf(`function ${name}() {`);
  assert.notEqual(start, -1, `${name} is present`);
  const closing = '\n    }';
  const end = source.indexOf(closing, start);
  assert.notEqual(end, -1, `${name} closing brace is present`);
  return source.slice(start, end + closing.length);
}

function createMarketSelectionHarness({ selectedMarkets, markets } = {}) {
  const normalizedHtml = html.replace(/\r\n?/g, '\n');
  const sortedDeclaration = [extractFrontendFunction(normalizedHtml, 'sortedSelectedMarkets')];
  const activeDeclaration = [extractFrontendFunction(normalizedHtml, 'getActiveOffers')];
  const demoStart = normalizedHtml.indexOf('function isDemoOffer(offer) {');
  const demoEnd = normalizedHtml.indexOf('\n    function isOfferCurrent', demoStart);
  const demoDeclaration = normalizedHtml.slice(demoStart, demoEnd);
  assert.ok(sortedDeclaration, 'selected market sorter is present');
  assert.ok(activeDeclaration, 'active offer selector is present');
  assert.ok(demoDeclaration, 'demo offer helper is present');
  return vm.runInNewContext(`(() => {
    ${sortedDeclaration[0]}
    ${demoDeclaration}
    ${activeDeclaration[0]}
    return { sortedSelectedMarkets, getActiveOffers };
  })()`, {
    settings: { selectedMarkets, markets },
    marketDetails: {
      Aldi: { distance: '4,8 km' },
      Kaufland: { distance: '18,6 km' },
      Lidl: { distance: '6,2 km' },
      EDEKA: { distance: '3,1 km' },
    },
    offers: [
      { store: 'Aldi' },
      { store: 'Kaufland' },
      { store: 'Lidl' },
      { store: 'EDEKA' },
    ],
    isOfferCurrent: () => true,
  });
}

test('keeps active offers bounded when persisted market settings are invalid', () => {
  const valid = createMarketSelectionHarness({ selectedMarkets: ['Aldi', 'Kaufland', 'Lidl', 'EDEKA'], markets: 1 });
  assert.deepEqual(Array.from(valid.getActiveOffers(), offer => offer.store), ['EDEKA']);

  const invalidSelection = createMarketSelectionHarness({ selectedMarkets: ['not-a-market'], markets: 1 });
  assert.deepEqual(Array.from(invalidSelection.sortedSelectedMarkets()), ['EDEKA', 'Aldi', 'Lidl', 'Kaufland']);
  assert.deepEqual(Array.from(invalidSelection.getActiveOffers(), offer => offer.store), ['EDEKA']);

  const invalidLimit = createMarketSelectionHarness({ selectedMarkets: ['Aldi', 'Kaufland'], markets: 'invalid' });
  assert.deepEqual(Array.from(invalidLimit.getActiveOffers(), offer => offer.store), ['Aldi', 'Kaufland']);

  const zeroLimit = createMarketSelectionHarness({ selectedMarkets: ['Aldi', 'Kaufland'], markets: '0' });
  assert.deepEqual(Array.from(zeroLimit.getActiveOffers(), offer => offer.store), ['Aldi', 'Kaufland']);

  const missingSettings = createMarketSelectionHarness();
  assert.deepEqual(Array.from(missingSettings.getActiveOffers(), offer => offer.store), ['Aldi', 'EDEKA']);
});
