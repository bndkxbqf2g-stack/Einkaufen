;(function attachDayPlanningModel(root) {
  'use strict';

  const PEOPLE_OPTIONS = Object.freeze([2, 3, 4]);

  function normalizePeople(value, fallback = 2) {
    const candidate = Number(value);
    if (PEOPLE_OPTIONS.includes(candidate)) return candidate;
    const normalizedFallback = Number(fallback);
    return PEOPLE_OPTIONS.includes(normalizedFallback) ? normalizedFallback : PEOPLE_OPTIONS[0];
  }

  function normalizeDayPeople(value) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return Object.fromEntries(
      Object.entries(source)
        .filter(([key, people]) => /^\d+$/.test(key) && PEOPLE_OPTIONS.includes(Number(people)))
        .map(([key, people]) => [String(Number(key)), Number(people)]),
    );
  }

  function resolveDayPeople(dayPeople, index, globalPeople = 2) {
    const fallback = normalizePeople(globalPeople);
    const normalized = normalizeDayPeople(dayPeople);
    const key = String(index);
    return Object.prototype.hasOwnProperty.call(normalized, key) ? normalized[key] : fallback;
  }

  function portionUnitsForPeople(people) {
    return normalizePeople(people) / 2;
  }

  root.AngebotskuecheDayPlanningModel = Object.freeze({
    peopleOptions: PEOPLE_OPTIONS,
    normalizePeople,
    normalizeDayPeople,
    resolveDayPeople,
    portionUnitsForPeople,
  });
}(typeof window !== 'undefined' ? window : globalThis));
