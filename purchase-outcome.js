;(function attachPurchaseOutcomeModel(root) {
  'use strict';

  function normalizeCents(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
  }

  function classify(plannedCents, actualCents) {
    if (plannedCents === null || actualCents === null) return 'unknown';
    if (actualCents === plannedCents) return 'on-budget';
    return actualCents < plannedCents ? 'under-budget' : 'over-budget';
  }

  function evaluatePurchaseOutcome(input) {
    const source = input && typeof input === 'object' ? input : {};
    const plannedCents = normalizeCents(source.plannedCents);
    const actualCents = normalizeCents(source.actualCents);
    const absoluteDifferenceCents = plannedCents === null || actualCents === null
      ? null
      : actualCents - plannedCents;
    const percentageDifference = plannedCents === null || actualCents === null || plannedCents === 0
      ? null
      : (absoluteDifferenceCents / plannedCents) * 100;
    return Object.freeze({
      plannedCents,
      actualCents,
      absoluteDifferenceCents,
      percentageDifference,
      status: classify(plannedCents, actualCents),
    });
  }

  root.AngebotskuechePurchaseOutcomeModel = Object.freeze({
    normalizeCents,
    evaluatePurchaseOutcome,
  });
}(typeof window !== 'undefined' ? window : globalThis));
