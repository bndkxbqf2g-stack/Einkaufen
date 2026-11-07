;(function attachIngredientNormalization(root) {
  'use strict';

  function normalizeIngredient(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9äöüß ]/g, ' ');
  }

  function shoppingIngredientKey(ingredient) {
    return normalizeIngredient(ingredient)
      .replace(/\b(frisch|frische|frischen|gehackt|gerieben|gemischt|rote|roten|gross|grosse|große|klein|kleine)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function shoppingIngredientIdentity(ingredient) {
    return shoppingIngredientKey(ingredient)
      .split(/\s+/)
      .map(word => word.length >= 5 && word.endsWith('n') ? word.slice(0, -1) : word)
      .join(' ');
  }

  root.AngebotskuecheIngredientModel = Object.freeze({
    normalizeIngredient,
    shoppingIngredientKey,
    shoppingIngredientIdentity,
  });
}(typeof window !== 'undefined' ? window : globalThis));
