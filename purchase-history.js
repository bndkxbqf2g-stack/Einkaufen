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
    const months = [...new Set([new Date().toISOString().slice(0, 7), ...records.map(record => record.purchasedAt.slice(0, 7))])]
      .filter(month => /^\\d{4}-(?:0[1-9]|1[0-2])$/.test(month))
      .sort((first, second) => second.localeCompare(first));
    let selectedMonth = months[0];
    const summary = currentMonth(records);
    const panel = documentRef.createElement('section');
    panel.className = 'panel';
    panel.id = 'purchaseHistoryPanel';
    panel.style.marginTop = '18px';
    const header = documentRef.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = '<div><h2 class="panel-title">Einkaufshistorie</h2><p class="panel-subtitle">Bestätigte Kassenbeträge dieses Geräts · keine Planwerte</p></div><span class="tag muted">lokal</span>';
    const monthSelect = documentRef.createElement('select');
    monthSelect.className = 'input';
    monthSelect.id = 'purchaseHistoryMonth';
    monthSelect.setAttribute('aria-label', 'Monat der Einkaufshistorie');
    for (const month of months) { const option = documentRef.createElement('option'); option.value = month; option.textContent = monthLabel(month); monthSelect.append(option); }
    header.append(monthSelect);
    panel.append(header);
    const body = documentRef.createElement('div');
    body.className = 'panel-body';
    const current = documentRef.createElement('div');
    current.className = 'source-note';
    const list = documentRef.createElement('div');
    list.className = 'purchase-history-list';
    const renderMonth = month => {
      selectedMonth = month;
      const monthSummary = store.summarizeMonth(records, month);
      current.textContent = monthSummary.recordCount
        ? `${monthLabel(month)}: ${formatEuro(monthSummary.actualSpendCents)} aus ${monthSummary.recordCount} bestätigten Einkäufen`
        : `${monthLabel(month)}: noch kein bestätigter Einkauf`;
      list.replaceChildren();
      for (const record of records.filter(item => item.purchasedAt.slice(0, 7) === month).slice().reverse().slice(0, 20)) {
      const row = documentRef.createElement('div');
      row.className = 'purchase-history-row';
      const date = new Date(record.purchasedAt);
      row.textContent = `${Number.isNaN(date.getTime()) ? record.purchasedAt : date.toLocaleString('de-DE')} · ${record.market} · ${formatEuro(record.totalCents)}${record.note ? ` · ${record.note}` : ''}`;
        list.append(row);
      }
      if (!monthSummary.recordCount) {
      const empty = documentRef.createElement('div');
      empty.className = 'source-note';
      empty.textContent = 'Noch keine bestätigten Einkäufe gespeichert.';
        list.append(empty);
      }
    };
    monthSelect.addEventListener('change', () => renderMonth(monthSelect.value));
    body.append(current);
    body.append(list);
    renderMonth(selectedMonth);
    panel.append(body);
    anchor.after(panel);
    return true;
  }

  root.AngebotskuechePurchaseHistory = Object.freeze({ formatEuro, monthLabel, currentMonth, mount });
}(typeof window !== 'undefined' ? window : globalThis));
