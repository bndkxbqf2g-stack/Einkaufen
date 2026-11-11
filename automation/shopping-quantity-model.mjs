/** Pure, deterministic quantity/pantry calculations. No storage or network access. */

const UNITS = Object.freeze({
  g: { base: 'g', factor: 1 }, kg: { base: 'g', factor: 1000 },
  ml: { base: 'ml', factor: 1 }, l: { base: 'ml', factor: 1000 },
  stück: { base: 'piece', factor: 1 }, stueck: { base: 'piece', factor: 1 },
  st: { base: 'piece', factor: 1 }, stk: { base: 'piece', factor: 1 },
});

const MEASURE = /^(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|stück|stueck|stk|st\.?|liter|milliliter)\b\s*(.*)$/i;
const TRAILING_MEASURE = /^(.*?)\s+(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|stück|stueck|stk|st\.?|liter|milliliter)\s*$/i;
const LEADING_PIECES = /^(\d+(?:[.,]\d+)?)\s+(.+)$/;

function number(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
  if (typeof value !== 'string' || !/^\d+(?:[.,]\d+)?$/.test(value.trim())) return null;
  const result = Number(value.trim().replace(',', '.'));
  return Number.isFinite(result) && result >= 0 ? result : null;
}

function unit(value) {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase().replace(/\.$/, '');
  return UNITS[key] ? { ...UNITS[key], input: key } : null;
}

export function normalizeIngredientName(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

function quantity(value, suppliedUnit) {
  const nested = value && typeof value.quantity === 'object' ? value.quantity : value;
  const amount = number(nested?.quantity ?? nested);
  const definition = unit(nested?.unit ?? value?.unit ?? suppliedUnit);
  if (amount === null || !definition) return null;
  return { quantity: amount * definition.factor, unit: definition.base };
}

export function parseIngredient(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const name = normalizeIngredientName(value.name ?? value.ingredient);
    const parsed = quantity(value);
    return { name, quantity: parsed?.quantity ?? null, unit: parsed?.unit ?? null, raw: value.raw ?? null };
  }
  const raw = String(value ?? '').trim();
  const leading = raw.match(MEASURE);
  const trailing = raw.match(TRAILING_MEASURE);
  if (leading || trailing) {
    const match = leading || trailing;
    const parsed = quantity(leading ? match[1] : match[2], leading ? match[2] : match[3]);
    const name = normalizeIngredientName(leading ? match[3] : match[1]);
    return { name, quantity: parsed?.quantity ?? null, unit: parsed?.unit ?? null, raw };
  }
  const pieces = raw.match(LEADING_PIECES);
  if (pieces) return { name: normalizeIngredientName(pieces[2]), quantity: number(pieces[1]), unit: 'piece', raw };
  return { name: normalizeIngredientName(raw), quantity: null, unit: null, raw };
}

function asParsedQuantity(value) {
  if (typeof value === 'string') {
    const match = value.trim().match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|stück|stueck|stk|st\.?|liter|milliliter)$/i);
    return match ? quantity(match[1], match[2]) : null;
  }
  return quantity(value);
}

function add(left, right) {
  if (!left) return right;
  if (!right || left.unit !== right.unit) return null;
  return { quantity: left.quantity + right.quantity, unit: left.unit };
}

function pantryItem(value) {
  if (typeof value === 'string') return { ...parseIngredient(value), legacyUnknown: true };
  return parseIngredient(value);
}

function packFor(item, packSizes) {
  const supplied = item.packSize ?? packSizes?.[item.name];
  const parsed = asParsedQuantity(supplied);
  return parsed?.quantity > 0 ? parsed : null;
}

/**
 * @param {{ingredients?: Array<string|object>, people?: number, pantry?: Array<string|object>, packSizes?: object}} options
 * @returns {Array<object>}
 */
export function calculateShoppingQuantities({ ingredients = [], people = 1, pantry = [], packSizes = {} } = {}) {
  const factor = number(people);
  if (factor === null || factor <= 0) throw new RangeError('people must be a positive number');
  const totals = new Map();
  for (const source of ingredients) {
    const parsed = parseIngredient(source);
    if (!parsed.name) continue;
    const current = totals.get(parsed.name) ?? { name: parsed.name, quantity: null, unit: null, unknown: false, packSize: source?.packSize };
    if (parsed.quantity === null) current.unknown = true;
    else {
      const scaled = { quantity: parsed.quantity * factor, unit: parsed.unit };
      const combined = add(current.quantity !== null ? { quantity: current.quantity, unit: current.unit } : null, scaled);
      if (current.quantity !== null && !combined) current.unknown = true;
      else { current.quantity = combined?.quantity ?? scaled.quantity; current.unit = combined?.unit ?? scaled.unit; }
    }
    totals.set(parsed.name, current);
  }

  const stock = new Map();
  for (const source of pantry) {
    const parsed = pantryItem(source);
    if (!parsed.name) continue;
    const current = stock.get(parsed.name) ?? { quantity: null, unit: null, unknown: false };
    if (parsed.legacyUnknown || parsed.quantity === null) current.unknown = true;
    else {
      const combined = add(current.quantity !== null ? { quantity: current.quantity, unit: current.unit } : null, { quantity: parsed.quantity, unit: parsed.unit });
      if (current.quantity !== null && !combined) current.unknown = true;
      else { current.quantity = combined?.quantity ?? parsed.quantity; current.unit = combined?.unit ?? parsed.unit; }
    }
    stock.set(parsed.name, current);
  }

  return [...totals.values()].map((item) => {
    const available = stock.get(item.name);
    const comparable = !item.unknown && item.quantity !== null && (!available || (!available.unknown && available.unit === item.unit));
    const remaining = comparable ? Math.max(0, item.quantity - (available?.quantity ?? 0)) : null;
    const pack = packFor(item, packSizes);
    const packs = comparable && pack?.unit === item.unit ? Math.ceil(remaining / pack.quantity) : null;
    return { name: item.name, quantity: item.quantity, unit: item.unit, required: item.quantity, available: comparable && available ? available.quantity : null, remaining, packs, quantityStatus: comparable ? 'known' : 'unknown' };
  });
}

export function parseQuantity(value) {
  const parsed = asParsedQuantity(value);
  return parsed ? { quantity: parsed.quantity, unit: parsed.unit } : null;
}

