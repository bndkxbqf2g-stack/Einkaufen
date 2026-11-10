const packagingMeasure = /(?:(\d+(?:[.,]\d+)?)\s*[x×]\s*)?(\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?)\s*[- ]?\s*(kg|g|l|ml|Stück|St\.?)\s*[- ]?(?:Groß)?(?:Packg\.?|Packung|Becher|Beutel|Dose|Flasche|Fl\.?|Kasten|Ka\.)/gi;
const genericMeasure = /(?:(\d+(?:[.,]\d+)?)\s*[x×]\s*)?(\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?)\s*[- ]?\s*(kg|g|l|ml|Stück|St\.?)/gi;
const packCount = /\b\d+\s*er\s*[- ]?\s*Pack(?:ung)?\b/i;
const euroPrice = /(?:\b\d{1,4}[.,]\d{2}\s*€|€\s*\d{1,4}[.,]\d{2}\b)/i;
const comparisonPricePattern = /\b(?:statt|vorher|regulär(?:er)?|normalpreis|uvp)\s*:?\s*((?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{2})?)\s*€/i;
const unitPriceExpression = /\(?\s*\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml)\s*=\s*(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{2})?\s*€?\s*\)?/gi;

function parseEuroCents(value) {
  const raw = String(value || '').replace(/\s*€\s*$/i, '').trim();
  if (!/^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{2})?$/.test(raw)) return null;
  const [whole, decimal = '00'] = raw.split(',');
  const cents = Number(whole.replace(/\./g, '')) * 100 + Number(decimal);
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function extractExplicitRegularPrice(value, offerPrice = '') {
  const text = String(value || '').replace(unitPriceExpression, ' ');
  const match = text.match(comparisonPricePattern);
  if (!match) return '';
  const regularCents = parseEuroCents(match[1]);
  const offerCents = parseEuroCents(offerPrice);
  if (regularCents === null || (offerCents !== null && regularCents <= offerCents)) return '';
  return `${match[1]} €`;
}

function productTextBeforePrice(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const price = euroPrice.exec(text);
  const beforePrice = price ? text.slice(0, price.index) : text;
  const unitPrice = /\b\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml)\s*=/i.exec(beforePrice);
  return unitPrice ? beforePrice.slice(0, unitPrice.index) : beforePrice;
}

function formatMeasure(match) {
  const quantity = match[2].replace(/\s*[-–]\s*/g, '–').replace(/\s+/g, '');
  const unit = /^st\.?$/i.test(match[3]) ? 'Stück' : match[3];
  const count = match[1] ? `${match[1]} x ` : '';
  return `${count}${quantity} ${unit}`;
}

function packSizeBeforePrice(value) {
  const productText = productTextBeforePrice(value);
  if (!productText) return '';
  const qualified = [...productText.matchAll(packagingMeasure)].map(formatMeasure);
  if (qualified.length) return [...new Set(qualified)].join(' oder ');
  const pack = packCount.exec(productText);
  if (pack) return pack[0].replace(/\s+/g, ' ').trim();
  const generic = [...productText.matchAll(genericMeasure)][0];
  return generic ? formatMeasure(generic) : '';
}

export function offerPackSize(title, details = '') {
  return packSizeBeforePrice(title) || packSizeBeforePrice(details) || '';
}

export function offerDeduplicationKey(offer, fallbackStore = '') {
  const packSize = offer?.packSize || offerPackSize(offer?.name, offer?.text);
  return [offer?.name, offer?.price, packSize, offer?.validUntil, offer?.store || fallbackStore]
    .map(value => String(value || '').trim().replace(/\s+/g, ' ').toLowerCase())
    .join('|');
}
