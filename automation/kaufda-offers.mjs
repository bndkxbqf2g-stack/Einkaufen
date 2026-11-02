import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright';

const execFileAsync = promisify(execFile);
const defaultMarkets = [
  { key: 'Aldi', market: 'Aldi', store: 'ALDI SÜD', location: 'Zellingen', url: 'https://www.kaufda.de/Zellingen/ALDI-SUeD/p-r90', file: 'aldi-offers.json' },
  { key: 'EDEKA', market: 'EDEKA', store: 'EDEKA Traut', location: 'Zellingen', url: 'https://www.kaufda.de/Zellingen/EDEKA/p-r107', file: 'edeka-offers.json' },
  { key: 'Lidl', market: 'Lidl', store: 'Lidl', location: 'Zellingen', url: 'https://www.kaufda.de/Zellingen/Lidl/p-r74', file: 'lidl-offers.json' },
  { key: 'Penny', market: 'Penny', store: 'Penny', location: 'Zellingen', url: 'https://www.kaufda.de/Zellingen/Penny-Markt/p-r75', file: 'penny-offers.json' },
  { key: 'Kaufland', market: 'Kaufland', store: 'Kaufland', location: 'Würzburg · Nürnberger Straße 12', url: 'https://www.kaufda.de/Wuerzburg/Kaufland/p-r2801', file: 'kaufland-offers.json' },
];

const outputDir = resolve(process.env.KAUFDA_OUTPUT_DIR || 'generated');
const workdir = await mkdtemp(resolve(tmpdir(), 'angebotskueche-kaufda-'));
const validUntilFallback = (() => { const date = new Date(); date.setUTCDate(date.getUTCDate() + 7); return `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${date.getUTCFullYear()}`; })();

function stripText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function likelyFood(value) {
  const normalized = stripText(value).toLowerCase();
  if (!normalized) return false;
  if (/(rollator|dartscheibe|infrarot|kabine|bagger|werkzeug|garten|pflanz|blumen|bekleidung|wäsche|schuh|auto|akku|drucker|elektronik|spielzeug|matratze|schrank|lampe|möbel|pavillon|grillkohle|haushalt|spülmittel|waschmittel|reiniger|putz|schwamm|papier|taschentuch|toiletten|müllbeutel|folie|backpapier|kosmetik|shampoo|dusche|seife|zahnpasta|deo|rasierer|windel|tierfutter|katzen|hunde|vogel|aquarium|whisky|vodka|zigarette|klemmbaustein|treibstoff|bier|wein|sekt|schnaps|likör|spirituosen|alkohol)/i.test(normalized)) return false;
  return /(brot|bröt|backwaren|mehl|zucker|reis|nudel|pasta|kartoff|gemüse|obst|salat|tomat|gurke|paprika|zwiebel|knoblauch|karotte|möhre|apfel|banane|beere|dattel|clementin|porree|kaki|orange|zitrone|milch|joghurt|käse|butter|sahne|quark|eier?\b|fleisch|fond|hack|schnitzel|wurst|schinken|salami|hähn|pute|rind|schwein|filet|steak|kotelett|fisch|lachs|thun|pizza|suppe|sauce|soße|konserve|bohne|erbse|linse|öl|essig|senf|ketchup|marmelade|nutella|schokolade|chips|snack|keks|kaffee|tee|saft|wasser|cola|limonade|bier|wein|alkoholfrei|müsli|cornflakes|honig|süßwaren|nahrung|lebensmittel|kg|g\b|ml\b|liter|\bl\b)/i.test(normalized);
}
function priceFrom(value) { const match = String(value || '').match(/(?:ab\s*)?(\d{1,4}[,.]\d{2})\s*€/); return match ? `${match[1].replace('.', ',')} €` : '–'; }
function validUntilFrom(value) { const match = String(value || '').match(/(?:bis|gültig bis)\s+(\d{1,2})\.(\d{1,2})\.?/i); return match ? `${String(match[1]).padStart(2, '0')}.${String(match[2]).padStart(2, '0')}.${new Date().getUTCFullYear()}` : validUntilFallback; }
function pageCountFrom(value) { const match = String(value || '').match(/(?:mit|insgesamt)\s+(\d{1,3})\s+Seiten/i); return Math.min(Math.max(Number(match?.[1] || 72), 1), 120); }

function parseOcr(text, validUntil, config) {
  const lines = String(text || '').split(/\r?\n/).map(stripText).filter(Boolean);
  const offers = [];
  for (let index = 0; index < lines.length; index += 1) {
    const contextLines = lines.slice(Math.max(0, index - 3), Math.min(lines.length, index + 3));
    const window = contextLines.join(' ');
    const match = window.match(/(\d{1,4}[,.]\d{2})\s*€?/);
    if (!match) continue;
    let name = lines[index].replace(/\d{1,4}[,.]\d{2}\s*€?/g, '').replace(/-\s*\d{1,3}\s*%/g, '').trim();
    if (name.length < 3 || /^\d/.test(name) || !likelyFood(name)) {
      name = contextLines
        .map(line => line.replace(/\d{1,4}[,.]\d{2}\s*€?/g, '').replace(/-\s*\d{1,3}\s*%/g, '').trim())
        .find(line => line.length >= 3 && line.length <= 100 && !/^\d/.test(line) && !/(€|%|UVP|Angebot|Aktion|gültig|Seite|Woche)/i.test(line) && likelyFood(line)) || '';
    }
    name = stripText(name);
    if (name.length < 3 || name.length > 100 || !likelyFood(name) || /^(angebot|aktion|uvp|je|ab|gültig)$/i.test(name)) continue;
    offers.push({ name, store: config.store, price: `${match[1].replace('.', ',')} €`, saving: '–', icon: '🛒', category: 'Lebensmittel', packSize: '1 Packung', relevance: 76, note: 'KaufDA-Prospekt · OCR', validUntil });
  }
  return offers;
}

async function cardOffers(page, validUntil, config) {
  const items = await page.locator('[aria-label*="zur Einkaufsliste hinzufügen"]').evaluateAll(inputs => inputs.map(input => {
    const label = input.getAttribute('aria-label') || '';
    let node = input;
    for (let index = 0; index < 7 && node.parentElement; index += 1) {
      node = node.parentElement;
      if ((node.innerText || '').match(/\d{1,4}[,.]\d{2}\s*€/)) break;
    }
    const name = label.replace(/\s+zur Einkaufsliste hinzufügen\s*$/i, '').trim();
    const text = node.innerText || '';
    const price = (text.match(/(?:ab\s*)?\d{1,4}[,.]\d{2}\s*€/) || [])[0] || '';
    return { name, price };
  }));
  return items.filter(item => likelyFood(item.name)).map(item => ({ ...item, validUntil, store: config.store }));
}

async function ocr(file) {
  const outputs = [];
  for (const psm of ['6', '11']) {
    const result = await execFileAsync('tesseract', [file, 'stdout', '-l', 'deu+eng', '--psm', psm], { maxBuffer: 2_000_000 });
    outputs.push(result.stdout || '');
  }
  return outputs.join('\n');
}

function configuredMarkets() {
  const raw = String(process.env.KAUFDA_URLS || '').trim();
  if (!raw) return defaultMarkets;
  const overrides = new Map();
  for (const line of raw.split(/\r?\n/).map(stripText).filter(Boolean)) {
    const [key, url] = line.split(/\s*\|\s*/, 2);
    if (key && url) overrides.set(key.toLowerCase(), url);
  }
  const markets = defaultMarkets.map(config => ({ ...config, url: overrides.get(config.key.toLowerCase()) || config.url }));
  const selected = String(process.env.KAUFDA_MARKET || 'all').trim().toLowerCase();
  if (!selected || selected === 'all') return markets;
  const filtered = markets.filter(config => config.key.toLowerCase() === selected);
  if (!filtered.length) throw new Error(`Unbekannter KaufDA-Markt: ${process.env.KAUFDA_MARKET}`);
  return filtered;
}

async function scrapeMarket(page, config) {
  const offers = [];
  await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await page.waitForTimeout(1_500);
  const pageText = await page.locator('body').innerText();
  const validUntil = validUntilFrom(pageText);
  for (const item of await cardOffers(page, validUntil, config)) {
    if (item.name.length >= 3 && likelyFood(item.name) && priceFrom(item.price) !== '–') offers.push({ name: item.name, store: config.store, price: priceFrom(item.price), saving: '–', icon: '🛒', category: 'Lebensmittel', packSize: '1 Packung', relevance: 80, note: 'KaufDA-Angebot', validUntil: item.validUntil });
  }

  const openButton = page.getByRole('button', { name: /Prospekt öffnen/i }).first();
  if (await openButton.count()) {
    try { await openButton.click({ timeout: 8_000 }); await page.waitForTimeout(1_000); } catch { /* structured offers are still usable */ }
  }
  const viewer = new URL(page.url());
  if (/\/contentViewer\//i.test(viewer.pathname)) {
    await page.waitForTimeout(1_000);
    const imageUrls = await page.locator('img').evaluateAll(images => images
      .map(image => image.currentSrc || image.src || image.getAttribute('data-src') || '')
      .filter(url => /content-media\.bonial\.biz\/.*zoomlarge_page_\d+\.jpg/i.test(url)));
    const uniqueImageUrls = [...new Set(imageUrls)].sort((left, right) => {
      const leftPage = Number(left.match(/zoomlarge_page_(\d+)\.jpg/i)?.[1] || 0);
      const rightPage = Number(right.match(/zoomlarge_page_(\d+)\.jpg/i)?.[1] || 0);
      return leftPage - rightPage;
    });
    if (uniqueImageUrls.length) {
      console.log(`KaufDA: ${config.key} ${uniqueImageUrls.length} Prospektseiten gefunden`);
      for (let pageIndex = 0; pageIndex < uniqueImageUrls.length; pageIndex += 1) {
        try {
          const response = await fetch(uniqueImageUrls[pageIndex], { headers: { 'user-agent': 'Angebotskueche KaufDA importer' } });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const file = resolve(workdir, `${config.key.toLowerCase()}-${pageIndex + 1}.jpg`);
          await writeFile(file, Buffer.from(await response.arrayBuffer()));
          offers.push(...parseOcr(await ocr(file), validUntil, config));
        } catch { /* einzelne Prospektseiten können fehlen */ }
      }
    } else {
      const maxPages = pageCountFrom(pageText);
      for (let brochurePage = 1; brochurePage <= maxPages; brochurePage += 1) {
        viewer.searchParams.set('page', String(brochurePage));
        try {
          await page.goto(viewer.toString(), { waitUntil: 'domcontentloaded', timeout: 15_000 });
          await page.waitForTimeout(250);
          const file = resolve(workdir, `${config.key.toLowerCase()}-${brochurePage}.png`);
          await page.screenshot({ path: file, fullPage: true });
          offers.push(...parseOcr(await ocr(file), validUntil, config));
        } catch { /* einzelne Prospektseiten können fehlen */ }
      }
    }
  }

  const unique = [];
  const seen = new Set();
  for (const offer of offers) {
    const key = `${offer.name.toLowerCase()}|${offer.price}|${offer.store}`;
    if (!seen.has(key)) { seen.add(key); unique.push(offer); }
  }
  if (!unique.length) throw new Error(`${config.key}: keine Lebensmittelangebote erkannt`);
  const result = { market: config.market, store: config.store, location: config.location, sourceUrl: config.url, fetchedAt: new Date().toISOString(), validUntil, parser: 'kaufda-prospect-images-ocr-v3', recognizedCount: unique.length, offers: unique };
  await writeFile(resolve(outputDir, config.file), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(`KaufDA: ${unique.length} ${config.key}-Angebote nach ${config.file} geschrieben`);
  return result;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 2200 }, locale: 'de-DE' });
try {
  await mkdir(outputDir, { recursive: true });
  const markets = configuredMarkets();
  const results = [];
  for (const config of markets) {
    try { results.push(await scrapeMarket(page, config)); }
    catch (error) { console.error(`KaufDA-Fehler ${config.key}: ${error.message}`); }
  }
  if (results.length < markets.length) throw new Error(`Nur ${results.length}/${markets.length} KaufDA-Märkte erfolgreich verarbeitet.`);
  console.log(`KaufDA: ${results.reduce((sum, result) => sum + result.recognizedCount, 0)} Angebote aus ${results.length} Märkten erkannt.`);
} finally {
  await page.close(); await browser.close(); await rm(workdir, { recursive: true, force: true });
}

