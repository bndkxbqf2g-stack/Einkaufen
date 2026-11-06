import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';

const requiredTextFields = ['market', 'sourceUrl', 'fetchedAt', 'validUntil', 'parser'];

export function validateOfferSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new Error('Angebotssnapshot muss ein Objekt sein.');
  }

  for (const field of requiredTextFields) {
    if (typeof snapshot[field] !== 'string' || !snapshot[field].trim()) {
      throw new Error(`Angebotssnapshot ohne gültiges Feld "${field}".`);
    }
  }

  if (!Array.isArray(snapshot.offers) || snapshot.offers.length === 0) {
    throw new Error('Leerer Angebotssnapshot wird nicht veröffentlicht.');
  }

  if (snapshot.recognizedCount !== undefined && snapshot.recognizedCount !== snapshot.offers.length) {
    throw new Error('Angebotssnapshot: recognizedCount stimmt nicht mit offers.length überein.');
  }

  snapshot.offers.forEach((offer, index) => {
    if (!offer || typeof offer !== 'object' || Array.isArray(offer)) {
      throw new Error(`Angebotssnapshot: Angebot ${index + 1} ist ungültig.`);
    }
    for (const field of ['name', 'price', 'validUntil']) {
      if (typeof offer[field] !== 'string' || !offer[field].trim()) {
        throw new Error(`Angebotssnapshot: Angebot ${index + 1} hat kein gültiges Feld "${field}".`);
      }
    }
  });

  return snapshot;
}

export async function writeOfferSnapshot(filePath, snapshot) {
  validateOfferSnapshot(snapshot);

  const target = resolve(filePath);
  const temporary = resolve(dirname(target), `.${basename(target)}.${randomUUID()}.tmp`);
  await mkdir(dirname(target), { recursive: true });

  try {
    await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, target);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => {});
    throw error;
  }

  return target;
}
