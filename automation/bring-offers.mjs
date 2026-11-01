import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { chromium } from 'playwright';

const execFileAsync = promisify(execFile);
const locationName = process.env.BRING_LOCATION || 'Zellingen';
const sharedUrls = String(process.env.BRING_BROCHURE_URLS || '').split(/\r?\n/).map(value => value.trim()).filter(Boolean);
const storageState = String(process.env.BRING_STORAGE_STATE_B64 || '').trim();
const output = resolve(process.env.BRING_OUTPUT || 'generated/bring-offers.json');
const allowedPageHosts = new Set(['web.getbring.com', 'enjoy.getbring.com', 'deeplink.getbring.com']);
const allowedImageHosts = /(^|\.)bringapi\.app$|(^|\.)getbring\.com$/i;
const knownStores = ['Aldi', 'Kaufland', 'EDEKA', 'Lidl', 'Penny', 'Netto', 'Marktkauf'];

function assertAllowedPageUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !allowedPageHosts.has(url.hostname.toLowerCase())) throw new Error(`Nicht erlaubte Bring-URL: ${url.hostname}`);
  return url.toString();
}

function stripText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }

function detectStore(value) {
  const text = String(value || '');
  return knownStores.find(store => new RegExp(`\\b${store.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) || 'Bring';
}

function likelyFood(value) {
  return !/(wc|toilet|spül|wasch|shampoo|kosmetik|werkzeug|garten|bekleidung|schuh|auto|akku|drucker|whisky|vodka|bier|wein|zigarette|tierfutter|bettwäsche|badematte|teppich|polster|led|panel|damen|herren|kinder)/i.test(value);
}

function validUntilFromText(text) {
  const match = String(text || '').match(/(?:gültig|gültigkeit)[^\d]{0,20}(\d{1,2})\.(\d{1,2})\.?\s*(?:bis|–|-)\s*(\d{1,2})\.(\d{1,2})\.?/i);
  if (match) return `${String(match[3]).padStart(2, '0')}.${String(match[4]).padStart(2, '0')}.${new Date().getUTCFullYear()}`;
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 7);
  return `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${date.getUTCFullYear()}`;
}

function parseOcrOffers(text, store, validUntil) {
  const lines = String(text || '').split(/\r?\n/).map(stripText).filter(Boolean);
  const offers = [];
  const seen = new Set();
  for (let index = 0; index < lines.length; index += 1) {
    const window = [lines[index - 1], lines[index], lines[index + 1]].filter(Boolean).join(' ');
    const prices = [...window.matchAll(/(\d+[,.]\d{2})\s*€?/g)];
    if (!prices.length) continue;
    const price = `${prices[0][1].replace('.', ',')} €`;
    let name = lines[index].replace(/\d+[,.]\d{2}\s*€?/g, ' ').replace(/-\s*\d{1,3}\s*%/g, ' ').replace(/\s+/g, ' ').trim();
    if (/^\d+[,.]\d{2}/.test(name) || name.length < 3) name = lines[index - 1] || lines[index + 1] || '';
    name = name.replace(/\d+[,.]\d{2}\s*€?/g, ' ').replace(/\s+/g, ' ').trim();
    if (name.length < 3 || name.length > 100 || !likelyFood(name) || /^(angebot|aktion|app-preis|uvp|je|ab)$/i.test(name)) continue;
    const key = `${name.toLowerCase()}|${price}|${store}`;
    if (seen.has(key)) continue;
    seen.add(key);
    offers.push({ name, store, price, saving: '–', icon: '🛒', category: 'Lebensmittel', packSize: '1 Packung', relevance: 78, note: 'Bring-Prospekt · OCR', validUntil });
  }
  return offers.slice(0, 120);
}

async function decodeStorageState(directory) {
  if (!storageState) return undefined;
  let json;
  try { json = Buffer.from(storageState, 'base64').toString('utf8'); JSON.parse(json); } catch { throw new Error('BRING_STORAGE_STATE_B64 ist kein gültiger Base64-Playwright-Storage-State.'); }
  const file = resolve(directory, 'bring-storage-state.json');
  await writeFile(file, json, 'utf8');
  return file;
}

async function tryChooseLocation(page) {
  const inputs = await page.locator('input').all();
  for (const input of inputs) {
    const metadata = `${await input.getAttribute('placeholder')} ${await input.getAttribute('aria-label')} ${await input.getAttribute('name')}`;
    if (!/(ort|stadt|standort|location|plz|post)/i.test(metadata)) continue;
    try { await input.fill(locationName, { timeoutMs: 2500 }); await input.press('Enter', { timeoutMs: 2500 }); await page.waitForTimeout(800); return true; } catch { /* UI may render it later */ }
  }
  return false;
}

async function collectPageAssets(page) {
  const imageUrls = await page.locator('img').evaluateAll(images => images.flatMap(image => [image.currentSrc, image.src, image.getAttribute('data-src'), image.getAttribute('data-original')]).filter(Boolean));
  const links = await page.locator('a').evaluateAll(anchors => anchors.map(anchor => anchor.href).filter(Boolean));
  return { imageUrls: [...new Set(imageUrls)], links: [...new Set(links)], bodyText: await page.locator('body').innerText() };
}

async function downloadImage(url, file) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || !allowedImageHosts.test(parsed.hostname)) return false;
  const response = await fetch(parsed, { headers: { accept: 'image/*' } });
  if (!response.ok || !String(response.headers.get('content-type') || '').startsWith('image/')) return false;
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length || buffer.length > 8_000_000) return false;
  await writeFile(file, buffer);
  return true;
}

async function ocr(file) {
  const result = await execFileAsync('tesseract', [file, 'stdout', '-l', 'deu+eng', '--psm', '6'], { maxBuffer: 2_000_000 });
  return result.stdout || '';
}

async function main() {
  if (!storageState && !sharedUrls.length) throw new Error('Bring ist noch nicht eingerichtet: BRING_STORAGE_STATE_B64 oder BRING_BROCHURE_URLS fehlt.');
  const workdir = await mkdtemp(resolve(tmpdir(), 'angebotskueche-bring-'));
  const stateFile = await decodeStorageState(workdir);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: stateFile, locale: 'de-DE', userAgent: 'Angebotskueche Bring importer/1.0' });
  const page = await context.newPage();
  const discoveredImages = new Set();
  const sourceUrls = [];
  const texts = [];
  try {
    if (sharedUrls.length) {
      for (const value of sharedUrls.map(assertAllowedPageUrl)) {
        await page.goto(value, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        await page.waitForTimeout(1_500);
        const assets = await collectPageAssets(page);
        assets.imageUrls.forEach(url => discoveredImages.add(url)); texts.push(assets.bodyText); sourceUrls.push(value);
      }
    } else {
      await page.goto('https://web.getbring.com/', { waitUntil: 'domcontentloaded', timeout: 45_000 });
      await page.waitForTimeout(1_500);
      await tryChooseLocation(page);
      const offersText = page.getByText(/Angebote|Prospekte/i).first();
      if (await offersText.count()) { try { await offersText.click({ timeoutMs: 5000 }); await page.waitForTimeout(1_500); } catch { /* current view may already be offers */ } }
      const assets = await collectPageAssets(page);
      assets.imageUrls.forEach(url => discoveredImages.add(url)); texts.push(assets.bodyText); sourceUrls.push(page.url());
      for (const link of assets.links.filter(link => /\/view\/offers\//i.test(link)).slice(0, 30)) {
        try {
          await page.goto(assertAllowedPageUrl(link), { waitUntil: 'domcontentloaded', timeout: 45_000 });
          await page.waitForTimeout(900);
          const detailAssets = await collectPageAssets(page);
          detailAssets.imageUrls.forEach(url => discoveredImages.add(url)); texts.push(detailAssets.bodyText); sourceUrls.push(link);
        } catch { /* keep other brochures */ }
      }
    }
    const allText = texts.join('\n');
    const defaultStore = detectStore(allText);
    const validUntil = validUntilFromText(allText);
    const offers = [];
    let imageIndex = 0;
    for (const imageUrl of discoveredImages) {
      const imageFile = resolve(workdir, `brochure-${imageIndex += 1}.jpg`);
      if (!await downloadImage(imageUrl, imageFile)) continue;
      offers.push(...parseOcrOffers(await ocr(imageFile), detectStore(`${defaultStore} ${imageUrl}`), validUntil));
    }
    const unique = [];
    const seen = new Set();
    for (const offer of offers) { const key = `${offer.name.toLowerCase()}|${offer.store}|${offer.price}`; if (!seen.has(key)) { seen.add(key); unique.push(offer); } }
    if (!unique.length) throw new Error('Bring wurde geöffnet, aber es wurden keine sicheren Lebensmittelangebote per OCR erkannt.');
    await mkdir(resolve(output, '..'), { recursive: true });
    await writeFile(output, `${JSON.stringify({ market: 'Bring', store: 'Bring', location: locationName, sourceUrl: sourceUrls[0] || 'https://web.getbring.com/', fetchedAt: new Date().toISOString(), validUntil, parser: 'bring-playwright-ocr-v1', recognizedCount: unique.length, offers: unique }, null, 2)}\n`, 'utf8');
    console.log(`Bring: ${unique.length} Angebote nach ${output} geschrieben`);
  } finally {
    await context.close(); await browser.close(); await rm(workdir, { recursive: true, force: true });
  }
}

main().catch(error => { console.error(error?.message || error); process.exitCode = 1; });

