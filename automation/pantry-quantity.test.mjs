import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [normalization, ingredientQuantity, rootModule, distModule, rootHtml, distHtml, workerSource, syncSource] = await Promise.all([
  readFile(new URL('../ingredient-normalization.js', import.meta.url), 'utf8'),
  readFile(new URL('../ingredient-quantity.js', import.meta.url), 'utf8'),
  readFile(new URL('../pantry-quantity.js', import.meta.url), 'utf8'),
  readFile(new URL('../dist/pantry-quantity.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../worker/index.js', import.meta.url), 'utf8'),
  readFile(new URL('../supabase-sync.js', import.meta.url), 'utf8'),
]);

assert.equal(distModule, rootModule, 'Root- und dist-Vorratsmengenmodul müssen synchron sein');
assert.equal(distHtml, rootHtml, 'Root- und dist-App müssen synchron sein');
assert.match(rootHtml, /<script src="\.\/pantry-quantity\.js"><\/script>/);

const modelWindow = {};
runInNewContext(normalization, modelWindow);
runInNewContext(ingredientQuantity, modelWindow);
runInNewContext(rootModule, modelWindow);
const quantityModel = modelWindow.AngebotskuechePantryQuantityModel;
assert.ok(quantityModel, 'Vorratsmengenmodell muss global verfügbar sein');
const plain = value => JSON.parse(JSON.stringify(value));

test('akzeptiert nur positive Mengen in den gemeinsamen unterstützten Einheiten', () => {
  assert.deepEqual(plain(quantityModel.normalizeQuantity('1,5', 'l')), { family: 'volume', unit: 'ml', amount: 1500 });
  assert.deepEqual(plain(quantityModel.normalizeQuantity('500', 'g')), { family: 'mass', unit: 'g', amount: 500 });
  assert.deepEqual(plain(quantityModel.normalizeQuantity('2', 'piece')), { family: 'count', unit: 'piece', amount: 2 });
  assert.equal(quantityModel.formatQuantity({ name: 'Milch', amount: 1500, unit: 'ml' }), '1,5 l');
  assert.equal(quantityModel.formatQuantity({ name: 'Eier', amount: 2, unit: 'piece' }), '2 Stück');
  for (const [quantity, unit] of [['0', 'g'], ['-1', 'kg'], ['wenig', 'g'], ['1', 'Bund'], ['1', '']]) {
    assert.equal(quantityModel.normalizeQuantity(quantity, unit), null, `${quantity} ${unit} muss unbekannt bleiben`);
  }
});

test('führt Mengen additiv neben der unveränderten Legacy-Vorratsliste', () => {
  const pantry = ['Milch', 'Salz'];
  let quantities = quantityModel.setQuantity({}, 'Milch', '1,5', 'l');
  quantities = quantityModel.setQuantity(quantities, 'Eier', '10', 'piece');
  assert.deepEqual(pantry, ['Milch', 'Salz'], 'Legacy-Strings werden nicht durch Objekte ersetzt');
  assert.deepEqual(Object.keys(quantities).sort(), ['eier', 'milch']);
  assert.deepEqual(plain(quantityModel.getQuantity(quantities, 'Milch')), { name: 'Milch', amount: 1500, unit: 'ml' });
  assert.deepEqual(plain(quantityModel.retainForPantry(quantities, pantry)), { milch: { name: 'Milch', amount: 1500, unit: 'ml' } });
  assert.deepEqual(plain(quantityModel.removeQuantity(quantities, 'Milch')), { eier: { name: 'Eier', amount: 10, unit: 'piece' } });
});

test('verwirft beschädigte oder unbekannte Zusätze und erfindet keine Teilmengen', () => {
  const normalized = quantityModel.normalizeDetails({
    milch: { name: 'Milch', quantity: '1', unit: 'l' },
    badNegative: { name: 'Salz', amount: -1, unit: 'kg' },
    badZero: { name: 'Öl', amount: 0, unit: 'ml' },
    badUnit: { name: 'Mehl', amount: 1, unit: 'Bund' },
    unclear: { name: 'Reis', amount: 'wenig', unit: 'kg' },
  });
  assert.deepEqual(plain(normalized), { milch: { name: 'Milch', amount: 1000, unit: 'ml' } });
  assert.equal(quantityModel.getQuantity(normalized, 'Salz'), null);
  assert.equal(quantityModel.getQuantity(normalized, 'Milch').amount, 1000);
});

test('hält Backups und Cloud-Payloads absichtlich auf der alten String-Grenze', () => {
  assert.match(rootHtml, /const backupArrayKeys = \['pantry'/);
  assert.doesNotMatch(rootHtml.match(/function buildUserDataPayload\(\) \{[\s\S]*?\n    \}/)?.[0] || '', /pantryQuantities/);
  assert.doesNotMatch(workerSource, /pantryQuantities/);
  assert.doesNotMatch(syncSource, /pantryQuantities/);
  assert.match(rootHtml, /let pantry = stored\('angebotskueche\.pantry'/);
  assert.match(rootHtml, /localStorage\.setItem\('angebotskueche\.pantry', JSON\.stringify\(pantry\)\)/);
});

console.log('Pantry quantity boundary checks passed');
