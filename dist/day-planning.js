;(function attachDayPlanningModel(root) {
  'use strict';

  const PEOPLE_OPTIONS = Object.freeze([2, 3, 4]);
  const PARTICIPANT_IDS = Object.freeze(['martin', 'steffi', 'children']);
  const PARTICIPANT_ALIASES = Object.freeze({
    martin: 'martin',
    steffi: 'steffi',
    kinder: 'children',
    children: 'children',
  });

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

  function normalizeParticipantId(value) {
    const normalized = String(value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-');
    return PARTICIPANT_ALIASES[normalized] || null;
  }

  function normalizeParticipants(value) {
    const selected = new Set((Array.isArray(value) ? value : []).map(normalizeParticipantId).filter(Boolean));
    return PARTICIPANT_IDS.filter(id => selected.has(id));
  }

  function normalizeDayParticipants(value) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return Object.fromEntries(
      Object.entries(source)
        .filter(([key, participants]) => /^\d+$/.test(key) && Array.isArray(participants))
        .map(([key, participants]) => [String(Number(key)), normalizeParticipants(participants)])
        .filter(([, participants]) => participants.length > 0),
    );
  }

  function resolveDayParticipants(dayParticipants, index, fallback = []) {
    const normalized = normalizeDayParticipants(dayParticipants);
    const key = String(index);
    return Object.prototype.hasOwnProperty.call(normalized, key)
      ? normalized[key]
      : normalizeParticipants(fallback);
  }

  function peopleForParticipants(participants, childCount, fallback = 2) {
    const selected = normalizeParticipants(participants);
    const normalizedFallback = normalizePeople(fallback);
    if (!selected.length) return normalizedFallback;
    const childrenSelected = selected.includes('children');
    const normalizedChildCount = Number(childCount);
    const children = childrenSelected
      ? Number.isInteger(normalizedChildCount) && normalizedChildCount > 0 ? normalizedChildCount : null
      : 0;
    if (children === null) return normalizedFallback;
    const people = selected.filter(id => id !== 'children').length + children;
    return PEOPLE_OPTIONS.includes(people) ? people : normalizedFallback;
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
    participantIds: PARTICIPANT_IDS,
    normalizePeople,
    normalizeDayPeople,
    normalizeParticipantId,
    normalizeParticipants,
    normalizeDayParticipants,
    resolveDayParticipants,
    peopleForParticipants,
    resolveDayPeople,
    portionUnitsForPeople,
  });
}(typeof window !== 'undefined' ? window : globalThis));
