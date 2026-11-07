import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const published = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

test('does not reuse an unverified recipe reason as offer evidence', () => {
  const verifiedReason = "const reason = matchedNames.length ? `${matchedNames.join(' + ')} im Angebot` : 'Noch kein direkter Angebotsanker';";
  assert.ok(source.includes(verifiedReason));
  assert.equal(source.includes("matchedNames.length ? `${matchedNames.join(' + ')} im Angebot` : (recipe.reason"), false);
});

test('labels recipe-plan entries according to actual offer matches', () => {
  assert.ok(source.includes("match.matchedIngredients.length ? 'Angebotsanker' : 'Angebotsbezug offen'"));
  assert.ok(source.includes("note: match.reason || 'Angebotsbezug noch nicht verifiziert'"));
});

test('keeps the published frontend synchronized with the source page', () => {
  assert.equal(published, source);
});

console.log('Offer evidence checks passed');