const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const MONTHLY_BUDGET_CENTS = 40_000;

function dateParts(value) {
  const match = String(value || '').trim().match(DATE_PATTERN);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function isValidDateParts(parts) {
  if (!parts || parts.year < 1 || parts.month < 1 || parts.month > 12) return false;
  const leapYear = parts.year % 4 === 0 && (parts.year % 100 !== 0 || parts.year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return parts.day >= 1 && parts.day <= daysInMonth[parts.month - 1];
}

function validMonth(value) {
  return typeof value === 'string' && MONTH_PATTERN.test(value);
}

export function monthForPurchaseDate(value) {
  const parts = dateParts(value);
  if (!isValidDateParts(parts)) {
    throw new Error('Einkauf: "purchaseDate" muss ein gültiges Datum im Format JJJJ-MM-TT sein.');
  }
  return `${parts.year}-${String(parts.month).padStart(2, '0')}`;
}

export function validatePurchaseRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new Error('Einkauf muss ein Objekt sein.');
  }

  const id = typeof record.id === 'string' ? record.id.trim() : '';
  if (!id || id.length > 120) {
    throw new Error('Einkauf: "id" muss eine nichtleere Kennung mit höchstens 120 Zeichen sein.');
  }

  const purchaseDate = typeof record.purchaseDate === 'string' ? record.purchaseDate.trim() : '';
  const month = monthForPurchaseDate(purchaseDate);
  if (record.month !== month) {
    throw new Error('Einkauf: "month" muss dem Monat von "purchaseDate" entsprechen.');
  }

  if (!Number.isInteger(record.totalCents) || record.totalCents < 0) {
    throw new Error('Einkauf: "totalCents" muss eine nichtnegative ganze Centzahl sein.');
  }

  if (record.source !== 'manual') {
    throw new Error('Einkauf: "source" muss "manual" sein.');
  }

  const market = record.market === undefined || record.market === null ? '' : String(record.market).trim();
  if (market.length > 120) {
    throw new Error('Einkauf: "market" darf höchstens 120 Zeichen enthalten.');
  }

  return { id, purchaseDate, month, totalCents: record.totalCents, market, source: 'manual' };
}

export function validatePurchaseRecords(records) {
  if (!Array.isArray(records)) {
    throw new Error('Einkäufe müssen als Liste vorliegen.');
  }

  const seenIds = new Set();
  return records.map(record => {
    const normalized = validatePurchaseRecord(record);
    if (seenIds.has(normalized.id)) {
      throw new Error(`Einkauf: "id" ${normalized.id} ist doppelt vorhanden.`);
    }
    seenIds.add(normalized.id);
    return normalized;
  });
}

export function summarizePurchaseRecords(records, month) {
  if (!validMonth(month)) {
    throw new Error('Einkauf: "month" muss im Format JJJJ-MM vorliegen.');
  }

  const normalizedRecords = validatePurchaseRecords(records);
  const matchingRecords = normalizedRecords.filter(record => record.month === month);
  const totalCents = matchingRecords.reduce((sum, record) => sum + record.totalCents, 0);

  return {
    month,
    recordCount: matchingRecords.length,
    totalCents,
    targetCents: MONTHLY_BUDGET_CENTS,
    remainingCents: MONTHLY_BUDGET_CENTS - totalCents,
    overTarget: totalCents > MONTHLY_BUDGET_CENTS,
  };
}
