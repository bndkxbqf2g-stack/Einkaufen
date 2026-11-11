;(function attachShoppingListOptimizationModel(root) {
  'use strict';

  function sharedModels(scope = root) {
    const ingredient = scope?.AngebotskuecheIngredientModel;
    const quantity = scope?.AngebotskuecheIngredientQuantityModel;
    if (!ingredient || typeof ingredient.shoppingIngredientIdentity !== 'function' || !quantity || typeof quantity.parseOfferPackSize !== 'function') {
      throw new Error('Produktidentitäts- und Mengenmodell müssen bereitstehen.');
    }
    return { ingredient, quantity };
  }

  function parseEntry(entry, quantity) {
    const amount = Number(entry?.amount);
    const unit = String(entry?.unit || '').trim();
    if (!Number.isFinite(amount) || amount <= 0 || !unit) return null;
    const parsed = quantity.parseOfferPackSize(`${amount} ${unit}`);
    if (!parsed || parsed.amount <= 0) return null;
    const name = String(entry?.name || '').trim();
    return name ? { name, family: parsed.family, unit: parsed.unit, amount: parsed.amount } : null;
  }

  function optimizeShoppingList(input, scope = root) {
    const { ingredient, quantity } = sharedModels(scope);
    const source = input && typeof input === 'object' ? input : {};
    const demandGroups = new Map();
    const pantryGroups = new Map();
    const invalidDemandCount = Array.isArray(source.demand) ? 0 : 0;
    const add = (groups, entry) => {
      const parsed = parseEntry(entry, quantity);
      if (!parsed) return false;
      const identity = String(ingredient.shoppingIngredientIdentity(parsed.name) || '').trim();
      if (!identity) return false;
      const key = `${identity}|${parsed.family}|${parsed.unit}`;
      const current = groups.get(key) || { ...parsed, identity, amount: 0 };
      current.amount += parsed.amount;
      groups.set(key, current);
      return true;
    };
    const demand = Array.isArray(source.demand) ? source.demand : [];
    const pantry = Array.isArray(source.pantry) ? source.pantry : [];
    let invalidDemand = 0;
    let invalidPantry = 0;
    demand.forEach(entry => { if (!add(demandGroups, entry)) invalidDemand += 1; });
    pantry.forEach(entry => { if (!add(pantryGroups, entry)) invalidPantry += 1; });
    const items = [];
    for (const [key, needed] of demandGroups) {
      const stocked = pantryGroups.get(key)?.amount || 0;
      const remaining = Math.max(0, needed.amount - stocked);
      if (remaining === 0) continue;
      items.push({ name: needed.name, identity: needed.identity, family: needed.family, unit: needed.unit, amount: remaining, status: stocked > 0 ? 'partially-covered' : 'uncovered' });
    }
    return Object.freeze({ items, invalidDemandCount: invalidDemand, invalidPantryCount: invalidPantry, demandGroupCount: demandGroups.size, pantryGroupCount: pantryGroups.size });
  }

  root.AngebotskuecheShoppingListOptimizationModel = Object.freeze({ optimizeShoppingList });
}(typeof window !== 'undefined' ? window : globalThis));
