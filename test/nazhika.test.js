'use strict';

const assert = require('assert');
const { getPanchangam } = require('../src/panchangam');

/** Traditional day is 60 nazhika (sunrise→sunrise). Ends just past next sunrise still quote 60. */
{
  const p = getPanchangam('2026-10-15');
  const thrikketta = p.nakshatramDetails.find(n => n.nakshatram.en === 'Thrikketta');
  assert.ok(thrikketta, 'expected Thrikketta on 2026-10-15');
  assert.strictEqual(
    thrikketta.endNazhika,
    60,
    `Thrikketta should show Nazhika 60 (got ${thrikketta.endNazhika})`
  );
}

/** Same-day ends use nearest nazhika (round), capped at 60. */
{
  const p = getPanchangam('2026-10-14');
  const anizham = p.nakshatramDetails.find(n => n.nakshatram.en === 'Anizham');
  assert.ok(anizham, 'expected Anizham on 2026-10-14');
  assert.strictEqual(anizham.endNazhika, 54);
}

/** 2026-10-30 Makiryam ends ~6.93 nazhika after sunrise → rounds to 7. */
{
  const p = getPanchangam('2026-10-30');
  const makiryam = p.nakshatramDetails.find(n => n.nakshatram.en === 'Makiryam');
  assert.ok(makiryam, 'expected Makiryam on 2026-10-30');
  assert.strictEqual(makiryam.endNazhika, 7);
}

console.log('nazhika.test.js: ok');
