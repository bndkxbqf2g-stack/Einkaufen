const UNIT_ALIASES = new Map([
  ['g', { base: 'g', factor: 1 }], ['kg', { base: 'g', factor: 1000 }],
  ['ml', { base: 'ml', factor: 1 }], ['l', { base: 'ml', factor: 1000 }],
  ['stück', { base: 'piece', factor: 1 }], ['st', { base: 'piece', factor: 1 }],
  ['stk', { base: 'piece', factor: 1 }], ['stück(e)', { base: 'piece', factor: 1 }]
]);

export function normalizeIngredientName(value) {
  return String(value ?? '').trim().toLocaleLowerCase('de-DE')
    .replace(/\s+/g, ' ').replace(/[,:;]+$/g, '');
}

export function parseIngredient(value) {
  const raw = String(value ?? '').trim();
  const match = raw.match(/^(?:(\d+(?:[.,]\d+)?)\s*)?(kg|g|ml|l|stück\(e\)|stück|stk|st)\b\s*(.*)$/i);
  if (!match) return { name: normalizeIngredientName(raw), quantity: null, unit: null, raw };
  const unit = UNIT_ALIASES.get(match[2].toLocaleLowerCase('de-DE'));
  return { name: normalizeIngredientName(match[3]), quantity: match[1] ? Number(match[1].replace(',', '.')) * unit.factor : null, unit: unit.base, raw };
}

function asQuantity(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
  const number = String(value ?? '').replace(',', '.');
  return /^\d+(?:\.\d+)?$/.test(number) ? Number(number) : null;
}

export function calculateShoppingQuantities({ ingredients = [], people = 1, pantry = [], packSizes = {} } = {}) {
  const factor = Math.max(1, asQuantity(people) ?? 1);
  const totals = new Map();
  for (const ingredient of ingredients) {
    const parsed = parseIngredient(ingredient);
    if (!parsed.name) continue;
    const entry = totals.get(parsed.name) ?? { name: parsed.name, quantity: null, unit: null, unknown: false };
    if (parsed.quantity == null || (entry.unit && entry.unit !== parsed.unit)) entry.unknown = true;
    else { entry.quantity = (entry.quantity ?? 0) + parsed.quantity * factor; entry.unit = parsed.unit; }
    totals.set(parsed.name, entry);
  }
  const stock = new Map();
  for (const item of pantry) {
    const parsed = typeof item === 'string' ? parseIngredient(item) : { ...item, name: normalizeIngredientName(item.name) };
    if (!parsed.name) continue;
    const quantity = asQuantity(parsed.quantity);
    stock.set(parsed.name, quantity == null ? { quantity: null, unit: parsed.unit ?? null } : { quantity, unit: parsed.unit ?? null });
  }
  return [...totals.values()].map(item => {
    const available = stock.get(item.name);
    const pack = packSizes[item.name];
    const comparable = !item.unknown && item.quantity != null && available?.quantity != null && available.unit === item.unit;
    const needed = comparable ? Math.max(0, item.quantity - available.quantity) : item.quantity;
    const packs = needed != null && pack?.unit === item.unit && Number(pack.quantity) > 0 ? Math.ceil(needed / Number(pack.quantity)) : null;
    return { ...item, required: item.quantity, available: comparable ? available.quantity : null, remaining: needed, packs, quantityStatus: item.unknown || (available && !comparable) ? 'unknown' : 'known' };
  });
}

