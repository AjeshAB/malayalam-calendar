'use strict';

const assert = require('assert');
const {
  buildCoreObservances,
  formatObservanceName,
  hasObservance,
  pradoshWindow,
  trayodashiOverlapsPradosh,
  NAME_EKADASHI,
  NAME_SHASHTI,
  NAME_AMAVASI,
  NAME_POURNAMI,
  NAME_PRADOSHAM,
  NAME_AAYILYAM,
  PRADOSH_BEFORE_SUNSET_MS,
  PRADOSH_AFTER_SUNSET_MS
} = require('../src/observances');

function names(anchors) {
  return buildCoreObservances(anchors);
}

{
  assert.strictEqual(NAME_EKADASHI.en, 'Ekadashi');
  assert.strictEqual(formatObservanceName(NAME_EKADASHI), 'ഏകാദശി · Ekadashi');
}

{
  const shukla = names({ sunriseTithiIdx: 10, sunriseNakIdx: 0 });
  const krishna = names({ sunriseTithiIdx: 25, sunriseNakIdx: 0 });
  assert.ok(hasObservance(shukla, NAME_EKADASHI));
  assert.ok(hasObservance(krishna, NAME_EKADASHI));
  assert.ok(hasObservance(shukla, 'Ekadashi'));
  assert.ok(!hasObservance(names({ sunriseTithiIdx: 11, sunriseNakIdx: 0 }), NAME_EKADASHI));
}

{
  const shukla = names({ sunriseTithiIdx: 5, sunriseNakIdx: 0 });
  const krishna = names({ sunriseTithiIdx: 20, sunriseNakIdx: 0 });
  assert.ok(hasObservance(shukla, NAME_SHASHTI));
  assert.ok(hasObservance(krishna, NAME_SHASHTI));
  assert.ok(hasObservance(shukla, 'Shashti'));
  assert.ok(!hasObservance(names({ sunriseTithiIdx: 4, sunriseNakIdx: 0 }), NAME_SHASHTI));
}

{
  assert.ok(hasObservance(names({ sunriseTithiIdx: 29, sunriseNakIdx: 0 }), NAME_AMAVASI));
  assert.ok(!hasObservance(names({ sunriseTithiIdx: 14, sunriseNakIdx: 0 }), NAME_AMAVASI));
  assert.ok(hasObservance(names({ sunriseTithiIdx: 14, sunriseNakIdx: 0 }), NAME_POURNAMI));
}

{
  assert.ok(hasObservance(names({ sunriseTithiIdx: 0, sunriseNakIdx: 8 }), NAME_AAYILYAM));
  assert.ok(!hasObservance(names({ sunriseTithiIdx: 0, sunriseNakIdx: 7 }), NAME_AAYILYAM));
}

{
  // Pradosham is independent of the sunrise tithi table
  const atSunriseTrayodashi = names({
    sunriseTithiIdx: 12,
    sunriseNakIdx: 0,
    pradoshStartTithiIdx: 11,
    pradoshEndTithiIdx: 11
  });
  assert.ok(!hasObservance(atSunriseTrayodashi, NAME_PRADOSHAM), 'sunrise Trayodashi alone is not Pradosham');

  const overlapsStart = names({
    sunriseTithiIdx: 11,
    sunriseNakIdx: 0,
    pradoshStartTithiIdx: 12,
    pradoshEndTithiIdx: 13
  });
  assert.ok(hasObservance(overlapsStart, NAME_PRADOSHAM));

  const overlapsEnd = names({
    sunriseTithiIdx: 11,
    sunriseNakIdx: 0,
    pradoshStartTithiIdx: 11,
    pradoshEndTithiIdx: 12
  });
  assert.ok(hasObservance(overlapsEnd, NAME_PRADOSHAM), 'Trayodashi entering after sunset still owns Pradosham');

  const krishna = names({
    sunriseTithiIdx: 26,
    sunriseNakIdx: 0,
    pradoshStartTithiIdx: 27,
    pradoshEndTithiIdx: 27
  });
  assert.ok(hasObservance(krishna, NAME_PRADOSHAM));
}

{
  assert.strictEqual(trayodashiOverlapsPradosh(12, 13), true);
  assert.strictEqual(trayodashiOverlapsPradosh(11, 12), true);
  assert.strictEqual(trayodashiOverlapsPradosh(11, 11), false);
  assert.strictEqual(trayodashiOverlapsPradosh(27, 28), true);
}

{
  const sunset = new Date('2026-08-10T12:30:00.000Z');
  const w = pradoshWindow(sunset);
  assert.strictEqual(sunset.getTime() - w.start.getTime(), PRADOSH_BEFORE_SUNSET_MS);
  assert.strictEqual(w.end.getTime() - sunset.getTime(), PRADOSH_AFTER_SUNSET_MS);
  assert.strictEqual(pradoshWindow(null), null);
}

console.log('observances.test.js: ok');
