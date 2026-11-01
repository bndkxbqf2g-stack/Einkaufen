import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const markets = {
  Aldi: { url: 'https://www.aldi-sued.de/angebote', host: 'aldi-sued.de', slug: 'aldi' },
  Kaufland: { url: 'https://filiale.kaufland.de/angebote.html', host: 'kaufland.de', slug: 'kaufland' },
  EDEKA: { url: 'https://www.edeka.de/angebote/', host: 'edeka.de', slug: 'edeka' },
  Netto: { url: 'https://www.netto-online.de/angebote/c-N07', host: 'netto-online.de', slug: 'netto' },
};

const market = process.argv[2] || process.env.MARKET || '';
const source = markets[market];
if (!source) throw new Error(`Unbekannter Markt: ${market}. Erlaubt: ${Object.keys(markets).join(', ')}`);
const output = resolve(process.env.OFFER_OUTPUT || `generated/${source.slug}-offers.json`);
const maxBytes = 4_000_000;

function stripHtml(value) {
  return String(value || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&euro;/gi, '€')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractAnchorTexts(html) {
  const values = [];
  const pattern = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const value = stripHtml(match[1]);
    if (value) values.push(value);
  }
  return values;
}

function formatDate(day, month, year) {
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

function defaultOfferDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 7);
  return formatDate(date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear());
}

function offerDateRange(text) {
  const match = String(text || '').match(/gültig\s+vom\s+(\d{1,2})\.(\d{1,2})\.?\s*(\d{4})?\s*(?:bis|–|-)\s*(\d{1,2})\.(\d{1,2})\.?\s*(\d{4})?/i);
  if (!match) return null;
  const year = new Date().getUTCFullYear();
  const startYear = Number(match[3] || year);
  let endYear = Number(match[6] || startYear);
  if (!match[6] && Number(match[5]) < Number(match[2])) endYear += 1;
  return { end: formatDate(Number(match[4]), Number(match[5]), endYear) };
}

function offerPrice(text) {
  const outside = String(text || '').replace(/\([^)]*\)/g, ' ');
  const discounted = outside.match(/(?:nur\s+|-\s*\d{1,3}\s*%)\s*(\d+[.,]\d{2})/i);
  const match = discounted || outside.match(/\b(\d+[.,]\d{2})\b/);
  return match ? `${match[1].replace('.', ',')} €` : '';
}

function offerSaving(text) {
  const match = String(text || '').match(/-\s*\d{1,3}\s*%/);
  return match ? match[0].replace(/\s+/g, '') : '–';
}

function offerPackSize(text) {
  const match = String(text || '').match(/\b\d+(?:[.,]\d+)?\s*-?\s*(?:kg|g|l|ml|St\.?|Stück)\b/i);
  return match ? match[0].replace(/\s+/g, ' ').trim() : '1 Packung';
}

function offerName(text) {
  return String(text || '')
    .replace(/^angebot:\s*/i, '')
    .replace(/\s+(?:nur|ab)\s+\d+[.,]\d{2}[\s\S]*$/i, '')
    .replace(/\s*-\s*\d{1,3}\s*%[\s\S]*$/i, '')
    .replace(/\s*\d+[.,]\d{2}[\s\S]*$/, '')
    .replace(/\s+/g, ' ')
    .replace(/[–-]\s*$/, '')
    .trim();
}

function likelyFood(name) {
  return !/(wc|toilet|spül|wasch|shampoo|kosmetik|werkzeug|garten|bekleidung|schuh|auto|akku|drucker|whisky|vodka|bier|wein|zigarette|tierfutter|luftbett|bettwäsche|badematte|teppich|polster|overall|fleece|thermostiefel|laufschuhe|fußmatte|lichterkranz|leucht|weihnachtsbaum|rätselbox|orchidee|heizsortiment|lendenwärmer|fichte|metalleimer|led|panel|baselayer|windspiel|troyer|damen|herren|kinder)/i.test(name);
}

function normalizeOfferText(text, validUntil) {
  const name = offerName(text);
  const price = offerPrice(text);
  if (!name || name.length < 3 || !price || !likelyFood(name)) return null;
  return { name, price, saving: offerSaving(text), icon: '🛒', category: 'Lebensmittel', packSize: offerPackSize(text), relevance: 78, note: 'offizielle Händlerseite', validUntil };
}

function uniqueOffers(values, validUntil) {
  const seen = new Set();
  return values.map(value => normalizeOfferText(value, validUntil)).filter(Boolean).filter(offer => {
    const key = `${offer.name.toLowerCase()}|${offer.price}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 80);
}

function parseKauflandOffers(html) {
  const text = stripHtml(html);
  const validUntil = offerDateRange(text)?.end || defaultOfferDate();
  const candidates = extractAnchorTexts(html).filter(value => /\d+[.,]\d{2}/.test(value) && /(kg|g|l|ml|St\.?|Packg\.|nur\s+|-\s*\d{1,3}\s*%)/i.test(value));
  return { validUntil, offers: uniqueOffers(candidates, validUntil) };
}

function parseEdekaOffers(html) {
  const text = stripHtml(html);
  const validUntil = offerDateRange(text)?.end || defaultOfferDate();
  const currentText = text.split(/angebote der woche bei edeka/i)[0];
  const candidates = [];
  const pattern = /angebot:\s*([\s\S]{2,120}?)(?=\s+(?:ab\s+\d{1,2}\.\d{1,2}\.?\s*)?\d+[.,]\d{2}\b)/gi;
  let match;
  while ((match = pattern.exec(currentText))) candidates.push(`Angebot: ${match[1]} ${currentText.slice(pattern.lastIndex, pattern.lastIndex + 24)}`);
  return { validUntil, offers: uniqueOffers(candidates, validUntil) };
}

function parseAldiOffers(html) {
  const validUntil = defaultOfferDate();
  const candidates = extractAnchorTexts(html)
    .filter(value => /\d+[.,]\d{2}/.test(value) && /(kg|g|l|ml|St\.?|stück|€)/i.test(value))
    .map(value => value.replace(/^verfügbar\s+ab\s+\d{1,2}\.\d{1,2}\.\d{4}\s*/i, ''));
  return { validUntil, offers: uniqueOffers(candidates, validUntil) };
}

function parseNettoOffers(html) {
  const text = stripHtml(html);
  const validUntil = offerDateRange(text)?.end || defaultOfferDate();
  const candidates = [];
  const headingPattern = /<h3\b[^>]*>([\s\S]*?)<\/h3>([\s\S]{0,700}?)(?=<h3\b|<h2\b|<footer\b|$)/gi;
  let match;
  while ((match = headingPattern.exec(html))) {
    const candidate = `${stripHtml(match[1])} ${stripHtml(match[2])}`.trim();
    if (/\d+[.,]\d{2}/.test(candidate)) candidates.push(candidate);
  }
  const fallback = extractAnchorTexts(html).filter(value => /\d+[.,]\d{2}/.test(value) && /(kg|g|l|ml|St\.?|stück|€)/i.test(value));
  return { validUntil, offers: uniqueOffers([...candidates, ...fallback], validUntil) };
}

async function main() {
  let body;
  let sourceUrl = source.url;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  let response;
  try {
    response = await fetch(source.url, { redirect: 'follow', signal: controller.signal, headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'Angebotskueche GitHub Actions offer importer/1.0' } });
  } finally {
    clearTimeout(timeout);
  }
  const finalHost = new URL(response.url || source.url).hostname.toLowerCase();
  if (response.ok && (finalHost === source.host || finalHost.endsWith(`.${source.host}`))) {
    body = await response.text();
    sourceUrl = response.url || source.url;
  } else if (market === 'Netto') {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ locale: 'de-DE', userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36' });
      const loaded = await page.goto(source.url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
      await page.waitForTimeout(1_500);
      body = await page.content();
      sourceUrl = page.url();
      if (!loaded?.ok() && !/netto-online\.de$/i.test(new URL(sourceUrl).hostname)) throw new Error(`Netto: Browserabruf fehlgeschlagen (${loaded?.status() || 'unbekannt'})`);
    } finally {
      await browser.close();
    }
  } else {
    throw new Error(`${market}: offizielle Quelle nicht erreichbar (${response.status})`);
  }
  if (new URL(sourceUrl).hostname.toLowerCase() !== source.host && !new URL(sourceUrl).hostname.toLowerCase().endsWith(`.${source.host}`)) throw new Error(`${market}: unerwartete Weiterleitung`);
  if (new TextEncoder().encode(body).byteLength > maxBytes) throw new Error(`${market}: Antwort ist unerwartet groß`);
  const parsed = market === 'Kaufland' ? parseKauflandOffers(body) : market === 'EDEKA' ? parseEdekaOffers(body) : market === 'Aldi' ? parseAldiOffers(body) : parseNettoOffers(body);
  if (!parsed.offers.length) throw new Error(`${market}: keine sicher erkennbaren Lebensmittelangebote gefunden`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify({ market, sourceUrl, store: 'Region Zellingen', fetchedAt: new Date().toISOString(), validUntil: parsed.validUntil, parser: `${source.slug}-github-actions-v1`, offers: parsed.offers }, null, 2)}\n`, 'utf8');
  console.log(`${market}: ${parsed.offers.length} Angebote nach ${output} geschrieben`);
}

main().catch(error => { console.error(error?.message || error); process.exitCode = 1; });

