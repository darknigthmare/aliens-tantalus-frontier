import {
  TITLE_SCENE_FALLBACK_V79,
  TITLE_SCENE_SCHEMA_V79,
  buildTitleSceneModelV79,
  chooseTitleScenePlacementV87,
  chooseTitleShipAngleV88
} from './title-scene-catalog-v79.js';
import { createTitleFlightClockV88, advanceTitleFlightV88, sampleTitleFlightV88, pauseTitleFlightV88 } from './title-scene-motion-v88.js';

const modelSignature = model => JSON.stringify([model.presetId, model.mode, model.placementId,
  model.shipAssetId, model.shipName, model.sceneContext]);

export function supportsTitleSceneV79(scope = globalThis) {
  try {
    return Boolean(scope?.CSS?.supports?.('background', 'radial-gradient(circle, #000, #111)'));
  } catch {
    return false;
  }
}

const setParentStatus = (root, status) => {
  if (root?.parentElement?.dataset) root.parentElement.dataset.titleSceneV79 = status;
};

export class TitleSceneControllerV79 {
  constructor({
    root,
    fallback,
    supportsScene = () => supportsTitleSceneV79(),
    matchMedia = globalThis.matchMedia?.bind(globalThis),
    random = Math.random,
    getSceneContext = () => null,
    requestFrame = globalThis.requestAnimationFrame?.bind(globalThis),
    cancelFrame = globalThis.cancelAnimationFrame?.bind(globalThis),
    visibilityDocument = root?.ownerDocument || globalThis.document,
    angleStorage,
    shipAngleAssets
  } = {}) {
    this.root = root || null;
    this.fallback = fallback || null;
    this.supportsScene = supportsScene;
    this.active = false;
    this.random = random;
    this.getSceneContext = getSceneContext;
    this.sceneContext = null;
    this.requestFrame = requestFrame;
    this.cancelFrame = cancelFrame;
    this.visibilityDocument = visibilityDocument;
    this.flightClock = createTitleFlightClockV88();
    this.frameId = null;
    this.shipAngleAssetId = null;
    this.angleShipId = null;
    this.shipAngleAssets = shipAngleAssets;
    this.shipAssetFailureV90 = null;
    try { this.angleStorage = angleStorage === undefined ? globalThis.sessionStorage : angleStorage; } catch { this.angleStorage = null; }
    this.onVisibility = () => {
      if (this.visibilityDocument?.hidden) this.stopFlight();
      else this.startFlight();
    };
    this.visibilityDocument?.addEventListener?.('visibilitychange', this.onVisibility);
    this.placementId = null;
    this.lastSave = null;
    this.model = null;
    this.signature = '';
    this.reason = 'not-rendered';
    this.renderGeneration = 0;
    this.motionQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    this.onMotionPreference = () => { if (this.active) this.show(this.lastSave); };
    if (typeof this.motionQuery?.addEventListener === 'function') this.motionQuery.addEventListener('change', this.onMotionPreference);
    else this.motionQuery?.addListener?.(this.onMotionPreference);
    if (this.fallback && !this.fallback.getAttribute?.('src')) this.fallback.src = TITLE_SCENE_FALLBACK_V79.src;
  }

  useFallback(reason = 'fallback') {
    this.stopFlight();
    this.renderGeneration += 1;
    this.reason = reason;
    this.model = null;
    this.signature = '';
    if (this.root) {
      this.root.hidden = true;
      this.root.dataset.status = 'fallback';
      this.root.dataset.active = 'false';
    }
    if (this.fallback) this.fallback.hidden = false;
    setParentStatus(this.root, 'fallback');
    return this.getSnapshot();
  }

  syncProceduralFallback(fallbackLayerId) {
    if (!fallbackLayerId || !this.root?.children) return;
    const layers = Array.from(this.root.children);
    const ready = layers.some((candidate) => candidate?.dataset?.renderer === 'image'
      && candidate.dataset.fallbackLayerId === fallbackLayerId
      && candidate.dataset.assetStatus === 'ready'
      && !candidate.hidden);
    for (const candidate of layers) {
      if (candidate?.dataset?.renderer === 'procedural' && candidate.dataset.layerId === fallbackLayerId) {
        candidate.hidden = ready;
        candidate.dataset.overridden = ready ? 'true' : 'false';
      }
    }
  }

  recoverShipAssetV90(layer, reason) {
    // The reference is a different real bitmap, never a reshaped failed camera view.
    const options = { prefersReducedMotion: Boolean(this.motionQuery?.matches), placementId: this.placementId,
      sceneContext: this.model?.sceneContext, shipAngleAssets: this.shipAngleAssets };
    const reference = buildTitleSceneModelV79(this.lastSave || {}, options);
    const recoverReference = layer.shipId === reference.shipId && layer.assetId !== reference.shipAssetId;
    this.shipAssetFailureV90 = Object.freeze({ assetId: layer.assetId, reason,
      recovery: recoverReference ? 'reference' : 'background', fallbackAssetId: recoverReference ? reference.shipAssetId : null });
    if (!recoverReference) return this.useFallback(`ship-${reason}:${layer.assetId}`);
    this.shipAngleAssetId = reference.shipAssetId;
    try { this.angleStorage?.setItem?.(`atf-title-angle-v88:${reference.shipId}`, reference.shipAssetId); } catch { /* Optional presentation history. */ }
    try { this.render(reference); } catch { return this.useFallback('ship-reference-render-error'); }
    if (this.active) this.startFlight();
    else { this.stopFlight(); this.root.dataset.active = 'false'; }
    return this.getSnapshot();
  }

  createLayer(layer, documentRef, generation = this.renderGeneration) {
    const element = documentRef.createElement('div');
    element.className = `title-scene-layer-v79 title-scene-layer-v79--${layer.role} title-scene-layer-v79--${layer.id}`;
    element.dataset.layerId = layer.id;
    element.dataset.role = layer.role;
    element.dataset.renderer = layer.renderer;
    element.dataset.renderGeneration = String(generation);
    if (layer.shipId) element.dataset.shipId = layer.shipId;
    if (layer.angleId) element.dataset.shipAngle = layer.angleId;
    if (layer.planetAnchor) element.dataset.planetAnchor = 'true';
    if (layer.fallbackLayerId) element.dataset.fallbackLayerId = layer.fallbackLayerId;
    if (layer.assetId) element.dataset.assetId = layer.assetId;
    if (layer.runtimeId) element.dataset.runtimeId = layer.runtimeId;
    element.setAttribute('aria-hidden', 'true');
    element.style?.setProperty?.('--title-scene-depth-v79', String(layer.depth));
    if (layer.sphereRegistration) {
      const { x, y, size, sourceSize, sourceWidth = sourceSize, sourceHeight = sourceSize } = layer.sphereRegistration;
      element.style?.setProperty?.('--title-art-left-v87', `${-x / size * 100}%`);
      element.style?.setProperty?.('--title-art-top-v87', `${-y / size * 100}%`);
      element.style?.setProperty?.('--title-art-size-v87', `${sourceWidth / size * 100}%`);
      element.style?.setProperty?.('--title-art-width-v87', `${sourceWidth / size * 100}%`);
      element.style?.setProperty?.('--title-art-height-v87', `${sourceHeight / size * 100}%`);
    }
    if (layer.hullRegistration) {
      const { x, y, width, height, sourceWidth, sourceHeight } = layer.hullRegistration;
      element.style?.setProperty?.('--ship-ratio-v87', String(width / height));
      element.style?.setProperty?.('--ship-image-left-v87', `${-x / width * 100}%`);
      element.style?.setProperty?.('--ship-image-top-v87', `${-y / height * 100}%`);
      element.style?.setProperty?.('--ship-image-width-v87', `${sourceWidth / width * 100}%`);
      element.style?.setProperty?.('--ship-image-height-v87', `${sourceHeight / height * 100}%`);
    }

    if (layer.renderer === 'image') {
      const image = documentRef.createElement('img');
      image.alt = '';
      image.decoding = 'async';
      image.draggable = false;
      const rejectImage = reason => {
        if (Number(element.dataset.renderGeneration) !== this.renderGeneration) return;
        element.dataset.assetStatus = 'missing';
        element.dataset.assetFailure = reason;
        element.hidden = true;
        if (this.root) this.root.dataset.degraded = 'true';
        this.syncProceduralFallback(layer.fallbackLayerId);
        if (layer.role === 'orbitals' && layer.shipId) return this.recoverShipAssetV90(layer, reason);
        if (layer.required) this.useFallback(`missing:${layer.id}`);
      };
      image.addEventListener?.('load', () => {
        // A previous preset may finish loading after replacement or controller disposal.
        if (Number(element.dataset.renderGeneration) !== this.renderGeneration) return;
        const registered = layer.hullRegistration;
        // Browsers expose actual decoded dimensions. Small DOM doubles may omit them.
        if (layer.shipId && registered && typeof image.naturalWidth === 'number'
          && (image.naturalWidth !== registered.sourceWidth || image.naturalHeight !== registered.sourceHeight)) {
          rejectImage('dimensions'); return;
        }
        element.dataset.assetStatus = 'ready';
        this.syncProceduralFallback(layer.fallbackLayerId);
      }, { once: true });
      image.addEventListener?.('error', () => rejectImage('network-or-decode'), { once: true });
      element.dataset.assetStatus = 'loading';
      image.src = layer.assetSrc;
      element.append?.(image);
      if (layer.namePlate && layer.hullRegistration && layer.shipName) {
        const { x, y, width, height } = layer.hullRegistration;
        const plate = layer.namePlate;
        const marking = documentRef.createElement('span');
        marking.className = 'title-ship-marking-v87';
        marking.textContent = layer.shipName;
        marking.setAttribute?.('aria-hidden', 'true');
        marking.style?.setProperty?.('left', `${(plate.x - x) / width * 100}%`);
        marking.style?.setProperty?.('top', `${(plate.y - y) / height * 100}%`);
        marking.style?.setProperty?.('width', `${plate.width / width * 100}%`);
        marking.style?.setProperty?.('height', `${plate.height / height * 100}%`);
        const fontSize = Math.min(plate.height * .78, plate.width / (Math.max(1, layer.shipName.length) * .85));
        marking.style?.setProperty?.('--ship-name-font-v87', String(fontSize / width * 100));
        element.append?.(marking);
      }
    }
    return element;
  }

  render(model) {
    const documentRef = this.root?.ownerDocument || globalThis.document;
    if (!this.root || !documentRef?.createElement || typeof this.root.replaceChildren !== 'function') {
      return this.useFallback('dom-unsupported');
    }
    const generation = ++this.renderGeneration;
    // Reuse the current composition across motion/preferences changes, so pending
    // image loads and flight phase are not reset. Changed scenes get a new batch.
    const reuse = this.model?.presetId === model.presetId && this.model?.placementId === model.placementId
      && this.model?.shipAssetId === model.shipAssetId;
    const previous = new Map(reuse ? Array.from(this.root.children || []).map(element => [element.dataset.layerId, element]) : []);
    const layers = model.layers.map(layer => {
      const existing = previous.get(layer.id);
      if (existing && existing.dataset.assetStatus !== 'missing'
        && (layer.role !== 'orbitals' || this.model.shipName === model.shipName)) {
        existing.dataset.renderGeneration = String(generation);
        return existing;
      }
      return this.createLayer(layer, documentRef, generation);
    });
    this.root.replaceChildren(...layers);
    this.root.hidden = false;
    this.root.dataset.status = 'ready';
    this.root.dataset.active = String(this.active);
    this.root.dataset.preset = model.presetId;
    this.root.dataset.placement = model.placementId;
    this.root.dataset.mode = model.mode;
    this.root.dataset.shipId = model.shipId;
    this.root.dataset.shipAngle = model.shipAngleId;
    this.root.dataset.viewpoint = model.sceneContext.viewpoint;
    this.root.dataset.debris = model.sceneContext.debris ? 'justified' : 'none';
    this.root.dataset.tone = model.tone;
    this.root.dataset.degraded = 'false';
    this.root.setAttribute?.('aria-label', `${model.presetLabel} · animation ${model.mode}`);
    if (this.fallback) this.fallback.hidden = true;
    setParentStatus(this.root, 'ready');
    this.model = model;
    this.signature = modelSignature(model);
    this.reason = 'ready';
    for (const layer of model.layers) this.syncProceduralFallback(layer.fallbackLayerId || layer.id);
    return this.getSnapshot();
  }

  show(save = {}) {
    this.shipAssetFailureV90 = null;
    const retryMissingAssets = !this.active && this.root?.dataset?.degraded === 'true';
    const chooseNewView = !this.active && !this.preservePlacementOnce;
    if (!this.active) {
      if (!this.preservePlacementOnce || !this.placementId) this.placementId = chooseTitleScenePlacementV87(this.placementId, this.random);
      this.preservePlacementOnce = false;
    }
    this.active = true;
    this.lastSave = save;
    let supported = false;
    try { supported = Boolean(this.root && this.supportsScene()); } catch { supported = false; }
    if (!supported) return this.useFallback('css-unsupported');
    let sceneContext = this.sceneContext;
    try { sceneContext = sceneContext || this.getSceneContext?.(save); } catch { /* Exterior is the safe default. */ }
    const options = { prefersReducedMotion: Boolean(this.motionQuery?.matches), placementId: this.placementId, sceneContext,
      shipAngleAssets: this.shipAngleAssets };
    const reference = buildTitleSceneModelV79(save, options);
    if (chooseNewView || this.angleShipId !== reference.shipId || !this.shipAngleAssetId) {
      let previous = this.angleShipId === reference.shipId ? this.shipAngleAssetId : null;
      const key = `atf-title-angle-v88:${reference.shipId}`;
      try { previous = previous || this.angleStorage?.getItem?.(key); } catch { /* Storage is optional, not save data. */ }
      this.shipAngleAssetId = chooseTitleShipAngleV88(reference.shipId, previous, this.random, this.shipAngleAssets);
      this.angleShipId = reference.shipId;
      try { this.angleStorage?.setItem?.(key, this.shipAngleAssetId); } catch { /* Private browsing can deny storage. */ }
    }
    const model = buildTitleSceneModelV79(save, { ...options, shipAngleAssetId: this.shipAngleAssetId });
    // An offline visit must not permanently replace the art with procedural layers.
    if (retryMissingAssets || this.signature !== modelSignature(model) || this.root.dataset.status !== 'ready') {
      try { this.render(model); } catch { return this.useFallback('render-error'); }
    }
    else {
      this.root.hidden = false;
      this.root.dataset.active = 'true';
      if (this.fallback) this.fallback.hidden = true;
      setParentStatus(this.root, 'ready');
    }
    this.startFlight();
    return this.getSnapshot();
  }

  setSceneContextV88(context = null) {
    this.sceneContext = context;
    if (this.active) return this.show(this.lastSave);
    return this.getSnapshot();
  }

  applyFlight(position) {
    this.root?.style?.setProperty?.('--title-flight-x-v88', `${position.x.toFixed(5)}%`);
    this.root?.style?.setProperty?.('--title-flight-y-v88', `${position.y.toFixed(5)}%`);
  }

  startFlight() {
    this.applyFlight(sampleTitleFlightV88(this.flightClock.elapsed));
    if (!this.active || !this.model || this.model.mode === 'static' || this.visibilityDocument?.hidden) {
      this.stopFlight();
      return;
    }
    if (this.frameId !== null || typeof this.requestFrame !== 'function') return;
    pauseTitleFlightV88(this.flightClock);
    const tick = timestamp => {
      this.frameId = null;
      if (!this.active || !this.model || this.model.mode === 'static' || this.visibilityDocument?.hidden) return;
      this.applyFlight(advanceTitleFlightV88(this.flightClock, timestamp, this.model.mode));
      this.frameId = this.requestFrame(tick);
    };
    this.frameId = this.requestFrame(tick);
  }

  stopFlight() {
    if (this.frameId !== null) this.cancelFrame?.(this.frameId);
    this.frameId = null;
    pauseTitleFlightV88(this.flightClock);
  }

  preservePlacementOnNextShowV87() { this.preservePlacementOnce = true; }

  clearPlacementPreservationV87() { this.preservePlacementOnce = false; }

  hide() {
    this.active = false;
    this.stopFlight();
    if (this.root) this.root.dataset.active = 'false';
  }

  dispose() {
    this.hide();
    this.visibilityDocument?.removeEventListener?.('visibilitychange', this.onVisibility);
    if (typeof this.motionQuery?.removeEventListener === 'function') this.motionQuery.removeEventListener('change', this.onMotionPreference);
    else this.motionQuery?.removeListener?.(this.onMotionPreference);
    this.root?.replaceChildren?.();
    this.useFallback('disposed');
    this.lastSave = null;
  }

  getSnapshot() {
    const layers = this.model?.layers || [];
    const renderedLayers = Array.from(this.root?.children || []);
    return Object.freeze({
      schema: TITLE_SCENE_SCHEMA_V79,
      active: this.active,
      status: this.reason,
      presetId: this.model?.presetId || null,
      placementId: this.model?.placementId || null,
      shipId: this.model?.shipId || null,
      shipAssetId: this.model?.shipAssetId || null,
      shipAngleId: this.model?.shipAngleId || null,
      shipAssetFailure: this.shipAssetFailureV90,
      availableShipAngles: this.model?.availableShipAngles || 0,
      viewpoint: this.model?.sceneContext.viewpoint || null,
      debrisSource: this.model?.sceneContext.debris || null,
      shipName: this.model?.shipName || null,
      mode: this.model?.mode || null,
      layerCount: layers.length,
      roles: Object.freeze([...new Set(layers.map((layer) => layer.role))]),
      readyAssetCount: renderedLayers.filter((layer) => layer?.dataset?.assetStatus === 'ready').length,
      missingAssetCount: renderedLayers.filter((layer) => layer?.dataset?.assetStatus === 'missing').length,
      proceduralFallbacks: Object.freeze(renderedLayers
        .filter((layer) => layer?.dataset?.renderer === 'procedural' && !layer.hidden)
        .map((layer) => layer.dataset.layerId)),
      fallbackVisible: Boolean(this.fallback && !this.fallback.hidden)
    });
  }
}
