'use strict';

const assert = require('assert');
const { getPanchangam } = require('../src/panchangam');
const { Panchang } = require('../src/panchang-engine');

const lat = 11.074462304803008;
const lon = 76.28244022235538;

/** Printed Kerala calendars list stars that end in the Hindu day (sunrise→next sunrise).
 *  2026-08-10: only Thiruvathira (Nazhika 15). Punartham continues past next sunrise → next day. */
{
  const p = getPanchangam('2026-08-10');
  assert.strictEqual(p.nakshatramDetails.length, 1, 'expected a single star on 2026-08-10');
  assert.strictEqual(p.nakshatramDetails[0].nakshatram.en, 'Thiruvathira');
  assert.strictEqual(p.nakshatramDetails[0].endNazhika, 15);
}

/** 2026-10-16: Thrikketta ends after sunrise (Nazhika 1). Checkpoint Moolam spans
 *  past next sunrise — do not list it; it belongs to the next day. */
{
  const p = getPanchangam('2026-10-16');
  assert.strictEqual(p.nakshatramDetails.length, 1, 'expected a single star on 2026-10-16');
  assert.strictEqual(p.nakshatramDetails[0].nakshatram.en, 'Thrikketta');
  assert.strictEqual(p.nakshatramDetails[0].endNazhika, 1);
  assert.strictEqual(
    p.nakshatramDetails.find(n => n.nakshatram.en === 'Moolam'),
    undefined,
    'Moolam must not appear on 2026-10-16'
  );
}

/** 2026-10-30: day's star is Makiryam (Nazhika 7). Thiruvathira is between checkpoints
 *  but must not be compounded into the day name — it ends the next day. */
{
  const p = getPanchangam('2026-10-30');
  assert.strictEqual(p.nakshathram.ml, 'മകയിരം');
  assert.strictEqual(p.nakshathram.en, 'Makiryam');
  assert.ok(!p.nakshathram.ml.includes('&'), 'must not compound skipped stars into day name');
  assert.strictEqual(p.nakshatramDetails.length, 1);
  assert.strictEqual(p.nakshatramDetails[0].nakshatram.en, 'Makiryam');
  assert.strictEqual(p.nakshatramDetails[0].endNazhika, 7);
}

/** Stars that end before sunrise must not appear (no midnight residue). */
{
  const p = getPanchangam('2026-10-15');
  const anizham = p.nakshatramDetails.find(n => n.nakshatram.en === 'Anizham');
  assert.strictEqual(
    anizham,
    undefined,
    'Anizham ends before sunrise and must not appear on 2026-10-15'
  );
}

/** Spanning star (ends after next sunrise) only when it is the sole listing (Nazhika 60). */
{
  const panchang = new Panchang();
  for (const ds of ['2026-08-10', '2026-10-15', '2026-10-16']) {
    const d = new Date(ds + 'T12:00:00');
    const r = panchang.calculate(d, { lat, lon });
    const dayStart = r.SunTimes.sunriseDate;
    const next = panchang.calculate(new Date(d.getTime() + 86400000), { lat, lon });
    const dayEnd = next.SunTimes.sunriseDate;
    const spanning = r.DayNakshatras.filter(n => n.end > dayEnd);
    assert.ok(
      spanning.length === 0 || (spanning.length === 1 && r.DayNakshatras.length === 1),
      `${ds}: spanning star allowed only as sole Nazhika-60 entry (got ${r.DayNakshatras.map(n => n.name).join(', ')})`
    );
    for (const n of r.DayNakshatras) {
      assert.ok(n.end > dayStart, `${ds}: ${n.name} must end after sunrise`);
    }
  }
}

console.log('day-nakshatras.test.js: ok');
