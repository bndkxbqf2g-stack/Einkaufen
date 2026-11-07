;(function attachShoppingCostModel(root) {
  'use strict';

  function normalizePackCount(value) {
    const raw = Number(value);
    return Number.isFinite(raw) && raw > 0 ? Math.ceil(raw) : 1;
  }

  function calculateOfferAmount(items, parseUnitPrice) {
    const parsePrice = typeof parseUnitPrice === 'function' ? parseUnitPrice : () => null;
    let totalCents = 0;
    const knownItems = [];
    const unknownItems = [];

    for (const item of Array.isArray(items) ? items : []) {
      const unitPrice = parsePrice(item?.offer?.price);
      const packCount = normalizePackCount(item?.packCount);
      if (unitPrice === null || !Number.isFinite(unitPrice) || unitPrice < 0) {
        unknownItems.push(item);
        continue;
      }
      knownItems.push(item);
      totalCents += Math.round(unitPrice * 100) * packCount;
    }

    return { total: totalCents / 100, totalCents, knownItems, unknownItems };
  }

  function summarizeShoppingCosts(items, parseUnitPrice) {
    const list = Array.isArray(items) ? items : [];
    const offerItems = list.filter(item => item && item.offer);
    const missingItems = list.filter(item => !item || !item.offer);
    const offerSummary = calculateOfferAmount(offerItems, parseUnitPrice);
    return {
      ...offerSummary,
      offerItems,
      missingItems,
      missingCount: missingItems.length,
    };
  }

  root.AngebotskuecheCostModel = Object.freeze({
    calculateOfferAmount,
    normalizePackCount,
    summarizeShoppingCosts,
  });
}(typeof window !== 'undefined' ? window : globalThis));
