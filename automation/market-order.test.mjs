import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [rootSource, publishedSource] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
]);

function loadSortedSelectedMarkets(source, settings, marketDetails) {
  const match = source.match(/function sortedSelectedMarkets\(\) \{[\\s\\S]*?\n    \}/);
  assert.ok(match, 'sortedSelectedMarkets must remain present');
  const context = { settings, marketDetails, DEFAULT_SELECTED_MARKETS: ['Aldi', 'Kaufland', 'Lidl', 'EDEKA'] };
  runInNewContext(match[0] + '\\nthis.result = sortedSelectedMarkets();', context);
  return context.result;
}

test('ordnet Märkte mit unbekannter Entfernung nach den numerisch bekannten Märkten ein', () => {
  const result = loadSortedSelectedMarkets(rootSource, { selectedMarkets: ['Bring', 'Aldi', 'EDEKA'], markets: 1 }, {
    Bring: { distance: 'Cloud-Browser' },
    Aldi: { distance: '4,8 km' },
    EDEKA: { distance: '3,1 km' },
  });
  assert.deepEqual(result, ['EDEKA', 'Aldi', 'Bring']);
});

test('verwendet bei gleicher Entfernung einen stabilen deutschen Namens-Tie-Break', () => {
  const result = loadSortedSelectedMarkets(rootSource, { selectedMarkets: ['Lidl', 'Aldi'], markets: 2 }, {
    Lidl: { distance: '5,0 km' },
    Aldi: { distance: '5,0 km' },
  });
  assert.deepEqual(result, ['Aldi', 'Lidl']);
});

test('Root- und dist-App bleiben bytegleich', () => {
  assert.equal(publishedSource, rootSource);
});

console.log('Market ordering checks passed');
