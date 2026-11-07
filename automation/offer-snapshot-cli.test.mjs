import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const { stdout } = await run(
  process.execPath,
  ['automation/offer-snapshot.mjs', 'generated/aldi-offers.json'],
  { encoding: 'utf8' }
);

assert.match(stdout, /generated\/aldi-offers\.json: \d+ gültige Angebote bis /);
console.log('Offer snapshot CLI checks passed');
