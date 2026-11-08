;(function attachShoppingCostModel(root) {
  'use strict';

  function normalizePackCount(value) {
    const raw = Number(value);
    return Number.isFinite(raw) && raw > 0 ? Math.ceil(raw) : 1;
  }

  function createOfferAmountSummary(totalCents, knownItems, unknownItems, knownPackCount, unknownPackCount) {
    const hasKnownOffer = knownItems.length > 0;
    return {
      // Keep the legacy numeric subtotal for callers that already inspect it.
      // The explicit knownOfferTotal fields are null when no verified price exists.
      total: totalCents / 100,
      totalCents,
      knownItems,
      unknownItems,
      knownOfferItems: knownItems,
      unknownPriceItems: unknownItems,
      knownOfferTotal: hasKnownOffer ? totalCents / 100 : null,
      knownOfferTotalCents: hasKnownOffer ? totalCents : null,
      knownOfferCount: knownItems.length,
      unknownPriceCount: unknownItems.length,
      knownOfferPackCount: knownPackCount,
      unknownPricePackCount: unknownPackCount,
      estimatedPackCount: knownPackCount + unknownPackCount,
    };
  }

  function calculateOfferAmount(items, parseUnitPrice) {
    const parsePrice = typeof parseUnitPrice === 'function' ? parseUnitPrice : () => null;
    let totalCents = 0;
    const knownItems = [];
    const unknownItems = [];
    let knownPackCount = 0;
    let unknownPackCount = 0;

    for (const item of Array.isArray(items) ? items : []) {
      const unitPrice = parsePrice(item?.offer?.price);
      const packCount = normalizePackCount(item?.packCount);
      if (unitPrice === null || !Number.isFinite(unitPrice) || unitPrice < 0) {
        unknownItems.push(item);
        unknownPackCount += packCount;
        continue;
      }
      knownItems.push(item);
      knownPackCount += packCount;
      totalCents += Math.round(unitPrice * 100) * packCount;
    }

    return createOfferAmountSummary(totalCents, knownItems, unknownItems, knownPackCount, unknownPackCount);
  }

  function pantryIngredientIdentity(value) {
    const shared = root.AngebotskuecheIngredientModel;
    return shared && typeof shared.shoppingIngredientIdentity === 'function'
      ? shared.shoppingIngredientIdentity(value)
      : String(value || '').trim().toLowerCase();
  }

  function summarizePantryCoverage(ingredients, isPantryIngredient) {
    const isCovered = typeof isPantryIngredient === 'function' ? isPantryIngredient : () => false;
    const entries = new Map();
    for (const rawIngredient of Array.isArray(ingredients) ? ingredients : []) {
      const ingredient = String(rawIngredient || '').trim();
      if (!ingredient) continue;
      const identity = pantryIngredientIdentity(ingredient);
      if (!identity) continue;
      const existing = entries.get(identity);
      const covered = Boolean(isCovered(ingredient));
      if (existing) {
        existing.covered = existing.covered || covered;
      } else {
        entries.set(identity, { ingredient, covered });
      }
    }
    const coveredItems = [];
    const uncoveredItems = [];
    for (const { ingredient, covered } of entries.values()) {
      (covered ? coveredItems : uncoveredItems).push(ingredient);
    }
    return {
      coveredItems,
      uncoveredItems,
      coveredCount: coveredItems.length,
      uncoveredCount: uncoveredItems.length,
    };
  }

  function summarizeShoppingCosts(items, parseUnitPrice) {
    const list = Array.isArray(items) ? items : [];
    const offerItems = list.filter(item => item && item.offer);
    const missingItems = list.filter(item => !item || !item.offer);
    const offerSummary = calculateOfferAmount(offerItems, parseUnitPrice);
    const manualItems = list.filter(item => item?.manual === true);
    const manualMissingItems = missingItems.filter(item => item?.manual === true);
    const unanchoredMissingItems = missingItems.filter(item => item?.manual !== true);
    const estimatedPackCount = list.reduce((sum, item) => sum + normalizePackCount(item?.packCount), 0);
    const missingPackCount = missingItems.reduce((sum, item) => sum + normalizePackCount(item?.packCount), 0);
    return {
      ...offerSummary,
      offerItems,
      missingItems,
      manualItems,
      manualMissingItems,
      unanchoredMissingItems,
      itemCount: list.length,
      offerItemCount: offerItems.length,
      missingCount: missingItems.length,
      manualItemCount: manualItems.length,
      manualMissingCount: manualMissingItems.length,
      unanchoredMissingCount: unanchoredMissingItems.length,
      estimatedPackCount,
      offerEstimatedPackCount: offerSummary.estimatedPackCount,
      missingPackCount,
      classifiedItemCount: offerSummary.knownOfferCount + offerSummary.unknownPriceCount + missingItems.length,
    };
  }

  root.AngebotskuecheCostModel = Object.freeze({
    calculateOfferAmount,
    normalizePackCount,
    summarizePantryCoverage,
    summarizeShoppingCosts,
  });
}(typeof window !== 'undefined' ? window : globalThis));

