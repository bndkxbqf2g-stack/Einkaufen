import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const rootSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const publishedSource = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const rootModelSource = await readFile(new URL('../day-planning.js', import.meta.url), 'utf8');
const publishedModelSource = await readFile(new URL('../dist/day-planning.js', import.meta.url), 'utf8');

function loadModel(source) {
  const context = {};
  runInNewContext(source, context);
  return context.AngebotskuecheDayPlanningModel;
}

const model = loadModel(rootModelSource);
const getPlanPeopleMatch = rootSource.match(/function getPlanPeople\(index\) \{[\s\S]*?\n    \}/);
const packCountMatch = rootSource.match(/function shoppingPackCount\(item, people\) \{[\s\S]*?\n    \}/);
assert.ok(getPlanPeopleMatch, 'getPlanPeople muss im App-Bundle vorhanden sein');
assert.ok(packCountMatch, 'shoppingPackCount muss im App-Bundle vorhanden sein');
const shoppingPackCount = new Function(`${packCountMatch[0]}; return shoppingPackCount;`)();

test('Root und dist enthalten dasselbe additive Tagesplanungsmodul', () => {
  assert.equal(publishedSource, rootSource);
  assert.equal(publishedModelSource, rootModelSource);
  assert.match(rootSource, /<script src="\.\/day-planning\.js"><\/script>/);
  assert.match(publishedSource, /<script src="\.\/day-planning\.js"><\/script>/);
});

test('Tagespersonenzahl nutzt nur gültige Werte und globalen Legacy-Default', () => {
  assert.deepEqual(Array.from(model.peopleOptions), [2, 3, 4]);
  assert.equal(model.normalizePeople('4', 2), 4);
  assert.equal(model.normalizePeople('ungültig', 3), 3);
  assert.equal(model.normalizePeople('ungültig', 9), 2);
  assert.deepEqual(JSON.parse(JSON.stringify(model.normalizeDayPeople({ 0: '4', '01': 3, x: 4, 2: 5, 3: null }))), {
    0: 4,
    1: 3,
  });
  assert.equal(model.resolveDayPeople({}, 0, 4), 4);
  assert.equal(model.resolveDayPeople({ 1: 4 }, 0, 2), 2);
  assert.equal(model.resolveDayPeople({ 1: 4 }, 1, 2), 4);
});

test('normalisiert benannte Tages-Teilnehmer stabil und verwirft unbekannte oder doppelte IDs', () => {
  assert.deepEqual(Array.from(model.participantIds), ['martin', 'steffi', 'children']);
  assert.equal(model.normalizeParticipantId(' Kinder '), 'children');
  assert.equal(model.normalizeParticipantId('unbekannt'), null);
  assert.deepEqual(JSON.parse(JSON.stringify(model.normalizeParticipants([
    'Steffi', 'Martin', 'Kinder', 'children', 'unbekannt', '', null,
  ]))), ['martin', 'steffi', 'children']);
  assert.deepEqual(JSON.parse(JSON.stringify(model.normalizeDayParticipants({
    0: ['Martin', 'Steffi'],
    '01': ['Martin', 'Kinder', 'Kinder'],
    2: ['unbekannt'],
    x: ['Steffi'],
  }))), {
    0: ['martin', 'steffi'],
    1: ['martin', 'children'],
  });
  assert.deepEqual(JSON.parse(JSON.stringify(model.resolveDayParticipants({ 1: ['Martin', 'Kinder'] }, 0, ['Steffi']))), ['steffi']);
  assert.deepEqual(JSON.parse(JSON.stringify(model.resolveDayParticipants({ 1: ['Martin', 'Kinder'] }, 1, ['Steffi']))), ['martin', 'children']);
});

test('leitet Personenzahlen nur mit expliziter Kinderanzahl ab und nutzt sonst den Legacy-Fallback', () => {
  assert.equal(model.peopleForParticipants(['Martin', 'Steffi'], undefined, 4), 2);
  assert.equal(model.peopleForParticipants(['Martin', 'Steffi', 'Kinder'], 1, 2), 3);
  assert.equal(model.peopleForParticipants(['Martin', 'Steffi', 'Kinder'], 2, 2), 4);
  assert.equal(model.peopleForParticipants(['Martin', 'Steffi', 'Kinder'], undefined, 3), 3);
  assert.equal(model.peopleForParticipants(['unbekannt'], 2, 4), 4);
  assert.equal(model.peopleForParticipants([], 2, 3), 3);
});

test('Planmodell berechnet deterministische Portionsanteile für gemischte Tage', () => {
  assert.equal(model.portionUnitsForPeople(2), 1);
  assert.equal(model.portionUnitsForPeople(3), 1.5);
  assert.equal(model.portionUnitsForPeople(4), 2);

  const mixedDays = [2, 4, 3, 2];
  const portionUnits = mixedDays.reduce((sum, people) => sum + model.portionUnitsForPeople(people), 0);
  assert.equal(Math.ceil(portionUnits), 6);
  assert.equal(shoppingPackCount({ count: mixedDays.length, portionUnits }, 2), 6);
  assert.equal(shoppingPackCount({ count: mixedDays.length }, 3), 6, 'Legacy-Aufrufer verwenden weiterhin people / 2');
});

test('Plan und Einkaufsliste verwenden denselben Tageswert für Mittag und Abendessen', () => {
  assert.match(rootSource, /data-day-people="\$\{index\}"/);
  assert.match(rootSource, /renderDinnerCard\(dinner, index, getPlanPeople\(index\)\)/);
  assert.match(rootSource, /const planSections = typeof getCurrentPlanSections === 'function'/);
  assert.match(rootSource, /planSections\.lunches/);
  assert.match(rootSource, /planSections\.dinners/);
  assert.match(rootSource, /portionUnitsForPeople\(people\)/);
  assert.match(rootSource, /const packCount = shoppingPackCount\(item, people\);/);
  assert.match(rootSource, /function planPeopleSummary\(\)/);
});

test('getPlanPeople liefert Override pro Tag und fällt auf globalen peopleSelect-Wert zurück', () => {
  const controls = {
    '#peopleSelect': { value: '2' },
  };
  const getPlanPeople = new Function(
    'window',
    '$',
    'settings',
    `${getPlanPeopleMatch[0]}; return getPlanPeople;`,
  )(
    { AngebotskuecheDayPlanningModel: model },
    selector => controls[selector],
    { people: 2, dayPeople: { 1: 4 } },
  );

  assert.equal(getPlanPeople(0), 2);
  assert.equal(getPlanPeople(1), 4);
  controls['#peopleSelect'].value = '3';
  assert.equal(getPlanPeople(0), 3);
  assert.equal(getPlanPeople(1), 4);
});
