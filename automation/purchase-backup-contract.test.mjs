import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('keeps purchase history in local backups but excludes it from cloud payloads', () => {
  assert.match(source, /purchaseRecords = window\.AngebotskuechePurchaseRecordStore\?\.load/);
  assert.match(source, /buildPayload: \(\) => buildUserDataPayload\(\{ includePurchaseRecords: false \}\)/);
  assert.match(source, /angebotskueche\.purchaseRecords/);
  assert.match(source, /localBackupArrayKeys/);
});
