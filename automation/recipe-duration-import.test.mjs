import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const dist = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

const helperMatch = source.match(/function parseRecipeDurationMinutes\(value\) \{[\s\S]*?\r?\n    \}/);
const parserStart = source.indexOf('function parseRecipeJsonLd');
const parserEnd = source.indexOf('function readKnownRecipeImport', parserStart);
assert.ok(helperMatch, 'parseRecipeDurationMinutes must be present');
assert.ok(parserStart >= 0 && parserEnd > parserStart, 'parseRecipeJsonLd must be present');

const durationModel = vm.runInNewContext(
  `${helperMatch[0]}\n({ parseRecipeDurationMinutes })`,
  {},
);
const parserSource = source.slice(parserStart, parserEnd);

test('liest ISO- und deutsche Rezeptzeiten vollständig', () => {
  assert.equal(durationModel.parseRecipeDurationMinutes('PT45M'), 45);
  assert.equal(durationModel.parseRecipeDurationMinutes('PT1H30M'), 90);
  assert.equal(durationModel.parseRecipeDurationMinutes('1 Std. 30 Min.'), 90);
  assert.equal(durationModel.parseRecipeDurationMinutes('90 Minuten'), 90);
  assert.equal(durationModel.parseRecipeDurationMinutes('unbekannt'), undefined);
  assert.equal(durationModel.parseRecipeDurationMinutes('PT25H'), undefined);
});

test('verwendet den vollständigen Dauerparser im generischen Rezeptimport', () => {
  assert.match(parserSource, /time: parseRecipeDurationMinutes\(recipe\.totalTime\)/);
  assert.doesNotMatch(parserSource, /match\(\/\\d\+\//);
});

test('hält den veröffentlichten Plan-Bundle synchron', () => {
  assert.equal(dist, source);
});

console.log('Recipe duration import checks passed');
