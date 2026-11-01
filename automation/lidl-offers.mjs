import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';
import { extractValidUntil, parseLidlOfferText } from './lidl-parser.mjs';

const PROSPECT_URL = 'https://www.lidl.de/c/online-prospekte/s10005610/';
const STORE_URL = 'https://www.lidl.de/s/de-DE/filialen/zellingen/am-guessgraben-2/';
const OUTPUT = resolve(process.env.LIDL_OUTPUT || 'generated/lidl-offers.json');

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

async function main() {
  const pdfBodies = [];
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
    if (pdfBodies.length) {
      const pdfModule = await import('pdf-parse');
      const pdfParse = pdfModule.default || pdfModule;
      text += `\n${(await pdfParse(pdfBodies.at(-1))).text}`;
    }
    const offers = parseLidlOfferText(text, { validUntil: extractValidUntil(text) });
    if (!offers.length) throw new Error('Keine Lebensmittelangebote im Lidl-Prospekt erkannt.');
    await mkdir(dirname(OUTPUT), { recursive: true });
    await writeFile(OUTPUT, `${JSON.stringify({ market: 'Lidl', sourceUrl: prospect?.href || PROSPECT_URL, store: 'Zellingen', fetchedAt: new Date().toISOString(), validUntil: offers[0].validUntil, parser: 'lidl-playwright-v1', offers }, null, 2)}\n`, 'utf8');
    console.log(`Lidl-Angebote geschrieben: ${offers.length}`);
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error?.message || error); process.exitCode = 1; });
