;(function attachVarietyModel(root) {
  'use strict';

  function normalizeText(value) {
    const shared = root.AngebotskuecheIngredientModel;
    const normalized = typeof shared?.normalizeIngredient === 'function'
      ? shared.normalizeIngredient(value)
      : String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ');
    return String(normalized || '').replace(/\s+/g, ' ').trim();
  }

  function explicitValue(meal, fields) {
    for (const field of fields) {
      const value = normalizeText(meal?.[field]);
      if (value) return value;
    }
    return null;
  }

  function dishIdentity(meal) {
    const title = explicitValue(meal, ['title', 'name']);
    if (title) return title;
    const recipeId = explicitValue(meal, ['recipeId']);
    return recipeId ? `id:${recipeId}` : null;
  }

  function isLeftoverEntry(meal) {
    if (meal?.leftover === true || meal?.isLeftover === true) return true;
    const tags = Array.isArray(meal?.tags) ? meal.tags : [];
    return tags.some(tag => /rest/i.test(String(tag || ''))) || /rest/i.test(String(meal?.note || ''));
  }

  function chronologicalEntries(sections) {
    const lunches = Array.isArray(sections?.lunches) ? sections.lunches : [];
    const dinners = Array.isArray(sections?.dinners) ? sections.dinners : [];
    const entries = [];
    for (let dayIndex = 0; dayIndex < Math.max(lunches.length, dinners.length); dayIndex += 1) {
      if (lunches[dayIndex]) entries.push({ meal: lunches[dayIndex], dayIndex, slot: 'lunch' });
      if (dinners[dayIndex]) entries.push({ meal: dinners[dayIndex], dayIndex, slot: 'dinner' });
    }
    return entries;
  }

  function summarizeFeature(entries, readValue) {
    const values = entries.map(entry => readValue(entry.meal)).filter(Boolean);
    const uniqueValues = [...new Set(values)];
    const knownCount = values.length;
    const missingCount = entries.length - knownCount;
    return {
      uniqueCount: uniqueValues.length,
      values: uniqueValues,
      knownCount,
      missingCount,
      status: knownCount === entries.length ? 'complete' : knownCount ? 'partial' : 'missing',
    };
  }

  function summarizeRepeatedDishes(entries) {
    const groups = new Map();
    entries.forEach((entry, entryIndex) => {
      const key = dishIdentity(entry.meal);
      if (!key) return;
      const group = groups.get(key) || { key, title: entry.meal.title || entry.meal.name || key, entryIndexes: [], restEntryIndexes: [] };
      group.entryIndexes.push(entryIndex);
      if (isLeftoverEntry(entry.meal)) group.restEntryIndexes.push(entryIndex);
      groups.set(key, group);
    });
    return [...groups.values()]
      .filter(group => group.entryIndexes.length > 1)
      .map(group => ({
        dish: group.title,
        entryIndexes: group.entryIndexes,
        restEntryIndexes: group.restEntryIndexes,
        repeatedAsLeftover: group.restEntryIndexes.length > 0,
      }));
  }

  function summarizePlanVariety(sections = {}) {
    const entries = chronologicalEntries(sections);
    const dishFeature = summarizeFeature(entries, dishIdentity);
    const mainFeature = summarizeFeature(entries, meal => explicitValue(meal, ['main', 'mainIngredient']));
    const preparationFeature = summarizeFeature(entries, meal => explicitValue(meal, ['preparationMethod', 'cookingMethod', 'preparation']));
    const repeatedDishes = summarizeRepeatedDishes(entries);
    let status = 'empty';
    if (entries.length && dishFeature.status === 'missing') status = 'unknown';
    else if (entries.length && dishFeature.uniqueCount <= 1) status = 'repeated';
    else if (entries.length && (mainFeature.uniqueCount > 1 || preparationFeature.uniqueCount > 1)) status = 'varied';
    else if (entries.length) status = 'varied-by-dish';
    return {
      entryCount: entries.length,
      entries: entries.map((entry, index) => ({
        index,
        dayIndex: entry.dayIndex,
        slot: entry.slot,
        dish: entry.meal.title || entry.meal.name || null,
        dishKey: dishIdentity(entry.meal),
        isLeftover: isLeftoverEntry(entry.meal),
      })),
      dishes: dishFeature,
      mainIngredients: mainFeature,
      preparationMethods: preparationFeature,
      repeatedDishes,
      leftoverEntryCount: entries.filter(entry => isLeftoverEntry(entry.meal)).length,
      status,
    };
  }

  root.AngebotskuecheVarietyModel = Object.freeze({
    chronologicalEntries,
    summarizePlanVariety,
  });
}(typeof window !== 'undefined' ? window : globalThis));

