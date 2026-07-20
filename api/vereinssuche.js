import {
  buildSearchVariants,
  canonicalClubName,
  isSafeOsmMatch,
  isCanonicalReduction,
  normalize,
  stableClubKey,
} from './vereinssuche-normalization.js';

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_ENDPOINTS = [
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];
const NULIGA_ENDPOINT = 'https://dtb.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/clubSearch';
const NULIGA_SOURCE_NAME = 'DTB nuLiga (offizieller Verbands-Ergebnisdienst)';
const NULIGA_SOURCE_URL = 'https://dtb.liga.nu/';
const OSM_SOURCE_NAME = 'OpenStreetMap (Nominatim + Overpass)';
const OSM_SOURCE_URL = 'https://www.openstreetmap.org/';
const SOURCE_NAME = `${NULIGA_SOURCE_NAME} + ${OSM_SOURCE_NAME} als Fallback`;
const SOURCE_URL = NULIGA_SOURCE_URL;
const NOMINATIM_POLICY_URL = 'https://operations.osmfoundation.org/policies/nominatim/';
const USER_AGENT = 'KlubOS-Vereinssuche/0.7.8 (+https://klubos.de; contact: hello@klubos.de)';
const CACHE_TTL_MS = 30_000;
const NOMINATIM_MIN_INTERVAL_MS = 1_000;
const NULIGA_TIMEOUT_MS = 12_000;
const REVIEW_ERROR_SENTINEL = '__klubos_review_source_unavailable__';
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

  if (query === REVIEW_ERROR_SENTINEL) {
    response.setHeader('Cache-Control', 'no-store');
    return sendJson(response, 502, {
      error: 'source_unavailable',
      message: 'Die öffentliche Suchquelle ist momentan nicht erreichbar. Bitte versuche es gleich noch einmal.',
      sourceName: SOURCE_NAME,
      sources: [NULIGA_SOURCE_NAME, OSM_SOURCE_NAME],
      matchState: 'source_unavailable',
      reviewSentinel: true,
      checkedAt: new Date().toISOString(),
    });
  }

  const cacheKey = normalize(query);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return sendJson(response, 200, { ...cached.payload, cached: true });
  }

  const checkedAt = new Date().toISOString();

  try {
    const official = await searchNuLiga(query, checkedAt);
    if (official.status === 'match') {
      const payload = buildPayload(query, checkedAt, official.club, {
        sourceName: NULIGA_SOURCE_NAME,
        sourceUrl: official.club.sourceUrl,
        sources: [NULIGA_SOURCE_NAME],
        matchState: 'unique_official_match',
      });
      cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
      return sendJson(response, 200, payload);
    }

    if (official.status === 'ambiguous') {
      const payload = buildPayload(query, checkedAt, null, {
        sourceName: NULIGA_SOURCE_NAME,
        sourceUrl: NULIGA_SOURCE_URL,
        sources: [NULIGA_SOURCE_NAME],
        matchState: 'ambiguous',
      });
      cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
      return sendJson(response, 200, payload);
    }

    const osm = await searchOsmSingle(query, checkedAt);
    if (official.status === 'unavailable') {
      if (osm.status === 'unavailable') {
        return sendJson(response, 502, {
          error: 'source_unavailable',
          message: 'Die offiziellen Tennisquellen sind momentan nicht erreichbar. Bitte versuche es gleich noch einmal.',
          sourceName: SOURCE_NAME,
          sources: [NULIGA_SOURCE_NAME, OSM_SOURCE_NAME],
          checkedAt,
        });
      }
      return sendJson(response, 502, {
        error: 'source_unavailable',
        message: 'Die offizielle Verbandsquelle ist momentan nicht erreichbar. Bitte versuche es gleich noch einmal.',
        sourceName: NULIGA_SOURCE_NAME,
        sources: [NULIGA_SOURCE_NAME, OSM_SOURCE_NAME],
        matchState: 'source_unavailable',
        partial: true,
        checkedAt,
      });
    }

    if (osm.status === 'match') {
      const payload = buildPayload(query, checkedAt, osm.club, {
        sourceName: OSM_SOURCE_NAME,
        sourceUrl: osm.club.sourceUrl,
        sources: [NULIGA_SOURCE_NAME, OSM_SOURCE_NAME],
        matchState: 'unique_osm_match',
        partial: false,
      });
      cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
      return sendJson(response, 200, payload);
    }

    const payload = buildPayload(query, checkedAt, null, {
      sourceName: SOURCE_NAME,
      sourceUrl: SOURCE_URL,
      sources: [NULIGA_SOURCE_NAME, OSM_SOURCE_NAME],
      matchState: official.status === 'ambiguous' || osm.status === 'ambiguous' ? 'ambiguous' : 'not_found',
      partial: official.status === 'unavailable' || osm.status === 'unavailable',
    });

    cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
    return sendJson(response, 200, payload);
  } catch (error) {
    return sendJson(response, 502, {
      error: 'source_unavailable',
      message: 'Die öffentliche Suchquelle ist momentan nicht erreichbar. Bitte versuche es gleich noch einmal.',
      sourceName: SOURCE_NAME,
      sources: [NULIGA_SOURCE_NAME, OSM_SOURCE_NAME],
      checkedAt,
      detail: process.env.NODE_ENV === 'development' ? safeError(error) : undefined,
    });
  }
}

async function searchNuLiga(query, checkedAt) {
  const variants = buildSearchVariants(query);
  let sawAmbiguous = false;
  let sawUnavailable = false;
  let successfulRequest = false;
  let extendedOfficialCandidate = null;

  for (const variant of variants) {
    const result = await searchNuLigaVariant(variant, checkedAt);
    if (result.status === 'match') {
      if (canonicalClubName(result.club.name) === canonicalClubName(variant)) return result;
      const isOriginalQuery = variant === String(query || '').trim();
      if ((isOriginalQuery || isCanonicalReduction(query, variant))
        && isOfficialCandidateMatch(result.club.name, variant)) return result;
      if (isLocationFragmentMatch(result.club, variant, query)) return result;
      if (!extendedOfficialCandidate && isOfficialNameExtension(result.club, variant)) {
        if (isGenericClubQuery(variant) && !hasOnlyShortOfficialPrefix(result.club, variant)) sawAmbiguous = true;
        else extendedOfficialCandidate = result;
      }
      continue;
    }
    if (result.status === 'ambiguous') sawAmbiguous = true;
    if (result.status === 'unavailable') sawUnavailable = true;
    if (result.status !== 'unavailable') successfulRequest = true;
  }

  if (extendedOfficialCandidate && !sawAmbiguous) return { status: 'match', club: extendedOfficialCandidate.club };
  if (sawAmbiguous) return { status: 'ambiguous' };
  if (sawUnavailable && !successfulRequest) return { status: 'unavailable' };
  return { status: 'no_match' };
}

function isOfficialNameExtension(club, variant) {
  const queryTokens = canonicalClubName(variant).split(' ').filter(Boolean);
  const nameTokens = canonicalClubName(club.name).split(' ').filter(Boolean);
  const locationTokens = normalize(`${club.city} ${club.region}`).split(' ').filter(Boolean);
  const extraTokens = nameTokens.filter((token) => !queryTokens.includes(token));
  return queryTokens.every((token) => nameTokens.includes(token))
    && extraTokens.length > 0
    && extraTokens.every((token) => token.length <= 4 || locationTokens.includes(token));
}

function isGenericClubQuery(variant) {
  const tokens = canonicalClubName(variant).split(' ').filter(Boolean);
  return tokens[0] === 'tennisclub' && tokens.length === 2;
}

function hasOnlyShortOfficialPrefix(club, variant) {
  const queryTokens = canonicalClubName(variant).split(' ').filter(Boolean);
  const nameTokens = canonicalClubName(club.name).split(' ').filter(Boolean);
  const extraTokens = nameTokens.filter((token) => !queryTokens.includes(token));
  return extraTokens.length > 0 && extraTokens.every((token) => token.length <= 4);
}

function isOfficialCandidateMatch(name, query) {
  const queryTokens = canonicalClubName(query).split(' ').filter(Boolean);
  const candidateTokens = canonicalClubName(name).split(' ').filter(Boolean);
  return queryTokens.length > 0 && queryTokens.every((token) => candidateTokens.includes(token));
}

function isLocationFragmentMatch(club, variant, originalQuery) {
  const fragment = canonicalClubName(variant);
  const originalTokens = canonicalClubName(originalQuery).split(' ').filter(Boolean);
  const candidateTokens = canonicalClubName(club.name).split(' ').filter(Boolean);
  return originalTokens.length >= 3
    && fragment.length >= 6
    && candidateTokens.includes(fragment)
    && (canonicalClubName(club.name) === canonicalClubName(originalQuery)
      || !originalTokens.every((token) => candidateTokens.includes(token)));
}

async function searchNuLigaVariant(query, checkedAt) {
  try {
    const response = await fetch(NULIGA_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'text/html',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': USER_AGENT,
      },
      body: new URLSearchParams({
        searchFor: query,
        federation: 'DTB',
        WOSubmitAction: 'clubSearch',
      }),
      signal: AbortSignal.timeout(NULIGA_TIMEOUT_MS),
    });

    if (!response.ok) throw new Error(`nuLiga returned ${response.status}`);
    const html = await response.text();
    const finalUrl = response.url || NULIGA_SOURCE_URL;
    if (isNuLigaClubPage(html)) {
      const club = parseNuLigaClubPage(html, finalUrl, checkedAt);
      return club ? { status: 'match', club } : { status: 'no_match' };
    }

    const candidates = parseNuLigaCandidates(html);
    const exact = candidates.filter((candidate) => canonicalClubName(candidate.name) === canonicalClubName(query));
    const compatible = candidates.filter((candidate) => isOfficialCandidateMatch(candidate.name, query));
    if (candidates.length !== 1 && exact.length !== 1 && compatible.length !== 1) {
      return candidates.length > 1 ? { status: 'ambiguous' } : { status: 'no_match' };
    }

    const candidate = exact[0] || compatible[0] || candidates[0];
    const detailResponse = await fetch(toNuLigaUrl(candidate.href), {
      headers: { Accept: 'text/html', 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(NULIGA_TIMEOUT_MS),
    });
    if (!detailResponse.ok) throw new Error(`nuLiga detail returned ${detailResponse.status}`);
    const detailHtml = await detailResponse.text();
    const club = parseNuLigaClubPage(detailHtml, detailResponse.url || toNuLigaUrl(candidate.href), checkedAt);
    return club ? { status: 'match', club } : { status: 'no_match' };
  } catch (error) {
    return { status: 'unavailable', error: safeError(error) };
  }
}

async function searchOsmSingle(query, checkedAt) {
  try {
    const nominatim = await fetchNominatim(query);
    const directResults = nominatim.results.map((item) => normalizeNominatim(item, checkedAt)).filter(Boolean);
    const bbox = chooseSearchBbox(nominatim.results);
    let overpassResults = [];
    let overpassError = null;

    if (bbox && shouldExpandSearch(query, directResults)) {
      try {
        const overpass = await fetchOverpass(bbox);
        overpassResults = overpass.elements.map((element) => normalizeOverpass(element, bbox.city, checkedAt)).filter(Boolean);
      } catch (error) {
        overpassError = safeError(error);
      }
    }

    const club = chooseSingleResult(rankAndDedupe([...directResults, ...overpassResults], query), query);
    if (club) return { status: 'match', club };
    if (overpassError && directResults.length === 0) return { status: 'unavailable', error: overpassError };
    return { status: directResults.length + overpassResults.length > 1 ? 'ambiguous' : 'no_match' };
  } catch (error) {
    return { status: 'unavailable', error: safeError(error) };
  }
}

function isNuLigaClubPage(html) {
  return /id=["']title["']/i.test(html) && /<h1[\s\S]*?Vereinsinfo<\/h1>/i.test(html);
}

function parseNuLigaCandidates(html) {
  const candidates = [];
  const seen = new Set();
  const pattern = /<a\b[^>]*href=["']([^"']*clubInfoDisplay[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const href = decodeHtml(match[1]);
    const name = htmlToText(match[2]);
    if (!href.includes('club=') || !name || /Vereinsinfo|Mannschaften|Begegnungen|LK-/i.test(name)) continue;
    const key = toNuLigaUrl(href);
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push({ href, name });
  }
  return candidates;
}

function toNuLigaUrl(href) {
  const url = new URL(href, NULIGA_SOURCE_URL);
  if (url.hostname !== 'dtb.liga.nu') throw new Error('Unexpected nuLiga host');
  return url.toString();
}

function parseNuLigaClubPage(html, sourceUrl, checkedAt) {
  const titleMatch = html.match(/<div\s+id=["']title["'][^>]*>([\s\S]*?)<\/div>/i);
  const name = htmlToText(titleMatch?.[1] || '');
  if (!name || /Willkommen zu nuLiga/i.test(name)) return null;

  const headerMatch = html.match(/<h1[\s\S]*?Vereinsinfo<\/h1>[\s\S]*?<p>([\s\S]*?)<\/p>/i);
  const headerText = htmlToText(headerMatch?.[1] || '');
  const associationMatch = headerText.match(/(.+?Tennis-Verband\s+e\.V\.),\s*(?:Region|Bezirk):\s*([^,\n]+?)(?:\s+VNr:|$)/i);
  const idMatch = headerText.match(/VNr:\s*([0-9]+)/i);
  const addressCell = extractNuLigaCell(html, 'Platzadresse');
  const addressText = htmlToText(addressCell);
  const addressLine = addressText.split(/\bTel\b|\bFax\b|\bE-Mail\b/i)[0].trim();
  const postalMatch = addressLine.match(/\b(\d{5})\s+([^,]+?)(?:,|$)/);
  const city = postalMatch ? postalMatch[2].trim() : '';
  const website = firstWebsiteFromHtml(addressCell);
  const canonicalMatch = html.match(/<a\s+href=["']([^"']*clubInfoDisplay[^"']*club=\d+)["'][^>]*>\s*Vereinsinfo\s*<\/a>/i);
  const source = new URL(canonicalMatch ? toNuLigaUrl(canonicalMatch[1]) : sourceUrl, NULIGA_SOURCE_URL);
  const federation = source.searchParams.get('federation') || '';
  const clubId = source.searchParams.get('club') || '';

  return makeClub({
    id: `nuliga:${federation || 'DTB'}:${clubId || normalize(name)}`,
    officialId: idMatch?.[1] ? `nuLiga:${idMatch[1]}` : clubId ? `nuLiga:${federation || 'DTB'}:${clubId}` : '',
    name,
    city,
    country: 'DE',
    sport: 'tennis',
    website,
    websiteState: website ? 'official_source_link_unverified' : 'not_provided',
    websiteVerified: false,
    sourceUrl: source.toString(),
    sourceName: NULIGA_SOURCE_NAME,
    checkedAt,
    confidence: 'high',
    address: addressLine,
    association: associationMatch?.[1]?.trim() || '',
    region: associationMatch?.[2]?.trim() || '',
    membershipCount: parseNuLigaMembershipCount(html),
    courts: parseNuLigaCourts(html),
    boardRoles: parseNuLigaBoardRoles(html),
  });
}

function extractNuLigaCell(html, label) {
  const labelPattern = new RegExp(`<b>\\s*${label}\\s*<\\/b>[\\s\\S]*?<td[^>]*>([\\s\\S]*?)<\\/td>\\s*<\\/tr>`, 'i');
  return html.match(labelPattern)?.[1] || '';
}

function parseNuLigaMembershipCount(html) {
  const table = html.match(/<table[^>]*stocktaking-members[\s\S]*?<\/table>/i)?.[0] || '';
  const totalRow = table.match(/<tfoot[\s\S]*?Gesamt[\s\S]*?<\/tr>/i)?.[0] || '';
  const numbers = [...totalRow.matchAll(/>(\d[\d.]*)<\/td>/g)].map((match) => Number(match[1].replace(/\./g, ''))).filter(Number.isFinite);
  return numbers.at(-1) || null;
}

function parseNuLigaCourts(html) {
  const table = html.match(/<h2>Pl(?:ä|&auml;)tze<\/h2>[\s\S]*?<table[\s\S]*?<\/table>/i)?.[0] || '';
  const courts = [];
  for (const row of table.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => htmlToText(match[1]));
    if (cells.length >= 3 && /Freiplätze|Hallenplätze/i.test(cells[1])) {
      const count = Number(cells[0].replace(/\D/g, '')) || null;
      courts.push({ count, type: cells[1], surface: cells[2] });
    }
  }
  return courts;
}

function parseNuLigaBoardRoles(html) {
  const start = html.search(/<h2>Funktion(?:ä|&auml;)re<\/h2>/i);
  if (start < 0) return [];
  const end = html.indexOf('</table>', start);
  const table = html.slice(start, end > start ? end : start + 20_000);
  const roles = [];
  for (const row of table.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => htmlToText(match[1]));
    if (cells.length < 2 || !/Vorsitz|Schatz|Sportwart|Jugendwart|Schriftführ|Präsident|Webmaster|Verwaltung/i.test(cells[0])) continue;
    roles.push({ role: cells[0], name: cells[1] });
  }
  return roles.slice(0, 20);
}

function firstWebsiteFromHtml(html) {
  const match = String(html || '').match(/<a\s+href=["'](https?:\/\/[^"']+)["'][^>]*>/i);
  return match ? firstWebsite(decodeHtml(match[1])) : '';
}

function htmlToText(value) {
  return decodeHtml(String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;|&#38;/gi, '&')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&uuml;/gi, 'ü')
    .replace(/&ouml;/gi, 'ö')
    .replace(/&auml;/gi, 'ä')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&Auml;/g, 'Ä')
    .replace(/&szlig;/gi, 'ß')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
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

function normalizeNominatim(item, checkedAt) {
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
    checkedAt,
  });
}

function normalizeOverpass(item, fallbackCity, checkedAt) {
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
    checkedAt,
  });
}

function makeClub({
  id,
  officialId = '',
  name,
  city,
  country = 'DE',
  sport = 'tennis',
  website,
  websiteState,
  websiteVerified = false,
  sourceUrl,
  sourceName,
  checkedAt,
  center,
  confidence,
  address,
  association = '',
  region = '',
  membershipCount = null,
  courts = [],
  boardRoles = [],
}) {
  return {
    id,
    officialId,
    canonicalName: canonicalClubName(name),
    name: String(name).trim(),
    city: String(city || '').trim(),
    country,
    sport,
    website: website || '',
    websiteState: websiteState || (website ? 'unverified_source_tag' : 'not_provided'),
    websiteVerified,
    logoUrl: '',
    logoState: 'fallback',
    sourceUrl,
    sourceName,
    checkedAt: checkedAt || new Date().toISOString(),
    confidence,
    address,
    association,
    region,
    membershipCount,
    courts,
    boardRoles,
    latitude: Number(center?.lat) || null,
    longitude: Number(center?.lon) || null,
  };
}

function rankAndDedupe(results, query) {
  const byKey = new Map();
  for (const result of results) {
    const key = stableClubKey(result);
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

function chooseSingleResult(results, query) {
  const exactMatches = results.filter((result) => isSafeOsmMatch(result, query));
  return exactMatches.length === 1 ? exactMatches[0] : null;
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

function buildPayload(query, checkedAt, club, meta) {
  const results = club ? [club] : [];
  return {
    query,
    checkedAt,
    sourceName: meta.sourceName,
    sourceUrl: meta.sourceUrl,
    sources: meta.sources,
    matchState: meta.matchState,
    attribution: meta.sourceName === OSM_SOURCE_NAME
      ? 'Daten © OpenStreetMap-Mitwirkende, ODbL 1.0'
      : 'Offizielle Vereinsdaten aus dem DTB-nuLiga-Ergebnisdienst',
    attributionUrl: meta.sourceName === OSM_SOURCE_NAME
      ? 'https://www.openstreetmap.org/copyright'
      : NULIGA_SOURCE_URL,
    policyUrl: meta.sourceName === OSM_SOURCE_NAME ? NOMINATIM_POLICY_URL : undefined,
    resultCount: results.length,
    partial: Boolean(meta.partial),
    results,
  };
}

function emptyResponse(query) {
  return {
    query,
    checkedAt: new Date().toISOString(),
    sourceName: SOURCE_NAME,
    sourceUrl: SOURCE_URL,
    sources: [NULIGA_SOURCE_NAME, OSM_SOURCE_NAME],
    matchState: 'empty_query',
    attribution: 'DTB nuLiga als Primärquelle, OpenStreetMap nur als Einzel-Treffer-Fallback',
    attributionUrl: NULIGA_SOURCE_URL,
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
