import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflowRoot = new URL('../.github/workflows/', import.meta.url);
const readWorkflow = name => readFile(new URL(name, workflowRoot), 'utf8');

const pages = await readWorkflow('github-pages.yml');
assert.match(pages, /permissions:\r?\n  contents: read/);
assert.match(pages, /deploy:\r?\n    if: github\.event_name != 'pull_request'/);
const deployStart = pages.indexOf('\n  deploy:');
assert.ok(deployStart >= 0, 'Pages-Deploy-Job muss vorhanden sein');
const deploy = pages.slice(deployStart);
assert.match(deploy, /permissions:\r?\n      contents: read\r?\n      pages: write\r?\n      id-token: write/);
assert.doesNotMatch(pages.slice(0, deployStart), /pages: write|id-token: write/);

for (const name of ['kaufda-offers.yml', 'lidl-offers.yml', 'retailer-offers.yml']) {
  const source = await readWorkflow(name);
  assert.doesNotMatch(source, /^\s+pull_request:/m, name + ' darf nicht auf Pull Requests laufen');
  assert.match(source, /permissions:\r?\n  contents: write/, name + ' muss sein erwartetes Schreibrecht explizit nennen');
}

const rootSync = await readWorkflow('sync-pages-root.yml');
assert.doesNotMatch(rootSync, /^\s+pull_request:/m);
assert.match(rootSync, /permissions:\r?\n  contents: write/);

console.log('Workflow security boundary checks passed');
