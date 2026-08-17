const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { getPanchangam, getNextNakshatraDates, convertKvToGregorian, getUpcomingEvents, getAllNakshatras, getPanchangamCsvRows } = require('./src/panchangam');
const { getDailyHoroscope } = require('./src/horoscope');
const { getYearCached, getMonthCached } = require('./src/year-cache');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/panchangam', (req, res) => {
  try {
    const { date, lat, lng } = req.query;
    const dateStr = date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const latitude = parseFloat(lat) || 11.074462304803008;
    const longitude = parseFloat(lng) || 76.28244022235538;

    const result = getPanchangam(dateStr, latitude, longitude);
    res.json(result);
  } catch (err) {
    console.error('Panchangam error:', err);
    res.status(500).json({ error: 'Failed to calculate panchangam', details: err.message });
  }
});

app.get('/api/horoscope/daily', async (req, res) => {
  try {
    const { date, lat, lng, lang } = req.query;
    const dateStr = date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date; use YYYY-MM-DD' });
    }
    const latitude = parseFloat(lat) || 11.074462304803008;
    const longitude = parseFloat(lng) || 76.28244022235538;
    const language = lang || 'both';

    const result = await getDailyHoroscope(dateStr, latitude, longitude, language);
    res.json(result);
  } catch (err) {
    if (err.message && /lang must be/.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Horoscope error:', err);
    res.status(500).json({ error: 'Failed to generate horoscope', details: err.message });
  }
});

app.get('/api/panchangam/month', (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const lat = parseFloat(req.query.lat) || 11.074462304803008;
    const lng = parseFloat(req.query.lng) || 76.28244022235538;

    const { data, cache } = getMonthCached(year, month, lat, lng);
    res.setHeader('X-Cache', cache);
    res.json(data);
  } catch (err) {
    console.error('Month API error:', err);
    if (err.message && /Invalid (year|month)/.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to calculate month data', details: err.message });
  }
});

app.get('/api/panchangam/year', (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const lat = parseFloat(req.query.lat) || 11.074462304803008;
    const lng = parseFloat(req.query.lng) || 76.28244022235538;

    const { data, cache } = getYearCached(year, lat, lng);
    res.setHeader('X-Cache', cache);
    res.json(data);
  } catch (err) {
    console.error('Year API error:', err);
    if (err.message && /Invalid year/.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to calculate year data', details: err.message });
  }
});

// === Tools API ===

app.get('/api/tools/nakshatras', (req, res) => {
  try {
    res.json(getAllNakshatras());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tools/next-nakshatra', (req, res) => {
  try {
    const { name, count } = req.query;
    if (!name) return res.status(400).json({ error: 'name parameter required' });
    const results = getNextNakshatraDates(name, parseInt(count) || 1);
    res.json(results);
  } catch (err) {
    console.error('Next nakshatra error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tools/kv-to-gregorian', (req, res) => {
  try {
    const { year, month, day } = req.query;
    if (!year || !month || !day) return res.status(400).json({ error: 'year, month, day required' });
    const result = convertKvToGregorian(parseInt(year), month, parseInt(day));
    if (!result) return res.status(404).json({ error: 'Could not convert date' });
    res.json(result);
  } catch (err) {
    console.error('KV conversion error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tools/upcoming-events', (req, res) => {
  try {
    const count = parseInt(req.query.count) || 5;
    const search = req.query.search || '';
    const results = getUpcomingEvents(count, search);
    res.json(results);
  } catch (err) {
    console.error('Upcoming events error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tools/export-csv', (req, res) => {
  try {
    const { startDate, endDate, lat, lng } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const latitude = parseFloat(lat) || 11.074462304803008;
    const longitude = parseFloat(lng) || 76.28244022235538;
    const rows = getPanchangamCsvRows(startDate, endDate, latitude, longitude);
    if (!rows.length) {
      return res.status(404).json({ error: 'No data found for selected range' });
    }

    const headers = Object.keys(rows[0]);
    const escapeCsv = (value) => {
      const text = value === null || value === undefined ? '' : String(value);
      if (text.includes('"') || text.includes(',') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const csvLines = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(','))
    ];
    const csv = csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="panchangam-${startDate}-to-${endDate}.csv"`);
    res.send('\uFEFF' + csv);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ error: err.message || 'Failed to export CSV' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Malayalam Panchangam server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
