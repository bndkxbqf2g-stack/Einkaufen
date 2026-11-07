import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const match = source.match(new RegExp(`    function ${name}\\([\\s\\S]*?\\n    \\}`));
  assert.ok(match, `${name} muss im Frontend vorhanden sein`);
  return new Function('Date', `${match[0]}; return ${name};`);
}

const offerEndDate = extractFunction('offerEndDate')(Date);
const defaultOfferEnd = extractFunction('defaultOfferEnd');

test('root and published frontend keep the same expiry helpers', () => {
  assert.equal(published, source);
  assert.match(source, /!end \|\| end < new Date\(\)/);
});

test('manual offers remain current through the final millisecond of their validity date', () => {
  const end = offerEndDate('28.02.2026');
  const justBefore = new Date(end.getTime() - 1);
  const justAfter = new Date(end.getTime() + 1);

  assert.equal(end.getHours(), 23);
  assert.equal(end.getMinutes(), 59);
  assert.equal(end.getSeconds(), 59);
  assert.equal(end.getMilliseconds(), 999);
  assert.equal(end >= justBefore, true);
  assert.equal(end >= justAfter, false);
});

test('default offer expiry crosses month and year boundaries by calendar days', () => {
  class FixedDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : ['2026-12-28T12:00:00']));
    }
  }

  assert.equal(defaultOfferEnd(FixedDate)(), '04.01.2027');
});

