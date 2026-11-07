;(function attachMealPlanningModel(root) {
  'use strict';

  const MEAL_PURPOSES = Object.freeze([
    'Hauptgericht',
    'Frühstück',
    'Brotzeit',
    'Snack',
    'Getränk',
    'Flexibel',
  ]);

  function normalizeRecipeMealPurpose(value) {
    const purpose = String(value || '').trim();
    return MEAL_PURPOSES.includes(purpose) ? purpose : 'Flexibel';
  }

  function mealPurposeAllowsSlot(recipe, slot = 'lunch') {
    const purpose = normalizeRecipeMealPurpose(recipe?.mealPurpose);
    if (slot === 'dinner') return purpose === 'Brotzeit' || purpose === 'Flexibel';
    return purpose === 'Hauptgericht' || purpose === 'Flexibel';
  }

  root.AngebotskuecheMealModel = Object.freeze({
    mealPurposes: MEAL_PURPOSES,
    normalizeRecipeMealPurpose,
    mealPurposeAllowsSlot,
  });
}(typeof window !== 'undefined' ? window : globalThis));
