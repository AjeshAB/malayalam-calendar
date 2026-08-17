'use strict';

const assert = require('assert');
const { getPanchangam } = require('../src/panchangam');
const { buildDayContext } = require('../src/horoscope/day-context');
const { buildSignals } = require('../src/horoscope/signals');

{
  const p = getPanchangam('2026-08-10');
  const ctx = buildDayContext(p);
  assert.strictEqual(ctx.chandraRashi.index, p.chandraRashi.index);
  assert.ok(ctx.weekday.en);
  assert.ok(ctx.yoga.en);
  assert.ok(ctx.nakshatra.en);
}

{
  const p = getPanchangam('2026-08-10');
  const ctx = buildDayContext(p);
  const a = buildSignals(ctx);
  const b = buildSignals(ctx);
  assert.strictEqual(a.length, 12);
  assert.deepStrictEqual(a, b, 'signals are deterministic');
}

{
  const p = getPanchangam('2026-08-10');
  const ctx = buildDayContext(p);
  const signals = buildSignals(ctx);
  const moonRashi = signals[ctx.chandraRashi.index];
  const others = signals.filter((s) => s.rashiIndex !== ctx.chandraRashi.index);
  const maxOther = Math.max(...others.map((s) => s.score));
  assert.ok(
    moonRashi.score >= maxOther,
    `moon-in-rashi score (${moonRashi.score}) should be >= other max (${maxOther})`
  );
  assert.ok(moonRashi.factors.some((f) => f.key === 'moon_in_rashi'));
  assert.ok(['favourable', 'mixed', 'cautious'].includes(moonRashi.tone));
}

console.log('horoscope-signals.test.js: ok');
