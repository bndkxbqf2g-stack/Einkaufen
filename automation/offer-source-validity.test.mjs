import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

function extractFunction(source, name) {
  const match = source.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n    \\}`));
  assert.ok(match, `${name} muss im App-Bundle vorhanden sein`);
  return match[0];
}

const offerEndDate = extractFunction(html, 'offerEndDate');
const offerEvidenceStatus = extractFunction(html, 'offerEvidenceStatus');
const isShoppingOfferCostUsable = extractFunction(html, 'isShoppingOfferCostUsable');
const shoppingOfferEvidenceLabel = extractFunction(html, 'shoppingOfferEvidenceLabel');

const buildEvidence = new Function(
  'liveOfferStatus',
  'offerEndDate',
  'isManualOffer',
  'isDemoOffer',
  'isAutomaticLiveOffer',
  `${offerEndDate}
${offerEvidenceStatus}
${isShoppingOfferCostUsable}
${shoppingOfferEvidenceLabel}
return { offerEvidenceStatus, isShoppingOfferCostUsable, shoppingOfferEvidenceLabel };
`,
);

const functions = buildEvidence(
  {},
  null,
  () => false,
  () => false,
  () => true,
);

test('verwirft Angebote mit abgelaufenem Quell-Snapshot trotz späterem Angebotsende', () => {
  const offer = { store: 'Aldi', validUntil: '31.12.2099', confidence: 'hoch' };
  const expiredSource = {
    sourceUrl: 'https://example.test/offers',
    validUntil: '01.01.2000',
  };

  assert.equal(functions.isShoppingOfferCostUsable(offer, expiredSource), false);
  assert.match(
    functions.shoppingOfferEvidenceLabel(offer, expiredSource),
    /Quellenstand abgelaufen/,
  );
});

test('akzeptiert verifizierte Angebote bei aktuellem Quell-Snapshot', () => {
  const offer = { store: 'Aldi', validUntil: '31.12.2099', confidence: 'hoch' };
  const currentSource = {
    sourceUrl: 'https://example.test/offers',
    validUntil: '31.12.2099',
  };

  assert.equal(functions.isShoppingOfferCostUsable(offer, currentSource), true);
});
