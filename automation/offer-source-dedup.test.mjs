import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { offerDeduplicationKey } from './offer-normalization.mjs';

const appSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const retailerSource = await readFile(new URL('./retailer-offers.mjs', import.meta.url), 'utf8');
const kaufdaSource = await readFile(new URL('./kaufda-offers.mjs', import.meta.url), 'utf8');

test('behält gleichpreisige Angebotsvarianten mit unterschiedlicher Packungsgröße', () => {
  const base = { name: 'Butter', price: '1,99 €', store: 'Aldi', validUntil: '12.11.2026' };
  assert.notEqual(
    offerDeduplicationKey({ ...base, packSize: '200 g' }),
    offerDeduplicationKey({ ...base, packSize: '250 g' }),
  );
  assert.equal(
    offerDeduplicationKey({ ...base, packSize: '200 g' }),
    offerDeduplicationKey({ ...base, packSize: ' 200   g ' }),
  );
});

test('alle Angebotsquellen verwenden den packungsbewussten Deduplizierungsschlüssel', () => {
  assert.match(retailerSource, /offerDeduplicationKey\(offer\)/);
  assert.match(kaufdaSource, /offerDeduplicationKey\(item, config\.store\)/);
  assert.match(kaufdaSource, /offerDeduplicationKey\(offer\)/);
});

test('der App-Importschlüssel bewahrt gleichnamige Packungsvarianten', () => {
  const keyMatch = appSource.match(/function offerImportKey\(offer\) \{[\s\S]*?\n    \}/);
  assert.ok(keyMatch, 'offerImportKey muss im App-Bundle vorhanden sein');
  const offerImportKey = new Function(
    'normalizeIngredient',
    'canonicalMarketName',
    `${keyMatch[0]}; return offerImportKey;`,
  )(
    value => String(value || '').trim().toLowerCase(),
    value => String(value || '').trim(),
  );
  const base = { name: 'Butter', price: '1,99 €', store: 'Aldi', validUntil: '12.11.2026' };
  assert.notEqual(offerImportKey({ ...base, packSize: '200 g' }), offerImportKey({ ...base, packSize: '250 g' }));
  assert.equal(published, appSource);
});

console.log('Offer source deduplication checks passed');

