import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const normalizedSource = source.replace(/\r\n/g, '\n');

const start = normalizedSource.indexOf('function offerMatchLabel');
const end = normalizedSource.indexOf('\n\n    function compareOfferCandidates', start);
assert.ok(start >= 0 && end > start, 'offerMatchLabel muss im App-Code vorhanden sein');
const helper = normalizedSource.slice(start, end);
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
