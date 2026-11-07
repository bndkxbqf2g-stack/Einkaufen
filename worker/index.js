const page = __PAGE__;
const manifest = __MANIFEST__;
const serviceWorker = __SERVICE_WORKER__;
const supabaseSync = __SUPABASE_SYNC__;

const MAX_RECIPE_BYTES = 1_500_000;
// Plattformoffener Import: nur bekannte Rezeptseiten werden serverseitig gelesen.
// Das verhindert, dass der Parser zu einem offenen URL-Proxy wird.
const RECIPE_HOSTS = ['lecker.de', 'chefkoch.de', 'gaumenfreundin.de', 'eat.de', 'essen-und-trinken.de', 'kitchenstories.com', 'springlane.de', 'einfachbacken.de', 'kochkarussell.com', 'familienkost.de', 'rewe.de', 'edeka.de'];
const MAX_OFFER_BYTES = 2_500_000;
const MAX_SYNC_BYTES = 600_000;
const OFFER_SOURCES = {
  Aldi: { url: 'https://www.aldi-sued.de/angebote', host: 'aldi-sued.de', parser: 'aldi-sued-offers-v1' },
  Kaufland: { url: 'https://filiale.kaufland.de/angebote.html', host: 'kaufland.de', parser: 'kaufland-offers-v1' },
  EDEKA: { url: 'https://www.edeka.de/angebote/', host: 'edeka.de', parser: 'edeka-offers-v1' },
  Lidl: { url: 'https://raw.githubusercontent.com/bndkxbqf2g-stack/Einkaufen/main/generated/lidl-offers.json', host: 'raw.githubusercontent.com', parser: 'lidl-github-offers-v1' },
  Netto: { url: 'https://www.netto-online.de/angebote/c-N07', host: 'netto-online.de', parser: 'netto-offers-v1' },
};

function json(data, status = 200, request) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'content-type',
  });
  const origin = request?.headers.get('Origin');
  if (origin) {
    headers.set('access-control-allow-origin', origin);
    headers.set('vary', 'Origin');
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function syncUserId(request) {
  return String(request.headers.get('oai-authenticated-user-id') || '').trim();
}

function validSyncPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || payload.version !== 1) return false;
  const arrays = ['pantry', 'favorites', 'dismissedRecipes', 'pinnedRecipes', 'customOffers', 'manualShoppingItems'];
  const objects = ['settings', 'shoppingChecks', 'liveOfferStatus', 'manualPlan', 'recipeRatings', 'suggestionPreferences'];
  if (arrays.some(key => payload[key] !== undefined && (!Array.isArray(payload[key]) || payload[key].length > 5000))) return false;
  if (objects.some(key => payload[key] !== undefined && (!payload[key] || typeof payload[key] !== 'object' || Array.isArray(payload[key])))) return false;
  return true;
}

async function syncCloud(request, env) {
  const userId = syncUserId(request);
  if (!userId) return json({ error: 'Cloud-Synchronisierung ist nur für angemeldete Nutzer verfügbar.' }, 401, request);
  if (!env?.DB) return json({ error: 'Cloud-Synchronisierung ist für diese Veröffentlichung nicht verfügbar.' }, 503, request);
  try {
    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT payload, updated_at FROM user_state WHERE user_id = ?1').bind(userId).first();
      if (!row) return json({ payload: null, updatedAt: null }, 200, request);
      const payload = JSON.parse(row.payload);
      return validSyncPayload(payload) ? json({ payload, updatedAt: row.updated_at }, 200, request) : json({ error: 'Der gespeicherte Cloud-Stand ist ungültig.' }, 500, request);
    }
    if (request.method !== 'PUT') return json({ error: 'Methode nicht unterstützt.' }, 405, request);
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_SYNC_BYTES) return json({ error: 'Der Cloud-Stand ist zu groß.' }, 413, request);
    const parsed = JSON.parse(body);
    const payload = parsed?.payload;
    if (!validSyncPayload(payload)) return json({ error: 'Ungültiger Cloud-Stand.' }, 400, request);
    const updatedAt = new Date().toISOString();
    await env.DB.prepare('INSERT INTO user_state (user_id, payload, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at').bind(userId, JSON.stringify(payload), updatedAt).run();
    return json({ ok: true, updatedAt }, 200, request);
  } catch (error) {
    return json({ error: error instanceof SyntaxError ? 'Ungültiges Cloud-Format.' : 'Cloud-Synchronisierung momentan nicht verfügbar.' }, error instanceof SyntaxError ? 400 : 503, request);
  }
}

function recipeUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    const allowed = url.protocol === 'https:' && !url.username && !url.password && !url.port && RECIPE_HOSTS.some(domain => host === domain || host.endsWith(`.${domain}`));
    return allowed ? url : null;
  } catch {
    return null;
  }
}

function isRecipeType(value) {
  return value === 'Recipe' || (Array.isArray(value) && value.includes('Recipe'));
}

function hasUsableRecipeData(value) {
  return isRecipeType(value['@type'])
    && typeof value.name === 'string'
    && value.name.trim()
    && Array.isArray(value.recipeIngredient)
    && value.recipeIngredient.some(item => typeof item === 'string' && item.trim());
}

function findRecipe(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const recipe = findRecipe(item);
      if (recipe) return recipe;
    }
    return null;
  }
  if (typeof value !== 'object') return null;
  if (hasUsableRecipeData(value)) return value;
  if (Array.isArray(value['@graph'])) return findRecipe(value['@graph']);
  if (value.mainEntity) return findRecipe(value.mainEntity);
  return null;
}

function parseAggregateRating(value) {
  const rating = Array.isArray(value) ? value.find(item => item && typeof item === 'object') : value;
  if (!rating) return null;
  const rawValue = Number(String(rating.ratingValue ?? '').replace(',', '.'));
  const best = Number(String(rating.bestRating ?? 5).replace(',', '.')) || 5;
  if (!Number.isFinite(rawValue) || rawValue <= 0 || best <= 0) return null;
  const normalized = Math.max(0, Math.min(5, rawValue / best * 5));
  const rawCount = Number(String(rating.ratingCount ?? rating.reviewCount ?? 0).replace(/[^0-9.,]/g, '').replace(',', '.'));
  return { value: Math.round(normalized * 10) / 10, count: Number.isFinite(rawCount) ? Math.max(0, Math.round(rawCount)) : 0 };
}

function parseRecipeJsonLd(html) {
  const blocks = [];
  const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html))) blocks.push(match[1].trim().replace(/^\uFEFF/, ''));
  for (const block of blocks) {
    try {
      const recipe = findRecipe(JSON.parse(block));
      if (!recipe) continue;
      const ingredients = recipe.recipeIngredient
        .filter(item => typeof item === 'string')
        .map(item => item.trim())
        .filter(Boolean)
        .slice(0, 120);
      const name = String(recipe.name || '').trim();
      if (name && ingredients.length) {
        const aggregateRating = parseAggregateRating(recipe.aggregateRating);
        return { name, ingredients, instructions: Array.isArray(recipe.recipeInstructions) ? recipe.recipeInstructions.map(item => typeof item === 'string' ? item : item?.text || '').filter(Boolean).join(' ') : String(recipe.recipeInstructions || ''), time: Number(String(recipe.totalTime || '').match(/\d+/)?.[0] || 0) || undefined, vegetarian: /vegetarian|vegan/i.test(JSON.stringify(recipe.keywords || '')), familyFriendly: true, category: recipe.recipeCategory || undefined, externalRating: aggregateRating?.value, externalRatingCount: aggregateRating?.count, ratingSource: aggregateRating ? 'Rezeptseite · Schema.org' : undefined };
      }
    } catch {}
  }
  return null;
}

async function readText(response, maxBytes = MAX_RECIPE_BYTES) {
  if (!response.body) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > maxBytes) throw new Error('too_large');
    return text;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error('too_large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  chunks.forEach(chunk => { bytes.set(chunk, offset); offset += chunk.byteLength; });
  return new TextDecoder().decode(bytes);
}

async function parseRecipe(request) {
  const value = new URL(request.url).searchParams.get('url');
  const target = recipeUrl(value);
  if (!value || !target) return json({ error: 'Nur HTTPS-Links von bekannten Rezeptseiten sind erlaubt.' }, 400, request);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const upstream = await fetch(target, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'Angebotskueche-Rezeptparser/1.0' },
    });
    const finalUrl = recipeUrl(upstream.url || target.href);
    if (!finalUrl || !upstream.ok) return json({ error: 'Die Rezeptquelle ist momentan nicht erreichbar.' }, 502, request);
    const recipe = parseRecipeJsonLd(await readText(upstream));
    return recipe ? json(recipe, 200, request) : json({ error: 'Keine strukturierten Rezeptdaten gefunden.' }, 422, request);
  } catch (error) {
    return json({ error: error?.name === 'AbortError' ? 'Die Rezeptquelle hat zu lange gebraucht.' : 'Die Rezeptquelle konnte nicht gelesen werden.' }, 504, request);
  } finally {
    clearTimeout(timeout);
  }
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&euro;/gi, '€')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractAnchorTexts(html) {
  const values = [];
  const pattern = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const value = stripHtml(match[1]);
    if (value) values.push(value);
  }
  return values;
}

function formatOfferDate(day, month, year) {
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

function offerDateRange(text) {
  const match = String(text || '').match(/gültig\s+vom\s+(\d{1,2})\.(\d{1,2})\.?\s*(\d{4})?\s*(?:bis|–|-)\s*(\d{1,2})\.(\d{1,2})\.?\s*(\d{4})?/i);
  if (!match) return null;
  const currentYear = new Date().getUTCFullYear();
  const startYear = Number(match[3] || currentYear);
  let endYear = Number(match[6] || startYear);
  if (!match[6] && Number(match[5]) < Number(match[2])) endYear += 1;
  return { start: formatOfferDate(Number(match[1]), Number(match[2]), startYear), end: formatOfferDate(Number(match[4]), Number(match[5]), endYear) };
}

function defaultOfferDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 7);
  return formatOfferDate(date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear());
}

function offerPrice(text) {
  const outside = String(text || '').replace(/\([^)]*\)/g, ' ');
  const discounted = outside.match(/(?:nur\s+|-\s*\d{1,3}\s*%)\s*(\d+[.,]\d{2})/i);
  if (discounted) return `${discounted[1].replace('.', ',')} €`;
  const match = outside.match(/\b(\d+[.,]\d{2})\b/);
  return match ? `${match[1].replace('.', ',')} €` : '';
}

function offerSaving(text) {
  const match = String(text || '').match(/-\s*\d{1,3}\s*%/);
  return match ? match[0].replace(/\s+/g, '') : '–';
}

function offerPackSize(text) {
  const match = String(text || '').match(/\b\d+(?:[.,]\d+)?\s*-?\s*(?:kg|g|l|ml|St\.?|Stück)\b/i);
  return match ? match[0].replace(/\s+/g, ' ').trim() : '1 Packung';
}

function offerName(text) {
  return String(text || '')
    .replace(/^angebot:\s*/i, '')
    .replace(/\s+(?:nur|ab)\s+\d+[.,]\d{2}[\s\S]*$/i, '')
    .replace(/\s*-\s*\d{1,3}\s*%[\s\S]*$/i, '')
    .replace(/\s*\d+[.,]\d{2}[\s\S]*$/, '')
    .replace(/\s+/g, ' ')
    .replace(/[–-]\s*$/, '')
    .trim();
}

function likelyFood(name) {
  return !/\b(wc|toilet|spül|wasch|shampoo|kosmetik|werkzeug|garten|bekleidung|schuh|auto|akku|drucker|whisky|vodka|bier|wein|zigarette|tierfutter)\b/i.test(name);
}

function normalizeOfferText(text, validUntil) {
  const name = offerName(text);
  const price = offerPrice(text);
  if (!name || name.length < 3 || !price || !likelyFood(name)) return null;
  return {
    name,
    price,
    saving: offerSaving(text),
    icon: '🛒',
    category: 'Lebensmittel',
    packSize: offerPackSize(text),
    relevance: 78,
    note: 'offizielle Händlerseite',
    validUntil,
  };
}

function uniqueOffers(values, validUntil) {
  const seen = new Set();
  return values.map(value => normalizeOfferText(value, validUntil)).filter(Boolean).filter(offer => {
    const key = `${offer.name.toLowerCase()}|${offer.price}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 80);
}

function parseKauflandOffers(html) {
  const text = stripHtml(html);
  const range = offerDateRange(text);
  const candidates = extractAnchorTexts(html).filter(value => /\d+[.,]\d{2}/.test(value) && /(kg|g|l|ml|St\.?|Packg\.|nur\s+|-\s*\d{1,3}\s*%)/i.test(value));
  return { validUntil: range?.end || defaultOfferDate(), offers: uniqueOffers(candidates, range?.end || defaultOfferDate()) };
}

function parseEdekaOffers(html) {
  const text = stripHtml(html);
  const range = offerDateRange(text);
  const currentText = text.split(/angebote der woche bei edeka/i)[0];
  const candidates = [];
  const pattern = /angebot:\s*([\s\S]{2,120}?)(?=\s+(?:ab\s+\d{1,2}\.\d{1,2}\.?\s*)?\d+[.,]\d{2}\b)/gi;
  let match;
  while ((match = pattern.exec(currentText))) candidates.push(`Angebot: ${match[1]} ${currentText.slice(pattern.lastIndex, pattern.lastIndex + 24)}`);
  const validUntil = range?.end || defaultOfferDate();
  return { validUntil, offers: uniqueOffers(candidates, validUntil) };
}

function parseAldiOffers(html) {
  const validUntil = defaultOfferDate();
  const candidates = extractAnchorTexts(html)
    .filter(value => /\d+[.,]\d{2}/.test(value) && /(kg|g|l|ml|St\.?|stück|€)/i.test(value))
    .map(value => value.replace(/^verfügbar\s+ab\s+\d{1,2}\.\d{1,2}\.\d{4}\s*/i, ''));
  return { validUntil, offers: uniqueOffers(candidates, validUntil) };
}

function parseNettoOffers(html) {
  const text = stripHtml(html);
  const range = offerDateRange(text);
  const candidates = [];
  const headingPattern = /<h3\b[^>]*>([\s\S]*?)<\/h3>([\s\S]{0,700}?)(?=<h3\b|<h2\b|<footer\b|$)/gi;
  let match;
  while ((match = headingPattern.exec(html))) {
    const candidate = `${stripHtml(match[1])} ${stripHtml(match[2])}`.trim();
    if (/\d+[.,]\d{2}/.test(candidate)) candidates.push(candidate);
  }
  const fallback = extractAnchorTexts(html).filter(value => /\d+[.,]\d{2}/.test(value) && /(kg|g|l|ml|St\.?|stück|€)/i.test(value));
  const validUntil = range?.end || defaultOfferDate();
  return { validUntil, offers: uniqueOffers([...candidates, ...fallback], validUntil) };
}

function parseLidlOffers(html) {
  const payload = JSON.parse(html);
  const validUntil = String(payload?.validUntil || defaultOfferDate());
  const offers = Array.isArray(payload?.offers) ? payload.offers.map(item => {
    if (!item || typeof item !== 'object') return null;
    const name = String(item.name || '').trim();
    const price = String(item.price || '').trim();
    if (!name || !price || !likelyFood(name)) return null;
    return { name, price, saving: String(item.saving || '–'), icon: String(item.icon || '🛒'), category: 'Lebensmittel', packSize: String(item.packSize || '1 Packung'), relevance: Number(item.relevance || 78), note: 'Lidl-Prospekt', validUntil };
  }).filter(Boolean).slice(0, 120) : [];
  return { validUntil, sourceUrl: String(payload?.sourceUrl || 'https://www.lidl.de/c/online-prospekte/s10005610/'), offers };
}

async function parseOffers(request) {
  const market = new URL(request.url).searchParams.get('market') || '';
  const source = OFFER_SOURCES[market];
  if (!source) return json({ error: 'Für diesen Markt gibt es noch keinen stabilen öffentlichen Live-Adapter.' }, 400, request);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const upstream = await fetch(source.url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'Angebotskueche-Angebotsimport/1.0' },
    });
    const finalHost = new URL(upstream.url || source.url).hostname.toLowerCase();
    if (!upstream.ok || !(finalHost === source.host || finalHost.endsWith(`.${source.host}`))) return json({ error: 'Die offizielle Angebotsseite ist momentan nicht erreichbar.' }, 502, request);
    const html = await readText(upstream, MAX_OFFER_BYTES);
    const parsed = market === 'Kaufland' ? parseKauflandOffers(html)
      : market === 'EDEKA' ? parseEdekaOffers(html)
      : market === 'Aldi' ? parseAldiOffers(html)
      : market === 'Lidl' ? parseLidlOffers(html)
      : parseNettoOffers(html);
    if (!parsed.offers.length) return json({ error: 'Die offizielle Seite enthielt keine sicher erkennbaren Lebensmittelangebote.' }, 422, request);
    return json({ market, sourceUrl: parsed.sourceUrl || source.url, fetchedAt: new Date().toISOString(), validUntil: parsed.validUntil, parser: source.parser, offers: parsed.offers }, 200, request);
  } catch (error) {
    return json({ error: error?.name === 'AbortError' ? 'Die offizielle Angebotsseite hat zu lange gebraucht.' : 'Die offizielle Angebotsseite konnte nicht gelesen werden.' }, 504, request);
  } finally {
    clearTimeout(timeout);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return json({}, 204, request);
    if (url.pathname === '/api/health') return json({ ok: true, parser: 'recipe-jsonld-v1+offers-v3' }, 200, request);
    if (url.pathname === '/api/recipe' && request.method === 'GET') return parseRecipe(request);
    if (url.pathname === '/api/offers' && request.method === 'GET') return parseOffers(request);
    if (url.pathname === '/api/sync' && (request.method === 'GET' || request.method === 'PUT')) return syncCloud(request, env);
    if (url.pathname === '/manifest.json') return new Response(manifest, { headers: { 'content-type': 'application/manifest+json; charset=utf-8' } });
    if (url.pathname === '/sw.js') return new Response(serviceWorker, { headers: { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-cache' } });
    if (url.pathname === '/supabase-sync.js') return new Response(supabaseSync, { headers: { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
    if (url.pathname !== '/') return new Response('Not found', { status: 404 });
    return new Response(page, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  },
};


