import { extractExplicitRegularPrice } from './offer-normalization.mjs';
const DATE_PATTERN = /(?:gültig\s+(?:von|ab)\s+)?(\d{1,2})\.(\d{1,2})\.(\d{4})?\s*(?:bis|–|-)\s*(\d{1,2})\.(\d{1,2})\.(\d{4})?/i;
const PRICE_PATTERN = /(?:nur\s+|ab\s+)?(\d{1,3}[.,]\d{2})\s*(?:€|EUR|\*)?/i;
const UNIT_PRICE_PATTERN = /\(?\s*\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml)\s*=\s*\d{1,3}[.,]\d{2}\s*€?\s*\)?/gi;
const NON_FOOD_PATTERN = /\b(wc|toilet|spül|wasch|shampoo|kosmetik|werkzeug|garten|bekleidung|schuh|auto|akku|drucker|spielzeug|matratze|bettwäsche|tierfutter|smartphone|fernseher|werkbank|normalpreis|preis)\b/i;
const FOOD_HINT_PATTERN = /(apfel|äpfel|banan|birn|beeren|obst|orang|zitr|gemüse|kartoff|tomat|paprika|gurke|salat|zwiebel|knoblauch|karott|möhre|brokk|blumenkohl|spinat|fleisch|hack|rind|schwein|hähn|chicken|pute|lamm|steak|filet|wurst|salami|schinken|speck|fisch|lachs|thun|zander|scholle|hering|garnele|joghurt|almighurt|milch|sahne|butter|käse|quark|eier?\b|brot|bröt|toast|mehl|reis|nudel|pasta|pizza|pommes|suppe|sauce|soße|fertiggericht|müsli|cerealien|cornflakes|schokolade|schoko|hanuta|nutella|kakao|keks|waffel|lebkuchen|donut|chips|snack|erdnuss|nuss|nüsse|mandel|konfitüre|marmelade|kaffee|espresso|bohne|tee|saft|wasser|limonade|cola|energy|drink|bier|wein|vanillin|zucker|caramel|fudge|fruchtgummi|cheeseburger|knödel)/i;
const HEADER_PATTERN = /^(?:lidl|angebote|aktionsprospekt|prospekt|filiale|image|gültig|seite|zurück|weiter|alle angebote|wähle|wochenangebote)\b/i;
const DETAIL_PATTERN = /^(?:[-–]?\s*\d{1,3}\s*%|\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml|St\.?|Stück)|(?:nur|ab)\s+\d+[.,]\d{2})$/i;

function formatDate(day, month, year) {
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

export function extractValidUntil(text, now = new Date()) {
  const match = String(text || '').match(DATE_PATTERN);
  if (!match) return null;
  const referenceDate = now instanceof Date ? now : new Date(now);
  const currentYear = Number.isNaN(referenceDate.getTime())
    ? new Date().getUTCFullYear()
    : referenceDate.getUTCFullYear();
  let year = Number(match[6] || match[3] || currentYear);
  if (!match[6] && Number(match[5]) < Number(match[2])) year += 1;
  return formatDate(Number(match[4]), Number(match[5]), year);
}

function cleanName(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/^(?:aktion|angebot|filiale)\s+/i, '')
    .replace(/-\s*\d{1,3}\s*%[\s\S]*$/i, '')
    .replace(/\b(?:nur|ab)\s+\d{1,3}[.,]\d{2}[\s\S]*$/i, '')
    .replace(/[|•·]+/g, ' ')
    .trim();
}

function likelyFood(name) {
  return name.length >= 4 && /[A-Za-zÄÖÜäöüß]{4}/.test(name) && FOOD_HINT_PATTERN.test(name) && !NON_FOOD_PATTERN.test(name) && !HEADER_PATTERN.test(name);
}

function stripUnitPrices(value) {
  return String(value || '').replace(UNIT_PRICE_PATTERN, ' ').replace(/\s+/g, ' ').trim();
}

function packSize(text) {
  const match = stripUnitPrices(text).match(/\b\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml|St\.?|Stück)\b/i);
  return match ? match[0].replace(/\s+/g, ' ').trim() : '1 Packung';
}

export function parseLidlOfferText(input, options = {}) {
  const raw = String(input || '').replace(/\u00a0/g, ' ');
  const lines = raw.split(/\r?\n/).map(stripUnitPrices).filter(Boolean);
  const validUntil = options.validUntil || extractValidUntil(raw);
  const results = [];
  const seen = new Set();
  for (let index = 0; index < lines.length; index += 1) {
    const priceMatch = lines[index].match(PRICE_PATTERN);
    if (!priceMatch) continue;
    const contextLines = lines.slice(Math.max(0, index - 3), index + 1);
    const window = contextLines.join(' ');
    const name = cleanName(contextLines.filter(line => !HEADER_PATTERN.test(line) && !DETAIL_PATTERN.test(line) && !DATE_PATTERN.test(line) && !PRICE_PATTERN.test(line)).join(' '));
    if (!likelyFood(name)) continue;
    const price = `${priceMatch[1].replace('.', ',')} €`;
    const regularPrice = extractExplicitRegularPrice(window, price);
    const key = `${name.toLowerCase()}|${price}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ name, price, saving: (window.match(/-\s*\d{1,3}\s*%/) || [])[0] || '–', ...(regularPrice ? { regularPrice } : {}), icon: '🛒', category: 'Lebensmittel', packSize: packSize(window), relevance: 78, note: 'Lidl-Prospekt', validUntil });
  }
  return results.slice(0, 120);
}
