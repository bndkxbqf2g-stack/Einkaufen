;(function attachIngredientQuantityModel(root) {
  'use strict';

  const UNIT_DEFINITIONS = Object.freeze({
    mass: Object.freeze({ baseUnit: 'g', aliases: /^(?:g|gramm?|kg|kilogramm?)$/i, factors: Object.freeze({ g: 1, gram: 1, gramm: 1, kg: 1000, kilogramm: 1000, kilogram: 1000 }) }),
    volume: Object.freeze({ baseUnit: 'ml', aliases: /^(?:ml|milliliter|millilitre|l|liter|litre|cl|zentiliter|dl|deziliter)$/i, factors: Object.freeze({ ml: 1, milliliter: 1, millilitre: 1, l: 1000, liter: 1000, litre: 1000, cl: 10, zentiliter: 10, dl: 100, deziliter: 100 }) }),
    count: Object.freeze({ baseUnit: 'piece', aliases: /^(?:stück|stueck|stk\.?|st\.?|pcs?\.?|piece|pieces)$/i, factors: Object.freeze({ stück: 1, stueck: 1, stk: 1, st: 1, pc: 1, pcs: 1, piece: 1, pieces: 1 }) }),
  });

  const QUANTITY_NUMBER_PATTERN = '(?:\\d{1,3}(?:\\.\\d{3})+(?:,\\d+)?|\\d+(?:[.,]\\d+)?)';
  const MAX_NORMALIZED_AMOUNT = 1_000_000_000;

  function parsePositiveNumber(value) {
    const text = String(value ?? '').trim().replace(/\s+/g, '');
    const normalized = /^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(text)
      ? text.replace(/\./g, '').replace(',', '.')
      : /^\d+(?:,\d+)?$/.test(text)
        ? text.replace(',', '.')
        : /^\d+\.\d+$/.test(text)
          ? text
          : null;
    if (normalized === null) return null;
    const number = Number(normalized);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function unitDefinition(value) {
    const raw = String(value || '').trim().toLowerCase().replace(/\.$/, '');
    for (const [family, definition] of Object.entries(UNIT_DEFINITIONS)) {
      if (!definition.aliases.test(raw)) continue;
      const factor = definition.factors[raw] ?? 1;
      return { family, unit: definition.baseUnit, factor };
    }
    return null;
  }

  function parsedAmount(quantity, unit, multiplier = 1) {
    const number = parsePositiveNumber(quantity);
    const definition = unitDefinition(unit);
    if (!number || !definition || !Number.isFinite(multiplier) || multiplier <= 0) return null;
    const amount = number * definition.factor * multiplier;
    return Number.isFinite(amount) && amount > 0 && amount <= MAX_NORMALIZED_AMOUNT
      ? { family: definition.family, unit: definition.unit, amount }
      : null;
  }

  function emptyIngredient(raw) {
    const text = String(raw ?? '').trim().replace(/^[-•]\s*/, '').trim();
    return { raw: text, name: text, explicit: false, family: null, unit: null, amount: null };
  }

  function parseRecipeIngredient(raw) {
    const fallback = emptyIngredient(raw);
    if (!fallback.name) return fallback;
    const match = fallback.name.match(new RegExp(`^(${QUANTITY_NUMBER_PATTERN})\\s*(?:(?:x|×)\\s*(${QUANTITY_NUMBER_PATTERN})\\s*)?([a-zäöüß.]+)\\s+(.+)$`, 'i'));
    if (!match) return fallback;
    const multiplier = match[2] ? parsePositiveNumber(match[1]) : 1;
    const parsed = parsedAmount(match[2] || match[1], match[3], multiplier);
    const name = String(match[4] || '').trim().replace(/^[,;:]\s*/, '').trim();
    if (!parsed || !name) return fallback;
    return { ...fallback, name, explicit: true, ...parsed };
  }

  function parseOfferPackSize(value) {
    const text = String(value || '').trim();
    const countPack = text.match(new RegExp(`^(${QUANTITY_NUMBER_PATTERN})\\s*[- ]?er\\s*(?:pack(?:ung)?|beutel|dose|schale)?$`, 'i'));
    if (countPack) {
      const amount = parsePositiveNumber(countPack[1]);
      return amount ? { family: 'count', unit: 'piece', amount } : null;
    }
    const grouped = text.match(new RegExp(`^(${QUANTITY_NUMBER_PATTERN})\\s*[x×]\\s*(${QUANTITY_NUMBER_PATTERN})\\s*([a-zäöüß.]+)\\b`, 'i'));
    if (grouped) {
      const multiplier = parsePositiveNumber(grouped[1]);
      const parsed = parsedAmount(grouped[2], grouped[3], multiplier);
      if (parsed) return parsed;
    }
    const match = text.match(new RegExp(`^(${QUANTITY_NUMBER_PATTERN})\\s*([a-zäöüß.]+)\\b`, 'i'));
    if (!match) return null;
    return parsedAmount(match[1], match[2]);
  }

  function createQuantityBasis() {
    return { valid: true, family: null, unit: null, amount: 0 };
  }

  function addRecipeQuantity(basis, ingredient, portionUnits) {
    const current = basis && typeof basis === 'object' ? { ...basis } : createQuantityBasis();
    const parsed = ingredient && ingredient.explicit ? ingredient : null;
    const portions = Number(portionUnits);
    if (!parsed || !Number.isFinite(portions) || portions <= 0) return { ...current, valid: false };
    if (current.family && current.family !== parsed.family) return { ...current, valid: false };
    const currentAmount = Number(current.amount);
    if (!Number.isFinite(currentAmount) || currentAmount < 0 || currentAmount > MAX_NORMALIZED_AMOUNT) {
      return { ...current, valid: false };
    }
    const amount = Number(parsed.amount) * portions;
    const total = currentAmount + amount;
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(total) || total > MAX_NORMALIZED_AMOUNT) {
      return { ...current, valid: false };
    }
    return {
      valid: current.valid !== false,
      family: current.family || parsed.family,
      unit: current.unit || parsed.unit,
      amount: total,
    };
  }

  function calculateExactPackCount(item) {
    const basis = item?.quantityBasis;
    const pack = parseOfferPackSize(item?.offer?.packSize);
    if (!basis?.valid || !pack || basis.family !== pack.family
      || !Number.isFinite(basis.amount) || basis.amount <= 0 || basis.amount > MAX_NORMALIZED_AMOUNT
      || !Number.isFinite(pack.amount) || pack.amount <= 0 || pack.amount > MAX_NORMALIZED_AMOUNT) return null;
    const ratio = basis.amount / pack.amount;
    if (!Number.isFinite(ratio) || ratio <= 0) return null;
    // Only absorb IEEE-754 noise; a real positive overage must round up.
    const tolerance = Number.EPSILON * Math.max(1, Math.abs(ratio)) * 8;
    const packCount = Math.ceil(ratio - tolerance);
    return Number.isSafeInteger(packCount) ? Math.max(1, packCount) : null;
  }

  root.AngebotskuecheIngredientQuantityModel = Object.freeze({
    parseRecipeIngredient,
    parseOfferPackSize,
    createQuantityBasis,
    addRecipeQuantity,
    calculateExactPackCount,
  });
}(typeof window !== 'undefined' ? window : globalThis));
