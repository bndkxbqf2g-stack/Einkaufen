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

for (const [label, match] of Object.entries({ normalizeMatch, purposeMatch, allowsMatch, candidatesMatch, assignmentMatch })) {
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
