'use strict';

const RASHI_ML = ['മേടം', 'ഇടവം', 'മിഥുനം', 'കർക്കടകം', 'ചിങ്ങം', 'കന്നി', 'തുലാം', 'വൃശ്ചികം', 'ധനു', 'മകരം', 'കുംഭം', 'മീനം'];
const RASHI_EN = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karkata (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischika (Scorpio)',
  'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
];

/** Rashi lords: Mars, Venus, Mercury, Moon, Sun, Mercury, Venus, Mars, Jupiter, Saturn, Saturn, Jupiter */
const RASHI_LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

/** Weekday lords Sun..Sat */
const WEEKDAY_LORD = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/** Vimshottari nakshatra lords for Malayalam order (Ashwathi…Revathi) */
const NAK_LORD = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

const NAKS_EN = [
  'Ashwathi', 'Bharani', 'Karthika', 'Rohini', 'Makiryam', 'Thiruvathira', 'Punartham',
  'Pooyam', 'Aayilyam', 'Makam', 'Pooram', 'Uthram', 'Atham', 'Chithra', 'Chothi',
  'Vishakham', 'Anizham', 'Thrikketta', 'Moolam', 'Pooradam', 'Uthradam', 'Thiruvonam',
  'Avittam', 'Chathayam', 'Poororuttathi', 'Uthrattathi', 'Revathi'
];

const CAUTIOUS_YOGAS = new Set([
  'Atiganda', 'Shula', 'Ganda', 'Vyaghata', 'Vajra', 'Vyatipata', 'Parigha', 'Vaidhriti',
  'അതിഗണ്ഡം', 'ശൂലം', 'ഗണ്ഡം', 'വ്യാഘാതം', 'വജ്രം', 'വ്യതീപാതം', 'പരിഘം', 'വൈധൃതി'
]);

const FAVOURABLE_YOGAS = new Set([
  'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Sukarma', 'Dhriti', 'Vriddhi', 'Dhruva',
  'Harshana', 'Siddhi', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra',
  'പ്രീതി', 'ആയുഷ്മാൻ', 'സൗഭാഗ്യം', 'ശോഭനം', 'സുകർമ്മം', 'ധൃതി', 'വൃദ്ധി', 'ധ്രുവം',
  'ഹർഷണം', 'സിദ്ധി', 'ശിവം', 'സിദ്ധം', 'സാധ്യം', 'ശുഭം', 'ശുക്ലം', 'ബ്രഹ്മം', 'ഇന്ദ്രം'
]);

const THEMES = ['work', 'health', 'relationships', 'travel', 'finance'];

function nakIndexFromName(enName) {
  if (!enName) return -1;
  const idx = NAKS_EN.findIndex((n) => n.toLowerCase() === String(enName).toLowerCase());
  return idx;
}

/** Approximate primary rashi for a nakshatra (2.25 stars per sign). */
function nakPrimaryRashi(nakIdx) {
  if (nakIdx < 0) return -1;
  return Math.min(11, Math.floor((nakIdx * 4) / 9));
}

function scoreToTone(score) {
  if (score >= 2) return 'favourable';
  if (score <= -1) return 'cautious';
  return 'mixed';
}

function pickThemes(tone, factors) {
  const themes = [];
  if (factors.some((f) => f.key === 'moon_in_rashi')) themes.push('relationships');
  if (factors.some((f) => f.key === 'weekday_lord_affinity')) themes.push('work');
  if (tone === 'cautious') themes.push('health');
  if (factors.some((f) => f.key === 'nakshatra_affinity')) themes.push('finance');
  if (themes.length === 0) themes.push('work');
  if (tone === 'favourable' && !themes.includes('travel')) themes.push('travel');
  return [...new Set(themes)].slice(0, 3);
}

function buildSignalForRashi(dayContext, rashiIndex) {
  let score = 0;
  const factors = [];
  const cautions = [];

  if (dayContext.chandraRashi.index === rashiIndex) {
    score += 2;
    factors.push({ key: 'moon_in_rashi', weight: 2 });
  }

  const nakIdx = nakIndexFromName(dayContext.nakshatra.en);
  if (nakIdx >= 0) {
    const primary = nakPrimaryRashi(nakIdx);
    if (primary === rashiIndex) {
      score += 1;
      factors.push({ key: 'nakshatra_affinity', weight: 1 });
    }
    const nakLord = NAK_LORD[nakIdx];
    if (nakLord === RASHI_LORD[rashiIndex]) {
      score += 1;
      factors.push({ key: 'nakshatra_lord_match', weight: 1 });
    }
  }

  const yogaEn = dayContext.yoga.en;
  const yogaMl = dayContext.yoga.ml;
  if (CAUTIOUS_YOGAS.has(yogaEn) || CAUTIOUS_YOGAS.has(yogaMl)) {
    score -= 1;
    factors.push({ key: 'cautious_yoga', weight: -1 });
    cautions.push('yoga');
  } else if (FAVOURABLE_YOGAS.has(yogaEn) || FAVOURABLE_YOGAS.has(yogaMl)) {
    score += 1;
    factors.push({ key: 'favourable_yoga', weight: 1 });
  }

  const tithiEn = (dayContext.tithi.en || '').toLowerCase();
  if (tithiEn === 'amavasya' || tithiEn === 'chaturdashi') {
    score -= 1;
    factors.push({ key: 'heavy_tithi', weight: -1 });
    cautions.push('tithi');
  } else if (tithiEn === 'purnima' || tithiEn === 'ekadashi') {
    score += 1;
    factors.push({ key: 'auspicious_tithi', weight: 1 });
  }

  const wd = dayContext.weekday.index;
  if (wd >= 0 && WEEKDAY_LORD[wd] === RASHI_LORD[rashiIndex]) {
    score += 1;
    factors.push({ key: 'weekday_lord_affinity', weight: 1 });
  }

  if (dayContext.timings && dayContext.timings.rahukalam) {
    cautions.push('rahukalam');
  }

  const tone = scoreToTone(score);
  const themes = pickThemes(tone, factors);

  return {
    rashiIndex,
    rashi: { ml: RASHI_ML[rashiIndex], en: RASHI_EN[rashiIndex] },
    tone,
    score: Math.max(-2, Math.min(2, score)),
    themes,
    cautions: [...new Set(cautions)],
    factors
  };
}

/**
 * @param {object} dayContext - from buildDayContext()
 * @returns {object[]} 12 signal objects
 */
function buildSignals(dayContext) {
  const signals = [];
  for (let i = 0; i < 12; i++) {
    signals.push(buildSignalForRashi(dayContext, i));
  }
  return signals;
}

module.exports = {
  buildSignals,
  buildSignalForRashi,
  RASHI_ML,
  RASHI_EN,
  NAKS_EN
};
