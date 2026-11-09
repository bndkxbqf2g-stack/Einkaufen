;(function attachOfflineQueueModel(root) {
  'use strict';

  const TOKEN_PATTERN = /^[A-Za-z][A-Za-z0-9._:-]{0,63}$/;
  const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
  const REVISION_PATTERN = /^(0|[1-9]\d{0,18})$/;

  function normalizeToken(value) {
    return typeof value === 'string' && TOKEN_PATTERN.test(value) ? value : null;
  }

  function normalizeId(value) {
    return typeof value === 'string' && ID_PATTERN.test(value) ? value : null;
  }

  function normalizeRevision(value) {
    if (typeof value === 'number') {
      if (!Number.isSafeInteger(value) || value < 0) return null;
      value = String(value);
    }
    return typeof value === 'string' && REVISION_PATTERN.test(value) ? value : null;
  }

  function isJsonValue(value, seen = new Set()) {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value !== 'object' || seen.has(value)) return false;
    if (!Array.isArray(value) && Object.prototype.toString.call(value) !== '[object Object]') return false;
    seen.add(value);
    let valid = true;
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.prototype.hasOwnProperty.call(value, index) || !isJsonValue(value[index], seen)) {
          valid = false;
          break;
        }
      }
    } else {
      valid = Object.keys(value).every(key => isJsonValue(value[key], seen));
    }
    seen.delete(value);
    return valid;
  }

  function clonePayload(value) {
    if (value === null || typeof value !== 'object') return value;
    return Array.isArray(value)
      ? value.map(clonePayload)
      : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clonePayload(item)]));
  }

  function normalizeOperation(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || !isJsonValue(value.payload)) return null;
    const id = normalizeId(value.id);
    const operation = normalizeToken(value.operation);
    const kind = normalizeToken(value.kind);
    const baseRevision = normalizeRevision(value.baseRevision);
    if (!id || !operation || !kind || baseRevision === null) return null;
    return { id, operation, kind, baseRevision, payload: clonePayload(value.payload) };
  }

  function validateOperation(value) {
    return normalizeOperation(value) !== null;
  }

  function normalizeQueue(value) {
    if (!Array.isArray(value)) return null;
    const queue = value.map(normalizeOperation);
    if (queue.some(operation => !operation)) return null;
    const ids = new Set();
    for (const operation of queue) {
      if (ids.has(operation.id)) return null;
      ids.add(operation.id);
    }
    return queue;
  }

  function enqueue(queue, value) {
    const current = normalizeQueue(queue);
    if (!current) return { accepted: false, reason: 'invalid-queue', queue: null };
    const operation = normalizeOperation(value);
    if (!operation) return { accepted: false, reason: 'invalid-operation', queue: current };
    if (current.some(entry => entry.id === operation.id)) return { accepted: false, reason: 'duplicate-id', queue: current };
    return { accepted: true, reason: 'enqueued', queue: [...current, operation] };
  }

  function peek(queue) {
    const normalized = normalizeQueue(queue);
    return normalized?.[0] || null;
  }

  function next(queue) {
    return peek(queue);
  }

  function remove(queue, id) {
    const normalized = normalizeQueue(queue);
    const normalizedId = normalizeId(id);
    if (!normalized || !normalizedId) return { removed: null, queue: null, reason: 'invalid' };
    const removed = normalized.find(operation => operation.id === normalizedId) || null;
    return {
      removed,
      queue: removed ? normalized.filter(operation => operation.id !== normalizedId) : normalized,
      reason: removed ? 'removed' : 'not-found',
    };
  }

  function ack(queue, id) {
    return remove(queue, id);
  }

  function classifySyncAttempt(operation, remoteRevision) {
    const normalized = normalizeOperation(operation);
    if (!normalized) return { status: 'invalid', operation: null, remoteRevision: null };
    if (remoteRevision === undefined || remoteRevision === null || remoteRevision === '') {
      return { status: 'unknown', operation: normalized, remoteRevision: null };
    }
    const normalizedRemote = normalizeRevision(remoteRevision);
    if (normalizedRemote === null) return { status: 'invalid', operation: normalized, remoteRevision: null };
    return {
      status: normalized.baseRevision === normalizedRemote ? 'ready' : 'conflict',
      operation: normalized,
      remoteRevision: normalizedRemote,
    };
  }

  root.AngebotskuecheOfflineQueueModel = Object.freeze({
    normalizeOperation,
    validateOperation,
    normalizeQueue,
    enqueue,
    next,
    peek,
    remove,
    ack,
    classifySyncAttempt,
  });
}(typeof window !== 'undefined' ? window : globalThis));

