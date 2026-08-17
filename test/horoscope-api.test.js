'use strict';

const assert = require('assert');
const http = require('http');
const app = require('../server');

// Clear after dotenv loads via server.js so smoke stays on templates
delete process.env.HOROSCOPE_LLM_API_KEY;
delete process.env.GEMINI_API_KEY;

(async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  const get = (path) => new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}${path}`, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(body) });
      });
    }).on('error', reject);
  });

  try {
    const ok = await get('/api/horoscope/daily?date=2026-08-10');
    assert.strictEqual(ok.status, 200);
    assert.strictEqual(ok.body.readings.length, 12);
    assert.strictEqual(ok.body.proseMode, 'template');
    assert.ok(ok.body.dayContext.chandraRashi);

    const badDate = await get('/api/horoscope/daily?date=10-08-2026');
    assert.strictEqual(badDate.status, 400);

    const badLang = await get('/api/horoscope/daily?date=2026-08-10&lang=fr');
    assert.strictEqual(badLang.status, 400);

    console.log('horoscope-api.test.js: ok');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
