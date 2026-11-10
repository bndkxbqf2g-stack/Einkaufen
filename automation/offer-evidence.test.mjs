import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const evidenceStart = source.indexOf('function offerEvidenceStatus');
const evidenceEnd = source.indexOf('\n    function formatEuro', evidenceStart);
assert.ok(evidenceStart >= 0 && evidenceEnd > evidenceStart, 'Evidenzfunktionen müssen im App-Bundle vorhanden sein');
const parseOfferEndDate = value => {
  const match = String(value || '').match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  return match ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 23, 59, 59, 999) : null;
};
const evidenceHelpers = new Function(
  'liveOfferStatus',
  'isManualOffer',
  'isDemoOffer',
  'isAutomaticLiveOffer',
  'offerEndDate',
  `${source.slice(evidenceStart, evidenceEnd)}; return { offerEvidenceStatus, shoppingOfferEvidenceLabel, shoppingOfferSavingLabel };`,
)({}, offer => /manuell|custom/i.test(`${offer?.source || ''} ${offer?.note || ''}`), offer => String(offer?.source || '').toLowerCase() === 'demo-import', offer => String(offer?.source || '') === 'Offizieller Live-Import', parseOfferEndDate);


test('does not reuse an unverified recipe reason as offer evidence', () => {
  const verifiedReason = "const reason = matchedNames.length ? `${matchedNames.join(' + ')} im Angebot` : 'Noch kein direkter Angebotsanker';";
  assert.ok(source.includes(verifiedReason));
  assert.equal(source.includes("matchedNames.length ? `${matchedNames.join(' + ')} im Angebot` : (recipe.reason"), false);
});

test('labels recipe-plan entries according to actual offer matches', () => {
  assert.ok(source.includes("match.matchedIngredients.length ? 'Angebotsanker' : 'Angebotsbezug offen'"));
  assert.ok(source.includes("note: match.reason || 'Angebotsbezug noch nicht verifiziert'"));
});

test('keeps the published frontend synchronized with the source page', () => {
  assert.equal(published, source);
});

test('labels a current official source and keeps a saving as source evidence', () => {
  const offer = { store: 'Aldi', source: 'Offizieller Live-Import', validUntil: '31.12.2099', saving: '-20 %' };
  const status = { sourceUrl: 'https://aldi.example/angebote', validUntil: '31.12.2099' };
  assert.match(evidenceHelpers.shoppingOfferEvidenceLabel(offer, status), /Quelle bekannt · gültig bis 31\.12\.2099/);
  assert.equal(evidenceHelpers.shoppingOfferSavingLabel(offer, status), 'Quellenhinweis des Angebots: -20 % · nicht berechnet');
});

test('keeps missing source, saving and cache-fallback evidence explicitly open', () => {
  const offer = { store: 'Aldi', source: 'Offizieller Live-Import', validUntil: '31.12.2099', saving: '–' };
  assert.match(evidenceHelpers.shoppingOfferEvidenceLabel(offer, {}), /Quelle nicht belegt/);
  assert.equal(evidenceHelpers.shoppingOfferSavingLabel(offer, {}), 'Vergleichspreis nicht belegt');
  const fallback = { sourceUrl: 'https://aldi.example/angebote', validUntil: '31.12.2099', error: 'Offline: letzter Angebotsstand wird beibehalten.' };
  assert.match(evidenceHelpers.shoppingOfferEvidenceLabel({ ...offer, saving: '-20 %' }, fallback), /letzte Prüfung fehlgeschlagen/);
  assert.equal(evidenceHelpers.shoppingOfferSavingLabel({ ...offer, saving: '-20 %' }, fallback), 'Vergleichspreis nicht belegt');
});

test('marks manual and expired offers as unverified', () => {
  const manual = { store: 'Aldi', source: 'manueller Import', note: 'manuell importiert', validUntil: '31.12.2099', saving: '-20 %' };
  assert.match(evidenceHelpers.shoppingOfferEvidenceLabel(manual, { sourceUrl: 'https://aldi.example/angebote', validUntil: '31.12.2099' }), /Quelle nicht verifiziert · manueller Import/);
  assert.equal(evidenceHelpers.shoppingOfferSavingLabel(manual, { sourceUrl: 'https://aldi.example/angebote', validUntil: '31.12.2099' }), 'Vergleichspreis nicht belegt');
  const expired = { store: 'Aldi', source: 'Offizieller Live-Import', validUntil: '01.01.2000', saving: '-20 %' };
  assert.match(evidenceHelpers.shoppingOfferEvidenceLabel(expired, { sourceUrl: 'https://aldi.example/angebote', validUntil: '01.01.2000' }), /Nicht verifiziert · abgelaufen/);
  assert.equal(evidenceHelpers.shoppingOfferSavingLabel(expired, { sourceUrl: 'https://aldi.example/angebote', validUntil: '01.01.2000' }), 'Vergleichspreis nicht belegt');
});

test('renders evidence and saving status in shopping items without calculating comparisons', () => {
  assert.match(source, /shoppingOfferEvidenceLabel\(item\.offer\)/);
  assert.match(source, /shoppingOfferSavingLabel\(item\.offer\)/);
  assert.match(source, /Vergleichspreis nicht belegt/);
  assert.match(source, /Quellenhinweis des Angebots/);
  assert.match(source, /shoppingOfferRegularPriceLabel\(item\.offer\)/);
});
test('shares the same evidence status with the open shopping list', () => {
  assert.ok(source.includes("const evidenceLabel = item.offer ? shoppingOfferEvidenceLabel(item.offer) : '';"));
  assert.ok(source.includes("const savingLabel = item.offer ? shoppingOfferSavingLabel(item.offer) : '';"));
  assert.ok(source.includes("const regularPriceLabel = item.offer ? shoppingOfferRegularPriceLabel(item.offer) : '';"));
  assert.ok(source.includes('${amountLabel} · ${evidenceLabel} · ${regularPriceLabel || savingLabel}'));
  assert.equal(published, source);
});
console.log('Offer evidence checks passed');