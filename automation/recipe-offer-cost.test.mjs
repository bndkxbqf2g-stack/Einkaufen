import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [rootHtml, distHtml, costSource] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../shopping-costs.js', import.meta.url), 'utf8'),
]);

assert.equal(distHtml, rootHtml, 'Root- und dist-Bundle müssen synchron sein');

const browserGlobal = {};
runInNewContext(costSource, browserGlobal);
const costModel = browserGlobal.AngebotskuecheCostModel;
const match = distHtml.match(/function estimateMatchCost\([^)]*\) \{[\s\S]*?\n    \}/);
assert.ok(match, 'estimateMatchCost muss im App-Bundle vorhanden sein');

const parseKnownMoney = value => {
  const found = String(value || '').match(/^(\d+),(\d{2}) €$/);
  return found ? Number(found[1]) + Number(`0.${found[2]}`) : null;
};
const formatEuro = value => `${Number(value).toFixed(2).replace('.', ',')} €`;
const estimateMatchCost = new Function(
  'calculateOfferAmount',
  'parseKnownMoney',
  'isShoppingOfferCostUsable',
  'formatEuro',
  `${match[0]}
return estimateMatchCost;`,
)(
  costModel.calculateOfferAmount,
  parseKnownMoney,
  offer => offer?.verified === true,
  formatEuro,
);

test('berechnet Rezeptkosten nur aus verifizierten Angebotspreisen', () => {
  const result = estimateMatchCost([
    { price: '1,20 €', verified: true },
    { price: '0,89 €', verified: true },
  ]);

  assert.equal(result, '2,09 €');
});

test('lässt Rezeptkosten bei unbekannter oder nicht verifizierter Basis offen', () => {
  const result = estimateMatchCost([
    { price: '1,20 €', verified: true },
    { price: '0,89 €', verified: false },
  ]);

  assert.equal(result, 'Preis unbekannt');
});

const suggestionAsMeal = distHtml.match(/function suggestionAsMeal\([^)]*\) \{[\s\S]*?\n    \}/);
assert.ok(suggestionAsMeal, 'suggestionAsMeal muss im App-Bundle vorhanden sein');
const fallbackMeal = distHtml.match(/function sanitizeFallbackMeal\([^)]*\) \{[\s\S]*?\n    \}/);
assert.ok(fallbackMeal, 'sanitizeFallbackMeal muss im App-Bundle vorhanden sein');
const renderPlan = distHtml.match(/function renderPlan\([^)]*\) \{[\s\S]*?\n    \}/);
assert.ok(renderPlan, 'renderPlan muss im App-Bundle vorhanden sein');

test('verwendet keine statischen Planvorlagenkosten als Preisersatz', () => {
  assert.match(
    suggestionAsMeal[0],
    /cost, costSource: cost \? 'offer-subtotal' : 'unknown'/,
    'echte Vorschläge müssen den berechneten Angebotsanteil und seine Herkunft setzen',
  );
  assert.match(
    fallbackMeal[0],
    /cost: '', costSource: 'unknown'/,
    'Fallback-Gerichte müssen statische Vorlagekosten neutralisieren',
  );
  assert.match(
    renderPlan[0],
    /meal\.costSource === 'offer-subtotal' && parseKnownMoney\(meal\.cost\) !== null/,
    'die Plananzeige darf nur verifizierte Angebotsanteile als Kosten ausgeben',
  );
});
const savingLabel = distHtml.match(/function shoppingOfferSavingLabel\([^)]*\) \{[\s\S]*?\n    \}/);
assert.ok(savingLabel, 'shoppingOfferSavingLabel muss im App-Bundle vorhanden sein');

test('zeigt Angebotsnachlässe nur als Quellenhinweis und berechnet sie nicht', () => {
  assert.match(
    savingLabel[0],
    /evidence\.manual[\s\S]*evidence\.cacheFallback[\s\S]*!evidence\.sourceKnown[\s\S]*!evidence\.validityKnown/,
    'manuelle, unbestätigte oder veraltete Nachlässe müssen neutral bleiben',
  );
  assert.match(
    savingLabel[0],
    /Vergleichspreis nicht belegt/,
    'ohne belastbare Vergleichsbasis darf kein Nachlass behauptet werden',
  );
  assert.match(
    savingLabel[0],
    /Quellenhinweis des Angebots: \$\{saving\} · nicht berechnet/,
    'ein belegter Nachlass darf nur als unveränderte Quellenangabe erscheinen',
  );
});
