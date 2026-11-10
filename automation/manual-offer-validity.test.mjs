import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const moneyStart = source.indexOf('function parseKnownMoney');
const moneyEnd = source.indexOf('function parseKnownPackageSize', moneyStart);
const moneyHelper = source.slice(moneyStart, moneyEnd);
const helperStart = source.indexOf('function parseManualOfferRow');
const helperEnd = source.indexOf('const planWeekdays', helperStart);
const helper = source.slice(helperStart, helperEnd);
const context = {
  splitOfferRow: row => row.split('|').map(value => value.trim()),
  canonicalMarketName: value => String(value || '').trim(),
  offerEndDate: value => value ? new Date('2099-12-31T00:00:00Z') : null,
};
vm.runInNewContext(`${moneyHelper}\n${helper}\nglobalThis.parseManualOfferRow = parseManualOfferRow;`, context);

test('rejects manual offers without a source-provided validity date', () => {
  const missingDate = context.parseManualOfferRow('Kartoffeln | Aldi | 1,99 € | – | Basis | 2,5 kg');
  assert.equal(missingDate, null);
});

test('accepts explicit dates in both supported manual formats', () => {
  const full = context.parseManualOfferRow('Kartoffeln | Aldi | 1,99 € | – | Basis | 2,5 kg | 31.12.2099 | Prospekt');
  assert.equal(full.validUntil, '31.12.2099');
  assert.equal(full.source, 'Prospekt');
  const legacy = context.parseManualOfferRow('Kartoffeln | Aldi | 1,99 € | – | Basis | 31.12.2099');
  assert.equal(legacy.validUntil, '31.12.2099');
  assert.equal(legacy.packSize, '');
});

test('keeps the published frontend synchronized with the source page', () => {
  assert.equal(published, source);
});

console.log('Manual offer validity checks passed');