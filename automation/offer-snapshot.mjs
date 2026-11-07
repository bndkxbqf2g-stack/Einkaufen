import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';

const requiredTextFields = ['market', 'sourceUrl', 'fetchedAt', 'validUntil', 'parser'];
const currencyPricePattern = /^(?:ab\s+)?\d{1,3}(?:\.\d{3})*(?:,\d{2})?\s*€$/i;
const nonOfferNamePattern = /\bverfügbar\s+(?:ab|seit)\b/i;
const dateOnlyPattern = /^(?:(\d{1,2})\.(\d{1,2})\.(\d{4})|(\d{4})-(\d{2})-(\d{2}))$/;
const fetchedAtPattern = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?Z$/;

function calendarDateParts(value) {
  const match = String(value || '').trim().match(dateOnlyPattern);
  if (!match) return null;

  return {
    day: Number(match[1] || match[6]),
    month: Number(match[2] || match[5]),
    year: Number(match[3] || match[4]),
  };
}

function isValidCalendarDate(value) {
  const date = calendarDateParts(value);
  if (!date || date.year < 1 || date.month < 1 || date.month > 12) return false;

  const leapYear = date.year % 4 === 0 && (date.year % 100 !== 0 || date.year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return date.day >= 1 && date.day <= daysInMonth[date.month - 1];
}

function dateOrdinal(value) {
  const date = calendarDateParts(value);
  return date ? date.year * 10000 + date.month * 100 + date.day : null;
}

function fetchedAtDateOrdinal(value) {
  const match = String(value || '').trim().match(fetchedAtPattern);
  if (!match) return null;
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (!isValidCalendarDate(`${match[1]}-${match[2]}-${match[3]}`)) return null;
  return date.year * 10000 + date.month * 100 + date.day;
}

function currentDateOrdinal(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
}

function isSecureSourceUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function validateOfferSnapshot(snapshot, { now = new Date() } = {}) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new Error('Angebotssnapshot muss ein Objekt sein.');
  }

  const currentDate = currentDateOrdinal(now);
  if (currentDate === null) {
    throw new Error('Angebotssnapshot: "now" muss ein gültiger Zeitpunkt sein.');
  }

  for (const field of requiredTextFields) {
    if (typeof snapshot[field] !== 'string' || !snapshot[field].trim()) {
      throw new Error(`Angebotssnapshot ohne gültiges Feld "${field}".`);
    }
  }

  if (!isSecureSourceUrl(snapshot.sourceUrl)) {
    throw new Error('Angebotssnapshot: "sourceUrl" muss eine vollständige HTTPS-Adresse ohne Zugangsdaten sein.');
  }

  if (!isValidCalendarDate(snapshot.validUntil)) {
    throw new Error('Angebotssnapshot: "validUntil" muss ein gültiges Kalenderdatum (TT.MM.JJJJ oder JJJJ-MM-TT) sein.');
  }
  const fetchedAtDate = fetchedAtDateOrdinal(snapshot.fetchedAt);
  if (fetchedAtDate === null) {
    throw new Error('Angebotssnapshot: "fetchedAt" muss ein gültiger ISO-8601-UTC-Zeitpunkt sein.');
  }
  if (dateOrdinal(snapshot.validUntil) < fetchedAtDate) {
    throw new Error('Angebotssnapshot: "validUntil" liegt vor dem Abrufzeitpunkt.');
  }
  if (dateOrdinal(snapshot.validUntil) < currentDate) {
    throw new Error('Angebotssnapshot: "validUntil" ist bereits abgelaufen.');
  }

  if (!Array.isArray(snapshot.offers) || snapshot.offers.length === 0) {
    throw new Error('Leerer Angebotssnapshot wird nicht veröffentlicht.');
  }

  if (snapshot.recognizedCount !== undefined && snapshot.recognizedCount !== snapshot.offers.length) {
    throw new Error('Angebotssnapshot: recognizedCount stimmt nicht mit offers.length überein.');
  }

  const seenOfferKeys = new Map();
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
    if (dateOrdinal(offer.validUntil) < fetchedAtDate) {
      throw new Error(`Angebotssnapshot: Angebot ${index + 1} ist bereits vor dem Abrufzeitpunkt abgelaufen.`);
    }
    if (dateOrdinal(offer.validUntil) < currentDate) {
      throw new Error(`Angebotssnapshot: Angebot ${index + 1} ist bereits abgelaufen.`);
    }
    if (nonOfferNamePattern.test(offer.name)) {
      throw new Error(`Angebotssnapshot: Angebot ${index + 1} enthält Angebotsmetadaten statt eines Produktnamens.`);
    }
    if (!currencyPricePattern.test(offer.price.trim())) {
      throw new Error(`Angebotssnapshot: Preis von Angebot ${index + 1} ist kein eindeutiger Eurobetrag.`);
    }
    const offerKey = [offer.name, offer.price, offer.packSize || '', offer.validUntil]
      .map(value => String(value).trim().replace(/\s+/g, ' ').toLowerCase())
      .join('|');
    const previousIndex = seenOfferKeys.get(offerKey);
    if (previousIndex !== undefined) {
      throw new Error(`Angebotssnapshot: Angebot ${index + 1} dupliziert Angebot ${previousIndex + 1}.`);
    }
    seenOfferKeys.set(offerKey, index);
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
