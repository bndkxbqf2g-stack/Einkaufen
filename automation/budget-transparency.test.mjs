import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [modelSource, publishedModelSource, source, published] = await Promise.all([
  readFile(new URL('../budget-transparency.js', import.meta.url), 'utf8'),
  readFile(new URL('../dist/budget-transparency.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
]);
const browserGlobal = {};
runInNewContext(modelSource, browserGlobal);
const model = browserGlobal.AngebotskuecheBudgetModel;
const rendererStart = source.indexOf('function renderBudgetTransparency');
const rendererEnd = source.indexOf('\n    function formatShoppingCostScope', rendererStart);
const renderer = source.slice(rendererStart, rendererEnd);

test('verwendet ein getrenntes Monatszielmodell ohne IST-Restbudget', () => {
  assert.equal(model.monthlyTargetCents, 40_000);
  const partial = model.summarizeBudgetTransparency({
    knownOfferTotalCents: 1_234,
    unresolvedPositionCount: 2,
    actualSpendCents: 1_234,
  });

  assert.deepEqual({ ...partial }, {
    monthlyTargetCents: 40_000,
    knownOfferTotalCents: 1_234,
    knownOfferStatus: 'partial',
    unresolvedPositionCount: 2,
    actualSpendCents: null,
    actualSpendStatus: 'not-recorded',
  });
  assert.equal('remainingCents' in partial, false);
});

test('lässt unbekannte Angebotswerte und tatsächliche Ausgaben ausdrücklich offen', () => {
  const unknown = model.summarizeBudgetTransparency({
    knownOfferTotalCents: null,
    unresolvedPositionCount: 4,
    actualSpendCents: 9_999,
  });

  assert.equal(unknown.knownOfferTotalCents, null);
  assert.equal(unknown.knownOfferStatus, 'unknown');
  assert.equal(unknown.actualSpendCents, null);
  assert.equal(unknown.actualSpendStatus, 'not-recorded');
});

test('unterscheidet leere und vollständig bekannte Angebotssnapshots vom IST-Status', () => {
  const empty = model.summarizeBudgetTransparency({
    knownOfferTotalCents: null,
    unresolvedPositionCount: 0,
  });
  const known = model.summarizeBudgetTransparency({
    knownOfferTotalCents: 2_499,
    unresolvedPositionCount: 0,
  });

  assert.equal(empty.knownOfferStatus, 'unknown');
  assert.equal(empty.knownOfferTotalCents, null);
  assert.equal(empty.actualSpendCents, null);
  assert.equal(known.knownOfferStatus, 'known-offer-only');
  assert.equal(known.knownOfferTotalCents, 2_499);
  assert.equal(known.actualSpendCents, null);
});

test('hält Budgetmodell und veröffentlichte App synchron', () => {
  assert.equal(publishedModelSource, modelSource);
  assert.equal(published, source);
  assert.match(source, /Monatsbudget · Transparenz/);
  assert.match(source, /Bekannter Plan-\/Angebotswert/);
  assert.match(source, /Tatsächliche IST-Ausgaben/);
  assert.match(source, /Noch nicht erfasst/);
  assert.match(source, /renderBudgetTransparency\(shoppingCostSummary\)/);
  assert.match(source, /budget-transparency\.js/);
});

test('führt keine purchaseRecords- oder Cloud-Schreiblogik für die Anzeige ein', () => {
  assert.ok(rendererStart >= 0 && rendererEnd > rendererStart, 'Budgetrenderer muss vorhanden sein');
  assert.doesNotMatch(renderer, /purchaseRecords|supabase|cloud/i);
  assert.doesNotMatch(modelSource, /remainingCents/);
});

console.log('Budget transparency checks passed');
