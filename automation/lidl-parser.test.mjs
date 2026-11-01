import assert from 'node:assert/strict';
import { extractValidUntil, parseLidlOfferText } from './lidl-parser.mjs';

const sample = `Aktionsprospekt Lidl\nGültig von 02.11.2026 bis 07.11.2026\nPfanni Speisekartoffeln\n2,5 kg\n-24%\n2,49 €\nMüller Joghurt mit der Ecke\n150 g\n0,33 €\nWC-Reiniger\n750 ml\n1,49 €`;
assert.equal(extractValidUntil(sample), '07.11.2026');
const offers = parseLidlOfferText(sample);
assert.equal(offers.length, 2);
assert.equal(offers[0].name, 'Pfanni Speisekartoffeln');
assert.equal(offers[0].price, '2,49 €');
assert.equal(offers[1].name, 'Müller Joghurt mit der Ecke');
assert.equal(parseLidlOfferText('ZUSTIMMEN Lohnt sich 2,11 €\nFüllung: reine Wolle 6,99 €').length, 0);
console.log('Lidl parser checks passed');
