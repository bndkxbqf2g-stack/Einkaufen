import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const rootHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const distHtml = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

assert.equal(distHtml, rootHtml, 'Root- und dist-Bundle müssen synchron sein');

function extractFunction(source, name) {
  const match = source.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n    \\}`));
  assert.ok(match, `${name} muss im App-Bundle vorhanden sein`);
  return match[0];
}

const offerEndDate = extractFunction(distHtml, 'offerEndDate');
const isOfferRefreshDue = extractFunction(distHtml, 'isOfferRefreshDue');

function buildRefreshDue(status, fallbackMs = 7 * 24 * 60 * 60 * 1000) {
  return new Function(
    'liveOfferStatus',
    'offerRefreshFallbackMs',
    `${offerEndDate}
${isOfferRefreshDue}
return isOfferRefreshDue;`,
  )(status, fallbackMs)('Aldi');
}

test('ignoriert ungültiges nextCheckAt und verwendet validUntil als Fallback', () => {
  const due = buildRefreshDue({
    Aldi: {
      nextCheckAt: 'nicht-ein-datum',
      validUntil: '01.01.2000',
      fetchedAt: new Date().toISOString(),
    },
  });

  assert.equal(due, true);
});

test('verwendet ein gültiges zukünftiges nextCheckAt weiterhin als Priorität', () => {
  const due = buildRefreshDue({
    Aldi: {
      nextCheckAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      validUntil: '01.01.2000',
      fetchedAt: new Date(0).toISOString(),
    },
  });

  assert.equal(due, false);
});
