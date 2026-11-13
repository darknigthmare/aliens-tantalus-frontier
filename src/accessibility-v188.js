// V188 — accessibility options validated in bible §45.1 (P1-5, §53.8):
// colour-blind correction, text size, captions for important sounds and a
// complete keyboard remapping layer for the J1 gameplay actions.

export const COLORBLIND_MODES_V188 = Object.freeze(['off', 'protanopia', 'deuteranopia', 'tritanopia']);
// Colour-vision deficiency *simulation* matrices (sRGB approximation). They are
// not applied to the screen: a simulation filter shows players what they
// already see. Tests use them to check the dedicated signal palette
// (src/colorblind-palette-v188.js), which is what the colour-blind modes change.
export const COLORBLIND_MATRICES_V188 = Object.freeze({
  protanopia: '0.5667 0.4333 0 0 0  0.5583 0.4417 0 0 0  0 0.2417 0.7583 0 0  0 0 0 1 0',
  deuteranopia: '0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0',
  tritanopia: '0.95 0.05 0 0 0  0 0.4333 0.5667 0 0  0 0.475 0.525 0 0  0 0 0 1 0'
});
export const TEXT_SCALES_V188 = Object.freeze([1, 1.15, 1.3]);

export const normalizeColorblindV188 = value => COLORBLIND_MODES_V188.includes(value) ? value : 'off';
export const normalizeTextScaleV188 = value => TEXT_SCALES_V188.includes(Number(value)) ? Number(value) : 1;

export function installColorblindFiltersV188(document = globalThis.document) {
  if (!document?.body || document.getElementById('atf-colorblind-filters-v188')) return false;
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  svg.id = 'atf-colorblind-filters-v188'; svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
  for (const [mode, values] of Object.entries(COLORBLIND_MATRICES_V188)) {
    const filter = document.createElementNS(ns, 'filter'), matrix = document.createElementNS(ns, 'feColorMatrix');
    filter.id = `atf-cb-${mode}-v188`; matrix.setAttribute('type', 'matrix'); matrix.setAttribute('values', values);
    filter.append(matrix); svg.append(filter);
  }
  document.body.append(svg); return true;
}

export function applyAccessibilityV188(settings = {}, document = globalThis.document) {
  const root = document?.documentElement; if (!root) return;
  root.dataset.colorblindV188 = normalizeColorblindV188(settings.colorblindV188);
  root.style.setProperty('--atf-text-scale-v188', String(normalizeTextScaleV188(settings.textScaleV188)));
  root.dataset.textScaleV188 = String(normalizeTextScaleV188(settings.textScaleV188));
}

// —— Captions for important sounds (only when subtitles are on) ——
const SOUND_CAPTIONS = Object.freeze({
  'alarm-general': ['[Alarme générale]', '[General alarm]'], 'alarm-quarantine': ['[Alarme de quarantaine]', '[Quarantine alarm]'],
  'alarm-countdown': ['[Compte à rebours]', '[Countdown]'], 'tracker-false-echo': ['[Détecteur : écho incertain]', '[Tracker: uncertain echo]'],
  'door-forced': ['[Porte forcée]', '[Door forced]'], 'airlock-pressurize': ['[Sas : pressurisation]', '[Airlock pressurizing]'],
  'airlock-depressurize': ['[Sas : dépressurisation]', '[Airlock depressurizing]'], 'lift-arrive': ['[Ascenseur arrivé]', '[Lift arrived]'],
  'cry-drone': ['[Cri de xénomorphe]', '[Xenomorph cry]'], 'cry-warrior': ['[Cri de guerrier]', '[Warrior cry]'],
  'cry-runner': ['[Cri de rôdeur]', '[Runner cry]'], 'cry-spitter': ['[Cracheur, gargouillement]', '[Spitter gurgle]'],
  'cry-crusher': ['[Grondement de Crusher]', '[Crusher roar]'], 'cry-queen': ['[Hurlement de la Reine]', '[Queen shriek]'],
  'cry-facehugger': ['[Grattements rapides]', '[Fast skittering]'], 'cry-chestburster': ['[Cri aigu]', '[High-pitched shriek]'],
  'weapon-dry-fire': ['[Clic à vide]', '[Dry fire click]']
});
export const CAPTIONED_SOUNDS_V188 = Object.freeze(Object.keys(SOUND_CAPTIONS));
export function soundCaptionV188(cueId, language = 'fr') {
  const entry = SOUND_CAPTIONS[cueId]; return entry ? entry[language === 'en' ? 1 : 0] : null;
}

// —— Key remapping ——
export const KEY_ACTIONS_V188 = Object.freeze([
  { id: 'left', code: 'KeyA', fr: 'Gauche', en: 'Left' }, { id: 'right', code: 'KeyD', fr: 'Droite', en: 'Right' },
  { id: 'up', code: 'KeyW', fr: 'Monter / ascenseur', en: 'Up / lift' }, { id: 'down', code: 'KeyS', fr: 'Descendre', en: 'Down' },
  { id: 'jump', code: 'Space', fr: 'Sauter / franchir', en: 'Jump / vault' }, { id: 'fire', code: 'KeyF', fr: 'Tirer', en: 'Fire' },
  { id: 'interact', code: 'KeyE', fr: 'Utiliser', en: 'Use' }, { id: 'tracker', code: 'KeyQ', fr: 'Détecteur', en: 'Tracker' },
  { id: 'reload', code: 'KeyR', fr: 'Recharger', en: 'Reload' }, { id: 'crawl', code: 'KeyC', fr: 'Ramper', en: 'Crawl' },
  { id: 'aim', code: 'ShiftLeft', fr: 'Viser', en: 'Aim' }, { id: 'crouch', code: 'KeyZ', fr: 'S’accroupir', en: 'Crouch' }, { id: 'pause', code: 'KeyP', fr: 'Pause', en: 'Pause' },
  { id: 'objectives', code: 'KeyM', fr: 'Objectifs', en: 'Objectives' }
].map(Object.freeze));
const CODE = /^(Key[A-Z]|Digit[0-9]|Numpad[0-9]|Arrow(Up|Down|Left|Right)|Space|Shift(Left|Right)|Control(Left|Right)|Alt(Left|Right)|Tab|Backquote|Minus|Equal|BracketLeft|BracketRight|Semicolon|Quote|Comma|Period|Slash|Backslash)$/;

export function defaultKeyBindingsV188() { return Object.fromEntries(KEY_ACTIONS_V188.map(action => [action.id, action.code])); }

/** Valid codes only, one action per physical key. An action whose requested
 * key conflicts takes its default if free, else stays unbound (null). */
export function normalizeKeyBindingsV188(raw) {
  if (!raw || typeof raw !== 'object') return defaultKeyBindingsV188();
  const result = {}, used = new Set();
  for (const action of KEY_ACTIONS_V188) {
    const requested = raw[action.id] === null ? null : typeof raw[action.id] === 'string' && CODE.test(raw[action.id]) ? raw[action.id] : action.code;
    if (requested && !used.has(requested)) { result[action.id] = requested; used.add(requested); }
  }
  for (const action of KEY_ACTIONS_V188) if (!(action.id in result)) {
    result[action.id] = used.has(action.code) ? null : action.code; if (result[action.id]) used.add(action.code);
  }
  return result;
}

/** physical code → code the game expects. A default key moved elsewhere and
 * not reused by another action maps to null (swallowed). */
export function buildKeyTranslationV188(bindings) {
  const normalized = normalizeKeyBindingsV188(bindings), map = new Map();
  for (const action of KEY_ACTIONS_V188) {
    const physical = normalized[action.id];
    if (physical && physical !== action.code) map.set(physical, action.code);
  }
  for (const action of KEY_ACTIONS_V188) if (normalized[action.id] !== action.code && !map.has(action.code)) map.set(action.code, null);
  return map;
}

const typing = target => Boolean(target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName || '')));

/** Capture-phase translation: gameplay listeners keep reading event.code. */
export function installKeyRemapV188(target = globalThis, getBindings = () => null, { KeyboardEventCtor = globalThis.KeyboardEvent } = {}) {
  if (!target?.addEventListener || target.keyRemapInstalledV188) return false;
  target.keyRemapInstalledV188 = true;
  let translation = buildKeyTranslationV188(getBindings()), source = JSON.stringify(getBindings() || null);
  const handler = event => {
    if (event.remappedV188 || typing(event.target)) return;
    const current = JSON.stringify(getBindings() || null);
    if (current !== source) { source = current; translation = buildKeyTranslationV188(getBindings()); }
    if (!translation.has(event.code)) return;
    event.stopImmediatePropagation(); event.preventDefault?.();
    const code = translation.get(event.code); if (!code || !KeyboardEventCtor) return;
    const copy = new KeyboardEventCtor(event.type, { code, key: event.key, repeat: event.repeat, bubbles: true, cancelable: true,
      shiftKey: event.shiftKey, ctrlKey: event.ctrlKey, altKey: event.altKey, metaKey: event.metaKey });
    Object.defineProperty(copy, 'remappedV188', { value: true });
    (event.target?.dispatchEvent ? event.target : target).dispatchEvent(copy);
  };
  target.addEventListener('keydown', handler, true); target.addEventListener('keyup', handler, true);
  return true;
}

/** Minimal settings UI: one button per action, press a key to assign. */
export function mountKeyBindingsUiV188(container, { getBindings, onChange, language = 'fr', document = globalThis.document } = {}) {
  if (!container || !document) return null;
  const render = () => {
    const bindings = normalizeKeyBindingsV188(getBindings?.());
    container.replaceChildren(...KEY_ACTIONS_V188.map(action => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'button key-binding-v188'; button.dataset.actionV188 = action.id;
      button.textContent = `${language === 'en' ? action.en : action.fr} · ${bindings[action.id] || '—'}`;
      button.onclick = () => {
        button.textContent = `${language === 'en' ? action.en : action.fr} · …`;
        const capture = event => {
          event.preventDefault(); event.stopImmediatePropagation();
          document.removeEventListener('keydown', capture, true);
          if (event.code !== 'Escape') onChange?.(normalizeKeyBindingsV188({ ...bindings, [action.id]: event.code }));
          render();
        };
        document.addEventListener('keydown', capture, true);
      };
      return button;
    }), Object.assign(document.createElement('button'), { type: 'button', className: 'button', textContent: language === 'en' ? 'Reset controls' : 'Commandes par défaut',
      onclick: () => { onChange?.(defaultKeyBindingsV188()); render(); } }));
  };
  render(); return { render };
}
