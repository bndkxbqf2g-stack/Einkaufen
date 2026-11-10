import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [rootHtml, distHtml] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
]);
assert.equal(distHtml, rootHtml, 'Root- und dist-Bundle müssen synchron sein');

const moneyMatch = distHtml.match(/function parseKnownMoney\(value\) \{[\s\S]*?\n    \}/);
const manualMatch = distHtml.match(/function parseManualOfferRow\(row\) \{[\s\S]*?\n    \}/);
assert.ok(moneyMatch, 'parseKnownMoney muss im App-Bundle vorhanden sein');
assert.ok(manualMatch, 'parseManualOfferRow muss im App-Bundle vorhanden sein');

const parseManualOfferRow = runInNewContext(
  `${moneyMatch[0]}\n${manualMatch[0]}\nparseManualOfferRow`,
  {
    splitOfferRow: row => String(row).split('|').map(value => value.trim()),
    canonicalMarketName: value => String(value || '').trim(),
    offerEndDate: value => String(value || '').trim() ? new Date('2099-12-31T12:00:00.000Z') : null,
  },
);

test('akzeptiert manuelle Angebote mit explizitem Euro-Packungspreis', () => {
  const parsed = parseManualOfferRow('Kartoffeln|Aldi|1,99 €|–|Hauptzutat||31.12.2099|manueller Import');
  assert.equal(parsed?.price, '1,99 €');
});

test('verwirft manuelle Grundpreise statt sie als Packungspreis zu übernehmen', () => {
  assert.equal(
    parseManualOfferRow('Kartoffeln|Aldi|2,49 €/kg|–|Hauptzutat||31.12.2099|manueller Import'),
    null,
  );
  assert.equal(
    parseManualOfferRow('Kartoffeln|Aldi|2,49 € / 1 kg|–|Hauptzutat||31.12.2099|manueller Import'),
    null,
  );
});
