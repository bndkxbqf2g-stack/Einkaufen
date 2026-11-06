const explicitPackSize = /\b(?:(?:\d+(?:[.,]\d+)?\s*[x×]\s*)?\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml|Stück|St\.?)|\d+\s*er\s*[- ]?\s*Pack(?:ung)?|Pack(?:ung)?\s+mit\s+\d+\s*(?:Stück|St\.?))\b/i;
const euroPrice = /(?:\b\d{1,4}[.,]\d{2}\s*€|€\s*\d{1,4}[.,]\d{2}\b)/i;

function packSizeBeforePrice(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const price = euroPrice.exec(text);
  const productText = price ? text.slice(0, price.index) : text;
  const match = explicitPackSize.exec(productText);
  return match?.[0]
    .replace(/\s*([x×])\s*/gi, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim() || '';
}

export function offerPackSize(title, details = '') {
  return packSizeBeforePrice(title) || packSizeBeforePrice(details) || '1 Packung';
}

