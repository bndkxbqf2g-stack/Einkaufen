import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
assert.equal(published, source, 'published bundle must stay byte-identical to the source');

const helperMatch = source.match(/    function startInitialOfferRefresh\(\) \{[\s\S]*?\r?\n    \}/);
assert.ok(helperMatch, 'initial offer refresh helper must be present');

function createRefreshHarness({ githubPages = true } = {}) {
  const calls = [];
  const context = {
    isGithubPagesHost: githubPages,
    automaticOfferRefreshStarted: false,
    refreshOfficialOffers(options) {
      calls.push(options);
      return Promise.resolve(true);
    },
  };
  const start = vm.runInNewContext(
    `${helperMatch[0]}\nglobalThis.startInitialOfferRefresh = startInitialOfferRefresh;`,
    context,
    { filename: 'offer-initial-refresh.js' },
  );
  return { calls, context, start };
}

test('loads current generated offers with a forced refresh before the first plan render', async () => {
  const harness = createRefreshHarness();

  assert.equal(await harness.start(), true);
  assert.deepEqual(harness.calls, [{ force: true }]);
  assert.equal(harness.context.automaticOfferRefreshStarted, true);

  assert.equal(await harness.start(), false);
  assert.deepEqual(harness.calls, [{ force: true }]);
});

test('keeps the static seed offers as the non-GitHub fallback path', async () => {
  const harness = createRefreshHarness({ githubPages: false });

  assert.equal(await harness.start(), false);
  assert.deepEqual(harness.calls, []);
  assert.equal(harness.context.automaticOfferRefreshStarted, false);
});

test('waits for the initial refresh before the initial plan render callback', async () => {
  const events = [];
  const context = {
    isGithubPagesHost: true,
    refreshOfficialOffers() {
      events.push('refresh');
      return Promise.resolve(true);
    },
    renderPlan: () => events.push('plan'),
    renderSuggestions: () => events.push('suggestions'),
    renderHighlights: () => events.push('highlights'),
    renderMarkets: () => events.push('markets'),
    renderFavorites: () => events.push('favorites'),
    renderPantry: () => events.push('pantry'),
    renderSourceStatus: () => events.push('source-status'),
    setTimeout,
  };
  const startupMatch = source.match(/    let automaticOfferRefreshStarted = false;\r?\n    startInitialOfferRefresh\(\)\.finally\(\(\) => \{[\s\S]*?\r?\n    \}\);/);
  assert.ok(startupMatch, 'initial rendering must be gated by the refresh promise');
  vm.runInNewContext(
    `${helperMatch[0]}\n${startupMatch[0]}`,
    context,
    { filename: 'offer-initial-startup.js' },
  );

  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(events, ['refresh', 'plan', 'suggestions', 'highlights', 'markets', 'favorites', 'pantry', 'source-status']);
});
