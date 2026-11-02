import { firefox } from 'playwright';
import { createInterface } from 'node:readline';
import { existsSync } from 'node:fs';

const firefoxCandidates = [
  process.env.FIREFOX_PATH,
  `${process.env.ProgramFiles || ''}\\Mozilla Firefox\\firefox.exe`,
  `${process.env['ProgramFiles(x86)'] || ''}\\Mozilla Firefox\\firefox.exe`,
  `${process.env.LOCALAPPDATA || ''}\\Mozilla Firefox\\firefox.exe`,
].filter(Boolean);
const firefoxPath = firefoxCandidates.find(existsSync);
const browser = await firefox.launch(firefoxPath ? { headless: false, executablePath: firefoxPath } : { headless: false });
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

