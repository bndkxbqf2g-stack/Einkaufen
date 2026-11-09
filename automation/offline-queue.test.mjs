import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const [rootSource, distSource] = await Promise.all([
  readFile(new URL('../offline-queue.js', import.meta.url), 'utf8'),
  readFile(new URL('../dist/offline-queue.js', import.meta.url), 'utf8'),
]);

function loadModel(source = rootSource) {
  const context = {};
  runInNewContext(source, context);
  return context.AngebotskuecheOfflineQueueModel;
}

const model = loadModel();
const plain = value => JSON.parse(JSON.stringify(value));
const operation = id => ({ id, operation: 'save', kind: 'settings', baseRevision: '3', payload: { people: 2, nested: ['unchanged'] } });

test('normalisiert gültige Operationen und bewahrt den Payload-Inhalt', () => {
  const input = operation('op-1');
  const normalized = model.normalizeOperation(input);
  assert.equal(model.validateOperation(input), true);
  assert.deepEqual(plain(normalized), plain(input));
  assert.notEqual(normalized.payload, input.payload);
  for (const invalid of [null, {}, { ...input, id: 'bad id' }, { ...input, operation: '' }, { ...input, baseRevision: '-1' }, { ...input, payload: undefined }, { ...input, payload: NaN }]) {
    assert.equal(model.validateOperation(invalid), false);
  }
});

test('weist nicht JSON-stabile Objekte und löchrige Arrays zurück', () => {
  const invalidPayloads = [
    new Date('2026-01-01T00:00:00.000Z'),
    new Map([['unexpected', 1]]),
    new Set(['unexpected']),
    [, 'sparse'],
    { nested: new Date('2026-01-01T00:00:00.000Z') },
  ];

  for (const payload of invalidPayloads) {
    assert.equal(model.validateOperation({ ...operation('invalid-payload'), payload }), false);
  }
});

test('reiht Operationen FIFO ein und schützt doppelte IDs', () => {
  const first = model.enqueue([], operation('op-1'));
  assert.equal(first.accepted, true);
  const duplicate = model.enqueue(first.queue, operation('op-1'));
  assert.equal(duplicate.accepted, false);
  assert.equal(duplicate.reason, 'duplicate-id');
  const second = model.enqueue(duplicate.queue, operation('op-2'));
  assert.deepEqual(plain(second.queue.map(entry => entry.id)), ['op-1', 'op-2']);
  assert.equal(model.next(second.queue).id, 'op-1');
  assert.equal(model.peek(second.queue).id, 'op-1');
});

test('entfernt bzw. bestätigt nur die angegebene Operation', () => {
  const queue = model.enqueue(model.enqueue([], operation('op-1')).queue, operation('op-2')).queue;
  const removed = model.remove(queue, 'op-1');
  assert.equal(removed.reason, 'removed');
  assert.deepEqual(plain(removed.queue.map(entry => entry.id)), ['op-2']);
  const acked = model.ack(removed.queue, 'op-2');
  assert.equal(acked.reason, 'removed');
  assert.deepEqual(plain(acked.queue), []);
});

test('klassifiziert gleiche, abweichende, fehlende und ungültige Revisionen', () => {
  assert.equal(model.classifySyncAttempt(operation('ready'), '3').status, 'ready');
  assert.equal(model.classifySyncAttempt(operation('conflict'), '4').status, 'conflict');
  assert.equal(model.classifySyncAttempt(operation('unknown'), null).status, 'unknown');
  assert.equal(model.classifySyncAttempt(operation('invalid-remote'), 'not-a-revision').status, 'invalid');
  assert.equal(model.classifySyncAttempt({ ...operation('invalid-op'), payload: undefined }, '3').status, 'invalid');
});

test('verändert keine Queue und keinen Payload bei Ablehnung oder Klassifikation', () => {
  const input = operation('stable');
  const queue = model.enqueue([], input).queue;
  const before = plain(queue);
  model.enqueue(queue, { ...operation('stable'), payload: { changed: true } });
  model.classifySyncAttempt(queue[0], '9');
  assert.deepEqual(plain(queue), before);
  assert.deepEqual(input.payload, { people: 2, nested: ['unchanged'] });
});

test('Root- und dist-Modell bleiben synchron', () => {
  assert.equal(distSource, rootSource);
  assert.ok(loadModel(distSource));
});

console.log('Offline queue model checks passed');

