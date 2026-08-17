'use strict';

const { getPanchangam } = require('../panchangam');
const { buildDayContext } = require('./day-context');
const { buildSignals } = require('./signals');
const { renderReadings } = require('./prose');

/**
 * Daily bilingual rashiphalam for all 12 Chandra rashis.
 * @param {string} dateStr YYYY-MM-DD
 * @param {number} lat
 * @param {number} lng
 * @param {string} [lang='both'] Reserved; v1 always returns both ml and en fields.
 */
async function getDailyHoroscope(
  dateStr,
  lat = 11.074462304803008,
  lng = 76.28244022235538,
  lang = 'both'
) {
  if (lang && !['both', 'ml', 'en'].includes(lang)) {
    throw new Error('lang must be both, ml, or en');
  }

  const panchangam = getPanchangam(dateStr, lat, lng);
  const dayContext = buildDayContext(panchangam);
  const signals = buildSignals(dayContext);
  const readings = await renderReadings(signals);

  const usedLlm = readings.some((r) => r.source === 'llm');

  return {
    date: dateStr,
    location: panchangam.location,
    dayContext: {
      weekday: dayContext.weekday,
      tithi: dayContext.tithi,
      yoga: dayContext.yoga,
      nakshatra: dayContext.nakshatra,
      isNakshatramLess: dayContext.isNakshatramLess,
      chandraRashi: dayContext.chandraRashi,
      solarRashi: dayContext.solarRashi
    },
    readings,
    proseMode: usedLlm ? 'llm' : 'template',
    lang: lang || 'both'
  };
}

module.exports = { getDailyHoroscope };
