;(function attachBudgetTransparencyModel(root) {
  'use strict';

  const MONTHLY_TARGET_CENTS = 40_000;
  const ALTERNATIVE_MONTHLY_TARGET_CENTS = 44_000;

  function normalizeCents(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
  }

  function normalizeCount(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  }

  function addSafeCents(left, right) {
    if (left === null || right === null) return null;
    const total = left + right;
    return Number.isSafeInteger(total) ? total : null;
  }

  function normalizeMonthlyTargetCents(value, allowAlternativeTarget) {
    const requested = normalizeCents(value);
    if (requested === MONTHLY_TARGET_CENTS) return requested;
    if (requested === ALTERNATIVE_MONTHLY_TARGET_CENTS && allowAlternativeTarget === true) return requested;
    return MONTHLY_TARGET_CENTS;
  }

  function summarizeBudgetTransparency(input) {
    const source = input && typeof input === 'object' ? input : {};
    const monthlyTargetCents = normalizeMonthlyTargetCents(source.monthlyTargetCents, source.allowAlternativeTarget);
    const knownOfferTotalCents = normalizeCents(source.knownOfferTotalCents);
    const unresolvedPositionCount = normalizeCount(source.unresolvedPositionCount);
    const plannedExpenseCents = normalizeCents(source.plannedExpenseCents);
    const actualSpendCents = normalizeCents(source.actualSpendCents);
    const travelCostCents = normalizeCents(source.travelCostCents);

    return Object.freeze({
      monthlyTargetCents,
      knownOfferTotalCents,
      knownOfferStatus: knownOfferTotalCents === null
        ? 'unknown'
        : unresolvedPositionCount > 0 ? 'partial' : 'known-offer-only',
      unresolvedPositionCount,
      plannedExpenseCents,
      plannedExpenseStatus: plannedExpenseCents === null ? 'not-recorded' : 'provided',
      remainingAfterPlannedCents: plannedExpenseCents === null ? null : monthlyTargetCents - plannedExpenseCents,
      actualSpendCents,
      actualSpendStatus: actualSpendCents === null ? 'not-recorded' : 'confirmed',
      remainingBudgetCents: actualSpendCents === null ? null : monthlyTargetCents - actualSpendCents,
      travelCostCents,
      travelCostStatus: travelCostCents === null ? 'not-recorded' : 'separate',
      confirmedOutlayWithTravelCents: addSafeCents(actualSpendCents, travelCostCents),
    });
  }

  root.AngebotskuecheBudgetModel = Object.freeze({
    monthlyTargetCents: MONTHLY_TARGET_CENTS,
    alternativeMonthlyTargetCents: ALTERNATIVE_MONTHLY_TARGET_CENTS,
    normalizeMonthlyTargetCents,
    summarizeBudgetTransparency,
  });
}(typeof window !== 'undefined' ? window : globalThis));


