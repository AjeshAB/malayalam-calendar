'use strict';

const assert = require('assert');
const http = require('http');
const { getMonthSummary } = require('../src/panchangam');
const { getYearCached, getMonthCached, clearYearCache, yearCacheSize } = require('../src/year-cache');

clearYearCache();

{
  const jan = getMonthSummary(2026, 1);
  assert.strictEqual(jan.year, 2026);
  assert.strictEqual(jan.month, 1);
  assert.strictEqual(jan.days.length, 31);
  assert.strictEqual(jan.days[0].date, '2026-01-01');
}

{
  clearYearCache();
  const miss = getYearCached(2026);
  assert.strictEqual(miss.cache, 'miss');
  assert.strictEqual(miss.data.year, 2026);
  assert.strictEqual(miss.data.months.length, 12);
  assert.strictEqual(miss.data.months[10].month, 11);
  assert.ok(miss.data.months[10].days.length >= 28);

  const hit = getYearCached(2026);
  assert.strictEqual(hit.cache, 'hit');
  assert.strictEqual(hit.data, miss.data);
  assert.strictEqual(yearCacheSize(), 1);

  const monthHit = getMonthCached(2026, 8);
  assert.strictEqual(monthHit.cache, 'hit');
  assert.strictEqual(monthHit.data.month, 8);
  assert.strictEqual(monthHit.data.year, 2026);
}

{
  let threw = false;
  try {
    getMonthCached(2026, 13);
  } catch (e) {
    threw = true;
  }
  assert.ok(threw, 'month 13 should throw');
}

(async () => {
  const app = require('../server');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  const get = (path) => new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}${path}`, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          cache: res.headers['x-cache'],
          body: JSON.parse(body)
        });
      });
    }).on('error', reject);
  });

  try {
    clearYearCache();
    const miss = await get('/api/panchangam/year?year=2026');
    assert.strictEqual(miss.status, 200);
    assert.strictEqual(miss.cache, 'miss');
    assert.strictEqual(miss.body.months.length, 12);

    const hit = await get('/api/panchangam/year?year=2026');
    assert.strictEqual(hit.cache, 'hit');

    const month = await get('/api/panchangam/month?year=2026&month=12');
    assert.strictEqual(month.status, 200);
    assert.strictEqual(month.cache, 'hit');
    assert.strictEqual(month.body.month, 12);
    assert.strictEqual(month.body.days.length, 31);

    console.log('year-cache.test.js: ok');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
