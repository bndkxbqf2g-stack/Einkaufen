import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';

const requiredTextFields = ['market', 'sourceUrl', 'fetchedAt', 'validUntil', 'parser'];
const currencyPricePattern = /^(?:ab\s+)?\d{1,3}(?:\.\d{3})*(?:,\d{2})?\s*€$/i;
const nonOfferNamePattern = /\bverfügbar\s+(?:ab|seit)\b/i;
const dateOnlyPattern = /^(?:(\d{1,2})\.(\d{1,2})\.(\d{4})|(\d{4})-(\d{2})-(\d{2}))$/;

function isValidCalendarDate(value) {
  const match = String(value || '').trim().match(dateOnlyPattern);
  if (!match) return false;

  const day = Number(match[1] || match[6]);
  const month = Number(match[2] || match[5]);
  const year = Number(match[3] || match[4]);
  if (year < 1 || month < 1 || month > 12) return false;

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= daysInMonth[month - 1];
}

export function validateOfferSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new Error('Angebotssnapshot muss ein Objekt sein.');
  }

  for (const field of requiredTextFields) {
    if (typeof snapshot[field] !== 'string' || !snapshot[field].trim()) {
      throw new Error(`Angebotssnapshot ohne gültiges Feld "${field}".`);
    }
  }

  if (!isValidCalendarDate(snapshot.validUntil)) {
    throw new Error('Angebotssnapshot: "validUntil" muss ein gültiges Kalenderdatum (TT.MM.JJJJ oder JJJJ-MM-TT) sein.');
  }

  if (!Array.isArray(snapshot.offers) || snapshot.offers.length === 0) {
    throw new Error('Leerer Angebotssnapshot wird nicht veröffentlicht.');
  }

  if (snapshot.recognizedCount !== undefined && snapshot.recognizedCount !== snapshot.offers.length) {
    throw new Error('Angebotssnapshot: recognizedCount stimmt nicht mit offers.length überein.');
  }

  snapshot.offers.forEach((offer, index) => {
    if (!offer || typeof offer !== 'object' || Array.isArray(offer)) {
      throw new Error(`Angebotssnapshot: Angebot ${index + 1} ist ungültig.`);
    }
    for (const field of ['name', 'price', 'validUntil']) {
      if (typeof offer[field] !== 'string' || !offer[field].trim()) {
        throw new Error(`Angebotssnapshot: Angebot ${index + 1} hat kein gültiges Feld "${field}".`);
      }
    }
    if (!isValidCalendarDate(offer.validUntil)) {
      throw new Error(`Angebotssnapshot: Gültigkeitsdatum von Angebot ${index + 1} ist kein gültiges Kalenderdatum.`);
    }
    if (nonOfferNamePattern.test(offer.name)) {
      throw new Error(`Angebotssnapshot: Angebot ${index + 1} enthält Angebotsmetadaten statt eines Produktnamens.`);
    }
    if (!currencyPricePattern.test(offer.price.trim())) {
      throw new Error(`Angebotssnapshot: Preis von Angebot ${index + 1} ist kein eindeutiger Eurobetrag.`);
    }
  });

  return snapshot;
}

export async function writeOfferSnapshot(filePath, snapshot) {
  validateOfferSnapshot(snapshot);

  const target = resolve(filePath);
  const temporary = resolve(dirname(target), `.${basename(target)}.${randomUUID()}.tmp`);
  await mkdir(dirname(target), { recursive: true });

  try {
    await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, target);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => {});
    throw error;
  }

  return target;
}
