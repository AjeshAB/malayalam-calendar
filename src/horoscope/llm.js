'use strict';

const BATCH_SCHEMA = {
  type: 'OBJECT',
  properties: {
    readings: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          rashiIndex: { type: 'INTEGER' },
          summary: {
            type: 'OBJECT',
            properties: {
              ml: { type: 'STRING' },
              en: { type: 'STRING' }
            },
            required: ['ml', 'en']
          },
          guidance: {
            type: 'OBJECT',
            properties: {
              ml: { type: 'STRING' },
              en: { type: 'STRING' }
            },
            required: ['ml', 'en']
          }
        },
        required: ['rashiIndex', 'summary', 'guidance']
      }
    }
  },
  required: ['readings']
};

function getApiKey() {
  return process.env.HOROSCOPE_LLM_API_KEY || process.env.GEMINI_API_KEY || '';
}

function getModelConfig() {
  const baseUrl = (process.env.HOROSCOPE_LLM_BASE_URL ||
    'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
  const model = process.env.HOROSCOPE_LLM_MODEL || 'gemini-flash-latest';
  return { baseUrl, model };
}

/**
 * One Gemini call for all 12 rashi readings (saves quota vs 12 round-trips).
 * Returns a Map rashiIndex → { summary, guidance }, or null on failure.
 * @param {object[]} signals
 * @param {object[]} templateReadings - parallel array from templates
 */
async function rewriteBatchWithLlm(signals, templateReadings) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const { baseUrl, model } = getModelConfig();
  const system = [
    'You write brief daily Hindu rashiphalam (horoscope) prose for all 12 rashis.',
    'Return ONLY valid JSON with a readings array; each item has rashiIndex, summary.ml, summary.en, guidance.ml, guidance.en.',
    'No medical, legal, or financial guarantees. Keep each field to 1-2 sentences.',
    'Malayalam must be natural Malayalam script; English clear and calm.',
    'Include exactly one reading per input rashiIndex.'
  ].join(' ');

  const user = JSON.stringify({
    items: signals.map((signal, i) => ({
      rashiIndex: signal.rashiIndex,
      rashi: signal.rashi,
      tone: signal.tone,
      score: signal.score,
      themes: signal.themes,
      factors: signal.factors,
      templateHint: templateReadings[i]
    }))
  });

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    const res = await fetch(`${baseUrl}/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.6,
          responseMimeType: 'application/json',
          responseSchema: BATCH_SCHEMA
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timer);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data.error && data.error.message) || res.statusText;
      console.warn(`[horoscope/llm] Gemini ${res.status}: ${String(msg).slice(0, 200)}`);
      return null;
    }

    const content =
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;
    if (!content) {
      console.warn('[horoscope/llm] Gemini returned empty candidates');
      return null;
    }

    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.readings) || parsed.readings.length === 0) {
      console.warn('[horoscope/llm] Gemini JSON missing readings[]');
      return null;
    }

    const map = new Map();
    for (const item of parsed.readings) {
      if (
        item == null ||
        !Number.isInteger(item.rashiIndex) ||
        !item.summary || !item.guidance ||
        !item.summary.ml || !item.summary.en ||
        !item.guidance.ml || !item.guidance.en
      ) {
        continue;
      }
      map.set(item.rashiIndex, {
        summary: { ml: String(item.summary.ml), en: String(item.summary.en) },
        guidance: { ml: String(item.guidance.ml), en: String(item.guidance.en) }
      });
    }
    if (map.size === 0) {
      console.warn('[horoscope/llm] No valid readings in Gemini response');
      return null;
    }
    return map;
  } catch (err) {
    console.warn('[horoscope/llm] Gemini request failed:', err.message || err);
    return null;
  }
}

/**
 * Single-rashi rewrite (kept for tests / callers). Prefer rewriteBatchWithLlm in production.
 */
async function rewriteWithLlm(signal, templateReading) {
  const map = await rewriteBatchWithLlm([signal], [templateReading]);
  if (!map) return null;
  return map.get(signal.rashiIndex) || null;
}

module.exports = { rewriteWithLlm, rewriteBatchWithLlm, getApiKey };
