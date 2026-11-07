import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

test('does not show a zero offer amount before verified data is rendered', () => {
  assert.match(source, /id="shoppingOfferLabel">Bekannter Angebotsbetrag<\\/div>/);
  assert.match(source, /id="shoppingOfferTotal">–<\\/div>/);
  assert.match(source, /id="shoppingOfferNote">Noch keine verifizierte Preisbasis<\\/div>/);
  assert.equal(source.includes('id="shoppingOfferTotal">0,00 €</div>'), false);
});

test('keeps the published frontend synchronized with the source page', () => {
  assert.equal(published, source);
});

console.log('Shopping initial cost state checks passed');