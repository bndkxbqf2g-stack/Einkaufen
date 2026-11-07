import assert from 'node:assert/strict';
import { extractValidUntil, parseLidlOfferText } from './lidl-parser.mjs';

const sample = `Aktionsprospekt Lidl\nGültig von 02.11.2026 bis 07.11.2026\nPfanni Speisekartoffeln\n2,5 kg\n-24%\n2,49 €\nMüller Joghurt mit der Ecke\n150 g\n0,33 €\nWC-Reiniger\n750 ml\n1,49 €`;
assert.equal(extractValidUntil(sample), '07.11.2026');
assert.equal(extractValidUntil('Lidl Wochenangebote ohne Datumsangabe'), null);
const offers = parseLidlOfferText(sample);
assert.equal(offers.length, 2);
assert.equal(offers[0].name, 'Pfanni Speisekartoffeln');
assert.equal(offers[0].price, '2,49 €');
assert.equal(offers[1].name, 'Müller Joghurt mit der Ecke');
assert.equal(parseLidlOfferText('ZUSTIMMEN Lohnt sich 2,11 €\nFüllung: reine Wolle 6,99 €').length, 0);
assert.equal(parseLidlOfferText('Normalpreis: 2,35 €').length, 0);
assert.equal(parseLidlOfferText('Pfanni Speisekartoffeln\n2,49 €')[0].validUntil, null);
console.log('Lidl parser checks passed');

const unitPriceOnly = parseLidlOfferText('Naturjoghurt\n(1 kg = 1,58 €)\n0,79 €');
assert.equal(unitPriceOnly.length, 1);
assert.equal(unitPriceOnly[0].price, '0,79 €');
assert.equal(unitPriceOnly[0].packSize, '1 Packung');

const explicitPackSize = parseLidlOfferText('Naturjoghurt 500 g\n(1 kg = 1,58 €)\n0,79 €');
assert.equal(explicitPackSize.length, 1);
assert.equal(explicitPackSize[0].price, '0,79 €');
assert.equal(explicitPackSize[0].packSize, '500 g');
