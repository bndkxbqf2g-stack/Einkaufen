import { chromium } from 'playwright';
import { createInterface } from 'node:readline';
import { existsSync } from 'node:fs';

const operaCandidates = [
  process.env.OPERA_PATH,
  `${process.env.LOCALAPPDATA || ''}\\Programs\\Opera\\opera.exe`,
  `${process.env.LOCALAPPDATA || ''}\\Programs\\Opera GX\\opera.exe`,
  `${process.env.ProgramFiles || ''}\\Opera\\opera.exe`,
  `${process.env.ProgramFiles || ''}\\Opera GX\\opera.exe`,
].filter(Boolean);
const operaPath = operaCandidates.find(existsSync);
if (!operaPath) {
  throw new Error(`Opera wurde nicht gefunden. Setze OPERA_PATH auf den Pfad zu opera.exe. Geprüft: ${operaCandidates.join(', ')}`);
}

const browser = await chromium.launch({ headless: false, executablePath: operaPath });
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

