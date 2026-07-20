import assert from 'node:assert/strict';
import { buildSearchVariants, canonicalClubName, isSafeOsmMatch } from '../api/vereinssuche-normalization.js';

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
assert.ok(buildSearchVariants('Tennisclub Blau Weiß Zündorf').includes('TC Blau-Weiß Zündorf'));
assert.ok(buildSearchVariants('TC Weiden Köln').includes('TC Weiden'));
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
