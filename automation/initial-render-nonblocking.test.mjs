import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [source, published] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
]);

test('rendert den lokalen App-Kern vor dem optionalen Angebotsabruf', () => {
  const renderAppIndex = source.indexOf('const renderApp = () => {');
  const firstRenderIndex = source.indexOf('    renderApp();', renderAppIndex);
  const refreshIndex = source.indexOf('    startInitialOfferRefresh().then(renderApp, renderApp);');
  assert.ok(renderAppIndex >= 0, 'renderApp must be present');
  assert.ok(firstRenderIndex > renderAppIndex, 'the initial render must call renderApp');
  assert.ok(refreshIndex > firstRenderIndex, 'offer refresh must start after the initial render');
  assert.doesNotMatch(source, /startInitialOfferRefresh\(\)\.finally\(/, 'offer refresh must not gate the first render');
  assert.equal(published, source, 'published bundle must stay byte-identical to the source');
});
