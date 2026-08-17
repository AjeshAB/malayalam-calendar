'use strict';

const assert = require('assert');
const { getDailyHoroscope } = require('../src/horoscope');
const { renderFromTemplate } = require('../src/horoscope/templates');
const { renderReading } = require('../src/horoscope/prose');

(async () => {
  const signal = {
    rashiIndex: 0,
    rashi: { ml: 'മേടം', en: 'Mesha (Aries)' },
    tone: 'favourable',
    score: 2,
    themes: ['work'],
    cautions: [],
    factors: [{ key: 'moon_in_rashi', weight: 2 }]
  };
  const t = renderFromTemplate(signal);
  assert.ok(t.summary.ml.includes('മേടം'));
  assert.ok(t.summary.en.includes('Mesha'));
  assert.ok(t.guidance.ml.length > 0);
  assert.strictEqual(t.source, 'template');

  delete process.env.HOROSCOPE_LLM_API_KEY;
  delete process.env.GEMINI_API_KEY;
  const mixed = {
    rashiIndex: 2,
    rashi: { ml: 'മിഥുനം', en: 'Mithuna (Gemini)' },
    tone: 'mixed',
    score: 0,
    themes: ['health'],
    cautions: ['rahukalam'],
    factors: []
  };
  const r = await renderReading(mixed);
  assert.strictEqual(r.source, 'template');
  assert.ok(r.summary.ml.length > 0);
  assert.ok(r.summary.en.length > 0);

  const h = await getDailyHoroscope('2026-08-10');
  assert.strictEqual(h.readings.length, 12);
  assert.strictEqual(h.proseMode, 'template');
  for (const reading of h.readings) {
    assert.strictEqual(reading.source, 'template');
    assert.ok(reading.summary.ml && reading.summary.en);
    assert.ok(reading.guidance.ml && reading.guidance.en);
  }
  assert.ok(h.dayContext.chandraRashi);

  let threw = false;
  try {
    await getDailyHoroscope('2026-08-10', 11, 76, 'fr');
  } catch (e) {
    threw = true;
    assert.ok(/lang/.test(e.message));
  }
  assert.ok(threw, 'invalid lang should throw');

  console.log('horoscope-prose.test.js: ok');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
