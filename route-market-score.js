;(function attachRouteMarketScoreModel(root) {
  'use strict';

  function normalizeKey(value) {
    return String(value || '').trim().toLowerCase();
  }

  function normalizeCents(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
  }

  function evaluateMarketRoutes(input) {
    const source = input && typeof input === 'object' ? input : {};
    const required = [...new Set((Array.isArray(source.requiredItems) ? source.requiredItems : []).map(normalizeKey).filter(Boolean))];
    const requiredSet = new Set(required);
    const evaluated = (Array.isArray(source.markets) ? source.markets : []).map((market, index) => {
      const available = [...new Set((Array.isArray(market?.availableItems) ? market.availableItems : []).map(normalizeKey).filter(Boolean))];
      const coveredItems = available.filter(item => requiredSet.has(item));
      const travelCostCents = normalizeCents(market?.travelCostCents);
      const shoppingCostCents = normalizeCents(market?.shoppingCostCents);
      const totalCents = travelCostCents === null || shoppingCostCents === null
        ? null
        : travelCostCents + shoppingCostCents <= Number.MAX_SAFE_INTEGER
          ? travelCostCents + shoppingCostCents
          : null;
      return {
        id: String(market?.id || `market-${index + 1}`),
        coveredItems,
        coverageCount: coveredItems.length,
        coverageRatio: required.length ? coveredItems.length / required.length : 0,
        travelCostCents,
        shoppingCostCents,
        totalCents,
        status: travelCostCents === null || shoppingCostCents === null ? 'unknown-total' : 'complete',
        inputIndex: index,
      };
    });
    const ranked = [...evaluated].sort((left, right) =>
      right.coverageCount - left.coverageCount
      || (left.travelCostCents === null ? 1 : right.travelCostCents === null ? -1 : left.travelCostCents - right.travelCostCents)
      || (left.totalCents === null ? 1 : right.totalCents === null ? -1 : left.totalCents - right.totalCents)
      || left.inputIndex - right.inputIndex);
    return Object.freeze({
      requiredCount: required.length,
      markets: ranked.map(({ inputIndex, ...market }) => Object.freeze(market)),
    });
  }

  root.AngebotskuecheRouteMarketScoreModel = Object.freeze({ evaluateMarketRoutes });
}(typeof window !== 'undefined' ? window : globalThis));
