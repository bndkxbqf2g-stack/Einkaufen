import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = name => readFile(resolve(root, name), 'utf8');
const [template, page, manifest, serviceWorker, supabaseSync] = await Promise.all([
  read('worker/index.js'),
  read('dist/index.html'),
  read('dist/manifest.json'),
  read('dist/sw.js'),
  read('dist/supabase-sync.js'),
]);
const replacements = { __PAGE__: JSON.stringify(page), __MANIFEST__: JSON.stringify(manifest), __SERVICE_WORKER__: JSON.stringify(serviceWorker), __SUPABASE_SYNC__: JSON.stringify(supabaseSync) };
let output = template;
for (const [placeholder, value] of Object.entries(replacements)) output = output.replace(placeholder, () => value);
if (Object.keys(replacements).some(placeholder => output.includes(placeholder))) throw new Error('Worker placeholders were not replaced');
const workerPath = resolve(root, 'dist/server/index.js');
await mkdir(dirname(workerPath), { recursive: true });
await writeFile(workerPath, output, 'utf8');
await mkdir(resolve(root, 'dist/.openai'), { recursive: true });
await copyFile(resolve(root, '.openai/hosting.json'), resolve(root, 'dist/.openai/hosting.json'));
console.log(`Built ${workerPath}`);
