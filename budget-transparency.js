;(function attachBudgetTransparencyModel(root) {
  'use strict';

  const MONTHLY_TARGET_CENTS = 40_000;

  function normalizeCents(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
  }

  function normalizeCount(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  }

  function summarizeBudgetTransparency(input) {
    const source = input && typeof input === 'object' ? input : {};
    const knownOfferTotalCents = normalizeCents(source.knownOfferTotalCents);
    const unresolvedPositionCount = normalizeCount(source.unresolvedPositionCount);

    return Object.freeze({
      monthlyTargetCents: MONTHLY_TARGET_CENTS,
      knownOfferTotalCents,
      knownOfferStatus: knownOfferTotalCents === null
        ? 'unknown'
        : unresolvedPositionCount > 0 ? 'partial' : 'known-offer-only',
      unresolvedPositionCount,
      actualSpendCents: null,
      actualSpendStatus: 'not-recorded',
    });
  }

  root.AngebotskuecheBudgetModel = Object.freeze({
    monthlyTargetCents: MONTHLY_TARGET_CENTS,
    summarizeBudgetTransparency,
  });
}(typeof window !== 'undefined' ? window : globalThis));
