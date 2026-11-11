;(function attachPurchaseRecordModel(root) {
  'use strict';

  const MAX_ITEMS = 500;
  const MAX_TEXT = 240;

  function text(value) {
    const result = String(value ?? '').trim();
    return result.length > 0 && result.length <= MAX_TEXT ? result : null;
  }

  function cents(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
  }

  function quantity(value) {
    return Number.isSafeInteger(value) && value > 0 && value <= 100000 ? value : null;
  }

  function normalizeItem(value) {
    if (!value || typeof value !== 'object') return null;
    const name = text(value.name);
    const itemCents = cents(value.totalCents);
    const count = quantity(value.count);
    if (!name || itemCents === null || count === null) return null;
    return Object.freeze({ name, totalCents: itemCents, count });
  }

  function normalizePurchaseRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const id = text(value.id);
    const purchasedAt = text(value.purchasedAt);
    const market = text(value.market);
    const totalCents = cents(value.totalCents);
    const items = Array.isArray(value.items) && value.items.length <= MAX_ITEMS
      ? value.items.map(normalizeItem).filter(Boolean)
      : null;
    if (!id || !purchasedAt || !market || totalCents === null || !items) return null;
    return Object.freeze({ id, purchasedAt, market, totalCents, items, note: text(value.note) });
  }

  root.AngebotskuechePurchaseRecordModel = Object.freeze({
    cents,
    normalizePurchaseRecord,
  });
}(typeof window !== 'undefined' ? window : globalThis));
