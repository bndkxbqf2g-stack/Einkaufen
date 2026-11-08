import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [source, index] = await Promise.all([
  readFile(resolve(root, 'sw.js'), 'utf8'),
  readFile(resolve(root, 'index.html'), 'utf8'),
]);
const origin = 'https://app.example';

test('published service worker and manifest stay identical to their root sources', async () => {
  const [publishedWorker, publishedIndex, manifest, publishedManifest] = await Promise.all([
    readFile(resolve(root, 'dist/sw.js'), 'utf8'),
    readFile(resolve(root, 'dist/index.html'), 'utf8'),
    readFile(resolve(root, 'manifest.json'), 'utf8'),
    readFile(resolve(root, 'dist/manifest.json'), 'utf8'),
  ]);

  assert.equal(publishedWorker, source);
  assert.equal(publishedIndex, index);
  assert.equal(publishedManifest, manifest);

  const parsedManifest = JSON.parse(manifest);
  assert.deepEqual(parsedManifest.icons, [
    { src: './icons/pwa-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
    { src: './icons/pwa-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
  ]);
});

test('keeps the active shell cache during APP_BUILD updates', () => {
  assert.match(index, /const APP_BUILD = '[^']+'/);
  assert.match(index, /registration\.update\(\)/);
  assert.doesNotMatch(index, /caches\.keys\(\).*angebotskueche-shell-/s);
});

function requestKey(request) {
  const value = typeof request === 'string' ? request : request.url;
  return new URL(value, origin).href;
}

function createHarness({ fetchImpl = async () => new Response('network'), claimImpl = () => undefined } = {}) {
  const listeners = new Map();
  const cacheNames = new Set();
  const entries = new Map();
  const addAllCalls = [];
  const putCalls = [];
  const fetchCalls = [];
  const deletedCaches = [];
  let skipWaitingCalls = 0;
  let claimCalls = 0;

  const cache = {
    async addAll(urls) {
      addAllCalls.push([...urls]);
      for (const url of urls) {
        entries.set(requestKey(url), new Response(`precached:${url}`));
      }
    },
    async match(request) {
      const response = entries.get(requestKey(request));
      return response ? response.clone() : undefined;
    },
    async put(request, response) {
      putCalls.push({ request, response });
      entries.set(requestKey(request), response.clone());
    },
  };

  const caches = {
    async open(name) {
      cacheNames.add(name);
      return cache;
    },
    async keys() {
      return [...cacheNames];
    },
    async delete(name) {
      deletedCaches.push(name);
      cacheNames.delete(name);
      return true;
    },
    async match(request) {
      return cache.match(request);
    },
  };

  const self = {
    location: { origin },
    clients: {
      claim() {
        claimCalls += 1;
        return claimImpl();
      },
    },
    addEventListener(name, callback) {
      listeners.set(name, callback);
    },
    skipWaiting() {
      skipWaitingCalls += 1;
    },
  };

  const context = {
    URL,
    Promise,
    Request,
    Response,
    Headers,
    caches,
    self,
    fetch: async (request, options) => {
      fetchCalls.push({ request, options });
      return fetchImpl(request, options);
    },
  };
  vm.runInNewContext(source, context, { filename: 'sw.js' });

  async function dispatch(name, event = {}) {
    let pending;
    const wrappedEvent = {
      ...event,
      waitUntil(value) {
        pending = Promise.resolve(value);
      },
    };
    listeners.get(name)(wrappedEvent);
    if (pending) await pending;
  }

  async function dispatchFetch(request) {
    let responsePromise;
    let respondWithCalled = false;
    listeners.get('fetch')({
      request,
      respondWith(value) {
        respondWithCalled = true;
        responsePromise = Promise.resolve(value);
      },
    });
    return {
      respondWithCalled,
      response: responsePromise ? await responsePromise : undefined,
    };
  }

  async function flushCacheWrites() {
    await new Promise(resolveFlush => setTimeout(resolveFlush, 0));
  }

  return {
    addAllCalls,
    cacheNames,
    claimCalls: () => claimCalls,
    deletedCaches,
    dispatch,
    dispatchFetch,
    entries,
    fetchCalls,
    flushCacheWrites,
    putCalls,
    seed(request, response) {
      entries.set(requestKey(request), response);
    },
    skipWaitingCalls: () => skipWaitingCalls,
  };
}


function appShellAssets(serviceWorkerSource) {
  const match = serviceWorkerSource.match(/const APP_SHELL = \[([^\]]+)\]/);
  assert.ok(match, 'APP_SHELL muss im Service Worker vorhanden sein');
  return [...match[1].matchAll(/'([^']+)'/g)].map(result => result[1]);
}

test('precaches every local runtime script referenced by the app', () => {
  const localScripts = [...index.matchAll(/<script\s+src="([^"]+)"/g)]
    .map(result => result[1])
    .filter(src => src.startsWith('./') && src.endsWith('.js'));
  const shellAssets = appShellAssets(source);

  assert.ok(localScripts.length > 0, 'the app must reference local runtime scripts');
  for (const script of localScripts) {
    assert.ok(shellAssets.includes(script), `${script} muss im App-Shell-Cache liegen`);
  }
});


test('service worker registration requests the active cache version', () => {
  const cacheVersion = source.match(/const CACHE_NAME = ['"]angebotskueche-shell-v([^'"]+)['"]/);
  const registrationVersion = index.match(/navigator\.serviceWorker\.register\('\.\/sw\.js\?v=([^']+)'/);

  assert.ok(cacheVersion, 'CACHE_NAME muss eine Versionsnummer enthalten');
  assert.ok(registrationVersion, 'die App muss eine versionierte Service-Worker-Registrierung enthalten');
  assert.equal(registrationVersion[1], cacheVersion[1]);
});

test('precaches the app shell during install and removes old caches on activate', async () => {
  const harness = createHarness();
  harness.cacheNames.add('angebotskueche-shell-old');
  harness.cacheNames.add('unrelated-app-cache');

  await harness.dispatch('install');
  assert.deepEqual(harness.addAllCalls, [['./index.html', './manifest.json', './ingredient-normalization.js', './shopping-costs.js', './budget-transparency.js', './meal-planning.js', './day-planning.js', './ingredient-quantity.js', './pantry-quantity.js', './supabase-sync.js']]);
  assert.equal(harness.skipWaitingCalls(), 1);
  assert.ok(harness.entries.has(`${origin}/index.html`));
  assert.ok(harness.entries.has(`${origin}/manifest.json`));
  assert.ok(harness.entries.has(`${origin}/ingredient-normalization.js`));
  assert.ok(harness.entries.has(`${origin}/shopping-costs.js`));
  assert.ok(harness.entries.has(`${origin}/budget-transparency.js`));
  assert.ok(harness.entries.has(`${origin}/meal-planning.js`));
  assert.ok(harness.entries.has(`${origin}/day-planning.js`));
  assert.ok(harness.entries.has(`${origin}/ingredient-quantity.js`));
  assert.ok(harness.entries.has(`${origin}/pantry-quantity.js`));
  assert.ok(harness.entries.has(`${origin}/supabase-sync.js`));

  await harness.dispatch('activate');
  assert.deepEqual(harness.deletedCaches, ['angebotskueche-shell-old']);
  assert.equal(harness.cacheNames.has('unrelated-app-cache'), true);
  assert.equal(harness.claimCalls(), 1);
});

test('waits for existing clients to be claimed before activation completes', async () => {
  let resolveClaim;
  const claimFinished = new Promise(resolve => {
    resolveClaim = resolve;
  });
  const harness = createHarness({ claimImpl: () => claimFinished });
  let activationSettled = false;
  const activation = harness.dispatch('activate').then(() => {
    activationSettled = true;
  });

  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(harness.claimCalls(), 1);
  assert.equal(activationSettled, false);

  resolveClaim();
  await activation;
  assert.equal(activationSettled, true);
});

test('bypasses the private API, cross-origin requests, and non-GET requests', async () => {
  const harness = createHarness({
    fetchImpl: async () => {
      throw new Error('bypassed request reached network');
    },
  });
  const requests = [
    new Request(`${origin}/api/sync`),
    new Request('https://supabase.example/rest/v1/households'),
    new Request(`${origin}/index.html`, { method: 'POST' }),
  ];

  for (const request of requests) {
    const result = await harness.dispatchFetch(request);
    assert.equal(result.respondWithCalled, false, request.url);
  }
  assert.equal(harness.fetchCalls.length, 0);
});

test('returns successful network responses and caches them', async () => {
  const harness = createHarness({
    fetchImpl: async () => new Response('fresh app shell', { status: 200 }),
  });

  const result = await harness.dispatchFetch(new Request(`${origin}/dashboard`));
  assert.equal(result.respondWithCalled, true);
  assert.equal(await result.response.text(), 'fresh app shell');
  assert.equal(harness.fetchCalls.length, 1);
  assert.equal(harness.fetchCalls[0].options.cache, 'no-store');

  await harness.flushCacheWrites();
  assert.equal(harness.putCalls.length, 1);
  assert.equal(await (await harness.entries.get(`${origin}/dashboard`)).text(), 'fresh app shell');
});

test('returns non-successful network responses without caching them', async () => {
  const harness = createHarness({
    fetchImpl: async () => new Response('temporarily unavailable', { status: 503 }),
  });

  const result = await harness.dispatchFetch(new Request(`${origin}/dashboard`));
  assert.equal(result.respondWithCalled, true);
  assert.equal(result.response.status, 503);
  assert.equal(await result.response.text(), 'temporarily unavailable');

  await harness.flushCacheWrites();
  assert.equal(harness.putCalls.length, 0);
  assert.equal(harness.entries.has(`${origin}/dashboard`), false);
});

test('falls back to the request cache and then the precached index when offline', async () => {
  const harness = createHarness({
    fetchImpl: async () => {
      throw new Error('offline');
    },
  });
  await harness.dispatch('install');
  harness.seed(`${origin}/dashboard`, new Response('cached dashboard'));

  const cached = await harness.dispatchFetch(new Request(`${origin}/dashboard`));
  assert.equal(cached.respondWithCalled, true);
  assert.equal(await cached.response.text(), 'cached dashboard');
  assert.equal(cached.response.headers.get('X-Angebotskueche-Cache-Fallback'), '1');

  harness.seed(`${origin}/dashboard`, undefined);
  const shell = await harness.dispatchFetch({
    url: `${origin}/missing`,
    method: 'GET',
    mode: 'navigate',
    destination: 'document',
  });
  assert.equal(shell.respondWithCalled, true);
  assert.equal(await shell.response.text(), 'precached:./index.html');
  assert.equal(harness.fetchCalls.length, 2);
});

test('does not return the HTML shell for uncached offline assets', async () => {
  const harness = createHarness({
    fetchImpl: async () => {
      throw new Error('offline');
    },
  });
  await harness.dispatch('install');

  const result = await harness.dispatchFetch({
    url: `${origin}/generated/offers.json`,
    method: 'GET',
    mode: 'cors',
    destination: '',
  });
  assert.equal(result.respondWithCalled, true);
  assert.equal(result.response.type, 'error');
  assert.equal(result.response.status, 0);
  assert.equal(await result.response.text(), '');
});

test('Pages root sync keeps published PWA icons aligned with dist', async () => {
  const workflow = await readFile(resolve(root, '.github/workflows/sync-pages-root.yml'), 'utf8');

  assert.ok(workflow.includes('dist/icons/**'));
  assert.ok(workflow.includes('cp -R dist/icons/. icons/'));
  assert.ok(workflow.includes('git add index.html manifest.json icons sw.js supabase-sync.js'));
});
