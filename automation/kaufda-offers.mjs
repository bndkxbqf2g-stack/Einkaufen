import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright';

const execFileAsync = promisify(execFile);
const defaultMarkets = [
  { key: 'Aldi', market: 'Aldi', store: 'ALDI SÜD', location: 'Zellingen', url: 'https://www.kaufda.de/Zellingen/ALDI-SUeD/p-r90', browserUrl: 'https://www.kaufda.de/search?query=ALDI+S%C3%9CD&lat=49.901699199999996&lng=9.812895&city=Zellingen&zip=97225', file: 'aldi-offers.json' },
  { key: 'EDEKA', market: 'EDEKA', store: 'EDEKA Traut', location: 'Zellingen', url: 'https://www.kaufda.de/Filialen/Zellingen/EDEKA-Frischemarkt-Trabold-Wuerzburger-Strasse-EDEKA/v-f1222263733', browserUrl: 'https://www.kaufda.de/search?query=EDEKA&lat=49.901699199999996&lng=9.812895&city=Zellingen&zip=97225', file: 'edeka-offers.json' },
  { key: 'Lidl', market: 'Lidl', store: 'Lidl', location: 'Zellingen', url: 'https://www.kaufda.de/Filialen/Zellingen/Lidl-Am-Guessgraben/v-f35595', browserUrl: 'https://www.kaufda.de/search?query=Lidl&lat=49.901699199999996&lng=9.812895&city=Zellingen&zip=97225', file: 'lidl-offers.json' },
  { key: 'Penny', market: 'Penny', store: 'Penny', location: 'Zellingen', url: 'https://www.kaufda.de/Filialen/Zellingen/Penny-Am-Guessgraben/v-f4407435', browserUrl: 'https://www.kaufda.de/search?query=Penny&lat=49.901699199999996&lng=9.812895&city=Zellingen&zip=97225', file: 'penny-offers.json' },
  { key: 'Netto', market: 'Netto', store: 'Netto Marken-Discount', location: 'Thüngersheim', url: 'https://www.kaufda.de/Filialen/Thuengersheim/Netto-Marken-Discount-Am-Strassacker-Netto-Marken-Discount/v-f600145626', browserUrl: 'https://www.kaufda.de/search?query=Netto+Marken-Discount&lat=49.901699199999996&lng=9.812895&city=Zellingen&zip=97225', file: 'netto-offers.json' },
  { key: 'Kaufland', market: 'Kaufland', store: 'Kaufland', location: 'Würzburg · Nürnberger Straße 12', url: 'https://www.kaufda.de/Filialen/Wuerzburg/Kaufland-Nuernberger-Strasse/v-f1690433206', browserUrl: 'https://www.kaufda.de/search?query=Kaufland&lat=49.901699199999996&lng=9.812895&city=Zellingen&zip=97225', file: 'kaufland-offers.json' },
];

const outputDir = resolve(process.env.KAUFDA_OUTPUT_DIR || 'generated');
const workdir = await mkdtemp(resolve(tmpdir(), 'angebotskueche-kaufda-'));
const validUntilFallback = (() => { const date = new Date(); date.setUTCDate(date.getUTCDate() + 7); return `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${date.getUTCFullYear()}`; })();

function stripText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function likelyFood(value) {
  const normalized = stripText(value).toLowerCase();
  if (!normalized) return false;
  if (/(rollator|dartscheibe|infrarot|kabine|bagger|werkzeug|garten|pflanz|blumen|bekleidung|wäsche|schuh|auto|akku|drucker|elektronik|spielzeug|matratze|schrank|lampe|möbel|pavillon|grillkohle|haushalt|spülmittel|waschmittel|reiniger|putz|schwamm|papier|taschentuch|toiletten|müllbeutel|folie|backpapier|kosmetik|shampoo|dusche|seife|zahnpasta|deo|rasierer|windel|tierfutter|katzen|hunde|vogel|aquarium|whisky|vodka|zigarette|klemmbaustein|treibstoff|bier|wein|sekt|schnaps|likör|spirituosen|alkohol|pflegespülung|spülung|tablette|arznei|medizin|schmerz|sodbrennen|spray|apotheke|veltliner|prosecco|cava|champagner|led|lichter|teelichter|fichte|geschenk|deko|verpackung|schneeanzug|anzug|winter|stiefel|handschuh|badewanne|häcksler|haar|haarmaske|cremebad|repair|argan|körperpflege|gesichtscreme|handcreme|tagescreme|nachtcreme|parfum|kosmetik|zubehör|werkzeug|maschine|batterie|akku|möbel|kissen|matratze|bettwäsche|geschirr|tasse|becher|pfanne|topf|schneidebrett|reise|rundreise|kreissäge|säge|reiskocher|kocher|sodabereiter|sprudelbereiter)/i.test(normalized)) return false;
  return /(brot|bröt|backwaren|mehl|zucker|reis|nudel|pasta|kartoff|gemüse|obst|salat|tomat|gurke|paprika|zwiebel|knoblauch|karotte|möhre|äpfel|apfel|banane|beere|dattel|clementin|porree|kaki|orange|zitrone|milch|joghurt|käse|butter|sahne|quark|eier?\b|fleisch|fond|hack|schnitzel|wurst|schinken|salami|hähn|pute|rind|schwein|filet|steak|kotelett|fisch|lachs|thun|pizza|suppe|sauce|soße|konserve|bohne|erbse|linse|öl|essig|senf|ketchup|marmelade|nutella|schokolade|chips|snack|keks|kaffee|tee|saft|wasser|cola|limonade|bier|wein|alkoholfrei|müsli|cornflakes|honig|süßwaren|nahrung|lebensmittel|hülsenfrucht|mandel|burger|cerealien|genießer|almighurt|fruchtgummi|saltletts|schoko|drink|meerrettich|garnele|garnelen|eierspätzle|spätzle|kapern|gulasch|rösti|maronen|filoncino|dessert|gänse|keule|wildlachs|backzutat|knödel|fudge|erdnuss)/i.test(normalized);
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
    let bestNode = input.parentElement;
    let bestPriceCount = Number.POSITIVE_INFINITY;
    for (let index = 0; index < 10 && node.parentElement; index += 1) {
      node = node.parentElement;
      const text = node.innerText || '';
      const prices = text.match(/(?:ab\s*)?\d{1,4}[,.]\d{2}\s*€/g) || [];
      if (prices.length && prices.length < bestPriceCount && text.length <= 520) {
        bestNode = node;
        bestPriceCount = prices.length;
      }
      if (prices.length === 1 && text.length <= 360) {
        bestNode = node;
        break;
      }
    }
    const name = label.replace(/\s+zur Einkaufsliste hinzufügen\s*$/i, '').trim();
    const text = bestNode.innerText || '';
    const prices = text.match(/(?:ab\s*)?\d{1,4}[,.]\d{2}\s*€/g) || [];
    const plausiblePrices = prices.filter(candidate => {
      const value = Number((candidate.match(/\d{1,4}[,.]\d{2}/) || ['0'])[0].replace(',', '.'));
      return Number.isFinite(value) && value > 0 && value <= 30;
    });
    const price = plausiblePrices[0] || '';
    const image = bestNode.querySelector('img');
    const imageCandidates = [...(image ? [image.currentSrc, image.getAttribute('src'), image.getAttribute('data-src'), image.getAttribute('data-lazy-src'), image.getAttribute('data-original'), image.getAttribute('srcset')?.split(',')[0]?.trim().split(' ')[0]] : [])].filter(url => /^https?:\/\//i.test(url || '') && !/logo\.svg/i.test(url || ''));
    const imageUrl = imageCandidates[0] || '';
    return { name, price, text, imageUrl };
  }));
  return items.map(item => ({ ...item, validUntil, store: config.store }));
}

async function advanceOfferView(page) {
  const buttons = page.getByRole('button', { name: /mehr angebote|weitere angebote|mehr anzeigen|nächste/i });
  for (let index = 0; index < await buttons.count(); index += 1) {
    const button = buttons.nth(index);
    if (!(await button.isVisible().catch(() => false))) continue;
    if (await button.isDisabled().catch(() => false)) continue;
    const label = stripText(await button.innerText().catch(() => ''));
    if (/prospekt|seite/i.test(label)) continue;
    try {
      await button.click({ timeout: 1_500 });
      await page.waitForTimeout(500);
      return true;
    } catch { /* another visible control may be the correct pagination target */ }
  }
  return false;
}

function cardBelongsToConfig(item, config) {
  if (!config.browserUrl) return true;
  const text = stripText(item.text).toLowerCase();
  const storeTokens = {
    Aldi: ['aldi süd', 'aldi'],
    EDEKA: ['edeka'],
    Lidl: ['lidl'],
    Penny: ['penny'],
    Kaufland: ['kaufland'],
    Netto: ['netto']
  }[config.key] || [String(config.store || '').toLowerCase()];
  return storeTokens.some(token => text.includes(token));
}

async function collectStructuredOffers(page, validUntil, config) {
  const unique = new Map();
  let stablePasses = 0;
  let noCardGrowthPasses = 0;
  const browserScroll = Boolean(config.browserUrl);
  const maxPasses = browserScroll ? 400 : 80;
  const requiredStablePasses = browserScroll ? 20 : 4;
  const maximumNoGrowthPasses = browserScroll ? 24 : 6;
  const targetCardCount = Number(config.expectedOfferCount || 0);
  const addVisibleCards = (items) => {
    for (const item of items) {
      const parsedPrice = priceFrom(item.price);
      const numericPrice = Number(parsedPrice.replace(',', '.').replace(/[^0-9.]/g, ''));
      if (parsedPrice === '–' || !Number.isFinite(numericPrice) || numericPrice > 30 || !likelyFood(item.name)) continue;
      if (!cardBelongsToConfig(item, config)) continue;
      const key = item.name.toLowerCase() + '|' + priceFrom(item.price) + '|' + config.store;
      const previous = unique.get(key);
      if (!previous || (!previous.imageUrl && item.imageUrl)) unique.set(key, item);
    }
  };
  for (let pass = 0; pass < maxPasses; pass += 1) {
    addVisibleCards(await cardOffers(page, validUntil, config));
    const before = unique.size;
    const cardsBeforeScroll = await page.locator('[aria-label*="zur Einkaufsliste hinzufügen"]').count();
    await advanceOfferView(page);
    if (browserScroll) {
      await page.mouse.wheel(0, 500);
    } else {
      await page.evaluate(() => window.scrollBy(0, Math.max(700, window.innerHeight * 0.85)));
    }
    await page.waitForTimeout(browserScroll ? 1_100 : 350);
    addVisibleCards(await cardOffers(page, validUntil, config));
    const loadedCardCount = await page.locator('[aria-label*="zur Einkaufsliste hinzufügen"]').count();
    const atBottom = await page.evaluate(() => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 32);
    if (unique.size === before && atBottom) stablePasses += 1;
    else stablePasses = 0;
    if (loadedCardCount <= cardsBeforeScroll) noCardGrowthPasses += 1;
    else noCardGrowthPasses = 0;
    if (targetCardCount && loadedCardCount >= targetCardCount) break;
    if (targetCardCount && noCardGrowthPasses >= maximumNoGrowthPasses) break;
    if (!targetCardCount && stablePasses >= requiredStablePasses) break;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  return [...unique.values()];
}

async function ocr(file) {
  const outputs = [];
  for (const psm of ['6', '11']) {
    const result = await execFileAsync('tesseract', [file, 'stdout', '-l', 'deu+eng', '--psm', psm], { maxBuffer: 2_000_000 });
    outputs.push(result.stdout || '');
  }
  return outputs.join('\n');
}

function keyedOverrides(raw) {
  const overrides = new Map();
  for (const line of String(raw || '').split(/\r?\n/).map(stripText).filter(Boolean)) {
    const [key, url] = line.split(/\s*\|\s*/, 2);
    if (key && url) overrides.set(key.toLowerCase(), url);
  }
  return overrides;
}

function configuredMarkets() {
  const urlOverrides = keyedOverrides(process.env.KAUFDA_URLS);
  const browserOverrides = keyedOverrides(process.env.KAUFDA_BROWSER_URLS);
  const markets = defaultMarkets.map(config => ({
    ...config,
    url: urlOverrides.get(config.key.toLowerCase()) || config.url,
    browserUrl: browserOverrides.get(config.key.toLowerCase()) || config.browserUrl || ''
  }));
  const selected = String(process.env.KAUFDA_MARKET || 'all').trim().toLowerCase();
  if (!selected || selected === 'all') return markets;
  const filtered = markets.filter(config => config.key.toLowerCase() === selected);
  if (!filtered.length) throw new Error(`Unbekannter KaufDA-Markt: ${process.env.KAUFDA_MARKET}`);
  return filtered;
}

async function readOfferTargetCount(page) {
  const labels = await page.getByRole('button', { name: /^Angebote\b/i }).allInnerTexts().catch(() => []);
  const label = labels.find(value => /Angebote\s*\d+/i.test(value)) || '';
  return Number(label.match(/Angebote\s*(\d+)/i)?.[1] || 0);
}

async function scrapeMarket(page, config) {
  const offers = [];
  const sourceUrl = config.browserUrl || config.url;
  let targetOfferCount = 0;
  await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await page.waitForTimeout(1_500);
  if (config.browserUrl && /\/search(?:\?|$)/i.test(page.url())) {
    targetOfferCount = await readOfferTargetCount(page);
    config.expectedOfferCount = targetOfferCount;
    const offersButton = page.getByRole('button', { name: /^Angebote\b/i }).first();
    if (await offersButton.count()) {
      try { await offersButton.click({ timeout: 8_000 }); await page.waitForTimeout(1_000); } catch { /* search results may already be expanded */ }
    }
  }
  const pageText = await page.locator('body').innerText();
  const validUntil = validUntilFrom(pageText);
  const structuredItems = await collectStructuredOffers(page, validUntil, config);
  const loadedOfferCardCount = await page.locator('[aria-label*="zur Einkaufsliste hinzufügen"]').count();
  const targetReached = !targetOfferCount || loadedOfferCardCount >= targetOfferCount;
  if (config.browserUrl) {
    console.log(`KaufDA: ${config.key} Karten geladen ${loadedOfferCardCount}/${targetOfferCount || 'unbekannt'}${targetReached ? ' (Ziel erreicht)' : ' (Ziel noch nicht erreicht; KaufDA kann weitere Karten nachladen)'}`);
  }
  if (config.browserUrl && structuredItems.length === 0) {
    throw new Error(`${config.key}: konfigurierte Browser-Angebotsseite lieferte keine Angebotskarten`);
  }
  for (const item of structuredItems) {
    if (item.name.length >= 3 && likelyFood(item.name) && priceFrom(item.price) !== '–') offers.push({ name: item.name, store: config.store, price: priceFrom(item.price), saving: '–', icon: '🛒', imageUrl: item.imageUrl || '', category: 'Lebensmittel', packSize: '1 Packung', relevance: 80, note: 'KaufDA-Angebot', validUntil: item.validUntil });
  }

  // Aldi liefert die aktuellen Angebotskarten direkt strukturiert. OCR ist dort
  // nur noch ein Fallback, damit keine langen Vollseitenläufe nötig sind.
  const useOcrFallback = !config.browserUrl && (config.key !== 'Aldi' || structuredItems.length < 10);
  if (!useOcrFallback) {
    const unique = [...new Map(offers.map(offer => [`${offer.name.toLowerCase()}|${offer.price}|${offer.store}`, offer])).values()];
    const result = { market: config.market, store: config.store, location: config.location, sourceUrl, fetchedAt: new Date().toISOString(), validUntil, parser: 'kaufda-offer-cards-v6', recognizedCount: unique.length, targetOfferCount: targetOfferCount || null, loadedOfferCardCount, targetReached, offers: unique };
    await writeFile(resolve(outputDir, config.file), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.log(`KaufDA: ${unique.length} ${config.key}-Angebote aus strukturierten Karten nach ${config.file} geschrieben`);
    return result;
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
  const result = { market: config.market, store: config.store, location: config.location, sourceUrl, fetchedAt: new Date().toISOString(), validUntil, parser: 'kaufda-prospect-images-ocr-v3', recognizedCount: unique.length, targetOfferCount: targetOfferCount || null, loadedOfferCardCount, targetReached, offers: unique };
  await writeFile(resolve(outputDir, config.file), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(`KaufDA: ${unique.length} ${config.key}-Angebote nach ${config.file} geschrieben`);
  return result;
}

async function updatePriceHistory(results) {
  const historyFile = resolve(outputDir, 'price-history.json');
  let previous = { version: 1, generatedAt: null, observations: [] };
  try {
    previous = JSON.parse(await readFile(historyFile, 'utf8'));
  } catch { /* erster Lauf oder Datei noch nicht vorhanden */ }
  const observations = (Array.isArray(previous.observations) ? previous.observations : []).filter(item => likelyFood(item.name));
  const byKey = new Map(observations.map(item => [
    `${item.market}|${String(item.name || '').toLowerCase()}|${item.price}|${item.validUntil}`,
    item
  ]));
  for (const result of results) {
    for (const offer of result.offers || []) {
      const observation = {
        market: result.market,
        store: result.store,
        location: result.location,
        name: offer.name,
        price: offer.price,
        priceValue: Number(String(offer.price || '').replace(',', '.').replace(/[^0-9.]/g, '')) || null,
        validUntil: offer.validUntil,
        imageUrl: offer.imageUrl || '',
        sourceUrl: result.sourceUrl,
        observedAt: result.fetchedAt
      };
      const key = `${observation.market}|${observation.name.toLowerCase()}|${observation.price}|${observation.validUntil}`;
      byKey.set(key, observation);
    }
  }
  const merged = [...byKey.values()]
    .sort((first, second) => String(first.observedAt).localeCompare(String(second.observedAt)))
    .slice(-10000);
  await writeFile(historyFile, `${JSON.stringify({
    version: 1,
    generatedAt: new Date().toISOString(),
    observationCount: merged.length,
    observations: merged
  }, null, 2)}\n`, 'utf8');
  console.log(`KaufDA: Preis-Datenbank mit ${merged.length} Beobachtungen geschrieben`);
}

const storageStateFile = process.env.KAUFDA_STORAGE_STATE_B64 ? resolve(workdir, 'storage-state.json') : null;
if (storageStateFile) await writeFile(storageStateFile, Buffer.from(process.env.KAUFDA_STORAGE_STATE_B64, 'base64'));
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  ...(storageStateFile ? { storageState: storageStateFile } : {}),
  viewport: { width: 1600, height: 2200 },
  locale: 'de-DE'
});
try {
  await mkdir(outputDir, { recursive: true });
  const markets = configuredMarkets();
  const results = (await Promise.all(markets.map(async config => {
    const marketPage = await context.newPage();
    try {
      return await scrapeMarket(marketPage, config);
    } catch (error) {
      console.error(`KaufDA-Fehler ${config.key}: ${error.message}`);
      return null;
    } finally {
      await marketPage.close();
    }
  }))).filter(Boolean);
  if (results.length < markets.length) throw new Error(`Nur ${results.length}/${markets.length} KaufDA-Märkte erfolgreich verarbeitet.`);
  await updatePriceHistory(results);
  console.log(`KaufDA: ${results.reduce((sum, result) => sum + result.recognizedCount, 0)} Angebote aus ${results.length} Märkten erkannt.`);
} finally {
  await context.close(); await browser.close(); await rm(workdir, { recursive: true, force: true });
}

