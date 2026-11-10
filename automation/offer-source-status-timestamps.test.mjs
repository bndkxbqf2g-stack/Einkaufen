import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [rootHtml, distHtml] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
]);

assert.equal(distHtml, rootHtml, 'Root- und dist-Bundle müssen synchron sein');

const helperMatch = distHtml.match(/function parseOfferStatusTimestamp\([^)]*\) \{[\s\S]*?\n    \}/);
assert.ok(helperMatch, 'parseOfferStatusTimestamp muss im App-Bundle vorhanden sein');
const parseOfferStatusTimestamp = new Function(
  `${helperMatch[0]}; return parseOfferStatusTimestamp;`,
)();

const renderStart = distHtml.indexOf('function renderSourceStatus');
const renderEnd = distHtml.indexOf('\n    function isImportedOffer', renderStart);
assert.ok(renderStart >= 0 && renderEnd > renderStart, 'Quellstatusrenderer muss vorhanden sein');
const renderSourceStatus = distHtml.slice(renderStart, renderEnd);
assert.match(renderSourceStatus, /parseOfferStatusTimestamp\(live\?\.nextCheckAt\)/);
assert.match(renderSourceStatus, /parseOfferStatusTimestamp\(live\?\.fetchedAt\)/);
assert.match(renderSourceStatus, /parseOfferStatusTimestamp\(live\?\.checkedAt\)/);
assert.doesNotMatch(renderSourceStatus, /new Date\(live\.(?:nextCheckAt|fetchedAt|checkedAt)/);

test('verwirft ungültige Angebots-Zeitstempel statt Invalid Date anzuzeigen', () => {
  assert.equal(parseOfferStatusTimestamp('nicht-ein-datum'), null);
  assert.equal(parseOfferStatusTimestamp(''), null);
  assert.ok(parseOfferStatusTimestamp('2026-11-10T07:00:00.000Z') instanceof Date);
});
