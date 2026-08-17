const datePicker = document.getElementById('datePicker');
const content = document.getElementById('content');
const prevBtn = document.getElementById('prevDay');
const nextBtn = document.getElementById('nextDay');
const todayBtn = document.getElementById('today');
const calToggle = document.getElementById('calToggle');
const toolsToggle = document.getElementById('toolsToggle');
const horoscopeToggle = document.getElementById('horoscopeToggle');

function formatDate(d) {
  if (d instanceof Date) {
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  }
  return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function displayDate(isoStr) {
  const [y, m, d] = isoStr.split('-');
  return `${d}/${MONTH_ABBR[parseInt(m) - 1]}/${y}`;
}

function visheshamItems(list) {
  return (list || []).map((v) => {
    if (v && typeof v === 'object') return { ml: v.ml || '', en: v.en || '' };
    const text = String(v);
    const i = text.indexOf(' · ');
    if (i >= 0) return { ml: text.slice(0, i), en: text.slice(i + 3) };
    return { ml: text, en: '' };
  });
}

let currentDate = new Date();
let currentView = 'daily'; // 'daily' | 'calendar' | 'tools' | 'horoscope'
let calYear = currentDate.getFullYear();
let calMonth = currentDate.getMonth() + 1;
datePicker.value = formatDate(currentDate);

function refreshCurrentView() {
  const dateStr = formatDate(currentDate);
  if (currentView === 'horoscope') {
    fetchHoroscope(dateStr);
  } else if (currentView === 'calendar') {
    fetchMonthCalendar(calYear, calMonth);
  } else if (currentView === 'tools') {
    renderToolsView();
  } else {
    fetchPanchangam(dateStr);
  }
}

async function fetchPanchangam(dateStr) {
  content.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <br>പഞ്ചാംഗം ലോഡ് ചെയ്യുന്നു...
    </div>`;

  try {
    const res = await fetch(`/api/panchangam?date=${dateStr}`);
    const data = await res.json();
    if (data.error) throw new Error(data.details || data.error);
    renderPanchangam(data);
  } catch (err) {
    content.innerHTML = `<div class="loading" style="color:red;">
      Error: ${err.message}
    </div>`;
  }
}

function renderPanchangam(d) {
  content.innerHTML = `
    <article class="leaf leaf-enter">
      <header class="leaf-hero">
        <p class="leaf-kicker">${displayDate(d.gregorian.date)} · ${d.gregorian.day}</p>
        <h2 class="leaf-day">${d.weekday.ml}</h2>
        <p class="leaf-kv">${d.kollavarsham.monthMl} ${d.kollavarsham.day}, ${d.kollavarsham.year}</p>
        <p class="leaf-kv-en">${d.kollavarsham.month} ${d.kollavarsham.day}, ${d.kollavarsham.year}</p>
        <p class="leaf-nak ${d.isNakshatramLess ? 'is-less' : ''}">
          ${d.isNakshatramLess
            ? 'നക്ഷത്രം ഇല്ലാത്ത ദിവസം'
            : `<span class="leaf-nak-ml">${d.nakshathram.ml}</span> <span class="leaf-nak-en">${d.nakshathram.en}</span>`}
        </p>
      </header>

      <section class="leaf-section">
        <h3 class="leaf-h">സൂര്യൻ / Sun</h3>
        <div class="leaf-pair">
          <div>
            <div class="leaf-label">സുര്യോദയം</div>
            <div class="leaf-value">${d.sunrise}</div>
          </div>
          <div>
            <div class="leaf-label">അസ്തമയം</div>
            <div class="leaf-value">${d.sunset}</div>
          </div>
        </div>
      </section>

      <section class="leaf-section">
        <h3 class="leaf-h">തിഥി / Tithi</h3>
        <div class="leaf-value-ml">${d.tithi.nameMl}</div>
        <div class="leaf-meta">${d.tithi.name} · ${d.tithi.pakshaMl} (${d.tithi.paksha})</div>
      </section>

      <section class="leaf-section ${d.isNakshatramLess ? 'leaf-section-warn' : ''}">
        <h3 class="leaf-h">നക്ഷത്രം / Nakshathram</h3>
        ${d.isNakshatramLess ? `
          <div class="leaf-value-ml">നക്ഷത്രം ഇല്ലാത്ത ദിവസം</div>
          <p class="leaf-note">ഇന്നത്തെ സൂര്യോദയത്തിനു ശേഷം ആറു നാഴിക സമയത്ത് കാണുന്ന <strong>${d.nakshathram.ml} (${d.nakshathram.en})</strong> നക്ഷത്രം നാളത്തെ സൂര്യോദയശേഷവും ആറു നാഴിക നിലനിൽക്കുന്നതിനാൽ, ആ നക്ഷത്രം നാളത്തേക്ക് നിർണ്ണയിക്കപ്പെടുന്നു.</p>
        ` : `
          <div class="leaf-value-ml">${d.nakshathram.ml}</div>
          <div class="leaf-meta">${d.nakshathram.en}</div>
          <p class="leaf-note">സൂര്യോദയത്തിനു ശേഷം ആറു നാഴിക (ഏകദേശം 2 മണിക്കൂർ 24 മിനിറ്റ്) എങ്കിലും ചന്ദ്രൻ സഞ്ചരിക്കുന്ന നക്ഷത്രമാണ് ആ ദിവസത്തെ നക്ഷത്രം.</p>
        `}
      </section>

      <section class="leaf-section">
        <h3 class="leaf-h">നക്ഷത്ര വിവരങ്ങൾ</h3>
        ${d.nakshatramDetails.map(n => `
          <div class="nak-detail-row">
            <span class="nak-name">${n.nakshatram.ml}</span>
            <span class="nak-en">(${n.nakshatram.en})</span>
            ${n.endNazhika !== null && n.endNazhika !== undefined
              ? `<span class="nak-nazhika-badge" title="Ends ${n.endNazhika} nazhika after sunrise">Nazhika ${n.endNazhika}</span>`
              : ''}
            <div class="nak-time">${n.start} – ${n.end}</div>
          </div>
        `).join('')}
        <p class="leaf-note">ഉദാ: <strong>Nazhika 34</strong> എന്നാൽ ആ നക്ഷത്രം സൂര്യോദയത്തിനു ശേഷം <strong>34 നാഴിക</strong> വരെ നിലനിൽക്കുന്നു (1 നാഴിക = 24 മിനിറ്റ്) — 34 മണിക്കൂറല്ല.</p>
      </section>

      <section class="leaf-section leaf-tri">
        <div>
          <h3 class="leaf-h">രാശി</h3>
          <div class="leaf-value-ml">${d.rashi.ml}</div>
          <div class="leaf-meta">${d.rashi.en}</div>
        </div>
        <div>
          <h3 class="leaf-h">യോഗം</h3>
          <div class="leaf-value-ml">${d.yoga.ml}</div>
          <div class="leaf-meta">${d.yoga.en}</div>
        </div>
        <div>
          <h3 class="leaf-h">കരണം</h3>
          <div class="leaf-value-ml">${d.karana.ml}</div>
          <div class="leaf-meta">${d.karana.en}</div>
        </div>
      </section>

      ${d.vishesham && d.vishesham.length > 0 ? `
      <section class="leaf-section">
        <h3 class="leaf-h">വിശേഷദിവസങ്ങൾ / Observances</h3>
        <ul class="vishesham-list">
          ${visheshamItems(d.vishesham).map(v => `
            <li>
              <span class="vishesham-ml">${v.ml}</span>
              ${v.en ? `<span class="vishesham-en">${v.en}</span>` : ''}
            </li>`).join('')}
        </ul>
      </section>
      ` : ''}

      <section class="leaf-section">
        <h3 class="leaf-h">സമയങ്ങൾ / Timings</h3>
        <div class="timing-row">
          <span class="timing-label">രാഹുകാലം</span>
          <span class="timing-value">${d.timings.rahukalam}</span>
        </div>
        <div class="timing-row">
          <span class="timing-label">യമകണ്ഡം</span>
          <span class="timing-value">${d.timings.yamagandam}</span>
        </div>
        <div class="timing-row">
          <span class="timing-label">ഗുളികകാലം</span>
          <span class="timing-value">${d.timings.gulika}</span>
        </div>
      </section>
    </article>
  `;
}

// Calendar functions
const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_HEADERS_ML = ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി'];

/** Client year cache: Map year → { year, months: { [1-12]: { year, month, days } } } */
const yearCache = new Map();
const yearInflight = new Map();
const YEAR_CACHE_MAX = 3;

function packYearPayload(data) {
  const months = {};
  for (const m of data.months) months[m.month] = m;
  return { year: data.year, months };
}

function rememberYear(year, packed) {
  if (yearCache.has(year)) yearCache.delete(year);
  yearCache.set(year, packed);
  while (yearCache.size > YEAR_CACHE_MAX) {
    yearCache.delete(yearCache.keys().next().value);
  }
}

async function loadYearCalendar(year) {
  if (yearCache.has(year)) {
    const packed = yearCache.get(year);
    rememberYear(year, packed);
    return packed;
  }
  if (yearInflight.has(year)) return yearInflight.get(year);

  const pending = fetch(`/api/panchangam/year?year=${year}`)
    .then(async (res) => {
      const data = await res.json();
      if (data.error) throw new Error(data.details || data.error);
      const packed = packYearPayload(data);
      rememberYear(year, packed);
      return packed;
    })
    .finally(() => {
      yearInflight.delete(year);
    });

  yearInflight.set(year, pending);
  return pending;
}

/** Prefetch next year when 2 months remain (Nov/Dec); prev year in Jan/Feb. */
function prefetchAdjacentYears(year, month) {
  if (month >= 11) loadYearCalendar(year + 1).catch(() => {});
  if (month <= 2) loadYearCalendar(year - 1).catch(() => {});
}

async function fetchMonthCalendar(year, month) {
  const cached = yearCache.get(year);
  if (cached && cached.months[month]) {
    renderCalendar(cached.months[month]);
    prefetchAdjacentYears(year, month);
    return;
  }

  content.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <br>വർഷ കലണ്ടർ ലോഡ് ചെയ്യുന്നു...
    </div>`;

  try {
    const packed = await loadYearCalendar(year);
    if (currentView !== 'calendar') return;
    renderCalendar(packed.months[month]);
    prefetchAdjacentYears(year, month);
  } catch (err) {
    content.innerHTML = `<div class="loading" style="color:red;">Error: ${err.message}</div>`;
  }
}

function renderCalendar(data) {
  const { year, month, days } = data;
  const todayStr = formatDate(new Date());
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun

  // Weekday headers
  const headers = WEEKDAY_HEADERS_ML.map(d => `<div class="cal-weekday-header">${d}</div>`).join('');

  // Empty cells before first day
  let cells = '';
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells += '<div class="cal-cell cal-empty"></div>';
  }

  // Day cells
  for (const day of days) {
    const isToday = day.date === todayStr;
    const isSunday = day.gregorianDay === 'Sunday';
    const hasVishesham = day.vishesham && day.vishesham.length > 0;
    const classes = [
      'cal-cell',
      isToday ? 'cal-today' : '',
      day.isNakshatramLess ? 'cal-nak-less' : '',
      isSunday ? 'cal-sunday' : '',
      hasVishesham ? 'cal-vishesham' : ''
    ].filter(Boolean).join(' ');

    cells += `
      <div class="${classes}" onclick="switchToDay('${day.date}')">
        <div class="cal-greg-date">${day.day}</div>
        <div class="cal-kv-date">${day.kvDay}</div>
        <div class="cal-nak">${day.isNakshatramLess ? 'No star' : day.nakshathram}</div>
        ${hasVishesham ? `<div class="cal-vishesham-tag">${visheshamItems(day.vishesham).map(v =>
          v.en ? `${v.ml} <span class="cal-vishesham-en">${v.en}</span>` : v.ml
        ).join(', ')}</div>` : ''}
      </div>`;
  }

  content.innerHTML = `
    <div class="leaf leaf-enter calendar-leaf">
      <div class="calendar-header">
        <button type="button" class="nav-btn" onclick="changeMonth(-1)">◀ മുൻപത്തെ</button>
        <h2>${MONTH_NAMES[month]} ${year}</h2>
        <button type="button" class="nav-btn" onclick="changeMonth(1)">അടുത്ത ▶</button>
      </div>
      <div class="back-to-daily">
        <button type="button" class="nav-btn" onclick="switchToDailyView()">← ദിവസ വിവരങ്ങൾ</button>
      </div>
      <div class="calendar-grid">
        ${headers}
        ${cells}
      </div>
    </div>`;
}

function changeMonth(delta) {
  calMonth += delta;
  if (calMonth > 12) { calMonth = 1; calYear++; }
  if (calMonth < 1) { calMonth = 12; calYear--; }
  fetchMonthCalendar(calYear, calMonth);
}

function switchToDay(dateStr) {
  currentView = 'daily';
  calToggle.textContent = 'മാസം';
  currentDate = new Date(dateStr + 'T12:00:00');
  datePicker.value = dateStr;
  fetchPanchangam(dateStr);
}

function switchToDailyView() {
  currentView = 'daily';
  calToggle.textContent = 'മാസം';
  fetchPanchangam(formatDate(currentDate));
}

// Event listeners
datePicker.addEventListener('change', () => {
  currentDate = new Date(datePicker.value + 'T12:00:00');
  refreshCurrentView();
});

prevBtn.addEventListener('click', () => {
  currentDate.setDate(currentDate.getDate() - 1);
  datePicker.value = formatDate(currentDate);
  refreshCurrentView();
});

nextBtn.addEventListener('click', () => {
  currentDate.setDate(currentDate.getDate() + 1);
  datePicker.value = formatDate(currentDate);
  refreshCurrentView();
});

todayBtn.addEventListener('click', () => {
  currentDate = new Date();
  datePicker.value = formatDate(currentDate);
  refreshCurrentView();
});

calToggle.addEventListener('click', () => {
  if (currentView === 'calendar') {
    currentView = 'daily';
    calToggle.textContent = 'മാസം';
    fetchPanchangam(formatDate(currentDate));
  } else {
    currentView = 'calendar';
    calToggle.textContent = 'ദിവസം';
    calYear = currentDate.getFullYear();
    calMonth = currentDate.getMonth() + 1;
    fetchMonthCalendar(calYear, calMonth);
  }
});

toolsToggle.addEventListener('click', () => {
  if (currentView === 'tools') {
    currentView = 'daily';
    fetchPanchangam(formatDate(currentDate));
  } else {
    currentView = 'tools';
    calToggle.textContent = 'മാസം';
    renderToolsView();
  }
});

horoscopeToggle.addEventListener('click', () => {
  if (currentView === 'horoscope') {
    currentView = 'daily';
    fetchPanchangam(formatDate(currentDate));
  } else {
    currentView = 'horoscope';
    calToggle.textContent = 'മാസം';
    fetchHoroscope(formatDate(currentDate));
  }
});

// === Horoscope (രാശിഫലം) View ===

const TONE_LABEL = {
  favourable: { ml: 'അനുകൂലം', en: 'Favourable' },
  mixed: { ml: 'മിശ്രം', en: 'Mixed' },
  cautious: { ml: 'ജാഗ്രത', en: 'Cautious' }
};

async function fetchHoroscope(dateStr) {
  content.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <br>രാശിഫലം ലോഡ് ചെയ്യുന്നു...
    </div>`;

  try {
    const res = await fetch(`/api/horoscope/daily?date=${dateStr}`);
    const data = await res.json();
    if (data.error) throw new Error(data.details || data.error);
    renderHoroscope(data);
  } catch (err) {
    content.innerHTML = `<div class="loading" style="color:red;">
      Error: ${err.message}
    </div>`;
  }
}

function renderHoroscope(data) {
  const moon = data.dayContext.chandraRashi;
  const cards = data.readings.map((r) => {
    const tone = TONE_LABEL[r.tone] || TONE_LABEL.mixed;
    const isMoon = r.rashiIndex === moon.index;
    return `
      <section class="leaf-section horoscope-card ${isMoon ? 'horoscope-card-moon' : ''}">
        <div class="horoscope-card-head">
          <h3 class="leaf-h">${r.rashi.ml} <span class="leaf-en">${r.rashi.en}</span></h3>
          <span class="tone-chip tone-${r.tone}">${tone.ml} · ${tone.en}</span>
        </div>
        ${isMoon ? '<p class="horoscope-moon-tag">ഇന്നത്തെ ചന്ദ്രരാശി · Moon today</p>' : ''}
        <p class="horoscope-summary-ml">${r.summary.ml}</p>
        <p class="horoscope-summary-en">${r.summary.en}</p>
        <details class="horoscope-details">
          <summary>മാർഗനിർദ്ദേശം · Guidance</summary>
          <p>${r.guidance.ml}</p>
          <p class="horoscope-summary-en">${r.guidance.en}</p>
        </details>
      </section>`;
  }).join('');

  content.innerHTML = `
    <article class="leaf leaf-enter horoscope-leaf">
      <div class="back-to-daily">
        <button type="button" class="nav-btn" onclick="switchToDailyView()">← ദിവസ വിവരങ്ങൾ</button>
      </div>
      <header class="leaf-hero">
        <p class="leaf-kicker">രാശിഫലം</p>
        <h2 class="leaf-date">${displayDate(data.date)}</h2>
        <p class="leaf-sub">ചന്ദ്രരാശി: ${moon.ml} · ${moon.en}</p>
        <p class="horoscope-mode">പാഠം · Prose: <strong>${data.proseMode === 'llm' ? 'Gemini' : 'Template'}</strong></p>
      </header>
      ${cards}
      <p class="horoscope-disclaimer">ജ്യോതിഷ സൂചന മാത്രം · For guidance only — not medical, legal, or financial advice.</p>
    </article>`;
}

// === Tools View ===

const KV_MONTHS_ML = ['മേടം', 'ഇടവം', 'മിഥുനം', 'കർക്കടകം', 'ചിങ്ങം', 'കന്നി', 'തുലാം', 'വൃശ്ചികം', 'ധനു', 'മകരം', 'കുംഭം', 'മീനം'];

async function renderToolsView() {
  // Fetch nakshatra list
  let nakshatras = [];
  try {
    const res = await fetch('/api/tools/nakshatras');
    nakshatras = await res.json();
  } catch (e) {}

  const nakOptions = nakshatras.map(n => `<option value="${n}">${n}</option>`).join('');
  const kvMonthOptions = KV_MONTHS_ML.map(m => `<option value="${m}">${m}</option>`).join('');

  content.innerHTML = `
    <div class="leaf leaf-enter tools-leaf">
      <div class="back-to-daily">
        <button type="button" class="nav-btn" onclick="switchToDailyView()">← ദിവസ വിവരങ്ങൾ</button>
      </div>

      <section class="leaf-section tool-section">
        <h3 class="leaf-h">നക്ഷത്ര തീയതി കണ്ടെത്തൽ</h3>
        <div class="tool-form">
          <div class="tool-row">
            <label for="toolNakName">നക്ഷത്രം</label>
            <select id="toolNakName">${nakOptions}</select>
          </div>
          <div class="tool-row">
            <label for="toolNakCount">എണ്ണം (1-12)</label>
            <select id="toolNakCount">
              ${[1,2,3,4,5,6,7,8,9,10,11,12].map(n => `<option value="${n}" ${n===5?'selected':''}>${n}</option>`).join('')}
            </select>
          </div>
          <button type="button" class="tool-btn" onclick="searchNakshatra()">തിരയുക</button>
        </div>
        <div id="nakResult" class="tool-result"></div>
      </section>

      <section class="leaf-section tool-section">
        <h3 class="leaf-h">കൊല്ലവർഷം → ഗ്രിഗോറിയൻ</h3>
        <div class="tool-form">
          <div class="tool-row">
            <label for="toolKvYear">വർഷം</label>
            <input type="number" id="toolKvYear" value="1201" min="1100" max="1300">
          </div>
          <div class="tool-row">
            <label for="toolKvMonth">മാസം</label>
            <select id="toolKvMonth">${kvMonthOptions}</select>
          </div>
          <div class="tool-row">
            <label for="toolKvDay">തീയതി</label>
            <input type="number" id="toolKvDay" value="1" min="1" max="32">
          </div>
          <button type="button" class="tool-btn" onclick="convertKvDate()">മാറ്റുക</button>
        </div>
        <div id="kvResult" class="tool-result"></div>
      </section>

      <section class="leaf-section tool-section">
        <h3 class="leaf-h">വരാനിരിക്കുന്ന വിശേഷദിവസങ്ങൾ</h3>
        <div class="tool-form">
          <div class="tool-row">
            <label for="toolEventCount">എണ്ണം</label>
            <select id="toolEventCount">
              <option value="5" selected>5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
          <div class="tool-row">
            <label for="toolEventSearch">തിരയുക</label>
            <input type="text" id="toolEventSearch" placeholder="ഉദാ: വിഷു, ഓണം...">
          </div>
          <button type="button" class="tool-btn" onclick="searchEvents()">തിരയുക</button>
        </div>
        <div id="eventResult" class="tool-result"></div>
      </section>

      <section class="leaf-section tool-section">
        <h3 class="leaf-h">CSV Export</h3>
        <div class="tool-form">
          <div class="tool-row">
            <label for="toolCsvStartDate">ആരംഭ തീയതി</label>
            <input type="date" id="toolCsvStartDate">
          </div>
          <div class="tool-row">
            <label for="toolCsvEndDate">അവസാന തീയതി</label>
            <input type="date" id="toolCsvEndDate">
          </div>
          <button type="button" class="tool-btn" onclick="exportCsvRange()">CSV ഡൗൺലോഡ്</button>
        </div>
        <div id="csvResult" class="tool-result"></div>
      </section>

      <section class="leaf-section tool-section">
        <h3 class="leaf-h">നാഴിക / Nazhika</h3>
        <div class="nazhika-explain">
          <p class="nazhika-notation"><strong>06-08-2026 - Nazhika 34</strong> എന്നതിന്റെ അർത്ഥം:</p>
          <p>ഭരണി നക്ഷത്രം ആ ദിവസത്തെ സൂര്യോദയത്തിനു ശേഷം <strong>34 നാഴിക (Ghati)</strong> വരെ തുടരുന്നു.</p>
          <ul class="nazhika-steps">
            <li>1 നാഴിക = 24 മിനിറ്റ്</li>
            <li>34 നാഴിക = 34 × 24 = <strong>13 മണിക്കൂർ 36 മിനിറ്റ്</strong></li>
          </ul>
          <p>ഉദാഹരണം: സൂര്യോദയം <strong>6:37 AM</strong> ആണെങ്കിൽ:</p>
          <p class="nazhika-calc">6:37 AM + 13h 36m = <strong>8:13 PM</strong></p>
          <p class="nazhika-reminder">അതിനാൽ <strong>Nazhika 34</strong> എന്നാൽ നക്ഷത്രം 34 നാഴികയ്ക്കു ശേഷം അവസാനിക്കുന്നു — 34 മണിക്കൂറല്ല.</p>
        </div>
      </section>
    </div>`;

  const today = formatDate(new Date());
  document.getElementById('toolCsvStartDate').value = today;
  document.getElementById('toolCsvEndDate').value = today;
}

async function searchNakshatra() {
  const name = document.getElementById('toolNakName').value;
  const count = document.getElementById('toolNakCount').value;
  const resultDiv = document.getElementById('nakResult');
  resultDiv.innerHTML = '<div class="tool-loading">തിരയുന്നു...</div>';

  try {
    const res = await fetch(`/api/tools/next-nakshatra?name=${encodeURIComponent(name)}&count=${count}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (!data.length) {
      resultDiv.innerHTML = '<div class="tool-empty">ഫലം കണ്ടെത്തിയില്ല</div>';
      return;
    }
    resultDiv.innerHTML = `
      <table class="tool-table">
        <thead><tr>
          <th>#</th>
          <th>തീയതി / Date</th>
          <th>ആഴ്ച / Day</th>
          <th>കൊല്ലവർഷം</th>
        </tr></thead>
        <tbody>
          ${data.map((d, i) => `<tr>
            <td>${i + 1}</td>
            <td>${displayDate(d.date)}</td>
            <td>${d.weekday.ml} / ${d.weekday.en}</td>
            <td>${d.kollavarsham.monthMl} ${d.kollavarsham.day}, ${d.kollavarsham.year}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    resultDiv.innerHTML = `<div class="tool-error">പിശക്: ${err.message}</div>`;
  }
}

async function convertKvDate() {
  const year = document.getElementById('toolKvYear').value;
  const month = document.getElementById('toolKvMonth').value;
  const day = document.getElementById('toolKvDay').value;
  const resultDiv = document.getElementById('kvResult');
  resultDiv.innerHTML = '<div class="tool-loading">മാറ്റുന്നു...</div>';

  try {
    const res = await fetch(`/api/tools/kv-to-gregorian?year=${year}&month=${encodeURIComponent(month)}&day=${day}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    resultDiv.innerHTML = `
      <div class="tool-converted">
        <div class="tool-converted-label">ഗ്രിഗോറിയൻ തീയതി / Gregorian Date</div>
        <div class="tool-converted-value">${displayDate(data.gregorianDate)}</div>
        <div class="tool-converted-day">${data.weekday.ml} / ${data.weekday.en}</div>
        <div class="tool-converted-day">${data.nakshathram.ml} / ${data.nakshathram.en}</div>
      </div>`;
  } catch (err) {
    resultDiv.innerHTML = `<div class="tool-error">പിശക്: ${err.message}</div>`;
  }
}

async function searchEvents() {
  const count = document.getElementById('toolEventCount').value;
  const search = document.getElementById('toolEventSearch').value;
  const resultDiv = document.getElementById('eventResult');
  resultDiv.innerHTML = '<div class="tool-loading">തിരയുന്നു...</div>';

  try {
    const res = await fetch(`/api/tools/upcoming-events?count=${count}&search=${encodeURIComponent(search)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (!data.length) {
      resultDiv.innerHTML = '<div class="tool-empty">ഫലം കണ്ടെത്തിയില്ല</div>';
      return;
    }
    resultDiv.innerHTML = `
      <table class="tool-table">
        <thead><tr>
          <th>തീയതി / Date</th>
          <th>ആഴ്ച / Day</th>
          <th>വിശേഷം / Event</th>
          <th>കൊല്ലവർഷം</th>
        </tr></thead>
        <tbody>
          ${data.map(d => `<tr>
            <td>${displayDate(d.date)}</td>
            <td>${d.weekday.ml}</td>
            <td class="tool-event-name">${d.event}</td>
            <td>${d.kollavarsham.monthMl} ${d.kollavarsham.day}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    resultDiv.innerHTML = `<div class="tool-error">പിശക്: ${err.message}</div>`;
  }
}

async function exportCsvRange() {
  const startDate = document.getElementById('toolCsvStartDate').value;
  const endDate = document.getElementById('toolCsvEndDate').value;
  const resultDiv = document.getElementById('csvResult');

  if (!startDate || !endDate) {
    resultDiv.innerHTML = '<div class="tool-error">ദയവായി ആരംഭവും അവസാനവും തീയതി തിരഞ്ഞെടുക്കുക</div>';
    return;
  }
  if (startDate > endDate) {
    resultDiv.innerHTML = '<div class="tool-error">ആരംഭ തീയതി അവസാന തീയതിക്കു മുൻപായിരിക്കണം</div>';
    return;
  }

  resultDiv.innerHTML = '<div class="tool-loading">CSV തയ്യാറാക്കുന്നു...</div>';
  try {
    const url = `/api/tools/export-csv?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    const res = await fetch(url);
    if (!res.ok) {
      let message = 'CSV export failed';
      try {
        const errorPayload = await res.json();
        message = errorPayload.error || message;
      } catch (e) {}
      throw new Error(message);
    }

    const blob = await res.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `panchangam-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);

    resultDiv.innerHTML = `<div class="tool-converted">CSV റെഡി: ${displayDate(startDate)} → ${displayDate(endDate)}</div>`;
  } catch (err) {
    resultDiv.innerHTML = `<div class="tool-error">പിശക്: ${err.message}</div>`;
  }
}

// Initial load
fetchPanchangam(formatDate(currentDate));
