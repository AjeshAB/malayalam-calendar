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

### Festivals & special days
Vishu, Onam, Sivarathri, Navaratri, Vijayadashami, Deepavali, Thiruvathira, Vinayaka Chaturthi, Ashtami Rohini, Makara Sankranti / Makaravilakku, Karkidaka Vavu, Mandala Pooja, Thaipooyam, Attukal Pongala, Maha / Meena Bharani, Guruvayur & Vaikuntha Ekadashi, Thrikarthika, Durgashtami, Saraswati Pooja, Viswakarma Dinam, Chingam 1, plus recurring Ekadashi, Amavasya, Pournami, Pradosham, and selected weekly observances.

---

## Quick start

```bash
npm install
npm start
```

Open **http://localhost:3002**

**Runtime deps:** `express`, `cors` — the calculation engine itself has no astronomy dependencies.

---

## Engine notes

| Topic | Detail |
|--------|--------|
| Moon / Sun | Perturbation terms + equation of center |
| Ayanamsa | Lahiri (sidereal / nirayana) |
| Day system | Sunrise-based (സൂര്യോദയാധിഷ്ഠിത ദിനക്രമം) |
| 6 Nazhika rule | Checkpoint at sunrise + 162 min; same star two days → first day is nakshathram-less |
| Nazhika end | `floor((nakshatra_end − sunrise) / 24 min)`; shown when 0–60 |
| Vishu | Mesha Sankranti before sunrise → that day; after → next day |
| Kollavarsham | From solar Sankranti positions (not lookup tables) |

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

### `GET /api/panchangam/month`

| Param | Default | Description |
|-------|---------|-------------|
| `year` | Current | Year |
| `month` | Current | `1`–`12` |
| `lat` / `lng` | Kerala defaults | Location |

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
│   └── panchangam.js        # Formatted API layer + CSV rows
├── public/
│   ├── index.html
│   ├── css/style.css        # Palm-leaf manuscript UI
│   └── js/app.js            # Daily / calendar / tools
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
