;(function attachShoppingDemandModel(root) {
  'use strict';

  function models(scope = root) {
    const quantity = scope?.AngebotskuecheIngredientQuantityModel;
    const ingredient = scope?.AngebotskuecheIngredientModel;
    if (!quantity || !ingredient || typeof ingredient.shoppingIngredientIdentity !== 'function') {
      throw new Error('Mengen- und Zutatenmodell müssen bereitstehen.');
    }
    return { quantity, ingredient };
  }

  function safePeople(value) {
    const people = Number(value);
    return Number.isFinite(people) && people > 0 && people <= 100 ? people : 2;
  }

  function buildShoppingDemand(meals, scope = root) {
    const { quantity, ingredient } = models(scope);
    const items = new Map();
    for (const meal of Array.isArray(meals) ? meals : []) {
      const title = String(meal?.title || 'Rezept').trim() || 'Rezept';
      const portionUnits = safePeople(meal?.people) / 2;
      for (const raw of Array.isArray(meal?.ingredients) ? meal.ingredients : []) {
        const parsed = quantity.parseRecipeIngredient(String(raw || '').trim());
        const name = String(parsed?.explicit ? parsed.name : raw || '').trim();
        const identity = String(ingredient.shoppingIngredientIdentity(name) || '').trim();
        if (!identity) continue;
        const current = items.get(identity) || {
          name, count: 0, portionUnits: 0, quantityBasis: quantity.createQuantityBasis(), meals: [],
        };
        current.count += 1;
        current.portionUnits += portionUnits;
        current.quantityBasis = quantity.addRecipeQuantity(current.quantityBasis, parsed, portionUnits);
        if (!current.meals.includes(title)) current.meals.push(title);
        items.set(identity, current);
      }
    }
    return [...items.values()];
  }

  function applyPantryCoverage(items, pantryQuantities, scope = root) {
    const coverage = scope?.AngebotskuechePantryShoppingCoverageModel;
    if (!coverage || typeof coverage.applyPantryCoverageToShoppingItems !== 'function') {
      throw new Error('Vorratsabgleichsmodell muss bereitstehen.');
    }
    return coverage.applyPantryCoverageToShoppingItems(items, pantryQuantities);
  }

  root.AngebotskuecheShoppingDemandModel = Object.freeze({
    buildShoppingDemand,
    applyPantryCoverage,
  });
}(typeof window !== 'undefined' ? window : globalThis));
