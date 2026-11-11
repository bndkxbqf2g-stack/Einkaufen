;(function attachPurchaseRecordStore(root) {
  'use strict';

  const STORAGE_KEY = 'angebotskueche.purchaseRecords';
  const MAX_RECORDS = 500;
  const recordModel = root.AngebotskuechePurchaseRecordModel;

  function storage(source) {
    return source && typeof source.getItem === 'function' && typeof source.setItem === 'function' ? source : null;
  }

  function load(source = root.localStorage) {
    const target = storage(source);
    if (!target || !recordModel) return [];
    try {
      const raw = JSON.parse(target.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw.map(recordModel.normalizePurchaseRecord).filter(Boolean).slice(-MAX_RECORDS);
    } catch {
      return [];
    }
  }

  function save(records, source = root.localStorage) {
    const target = storage(source);
    if (!target || !recordModel || !Array.isArray(records)) return false;
    const normalized = records.map(recordModel.normalizePurchaseRecord);
    if (normalized.some(record => !record) || normalized.length > MAX_RECORDS) return false;
    target.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return true;
  }

  function append(record, source = root.localStorage) {
    const records = load(source);
    const normalized = recordModel?.normalizePurchaseRecord(record);
    return normalized && save([...records, normalized], source) ? normalized : null;
  }

  root.AngebotskuechePurchaseRecordStore = Object.freeze({ STORAGE_KEY, load, save, append });
}(typeof window !== 'undefined' ? window : globalThis));
