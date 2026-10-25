import {
  MISSION_INSERTION_ACTIONS_V62,
  applyMissionInsertionActionV62,
  getActiveMissionInsertionPhaseV62,
  getMissionInsertionReadReceiptV62,
  pauseMissionInsertionV62,
  recordMissionInsertionProgressV62,
  restoreMissionInsertionV62,
  resumeMissionInsertionV62,
  serializeMissionInsertionV62
} from './mission-insertion-v62.js';
import { campaignInsertionStoryV160, chooseCampaignStoryProtocolV160 } from './campaign-story-v160.js';
import { campaignInsertionStoryV161, chooseConvoyStoryProtocolV161, hasCampaignStoryV161 } from './campaign-convoy-story-v161.js';
import { campaignInsertionStoryV163, chooseLetheStoryProtocolV163, hasCampaignStoryV163 } from './campaign-lethe-story-v163.js';
import { drawArchiveRelayInsertionShotV160, loadArchiveRelayArtV160 } from './archive-relay-presentation-v160.js';

export const MISSION_INSERTION_UI_SCHEMA_V62 = 62;

export const MISSION_INSERTION_APPROACH_LABELS_V62 = Object.freeze({
  dropship: 'DROPSHIP',
  apc: 'APC',
  foot: 'MARCHE D’APPROCHE'
});

export const MISSION_INSERTION_PHASE_LABELS_V62 = Object.freeze({
  briefing: 'BRIEFING',
  preparation: 'PRÉPARATION',
  approach: 'APPROCHE',
  incident: 'INCIDENT CAUSAL',
  deployment: 'DÉPLOIEMENT',
  'player-control': 'PRISE DE CONTRÔLE'
});

const PHASE_ACTION_LABELS = Object.freeze({
  briefing: 'VALIDER LE BRIEFING',
  preparation: 'CONFIRMER LA PRÉPARATION',
  approach: 'ACHEVER L’APPROCHE',
  incident: 'APPLIQUER LA RÉSOLUTION',
  deployment: 'SE DÉPLOYER',
  'player-control': 'PRENDRE LE CONTRÔLE'
});

const STATUS_LABELS = Object.freeze({
  active: 'EN COURS',
  complete: 'TERMINÉE',
  skipped: 'PASSÉE',
  pending: 'À VENIR'
});

const PHASE_DURATION_MS = Object.freeze({
  briefing: 9000,
  preparation: 7000,
  approach: 6500,
  incident: 8000,
  deployment: 5000,
  'player-control': 3000
});

const AUTO_ADVANCE_PHASES = new Set(['approach', 'deployment']);

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isElementLike(value) {
  return Boolean(value)
    && typeof value === 'object'
    && typeof value.append === 'function'
    && typeof value.querySelector === 'function';
}

function nonEmptyString(value, maximum = 500) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().slice(0, maximum);
  return normalized || null;
}

function clamp(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}

function safeMediaSource(value) {
  const source = nonEmptyString(value, 1200);
  if (!source) return null;
  if (/^(?:javascript|data:text\/html):/iu.test(source)) return null;
  return source;
}

/**
 * Normalize one supplied registry item. No fallback art is fabricated: an item
 * without both a stable registry identity and a real source path is rejected.
 */
export function normalizeMissionInsertionMediaV62(candidate) {
  if (!isRecord(candidate)) return null;
  const id = nonEmptyString(candidate.id || candidate.key, 180);
  const source = safeMediaSource(candidate.src || candidate.file || candidate.path);
  if (!id || !source) return null;
  const mediaType = String(candidate.mediaType || candidate.type || candidate.kind || '').toLowerCase();
  const type = mediaType === 'video' || /\.(?:mp4|webm|ogv)(?:[?#].*)?$/iu.test(source)
    ? 'video'
    : 'image';
  return Object.freeze({
    id,
    source,
    type,
    alt: nonEmptyString(candidate.alt || candidate.title || candidate.description, 500)
      || 'Média d’insertion enregistré',
    credit: nonEmptyString(candidate.credit || candidate.provider || candidate.provenance, 240),
    poster: safeMediaSource(candidate.poster)
  });
}

function registryValue(registry, key) {
  if (registry instanceof Map) return registry.get(key);
  if (!isRecord(registry)) return null;
  return registry[key];
}

/** Resolve only media explicitly supplied by the host registry/resolver. */
export function resolveMissionInsertionMediaV62({ state, phase, mediaRegistry = null, resolveMedia = null } = {}) {
  const restored = restoreMissionInsertionV62(state);
  const activePhase = phase || restored.phases[restored.currentIndex];
  if (typeof resolveMedia === 'function') {
    return normalizeMissionInsertionMediaV62(resolveMedia({
      state: restored,
      phase: activePhase,
      approach: restored.approach
    }));
  }
  const keys = [
    `${restored.approach.mode}:${activePhase.kind}`,
    activePhase.kind,
    restored.approach.mode,
    'default'
  ];
  for (const key of keys) {
    const normalized = normalizeMissionInsertionMediaV62(registryValue(mediaRegistry, key));
    if (normalized) return normalized;
  }
  return null;
}

function createElement(documentRef, tagName, className = '', text = null) {
  const element = documentRef.createElement(tagName);
  if (className) element.className = className;
  if (text !== null && text !== undefined) element.textContent = String(text);
  return element;
}

function setProgress(element, value) {
  const progress = clamp(value);
  element.style.setProperty('--insertion-progress', String(progress));
  element.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  element.dataset.progress = String(progress);
}

function approachDescription(state, phase) {
  if (phase.kind === 'briefing') return phase.payload.objectiveRef || 'Confirmer l’ordre de mission avant le départ';
  if (phase.kind === 'preparation') {
    const crew = phase.payload.crewIds?.length || 0;
    const transport = phase.payload.vehicleId ? ' · transport affecté' : '';
    return `${crew} membre${crew > 1 ? 's' : ''} affecté${crew > 1 ? 's' : ''}${transport}`;
  }
  if (phase.kind === 'approach') return `Vecteur ${MISSION_INSERTION_APPROACH_LABELS_V62[state.approach.mode]}`;
  if (phase.kind === 'deployment') return 'Déploiement au point d’insertion mission';
  if (phase.kind === 'player-control') return 'Transfert au contrôle tactique de l’escouade';
  if (phase.kind === 'incident') return 'Un incident sur la route doit être résolu avant le déploiement.';
  return '';
}

export function getMissionInsertionUiModelV62(state, options = {}) {
  const restored = restoreMissionInsertionV62(state);
  const phase = restored.phases[restored.currentIndex];
  const relayStory = campaignInsertionStoryV160(restored);
  const story = relayStory || campaignInsertionStoryV161(restored) || campaignInsertionStoryV163(restored);
  const storyScene = relayStory && ['deployment', 'player-control'].includes(phase.kind)
    ? { kind: 'native-qz18-scene', cameraX: 0, width: 1280, height: 720 } : null;
  const media = resolveMissionInsertionMediaV62({
    state: restored,
    phase,
    mediaRegistry: options.mediaRegistry,
    resolveMedia: options.resolveMedia
  });
  return Object.freeze({
    schema: MISSION_INSERTION_UI_SCHEMA_V62,
    state: restored,
    phase,
    phaseLabel: MISSION_INSERTION_PHASE_LABELS_V62[phase.kind],
    approachLabel: MISSION_INSERTION_APPROACH_LABELS_V62[restored.approach.mode],
    description: approachDescription(restored, phase),
    actionLabel: PHASE_ACTION_LABELS[phase.kind],
    paused: restored.paused,
    complete: restored.status === 'completed',
    skipVisible: restored.skipAllowed && restored.status === 'active',
    media: storyScene ? null : media,
    story,
    storyScene
  });
}

export class MissionInsertionUiV62 {
  constructor(options = {}) {
    if (!isElementLike(options.root)) throw new TypeError('MissionInsertionUiV62 requiert un élément root valide.');
    const documentRef = options.root.ownerDocument || globalThis.document;
    if (!documentRef?.createElement) throw new TypeError('MissionInsertionUiV62 requiert un document DOM valide.');
    this.root = options.root;
    this.document = documentRef;
    this.mediaRegistry = options.mediaRegistry || null;
    this.resolveMedia = typeof options.resolveMedia === 'function' ? options.resolveMedia : null;
    this.onPersist = typeof options.onPersist === 'function' ? options.onPersist : null;
    this.onComplete = typeof options.onComplete === 'function' ? options.onComplete : null;
    this.onHooks = typeof options.onHooks === 'function' ? options.onHooks : null;
    this.returnContext = nonEmptyString(options.returnContext, 180) || 'operation-planning';
    this.now = typeof options.now === 'function' ? options.now : () => Date.now();
    this.requestFrame = typeof options.requestAnimationFrame === 'function'
      ? options.requestAnimationFrame
      : typeof globalThis.requestAnimationFrame === 'function'
        ? globalThis.requestAnimationFrame.bind(globalThis)
        : null;
    this.cancelFrame = typeof options.cancelAnimationFrame === 'function'
      ? options.cancelAnimationFrame
      : typeof globalThis.cancelAnimationFrame === 'function'
        ? globalThis.cancelAnimationFrame.bind(globalThis)
        : null;
    this.autoProgress = options.autoProgress !== false;
    this.reducedMotion = options.reducedMotion === true;
    this.state = restoreMissionInsertionV62(options.state);
    this.completedNotified = this.state.status === 'completed';
    this.destroyed = false;
    this.frameHandle = null;
    this.lastFrameAt = null;
    this.progressAccumulator = 0;
    this.lastHookEmissionKey = null;
    this.boundClick = (event) => this.handleClick(event);
    this.boundKeydown = (event) => this.handleKeydown(event);
    this.boundFrame = (timestamp) => this.handleFrame(timestamp);
    this.root.addEventListener('click', this.boundClick);
    this.document.addEventListener?.('keydown', this.boundKeydown);
    this.root.classList.add('mission-insertion-v62');
    this.root.setAttribute('tabindex', '0');
    this.root.setAttribute('aria-keyshortcuts', 'Enter Space P Escape');
    this.render();
    this.emitCurrentPhaseHooks('initial-phase');
    this.scheduleFrame();
  }

  getSnapshot() {
    return Object.freeze({
      schema: MISSION_INSERTION_UI_SCHEMA_V62,
      state: serializeMissionInsertionV62(this.state),
      phaseId: this.state.currentPhaseId,
      paused: this.state.paused,
      complete: this.state.status === 'completed'
    });
  }

  serialize() {
    return serializeMissionInsertionV62(this.state);
  }

  restore(candidate, { persist = false } = {}) {
    this.state = restoreMissionInsertionV62(candidate);
    this.completedNotified = this.state.status === 'completed';
    this.lastFrameAt = null;
    this.progressAccumulator = 0;
    this.lastHookEmissionKey = null;
    this.render();
    this.emitCurrentPhaseHooks('restored-phase');
    if (persist) this.persist('restored');
    return this.getSnapshot();
  }

  persist(reason, extra = {}) {
    this.onPersist?.(serializeMissionInsertionV62(this.state), Object.freeze({ reason, ...extra }));
  }

  consumeResult(result, reason) {
    if (!result?.ok) {
      this.announce(result?.reason || 'Action refusée.');
      return result;
    }
    this.state = result.state;
    this.persist(reason, { event: result.event || null });
    if (Array.isArray(result.hooks) && result.hooks.length) {
      this.lastHookEmissionKey = this.currentHookEmissionKey();
      this.onHooks?.(result.hooks, this.getSnapshot(), Object.freeze({ reason }));
    }
    this.render();
    if (this.state.status === 'completed' && !this.completedNotified) {
      this.completedNotified = true;
      this.onComplete?.(Object.freeze({
        state: serializeMissionInsertionV62(this.state),
        readReceipt: getMissionInsertionReadReceiptV62(this.state),
        skipped: result.event?.type === 'skipped-to-player-control'
      }));
    }
    return result;
  }

  currentHookEmissionKey() {
    if (this.state.status !== 'active' || this.state.paused) return null;
    const phase = this.state.phases[this.state.currentIndex];
    return `${phase.id}:${phase.enteredAt ?? 'none'}`;
  }

  emitCurrentPhaseHooks(reason = 'phase-active') {
    const key = this.currentHookEmissionKey();
    if (!key || key === this.lastHookEmissionKey || !this.onHooks) return false;
    const phase = this.state.phases[this.state.currentIndex];
    this.lastHookEmissionKey = key;
    this.onHooks(phase.hooks, this.getSnapshot(), Object.freeze({ reason }));
    return true;
  }

  scheduleFrame() {
    if (!this.autoProgress || !this.requestFrame || this.destroyed || this.frameHandle !== null) return;
    this.frameHandle = this.requestFrame(this.boundFrame);
  }

  handleFrame(timestamp) {
    this.frameHandle = null;
    if (this.destroyed || this.state.status === 'completed') return;
    const frameAt = Number.isFinite(Number(timestamp)) ? Number(timestamp) : this.now();
    if (this.lastFrameAt === null || this.state.paused) {
      this.lastFrameAt = frameAt;
      this.progressAccumulator = 0;
      this.scheduleFrame();
      return;
    }
    const deltaMs = Math.max(0, Math.min(1000, frameAt - this.lastFrameAt));
    this.lastFrameAt = frameAt;
    this.progressAccumulator += deltaMs;
    if (this.progressAccumulator >= 250) {
      const elapsed = this.progressAccumulator;
      this.progressAccumulator = 0;
      this.tick(elapsed);
    }
    this.scheduleFrame();
  }

  tick(deltaMs) {
    if (this.destroyed || this.state.paused || this.state.status === 'completed') {
      return { ok: false, reason: this.state.paused ? 'paused' : 'unavailable', state: this.state };
    }
    const phase = getActiveMissionInsertionPhaseV62(this.state);
    const story = campaignInsertionStoryV160(this.state) || campaignInsertionStoryV161(this.state) || campaignInsertionStoryV163(this.state);
    // Let every radio line be read before an illustrated approach/deployment
    // advances. The manual continue action remains available at all times.
    const spokenWords = story?.lines.reduce((count, line) => count + line.text.split(/\s+/u).length, 0) || 0;
    const duration = Math.max(PHASE_DURATION_MS[phase.kind] || 6000, story ? spokenWords * 290 + 1800 : 0);
    const nextProgress = clamp(phase.progress + Math.max(0, Number(deltaMs) || 0) / duration);
    const progressResult = this.setPhaseProgress(nextProgress);
    if (progressResult.ok && nextProgress >= 1 && AUTO_ADVANCE_PHASES.has(phase.kind)) return this.advance();
    return progressResult;
  }

  advance() {
    if (this.state.paused || this.state.status === 'completed') return { ok: false, reason: 'unavailable', state: this.state };
    const phase = getActiveMissionInsertionPhaseV62(this.state);
    return this.consumeResult(applyMissionInsertionActionV62(this.state, phase.requiredAction, { now: this.now() }), 'phase-action');
  }

  skip() {
    return this.consumeResult(applyMissionInsertionActionV62(this.state, MISSION_INSERTION_ACTIONS_V62.skip, { now: this.now() }), 'skip');
  }

  pause() {
    return this.consumeResult(pauseMissionInsertionV62(this.state, {
      now: this.now(),
      returnContext: this.returnContext
    }), 'pause');
  }

  resume() {
    return this.consumeResult(resumeMissionInsertionV62(this.state, { now: this.now() }), 'resume');
  }

  setPhaseProgress(value) {
    return this.consumeResult(recordMissionInsertionProgressV62(this.state, value, { now: this.now() }), 'progress');
  }

  chooseStoryProtocol(protocolId) {
    const choose = hasCampaignStoryV163(this.state.campaignId) ? chooseLetheStoryProtocolV163
      : hasCampaignStoryV161(this.state.campaignId) ? chooseConvoyStoryProtocolV161 : chooseCampaignStoryProtocolV160;
    const result = choose(this.state, protocolId, { now: this.now() });
    if (!result.ok) { this.announce('Le protocole se choisit pendant la préparation.'); return result; }
    if (!result.changed) return result;
    this.state = result.state;
    this.persist('story-protocol', { protocolId });
    this.render();
    this.root.querySelector(`[data-story-protocol="${protocolId}"]`)?.focus?.({ preventScroll: true });
    return result;
  }

  announce(message) {
    const live = this.root.querySelector('[data-insertion-live]');
    if (live) live.textContent = String(message || '');
  }

  renderMedia(container, media) {
    if (!media) {
      container.hidden = true;
      container.removeAttribute?.('data-media-id');
      return;
    }
    container.hidden = false;
    container.dataset.mediaId = media.id;
    let element;
    if (media.type === 'video') {
      element = createElement(this.document, 'video', 'mission-insertion-v62__media-source');
      element.src = media.source;
      element.controls = true;
      element.preload = 'metadata';
      if (media.poster) element.poster = media.poster;
      element.setAttribute('aria-label', media.alt);
    } else {
      element = createElement(this.document, 'img', 'mission-insertion-v62__media-source');
      element.src = media.source;
      element.alt = media.alt;
      element.loading = 'eager';
      element.decoding = 'async';
    }
    container.append(element);
    if (media.credit) container.append(createElement(this.document, 'figcaption', 'mission-insertion-v62__credit', media.credit));
  }

  renderStoryScene(container, scene) {
    container.hidden = false;
    container.dataset.sceneId = scene.kind;
    const canvas = createElement(this.document, 'canvas', 'mission-insertion-v62__media-source');
    canvas.width = scene.width; canvas.height = scene.height;
    canvas.dataset.nativeRelayShot = 'true';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Vue du relais QZ-18 : quai ouest, échelle et postes d’ingénierie et de sécurité sur la passerelle.');
    const art = loadArchiveRelayArtV160();
    const draw = () => {
      const context = canvas.getContext?.('2d');
      if (!context) return;
      drawArchiveRelayInsertionShotV160(context, { ...scene, art });
      canvas.dataset.presentationReady = String(art.ready);
    };
    container.append(canvas, createElement(this.document, 'figcaption', 'mission-insertion-v62__credit', 'Relais QZ-18 · quai ouest'));
    draw();
    if (!art.ready) art.promise.then(() => { if (!this.destroyed && container.contains(canvas)) draw(); });
  }

  renderPhaseRail(container, model) {
    const list = createElement(this.document, 'ol', 'mission-insertion-v62__phase-list');
    for (const phase of model.state.phases) {
      const item = createElement(this.document, 'li', `mission-insertion-v62__phase is-${phase.status}`);
      item.dataset.phase = phase.kind;
      item.dataset.status = phase.status;
      if (phase.id === model.state.currentPhaseId) item.setAttribute('aria-current', 'step');
      const number = createElement(this.document, 'span', 'mission-insertion-v62__phase-number', String(phase.index + 1).padStart(2, '0'));
      const copy = createElement(this.document, 'span', 'mission-insertion-v62__phase-copy');
      copy.append(
        createElement(this.document, 'strong', '', MISSION_INSERTION_PHASE_LABELS_V62[phase.kind]),
        createElement(this.document, 'small', '', STATUS_LABELS[phase.status])
      );
      item.append(number, copy);
      list.append(item);
    }
    container.append(list);
  }

  renderHooks(container, phase) {
    if (!phase.hooks.length) return;
    container.append(createElement(this.document, 'h3', '', 'LIAISONS OPÉRATIONNELLES'));
    const list = createElement(this.document, 'ul', 'mission-insertion-v62__hooks');
    for (const hook of phase.hooks) {
      const channel = nonEmptyString(hook.channel, 40) || 'système';
      const event = nonEmptyString(hook.event, 180) || 'phase-enter';
      const detail = hook.objectiveRef || hook.approach || hook.operationId || '';
      const item = createElement(this.document, 'li');
      item.dataset.hookChannel = channel;
      item.append(
        createElement(this.document, 'strong', '', channel.toUpperCase()),
        createElement(this.document, 'span', '', `${event}${detail ? ` · ${detail}` : ''}`)
      );
      list.append(item);
    }
    container.append(list);
  }

  renderStory(container, story) {
    if (!story) return;
    const section = createElement(this.document, 'section', 'mission-insertion-v62__story');
    section.dataset.campaignStory = story.id;
    const title = createElement(this.document, 'h3', '', story.title);
    section.append(title);
    for (const line of story.lines) {
      const row = createElement(this.document, 'div', 'mission-insertion-v62__dialogue-line');
      const portrait = createElement(this.document, 'span', 'mission-insertion-v62__portrait');
      const character = line.speaker.startsWith('Inez') ? 'inez' : line.speaker.startsWith('Rook') ? 'rook'
        : line.speaker === 'Echo-9' ? 'operator' : 'mother';
      portrait.dataset.character = character;
      portrait.setAttribute('aria-hidden', 'true');
      if (character === 'operator') portrait.textContent = 'E9';
      if (character === 'mother') portrait.textContent = 'MU/TH/UR';
      const copy = createElement(this.document, 'div');
      copy.append(createElement(this.document, 'strong', '', line.speaker), createElement(this.document, 'p', '', line.text));
      row.append(portrait, copy); section.append(row);
    }
    section.append(createElement(this.document, 'p', 'mission-insertion-v62__story-objective', story.objective));
    if (story.canChoose) {
      const choices = createElement(this.document, 'div', 'mission-insertion-v62__story-choices');
      choices.setAttribute('role', 'group'); choices.setAttribute('aria-label', 'Protocole de compte rendu');
      for (const choice of story.choices) {
        const button = createElement(this.document, 'button', 'mission-insertion-v62__story-choice');
        button.type = 'button'; button.dataset.storyProtocol = choice.id;
        button.setAttribute('aria-pressed', String(story.protocol?.id === choice.id));
        button.append(createElement(this.document, 'strong', '', choice.label), createElement(this.document, 'span', '', choice.description));
        choices.append(button);
      }
      section.append(choices);
    }
    const protocol = story.protocol ? `Compte rendu : ${story.protocol.label}.`
      : story.protocolNotice || 'Bilan standard. Aucun complément de protocole sans choix explicite et dossier complet au retour.';
    section.append(createElement(this.document, 'p', 'mission-insertion-v62__story-protocol', protocol));
    container.append(section);
  }

  renderIncident(container, state) {
    const activePhase = state.phases[state.currentIndex];
    if (!state.incident || activePhase.kind !== 'incident' || activePhase.status !== 'active') return;
    const section = createElement(this.document, 'section', 'mission-insertion-v62__incident');
    section.dataset.incidentId = state.incident.id;
    section.append(
      createElement(this.document, 'h3', '', 'INCIDENT SUR LA ROUTE'),
      createElement(this.document, 'p', '', nonEmptyString(state.incident.data?.description)
        || 'La progression est suspendue le temps de sécuriser la route d’insertion.'),
      createElement(this.document, 'p', 'mission-insertion-v62__resolution', nonEmptyString(state.incident.data?.resolutionLabel)
        || 'Confirmez la résolution de l’incident pour poursuivre le déploiement.')
    );
    container.append(section);
  }

  renderControls(container, model) {
    const controls = createElement(this.document, 'div', 'mission-insertion-v62__controls');
    if (!model.complete && !model.paused) {
      const advance = createElement(this.document, 'button', 'mission-insertion-v62__primary', model.actionLabel);
      advance.type = 'button';
      advance.dataset.insertionAction = 'advance';
      advance.dataset.requiredAction = model.phase.requiredAction;
      controls.append(advance);
      const pause = createElement(this.document, 'button', 'mission-insertion-v62__secondary', 'PAUSE · RETOUR PLANIFICATION');
      pause.type = 'button';
      pause.dataset.insertionAction = 'pause';
      controls.append(pause);
      if (model.skipVisible) {
        const skip = createElement(this.document, 'button', 'mission-insertion-v62__secondary', 'PASSER L’INSERTION DÉJÀ VUE');
        skip.type = 'button';
        skip.dataset.insertionAction = 'skip';
        controls.append(skip);
      }
    } else if (model.paused) {
      const resume = createElement(this.document, 'button', 'mission-insertion-v62__primary', 'REPRENDRE L’INSERTION');
      resume.type = 'button';
      resume.dataset.insertionAction = 'resume';
      controls.append(resume);
    } else {
      const ready = createElement(this.document, 'p', 'mission-insertion-v62__ready', 'CONTRÔLE TACTIQUE TRANSFÉRÉ');
      ready.dataset.insertionComplete = 'true';
      controls.append(ready);
    }
    container.append(controls);
  }

  focusPrimary() {
    const target = this.root.querySelector?.('[data-insertion-action]') || this.root;
    target.focus?.({ preventScroll: true });
    return target;
  }

  render() {
    const restoreFocus = this.root.contains?.(this.document.activeElement) === true;
    const model = getMissionInsertionUiModelV62(this.state, {
      mediaRegistry: this.mediaRegistry,
      resolveMedia: this.resolveMedia
    });
    if (typeof this.root.replaceChildren === 'function') this.root.replaceChildren();
    else this.root.textContent = '';
    this.root.dataset.insertionPhase = model.phase.kind;
    this.root.dataset.insertionApproach = model.state.approach.mode;
    this.root.dataset.insertionStatus = model.state.status;
    this.root.dataset.reducedMotion = String(this.reducedMotion);
    if (model.story) this.root.dataset.campaignStory = model.story.id;
    else delete this.root.dataset.campaignStory;

    const header = createElement(this.document, 'header', 'mission-insertion-v62__header');
    const eyebrow = createElement(this.document, 'p', 'mission-insertion-v62__eyebrow', `INSERTION · ${model.approachLabel}`);
    const title = createElement(this.document, 'h2', '', model.story?.title || model.phaseLabel);
    const operation = createElement(this.document, 'p', 'mission-insertion-v62__operation', model.story?.location || model.approachLabel);
    header.append(eyebrow, title, operation);

    const phaseRail = createElement(this.document, 'nav', 'mission-insertion-v62__rail');
    phaseRail.setAttribute('aria-label', 'Progression de l’insertion');
    this.renderPhaseRail(phaseRail, model);

    const body = createElement(this.document, 'div', 'mission-insertion-v62__body');
    const media = createElement(this.document, 'figure', 'mission-insertion-v62__media');
    if (model.storyScene) this.renderStoryScene(media, model.storyScene);
    else this.renderMedia(media, model.story && model.media ? { ...model.media,
      credit: 'Illustration du Tantalus · transmission textuelle' } : model.media);
    if (model.story) {
      media.dataset.storyShot = model.phase.kind;
      media.style.setProperty('--story-shot-progress', String(clamp(model.phase.progress)));
      media.append(createElement(this.document, 'p', 'mission-insertion-v62__shot-label', model.story.location));
    }
    const panel = createElement(this.document, 'section', 'mission-insertion-v62__panel');
    panel.append(
      createElement(this.document, 'p', 'mission-insertion-v62__phase-kicker', `${model.phase.index + 1}/${model.state.phases.length}`),
      createElement(this.document, 'h2', '', model.phaseLabel),
      createElement(this.document, 'p', 'mission-insertion-v62__description', model.story?.campaignName || model.description)
    );
    const progress = createElement(this.document, 'div', 'mission-insertion-v62__progress');
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', '100');
    progress.setAttribute('aria-label', 'Progression totale de l’insertion');
    setProgress(progress, model.state.progress);
    progress.append(createElement(this.document, 'span'));
    panel.append(progress);
    this.renderIncident(panel, model.state);
    if (model.story) this.renderStory(panel, model.story);
    else this.renderHooks(panel, model.phase);
    this.renderControls(panel, model);
    body.append(media, panel);

    const live = createElement(this.document, 'p', 'mission-insertion-v62__live', model.paused
      ? 'Insertion en pause. La progression est conservée.'
      : model.complete ? 'Insertion terminée. Contrôle tactique disponible.' : `${model.phaseLabel} active.`);
    live.dataset.insertionLive = 'true';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    this.root.append(header, phaseRail, body, live);
    if (restoreFocus) this.focusPrimary();
    return this.getSnapshot();
  }

  handleClick(event) {
    const protocol = event.target?.closest?.('[data-story-protocol]');
    if (protocol && this.root.contains(protocol)) { this.chooseStoryProtocol(protocol.dataset.storyProtocol); return; }
    const button = event.target?.closest?.('[data-insertion-action]');
    if (!button || !this.root.contains(button)) return;
    const action = button.dataset.insertionAction;
    if (action === 'advance') this.advance();
    else if (action === 'pause') this.pause();
    else if (action === 'resume') this.resume();
    else if (action === 'skip') this.skip();
  }

  handleKeydown(event) {
    if (this.root.hidden || this.state.status === 'completed') return;
    const panel = this.root.closest?.('[data-panel]');
    if (panel && !panel.classList.contains('active')) return;
    const tag = String(event.target?.tagName || '').toLowerCase();
    if (event.target?.isContentEditable || ['input', 'select', 'textarea'].includes(tag)) return;
    if (tag === 'button' && ['Enter', ' ', 'Spacebar'].includes(event.key)) return;
    if (event.key === 'Escape') {
      if (!this.state.paused) {
        event.preventDefault?.();
        this.pause();
      }
      return;
    }
    if (String(event.key || '').toLowerCase() === 'p') {
      event.preventDefault?.();
      this.state.paused ? this.resume() : this.pause();
      return;
    }
    if (!this.state.paused && ['Enter', ' ', 'Spacebar'].includes(event.key)) {
      event.preventDefault?.();
      this.advance();
    }
  }

  destroy() {
    this.destroyed = true;
    if (this.frameHandle !== null) this.cancelFrame?.(this.frameHandle);
    this.frameHandle = null;
    this.root.removeEventListener('click', this.boundClick);
    this.document.removeEventListener?.('keydown', this.boundKeydown);
    this.root.classList.remove('mission-insertion-v62');
    this.root.removeAttribute?.('aria-keyshortcuts');
  }
}

export function createMissionInsertionUiV62(options) {
  return new MissionInsertionUiV62(options);
}
