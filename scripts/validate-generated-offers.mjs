import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function parseDate(value, label) {
  const text = String(value || '').trim();
  const german = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  const date = german
    ? new Date(Date.UTC(Number(german[3]), Number(german[2]) - 1, Number(german[1]), 23, 59, 59, 999))
    : new Date(text);
  if (!text || Number.isNaN(date.getTime())) throw new Error(`${label}: ungültiges Datum`);
  return date;
}

export function validateOfferPayload(payload, fileName = 'Angebotsdatei') {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error(`${fileName}: kein JSON-Objekt`);
  for (const field of ['market', 'sourceUrl', 'parser']) {
    if (!String(payload[field] || '').trim()) throw new Error(`${fileName}: Pflichtfeld ${field} fehlt`);
  }
  if (!/^https?:\/\//i.test(String(payload.sourceUrl))) throw new Error(`${fileName}: sourceUrl ist keine HTTP-Adresse`);
  parseDate(payload.fetchedAt, `${fileName}.fetchedAt`);
  const validUntil = parseDate(payload.validUntil, `${fileName}.validUntil`);
  if (validUntil.getTime() < Date.now()) throw new Error(`${fileName}: Angebot ist abgelaufen`);
  if (!Array.isArray(payload.offers) || payload.offers.length === 0) throw new Error(`${fileName}: offers ist leer`);
  if (payload.recognizedCount !== undefined && Number(payload.recognizedCount) !== payload.offers.length) {
    throw new Error(`${fileName}: recognizedCount stimmt nicht mit offers.length überein`);
  }
  const seen = new Set();
  for (const [index, offer] of payload.offers.entries()) {
    const name = String(offer?.name || '').trim();
    const price = String(offer?.price || '').trim();
    if (name.length < 3) throw new Error(`${fileName}: Angebot ${index + 1} hat keine Bezeichnung`);
    if (!price) throw new Error(`${fileName}: Angebot ${index + 1} hat keinen Preisstatus`);
    const key = `${name.toLocaleLowerCase('de-DE')}|${price}`;
    if (seen.has(key)) throw new Error(`${fileName}: doppeltes Angebot ${name}`);
    seen.add(key);
  }
  return { market: String(payload.market), count: payload.offers.length, validUntil: validUntil.toISOString() };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const files = process.argv.slice(2);
  if (!files.length) throw new Error('Verwendung: node scripts/validate-generated-offers.mjs <datei.json> ...');
  for (const file of files) {
    const payload = JSON.parse(await readFile(resolve(file), 'utf8'));
    const result = validateOfferPayload(payload, file);
    console.log(`${file}: ${result.count} gültige Angebote bis ${result.validUntil}`);
  }
}

