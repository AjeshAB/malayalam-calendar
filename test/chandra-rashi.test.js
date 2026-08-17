'use strict';

const assert = require('assert');
const { getPanchangam } = require('../src/panchangam');

const RASHI_ML = ['മേടം', 'ഇടവം', 'മിഥുനം', 'കർക്കടകം', 'ചിങ്ങം', 'കന്നി', 'തുലാം', 'വൃശ്ചികം', 'ധനു', 'മകരം', 'കുംഭം', 'മീനം'];

{
  const p = getPanchangam('2026-08-10');
  assert.ok(p.chandraRashi, 'chandraRashi should be present');
  assert.ok(Number.isInteger(p.chandraRashi.index), 'index should be an integer');
  assert.ok(p.chandraRashi.index >= 0 && p.chandraRashi.index <= 11, `index in 0..11 (got ${p.chandraRashi.index})`);
  assert.strictEqual(p.chandraRashi.ml, RASHI_ML[p.chandraRashi.index]);
  assert.ok(p.chandraRashi.en && p.chandraRashi.en.length > 0, 'en name required');
}

{
  const a = getPanchangam('2026-08-10');
  const b = getPanchangam('2026-08-10');
  assert.deepStrictEqual(a.chandraRashi, b.chandraRashi, 'same date → stable chandraRashi');
}

{
  const p = getPanchangam('2026-08-10');
  assert.ok(p.rashi, 'solar rashi still present');
  assert.ok(p.rashi.ml, 'solar rashi ml unchanged');
}

console.log('chandra-rashi.test.js: ok');
