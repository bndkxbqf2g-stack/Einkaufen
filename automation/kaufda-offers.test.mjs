import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('./kaufda-offers.mjs', import.meta.url), 'utf8');
const match = source.match(/function validUntilFrom\(value, now = new Date\(\)\) \{[\s\S]*?\n\}/);
assert.ok(match, 'validUntilFrom muss im KaufDA-Importer vorhanden sein');
const validUntilFrom = new Function(`${match[0]}; return validUntilFrom;`)();

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
