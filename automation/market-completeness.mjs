import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const LOAD_STATES = Object.freeze({
  TARGET_REACHED: 'target_reached',
  TARGET_NOT_REACHED: 'target_not_reached',
  UNKNOWN: 'unknown',
});

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

function safeSourceLocation(value) {
  const text = sourceText(value);
  if (!text) return null;
  try {
    const url = new URL(text);
    return `${url.origin}${url.pathname}`;
  } catch {
    return text.split(/[?#]/, 1)[0] || null;
  }
}

function loadReason(status, targetOfferCount, loadedOfferCardCount) {
  if (status === LOAD_STATES.TARGET_REACHED) {
    const count = loadedOfferCardCount === null
      ? 'von der Quelle als erreicht gemeldet'
      : `${loadedOfferCardCount}/${targetOfferCount}`;
    return `Das explizite Ladeziel der Quelle wurde erreicht (${count}); dies belegt keine Markt- oder Prospektvollständigkeit.`;
  }
  if (status === LOAD_STATES.TARGET_NOT_REACHED) {
    const count = loadedOfferCardCount === null
      ? 'von der Quelle als nicht erreicht gemeldet'
      : `${loadedOfferCardCount}/${targetOfferCount}`;
    return `Das explizite Ladeziel der Quelle wurde nicht erreicht (${count}).`;
  }
  return 'Die Quelle liefert kein belastbares explizites Ladeziel.';
}

function completenessReason(status, expectedTotalOfferCount, observedTotalOfferCount) {
  if (status === COMPLETENESS_STATES.COMPLETE) {
    return `Die ausdrücklich belegte Soll-Gesamtzahl des Prospekts/Marktes ist erreicht (${observedTotalOfferCount}/${expectedTotalOfferCount}).`;
  }
  if (status === COMPLETENESS_STATES.PARTIAL) {
    return `Die ausdrücklich belegte Soll-Gesamtzahl des Prospekts/Marktes ist nicht erreicht (${observedTotalOfferCount}/${expectedTotalOfferCount}).`;
  }
  return 'Keine ausdrücklich belegte Soll-Gesamtzahl des Prospekts/Marktes vorhanden; Gesamtvollständigkeit bleibt unbekannt.';
}

function assessLoadEvidence(snapshot) {
  const targetOfferCount = countOrNull(snapshot?.targetOfferCount);
  const loadedOfferCardCount = countOrNull(snapshot?.loadedOfferCardCount, { allowZero: true });
  const targetReached = typeof snapshot?.targetReached === 'boolean' ? snapshot.targetReached : null;

  let status = LOAD_STATES.UNKNOWN;
  if (targetOfferCount !== null && targetReached === false) {
    status = LOAD_STATES.TARGET_NOT_REACHED;
  } else if (
    targetOfferCount !== null
    && loadedOfferCardCount !== null
    && loadedOfferCardCount < targetOfferCount
  ) {
    status = LOAD_STATES.TARGET_NOT_REACHED;
  } else if (
    targetOfferCount !== null
    && (targetReached === true || (loadedOfferCardCount !== null && loadedOfferCardCount >= targetOfferCount))
  ) {
    status = LOAD_STATES.TARGET_REACHED;
  }

  return {
    status,
    targetOfferCount,
    loadedOfferCardCount,
    targetReached,
    reason: loadReason(status, targetOfferCount, loadedOfferCardCount),
  };
}

function assessProspectCompleteness(snapshot) {
  // These fields are intentionally separate from KaufDA's lazy-load metadata.
  // They may only be populated when the source explicitly states both counts.
  const expectedTotalOfferCount = countOrNull(snapshot?.sourceExpectedTotalCount);
  const observedTotalOfferCount = countOrNull(snapshot?.sourceObservedTotalCount, { allowZero: true });

  let status = COMPLETENESS_STATES.UNKNOWN;
  if (expectedTotalOfferCount !== null && observedTotalOfferCount !== null) {
    status = observedTotalOfferCount >= expectedTotalOfferCount
      ? COMPLETENESS_STATES.COMPLETE
      : COMPLETENESS_STATES.PARTIAL;
  }

  return {
    status,
    expectedTotalOfferCount,
    observedTotalOfferCount,
    reason: completenessReason(status, expectedTotalOfferCount, observedTotalOfferCount),
  };
}

/**
 * Reports source-load evidence separately from prospect/market completeness.
 *
 * KaufDA's `targetOfferCount`, `loadedOfferCardCount`, and `targetReached` only
 * describe a lazy-load target. They never establish a prospect total. A market
 * can become complete only when the snapshot contains explicit source-scoped
 * `sourceExpectedTotalCount` and `sourceObservedTotalCount` metadata.
 */
export function assessMarketCompleteness(snapshot) {
  const recognizedOfferCount = countOrNull(snapshot?.recognizedCount, { allowZero: true })
    ?? (Array.isArray(snapshot?.offers) ? snapshot.offers.length : null);

  return {
    market: sourceText(snapshot?.market) || 'Unbekannter Markt',
    store: sourceText(snapshot?.store),
    sourceUrl: safeSourceLocation(snapshot?.sourceUrl),
    parser: sourceText(snapshot?.parser),
    fetchedAt: sourceText(snapshot?.fetchedAt),
    validUntil: sourceText(snapshot?.validUntil),
    recognizedOfferCount,
    loadEvidence: assessLoadEvidence(snapshot),
    completeness: assessProspectCompleteness(snapshot),
  };
}

function countStates(items, states) {
  return Object.values(states).reduce((counts, state) => {
    counts[state] = items.filter(item => item.status === state).length;
    return counts;
  }, {});
}

export function buildMarketCompletenessReport(snapshots) {
  if (!Array.isArray(snapshots)) throw new TypeError('Angebotssnapshots müssen als Array übergeben werden.');

  const markets = snapshots.map(assessMarketCompleteness);
  return {
    version: 2,
    markets,
    summary: {
      load: countStates(markets.map(market => market.loadEvidence), LOAD_STATES),
      completeness: countStates(markets.map(market => market.completeness), COMPLETENESS_STATES),
    },
  };
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

export { COMPLETENESS_STATES, LOAD_STATES };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error?.message || error);
    process.exitCode = 1;
  });
}

