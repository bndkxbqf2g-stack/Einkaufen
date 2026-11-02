import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright';

const execFileAsync = promisify(execFile);
const sourceUrl = process.env.KAUFDA_URL || 'https://www.kaufda.de/Thuengersheim/Netto-Marken-Discount/p-r9';
const output = resolve(process.env.KAUFDA_OUTPUT || 'generated/netto-offers.json');
const workdir = await mkdtemp(resolve(tmpdir(), 'angebotskueche-kaufda-'));
const validUntilFallback = (() => { const date = new Date(); date.setUTCDate(date.getUTCDate() + 7); return `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${date.getUTCFullYear()}`; })();

function stripText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function likelyFood(value) { return !/(rollator|dartscheibe|infrarot|kabine|bagger|werkzeug|garten|bekleidung|schuh|auto|akku|drucker|whisky|vodka|bier|wein|zigarette|tierfutter|katzen|möbel|pavillon|elektronik|spielzeug)/i.test(value); }
function priceFrom(value) { const match = String(value || '').match(/(?:ab\s*)?(\d{1,4}[,.]\d{2})\s*€/); return match ? `${match[1].replace('.', ',')} €` : '–'; }
function validUntilFrom(value) { const match = String(value || '').match(/(?:bis|gültig bis)\s+(\d{1,2})\.(\d{1,2})\.?/i); return match ? `${String(match[1]).padStart(2, '0')}.${String(match[2]).padStart(2, '0')}.${new Date().getUTCFullYear()}` : validUntilFallback; }

function parseOcr(text, validUntil) {
  const lines = String(text || '').split(/\r?\n/).map(stripText).filter(Boolean);
  const offers = [];
  for (let index = 0; index < lines.length; index += 1) {
    const window = [lines[index - 1], lines[index], lines[index + 1]].filter(Boolean).join(' ');
    const match = window.match(/(\d{1,4}[,.]\d{2})\s*€?/);
    if (!match) continue;
    let name = lines[index].replace(/\d{1,4}[,.]\d{2}\s*€?/g, '').replace(/-\s*\d{1,3}\s*%/g, '').trim();
    if (name.length < 3 || /^\d/.test(name)) name = lines[index - 1] || lines[index + 1] || '';
    name = stripText(name);
    if (name.length < 3 || name.length > 100 || !likelyFood(name) || /^(angebot|aktion|uvp|je|ab|gültig)$/i.test(name)) continue;
    offers.push({ name, store: 'Netto Marken-Discount', price: `${match[1].replace('.', ',')} €`, saving: '–', icon: '🛒', category: 'Lebensmittel', packSize: '1 Packung', relevance: 76, note: 'KaufDA-Prospekt · OCR', validUntil });
  }
  return offers;
}

async function cardOffers(page, validUntil) {
  return page.locator('input[aria-label*="zur Einkaufsliste hinzufügen"]').evaluateAll(inputs => inputs.map(input => {
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
  })).then(items => items.map(item => ({ ...item, validUntil })));
}

async function ocr(file) {
  const outputs = [];
  for (const psm of ['6', '11']) {
    const result = await execFileAsync('tesseract', [file, 'stdout', '-l', 'deu+eng', '--psm', psm], { maxBuffer: 2_000_000 });
    outputs.push(result.stdout || '');
  }
  return outputs.join('\n');
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 2200 }, locale: 'de-DE' });
try {
  await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await page.waitForTimeout(1_500);
  const pageText = await page.locator('body').innerText();
  const validUntil = validUntilFrom(pageText);
  const offers = [];
  for (const item of await cardOffers(page, validUntil)) {
    if (item.name.length >= 3 && likelyFood(item.name) && item.price !== '–') offers.push({ name: item.name, store: 'Netto Marken-Discount', price: priceFrom(item.price), saving: '–', icon: '🛒', category: 'Lebensmittel', packSize: '1 Packung', relevance: 80, note: 'KaufDA-Angebot', validUntil: item.validUntil });
  }

  const openButton = page.getByRole('button', { name: /Prospekt öffnen/i }).first();
  if (await openButton.count()) {
    try { await openButton.click({ timeout: 8_000 }); await page.waitForTimeout(1_000); } catch { /* structured offers are still usable */ }
  }
  const viewer = new URL(page.url());
  const viewerId = /\/contentViewer\//i.test(viewer.pathname);
  if (viewerId) {
    for (let brochurePage = 1; brochurePage <= 72; brochurePage += 1) {
      viewer.searchParams.set('page', String(brochurePage));
      try {
        await page.goto(viewer.toString(), { waitUntil: 'domcontentloaded', timeout: 15_000 });
        await page.waitForTimeout(250);
        const file = resolve(workdir, `page-${brochurePage}.png`);
        await page.screenshot({ path: file, fullPage: true });
        offers.push(...parseOcr(await ocr(file), validUntil));
      } catch { /* a page can be unavailable or not part of the brochure */ }
    }
  }

  const unique = [];
  const seen = new Set();
  for (const offer of offers) {
    const key = `${offer.name.toLowerCase()}|${offer.price}|${offer.store}`;
    if (!seen.has(key)) { seen.add(key); unique.push(offer); }
  }
  if (!unique.length) throw new Error('KaufDA wurde geöffnet, aber es wurden keine Lebensmittelangebote erkannt.');
  await mkdir(resolve(output, '..'), { recursive: true });
  await writeFile(output, `${JSON.stringify({ market: 'Netto', store: 'Netto Marken-Discount', location: 'Thüngersheim', sourceUrl, fetchedAt: new Date().toISOString(), validUntil, parser: 'kaufda-dom-ocr-v1', recognizedCount: unique.length, offers: unique }, null, 2)}\n`, 'utf8');
  console.log(`KaufDA: ${unique.length} Netto-Angebote nach ${output} geschrieben`);
} finally {
  await page.close(); await browser.close(); await rm(workdir, { recursive: true, force: true });
}

