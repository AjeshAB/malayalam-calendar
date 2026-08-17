'use strict';

/**
 * Normalize getPanchangam() output for the horoscope signal engine.
 * @param {object} p - Result from getPanchangam()
 */
function buildDayContext(p) {
  if (!p || !p.chandraRashi) {
    throw new Error('day context requires panchangam with chandraRashi');
  }

  return {
    date: p.gregorian && p.gregorian.date,
    weekday: {
      en: p.weekday.en,
      ml: p.weekday.ml,
      index: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        .indexOf(p.weekday.en)
    },
    tithi: {
      en: p.tithi.name,
      ml: p.tithi.nameMl,
      paksha: p.tithi.paksha
    },
    yoga: {
      en: p.yoga.en,
      ml: p.yoga.ml
    },
    nakshatra: {
      en: p.nakshathram.en,
      ml: p.nakshathram.ml
    },
    isNakshatramLess: !!p.isNakshatramLess,
    chandraRashi: {
      index: p.chandraRashi.index,
      en: p.chandraRashi.en,
      ml: p.chandraRashi.ml
    },
    solarRashi: p.rashi,
    timings: {
      rahukalam: p.timings && p.timings.rahukalam,
      yamagandam: p.timings && p.timings.yamagandam,
      gulika: p.timings && p.timings.gulika
    },
    location: p.location
  };
}

module.exports = { buildDayContext };
