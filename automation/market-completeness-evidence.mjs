import {
  assessMarketCompleteness,
  COMPLETENESS_STATES,
  readOfferSnapshots,
} from './market-completeness.mjs';

const EVIDENCE_BASES = Object.freeze({
  EXPLICIT_SOURCE_TOTALS: 'explicit_source_totals',
  MISSING_EXPECTED_TOTAL: 'missing_expected_total',
  MISSING_SOURCE_TOTALS: 'missing_source_totals',
});

function comparableText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function compareText(first, second) {
  const left = comparableText(first);
  const right = comparableText(second);
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function sourceScope(assessment) {
  return {
    market: assessment.market,
    store: assessment.store,
    parser: assessment.parser,
    sourceUrl: assessment.sourceUrl,
  };
}

function sourceKey(scope) {
  return [scope.market, scope.store, scope.parser, scope.sourceUrl]
    .map(comparableText)
    .join('|');
}

function compareEvidence(first, second) {
  return compareText(first.sourceKey, second.sourceKey)
    || compareText(first.observation.fetchedAt, second.observation.fetchedAt)
    || compareText(first.observation.validUntil, second.observation.validUntil);
}

function completenessEvidence(assessment) {
  const { expectedTotalOfferCount, observedTotalOfferCount, status, reason } = assessment.completeness;
  const basis = expectedTotalOfferCount !== null && observedTotalOfferCount !== null
    ? EVIDENCE_BASES.EXPLICIT_SOURCE_TOTALS
    : expectedTotalOfferCount === null && observedTotalOfferCount !== null
      ? EVIDENCE_BASES.MISSING_EXPECTED_TOTAL
      : EVIDENCE_BASES.MISSING_SOURCE_TOTALS;

  return {
    status,
    basis,
    expectedTotalOfferCount,
    observedTotalOfferCount,
    reason,
  };
}

/**
 * Builds source-scoped completeness evidence without enriching or mutating snapshots.
 *
 * Lazy-load targets and recognized offers stay observation metadata. They never become
 * an expected source total. A completeness status other than unknown therefore requires
 * both explicit source-scoped counts from the same snapshot.
 */
export function buildOfferSourceCompletenessEvidence(snapshots) {
  if (!Array.isArray(snapshots)) throw new TypeError('Angebotssnapshots müssen als Array übergeben werden.');

  return snapshots.map(snapshot => {
    const assessment = assessMarketCompleteness(snapshot);
    const scope = sourceScope(assessment);
    return {
      sourceKey: sourceKey(scope),
      scope,
      observation: {
        fetchedAt: assessment.fetchedAt,
        validUntil: assessment.validUntil,
        recognizedOfferCount: assessment.recognizedOfferCount,
        load: assessment.loadEvidence,
      },
      completeness: completenessEvidence(assessment),
    };
  }).sort(compareEvidence);
}

export function buildOfferSourceCompletenessReport(snapshots) {
  const sources = buildOfferSourceCompletenessEvidence(snapshots);
  const summary = Object.values(COMPLETENESS_STATES).reduce((counts, state) => {
    counts[state] = sources.filter(source => source.completeness.status === state).length;
    return counts;
  }, {});

  return {
    version: 1,
    sources,
    summary: {
      total: sources.length,
      completeness: summary,
    },
  };
}

export async function readOfferSourceCompletenessReport(directory) {
  return buildOfferSourceCompletenessReport(await readOfferSnapshots(directory));
}

export { EVIDENCE_BASES };

