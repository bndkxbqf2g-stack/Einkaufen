const DATE_PATTERN = /(?:gültig\s+(?:von|ab)\s+)?(\d{1,2})\.(\d{1,2})\.(\d{4})?\s*(?:bis|–|-)\s*(\d{1,2})\.(\d{1,2})\.(\d{4})?/i;
const PRICE_PATTERN = /(?:nur\s+|ab\s+)?(\d{1,3}[.,]\d{2})\s*(?:€|EUR|\*)?/i;
const NON_FOOD_PATTERN = /\b(wc|toilet|spül|wasch|shampoo|kosmetik|werkzeug|garten|bekleidung|schuh|auto|akku|drucker|spielzeug|matratze|bettwäsche|tierfutter|smartphone|fernseher|werkbank|normalpreis|preis)\b/i;
const FOOD_HINT_PATTERN = /(apfel|banan|birn|beeren|obst|gemüse|kartoff|tomat|paprika|gurke|salat|zwiebel|knoblauch|karott|möhre|brokk|blumenkohl|spinat|fleisch|hack|rind|schwein|hähn|chicken|wurst|salami|schinken|speck|fisch|lachs|thun|joghurt|almighurt|milch|sahne|butter|käse|quark|eier?\b|brot|bröt|toast|mehl|reis|nudel|pasta|pizza|pommes|suppe|sauce|soße|fertiggericht|müsli|cerealien|cornflakes|schokolade|hanuta|kakao|keks|chips|snack|erdnuss|nuss|konfitüre|marmelade|kaffee|tee|saft|wasser|limonade|cola|bier|wein)/i;
const HEADER_PATTERN = /^(?:lidl|angebote|aktionsprospekt|prospekt|filiale|image|gültig|seite|zurück|weiter|alle angebote|wähle|wochenangebote)\b/i;
const DETAIL_PATTERN = /^(?:[-–]?\s*\d{1,3}\s*%|\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml|St\.?|Stück)|(?:nur|ab)\s+\d+[.,]\d{2})$/i;

function formatDate(day, month, year) {
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

function fallbackDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 7);
  return formatDate(date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear());
}

export function extractValidUntil(text) {
  const match = String(text || '').match(DATE_PATTERN);
  if (!match) return fallbackDate();
  const year = Number(match[6] || match[3] || new Date().getUTCFullYear());
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

function packSize(text) {
  const match = String(text || '').match(/\b\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml|St\.?|Stück)\b/i);
  return match ? match[0].replace(/\s+/g, ' ').trim() : '1 Packung';
}

export function parseLidlOfferText(input, options = {}) {
  const raw = String(input || '').replace(/\u00a0/g, ' ');
  const lines = raw.split(/\r?\n/).map(line => line.replace(/\s+/g, ' ').trim()).filter(Boolean);
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
    const key = `${name.toLowerCase()}|${price}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ name, price, saving: (window.match(/-\s*\d{1,3}\s*%/) || [])[0] || '–', icon: '🛒', category: 'Lebensmittel', packSize: packSize(window), relevance: 78, note: 'Lidl-Prospekt', validUntil });
  }
  return results.slice(0, 120);
}
