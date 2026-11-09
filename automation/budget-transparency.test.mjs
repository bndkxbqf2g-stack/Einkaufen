import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [modelSource, publishedModelSource, source, published, syncSource] = await Promise.all([
  readFile(new URL('../budget-transparency.js', import.meta.url), 'utf8'),
  readFile(new URL('../dist/budget-transparency.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../supabase-sync.js', import.meta.url), 'utf8'),
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
  });

  assert.deepEqual({ ...partial }, {
    monthlyTargetCents: 40_000,
    knownOfferTotalCents: 1_234,
    knownOfferStatus: 'partial',
    unresolvedPositionCount: 2,
    actualSpendCents: null,
    actualSpendStatus: 'not-recorded',
    plannedExpenseCents: null,
    plannedExpenseStatus: 'not-recorded',
    remainingAfterPlannedCents: null,
    remainingBudgetCents: null,
    travelCostCents: null,
    travelCostStatus: 'not-recorded',
    confirmedOutlayWithTravelCents: null,
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
  assert.equal(unknown.actualSpendCents, 9_999);
  assert.equal(unknown.actualSpendStatus, 'confirmed');
  assert.equal(unknown.remainingBudgetCents, 30_001);
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

test('berechnet bestätigte Ausgaben, Planrest und Fahrtkosten getrennt in Cent', () => {
  const summary = model.summarizeBudgetTransparency({
    knownOfferTotalCents: 12_34,
    unresolvedPositionCount: 1,
    plannedExpenseCents: 16_789,
    actualSpendCents: 12_345,
    travelCostCents: 1_234,
  });

  assert.equal(summary.plannedExpenseCents, 16_789);
  assert.equal(summary.plannedExpenseStatus, 'provided');
  assert.equal(summary.remainingAfterPlannedCents, 23_211);
  assert.equal(summary.actualSpendCents, 12_345);
  assert.equal(summary.actualSpendStatus, 'confirmed');
  assert.equal(summary.remainingBudgetCents, 27_655);
  assert.equal(summary.travelCostCents, 1_234);
  assert.equal(summary.travelCostStatus, 'separate');
  assert.equal(summary.confirmedOutlayWithTravelCents, 13_579);
  assert.equal(summary.knownOfferTotalCents, 1_234);
});

test('lässt eine unsichere IST-/Fahrtkosten-Gesamtsumme offen', () => {
  const summary = model.summarizeBudgetTransparency({
    actualSpendCents: Number.MAX_SAFE_INTEGER,
    travelCostCents: 1,
  });

  assert.equal(summary.actualSpendCents, Number.MAX_SAFE_INTEGER);
  assert.equal(summary.travelCostCents, 1);
  assert.equal(summary.confirmedOutlayWithTravelCents, null);
});

test('hält 440 Euro ohne ausdrückliche Alternative bei 400 Euro und verwirft ungültige Werte', () => {
  const standard = model.summarizeBudgetTransparency({
    monthlyTargetCents: 44_000,
    actualSpendCents: -1,
    travelCostCents: Number.MAX_SAFE_INTEGER + 1,
  });
  assert.equal(standard.monthlyTargetCents, 40_000);
  assert.equal(standard.actualSpendCents, null);
  assert.equal(standard.travelCostCents, null);

  const alternative = model.summarizeBudgetTransparency({
    monthlyTargetCents: 44_000,
    allowAlternativeTarget: true,
  });
  assert.equal(alternative.monthlyTargetCents, 44_000);
  assert.equal(model.normalizeMonthlyTargetCents(44_000, false), 40_000);
  assert.equal(model.normalizeMonthlyTargetCents(44_000, true), 44_000);
});

test('hält Budgetmodell und veröffentlichte App synchron', () => {
  assert.equal(publishedModelSource, modelSource);
  assert.equal(published, source);
  assert.match(source, /Monatsbudget · Transparenz/);
  assert.match(source, /Bekannter Plan-\/Angebotswert/);
  assert.match(source, /Tatsächliche IST-Ausgaben/);
  assert.match(source, /Noch nicht erfasst/);
  assert.match(source, /renderBudgetTransparency\(shoppingCostSummary\)/);
  assert.match(source, /shoppingBudgetTransparencyTitle/);
  assert.match(source, /renderBudgetTransparency\(costSummary, 'shoppingBudget'\)/);
  assert.match(source, /function renderBudgetTransparency\(costSummary, prefix = 'budget'\)/);
  assert.match(source, /budget-transparency\.js/);
});

test('führt keine purchaseRecords- oder Cloud-Schreiblogik für die Anzeige ein', () => {
  assert.ok(rendererStart >= 0 && rendererEnd > rendererStart, 'Budgetrenderer muss vorhanden sein');
  assert.doesNotMatch(renderer, /purchaseRecords|supabase|cloud/i);
});

test('hält purchaseRecords-Schreibpfade bis zur Freigabe außerhalb der Runtime', () => {
  assert.doesNotMatch(source, /purchaseRecords\s*:/i);
  assert.doesNotMatch(source, /localStorage\.setItem\([^)]*purchaseRecords/i);
  assert.doesNotMatch(syncSource, /purchaseRecords\s*:/i);
  assert.doesNotMatch(syncSource, /localStorage\.setItem\([^)]*purchaseRecords/i);
});

console.log('Budget transparency checks passed');


