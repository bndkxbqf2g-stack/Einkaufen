;(function attachPurchaseEntry(root) {
  'use strict';

  const model = root.AngebotskuechePurchaseRecordModel;
  const store = root.AngebotskuechePurchaseRecordStore;
  const ENTRY_EVENT = 'angebotskueche:purchase-record-added';

  function parseEuroToCents(value) {
    const normalized = String(value ?? '').trim().replace(/\s/g, '').replace(/€/g, '').replace(/\./g, '').replace(',', '.');
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
    const cents = Math.round(Number(normalized) * 100);
    return Number.isSafeInteger(cents) && cents >= 0 ? cents : null;
  }

  function buildRecord({ id, purchasedAt, market, totalCents, note = null }) {
    return model?.normalizePurchaseRecord({
      id, purchasedAt, market, totalCents, items: [], note,
    }) || null;
  }

  function nextId() {
    return `purchase-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function mount(documentRef = root.document) {
    if (!documentRef || !store || !model || documentRef.getElementById('recordPurchase')) return false;
    const actions = documentRef.querySelector('.shopping-actions');
    if (!actions) return false;
    const button = documentRef.createElement('button');
    button.className = 'primary-button';
    button.id = 'recordPurchase';
    button.type = 'button';
    button.textContent = '✓ Einkauf erfassen';
    actions.insertBefore(button, actions.firstChild);

    const modal = documentRef.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'purchaseEntryModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `<div class="modal"><div class="modal-header"><div><h2 id="purchaseEntryTitle">Tatsächlichen Einkauf erfassen</h2><p>Nur der bestätigte Kassenbetrag wird lokal gespeichert. Vorräte und Cloud-Daten bleiben unverändert.</p></div><button class="close" type="button" data-purchase-cancel aria-label="Schließen">×</button></div><label class="source-note" for="purchaseTotal">Kassenbetrag in Euro</label><input class="input" id="purchaseTotal" inputmode="decimal" placeholder="z. B. 42,87" autocomplete="off"><label class="source-note" for="purchaseMarket" style="display:block;margin-top:10px">Markt</label><input class="input" id="purchaseMarket" maxlength="80" placeholder="z. B. EDEKA" autocomplete="organization"><label class="source-note" for="purchaseNote" style="display:block;margin-top:10px">Notiz (optional)</label><input class="input" id="purchaseNote" maxlength="240" placeholder="z. B. Kassenbon geprüft" autocomplete="off"><div class="source-note" id="purchaseEntryStatus" role="status" aria-live="polite" style="margin-top:10px;min-height:16px"></div><div class="modal-actions"><button class="outline-button" type="button" data-purchase-cancel>Abbrechen</button><button class="primary-button" type="button" id="savePurchaseRecord">Einkauf speichern</button></div></div>`;
    documentRef.body.append(modal);

    const close = () => modal.classList.remove('open');
    const status = message => { documentRef.getElementById('purchaseEntryStatus').textContent = message; };
    button.addEventListener('click', () => {
      documentRef.getElementById('purchaseTotal').value = '';
      documentRef.getElementById('purchaseMarket').value = '';
      documentRef.getElementById('purchaseNote').value = '';
      status('');
      modal.classList.add('open');
      documentRef.getElementById('purchaseTotal').focus();
    });
    modal.querySelectorAll('[data-purchase-cancel]').forEach(control => control.addEventListener('click', close));
    documentRef.getElementById('savePurchaseRecord').addEventListener('click', () => {
      const totalCents = parseEuroToCents(documentRef.getElementById('purchaseTotal').value);
      const market = documentRef.getElementById('purchaseMarket').value.trim();
      if (totalCents === null || totalCents <= 0) return status('Bitte einen gültigen Kassenbetrag größer als 0,00 € eingeben.');
      if (!market) return status('Bitte den Markt angeben.');
      const record = buildRecord({ id: nextId(), purchasedAt: new Date().toISOString(), market, totalCents, note: documentRef.getElementById('purchaseNote').value });
      if (!record || !store.append(record)) return status('Der Einkauf konnte nicht sicher gespeichert werden.');
      modal.classList.remove('open');
      documentRef.dispatchEvent(new CustomEvent(ENTRY_EVENT, { detail: record }));
    });
    return true;
  }

  root.AngebotskuechePurchaseEntry = Object.freeze({ ENTRY_EVENT, parseEuroToCents, buildRecord, mount });
}(typeof window !== 'undefined' ? window : globalThis));
