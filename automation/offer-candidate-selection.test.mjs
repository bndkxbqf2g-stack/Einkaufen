import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function extractFunction(name, nextName) {
  const start = source.indexOf(`function ${name}`);
  const end = source.indexOf(`\n    function ${nextName}`, start);
  assert.ok(start >= 0 && end > start, `${name} muss im App-Code vorhanden sein`);
  return source.slice(start, end);
}

const compareOfferCandidates = new Function(
  `${extractFunction('parseKnownMoney', 'parseKnownPackageSize')}
${extractFunction('parseKnownPackageSize', 'compareOfferCandidates')}
${extractFunction('compareOfferCandidates', 'calculateOfferAmount')}
return compareOfferCandidates;`,
)();

test('priorisiert belegte Relevanz vor einem Preisvergleich', () => {
  const higherRelevance = { relevance: 90, price: '2,49 €', packSize: '500 g' };
  const lowerRelevance = { relevance: 80, price: '1,49 €', packSize: '500 g' };

  assert.ok(compareOfferCandidates(higherRelevance, lowerRelevance) < 0);
  assert.ok(compareOfferCandidates(lowerRelevance, higherRelevance) > 0);
});

test('vergleicht Preise nur bei identischer sicherer Packungsgröße', () => {
  const cheaper = { relevance: 80, price: '1,49 €', packSize: '500 g' };
  const dearer = { relevance: 80, price: '1,99 €', packSize: '500 g' };
  const differentSize = { relevance: 80, price: '0,99 €', packSize: '1 kg' };

  assert.ok(compareOfferCandidates(cheaper, dearer) < 0);
  assert.equal(compareOfferCandidates(cheaper, differentSize), 0);
  assert.equal(compareOfferCandidates(cheaper, { ...dearer, packSize: '1 Packung' }), 0);
});

test('lässt fehlende oder ungültige Preise ohne künstliche Rangfolge', () => {
  const known = { relevance: 80, price: '1,49 €', packSize: '500 g' };
  const unknown = { relevance: 80, price: 'Preis unbekannt', packSize: '500 g' };

  assert.equal(compareOfferCandidates(known, unknown), 0);
  assert.equal(compareOfferCandidates(unknown, known), 0);
});

console.log('Conservative market candidate checks passed');
