import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const COMPLETENESS_STATES = Object.freeze({
  COMPLETE: 'complete',
  PARTIAL: 'partial',
  UNKNOWN: 'unknown',
});

function countOrNull(value, { allowZero = false } = {}) {
  if (!Number.isInteger(value) || value < 0 || (!allowZero && value === 0)) return null;
  return value;
}

function sourceText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function completenessReason(expectedOfferCount, loadedOfferCardCount, targetReached, status) {
  if (status === COMPLETENESS_STATES.COMPLETE) {
    return `Der belegte Kartenstand erreicht die explizite Quellen-Sollzahl (${loadedOfferCardCount}/${expectedOfferCount}).`;
  }
  if (status === COMPLETENESS_STATES.PARTIAL) {
    if (loadedOfferCardCount === null) {
      return 'Die Quelle markiert ihr explizites Ziel als nicht erreicht; ein geladener Kartenstand fehlt.';
    }
    return `Der belegte Kartenstand erreicht die explizite Quellen-Sollzahl nicht (${loadedOfferCardCount}/${expectedOfferCount}).`;
  }
  if (expectedOfferCount === null) {
    return 'Keine explizite Soll-Anzahl aus der Angebotsquelle vorhanden. Vollständigkeit bleibt unbekannt.';
  }
  if (targetReached === null && loadedOfferCardCount === null) {
    return 'Die Quelle nennt eine Soll-Anzahl, aber keinen belastbaren Kartenstand. Vollständigkeit bleibt unbekannt.';
  }
  return 'Die Quellenmetadaten reichen für einen belastbaren Vollständigkeitsnachweis nicht aus.';
}

/**
 * Assesses one offer snapshot without treating recognized products as a source total.
 *
 * `targetOfferCount`, `loadedOfferCardCount`, and `targetReached` are copied only when
 * present in the snapshot. A missing target is deliberately represented as null.
 */
export function assessMarketCompleteness(snapshot) {
  const expectedOfferCount = countOrNull(snapshot?.targetOfferCount);
  const loadedOfferCardCount = countOrNull(snapshot?.loadedOfferCardCount, { allowZero: true });
  const recognizedOfferCount = countOrNull(snapshot?.recognizedCount, { allowZero: true })
    ?? (Array.isArray(snapshot?.offers) ? snapshot.offers.length : null);
  const targetReached = typeof snapshot?.targetReached === 'boolean' ? snapshot.targetReached : null;

  let status = COMPLETENESS_STATES.UNKNOWN;
  if (expectedOfferCount !== null && targetReached === false) {
    status = COMPLETENESS_STATES.PARTIAL;
  } else if (
    expectedOfferCount !== null
    && loadedOfferCardCount !== null
    && loadedOfferCardCount >= expectedOfferCount
  ) {
    status = COMPLETENESS_STATES.COMPLETE;
  }

  return {
    market: sourceText(snapshot?.market) || 'Unbekannter Markt',
    store: sourceText(snapshot?.store),
    sourceUrl: sourceText(snapshot?.sourceUrl),
    parser: sourceText(snapshot?.parser),
    fetchedAt: sourceText(snapshot?.fetchedAt),
    validUntil: sourceText(snapshot?.validUntil),
    status,
    reason: completenessReason(expectedOfferCount, loadedOfferCardCount, targetReached, status),
    evidence: {
      expectedOfferCount,
      loadedOfferCardCount,
      recognizedOfferCount,
      targetReached,
    },
  };
}

export function buildMarketCompletenessReport(snapshots) {
  if (!Array.isArray(snapshots)) throw new TypeError('Angebotssnapshots müssen als Array übergeben werden.');

  const markets = snapshots.map(assessMarketCompleteness);
  const summary = Object.values(COMPLETENESS_STATES).reduce((counts, state) => {
    counts[state] = markets.filter(market => market.status === state).length;
    return counts;
  }, {});

  return { version: 1, markets, summary };
}

export async function readOfferSnapshots(directory = resolve('generated')) {
  const directoryPath = directory instanceof URL ? fileURLToPath(directory) : directory;
  const files = (await readdir(directoryPath))
    .filter(file => file.endsWith('-offers.json'))
    .sort();
  return Promise.all(files.map(async file => JSON.parse(await readFile(resolve(directoryPath, file), 'utf8'))));
}

async function main() {
  const directory = resolve(process.env.OFFER_DIRECTORY || 'generated');
  const report = buildMarketCompletenessReport(await readOfferSnapshots(directory));
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

export { COMPLETENESS_STATES };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error?.message || error);
    process.exitCode = 1;
  });
}

