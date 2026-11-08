import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const dist = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
assert.equal(dist, source, 'published bundle must stay byte-identical to the source');

const normalizeMatch = source.match(/function normalizeRecipeMealPurpose\(value\) \{[\s\S]*?\n    \}/);
const purposeMatch = source.match(/function recipeMealPurpose\(recipe\) \{[\s\S]*?\n    \}/);
const allowsMatch = source.match(/function mealPurposeAllowsSlot\(recipe, slot = 'lunch'\) \{[\s\S]*?\n    \}/);
const candidatesMatch = source.match(/function getPlanCandidatesForSlot\(slot = 'lunch'\) \{[\s\S]*?\n    \}/);
const assignmentMatch = source.match(/function assignRecipeToDinner\(recipeId, dayIndex\) \{[\s\S]*?\n    \}/);
const dinnersMatch = source.match(/function buildCurrentPlanDinners\(lunches\) \{[\s\S]*?\n    \}/);
const dinnerCardMatch = source.match(/function renderDinnerCard\(dinner, index, people\) \{[\s\S]*?\n    \}/);
const lunchAssignmentMatch = source.match(/function assignRecipeToDay\(recipeId, dayIndex\) \{[\s\S]*?\n    \}/);
const currentPlanMatch = source.match(/function buildCurrentPlanLunches\(\) \{[\s\S]*?\n    \}/);
const sectionsMatch = source.match(/function getCurrentPlanSections\(\) \{[\s\S]*?\n    \}/);
const plannedDinnersMatch = source.match(/function getPlannedDinnerMeals\(\) \{[\s\S]*?\n    \}/);

for (const [label, match] of Object.entries({ normalizeMatch, purposeMatch, allowsMatch, candidatesMatch, assignmentMatch, dinnersMatch, dinnerCardMatch, lunchAssignmentMatch, currentPlanMatch, sectionsMatch, plannedDinnersMatch })) {
  assert.ok(match, `${label} must be present in index.html`);
}

const mealPurposeAllowsSlot = vm.runInNewContext(
  `${normalizeMatch[0]}\n${purposeMatch[0]}\n${allowsMatch[0]}\nmealPurposeAllowsSlot`,
  {},
);

const recipes = [
  { id: 'main', title: 'Hauptgericht', mealPurpose: 'Hauptgericht' },
  { id: 'bread', title: 'Brotzeit', mealPurpose: 'Brotzeit' },
  { id: 'flex', title: 'Flexibel', mealPurpose: 'Flexibel' },
  { id: 'breakfast', title: 'Frühstück', mealPurpose: 'Frühstück' },
];

const candidateContext = {
  getPlanCandidates: () => recipes,
  mealPurposeAllowsSlot,
};
vm.runInNewContext(
  `${candidatesMatch[0]}\nglobalThis.getPlanCandidatesForSlot = getPlanCandidatesForSlot;`,
  candidateContext,
);

test('treats mealPurpose explicitly for lunch and dinner', () => {
  assert.deepEqual(
    candidateContext.getPlanCandidatesForSlot('lunch').map(recipe => recipe.id),
    ['main', 'flex'],
  );
  assert.deepEqual(
    candidateContext.getPlanCandidatesForSlot('dinner').map(recipe => recipe.id),
    ['bread', 'flex'],
  );
  assert.equal(mealPurposeAllowsSlot({ mealPurpose: 'Snack' }, 'dinner'), false);
});

test('keeps dinner assignments separate and limited to one per day', () => {
  const assignments = {};
  const candidates = new Map(recipes.map(recipe => [recipe.id, recipe]));
  const assignmentContext = {
    manualDinnerPlan: assignments,
    getPlanCandidateById: id => candidates.get(id) || null,
    mealPurposeAllowsSlot,
    $: () => ({ value: 3 }),
    localStorage: { setItem() {} },
  };
  vm.runInNewContext(
    `${assignmentMatch[0]}\nglobalThis.assignRecipeToDinner = assignRecipeToDinner;`,
    assignmentContext,
  );

  assert.equal(assignmentContext.assignRecipeToDinner('bread', 1), true);
  assert.deepEqual(assignments, { '1': 'bread' });
  assert.equal(assignmentContext.assignRecipeToDinner('flex', 1), true);
  assert.deepEqual(assignments, { '1': 'flex' });
  assert.equal(assignmentContext.assignRecipeToDinner('main', 2), false);
});


test('prevents one recipe from occupying lunch and dinner on the same day', () => {
  const duplicateContext = {
    manualDinnerPlan: {},
    getPlanCandidateById: id => recipes.find(recipe => recipe.id === id) || null,
    mealPurposeAllowsSlot,
    getCurrentPlanMeals: () => [{ recipeId: 'flex' }],
    $: () => ({ value: 1 }),
    localStorage: { setItem() {} },
  };
  vm.runInNewContext(
    `${assignmentMatch[0]}\nglobalThis.assignRecipeToDinner = assignRecipeToDinner;`,
    duplicateContext,
  );

  assert.equal(duplicateContext.assignRecipeToDinner('flex', 0), false);
  assert.deepEqual(duplicateContext.manualDinnerPlan, {});
});

test('hides a stale dinner assignment when lunch now uses the same recipe', () => {
  const dinnerContext = {
    manualDinnerPlan: { '0': 'flex' },
    getPlanCandidates: () => recipes,
    mealPurposeAllowsSlot,
    getCurrentPlanMeals: () => [{ recipeId: 'flex' }],
    getPlanCandidateById: id => recipes.find(recipe => recipe.id === id) || null,
    $: () => ({ value: 1 }),
    getPlanDateInfo: index => ({ day: `Tag ${index + 1}`, short: `T${index + 1}` }),
    suggestionAsMeal: recipe => ({ ...recipe, recipeId: recipe.id, title: recipe.title, kind: 'dinner', score: 80, cost: '4,00 €' }),
  };
  vm.runInNewContext(
    `${dinnersMatch[0]}\nglobalThis.buildCurrentPlanDinners = buildCurrentPlanDinners;`,
    dinnerContext,
  );

  assert.equal(dinnerContext.buildCurrentPlanDinners([{ recipeId: 'flex' }])[0], null);
});

test('ignores stale dinner assignments for removed or ineligible legacy recipes', () => {
  const dinnerContext = {
    manualDinnerPlan: { '0': 'breakfast', '1': 'removed', '2': 'bread' },
    getPlanCandidates: () => recipes,
    mealPurposeAllowsSlot,
    getCurrentPlanMeals: () => [null, null, null],
    getPlanCandidateById: id => recipes.find(recipe => recipe.id === id) || null,
    $: () => ({ value: 3 }),
    getPlanDateInfo: index => ({ day: `Tag ${index + 1}`, short: `T${index + 1}` }),
    suggestionAsMeal: recipe => ({ ...recipe, recipeId: recipe.id, kind: 'dinner' }),
  };
  vm.runInNewContext(
    `${dinnersMatch[0]}\nglobalThis.buildCurrentPlanDinners = buildCurrentPlanDinners;`,
    dinnerContext,
  );

  const dinners = dinnerContext.buildCurrentPlanDinners([null, null, null]);
  assert.deepEqual(Array.from(dinners, dinner => dinner?.recipeId || null), [null, null, 'bread']);
});

test('respects the optional evening toggle when reading planned dinners', () => {
  const plannedContext = {
    eveningEnabled: false,
    $: () => ({ checked: plannedContext.eveningEnabled }),
    getCurrentPlanSections: () => ({ dinners: [{ recipeId: 'bread' }, null] }),
  };
  vm.runInNewContext(
    `${plannedDinnersMatch[0]}\nglobalThis.getPlannedDinnerMeals = getPlannedDinnerMeals;`,
    plannedContext,
  );

  assert.deepEqual(Array.from(plannedContext.getPlannedDinnerMeals()), []);
  plannedContext.eveningEnabled = true;
  assert.deepEqual(Array.from(plannedContext.getPlannedDinnerMeals(), dinner => dinner.recipeId), ['bread']);
});

test('shows a recipe source link on dinner cards when available', () => {
  const dinnerContext = {
    getPlanDateInfo: () => ({ day: 'Montag', short: 'Mo, 10. Nov.' }),
    escapeHtml: value => String(value ?? ''),
    recipeMealPurpose: () => 'Brotzeit',
    parseMoney: () => 4,
    parseKnownMoney: () => 4,
    formatEuro: value => `${Number(value).toFixed(2).replace('.', ',')} €`,
    recipeRatings: {},
    mealRatingKey: () => 'dinner-1',
    marketDisplayString: () => 'Aldi',
    getMealIngredients: () => ['Brot', 'Käse'],
    recipeSourceUrl: dinner => dinner.url || '',
  };
  vm.runInNewContext(
    `${dinnerCardMatch[0]}\nglobalThis.renderDinnerCard = renderDinnerCard;`,
    dinnerContext,
  );

  const html = dinnerContext.renderDinnerCard({
    recipeId: 'dinner-1',
    title: 'Synthetische Brotzeit',
    url: 'https://example.test/brotzeit',
    emoji: '🥪',
    kind: 'dinner',
    score: 80,
    cost: '4,00 €',
    store: 'Aldi',
    tags: ['Abendessen'],
  }, 0, 2);

  assert.match(html, /data-recipe-source="true"/);
  assert.match(html, new RegExp('https://example\\.test/brotzeit'));
});

test('rejects breakfast from manual lunch assignment and keeps valid lunch choices', () => {
  const assignmentContext = {
    manualPlan: {},
    getPlanCandidateById: id => recipes.find(recipe => recipe.id === id) || null,
    mealPurposeAllowsSlot,
    $: () => ({ value: 5 }),
    localStorage: { setItem() {} },
  };
  vm.runInNewContext(
    `${lunchAssignmentMatch[0]}\nglobalThis.assignRecipeToDay = assignRecipeToDay;`,
    assignmentContext,
  );

  assert.equal(assignmentContext.assignRecipeToDay('breakfast', 0), false);
  assert.deepEqual(assignmentContext.manualPlan, {});
  assert.equal(assignmentContext.assignRecipeToDay('main', 0), true);
  assert.deepEqual(assignmentContext.manualPlan, { '0': 'main' });
});

test('uses lunch-only candidates when restoring manual plan assignments', () => {
  assert.match(currentPlanMatch[0], /getPlanCandidateById\(recipeId, lunchCandidates\)/);
});


test('renders slot actions only for lunch-capable suggestions with real recipe ids', () => {
  const suggestionMatch = source.match(/function renderSuggestions\(\) \{[\s\S]*?\n    \}/);
  assert.ok(suggestionMatch, 'renderSuggestions must be present in index.html');
  const expressionMatch = suggestionMatch[0].match(/const slotActions = (.+);/);
  assert.ok(expressionMatch, 'slot action expression must be present');
  const renderSlotActions = vm.runInNewContext(`(recipe, pinned, escapeHtml, mealPurposeAllowsSlot) => ${expressionMatch[1]}`);
  const allowsLunch = recipe => ['Hauptgericht', 'Flexibel'].includes(recipe.mealPurpose);
  const escapeHtml = value => String(value ?? '');
  const lunchHtml = renderSlotActions({ id: 'main-1', mealPurpose: 'Hauptgericht' }, false, escapeHtml, allowsLunch);
  const breakfastHtml = renderSlotActions({ id: 'breakfast-1', mealPurpose: 'Frühstück' }, false, escapeHtml, allowsLunch);
  assert.match(lunchHtml, /data-today-recipe="main-1"/);
  assert.match(lunchHtml, /data-assign-recipe="main-1"/);
  assert.match(lunchHtml, /data-plan-recipe="main-1"/);
  assert.doesNotMatch(breakfastHtml, /data-(today|assign|plan)-recipe/);
});
