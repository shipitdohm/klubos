const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_ENDPOINTS = [
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];
const SOURCE_NAME = 'OpenStreetMap (Nominatim + Overpass)';
const SOURCE_URL = 'https://www.openstreetmap.org/';
const NOMINATIM_POLICY_URL = 'https://operations.osmfoundation.org/policies/nominatim/';
const USER_AGENT = 'KlubOS-Vereinssuche/0.4 (+https://klubos.de; contact: hello@klubos.de)';
const CACHE_TTL_MS = 30_000;
const NOMINATIM_MIN_INTERVAL_MS = 1_000;
const runtimeState = globalThis.__klubosSearchRuntime || (globalThis.__klubosSearchRuntime = {
  cache: new Map(),
  nominatimTail: Promise.resolve(),
  nextNominatimAt: 0,
});
const cache = runtimeState.cache;

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60');
  response.setHeader('Access-Control-Allow-Origin', '*');

  if (request.method !== 'GET') {
    return sendJson(response, 405, { error: 'method_not_allowed' });
  }

  const url = new URL(request.url, 'https://klubos.de');
  const query = String(url.searchParams.get('q') || '').trim();

  if (!query) {
    return sendJson(response, 200, emptyResponse(query));
  }

  if (query.length < 2 || query.length > 120) {
    return sendJson(response, 400, { error: 'invalid_query', message: 'Bitte mindestens 2 und höchstens 120 Zeichen eingeben.' });
  }

  const cacheKey = normalize(query);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return sendJson(response, 200, { ...cached.payload, cached: true });
  }

  const checkedAt = new Date().toISOString();

  try {
    const nominatim = await fetchNominatim(query);
    const directResults = nominatim.results.map(normalizeNominatim).filter(Boolean);
    const bbox = chooseSearchBbox(nominatim.results);
    let overpassResults = [];
    let overpassError = null;

    if (bbox && shouldExpandSearch(query, directResults)) {
      try {
        const overpass = await fetchOverpass(bbox);
        overpassResults = overpass.elements.map((element) => normalizeOverpass(element, bbox.city)).filter(Boolean);
      } catch (error) {
        overpassError = safeError(error);
      }
    }

    if (overpassError && directResults.length === 0) {
      return sendJson(response, 502, {
        error: 'source_unavailable',
        message: 'Die regionale Tennisquelle ist momentan nicht erreichbar. Bitte versuche es gleich noch einmal.',
        sourceName: SOURCE_NAME,
        checkedAt,
        partial: true,
      });
    }

    const results = rankAndDedupe([...directResults, ...overpassResults], query).slice(0, 12);
    const payload = {
      query,
      checkedAt,
      sourceName: SOURCE_NAME,
      sourceUrl: SOURCE_URL,
      attribution: 'Daten © OpenStreetMap-Mitwirkende, ODbL 1.0',
      attributionUrl: 'https://www.openstreetmap.org/copyright',
      policyUrl: NOMINATIM_POLICY_URL,
      resultCount: results.length,
      partial: Boolean(overpassError),
      results,
    };

    cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
    return sendJson(response, 200, payload);
  } catch (error) {
    return sendJson(response, 502, {
      error: 'source_unavailable',
      message: 'Die öffentliche Suchquelle ist momentan nicht erreichbar. Bitte versuche es gleich noch einmal.',
      sourceName: SOURCE_NAME,
      checkedAt,
      detail: process.env.NODE_ENV === 'development' ? safeError(error) : undefined,
    });
  }
}

async function fetchNominatim(query) {
  return enqueueNominatim(() => fetchNominatimUnthrottled(query));
}

async function fetchNominatimUnthrottled(query) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    extratags: '1',
    namedetails: '1',
    countrycodes: 'de',
    limit: '8',
    q: query,
  });
  const response = await fetch(`${NOMINATIM_ENDPOINT}?${params}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'de',
      'User-Agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Nominatim returned ${response.status}`);
  }

  return { results: await response.json() };
}

function enqueueNominatim(task) {
  const run = runtimeState.nominatimTail.then(async () => {
    const waitMs = Math.max(0, runtimeState.nextNominatimAt - Date.now());
    if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
    runtimeState.nextNominatimAt = Date.now() + NOMINATIM_MIN_INTERVAL_MS;
    return task();
  });

  runtimeState.nominatimTail = run.catch(() => undefined);
  return run;
}

async function fetchOverpass(bbox) {
  const query = `[out:json][timeout:12];nwr["sport"~"tennis",i]["name"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});out center tags;`;
  let lastError;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': USER_AGENT,
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(14_000),
      });

      if (!response.ok) {
        throw new Error(`Overpass returned ${response.status}`);
      }

      const payload = await response.json();
      if (payload.remark && /runtime error|timed out|rate.limit/i.test(payload.remark)) {
        throw new Error(payload.remark);
      }
      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Overpass unavailable');
}

function normalizeNominatim(item) {
  if (!item || item.address?.country_code !== 'de') return null;

  const tags = item.extratags || {};
  const name = item.namedetails?.name || item.name || '';
  const evidence = `${name} ${tags.sport || ''} ${item.type || ''}`;
  if (!name || !/tennis/i.test(evidence)) return null;

  const center = pointFrom(item);
  const city = cityFrom(item.address);
  return makeClub({
    id: osmId(item),
    name,
    city,
    website: firstWebsite(tags.website, tags['contact:website'], tags.url),
    sourceUrl: osmUrl(item),
    sourceName: 'OpenStreetMap Nominatim',
    center,
    evidence: 'name' in item ? evidence : '',
    confidence: tags.website || tags.sport ? 'high' : 'medium',
    address: item.display_name || '',
  });
}

function normalizeOverpass(item, fallbackCity) {
  const tags = item?.tags || {};
  const name = tags.name || tags['official_name'] || '';
  if (!name || !/tennis/i.test(tags.sport || '')) return null;

  const center = item.center || { lat: item.lat, lon: item.lon };
  const city = tags['addr:city'] || fallbackCity || '';
  return makeClub({
    id: osmId(item),
    name,
    city,
    website: firstWebsite(tags.website, tags['contact:website'], tags.url),
    sourceUrl: osmUrl(item),
    sourceName: 'OpenStreetMap Overpass',
    center,
    evidence: tags.sport,
    confidence: tags.website ? 'high' : 'medium',
    address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:postcode'], city].filter(Boolean).join(', '),
  });
}

function makeClub({ id, name, city, website, sourceUrl, sourceName, center, confidence, address }) {
  return {
    id,
    name: String(name).trim(),
    city: String(city || '').trim(),
    country: 'DE',
    sport: 'tennis',
    website: website || '',
    websiteState: website ? 'unverified_source_tag' : 'not_provided',
    websiteVerified: false,
    logoUrl: '',
    logoState: 'fallback',
    sourceUrl,
    sourceName,
    checkedAt: new Date().toISOString(),
    confidence,
    address,
    latitude: Number(center?.lat) || null,
    longitude: Number(center?.lon) || null,
  };
}

function rankAndDedupe(results, query) {
  const byKey = new Map();
  for (const result of results) {
    const key = `${normalize(result.name)}|${normalize(result.city)}`;
    const existing = byKey.get(key);
    if (!existing || resultQuality(result, query) > resultQuality(existing, query)) {
      byKey.set(key, result);
    }
  }

  return [...byKey.values()].sort((a, b) => resultQuality(b, query) - resultQuality(a, query));
}

function resultQuality(result, query) {
  const haystack = normalize(`${result.name} ${result.city}`);
  const needle = normalize(query);
  let score = result.confidence === 'high' ? 30 : 18;
  if (result.website) score += 20;
  if (haystack.includes(needle) || needle.includes(normalize(result.name))) score += 24;
  if (/\be.?s*v.?\b/i.test(result.name)) score += 8;
  if (result.city) score += 6;
  return score;
}

function chooseSearchBbox(items) {
  const candidate = items.find((item) => Array.isArray(item.boundingbox) && item.boundingbox.length === 4);
  if (!candidate) return null;
  const [south, north, west, east] = candidate.boundingbox.map(Number);
  if (![south, north, west, east].every(Number.isFinite)) return null;
  const height = north - south;
  const width = east - west;
  if (height <= 0 || width <= 0 || height > 1.2 || width > 1.8) return null;
  return { south, west, north, east, city: cityFrom(candidate.address) };
}

function shouldExpandSearch(query, directResults) {
  return directResults.length < 4 || /\b(tc|tennis|tennisclub|tennisverein|club|verein)\b/i.test(query);
}

function pointFrom(item) {
  return { lat: item.lat, lon: item.lon };
}

function cityFrom(address = {}) {
  return address.city || address.town || address.municipality || address.village || address.county || '';
}

function firstWebsite(...values) {
  for (const value of values) {
    if (!value) continue;
    try {
      const url = new URL(value);
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.toString();
    } catch {
      // Ignore malformed source tags; the result remains usable without a website.
    }
  }
  return '';
}

function osmId(item) {
  return `osm:${String(item.osm_type || item.type)}:${item.osm_id || item.id}`;
}

function osmUrl(item) {
  return `https://www.openstreetmap.org/${item.osm_type || item.type}/${item.osm_id || item.id}`;
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function emptyResponse(query) {
  return {
    query,
    checkedAt: new Date().toISOString(),
    sourceName: SOURCE_NAME,
    sourceUrl: SOURCE_URL,
    attribution: 'Daten © OpenStreetMap-Mitwirkende, ODbL 1.0',
    attributionUrl: 'https://www.openstreetmap.org/copyright',
    policyUrl: NOMINATIM_POLICY_URL,
    resultCount: 0,
    results: [],
  };
}

function safeError(error) {
  return error instanceof Error ? error.message : String(error);
}

function sendJson(response, status, payload) {
  response.status(status).json(payload);
}
