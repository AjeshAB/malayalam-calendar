'use strict';

const SUMMARIES = {
  favourable: {
    work: {
      en: 'A supportive day for {rashi}: progress at work comes more easily when you act with clarity.',
      ml: '{rashi}ക്ക് അനുകൂലമായ ദിനം: വ്യക്തതയോടെ പ്രവർത്തിച്ചാൽ ജോലിയിൽ പുരോഗതി ലഭിക്കാം.'
    },
    health: {
      en: '{rashi} may feel steadier energy today — keep routines gentle and consistent.',
      ml: '{rashi}ക്ക് ഇന്ന് ഊർജ്ജം സ്ഥിരമായിരിക്കാം — ദിനചര്യ ലളിതവും സ്ഥിരവുമാക്കുക.'
    },
    relationships: {
      en: 'Warm exchanges favour {rashi}; listening brings goodwill closer.',
      ml: '{rashi}ക്ക് ബന്ധങ്ങളിൽ ആർദ്രത; ശ്രദ്ധയോടെ കേൾക്കുന്നത് ഗുണം ചെയ്യും.'
    },
    travel: {
      en: 'Short travel or movement looks helpful for {rashi} if planned without hurry.',
      ml: '{rashi}ക്ക് ചെറിയ യാത്രകൾ ഗുണകരം — തിരക്കില്ലാതെ ആസൂത്രണം ചെയ്യുക.'
    },
    finance: {
      en: 'Practical money decisions suit {rashi} today; avoid impulsive spends.',
      ml: '{rashi}ക്ക് പ്രായോഗിക സാമ്പത്തിക തീരുമാനങ്ങൾ അനുകൂലം; ആവേശ ചെലവ് ഒഴിവാക്കുക.'
    }
  },
  mixed: {
    work: {
      en: 'A mixed day for {rashi} at work — steady effort beats rushing for results.',
      ml: '{rashi}ക്ക് ജോലിയിൽ മിശ്രഫലം — ധൃതിയേക്കാൾ സ്ഥിരമായ ശ്രമം നല്ലത്.'
    },
    health: {
      en: '{rashi} should pace the day: rest when needed, stay hydrated and calm.',
      ml: '{rashi} ദിനം ക്രമീകരിക്കുക: ആവശ്യമുള്ള വിശ്രമം, ശാന്തത നിലനിർത്തുക.'
    },
    relationships: {
      en: 'For {rashi}, patience in conversations prevents small frictions from growing.',
      ml: '{rashi}ക്ക് സംഭാഷണത്തിൽ ക്ഷമ ചെറിയ അസ്വാരസ്യങ്ങൾ വളരാതിരിക്കാൻ സഹായിക്കും.'
    },
    travel: {
      en: 'Travel for {rashi} is workable with buffers; expect minor delays.',
      ml: '{rashi}ക്ക് യാത്ര സാധ്യം — ചെറിയ കാലതാമസത്തിന് ഇടം നൽകുക.'
    },
    finance: {
      en: '{rashi} does best reviewing money plans carefully before committing.',
      ml: '{rashi} സാമ്പത്തിക പദ്ധതികൾ ഉറപ്പിക്കുന്നതിന് മുൻപ് ശ്രദ്ധയോടെ പരിശോധിക്കുക.'
    }
  },
  cautious: {
    work: {
      en: 'A cautious day for {rashi} at work — double-check details and avoid hasty promises.',
      ml: '{rashi}ക്ക് ജോലിയിൽ ജാഗ്രതയുടെ ദിനം — വിശദാംശങ്ങൾ പരിശോധിച്ച് തിടുക്കമുള്ള വാഗ്ദാനം ഒഴിവാക്കുക.'
    },
    health: {
      en: '{rashi} benefits from lighter schedules and extra care with rest and meals.',
      ml: '{rashi}ക്ക് ലഘുവായ ഷെഡ്യൂളും വിശ്രമ-ഭക്ഷണ ശ്രദ്ധയും ഗുണം ചെയ്യും.'
    },
    relationships: {
      en: 'For {rashi}, softer words and fewer assumptions keep relationships smoother.',
      ml: '{rashi}ക്ക് മൃദുവായ വാക്കുകളും കുറഞ്ഞ അനുമാനങ്ങളും ബന്ധങ്ങൾ സുഗമമാക്കും.'
    },
    travel: {
      en: 'Postpone non-essential travel for {rashi} if possible; go slow when you must move.',
      ml: '{rashi}ക്ക് അനിവാര്യമല്ലാത്ത യാത്ര മാറ്റിവയ്ക്കുക; പോകേണ്ടിവന്നാൽ ശ്രദ്ധയോടെ.'
    },
    finance: {
      en: '{rashi} should avoid speculative money moves and stick to known plans.',
      ml: '{rashi} ഊഹാധിഷ്ഠിത സാമ്പത്തിക നീക്കങ്ങൾ ഒഴിവാക്കി അറിയാവുന്ന പദ്ധതിയിൽ നിലകൊള്ളുക.'
    }
  }
};

const GUIDANCE = {
  favourable: {
    en: 'Use the favourable window for one clear priority, and note Rahukalam before big starts.',
    ml: 'അനുകൂല സമയം ഒരു പ്രധാന കാര്യത്തിന് ഉപയോഗിക്കുക; വലിയ തുടക്കങ്ങൾക്ക് മുൻപ് രാഹുകാലം ശ്രദ്ധിക്കുക.'
  },
  mixed: {
    en: 'Keep expectations moderate; finish what you start and leave room for adjustments.',
    ml: 'പ്രതീക്ഷകൾ മിതമായി വയ്ക്കുക; തുടങ്ങിയത് പൂർത്തിയാക്കുക, മാറ്റങ്ങൾക്ക് ഇടം നൽകുക.'
  },
  cautious: {
    en: 'Prefer review and preparation over new commitments; honour rest and timing windows.',
    ml: 'പുതിയ ഉത്തരവാദിത്തങ്ങളേക്കാൾ അവലോകനവും തയ്യാറെടുപ്പും നല്ലത്; വിശ്രമവും സമയവും ബഹുമാനിക്കുക.'
  }
};

function fill(template, rashiName) {
  return template.replace(/\{rashi\}/g, rashiName);
}

/**
 * @param {object} signal
 * @returns {{ summary: {ml,en}, guidance: {ml,en}, source: 'template' }}
 */
function renderFromTemplate(signal) {
  const tone = SUMMARIES[signal.tone] ? signal.tone : 'mixed';
  const theme = (signal.themes && signal.themes[0]) || 'work';
  const bank = SUMMARIES[tone][theme] || SUMMARIES[tone].work;
  const guide = GUIDANCE[tone] || GUIDANCE.mixed;

  return {
    summary: {
      ml: fill(bank.ml, signal.rashi.ml),
      en: fill(bank.en, signal.rashi.en)
    },
    guidance: {
      ml: guide.ml,
      en: guide.en
    },
    source: 'template'
  };
}

module.exports = { renderFromTemplate, SUMMARIES, GUIDANCE };
