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
  assert.equal(harness.calls.length, 1);
  assert.equal(harness.calls[0]?.force, true);
  assert.equal(harness.context.automaticOfferRefreshStarted, true);

  assert.equal(await harness.start(), false);
  assert.equal(harness.calls.length, 1);
  assert.equal(harness.calls[0]?.force, true);
});

test('keeps the static seed offers as the non-GitHub fallback path', async () => {
  const harness = createRefreshHarness({ githubPages: false });

  assert.equal(await harness.start(), false);
  assert.equal(harness.calls.length, 0);
  assert.equal(harness.context.automaticOfferRefreshStarted, false);
});

test('renders the local app before the optional initial refresh', () => {
  const startupIndex = source.indexOf('    let automaticOfferRefreshStarted = false;');
  const initialRenderIndex = source.indexOf('    renderApp();', startupIndex);
  const refreshIndex = source.indexOf('    startInitialOfferRefresh().then(renderApp, renderApp);', initialRenderIndex);
  assert.ok(startupIndex >= 0, 'startup block must be present');
  assert.ok(initialRenderIndex > startupIndex, 'the local app must render during startup');
  assert.ok(refreshIndex > initialRenderIndex, 'the optional offer refresh must start afterwards');
  assert.doesNotMatch(source, /startInitialOfferRefresh\(\)\.finally\(/, 'offer refresh must not gate the first render');
});;
