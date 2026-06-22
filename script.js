/**
 * Lyra — Cultural Synthesis
 * FastAPI translate endpoint integration
 */

const API_URL = 'https://utkmst-lyra-api.hf.space/translate';

const LANGUAGE_SUGGESTIONS = [
  'Japanese (Business)',
  'French (Casual)',
  'Arabic (Formal)',
  'English (Professional)',
  'Turkish',
  'German (Formal)',
  'Spanish (Casual)',
  'Korean (Business)',
  'Chinese (Simplified)',
  'Italian',
  'Portuguese (Brazil)',
  'Russian (Formal)',
  'Hindi',
  'Dutch',
  'Swedish',
];

const PERSONA_SUGGESTIONS = [
  'Diplomatic',
  'Direct',
  'Poetic',
  'Professional',
  'Casual',
  'Academic',
  'Empathetic',
  'Humorous',
  'Persuasive',
  'Concise',
  'Storytelling',
  'Technical',
];

const DEFAULT_LANGUAGE = 'Japanese (Business)';
const DEFAULT_PERSONA = 'Diplomatic';

/** @type {HTMLElement | null} */
let activeAutocomplete = null;

/** @type {{ id: string; source: string; targetLanguage: string; persona: string; output: string; coreMeaning?: string; valence?: string; speechAct?: string; timestamp: number }[]} */
const sessionHistory = [];

/** @type {any | null} */
let lastEnginePayload = null;

/** App state for section + settings */
const appState = {
  activeSection: 'translate',
  uiLanguage: 'en',
  theme: 'cosmic',
  effectsEnabled: true,
  dynamicBackground: true,
};

const UI_COPY = {
  en: {
    brand: { tagline: 'Cultural Synthesis' },
    nav: { translate: 'Translate', history: 'History', settings: 'Settings', engine: 'Engine' },
    label: {
      targetContext: 'Target Context',
      nuanceProfile: 'Nuance Profile',
      originalConcept: 'Original Concept',
      synthesizedOutput: 'Synthesized Output',
      autoDetect: 'Auto-Detect',
    },
    placeholder: {
      language: 'Type a language...',
      persona: 'Type a persona...',
      source: 'Enter text or drop a document here to begin cultural synthesis...',
    },
    action: { synthesize: 'Synthesize', loading: 'Loading...', copy: 'Copy to clipboard' },
    status: {
      awaiting: 'Awaiting input for synthesis...',
      emptySource: 'Enter source text to begin synthesis.',
      failed: 'Translation failed. Check the console for details.',
    },
    history: {
      subtitle: 'Session-only timeline of your recent syntheses.',
      clear: 'Clear Session',
      empty: 'No history yet. Run a synthesis to start building this session\'s timeline.',
      output: 'Output',
    },
    settings: {
      subtitle: 'Tune Lyra\'s mood, motion, and interface language.',
      themeTitle: 'Theme',
      themeDesc: 'Choose the color universe for gradients and accents.',
      effectsTitle: 'Effects',
      effectsDesc: 'Control motion and glow for focus-friendly sessions.',
      dynamicLights: 'Dynamic Lights',
      dynamicLightsDesc: 'Toggle the rotating aurora rings.',
      dynamicBackground: 'Dynamic Background',
      dynamicBackgroundDesc: 'When off, freezes the current video frame.',
      languageTitle: 'Interface Language',
      languageDesc: 'Affects interface labels, not synthesized text.',
      on: 'ON',
      off: 'OFF',
    },
    theme: {
      cosmic: 'Cosmic',
      cosmicDesc: 'Default Lyra palette',
      aurora: 'Aurora',
      auroraDesc: 'Cool green & cyan',
      rose: 'Rose Nebula',
      roseDesc: 'Warm, storytelling',
    },
    engine: {
      subtitle: 'Peek into Lyra\'s Stage 1 brain for your latest synthesis.',
      empty: 'No engine data yet. Run a synthesis to inspect its semantic anatomy.',
      coreMeaning: 'Core Meaning',
      coreMeaningDesc: 'Neutral semantic backbone',
      valence: 'Valence',
      speechAct: 'Speech Act',
      noCore: 'No core meaning available for this run.',
      noSpeechAct: 'Unspecified speech act',
      noEntities: 'No salient named entities were highlighted for this utterance.',
    },
  },
  tr: {
    brand: { tagline: 'Kültürel Sentez' },
    nav: { translate: 'Çeviri', history: 'Geçmiş', settings: 'Ayarlar', engine: 'Motor' },
    label: {
      targetContext: 'Hedef Bağlam',
      nuanceProfile: 'Nüans Profili',
      originalConcept: 'Orijinal Konsept',
      synthesizedOutput: 'Sentetik Çıktı',
      autoDetect: 'Otomatik Algıla',
    },
    placeholder: {
      language: 'Bir dil yazın...',
      persona: 'Bir persona yazın...',
      source: 'Kültürel sentez için metin girin veya belge bırakın...',
    },
    action: { synthesize: 'Sentezle', loading: 'Yükleniyor...', copy: 'Panoya kopyala' },
    status: {
      awaiting: 'Sentez için giriş bekleniyor...',
      emptySource: 'Başlamak için kaynak metin girin.',
      failed: 'Çeviri başarısız. Konsolu kontrol edin.',
    },
    history: {
      subtitle: 'Bu oturumdaki son sentezlerinizin zaman çizelgesi.',
      clear: 'Oturumu Temizle',
      empty: 'Henüz geçmiş yok. Bu oturumun zaman çizelgesini oluşturmak için bir sentez çalıştırın.',
      output: 'Çıktı',
    },
    settings: {
      subtitle: 'Lyra\'nın ruh halini, hareketini ve arayüz dilini ayarlayın.',
      themeTitle: 'Tema',
      themeDesc: 'Gradyanlar ve vurgular için renk evrenini seçin.',
      effectsTitle: 'Efektler',
      effectsDesc: 'Odaklanma için hareket ve parıltıyı kontrol edin.',
      dynamicLights: 'Dinamik Işıklar',
      dynamicLightsDesc: 'Dönen aurora halkalarını aç/kapat.',
      dynamicBackground: 'Dinamik Arka Plan',
      dynamicBackgroundDesc: 'Kapalıyken mevcut video karesi dondurulur.',
      languageTitle: 'Arayüz Dili',
      languageDesc: 'Arayüz etiketlerini etkiler, sentez metnini değil.',
      on: 'AÇ',
      off: 'KAP',
    },
    theme: {
      cosmic: 'Kozmik',
      cosmicDesc: 'Varsayılan Lyra paleti',
      aurora: 'Aurora',
      auroraDesc: 'Serin yeşil ve camgöbeği',
      rose: 'Gül Nebulası',
      roseDesc: 'Sıcak, hikaye anlatımı',
    },
    engine: {
      subtitle: 'Son senteziniz için Lyra\'nın Aşama 1 beynine göz atın.',
      empty: 'Henüz motor verisi yok. Anlamsal anatomisini incelemek için bir sentez çalıştırın.',
      coreMeaning: 'Çekirdek Anlam',
      coreMeaningDesc: 'Nötr anlamsal omurga',
      valence: 'Duygu Tonu',
      speechAct: 'Sözcelem',
      noCore: 'Bu çalıştırma için çekirdek anlam mevcut değil.',
      noSpeechAct: 'Belirtilmemiş sözcelem',
      noEntities: 'Bu ifade için belirgin varlık vurgulanmadı.',
    },
  },
};

function t(key) {
  const parts = key.split('.');
  let value = UI_COPY[appState.uiLanguage] || UI_COPY.en;
  for (const part of parts) {
    value = value?.[part];
  }
  if (value === undefined) {
    let fallback = UI_COPY.en;
    for (const part of parts) {
      fallback = fallback?.[part];
    }
    return fallback ?? key;
  }
  return value;
}

function initAutocomplete(inputId, listId, suggestions) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;

  let highlightedIndex = -1;

  const renderSuggestions = (query) => {
    const normalized = query.trim().toLowerCase();
    const filtered = normalized
      ? suggestions.filter((item) => item.toLowerCase().includes(normalized))
      : suggestions;

    list.innerHTML = '';

    if (filtered.length === 0) {
      list.classList.add('hidden');
      highlightedIndex = -1;
      return;
    }

    filtered.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'autocomplete-item';
      li.setAttribute('role', 'option');
      li.dataset.value = item;
      li.textContent = item;

      if (index === highlightedIndex) {
        li.classList.add('is-highlighted');
      }

      li.addEventListener('mousedown', (event) => {
        event.preventDefault();
        input.value = item;
        closeAutocomplete(list);
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      list.appendChild(li);
    });

    list.classList.remove('hidden');
    activeAutocomplete = list;
  };

  const closeAutocomplete = (targetList) => {
    targetList.classList.add('hidden');
    highlightedIndex = -1;
    if (activeAutocomplete === targetList) {
      activeAutocomplete = null;
    }
  };

  const highlightItem = (items) => {
    items.forEach((item, index) => {
      item.classList.toggle('is-highlighted', index === highlightedIndex);
    });
  };

  input.addEventListener('input', () => {
    renderSuggestions(input.value);
  });

  input.addEventListener('focus', () => {
    renderSuggestions(input.value);
  });

  input.addEventListener('blur', () => {
    setTimeout(() => closeAutocomplete(list), 150);
  });

  input.addEventListener('keydown', (event) => {
    const items = list.querySelectorAll('.autocomplete-item');
    if (list.classList.contains('hidden') || items.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlightedIndex = (highlightedIndex + 1) % items.length;
      highlightItem(items);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlightedIndex = highlightedIndex <= 0 ? items.length - 1 : highlightedIndex - 1;
      highlightItem(items);
    } else if (event.key === 'Enter' && highlightedIndex >= 0) {
      event.preventDefault();
      input.value = items[highlightedIndex].dataset.value ?? '';
      closeAutocomplete(list);
    } else if (event.key === 'Escape') {
      closeAutocomplete(list);
    }
  });
}

function setLoading(isLoading) {
  const button = document.getElementById('synthesize-btn');
  const label = document.getElementById('synthesize-label');
  const progressLine = document.getElementById('progress-line');

  if (!button || !label) return;

  button.disabled = isLoading;
  button.classList.toggle('opacity-60', isLoading);
  button.classList.toggle('pointer-events-none', isLoading);
  button.classList.toggle('is-loading', isLoading);
  label.textContent = isLoading ? 'Synthesizing… (first request may take ~30s)' : t('action.synthesize');

  if (progressLine) {
    progressLine.style.width = isLoading ? '100%' : '0';
  }
}

function renderOutput(text, { isPlaceholder = false } = {}) {
  const output = document.getElementById('output-content');
  if (!output) return;

  if (isPlaceholder) {
    output.innerHTML = `
      <div class="text-center">
        <span class="material-symbols-outlined text-[48px] text-white/20 mb-4">translate</span>
        <p class="font-body-md text-on-surface-variant">${text}</p>
      </div>`;
    output.className =
      'font-body-lg text-body-lg text-on-surface leading-relaxed opacity-50 flex items-center justify-center h-full';
    return;
  }

  output.className = 'font-body-lg text-body-lg text-on-surface leading-relaxed whitespace-pre-wrap';
  output.textContent = text;
}

async function synthesize() {
  const sourceText = document.getElementById('source-text');
  const targetLanguage = document.getElementById('target-language');
  const persona = document.getElementById('persona');

  if (!sourceText || !targetLanguage || !persona) return;

  const text = sourceText.value.trim();
  const language = targetLanguage.value.trim() || DEFAULT_LANGUAGE;
  const style = persona.value.trim() || DEFAULT_PERSONA;

  if (!text) {
    renderOutput(t('status.emptySource'), { isPlaceholder: true });
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
      },
      signal: AbortSignal.timeout(60000),
      body: JSON.stringify({
        text,
        target_language: language,
        persona: style,
      }),
    });

    const rawBody = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${rawBody || response.statusText}`);
    }

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      throw new Error(`Invalid JSON response: ${rawBody.slice(0, 120)}`);
    }

    if (!data.final_translation) {
      throw new Error(`Response missing final_translation: ${rawBody.slice(0, 200)}`);
    }

    renderOutput(data.final_translation);

    // Persist engine + history for this session
    lastEnginePayload = data;
    try {
      const item = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        source: text,
        targetLanguage: language,
        persona: style,
        output: data.final_translation,
        coreMeaning: data.extracted_data?.core_meaning ?? '',
        valence: data.extracted_data?.valence ?? '',
        speechAct: data.extracted_data?.speech_act ?? '',
        timestamp: Date.now(),
      };
      sessionHistory.unshift(item);
      renderHistory();
      renderEngine();
    } catch {
      // non-fatal
    }
  } catch (error) {
    console.error('[Lyra] Translation failed:', error);
    renderOutput(t('status.failed'), { isPlaceholder: true });
  } finally {
    setLoading(false);
  }
}

function initCopyButton() {
  const copyBtn = document.getElementById('copy-btn');
  const output = document.getElementById('output-content');
  if (!copyBtn || !output) return;

  copyBtn.addEventListener('click', async () => {
    const text = output.textContent?.trim();
    if (!text || output.querySelector('#output-awaiting') || text.includes(t('status.failed'))) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('[Lyra] Copy failed:', error);
    }
  });
}

function formatTime(ts) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ts));
  } catch {
    return '';
  }
}

function formatDate(ts) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: '2-digit',
    }).format(new Date(ts));
  } catch {
    return '';
  }
}

function renderHistory() {
  const list = document.getElementById('history-list');
  if (!list) return;

  if (sessionHistory.length === 0) {
    list.innerHTML = `
      <div class="col-span-full flex items-center justify-center py-12 text-on-surface-variant">
        <div class="text-center max-w-md">
          <span class="material-symbols-outlined text-[40px] mb-3 text-white/20">history</span>
          <p class="font-body-md">${t('history.empty')}</p>
        </div>
      </div>`;
    return;
  }

  list.innerHTML = sessionHistory
    .map((item) => {
      const date = formatDate(item.timestamp);
      const time = formatTime(item.timestamp);
      const snippet =
        item.source.length > 160 ? `${item.source.slice(0, 157)}…` : item.source;

      return `
        <article class="glass-panel p-4 flex flex-col gap-3">
          <header class="flex items-center justify-between gap-3">
            <div class="text-xs uppercase tracking-[0.22em] text-on-surface-variant">
              ${date ? `${date} · ` : ''}${time}
            </div>
            <div class="flex gap-2 text-[11px] uppercase tracking-[0.16em] text-on-surface-variant">
              <span class="px-2 py-1 rounded-full bg-white/5 border border-white/10">${item.targetLanguage}</span>
              <span class="px-2 py-1 rounded-full bg-white/5 border border-white/10">${item.persona}</span>
            </div>
          </header>
          <div class="text-xs text-on-surface-variant/80 line-clamp-3">${snippet}</div>
          <div class="border-t border-white/5 pt-3 mt-1">
            <div class="text-[11px] uppercase tracking-[0.18em] text-secondary mb-1">${t('history.output')}</div>
            <p class="text-sm text-on-surface leading-relaxed line-clamp-3">${item.output}</p>
          </div>
        </article>`;
    })
    .join('');
}

function renderEngine() {
  const empty = document.getElementById('engine-empty');
  const container = document.getElementById('engine-content');
  if (!empty || !container) return;

  if (!lastEnginePayload) {
    empty.classList.remove('hidden');
    container.classList.add('hidden');
    return;
  }

  const core = document.getElementById('engine-core-meaning');
  const valenceLabel = document.getElementById('engine-valence-label');
  const valenceBar = document.getElementById('engine-valence-bar');
  const valenceIcon = document.getElementById('engine-valence-icon');
  const speechAct = document.getElementById('engine-speech-act');
  const entities = document.getElementById('engine-entities');

  const extracted = lastEnginePayload.extracted_data || {};

  if (core) {
    core.textContent = extracted.core_meaning || t('engine.noCore');
  }

  if (valenceLabel && valenceBar && valenceIcon) {
    const rawValence = (extracted.valence || '').toString().toLowerCase();
    let label = extracted.valence || 'Neutral';
    let percent = 50;
    let icon = 'mood';

    if (rawValence.includes('positive')) {
      percent = 78;
      icon = 'sentiment_satisfied';
    } else if (rawValence.includes('negative')) {
      percent = 24;
      icon = 'sentiment_dissatisfied';
    } else if (rawValence.includes('mixed')) {
      percent = 55;
      icon = 'sentiment_neutral';
    }

    valenceLabel.textContent = label;
    valenceBar.style.width = `${percent}%`;
    valenceIcon.textContent = icon;
  }

  if (speechAct) {
    speechAct.textContent = extracted.speech_act || t('engine.noSpeechAct');
  }

  if (entities) {
    const entitiesText =
      extracted.entities && extracted.entities !== 'none'
        ? extracted.entities
        : t('engine.noEntities');
    entities.textContent = entitiesText;
  }

  empty.classList.add('hidden');
  container.classList.remove('hidden');
}

function setActiveSection(section) {
  appState.activeSection = section;

  const sections = /** @type {NodeListOf<HTMLElement>} */ (
    document.querySelectorAll('.app-section')
  );
  sections.forEach((el) => {
    if (!el.id) return;
    const idSection = el.id.replace('section-', '');
    el.classList.toggle('hidden', idSection !== section);
    el.classList.toggle('is-active', idSection === section);
  });

  const navItems = /** @type {NodeListOf<HTMLButtonElement>} */ (
    document.querySelectorAll('.nav-item')
  );
  navItems.forEach((btn) => {
    const btnSection = btn.dataset.section;
    const active = btnSection === section;
    const icon = btn.querySelector('.material-symbols-outlined');

    btn.classList.toggle('text-secondary', active);
    btn.classList.toggle('text-on-surface-variant', !active);
    btn.classList.toggle('aurora-ring--active', active);

    if (icon instanceof HTMLElement) {
      icon.style.fontVariationSettings = active ? "'FILL' 1" : "'FILL' 0";
    }
  });

  const mobileItems = /** @type {NodeListOf<HTMLButtonElement>} */ (
    document.querySelectorAll('.mobile-nav-item')
  );
  mobileItems.forEach((btn) => {
    const btnSection = btn.dataset.section;
    const label = btn.querySelector('span:last-child');
    const active = btnSection === section;
    btn.classList.toggle('text-secondary', active);
    btn.classList.toggle('text-on-surface-variant', !active);
    if (label) {
      label.classList.toggle('text-secondary', active);
    }
  });

  if (section === 'history') {
    renderHistory();
  } else if (section === 'engine') {
    renderEngine();
  }
}

function applyTheme(theme) {
  appState.theme = theme;
  document.body.dataset.theme = theme;

  document.querySelectorAll('#theme-options .theme-option').forEach((btn) => {
    const isActive = btn.getAttribute('data-theme') === theme;
    btn.classList.toggle('is-active', isActive);
    btn.classList.toggle('aurora-ring--active', isActive);
  });
}

function updateToggleThumb(thumbId, enabled) {
  const thumb = document.getElementById(thumbId);
  if (!thumb) return;
  thumb.textContent = enabled ? t('settings.on') : t('settings.off');
  thumb.classList.toggle('is-on', enabled);
}

function applyEffects(enabled) {
  appState.effectsEnabled = enabled;
  document.body.dataset.effects = enabled ? 'on' : 'off';
  updateToggleThumb('effects-toggle-thumb', enabled);
}

function captureBackgroundFrame() {
  const video = document.getElementById('bg-video');
  const gif = document.getElementById('bg-gif');
  const freeze = document.getElementById('bg-freeze');
  const fallback = document.getElementById('bg-fallback');
  if (!freeze) return false;

  if (video?.classList.contains('is-active') && video.videoWidth > 0) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    freeze.src = canvas.toDataURL('image/jpeg', 0.9);
    video.pause();
    video.classList.remove('is-active');
    gif?.classList.remove('is-active');
    freeze.classList.remove('hidden');
    freeze.classList.add('is-active');
    fallback?.classList.add('is-hidden');
    return true;
  }

  if (gif?.classList.contains('is-active') && gif.naturalWidth > 0) {
    freeze.src = gif.src;
    gif.classList.remove('is-active');
    freeze.classList.remove('hidden');
    freeze.classList.add('is-active');
    fallback?.classList.add('is-hidden');
    return true;
  }

  return false;
}

function applyDynamicBackground(enabled) {
  appState.dynamicBackground = enabled;
  const video = document.getElementById('bg-video');
  const gif = document.getElementById('bg-gif');
  const freeze = document.getElementById('bg-freeze');
  const fallback = document.getElementById('bg-fallback');

  updateToggleThumb('background-toggle-thumb', enabled);

  if (!enabled) {
    if (!captureBackgroundFrame()) {
      fallback?.classList.remove('is-hidden');
    }
    return;
  }

  freeze?.classList.add('hidden');
  freeze?.classList.remove('is-active');

  if (video && !video.error) {
    video.play().catch(() => {});
    video.classList.add('is-active');
    fallback?.classList.add('is-hidden');
    gif?.classList.remove('is-active');
  } else if (gif?.complete && gif.naturalWidth > 0) {
    gif.classList.add('is-active');
    fallback?.classList.add('is-hidden');
  } else {
    fallback?.classList.remove('is-hidden');
  }
}

function applyLanguage(lang) {
  if (!(lang in UI_COPY)) lang = 'en';
  appState.uiLanguage = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
      el.placeholder = t(key);
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) el.title = t(key);
  });

  document.querySelectorAll('.ui-lang-option').forEach((btn) => {
    const isActive = btn.getAttribute('data-lang') === lang;
    btn.classList.toggle('aurora-ring--active', isActive);
  });

  updateToggleThumb('effects-toggle-thumb', appState.effectsEnabled);
  updateToggleThumb('background-toggle-thumb', appState.dynamicBackground);

  const synthesizeBtn = document.getElementById('synthesize-btn');
  if (synthesizeBtn && !synthesizeBtn.classList.contains('is-loading')) {
    const label = document.getElementById('synthesize-label');
    if (label) label.textContent = t('action.synthesize');
  }

  renderHistory();
  renderEngine();
}

function initBackground() {
  const fallback = document.getElementById('bg-fallback');
  const video = document.getElementById('bg-video');
  const gif = document.getElementById('bg-gif');

  const activateMedia = (element) => {
    element?.classList.remove('hidden');
    element?.classList.add('is-active');
    fallback?.classList.add('is-hidden');
  };

  if (video) {
    video.addEventListener('canplay', () => activateMedia(video));
    video.addEventListener('error', () => {
      if (gif?.complete && gif.naturalWidth > 0) {
        activateMedia(gif);
      }
    });
    video.load();
  }

  if (gif) {
    gif.addEventListener('load', () => {
      if (!video?.classList.contains('is-active')) {
        activateMedia(gif);
      }
    });
    gif.addEventListener('error', () => {
      gif.style.display = 'none';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const targetLanguage = document.getElementById('target-language');
  const persona = document.getElementById('persona');
  const synthesizeBtn = document.getElementById('synthesize-btn');

  if (targetLanguage) targetLanguage.value = DEFAULT_LANGUAGE;
  if (persona) persona.value = DEFAULT_PERSONA;

  initAutocomplete('target-language', 'language-suggestions', LANGUAGE_SUGGESTIONS);
  initAutocomplete('persona', 'persona-suggestions', PERSONA_SUGGESTIONS);

  synthesizeBtn?.addEventListener('click', synthesize);

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (!event.target.closest('.autocomplete-wrapper')) {
      document.querySelectorAll('.autocomplete-list').forEach((list) => {
        list.classList.add('hidden');
      });
      activeAutocomplete = null;
    }
  });

  initCopyButton();
  initBackground();

  // Navigation wiring
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((el) => {
    el.addEventListener('click', () => {
      const section = el.getAttribute('data-section') || 'translate';
      setActiveSection(section);
    });
  });

  const mobileItems = document.querySelectorAll('.mobile-nav-item');
  mobileItems.forEach((el) => {
    el.addEventListener('click', () => {
      const section = el.getAttribute('data-section') || 'translate';
      setActiveSection(section);
    });
  });

  // History clear
  const clearBtn = document.getElementById('history-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      sessionHistory.length = 0;
      renderHistory();
    });
  }

  // Theme + effects + language
  document
    .querySelectorAll('#theme-options .theme-option')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme') || 'cosmic';
        applyTheme(theme);
      });
    });

  const effectsToggle = document.getElementById('effects-toggle');
  if (effectsToggle) {
    effectsToggle.addEventListener('click', () => {
      applyEffects(!appState.effectsEnabled);
    });
  }

  const backgroundToggle = document.getElementById('background-toggle');
  if (backgroundToggle) {
    backgroundToggle.addEventListener('click', () => {
      applyDynamicBackground(!appState.dynamicBackground);
    });
  }

  document.querySelectorAll('.ui-lang-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang') || 'en';
      applyLanguage(lang);
    });
  });

  // Initial state
  applyTheme(appState.theme);
  applyEffects(appState.effectsEnabled);
  applyDynamicBackground(appState.dynamicBackground);
  applyLanguage(appState.uiLanguage);
  setActiveSection(appState.activeSection);
});
