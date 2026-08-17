# Malayalam Panchangam (മലയാളം പഞ്ചാംഗം)

Standalone Malayalam Hindu calendar for Kerala. Astronomical calculations run in pure JavaScript (NASA/Moshier-style ephemeris) — no external astronomy APIs.

**Default location:** Kerala (11.07°N, 76.28°E)

---

## Features

### Daily view
- Gregorian date and weekday (English + Malayalam)
- Kollavarsham (Malayalam era) date
- Nakshathram via the traditional **6 Nazhika** rule (sunrise + 162 minutes)
- Nakshathram-less day detection with explanation
- Transition timeline with start/end times and **Nazhika** (ghatis after sunrise)
- Tithi (with paksha), Rashi, Yoga, Karana
- Sunrise / sunset
- Rahukalam, Yamagandam, Gulika
- Visheshadivasangal (special days)

### Monthly calendar
- 7-day grid with Kollavarsham date and nakshathram per cell
- Highlights for today, Sundays, nakshathram-less days, and festivals
- Click a day for the full daily leaf

### Tools (ഉപകരണങ്ങൾ)
- Nakshathram date finder (1–12 upcoming dates)
- Kollavarsham → Gregorian converter
- Upcoming festivals search
- **CSV export** for a date range (flattened daily rows, including nazhika)
- Nazhika notation guide (`Nazhika 34` = 34 × 24 minutes after sunrise)

### Daily rashiphalam (രാശിഫലം)
- Bilingual (Malayalam + English) readings for all 12 **Chandra** rashis
- Rule-based day signals (Moon sign, nakshatra affinity, tithi/yoga tone, weekday)
- Template prose by default; optional Gemini rewrite when `HOROSCOPE_LLM_API_KEY` or `GEMINI_API_KEY` is set
- Guidance-only disclaimer in the UI

### Festivals & special days
Vishu, Onam, Sivarathri, Navaratri, Vijayadashami, Deepavali, Thiruvathira, Vinayaka Chaturthi, Ashtami Rohini, Makara Sankranti / Makaravilakku, Karkidaka Vavu, Mandala Pooja, Thaipooyam, Attukal Pongala, Maha / Meena Bharani, Guruvayur & Vaikuntha Ekadashi, Thrikarthika, Durgashtami, Saraswati Pooja, Viswakarma Dinam, Chingam 1, plus recurring **Ekadashi**, **Shashti**, **Amavasya**, **Pournami**, **Aayilyam**, **Pradosham**, and selected weekly observances.

Core observances use Kerala/Tamil day-assignment: **Ekadashi, Shashti, Amavasi, Aayilyam** from the tithi/nakshatra **at local sunrise** (kshaya tithis own no day; vriddhi can own two). **Pradosham** is Trayodashi overlapping **pradosh kaal** (sunset − 1.5 h through sunset + 1 h), not the sunrise tithi table.

---

## Quick start

```bash
npm install
npm start
```

Open **http://localhost:3002**

**Runtime deps:** `express`, `cors` — the calculation engine itself has no astronomy dependencies.

### Deploy on Render

1. Push this repo to GitHub.
2. In [Render](https://render.com) → **New → Blueprint**, connect the repo (uses `render.yaml`), or **New → Web Service** with:
   - **Build:** `npm install`
   - **Start:** `npm start`
3. Open the service URL Render gives you (port is set via `PORT` automatically).

---

## Engine notes

| Topic | Detail |
|--------|--------|
| Moon / Sun | Perturbation terms + equation of center |
| Ayanamsa | Lahiri (sidereal / nirayana) |
| Day system | Sunrise-based (സൂര്യോദയാധിഷ്ഠിത ദിനക്രമം) |
| 6 Nazhika rule | Checkpoint at sunrise + 162 min; same star two days → first day is nakshathram-less; when only one star ends in the Hindu day, that star is the day name |
| Nazhika end | `(nakshatra_end − sunrise) / 24 min` to 2 decimals; capped at 60 (sunrise→sunrise day) |
| Vishu | Mesha Sankranti before sunrise → that day; after → next day |
| Kollavarsham | From solar Sankranti positions (not lookup tables) |
| `rashi` (API) | Solar / Kollavarsham month (unchanged) |
| `chandraRashi` (API) | Moon sign (nirayana); used for daily rashiphalam |

---

## API

Base URL: `http://localhost:3002`

### `GET /api/panchangam`

| Param | Default | Description |
|-------|---------|-------------|
| `date` | Today (IST) | `YYYY-MM-DD` |
| `lat` | `11.0745` | Latitude |
| `lng` | `76.2824` | Longitude |

`nakshatramDetails[]` includes `start`, `end`, and optional `endNazhika`.

Response also includes `rashi` (solar month) and `chandraRashi` `{ index, en, ml }` (Moon sign).

### `GET /api/horoscope/daily`

| Param | Default | Description |
|-------|---------|-------------|
| `date` | Today (IST) | `YYYY-MM-DD` |
| `lat` / `lng` | Kerala defaults | Location |
| `lang` | `both` | `both` \| `ml` \| `en` (v1 always returns both language fields) |

Returns `dayContext`, `readings[]` (12 Chandra rashis with `summary`/`guidance` ML+EN, `tone`, `signals`), and `proseMode` (`template` or `llm`).

**Optional Gemini env vars:** copy `.env.example` to `.env` and set `GEMINI_API_KEY` or `HOROSCOPE_LLM_API_KEY`. Optional: `HOROSCOPE_LLM_BASE_URL` (default `https://generativelanguage.googleapis.com/v1beta`), `HOROSCOPE_LLM_MODEL` (default `gemini-flash-latest`). Without a key, templates are used; Gemini failures fall back to templates (check server logs for `[horoscope/llm]`). `.env` is gitignored.

### `GET /api/panchangam/month`

| Param | Default | Description |
|-------|---------|-------------|
| `year` | Current | Year |
| `month` | Current | `1`–`12` |
| `lat` / `lng` | Kerala defaults | Location |

Served from an in-memory **year cache** (header `X-Cache: hit|miss`). First month of a year computes all 12 months.

### `GET /api/panchangam/year`

| Param | Default | Description |
|-------|---------|-------------|
| `year` | Current | Year |
| `lat` / `lng` | Kerala defaults | Location |

Returns `{ year, months: [{ month, days: [...] }, ...] }` (12 months). Cached in memory (up to 5 years). The calendar UI loads one year, then prefetches the **next** year in Nov–Dec and the **previous** year in Jan–Feb.

### Tools

| Endpoint | Purpose |
|----------|---------|
| `GET /api/tools/nakshatras` | All 27 nakshatra names (Malayalam) |
| `GET /api/tools/next-nakshatra?name=&count=` | Upcoming dates for a nakshatra |
| `GET /api/tools/kv-to-gregorian?year=&month=&day=` | Kollavarsham → Gregorian |
| `GET /api/tools/upcoming-events?count=&search=` | Upcoming festivals |
| `GET /api/tools/export-csv?startDate=&endDate=` | Download CSV for inclusive date range |

### CSV columns (flattened)

`date`, `day`, `kollavarsham_*`, `weekday_*`, `nakshathram_*`, `is_nakshatram_less`, `nakshatram_1_*` / `nakshatram_2_*` (en, ml, start, end, **nazhika**), `tithi_*`, `rashi_*`, `yoga_*`, `karana_*`, `sunrise`, `sunset`, `vishesham` (`; `-joined), `rahukalam`, `yamagandam`, `gulika`.

Location is omitted (constant / configure separately).

---

## Project layout

```
malayalam-calendar/
├── index.js                 # Package entry (Panchang, getPanchangam)
├── server.js                # Express app + API
├── src/
│   ├── panchang-engine.js   # Astronomical engine
│   ├── panchangam.js        # Formatted API layer + CSV rows
│   ├── observances.js       # Sunrise / pradosh-kaal vishesham rules
│   ├── year-cache.js        # In-memory year calendar cache
│   └── horoscope/           # Daily rashiphalam (signals → prose)
├── public/
│   ├── index.html
│   ├── css/style.css        # Palm-leaf manuscript UI
│   └── js/app.js            # Daily / calendar / tools / rashiphalam
├── package.json
└── README.md
```

---

## UI

Palm-leaf manuscript layout: aged palm ground, ink rules, stacked leaf sections (no card chrome). Manjari + Noto Serif Malayalam. Mobile-friendly controls (44px targets).

---

## Thanks

Thanks to [Babuperumana](https://github.com/Babuperumana) for the original Malayalam Panchangam work this project builds on.

---

## License

MIT
