;(function attachMarketStopsModel(root) {
  'use strict';

  const MAX_MARKETS = 7;

  function normalizeCents(value) {
    if (typeof value === 'number') return Number.isSafeInteger(value) && value >= 0 ? value : null;
    if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return null;
    const normalized = Number(value.trim());
    return Number.isSafeInteger(normalized) && normalized >= 0 ? normalized : null;
  }

  function normalizeMarketLimit(value) {
    const normalized = Number(value);
    return Number.isInteger(normalized) && normalized >= 1 && normalized <= MAX_MARKETS ? normalized : null;
  }

  function normalizeMarketName(value) {
    const normalized = String(value ?? '').replace(/\s+/g, ' ').trim();
    return normalized || null;
  }

  function normalizeSelectedMarkets(value) {
    if (!Array.isArray(value)) return null;
    const names = [];
    const seen = new Set();
    for (const marketValue of value) {
      const name = normalizeMarketName(marketValue);
      const key = name?.toLocaleLowerCase('de-DE');
      if (!name || seen.has(key)) return null;
      seen.add(key);
      names.push(name);
    }
    return names;
  }

  function subtractSafeCents(left, right) {
    const result = left - right;
    return Number.isSafeInteger(result) ? result : null;
  }

  function unknown(reason, input = {}) {
    return {
      recommended: false,
      status: 'unknown',
      reason,
      baseBasketCents: normalizeCents(input.baseBasketCents),
      alternativeBasketCents: normalizeCents(input.alternativeBasketCents),
      grossSavingsCents: null,
      travelCostCents: normalizeCents(input.travelCostCents),
      netSavingsCents: null,
      thresholdCents: normalizeCents(input.minNetSavingsCents),
      marketLimit: normalizeMarketLimit(input.marketLimit),
      selectedMarkets: normalizeSelectedMarkets(input.selectedMarkets),
      additionalMarket: normalizeMarketName(input.additionalMarket),
    };
  }

  function recommendAdditionalMarket(input = {}) {
    const baseBasketCents = normalizeCents(input.baseBasketCents);
    const alternativeBasketCents = normalizeCents(input.alternativeBasketCents);
    const travelCostCents = normalizeCents(input.travelCostCents);
    const thresholdCents = normalizeCents(input.minNetSavingsCents);
    const marketLimit = normalizeMarketLimit(input.marketLimit);
    const selectedMarkets = normalizeSelectedMarkets(input.selectedMarkets);
    const additionalMarket = normalizeMarketName(input.additionalMarket);

    if ([baseBasketCents, alternativeBasketCents, travelCostCents, thresholdCents, marketLimit, selectedMarkets, additionalMarket].some(value => value === null)) {
      return unknown('insufficient-or-invalid-data', input);
    }
    const selectedKeys = new Set(selectedMarkets.map(market => market.toLocaleLowerCase('de-DE')));
    if (selectedKeys.has(additionalMarket.toLocaleLowerCase('de-DE'))) return unknown('invalid-market-assignment', input);
    if (selectedMarkets.length >= marketLimit) {
      return {
        ...unknown('market-limit-reached', input),
        status: 'not-recommended',
        selectedMarkets,
        additionalMarket,
      };
    }

    const grossSavingsCents = subtractSafeCents(baseBasketCents, alternativeBasketCents);
    const netSavingsCents = grossSavingsCents === null
      ? null
      : subtractSafeCents(grossSavingsCents, travelCostCents);
    if (grossSavingsCents === null || netSavingsCents === null) {
      return unknown('unsafe-cent-aggregate', input);
    }
    const recommended = netSavingsCents > thresholdCents;
    return {
      recommended,
      status: recommended ? 'recommended' : 'not-recommended',
      reason: recommended ? 'net-savings-exceeds-threshold' : 'net-savings-below-threshold',
      baseBasketCents,
      alternativeBasketCents,
      grossSavingsCents,
      travelCostCents,
      netSavingsCents,
      thresholdCents,
      marketLimit,
      selectedMarkets,
      additionalMarket,
    };
  }

  root.AngebotskuecheMarketStopsModel = Object.freeze({
    maxMarkets: MAX_MARKETS,
    normalizeCents,
    normalizeMarketLimit,
    normalizeSelectedMarkets,
    recommendAdditionalMarket,
  });
}(typeof window !== 'undefined' ? window : globalThis));

