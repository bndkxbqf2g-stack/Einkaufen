import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('./kaufda-offers.mjs', import.meta.url), 'utf8');
const match = source.match(/function validUntilFrom\(value, now = new Date\(\)\) \{[\s\S]*?\n\}/);
assert.ok(match, 'validUntilFrom muss im KaufDA-Importer vorhanden sein');
const validUntilFrom = new Function(`${match[0]}; return validUntilFrom;`)();

const unitPriceMatch = source.match(/function stripUnitPriceExpressions\(value\) \{[\s\S]*?\n\}/);
const priceMatch = source.match(/function priceFrom\(value\) \{[\s\S]*?\n\}/);
assert.ok(unitPriceMatch, 'stripUnitPriceExpressions muss vorhanden sein');
assert.ok(priceMatch, 'priceFrom muss vorhanden sein');
const priceFrom = new Function(
  `${unitPriceMatch[0]}\n${priceMatch[0]}; return priceFrom;`,
)();

assert.equal(priceFrom('2,49 €'), '2,49 €');
assert.equal(priceFrom('2,49 € / kg'), '–');
assert.equal(priceFrom('1 kg = 2,49 € 1,99 €'), '1,99 €');
assert.equal(priceFrom('2,49 €/kg 1,99 €'), '1,99 €');

assert.equal(
  validUntilFrom('Gültig bis 03.01.', new Date('2026-12-28T12:00:00.000Z')),
  '03.01.2027',
);
assert.equal(
  validUntilFrom('Gültig bis 12.11.', new Date('2026-11-07T12:00:00.000Z')),
  '12.11.2026',
);
assert.equal(validUntilFrom('KaufDA ohne Gültigkeitsende', new Date('2026-11-07T12:00:00.000Z')), null);
assert.equal(
  validUntilFrom('Gültig bis 03.01.2027', new Date('2026-11-07T12:00:00.000Z')),
  '03.01.2027',
);

console.log('KaufDA validity checks passed');

const ocrUnitPriceMatch = source.match(/function stripUnitPriceExpressions\(value\) \{[\s\S]*?\n\}/);
const parseOcrMatch = source.match(/function parseOcr\(text, validUntil, config\) \{[\s\S]*?\n\}/);
assert.ok(ocrUnitPriceMatch, 'stripUnitPriceExpressions muss im KaufDA-Importer vorhanden sein');
assert.ok(parseOcrMatch, 'parseOcr muss im KaufDA-Importer vorhanden sein');
const stripOcrUnitPriceExpressions = new Function(
  `${ocrUnitPriceMatch[0]}; return stripUnitPriceExpressions;`,
)();
const parseOcr = new Function(
  'stripText',
  'likelyFood',
  'extractExplicitRegularPrice',
  'offerPackSize',
  `${ocrUnitPriceMatch[0]}\n${parseOcrMatch[0]}\nreturn parseOcr;`,
)(
  value => String(value || '').replace(/\s+/g, ' ').trim(),
  value => /joghurt/i.test(String(value || '')),
  () => '',
  () => '',
);

assert.doesNotMatch(
  stripOcrUnitPriceExpressions('Joghurt 1 kg = 2,49 € 1,99 €'),
  /2,49/,
);
const parsed = parseOcr(
  'Joghurt Natur\n1 kg = 2,49 €\n1,99 €',
  '31.12.2099',
  { store: 'Aldi' },
);
assert.ok(parsed.length > 0);
assert.ok(parsed.every(offer => offer.price === '1,99 €'));

