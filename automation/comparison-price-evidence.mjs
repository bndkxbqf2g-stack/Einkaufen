const COMPARISON_STATES = Object.freeze({
  VERIFIED: 'verified',
  NOT_CHEAPER: 'not-cheaper',
  UNKNOWN: 'unknown',
});

function unknown(reason) {
  return {
    status: COMPARISON_STATES.UNKNOWN,
    reason,
    offerPriceCents: null,
    regularPriceCents: null,
    packageKey: null,
    priceDeltaCents: null,
    savingCents: null,
    savingPercent: null,
    provenance: null,
  };
}

function positiveCents(value) {
  const normalized = typeof value === 'number'
    ? value
    : typeof value === 'string' && /^\d+$/.test(value.trim())
      ? Number(value.trim())
      : null;
  return Number.isSafeInteger(normalized) && normalized > 0 ? normalized : null;
}

function calendarDate(value) {
  const text = String(value ?? '').trim();
  const match = text.match(/^(?:(\d{1,2})\.(\d{1,2})\.(\d{4})|(\d{4})-(\d{2})-(\d{2}))$/);
  if (!match) return null;
  const year = Number(match[3] || match[4]);
  const month = Number(match[2] || match[5]);
  const day = Number(match[1] || match[6]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { key: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, date };
}

function evaluationTime(value) {
  const text = String(value ?? '').trim();
  const dateOnly = calendarDate(text);
  if (dateOnly) {
    return { day: dateOnly.key, time: dateOnly.date.getTime() + 86_399_999 };
  }
  if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)) return null;
  const time = Date.parse(text);
  if (!Number.isFinite(time)) return null;
  const date = new Date(time);
  return {
    day: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`,
    time,
  };
}

function safeSourceUrl(value) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}

function normalizeProvenance(value, asOf) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { reason: 'missing-provenance' };
  if (value.manual === true) return { reason: 'manual-source' };
  if (value.uncertain === true) return { reason: 'uncertain-source' };
  if (value.verified !== true) return { reason: 'unverified-source' };
  if (value.confidence !== undefined && !['high', 'hoch'].includes(String(value.confidence).trim().toLowerCase())) {
    return { reason: 'uncertain-source' };
  }

  const sourceName = String(value.sourceName ?? '').trim();
  const sourceUrl = safeSourceUrl(value.sourceUrl);
  const fetchedAt = evaluationTime(value.fetchedAt);
  const validUntil = calendarDate(value.validUntil);
  if (!sourceName || !sourceUrl || !fetchedAt || !validUntil) return { reason: 'incomplete-provenance' };
  if (validUntil.key < asOf.day) return { reason: 'expired-source' };
  if (fetchedAt.time > asOf.time) return { reason: 'future-source' };

  return {
    value: {
      sourceName,
      sourceUrl,
      fetchedAt: new Date(fetchedAt.time).toISOString(),
      validUntil: validUntil.key,
    },
  };
}

function packageKey(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized || null;
}

function roundPercent(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Assesses one explicit offer/regular-price comparison without fetching or mutating data.
 * Both prices, matching package keys, two verified source records and an explicit asOf
 * date are required before a comparison is considered usable.
 */
export function assessComparisonPriceEvidence(input = {}, options = {}) {
  const asOf = evaluationTime(options.asOf ?? input.asOf);
  if (!asOf) return unknown('missing-as-of');

  const offerPriceCents = positiveCents(input.offer?.priceCents);
  const regularPriceCents = positiveCents(input.regular?.priceCents);
  if (offerPriceCents === null || regularPriceCents === null) return unknown('missing-or-invalid-price');

  const offerPackageKey = packageKey(input.offer?.packageKey);
  const regularPackageKey = packageKey(input.regular?.packageKey);
  if (!offerPackageKey || !regularPackageKey || offerPackageKey !== regularPackageKey) return unknown('incomparable-package');

  const offerProvenance = normalizeProvenance(input.offer?.provenance, asOf);
  if (!offerProvenance.value) return unknown(offerProvenance.reason);
  const regularProvenance = normalizeProvenance(input.regular?.provenance, asOf);
  if (!regularProvenance.value) return unknown(regularProvenance.reason);

  const priceDeltaCents = regularPriceCents - offerPriceCents;
  const hasSaving = priceDeltaCents > 0;
  return {
    status: hasSaving ? COMPARISON_STATES.VERIFIED : COMPARISON_STATES.NOT_CHEAPER,
    reason: hasSaving ? 'verified-saving' : priceDeltaCents === 0 ? 'equal-price' : 'offer-not-cheaper',
    offerPriceCents,
    regularPriceCents,
    packageKey: offerPackageKey,
    priceDeltaCents,
    savingCents: hasSaving ? priceDeltaCents : null,
    savingPercent: hasSaving ? roundPercent(priceDeltaCents / regularPriceCents * 100) : null,
    provenance: { offer: offerProvenance.value, regular: regularProvenance.value },
  };
}

export function summarizeComparisonPriceEvidence(entries, options = {}) {
  if (!Array.isArray(entries)) throw new TypeError('Vergleichspreise müssen als Array übergeben werden.');
  const results = entries.map(entry => assessComparisonPriceEvidence(entry, options));
  return {
    entries: results,
    counts: Object.values(COMPARISON_STATES).reduce((counts, state) => {
      counts[state] = results.filter(result => result.status === state).length;
      return counts;
    }, {}),
  };
}

export { COMPARISON_STATES };

