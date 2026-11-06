import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'sw.js'), 'utf8');
const origin = 'https://app.example';

function requestKey(request) {
  const value = typeof request === 'string' ? request : request.url;
  return new URL(value, origin).href;
}

function createHarness({ fetchImpl = async () => new Response('network') } = {}) {
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

test('precaches the app shell during install and removes old caches on activate', async () => {
  const harness = createHarness();
  harness.cacheNames.add('angebotskueche-shell-old');

  await harness.dispatch('install');
  assert.deepEqual(harness.addAllCalls, [['./index.html', './manifest.json', './supabase-sync.js']]);
  assert.equal(harness.skipWaitingCalls(), 1);
  assert.ok(harness.entries.has(`${origin}/index.html`));
  assert.ok(harness.entries.has(`${origin}/manifest.json`));
  assert.ok(harness.entries.has(`${origin}/supabase-sync.js`));

  await harness.dispatch('activate');
  assert.deepEqual(harness.deletedCaches, ['angebotskueche-shell-old']);
  assert.equal(harness.claimCalls(), 1);
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

  harness.seed(`${origin}/dashboard`, undefined);
  const shell = await harness.dispatchFetch(new Request(`${origin}/missing`));
  assert.equal(shell.respondWithCalled, true);
  assert.equal(await shell.response.text(), 'precached:./index.html');
  assert.equal(harness.fetchCalls.length, 2);
});

