import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const match = source.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n    \\}`));
  assert.ok(match, `${name} muss im App-Bundle vorhanden sein`);
  return match[0];
}

const helpers = [
  'isManualOffer',
  'isAutomaticLiveOffer',
  'offerEndDate',
  'isDemoOffer',
  'offerEvidenceStatus',
  'isShoppingOfferCostUsable',
].map(extractFunction).join('\n');
const liveOfferStatus = {
  Aldi: {
    sourceUrl: 'https://example.test/offers',
    validUntil: '31.12.2099',
  },
};
const isShoppingOfferCostUsable = new Function(
  'liveOfferStatus',
  `${helpers}
return isShoppingOfferCostUsable;`,
)(liveOfferStatus);

const verified = {
  store: 'Aldi',
  source: 'Offizieller Live-Import',
  confidence: 'hoch',
  validUntil: '31.12.2099',
  price: '1,20 €',
};

test('accepts only current, source-backed, high-confidence live offers for known costs', () => {
  assert.equal(isShoppingOfferCostUsable(verified), true);
  assert.equal(isShoppingOfferCostUsable({ ...verified, confidence: 'mittel' }), false);
  assert.equal(isShoppingOfferCostUsable({ ...verified, validUntil: '01.01.2020' }), false);
  assert.equal(isShoppingOfferCostUsable(
    { ...verified },
    { ...liveOfferStatus.Aldi, error: 'Quelle momentan nicht erreichbar' },
  ), false);
  assert.equal(isShoppingOfferCostUsable({
    ...verified,
    source: 'manueller Import',
    note: 'manuell importiert',
    confidence: 'niedrig',
  }), false);
});

test('keeps root and published app synchronized and wires the evidence filter into costs', () => {
  assert.equal(published, source);
  assert.match(source, /summarizeShoppingCosts\(items, parseKnownMoney, item => isShoppingOfferCostUsable\(item\?\.offer\)\)/);
  assert.match(source, /calculateOfferAmount\(items, parseKnownMoney, item => isShoppingOfferCostUsable\(item\?\.offer\)\)/);
});

console.log('Shopping offer evidence cost checks passed');
