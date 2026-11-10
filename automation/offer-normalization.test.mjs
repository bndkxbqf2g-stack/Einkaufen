import assert from 'node:assert/strict';
import test from 'node:test';
import { extractExplicitRegularPrice, offerPackSize } from './offer-normalization.mjs';

test('uses an explicit package size from the product title', () => {
  assert.equal(offerPackSize('Gouda gerieben 150 g'), '150 g');
});

test('reads a package size before the offer price and ignores the unit-price denominator', () => {
  assert.equal(offerPackSize('Naturjoghurt', 'Naturjoghurt 500 g 0,79 € / 100 g'), '500 g');
});

test('normalizes explicit multipacks and piece counts', () => {
  assert.equal(offerPackSize('Mozzarella', 'Mozzarella 2x200g 2,49 €'), '2 x 200 g');
  assert.equal(offerPackSize('Eier', 'Eier 10 Stück 2,79 €'), '10 Stück');
});

test('prefers packaged weight over the unit-price denominator', () => {
  assert.equal(offerPackSize('Paprika-Mix je 500-g-Packg. (1 kg = 1,98 €) 0,99 €'), '500 g');
  assert.equal(offerPackSize('Snack je 10 St. = 280-g-Packg. (1 kg = 8,89 €) 2,49 €'), '280 g');
});

test('preserves explicit package ranges and multipack quantities', () => {
  assert.equal(offerPackSize('Fisch 184 - 225-g-Packg. (1 kg = 10,00 €) 2,49 €'), '184–225 g');
  assert.equal(offerPackSize('Wasser je Ka. 6 x 1-l-Fl. (1 l = 0,50 €) 3,00 €'), '6 x 1 l');
});

test('keeps source alternatives explicit instead of choosing one package size', () => {
  assert.equal(offerPackSize('Butter je 200-g-Becher oder 250-g-Packg. (1 kg = 5,00 €) 1,25 €'), '200 g oder 250 g');
});

test('does not treat a unit-price expression as an explicit package size', () => {
  assert.equal(offerPackSize('Bier 24 x (1 l = 1,00 €) 9,99 €'), '1 Packung');
});

test('does not mistake a unit-price denominator for the package size', () => {
  assert.equal(offerPackSize('Olivenöl', 'Olivenöl 3,99 € / 100 ml'), '1 Packung');
});

test('retains the neutral fallback when no size is explicit', () => {
  assert.equal(offerPackSize('Tomaten', 'Tomaten 1,49 €'), '1 Packung');
});


test('übernimmt reguläre Preise nur aus expliziten Quellenangaben', () => {
  assert.equal(extractExplicitRegularPrice('Äpfel statt 2,49 € jetzt 1,99 €', '1,99 €'), '2,49 €');
  assert.equal(extractExplicitRegularPrice('Joghurt 1 kg = 3,99 € statt 2,49 € · Angebot 1,99 €', '1,99 €'), '2,49 €');
  assert.equal(extractExplicitRegularPrice('Äpfel -20% · 1,99 €', '1,99 €'), '');
  assert.equal(extractExplicitRegularPrice('Äpfel statt 1,99 € jetzt 2,49 €', '2,49 €'), '');
});
