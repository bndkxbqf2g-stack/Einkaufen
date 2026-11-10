import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const worker = await readFile(new URL('../worker/index.js', import.meta.url), 'utf8');
const dist = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

function parserBody(value, startMarker, endMarker) {
  const start = value.indexOf(startMarker);
  const end = value.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `${startMarker} must be present`);
  return value.slice(start, end);
}

const appParser = parserBody(source, 'function parseRecipeJsonLd', 'function readKnownRecipeImport');
const workerParser = parserBody(worker, 'function parseRecipeJsonLd', 'async function readText');

test('hält unbekannte Vegetarisch-Angaben im App- und Worker-Import offen', () => {
  for (const parser of [appParser, workerParser]) {
    assert.match(parser, /vegetarian: \/\\b\(\?:vegetarian\|vegan\)\\b\/i\.test\([\s\S]*?\) \? true : null/);
    assert.doesNotMatch(parser, /vegetarian: Boolean/);
  }
});

test('hält den veröffentlichten Plan-Bundle synchron', () => {
  assert.equal(dist, source);
});

console.log('Recipe vegetarian metadata checks passed');
