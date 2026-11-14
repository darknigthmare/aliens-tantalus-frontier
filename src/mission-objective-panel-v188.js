// V188 — objective always reachable in mission (bible §53.9, P0-4).
// The pause overlay lists the operation objective, the step list and the save
// rule of the register; M shows the same panel for a few seconds in play.
import { currentLanguageV185 } from './i18n-v185.js';
import { autoTranslateV185 } from './i18n-auto-v185.js';
import { missionRegisterProfileV188 } from './mission-register-v188.js';

// Player-facing labels of the generic campaign objectives (CAMPAIGNS[].objective,
// content.js). The content keeps its English keys as identifiers; only the
// displayed words change. [PROPOSÉ] wording written for the project, not quoted.
export const CAMPAIGN_OBJECTIVE_LABELS_V188 = Object.freeze({
  'board a drifting vessel': Object.freeze({ fr: 'Aborder un vaisseau à la dérive', en: 'Board a drifting vessel' }),
  'capture a live organism': Object.freeze({ fr: 'Capturer un organisme vivant', en: 'Capture a live organism' }),
  'defend the colony': Object.freeze({ fr: 'Défendre la colonie', en: 'Defend the colony' }),
  'destroy a neuro-link relay': Object.freeze({ fr: 'Détruire un relais Neuro-Link', en: 'Destroy a Neuro-Link relay' }),
  'escape the quarantine': Object.freeze({ fr: 'Échapper à la quarantaine', en: 'Escape the quarantine' }),
  'escort a colony convoy': Object.freeze({ fr: 'Escorter un convoi colonial', en: 'Escort a colony convoy' }),
  'hold the extraction zone': Object.freeze({ fr: 'Tenir la zone d’extraction', en: 'Hold the extraction zone' }),
  'investigate the ghost cargo': Object.freeze({ fr: 'Enquêter sur la cargaison fantôme', en: 'Investigate the ghost cargo' }),
  'navigate the vent network': Object.freeze({ fr: 'Traverser le réseau de ventilation', en: 'Navigate the vent network' }),
  'purge a reactor nest': Object.freeze({ fr: 'Purger un nid du réacteur', en: 'Purge a reactor nest' }),
  'recover a synthetic': Object.freeze({ fr: 'Récupérer un synthétique', en: 'Recover a synthetic' }),
  'recover black-box data': Object.freeze({ fr: 'Récupérer les données de la boîte noire', en: 'Recover the black-box data' }),
  'rescue survivors': Object.freeze({ fr: 'Secourir les survivants', en: 'Rescue the survivors' }),
  'restore atmospheric processing': Object.freeze({ fr: 'Rétablir le traitement atmosphérique', en: 'Restore atmospheric processing' }),
  'seal the hive': Object.freeze({ fr: 'Sceller la ruche', en: 'Seal the hive' }),
  'secure the power loader': Object.freeze({ fr: 'Sécuriser le Power Loader', en: 'Secure the Power Loader' }),
  'track an apex specimen': Object.freeze({ fr: 'Traquer un spécimen alpha', en: 'Track an apex specimen' }),
  // Default written by game-runtime.js when a plan carries no objective.
  'secure the frontier': Object.freeze({ fr: 'Sécuriser la frontière', en: 'Secure the frontier' })
});
// Identifier-shaped objective without a label yet: a generic order, never the raw key.
export const CAMPAIGN_OBJECTIVE_FALLBACK_V188 = Object.freeze({ fr: 'Mener l’opération à terme', en: 'Complete the operation' });
const OBJECTIVE_KEY_SHAPE_V188 = /^[a-z0-9][a-z0-9 '’-]*$/u;

/** Player-facing objective label. Authored French sentences pass through (English
 * from the reviewed catalog); identifier-shaped keys use the mapping or the
 * generic fallback. DOM callers pass 'fr' and let the catalog translate live. */
export function campaignObjectiveLabelV188(objective, language = 'fr') {
  const lang = language === 'en' ? 'en' : 'fr';
  const raw = String(objective ?? '').trim();
  if (!raw) return '';
  const known = Object.hasOwn(CAMPAIGN_OBJECTIVE_LABELS_V188, raw.toLowerCase()) ? CAMPAIGN_OBJECTIVE_LABELS_V188[raw.toLowerCase()] : null;
  if (known) return known[lang];
  if (OBJECTIVE_KEY_SHAPE_V188.test(raw)) return CAMPAIGN_OBJECTIVE_FALLBACK_V188[lang];
  return lang === 'en' ? autoTranslateV185(raw) : raw;
}

export const OBJECTIVE_PANEL_V188 = Object.freeze({ schema: 188, peekSeconds: 4, key: 'KeyM' });

const LABELS = Object.freeze({
  fr: { title: 'OBJECTIFS', power: 'Rétablir l’énergie', route: 'Sécuriser la route', boss: 'Neutraliser la menace principale',
    archive: 'Récupérer les archives', extract: 'Rejoindre l’extraction', register: 'Registre', hint: 'M : objectifs',
    save: { free: 'Sauvegarde libre hors combat', terminal: 'Sauvegarde au terminal sécurisé', checkpoint: 'Checkpoints seulement' } },
  en: { title: 'OBJECTIVES', power: 'Restore power', route: 'Secure the route', boss: 'Neutralise the main threat',
    archive: 'Recover the archives', extract: 'Reach extraction', register: 'Register', hint: 'M: objectives',
    save: { free: 'Free save out of combat', terminal: 'Save at the secured terminal', checkpoint: 'Checkpoints only' } }
});
const REGISTER_EN = Object.freeze({ horror: 'Horror', tension: 'Tension', action: 'Action', calm: 'Calm' });
const ORDER = ['power', 'route', 'boss', 'archive', 'extract'];

/** Pure: the lines shown by the panel. A step already true at start (absent
 * from this map) is not listed, so the player only sees real tasks. */
export function buildObjectivePanelV188({ campaignObjective = '', objectives = null, initial = null, register = 'tension', language = 'fr', steps: authored = null } = {}) {
  const text = LABELS[language === 'en' ? 'en' : 'fr'], profile = missionRegisterProfileV188(register);
  // A mission with its own steps (QZ-18 investigation) lists them in its order and words.
  const steps = Array.isArray(authored) ? authored.map(step => Object.freeze({ key: String(step.key), label: String(step.label), done: Boolean(step.done) }))
    : ORDER.filter(key => objectives && key in objectives && (key === 'extract' || initial?.[key] === false))
      .map(key => Object.freeze({ key, label: text[key], done: Boolean(objectives[key]) }));
  const saveMode = profile.save.free ? 'free' : profile.save.terminal ? 'terminal' : 'checkpoint';
  const registerLabel = language === 'en' ? REGISTER_EN[profile.id] : profile.label;
  return Object.freeze({ title: text.title, campaignObjective: campaignObjectiveLabelV188(campaignObjective, language), steps: Object.freeze(steps),
    footer: `${text.register} : ${registerLabel} · ${text.save[saveMode]}`, hint: text.hint });
}

function wrap(ctx, text, width) {
  const words = String(text).split(/\s+/), lines = []; let line = '';
  for (const word of words) {
    const next = line ? line + ' ' + word : word;
    if (line && (ctx.measureText?.(next)?.width || next.length * 8) > width) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line); return lines.slice(0, 3);
}

export function drawObjectivePanelV188(ctx, model, { x = 340, y = 400, width = 600 } = {}) {
  if (!ctx || !model) return;
  ctx.save(); ctx.textAlign = 'left';
  const body = wrap(ctx, model.campaignObjective, width - 32), height = 64 + body.length * 20 + model.steps.length * 22;
  ctx.fillStyle = 'rgba(4, 12, 9, .9)'; ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = 'rgba(131, 213, 161, .55)'; ctx.strokeRect(x + .5, y + .5, width - 1, height - 1);
  ctx.fillStyle = '#83d5a1'; ctx.font = '700 14px monospace'; ctx.fillText(model.title, x + 16, y + 22);
  ctx.fillStyle = '#d8e6d8'; ctx.font = '15px sans-serif';
  body.forEach((line, index) => ctx.fillText(line, x + 16, y + 46 + index * 20));
  let row = y + 50 + body.length * 20;
  for (const step of model.steps) {
    ctx.fillStyle = step.done ? '#79d69a' : '#d5b562'; ctx.font = '14px monospace';
    ctx.fillText(`${step.done ? '■' : '□'} ${step.label}`, x + 16, row + 4); row += 22;
  }
  ctx.fillStyle = '#9fb5a6'; ctx.font = '12px monospace'; ctx.fillText(model.footer, x + 16, row + 6);
  ctx.restore();
}

export function withMissionObjectivePanelV188(Base) {
  if (Base.missionObjectivePanelRuntimeV188) return Base;
  return class MissionObjectivePanelV188 extends Base {
    static missionObjectivePanelRuntimeV188 = true;
    start(options = {}) {
      this.objectivePeekV188 = 0;
      const result = super.start(options);
      this.initialObjectivesV188 = this.mission?.objectives ? { ...this.mission.objectives } : null;
      if (!this.objectiveKeyBoundV188 && typeof globalThis.addEventListener === 'function') {
        this.objectiveKeyBoundV188 = true;
        globalThis.addEventListener('keydown', event => {
          if (!this.running || event.repeat || event.code !== OBJECTIVE_PANEL_V188.key) return;
          if (this.canRouteGameplayKey && !this.canRouteGameplayKey(event)) return;
          this.showObjectivesV188();
        });
      }
      return result;
    }
    showObjectivesV188(seconds = OBJECTIVE_PANEL_V188.peekSeconds) { this.objectivePeekV188 = seconds; return true; }
    objectivePanelModelV188() {
      let language = 'fr'; try { language = currentLanguageV185(); } catch {}
      const authored = this.objectivePanelContentV188?.(language) || null;
      return buildObjectivePanelV188({ campaignObjective: authored?.campaignObjective || this.missionPlan?.campaign?.objective || this.campaign?.objective || '',
        objectives: this.mission?.objectives, initial: this.initialObjectivesV188, register: this.missionRegisterV188, language, steps: authored?.steps || null });
    }
    update(delta) {
      if (this.objectivePeekV188 > 0 && Number.isFinite(delta)) this.objectivePeekV188 = Math.max(0, this.objectivePeekV188 - delta);
      return super.update(delta);
    }
    drawHud(ctx) {
      super.drawHud(ctx);
      if (this.objectivePeekV188 > 0 && !this.paused) drawObjectivePanelV188(ctx, this.objectivePanelModelV188(), { y: 470 });
    }
    drawStateOverlay(ctx) {
      super.drawStateOverlay(ctx);
      if (this.paused && this.mission?.state === 'active') drawObjectivePanelV188(ctx, this.objectivePanelModelV188(), { y: 400 });
    }
    getSnapshot() { return { ...super.getSnapshot(), objectivePanelV188: this.mission ? this.objectivePanelModelV188() : null }; }
  };
}
