import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const [source, published] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
]);

assert.equal(published, source, 'published bundle must stay byte-identical to the source');

const assignmentMatch = source.match(/function openAssignModal\(recipeId, dayIndex = null\) \{[\s\S]*?\n    \}/);
assert.ok(assignmentMatch, 'openAssignModal must remain present');

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

const elements = new Map();
const element = () => ({
  hidden: false,
  textContent: '',
  innerHTML: '',
  classList: { add() {} },
});
for (const id of ['assignRecipeChoiceLabel', 'assignRecipeSelect', 'saveDayAssignment', 'assignRecipeLabel', 'assignDaySelect', 'assignStatus', 'assignModal']) {
  elements.set('#' + id, element());
}
elements.set('#daysSelect', { value: '1' });

const candidate = { id: 'chosen', title: 'Neues Rezept' };
const oldRecipe = { id: 'old', title: '<img src="x" onerror="alert(1)">' };
const context = {
  assignmentSlot: '',
  assignmentRecipeId: '',
  days: 1,
  manualPlan: { '0': 'old' },
  $: selector => elements.get(selector),
  escapeHtml,
  getPlanCandidateById: id => [candidate, oldRecipe].find(recipe => recipe.id === id) || null,
  getPlanDateInfo: () => ({ day: 'Montag', short: '10. Nov.' }),
};

vm.runInNewContext(
  `${assignmentMatch[0]}\nglobalThis.openAssignModal = openAssignModal;`,
  context,
);
context.openAssignModal('chosen', 0);

const rendered = elements.get('#assignDaySelect').innerHTML;
assert.doesNotMatch(rendered, /<img|onerror=/i);
assert.match(rendered, /&lt;img src=&quot;x&quot; onerror=&quot;alert\(1\)&quot;&gt;/);

console.log('Assignment title escaping checks passed');
