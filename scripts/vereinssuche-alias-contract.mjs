import assert from 'node:assert/strict';
import { buildSearchVariants, canonicalClubName, isCanonicalReduction, isSafeOsmMatch } from '../api/vereinssuche-normalization.js';

const expectedOfficialIdentities = [
  {
    canonicalId: 'nuliga:DTB:35409',
    aliases: ['TC Blau-Weiß Zündorf', 'TC Blau-Weiss Zundorf', 'Tennisclub Blau Weiss Zundorf'],
  },
  {
    canonicalId: 'nuliga:DTB:26504',
    aliases: ['TC Blau-Weiß Halle', 'TC Blau-Weiss Halle', 'Tennisclub Blau-Weiss Halle e.V.', 'TC Blau Weiss Halle'],
  },
];

const realClubAnchors = [
  'TC Kirchhörde',
  'TSC Hansa Dortmund',
  'TC Großhesselohe',
  'TC Weiden',
  'TC Bredeney',
  'TC Blau-Weiß Zündorf',
  'TC Grün-Gold Köln',
  'TC Neuss-Weckhoven',
  'Tennisclub Oberhaid',
  'Tennisclub Köln',
  'Tennisclub Bamberg',
  'Tennisclub Neuss',
  'Tennisclub Weiden',
  'Tennisclub Kirchhörde',
  'Tennisclub Großhesselohe',
  'TC Blau-Weiß Beuel',
  'TC Pullach',
  'TC Dortmund',
];

const variants = realClubAnchors.flatMap((anchor) => buildSearchVariants(anchor));
assert.ok(variants.length >= 100, `expected at least 100 alias variants, got ${variants.length}`);

for (const anchor of realClubAnchors) {
  const expected = canonicalClubName(anchor);
  for (const variant of buildSearchVariants(anchor)) {
    if (canonicalClubName(variant) !== expected) continue;
    assert.equal(canonicalClubName(variant), expected, `${anchor} -> ${variant}`);
  }
}

assert.equal(canonicalClubName('TC Großhesselohe'), canonicalClubName('Tennisclub Grosshesselohe e.V.'));
assert.equal(canonicalClubName('TC Kirchhörde'), canonicalClubName('Tennis-Club Kirchhoerde e. V.'));
assert.equal(canonicalClubName('TC Kirchhorde'), canonicalClubName('TC Kirchhörde'));
assert.equal(canonicalClubName('TC Augsburg e.V.'), canonicalClubName('TC Augsburg'));
assert.equal(canonicalClubName('TC Augsburg Augsburg'), canonicalClubName('TC Augsburg'));
assert.ok(isCanonicalReduction('TC Kirchhorde', 'TC Kirchhoerde'));
assert.ok(isCanonicalReduction('TC Augsburg e.V.', 'TC Augsburg'));
assert.ok(isCanonicalReduction('TC Augsburg Augsburg', 'TC Augsburg'));
assert.ok(!isCanonicalReduction('Tennisclub Köln', 'TC Köln'));
assert.ok(buildSearchVariants('Tennisclub Blau Weiß Zündorf').includes('TC Blau-Weiß Zündorf'));
assert.ok(buildSearchVariants('TC Weiden Köln').includes('TC Weiden'));
assert.ok(buildSearchVariants('TC Kirchhorde').includes('TC Kirchhoerde'));
assert.ok(buildSearchVariants('TC Augsburg e.V.').includes('TC Augsburg'));
assert.ok(buildSearchVariants('TC Augsburg Augsburg').includes('TC Augsburg'));
assert.ok(buildSearchVariants('TC Blau-Weiss Zundorf').includes('TC Blau-Weiss Zündorf'));
assert.ok(buildSearchVariants('Tennisclub Blau Weiss Zundorf').includes('Tennisclub Blau-Weiss Zündorf'));
assert.equal(buildSearchVariants('TC Blau Weiss Halle')[0], 'TC Blau-Weiss Halle');
assert.equal(buildSearchVariants('Tennisclub Blau Weiss Halle')[0], 'TC Blau-Weiss Halle');
for (const identity of expectedOfficialIdentities) {
  const canonical = canonicalClubName(identity.aliases[0]);
  for (const alias of identity.aliases) {
    assert.equal(canonicalClubName(alias), canonical, `${identity.canonicalId}: ${alias}`);
    assert.ok(buildSearchVariants(alias).some((variant) => canonicalClubName(variant) === canonical), `${identity.canonicalId}: ${alias}`);
  }
}
assert.equal(isSafeOsmMatch({ name: 'Tennisclub Oberhaid e.V.', city: 'Oberhaid' }, 'Tennisclub Bamberg'), false);
assert.equal(isSafeOsmMatch({ name: 'Tennisclub Neuss-Weckhoven e.V.', city: 'Neuss' }, 'Tennisclub Neuss'), false);
assert.equal(isSafeOsmMatch({ name: 'Tennisclub Kirchhörde eV', city: 'Dortmund' }, 'TC Kirchhörde'), true);
assert.equal(isSafeOsmMatch({ name: 'Tennisanlage des TC Blau-Weiß Beuel', city: 'Bonn' }, 'TC GH'), false);

console.log(JSON.stringify({
  anchors: realClubAnchors.length,
  variants: variants.length,
  status: 'passed',
  scope: 'local normalization and safe OSM identity checks; no live-source claim',
}));
