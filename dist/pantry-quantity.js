;(function attachPantryQuantityModel(root) {
  'use strict';

  const STORAGE_KEY = 'angebotskueche.pantryQuantities';

  function normalizeName(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function identity(value) {
    const shared = root.AngebotskuecheIngredientModel;
    if (typeof shared?.shoppingIngredientIdentity === 'function') {
      return String(shared.shoppingIngredientIdentity(value) || '').trim();
    }
    return normalizeName(value).toLowerCase();
  }

  function normalizeQuantity(quantity, unit) {
    const parser = root.AngebotskuecheIngredientQuantityModel;
    if (typeof parser?.parseOfferPackSize !== 'function') return null;
    const parsed = parser.parseOfferPackSize(`${quantity ?? ''} ${unit ?? ''}`);
    if (!parsed || !Number.isFinite(parsed.amount) || parsed.amount <= 0 || parsed.amount > 1000000000) return null;
    return { family: parsed.family, unit: parsed.unit, amount: parsed.amount };
  }

  function normalizeDetail(value, fallbackName = '') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const name = normalizeName(value.name || fallbackName);
    const parsed = normalizeQuantity(value.amount ?? value.quantity, value.unit);
    if (!name || !parsed) return null;
    return { name, amount: parsed.amount, unit: parsed.unit };
  }

  function normalizeDetails(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const result = {};
    const seen = new Set();
    Object.keys(value).sort().forEach(storedKey => {
      const detail = normalizeDetail(value[storedKey], storedKey);
      const key = identity(detail?.name || storedKey);
      if (!detail || !key || seen.has(key)) return;
      seen.add(key);
      result[key] = detail;
    });
    return result;
  }

  function getQuantity(value, ingredient) {
    const key = identity(ingredient);
    if (!key) return null;
    return normalizeDetail(value?.[key]);
  }

  function setQuantity(value, ingredient, quantity, unit) {
    const result = normalizeDetails(value);
    const name = normalizeName(ingredient);
    const key = identity(name);
    const parsed = normalizeQuantity(quantity, unit);
    if (!name || !key || !parsed) return result;
    result[key] = { name, amount: parsed.amount, unit: parsed.unit };
    return result;
  }

  function removeQuantity(value, ingredient) {
    const result = normalizeDetails(value);
    const key = identity(ingredient);
    if (key) delete result[key];
    return result;
  }

  function retainForPantry(value, pantry) {
    const allowed = new Set((Array.isArray(pantry) ? pantry : []).map(identity).filter(Boolean));
    return Object.fromEntries(Object.entries(normalizeDetails(value)).filter(([key]) => allowed.has(key)));
  }


  function normalizeComparableQuantity(value) {
    if (typeof value === 'string') {
      const parser = root.AngebotskuecheIngredientQuantityModel;
      const parsed = parser?.parseOfferPackSize?.(value);
      if (!parsed || !Number.isFinite(parsed.amount) || parsed.amount <= 0 || parsed.amount > 1000000000) return null;
      return { family: parsed.family, unit: parsed.unit, amount: parsed.amount };
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    return normalizeQuantity(value.amount ?? value.quantity, value.unit);
  }

  function roundedAmount(value) {
    return Number(value.toFixed(6));
  }

  function reconcilePantryQuantity(demand, pantryQuantity) {
    const normalizedDemand = normalizeComparableQuantity(demand);
    const normalizedPantry = normalizeComparableQuantity(pantryQuantity);
    const base = {
      demand: normalizedDemand?.amount ?? null,
      coveredAmount: null,
      remainingDemand: null,
      family: normalizedDemand?.family || normalizedPantry?.family || null,
      unit: normalizedDemand?.unit || normalizedPantry?.unit || null,
      status: 'unknown',
    };
    if (!normalizedDemand || !normalizedPantry) return base;
    if (normalizedDemand.family !== normalizedPantry.family) {
      return { ...base, pantryAmount: normalizedPantry.amount, status: 'incompatible' };
    }
    const coveredAmount = Math.min(normalizedDemand.amount, normalizedPantry.amount);
    const remainingDemand = Math.max(0, normalizedDemand.amount - normalizedPantry.amount);
    return {
      ...base,
      coveredAmount: roundedAmount(coveredAmount),
      remainingDemand: roundedAmount(remainingDemand),
      status: remainingDemand === 0 ? 'covered' : 'partially-covered',
    };
  }

  function formatNumber(value) {
    const rounded = Number(value.toFixed(3));
    return String(rounded).replace('.', ',');
  }

  function formatQuantity(value) {
    const detail = normalizeDetail(value);
    if (!detail) return '';
    let amount = detail.amount;
    let unit = detail.unit;
    if (unit === 'g' && amount >= 1000) { amount /= 1000; unit = 'kg'; }
    if (unit === 'ml' && amount >= 1000) { amount /= 1000; unit = 'l'; }
    if (unit === 'piece') unit = 'Stück';
    return `${formatNumber(amount)} ${unit}`;
  }

  root.AngebotskuechePantryQuantityModel = Object.freeze({
    storageKey: STORAGE_KEY,
    normalizeQuantity,
    normalizeDetails,
    getQuantity,
    setQuantity,
    removeQuantity,
    retainForPantry,
    reconcilePantryQuantity,
    formatQuantity,
  });
}(typeof window !== 'undefined' ? window : globalThis));
