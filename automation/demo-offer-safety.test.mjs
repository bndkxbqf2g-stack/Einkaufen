import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const distHtml = fs.readFileSync(path.join(repoRoot, 'dist', 'index.html'), 'utf8');

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `Function ${name} must remain available`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Could not extract function ${name}`);
}

const isDemoOffer = new Function(
  `${extractFunction(html, 'isDemoOffer')}; return isDemoOffer;`,
)();

test('identifies synthetic demo offers separately from verified sources', () => {
  assert.equal(isDemoOffer({ source: 'Demo-Import' }), true);
  assert.equal(isDemoOffer({ demo: true, source: 'Manueller Import' }), true);
  assert.equal(isDemoOffer({ source: 'Offizieller Live-Import', confidence: 'hoch' }), false);
  assert.equal(isDemoOffer({ source: 'Manueller Import', confidence: 'niedrig' }), false);
});

test('does not use demo offers for active planning or market counts', () => {
  const activeFilter = 'offers.filter(offer => isOfferCurrent(offer) && !isDemoOffer(offer))';
  const marketFilter = 'isOfferCurrent(offer) && !isDemoOffer(offer) && offer.store === name';

  const count = needle => html.split(needle).length - 1;
  assert.equal(count(activeFilter), 3);
  assert.equal(count(marketFilter), 2);
  assert.match(html, /Offline-Beispieldaten werden nicht für Planung oder Kosten verwendet/);
});

test('keeps the published frontend synchronized with the source page', () => {
  assert.equal(distHtml, html);
});

console.log('Demo offer safety checks passed');
