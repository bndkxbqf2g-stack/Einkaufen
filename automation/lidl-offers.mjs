import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { chromium } from 'playwright';
import { extractValidUntil, parseLidlOfferText } from './lidl-parser.mjs';

const PROSPECT_URL = 'https://www.lidl.de/c/online-prospekte/s10005610/';
const STORE_URL = 'https://www.lidl.de/s/de-DE/filialen/zellingen/am-guessgraben-2/';
const OUTPUT = resolve(process.env.LIDL_OUTPUT || 'generated/lidl-offers.json');
const execFileAsync = promisify(execFile);

async function chooseZellingen(page) {
  const trigger = page.locator('button, a, [role="button"]').filter({ hasText: /wähle deine filiale|filiale wählen|meine filiale/i }).first();
  if (await trigger.count()) await trigger.click().catch(() => {});
  await page.waitForTimeout(600);
  const inputs = page.locator('input');
  for (let index = 0; index < await inputs.count(); index += 1) {
    const input = inputs.nth(index);
    const hint = `${await input.getAttribute('placeholder').catch(() => '')} ${await input.getAttribute('aria-label').catch(() => '')}`;
    if (/plz|ort|filiale|adresse|suche/i.test(hint)) {
      await input.fill('Zellingen').catch(() => {});
      await input.press('Enter').catch(() => {});
      break;
    }
  }
  const zellingen = page.getByText(/Zellingen|Am Güßgraben/i).first();
  if (await zellingen.count()) await zellingen.click().catch(() => {});
  await page.waitForTimeout(800);
}

async function ocrProspectPages(page, viewerUrl, tempDir) {
  const maxPages = Math.max(1, Math.min(76, Number(process.env.LIDL_MAX_PAGES || 20)));
  const pageTexts = [];
  const seenImages = new Set();
  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const url = new URL(viewerUrl);
    url.pathname = url.pathname.replace(/\/page\/\d+\/?$/, `/page/${pageNumber}`);
    await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(350);
    const images = await page.locator('img[alt^="Seite "]').evaluateAll(nodes => nodes.map(node => ({ alt: node.alt, src: node.currentSrc || node.src })));
    const target = images.find(image => new RegExp(`^Seite ${pageNumber}\\b`).test(image.alt)) || images[0];
    if (!target?.src || seenImages.has(target.src)) continue;
    seenImages.add(target.src);
    const response = await fetch(target.src, { headers: { 'user-agent': 'Angebotsküche Lidl workflow' } });
    if (!response.ok) continue;
    const imagePath = join(tempDir, `page-${String(pageNumber).padStart(2, '0')}.jpg`);
    await writeFile(imagePath, Buffer.from(await response.arrayBuffer()));
    try {
      const result = await execFileAsync('tesseract', [imagePath, 'stdout', '-l', 'deu', '--psm', '11'], { maxBuffer: 2 * 1024 * 1024 });
      pageTexts.push(result.stdout || '');
    } catch (error) {
      if (!/ENOENT/i.test(error?.code || '')) throw error;
    }
  }
  return pageTexts.join('\n');
}

async function main() {
  const pdfBodies = [];
  const tempDir = await mkdtemp(join(tmpdir(), 'lidl-offers-'));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ locale: 'de-DE' });
    page.on('response', async response => {
      try {
        if (/application\/pdf/i.test(response.headers()['content-type'] || '') && response.ok()) pdfBodies.push(await response.body());
      } catch {}
    });
    await page.goto(STORE_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await chooseZellingen(page);
    await page.goto(PROSPECT_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await chooseZellingen(page);
    await page.waitForTimeout(2_000);
    const links = await page.locator('a').evaluateAll(anchors => anchors.map(anchor => ({ text: anchor.textContent?.replace(/\s+/g, ' ').trim() || '', href: anchor.href })).filter(item => item.href));
    const prospect = links.find(item => /aktionsprospekt/i.test(item.text) && /^https:\/\//i.test(item.href));
    if (prospect) await page.goto(prospect.href, { waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(2_000);
    let text = await page.locator('body').innerText().catch(() => '');
    const viewerUrl = page.url();
    const ocrText = /\/view\/flyer\/page\//i.test(viewerUrl) ? await ocrProspectPages(page, viewerUrl, tempDir) : '';
    text += `\n${ocrText}`;
    if (pdfBodies.length) {
      const pdfModule = await import('pdf-parse');
      const pdfParse = pdfModule.default || pdfModule;
      text += `\n${(await pdfParse(pdfBodies.at(-1))).text}`;
    }
    const offers = parseLidlOfferText(text, { validUntil: extractValidUntil(`${prospect?.text || ''} ${await page.title()}`) });
    if (!offers.length) throw new Error('Keine Lebensmittelangebote im Lidl-Prospekt erkannt.');
    await mkdir(dirname(OUTPUT), { recursive: true });
    await writeFile(OUTPUT, `${JSON.stringify({ market: 'Lidl', sourceUrl: prospect?.href || PROSPECT_URL, store: 'Zellingen', fetchedAt: new Date().toISOString(), validUntil: offers[0].validUntil, parser: 'lidl-playwright-v1', offers }, null, 2)}\n`, 'utf8');
    console.log(`Lidl-Angebote geschrieben: ${offers.length}`);
  } finally {
    await browser.close();
    await rm(tempDir, { recursive: true, force: true });
  }
}

main().catch(error => { console.error(error?.message || error); process.exitCode = 1; });
