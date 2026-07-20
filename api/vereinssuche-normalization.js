const GERMAN_ORTHOGRAPHY = [
  ['ss', 'ß'],
  ['ae', 'ä'],
  ['oe', 'ö'],
  ['ue', 'ü'],
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
  const tokens = normalize(value).split(' ').filter(Boolean);
  while (tokens.length && ['e', 'v', 'ev', 'eg'].includes(tokens.at(-1))) tokens.pop();

  if (tokens[0] === 'tc') tokens[0] = 'tennisclub';
  for (let index = 0; index < tokens.length - 1; index += 1) {
    if (tokens[index] === 'tennis' && tokens[index + 1] === 'club') tokens.splice(index, 2, 'tennisclub');
    if (tokens[index] === 'tennis' && tokens[index + 1] === 'verein') tokens.splice(index, 2, 'tennisverein');
  }
  return tokens.join(' ');
}

export function buildSearchVariants(query) {
  const variants = [];
  const seen = new Set();
  const queue = [String(query || '').trim()];

  while (queue.length && variants.length < 12) {
    const current = queue.shift().replace(/\s+/g, ' ').trim();
    const key = current.toLocaleLowerCase('de-DE');
    if (!current || seen.has(key)) continue;
    seen.add(key);
    variants.push(current);

    const withoutSuffix = current
      .replace(/[,\s]+(?:e\.?\s*v\.?|e\.?\s*g\.?|ev|eg)\s*$/i, '')
      .trim();
    if (withoutSuffix !== current) queue.push(withoutSuffix);

    const rawTokens = current.split(/\s+/).filter(Boolean);
    const locationFragment = rawTokens.at(-1)?.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, '');
    if (locationFragment && normalize(locationFragment).length >= 6 && rawTokens.length >= 3) {
      queue.unshift(locationFragment);
    }

    const addPrefixVariants = (value) => {
      const prefix = value.match(/^\s*(tc|tennisclub|tennis[ -]+club)\b\s*(.*)$/i);
      if (!prefix) return;
      const rest = prefix[2].trim();
      if (!rest) return;
      queue.push(`TC ${rest}`);
      queue.push(`Tennisclub ${rest}`);
      queue.push(`Tennis-Club ${rest}`);
    };
    addPrefixVariants(current);

    const compound = current.replace(/\b(blau|rot|gruen|grün|schwarz|gelb|gold)\s+(weiss|weiß|blau|rot|gruen|grün|schwarz|gelb|gold)(?=\s|$)/gi, '$1-$2');
    if (compound !== current) {
      queue.push(compound);
      addPrefixVariants(compound);
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
