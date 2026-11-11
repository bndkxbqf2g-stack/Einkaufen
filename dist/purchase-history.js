;(function attachPurchaseHistory(root) {
  'use strict';

  const store = root.AngebotskuechePurchaseRecordStore;

  function formatEuro(cents) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  }

  function monthLabel(monthKey) {
    if (!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(String(monthKey || ''))) return 'Ungültiger Monat';
    const [year, month] = monthKey.split('-').map(Number);
    return new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
  }

  function currentMonth(records, now = new Date()) {
    const month = now.toISOString().slice(0, 7);
    return store?.summarizeMonth?.(records, month) || { month, recordCount: 0, actualSpendCents: 0 };
  }

  function mount(documentRef = root.document) {
    if (!documentRef || !store || documentRef.getElementById('purchaseHistoryPanel')) return false;
    const shoppingPage = documentRef.getElementById('page-shopping');
    const anchor = shoppingPage?.querySelector('.budget-transparency');
    if (!anchor) return false;
    const records = store.load();
    const summary = currentMonth(records);
    const panel = documentRef.createElement('section');
    panel.className = 'panel';
    panel.id = 'purchaseHistoryPanel';
    panel.style.marginTop = '18px';
    const header = documentRef.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = '<div><h2 class="panel-title">Einkaufshistorie</h2><p class="panel-subtitle">Bestätigte Kassenbeträge dieses Geräts · keine Planwerte</p></div><span class="tag muted">lokal</span>';
    panel.append(header);
    const body = documentRef.createElement('div');
    body.className = 'panel-body';
    const current = documentRef.createElement('div');
    current.className = 'source-note';
    current.textContent = summary.recordCount
      ? `${monthLabel(summary.month)}: ${formatEuro(summary.actualSpendCents)} aus ${summary.recordCount} bestätigten Einkäufen`
      : `${monthLabel(summary.month)}: noch kein bestätigter Einkauf`;
    body.append(current);
    const list = documentRef.createElement('div');
    list.className = 'purchase-history-list';
    for (const record of records.slice().reverse().slice(0, 20)) {
      const row = documentRef.createElement('div');
      row.className = 'purchase-history-row';
      const date = new Date(record.purchasedAt);
      row.textContent = `${Number.isNaN(date.getTime()) ? record.purchasedAt : date.toLocaleString('de-DE')} · ${record.market} · ${formatEuro(record.totalCents)}${record.note ? ` · ${record.note}` : ''}`;
      list.append(row);
    }
    if (!records.length) {
      const empty = documentRef.createElement('div');
      empty.className = 'source-note';
      empty.textContent = 'Noch keine bestätigten Einkäufe gespeichert.';
      list.append(empty);
    }
    body.append(list);
    panel.append(body);
    anchor.after(panel);
    return true;
  }

  root.AngebotskuechePurchaseHistory = Object.freeze({ formatEuro, monthLabel, currentMonth, mount });
}(typeof window !== 'undefined' ? window : globalThis));
