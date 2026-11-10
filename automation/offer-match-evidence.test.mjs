import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

const start = source.indexOf('function offerMatchLabel');
const end = source.indexOf('\n\n    function compareOfferCandidates', start);
assert.ok(start >= 0 && end > start, 'offerMatchLabel muss im App-Code vorhanden sein');
const helper = source.slice(start, end);
const offerMatchLabel = new Function(helper + '; return offerMatchLabel;')();

test('zeigt keine unbelegte Match-Prozentzahl', () => {
  assert.equal(offerMatchLabel({ relevance: 82 }), 'Match offen');
  assert.equal(offerMatchLabel({ relevance: 82, relevanceSource: 'import' }), 'Match offen');
  assert.equal(offerMatchLabel({ relevance: 82, relevanceSource: 'calculated' }), '82% Match');
  assert.equal(offerMatchLabel({ relevance: 101, relevanceSource: 'calculated' }), 'Match offen');
});

test('hält die veröffentlichte App synchron', () => {
  assert.equal(published, source);
});

console.log('Offer match evidence checks passed');
