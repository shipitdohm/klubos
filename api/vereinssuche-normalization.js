const GERMAN_ORTHOGRAPHY = [
  ['ss', 'ß'],
  ['ae', 'ä'],
  ['oe', 'ö'],
  ['ue', 'ü'],
];

const KNOWN_ASCII_NAME_ALIASES = [
  ['kirchhorde', 'kirchhoerde'],
  ['zundorf', 'zuendorf'],
];

const KNOWN_ASCII_UNICODE_SEARCH_ALIASES = [
  ['kirchhorde', 'kirchhörde'],
  ['zundorf', 'zündorf'],
];

export function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function canonicalClubName(value) {
  const tokens = normalizeClubTokens(value);
  return tokens.join(' ');
}

function buildIdentityPreservingVariants(value) {
  const variants = new Set();
  const stripped = stripOfficialSuffix(value);
  const unicode = applyKnownUnicodeSearchAliases(stripped);
  const ascii = applyKnownAsciiAliases(stripped);
  const bases = [
    unicode,
    ascii,
    collapseTrailingDuplicateLocation(unicode),
    stripped,
    value,
  ];

  for (const base of bases) {
    if (!base) continue;
    const compound = hyphenateCompound(base);
    for (const orthographic of germanVariants(compound)) {
      for (const prefixed of prefixVariants(orthographic)) variants.add(prefixed);
      variants.add(orthographic);
    }
    for (const prefixed of [...prefixVariants(compound), ...prefixVariants(base)]) {
      variants.add(prefixed);
    }
    variants.add(compound);
    variants.add(base);
  }

  return [...variants];
}

export function isCanonicalReduction(original, candidate) {
  const originalCanonical = canonicalClubName(original);
  const candidateCanonical = canonicalClubName(candidate);
  if (!originalCanonical || originalCanonical !== candidateCanonical) return false;

  const source = normalize(original);
  const reductions = new Set([
    stripOfficialSuffix(source),
    applyKnownAsciiAliases(source),
    collapseTrailingDuplicateLocation(source),
  ]);
  return [...reductions]
    .filter(Boolean)
    .some((reduction) => canonicalClubName(reduction) === candidateCanonical && reduction !== source);
}

export function isCanonicalLocationQualifier(query, candidate, location) {
  const queryTokens = canonicalClubName(query).split(' ').filter(Boolean);
  const candidateTokens = canonicalClubName(candidate).split(' ').filter(Boolean);
  const locationTokens = normalize(location).split(' ').filter(Boolean);
  if (!queryTokens.length || !candidateTokens.length || !locationTokens.length || queryTokens.length <= candidateTokens.length) return false;

  const remaining = [...queryTokens];
  for (const token of candidateTokens) {
    const index = remaining.indexOf(token);
    if (index < 0) return false;
    remaining.splice(index, 1);
  }
  return remaining.length > 0 && remaining.every((token) => locationTokens.includes(token));
}

function normalizeClubTokens(value) {
  const tokens = applyKnownAsciiAliases(normalize(value)).split(' ').filter(Boolean);
  while (tokens.length && ['e', 'v', 'ev', 'eg'].includes(tokens.at(-1))) tokens.pop();

  if (tokens[0] === 'tc') tokens[0] = 'tennisclub';
  for (let index = 0; index < tokens.length - 1; index += 1) {
    if (tokens[index] === 'tennis' && tokens[index + 1] === 'club') tokens.splice(index, 2, 'tennisclub');
    if (tokens[index] === 'tennis' && tokens[index + 1] === 'verein') tokens.splice(index, 2, 'tennisverein');
  }
  while (tokens.length >= 3 && ['tennisclub', 'tennisverein'].includes(tokens[0]) && tokens.at(-1) === tokens.at(-2)) {
    tokens.pop();
  }
  return tokens;
}

export function buildSearchVariants(query) {
  const variants = [];
  const seen = new Set();
  const initial = String(query || '').trim();
  const queue = [...buildIdentityPreservingVariants(initial), initial];

  while (queue.length && variants.length < 12) {
    const current = queue.shift().replace(/\s+/g, ' ').trim();
    const key = current.toLocaleLowerCase('de-DE');
    if (!current || seen.has(key)) continue;
    seen.add(key);
    variants.push(current);

    const withoutSuffix = stripOfficialSuffix(current);
    if (withoutSuffix !== current) queue.push(withoutSuffix);

    const knownAsciiAlias = applyKnownAsciiAliases(current);
    if (knownAsciiAlias !== current) queue.unshift(knownAsciiAlias);
    const knownUnicodeSearchAlias = applyKnownUnicodeSearchAliases(current);
    if (knownUnicodeSearchAlias !== current) queue.unshift(knownUnicodeSearchAlias);

    const rawTokens = current.split(/\s+/).filter(Boolean);
    const locationFragment = rawTokens.at(-1)?.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, '');
    if (locationFragment && normalize(locationFragment).length >= 6 && rawTokens.length >= 3) {
      queue.unshift(locationFragment);
    }
    if (/^(?:tc|tennisclub|tennis[ -]+club)$/i.test(rawTokens[0])
      && rawTokens.length >= 3
      && !hasHyphenatedCompound(current)) {
      queue.unshift(`${rawTokens[0]} ${rawTokens.slice(1, -1).join(' ')}`);
    }
    if (/^(?:tc|tennisclub|tennis[ -]+club)$/i.test(rawTokens[0]) && rawTokens.length >= 4) {
      queue.unshift(`${rawTokens[0]} ${rawTokens.slice(1, -1).join(' ')}`);
    }

    const addPrefixVariants = (value, prioritize = false) => {
      const prefix = value.match(/^\s*(tc|tennisclub|tennis[ -]+club)\b\s*(.*)$/i);
      if (!prefix) return;
      const rest = prefix[2].trim();
      if (!rest) return;
      const next = [`TC ${rest}`, `Tennisclub ${rest}`, `Tennis-Club ${rest}`];
      if (prioritize) queue.unshift(...next);
      else queue.push(...next);
    };
    addPrefixVariants(current);

    const compound = hyphenateCompound(current);
    if (compound !== current) {
      addPrefixVariants(compound, true);
    }

    const ascii = current.replace(/[äöüÄÖÜß]/g, (character) => ({
      ä: 'ae', ö: 'oe', ü: 'ue', Ä: 'Ae', Ö: 'Oe', Ü: 'Ue', ß: 'ss',
    }[character]));
    if (ascii !== current) queue.push(ascii);

    for (const orthographic of germanVariants(current)) {
      if (orthographic !== current) queue.push(orthographic);
    }
  }

  return variants;
}

function hyphenateCompound(value) {
  return String(value || '').replace(/\b(blau|rot|gruen|grün|schwarz|gelb|gold)\s+(weiss|weiß|blau|rot|gruen|grün|schwarz|gelb|gold)(?=\s|$)/gi, '$1-$2');
}

function hasHyphenatedCompound(value) {
  return /\b(?:blau|rot|gruen|grün|schwarz|gelb|gold)-(?:weiss|weiß|blau|rot|gruen|grün|schwarz|gelb|gold)\b/i.test(String(value || ''));
}

function prefixVariants(value) {
  const prefix = String(value || '').match(/^\s*(tc|tennisclub|tennis[ -]+club)\b\s*(.*)$/i);
  if (!prefix || !prefix[2].trim()) return [];
  const rest = prefix[2].trim();
  return [`TC ${rest}`, `Tennisclub ${rest}`, `Tennis-Club ${rest}`];
}

function stripOfficialSuffix(value) {
  return String(value || '')
    .replace(/(?:^|[\s,])(?:e\.?\s*v\.?|e\.?\s*g\.?|ev|eg)\s*$/i, '')
    .trim();
}

function applyKnownAsciiAliases(value) {
  let result = String(value || '');
  for (const [ascii, canonical] of KNOWN_ASCII_NAME_ALIASES) {
    result = result.replace(new RegExp(`\\b${ascii}\\b`, 'gi'), (match) => {
      if (match === match.toUpperCase()) return canonical.toUpperCase();
      if (match[0] === match[0].toUpperCase()) return `${canonical[0].toUpperCase()}${canonical.slice(1)}`;
      return canonical;
    });
  }
  return result;
}

function applyKnownUnicodeSearchAliases(value) {
  let result = String(value || '');
  for (const [ascii, unicode] of KNOWN_ASCII_UNICODE_SEARCH_ALIASES) {
    result = result.replace(new RegExp(`\\b${ascii}\\b`, 'gi'), (match) => {
      if (match === match.toUpperCase()) return unicode.toUpperCase();
      if (match[0] === match[0].toUpperCase()) return `${unicode[0].toUpperCase()}${unicode.slice(1)}`;
      return unicode;
    });
  }
  return result;
}

function collapseTrailingDuplicateLocation(value) {
  const tokens = String(value || '').split(' ').filter(Boolean);
  while (tokens.length >= 3 && ['tc', 'tennisclub', 'tennisverein'].includes(normalize(tokens[0])) && tokens.at(-1).toLocaleLowerCase('de-DE') === tokens.at(-2).toLocaleLowerCase('de-DE')) {
    tokens.pop();
  }
  return tokens.join(' ');
}

export function isSafeOsmMatch(club, query) {
  const clubName = canonicalClubName(club?.name);
  const queryName = canonicalClubName(query);
  if (!clubName || !queryName) return false;
  const queryTokens = queryName.split(' ').filter(Boolean);
  if (queryTokens.length <= 2 && queryTokens[0].length <= 4 && queryTokens[0] !== 'tc') return false;
  if (clubName === queryName) return true;

  const clubTokens = clubName.split(' ');
  const cityTokens = normalize(club?.city).split(' ').filter(Boolean);
  const clubIsSubset = clubTokens.every((token) => queryTokens.includes(token));
  const queryExtrasAreCity = queryTokens
    .filter((token) => !clubTokens.includes(token))
    .every((token) => cityTokens.includes(token));
  return clubIsSubset && queryExtrasAreCity;
}

export function stableClubKey(club) {
  if (club?.officialId) return `official:${normalize(club.officialId)}`;
  if (club?.sourceUrl) return `source:${String(club.sourceUrl).trim().toLowerCase()}`;
  return `name:${canonicalClubName(club?.name)}|city:${normalize(club?.city)}|domain:${canonicalDomain(club?.website)}`;
}

export function canonicalDomain(value) {
  try {
    return new URL(value).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

function germanVariants(value) {
  const variants = new Set([value]);
  const queue = [value];
  while (queue.length && variants.size < 24) {
    const current = queue.shift();
    for (const [ascii, german] of GERMAN_ORTHOGRAPHY) {
      const pattern = new RegExp(ascii, 'gi');
      for (const match of current.matchAll(pattern)) {
        const next = current.slice(0, match.index) + german + current.slice(match.index + ascii.length);
        if (!variants.has(next)) {
          variants.add(next);
          queue.push(next);
        }
      }
    }
  }
  return [...variants];
}
