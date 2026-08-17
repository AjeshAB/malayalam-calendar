'use strict';

const { renderFromTemplate } = require('./templates');
const { rewriteBatchWithLlm, getApiKey } = require('./llm');

function baseReading(signal, templated, source = 'template') {
  return {
    rashiIndex: signal.rashiIndex,
    rashi: signal.rashi,
    tone: signal.tone,
    score: signal.score,
    themes: signal.themes,
    cautions: signal.cautions,
    summary: templated.summary,
    guidance: templated.guidance,
    source,
    signals: {
      factors: signal.factors,
      themes: signal.themes,
      cautions: signal.cautions,
      score: signal.score,
      tone: signal.tone
    }
  };
}

/**
 * Render one reading (template; optional per-item LLM via batch helper).
 */
async function renderReading(signal, options = {}) {
  const templated = renderFromTemplate(signal);
  const reading = baseReading(signal, templated);
  if (options.useLlm === false || !getApiKey()) return reading;

  const { rewriteWithLlm } = require('./llm');
  const llm = await rewriteWithLlm(signal, templated);
  if (llm) {
    reading.summary = llm.summary;
    reading.guidance = llm.guidance;
    reading.source = 'llm';
  }
  return reading;
}

/**
 * Render all 12 readings; one Gemini batch when a key is configured.
 * @param {object[]} signals
 * @param {{ useLlm?: boolean }} options
 */
async function renderReadings(signals, options = {}) {
  const templatedList = signals.map((s) => renderFromTemplate(s));
  const readings = signals.map((s, i) => baseReading(s, templatedList[i]));

  if (options.useLlm === false || !getApiKey()) {
    return readings;
  }

  const map = await rewriteBatchWithLlm(signals, templatedList);
  if (!map) return readings;

  for (const reading of readings) {
    const llm = map.get(reading.rashiIndex);
    if (!llm) continue;
    reading.summary = llm.summary;
    reading.guidance = llm.guidance;
    reading.source = 'llm';
  }
  return readings;
}

module.exports = { renderReading, renderReadings };
