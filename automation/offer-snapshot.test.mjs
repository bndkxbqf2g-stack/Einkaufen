import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateOfferSnapshot, writeOfferSnapshot } from './offer-snapshot.mjs';

const validSnapshot = {
  market: 'Lidl',
  sourceUrl: 'https://example.test/offers',
  fetchedAt: '2026-11-06T12:00:00.000Z',
  validUntil: '12.11.2026',
  parser: 'test-v1',
  recognizedCount: 1,
  offers: [{ name: 'Kartoffeln', price: '1,99 €', validUntil: '12.11.2026' }],
};

test('rejects empty and inconsistent offer snapshots', () => {
  assert.throws(() => validateOfferSnapshot({ ...validSnapshot, offers: [], recognizedCount: 0 }), /Leerer Angebotssnapshot/);
  assert.throws(() => validateOfferSnapshot({ ...validSnapshot, recognizedCount: 2 }), /recognizedCount/);
  assert.throws(() => validateOfferSnapshot({ ...validSnapshot, validUntil: '' }), /gültiges Feld "validUntil"/);
  assert.throws(() => validateOfferSnapshot({ ...validSnapshot, offers: [{ name: 'Kartoffeln', price: '–', validUntil: '' }] }), /validUntil/);
});

test('requires a complete HTTPS source URL without embedded credentials', () => {
  for (const sourceUrl of ['javascript:alert(1)', 'http://example.test/offers', 'https://user:secret@example.test/offers', '/offers']) {
    assert.throws(
      () => validateOfferSnapshot({ ...validSnapshot, sourceUrl }),
      /sourceUrl.*HTTPS-Adresse ohne Zugangsdaten/
    );
  }
  assert.doesNotThrow(() => validateOfferSnapshot(validSnapshot));
});

test('rejects page metadata and prices that do not contain an explicit euro amount', () => {
  assert.throws(
    () => validateOfferSnapshot({ ...validSnapshot, offers: [{ name: 'Verfügbar seit', price: '02,11 €', validUntil: '12.11.2026' }] }),
    /Angebotsmetadaten/
  );
  assert.throws(
    () => validateOfferSnapshot({ ...validSnapshot, offers: [{ name: 'Kartoffeln', price: 'ab 1,99', validUntil: '12.11.2026' }] }),
    /kein eindeutiger Eurobetrag/
  );
});

test('accepts only source-defined German thousands grouping for euro amounts', () => {
  for (const price of ['1.234 €', '1.234,56 €']) {
    assert.doesNotThrow(() => validateOfferSnapshot({
      ...validSnapshot,
      offers: [{ name: 'Kartoffeln', price, validUntil: '12.11.2026' }],
    }));
  }

  assert.throws(
    () => validateOfferSnapshot({
      ...validSnapshot,
      offers: [{ name: 'Kartoffeln', price: '1,234 €', validUntil: '12.11.2026' }],
    }),
    /kein eindeutiger Eurobetrag/
  );
});

test('accepts supported date-only formats and rejects impossible calendar dates', () => {
  assert.doesNotThrow(() => validateOfferSnapshot({
    ...validSnapshot,
    validUntil: '2028-02-29',
    offers: [{ name: 'Kartoffeln', price: '1,99 €', validUntil: '29.02.2028' }],
  }));
  assert.throws(
    () => validateOfferSnapshot({ ...validSnapshot, validUntil: '31.02.2026' }),
    /gültiges Kalenderdatum/
  );
  assert.throws(
    () => validateOfferSnapshot({
      ...validSnapshot,
      offers: [{ name: 'Kartoffeln', price: '1,99 €', validUntil: '2026-02-30' }],
    }),
    /Gültigkeitsdatum von Angebot 1 ist kein gültiges Kalenderdatum/
  );
});

test('rejects snapshots and offers already expired at their recorded fetch time', () => {
  assert.throws(
    () => validateOfferSnapshot({ ...validSnapshot, validUntil: '05.11.2026' }),
    /"validUntil" liegt vor dem Abrufzeitpunkt/
  );
  assert.throws(
    () => validateOfferSnapshot({
      ...validSnapshot,
      offers: [{ name: 'Kartoffeln', price: '1,99 €', validUntil: '2026-11-05' }],
    }),
    /Angebot 1 ist bereits vor dem Abrufzeitpunkt abgelaufen/
  );
  assert.throws(
    () => validateOfferSnapshot({ ...validSnapshot, fetchedAt: '31.02.2026' }),
    /gültiger ISO-8601-UTC-Zeitpunkt/
  );
});

test('rejects snapshots and offers already expired at publication time', () => {
  const now = new Date('2026-11-07T12:00:00.000Z');
  assert.throws(
    () => validateOfferSnapshot({ ...validSnapshot, validUntil: '06.11.2026' }, { now }),
    /"validUntil" ist bereits abgelaufen/
  );
  assert.throws(
    () => validateOfferSnapshot({
      ...validSnapshot,
      offers: [{ name: 'Kartoffeln', price: '1,99 €', validUntil: '06.11.2026' }],
    }, { now }),
    /Angebot 1 ist bereits abgelaufen/
  );
});

test('does not replace the last good file when a snapshot is invalid', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'angebot-snapshot-test-'));
  const output = join(directory, 'offers.json');
  const previous = JSON.stringify({ ...validSnapshot, parser: 'previous-good-snapshot' });

  try {
    await writeFile(output, previous, 'utf8');
    await assert.rejects(writeOfferSnapshot(output, { ...validSnapshot, offers: [], recognizedCount: 0 }), /Leerer Angebotssnapshot/);
    await assert.rejects(
      writeOfferSnapshot(output, { ...validSnapshot, offers: [{ name: 'Verfügbar seit', price: '02,11 €', validUntil: '12.11.2026' }] }),
      /Angebotsmetadaten/
    );
    assert.equal(await readFile(output, 'utf8'), previous);
    assert.deepEqual(await readdir(directory), ['offers.json']);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('atomically writes a valid snapshot', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'angebot-snapshot-test-'));
  const output = join(directory, 'offers.json');

  try {
    await writeOfferSnapshot(output, validSnapshot);
    assert.deepEqual(JSON.parse(await readFile(output, 'utf8')), validSnapshot);
    assert.deepEqual(await readdir(directory), ['offers.json']);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});


test('all committed retailer snapshots satisfy the historical publication contract', async () => {
  const generatedDirectory = new URL('../generated/', import.meta.url);
  const files = (await readdir(generatedDirectory)).filter(file => file.endsWith('-offers.json'));
  assert.ok(files.length > 0, 'expected committed retailer offer snapshots');

  for (const file of files) {
    const snapshot = JSON.parse(await readFile(new URL(file, generatedDirectory), 'utf8'));
    assert.doesNotThrow(() => validateOfferSnapshot(snapshot, { now: snapshot.fetchedAt }), file);
  }
});
