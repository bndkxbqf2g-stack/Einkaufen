import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const dist = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

const normalizeMatch = source.match(/function normalizeMealDuration\(value\) \{[\s\S]*?\r?\n    \}/);
const labelMatch = source.match(/function mealDurationLabel\(meal\) \{[\s\S]*?\r?\n    \}/);
const difficultyMatch = source.match(/function mealDifficultyLabel\(meal\) \{[\s\S]*?\r?\n    \}/);
assert.ok(normalizeMatch, 'normalizeMealDuration must be present in index.html');
assert.ok(labelMatch, 'mealDurationLabel must be present in index.html');
assert.ok(difficultyMatch, 'mealDifficultyLabel must be present in index.html');

const durationModel = vm.runInNewContext(
  `${normalizeMatch[0]}\n${labelMatch[0]}\n${difficultyMatch[0]}\n({ normalizeMealDuration, mealDurationLabel, mealDifficultyLabel })`,
  {},
);

test('zeigt nur sichere Rezeptdauern und kennzeichnet unbekannte Dauer', () => {
  assert.equal(durationModel.normalizeMealDuration(35), 35);
  assert.equal(durationModel.normalizeMealDuration('45'), 45);
  assert.equal(durationModel.normalizeMealDuration(0), null);
  assert.equal(durationModel.normalizeMealDuration(1441), null);
  assert.equal(durationModel.normalizeMealDuration('nicht bekannt'), null);
  assert.equal(durationModel.mealDurationLabel({ time: 35 }), '35 Min.');
  assert.equal(durationModel.mealDurationLabel({}), 'Dauer offen');
  assert.equal(durationModel.mealDifficultyLabel({ difficulty: 'leicht' }), 'leicht');
  assert.equal(durationModel.mealDifficultyLabel({ difficulty: '' }), 'Aufwand offen');
  assert.equal(durationModel.mealDifficultyLabel({ difficulty: 'x'.repeat(41) }), 'Aufwand offen');
});

test('führt Rezeptdauer in Mittag- und Abendessen-Karten', () => {
  const planRenderer = source.slice(source.indexOf('function renderPlan'), source.indexOf('function renderPlanSuggestions'));
  const dinnerRenderer = source.match(/function renderDinnerCard\(dinner, index, people\) \{[\s\S]*?\r?\n    \}/);
  const suggestionAsMeal = source.match(/function suggestionAsMeal\(recipe, index, slot = 'lunch'\) \{[\s\S]*?\r?\n    \}/);

  assert.ok(dinnerRenderer, 'renderDinnerCard must be present');
  assert.ok(suggestionAsMeal, 'suggestionAsMeal must be present');
  assert.match(planRenderer, /mealDurationLabel\(meal\)/);
  assert.match(planRenderer, /mealDifficultyLabel\(meal\)/);
  assert.match(dinnerRenderer[0], /mealDurationLabel\(dinner\)/);
  assert.match(dinnerRenderer[0], /mealDifficultyLabel\(dinner\)/);
  assert.match(suggestionAsMeal[0], /time: normalizeMealDuration\(recipe\.time\)/);
  assert.match(suggestionAsMeal[0], /difficulty: recipe\.difficulty \|\| null/);
});

test('hält den veröffentlichten Plan-Bundle synchron', () => {
  assert.equal(dist, source);
});

console.log('Meal duration display checks passed');
