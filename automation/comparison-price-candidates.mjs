import {
  assessComparisonPriceEvidence,
  COMPARISON_STATES,
} from './comparison-price-evidence.mjs';

const SUMMARY_STATES = Object.freeze({
  COMPLETE: 'complete',
  INSUFFICIENT_DATA: 'insufficient_data',
});

function normalizeKey(value) {
  const normalized = String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
  return normalized || null;
}

function unknownCandidate(fields, reason) {
  return {
    candidateKey: fields.candidateKey ?? null,
    productKey: fields.productKey ?? null,
    packageKey: fields.packageKey ?? null,
    marketKey: fields.marketKey ?? null,
    status: 'unknown',
    reason,
    evidence: null,
  };
}

function assessCandidate(candidate, options) {
  const source = candidate && typeof candidate === 'object' && !Array.isArray(candidate) ? candidate : {};
  const fields = {
    candidateKey: normalizeKey(source.candidateKey),
    productKey: normalizeKey(source.productKey),
    packageKey: normalizeKey(source.packageKey),
    marketKey: normalizeKey(source.marketKey),
  };

  if (!fields.candidateKey || !fields.productKey || !fields.packageKey || !fields.marketKey) {
    return unknownCandidate(fields, 'incomplete-candidate-key');
  }

  const comparison = source.comparison;
  if (!comparison || typeof comparison !== 'object' || Array.isArray(comparison)) {
    return unknownCandidate(fields, 'missing-comparison-evidence');
  }
  if (normalizeKey(comparison.offer?.packageKey) !== fields.packageKey) {
    return unknownCandidate(fields, 'group-package-mismatch');
  }

  const evidence = assessComparisonPriceEvidence(comparison, options);
  if (evidence.status !== COMPARISON_STATES.VERIFIED) {
    return unknownCandidate(
      fields,
      evidence.status === COMPARISON_STATES.UNKNOWN ? evidence.reason : 'comparison-not-verified',
    );
  }
  if (!Number.isSafeInteger(evidence.savingCents) || evidence.savingCents <= 0) {
    return unknownCandidate(fields, 'non-positive-saving');
  }

  return {
    ...fields,
    status: COMPARISON_STATES.VERIFIED,
    reason: 'verified-positive-saving',
    evidence,
  };
}

function candidateOrderKey(candidate) {
  return `${candidate.marketKey}\u001f${candidate.candidateKey}`;
}

function compareCandidates(left, right) {
  const priceDifference = left.evidence.offerPriceCents - right.evidence.offerPriceCents;
  if (priceDifference !== 0) return priceDifference;
  const leftKey = candidateOrderKey(left);
  const rightKey = candidateOrderKey(right);
  if (leftKey < rightKey) return -1;
  if (leftKey > rightKey) return 1;
  return 0;
}

function exposeCandidate(candidate) {
  return {
    candidateKey: candidate.candidateKey,
    marketKey: candidate.marketKey,
    status: candidate.status,
    reason: candidate.reason,
    offerPriceCents: candidate.evidence?.offerPriceCents ?? null,
    savingCents: candidate.evidence?.savingCents ?? null,
  };
}

function summarizeGroup(candidates) {
  const first = candidates[0];
  const complete = candidates.filter(candidate => candidate.status === COMPARISON_STATES.VERIFIED);
  const unknownCount = candidates.length - complete.length;
  const base = {
    productKey: first.productKey,
    packageKey: first.packageKey,
    candidateCount: candidates.length,
    verifiedCandidateCount: complete.length,
    unknownCandidateCount: unknownCount,
    candidates: candidates.map(exposeCandidate).sort((left, right) => {
      const leftKey = `${left.marketKey ?? ''}\u001f${left.candidateKey ?? ''}`;
      const rightKey = `${right.marketKey ?? ''}\u001f${right.candidateKey ?? ''}`;
      return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
    }),
  };

  const candidateKeys = new Set();
  for (const candidate of candidates) {
    const key = `${candidate.marketKey}\u001f${candidate.candidateKey}`;
    if (candidateKeys.has(key)) {
      return {
        ...base,
        status: SUMMARY_STATES.INSUFFICIENT_DATA,
        reason: 'duplicate-candidate-key',
        selected: null,
      };
    }
    candidateKeys.add(key);
  }

  if (unknownCount > 0) {
    return {
      ...base,
      status: SUMMARY_STATES.INSUFFICIENT_DATA,
      reason: 'incomplete-candidate-evidence',
      selected: null,
    };
  }

  const selected = [...complete].sort(compareCandidates)[0];
  return {
    ...base,
    status: COMPARISON_STATES.VERIFIED,
    reason: 'lowest-verified-offer-price',
    selected: {
      candidateKey: selected.candidateKey,
      marketKey: selected.marketKey,
      ...selected.evidence,
    },
  };
}

function addSafeCents(totalCents, valueCents) {
  const next = totalCents + valueCents;
  return Number.isSafeInteger(next) ? next : null;
}

/**
 * Selects the lowest offer price among explicit, positive-saving comparison pairs
 * for each product/package group. Market and candidate keys provide a stable tie-break.
 * Any incomplete group makes the total insufficient instead of hiding uncertainty.
 */
export function summarizeComparisonPriceCandidates(candidates, options = {}) {
  if (!Array.isArray(candidates)) throw new TypeError('Vergleichskandidaten müssen als Array übergeben werden.');

  const groups = new Map();
  const ungrouped = [];
  for (const candidate of candidates) {
    const assessed = assessCandidate(candidate, options);
    if (!assessed.productKey || !assessed.packageKey || !assessed.marketKey) {
      ungrouped.push(exposeCandidate(assessed));
      continue;
    }

    const key = `${assessed.productKey}\u001f${assessed.packageKey}`;
    const group = groups.get(key);
    if (group) group.push(assessed);
    else groups.set(key, [assessed]);
  }

  const summarizedGroups = [...groups.entries()]
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([, group]) => summarizeGroup(group));
  const hasIncompleteGroup = summarizedGroups.some(group => group.status !== COMPARISON_STATES.VERIFIED);
  const hasUngrouped = ungrouped.length > 0;
  let totalPriceCents = 0;
  let totalReason = null;
  if (hasIncompleteGroup || hasUngrouped) {
    totalPriceCents = null;
    totalReason = hasUngrouped ? 'incomplete-candidate-key' : 'incomplete-candidate-evidence';
  } else {
    for (const group of summarizedGroups) {
      totalPriceCents = addSafeCents(totalPriceCents, group.selected.offerPriceCents);
      if (totalPriceCents === null) {
        totalReason = 'unsafe-total';
        break;
      }
    }
    if (summarizedGroups.length === 0) {
      totalPriceCents = null;
      totalReason = 'no-candidates';
    }
  }

  return {
    status: totalPriceCents === null ? SUMMARY_STATES.INSUFFICIENT_DATA : SUMMARY_STATES.COMPLETE,
    reason: totalReason ?? 'verified-lowest-price',
    totalPriceCents,
    groups: summarizedGroups,
    ungrouped,
  };
}

export { SUMMARY_STATES };

