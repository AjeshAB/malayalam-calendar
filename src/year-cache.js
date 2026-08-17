'use strict';

const { getYearCalendar } = require('./panchangam');

const DEFAULT_LAT = 11.074462304803008;
const DEFAULT_LNG = 76.28244022235538;
const MAX_YEARS = 5;

/** Insertion-ordered LRU: year|lat|lng → { year, months } */
const cache = new Map();

function cacheKey(year, lat, lng) {
  return `${year}|${lat}|${lng}`;
}

function touch(key, value) {
  cache.delete(key);
  cache.set(key, value);
  while (cache.size > MAX_YEARS) {
    cache.delete(cache.keys().next().value);
  }
}

function getYearCached(year, lat = DEFAULT_LAT, lng = DEFAULT_LNG) {
  const y = parseInt(year, 10);
  if (!Number.isInteger(y) || y < 1) {
    throw new Error('Invalid year');
  }
  const key = cacheKey(y, lat, lng);
  if (cache.has(key)) {
    const hit = cache.get(key);
    touch(key, hit);
    return { data: hit, cache: 'hit' };
  }
  const data = getYearCalendar(y, lat, lng);
  touch(key, data);
  return { data, cache: 'miss' };
}

function getMonthCached(year, month, lat = DEFAULT_LAT, lng = DEFAULT_LNG) {
  const m = parseInt(month, 10);
  if (!Number.isInteger(m) || m < 1 || m > 12) {
    throw new Error('Invalid month');
  }
  const { data, cache: cacheStatus } = getYearCached(year, lat, lng);
  const monthData = data.months[m - 1];
  return { data: monthData, cache: cacheStatus };
}

function clearYearCache() {
  cache.clear();
}

function yearCacheSize() {
  return cache.size;
}

module.exports = {
  getYearCached,
  getMonthCached,
  clearYearCache,
  yearCacheSize,
  MAX_YEARS
};
