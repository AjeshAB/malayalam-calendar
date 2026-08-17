'use strict';

const assert = require('assert');
const { Panchang } = require('../src/panchang-engine');
const { getPanchangam } = require('../src/panchangam');
const {
  isTrayodashi,
  hasObservance,
  NAME_EKADASHI,
  NAME_SHASHTI,
  NAME_AMAVASI,
  NAME_PRADOSHAM,
  NAME_AAYILYAM
} = require('../src/observances');

const lat = 11.074462304803008;
const lon = 76.28244022235538;
const panchang = new Panchang({ lat, lon });

function has(vishesham, name) {
  return hasObservance(vishesham, name);
}

/** Every civil day in 2026: vishesham flags match sunrise / pradosh-kaal anchors. */
{
  let ekadashi = 0;
  let shashti = 0;
  let amavasi = 0;
  let aayilyam = 0;
  let pradosham = 0;
  let pradoshamDiffersFromSunset = 0;
  let aayilyamDiffersFromDayNak = 0;

  for (let m = 1; m <= 12; m++) {
    const days = new Date(2026, m, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const dateStr = `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const date = new Date(dateStr + 'T12:00:00');
      const res = panchang.calculate(date, { lat, lon });
      const a = res.ObservanceAnchors;
      assert.ok(a, `ObservanceAnchors missing on ${dateStr}`);

      assert.strictEqual(
        has(res.Vishesham, NAME_EKADASHI),
        a.sunriseTithiIdx === 10 || a.sunriseTithiIdx === 25,
        `Ekadashi mismatch on ${dateStr}`
      );
      assert.strictEqual(
        has(res.Vishesham, NAME_SHASHTI),
        a.sunriseTithiIdx === 5 || a.sunriseTithiIdx === 20,
        `Shashti mismatch on ${dateStr}`
      );
      assert.strictEqual(
        has(res.Vishesham, NAME_AMAVASI),
        a.sunriseTithiIdx === 29,
        `Amavasi mismatch on ${dateStr}`
      );
      assert.strictEqual(
        has(res.Vishesham, NAME_AAYILYAM),
        a.sunriseNakIdx === 8,
        `Aayilyam mismatch on ${dateStr}`
      );

      const pradoshOverlap = isTrayodashi(a.pradoshStartTithiIdx) || isTrayodashi(a.pradoshEndTithiIdx);
      assert.strictEqual(
        has(res.Vishesham, NAME_PRADOSHAM),
        pradoshOverlap,
        `Pradosham mismatch on ${dateStr}`
      );

      if (has(res.Vishesham, NAME_EKADASHI)) ekadashi += 1;
      if (has(res.Vishesham, NAME_SHASHTI)) shashti += 1;
      if (has(res.Vishesham, NAME_AMAVASI)) amavasi += 1;
      if (has(res.Vishesham, NAME_AAYILYAM)) aayilyam += 1;
      if (has(res.Vishesham, NAME_PRADOSHAM)) pradosham += 1;

      if (pradoshOverlap !== isTrayodashi(a.sunsetTithiIdx)) pradoshamDiffersFromSunset += 1;
      if (has(res.Vishesham, NAME_AAYILYAM) && res.Nakshatra.name !== 'ആയില്യം') {
        aayilyamDiffersFromDayNak += 1;
      }
    }
  }

  assert.ok(ekadashi >= 20 && ekadashi <= 26, `expected ~24 Ekadashi, got ${ekadashi}`);
  assert.ok(shashti >= 20 && shashti <= 26, `expected ~24 Shashti, got ${shashti}`);
  assert.ok(amavasi >= 11 && amavasi <= 13, `expected ~12 Amavasi, got ${amavasi}`);
  assert.ok(aayilyam >= 10 && aayilyam <= 16, `expected ~13 Aayilyam, got ${aayilyam}`);
  assert.ok(pradosham >= 20 && pradosham <= 28, `expected ~24 Pradosham, got ${pradosham}`);
  assert.ok(
    pradoshamDiffersFromSunset >= 1,
    'expected at least one day where pradosh-kaal overlap differs from sunset-instant Trayodashi'
  );
}

/** API vishesham includes sunrise Shashti / Aayilyam, not only the 6-nazhika day name. */
{
  const panchangam = new Panchang({ lat, lon });
  let foundShashti = null;
  let foundAayilyam = null;
  for (let d = 1; d <= 40; d++) {
    const date = new Date(2026, 0, d, 12, 0, 0);
    const dateStr = `2026-01-${String(d).padStart(2, '0')}`;
    const res = panchangam.calculate(date, { lat, lon });
    if (!foundShashti && hasObservance(res.Vishesham, NAME_SHASHTI)) foundShashti = dateStr;
    if (!foundAayilyam && hasObservance(res.Vishesham, NAME_AAYILYAM)) foundAayilyam = dateStr;
    if (foundShashti && foundAayilyam) break;
  }
  assert.ok(foundShashti, 'expected a Shashti in Jan 2026');
  assert.ok(foundAayilyam, 'expected an Aayilyam in Jan 2026');
  const sh = getPanchangam(foundShashti);
  const ay = getPanchangam(foundAayilyam);
  assert.ok(hasObservance(sh.vishesham, NAME_SHASHTI));
  assert.ok(hasObservance(ay.vishesham, NAME_AAYILYAM));
  const shItem = sh.vishesham.find((v) => v.ml === NAME_SHASHTI.ml);
  const ayItem = ay.vishesham.find((v) => v.ml === NAME_AAYILYAM.ml);
  assert.strictEqual(shItem.en, 'Shashti');
  assert.strictEqual(ayItem.en, 'Aayilyam');
}

console.log('observance-days.test.js: ok');
