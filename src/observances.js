'use strict';

/**
 * Kerala/Tamil panchang day-assignment for core observances.
 *
 * Tithi index is 0-based (0=Shukla Pratipada … 14=Purnima, 15=Krishna Pratipada … 29=Amavasya).
 * Nakshatra index is 0-based (0=Ashwathi … 8=Aayilyam/Ashlesha … 26=Revathi).
 *
 * Sunrise-anchored: the index active at local sunrise owns the civil day
 * (kshaya tithis own no day; vriddhi tithis can own two).
 * Pradosham: Trayodashi overlapping pradosh kaal (sunset − 1.5h … sunset + 1h),
 * not the sunrise tithi table and not a single sunset instant.
 */

const TITHI_SHUKLA_SHASHTI = 5;
const TITHI_KRISHNA_SHASHTI = 20;
const TITHI_SHUKLA_EKADASHI = 10;
const TITHI_KRISHNA_EKADASHI = 25;
const TITHI_SHUKLA_TRAYODASHI = 12;
const TITHI_KRISHNA_TRAYODASHI = 27;
const TITHI_PURNIMA = 14;
const TITHI_AMAVASYA = 29;
const NAK_AAYILYAM = 8;

const PRADOSH_BEFORE_SUNSET_MS = 1.5 * 60 * 60 * 1000;
const PRADOSH_AFTER_SUNSET_MS = 1 * 60 * 60 * 1000;

const NAME_EKADASHI = { ml: 'ഏകാദശി', en: 'Ekadashi' };
const NAME_SHASHTI = { ml: 'ഷഷ്ഠി', en: 'Shashti' };
const NAME_AMAVASI = { ml: 'അമാവാസി', en: 'Amavasya' };
const NAME_POURNAMI = { ml: 'പൗർണ്ണമി', en: 'Pournami' };
const NAME_PRADOSHAM = { ml: 'പ്രദോഷം', en: 'Pradosham' };
const NAME_AAYILYAM = { ml: 'ആയില്യം', en: 'Aayilyam' };

function formatObservanceName(name) {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name.en ? `${name.ml} · ${name.en}` : name.ml;
}

function toVisheshamItem(v) {
  if (v && typeof v === 'object' && v.ml) {
    return { ml: String(v.ml), en: v.en ? String(v.en) : '' };
  }
  const text = String(v || '');
  const sep = ' · ';
  const idx = text.indexOf(sep);
  if (idx >= 0) {
    return { ml: text.slice(0, idx), en: text.slice(idx + sep.length) };
  }
  return { ml: text, en: '' };
}

function hasObservance(list, name) {
  const needle = typeof name === 'string' ? name : name.ml;
  const needleEn = typeof name === 'string' ? name : name.en;
  return (list || []).some((v) => {
    const item = toVisheshamItem(v);
    return item.ml === needle || item.en === needle ||
      item.ml === needleEn || item.en === needleEn ||
      item.ml.includes(needle) || item.en.includes(needle);
  });
}

function isTrayodashi(tithiIdx) {
  return tithiIdx === TITHI_SHUKLA_TRAYODASHI || tithiIdx === TITHI_KRISHNA_TRAYODASHI;
}

function pradoshWindow(sunsetDate) {
  if (!sunsetDate) return null;
  return {
    start: new Date(sunsetDate.getTime() - PRADOSH_BEFORE_SUNSET_MS),
    end: new Date(sunsetDate.getTime() + PRADOSH_AFTER_SUNSET_MS)
  };
}

function trayodashiOverlapsPradosh(tithiAtWindowStart, tithiAtWindowEnd) {
  return isTrayodashi(tithiAtWindowStart) || isTrayodashi(tithiAtWindowEnd);
}

/**
 * @param {{ sunriseTithiIdx: number|null, sunriseNakIdx: number|null, pradoshStartTithiIdx?: number|null, pradoshEndTithiIdx?: number|null }} anchors
 * @returns {string[]} bilingual labels (`ml · en`)
 */
function buildCoreObservances(anchors) {
  const events = [];
  const { sunriseTithiIdx, sunriseNakIdx, pradoshStartTithiIdx, pradoshEndTithiIdx } = anchors;

  if (sunriseTithiIdx === TITHI_SHUKLA_EKADASHI || sunriseTithiIdx === TITHI_KRISHNA_EKADASHI) {
    events.push(formatObservanceName(NAME_EKADASHI));
  }
  if (sunriseTithiIdx === TITHI_SHUKLA_SHASHTI || sunriseTithiIdx === TITHI_KRISHNA_SHASHTI) {
    events.push(formatObservanceName(NAME_SHASHTI));
  }
  if (sunriseTithiIdx === TITHI_AMAVASYA) {
    events.push(formatObservanceName(NAME_AMAVASI));
  }
  if (sunriseTithiIdx === TITHI_PURNIMA) {
    events.push(formatObservanceName(NAME_POURNAMI));
  }
  if (sunriseNakIdx === NAK_AAYILYAM) {
    events.push(formatObservanceName(NAME_AAYILYAM));
  }
  if (trayodashiOverlapsPradosh(pradoshStartTithiIdx, pradoshEndTithiIdx)) {
    events.push(formatObservanceName(NAME_PRADOSHAM));
  }

  return events;
}

module.exports = {
  buildCoreObservances,
  formatObservanceName,
  toVisheshamItem,
  hasObservance,
  pradoshWindow,
  trayodashiOverlapsPradosh,
  isTrayodashi,
  TITHI_SHUKLA_SHASHTI,
  TITHI_KRISHNA_SHASHTI,
  TITHI_SHUKLA_EKADASHI,
  TITHI_KRISHNA_EKADASHI,
  TITHI_SHUKLA_TRAYODASHI,
  TITHI_KRISHNA_TRAYODASHI,
  TITHI_PURNIMA,
  TITHI_AMAVASYA,
  NAK_AAYILYAM,
  NAME_EKADASHI,
  NAME_SHASHTI,
  NAME_AMAVASI,
  NAME_POURNAMI,
  NAME_PRADOSHAM,
  NAME_AAYILYAM,
  PRADOSH_BEFORE_SUNSET_MS,
  PRADOSH_AFTER_SUNSET_MS
};
