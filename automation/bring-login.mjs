import { chromium } from 'playwright';
import { createInterface } from 'node:readline';
import { existsSync } from 'node:fs';

const chromeCandidates = [
  process.env.CHROME_PATH,
  `${process.env.LOCALAPPDATA || ''}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env.ProgramFiles || ''}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env['ProgramFiles(x86)'] || ''}\\Google\\Chrome\\Application\\chrome.exe`,
].filter(Boolean);
const chromePath = chromeCandidates.find(existsSync);
const browser = await chromium.launch(chromePath ? { headless: false, executablePath: chromePath } : { headless: false, channel: 'chrome' });
const context = await browser.newContext({ locale: 'de-DE' });
const page = await context.newPage();
await page.goto('https://web.getbring.com/', { waitUntil: 'domcontentloaded' });
console.log('Im geöffneten Browser bei Bring anmelden und danach hier die Eingabetaste drücken.');
const input = createInterface({ input: process.stdin, output: process.stdout });
await new Promise(resolve => input.question('', resolve));
input.close();
await context.storageState({ path: 'bring-storage-state.json' });
await browser.close();
console.log('bring-storage-state.json wurde erstellt. Diese Datei niemals committen oder öffentlich teilen.');

