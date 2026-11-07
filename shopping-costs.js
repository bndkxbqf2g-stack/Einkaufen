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
    summarizePantryCoverage,
    summarizeShoppingCosts,
  });
}(typeof window !== 'undefined' ? window : globalThis));
