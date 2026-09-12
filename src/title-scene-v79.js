import {
  TITLE_SCENE_FALLBACK_V79,
  TITLE_SCENE_SCHEMA_V79,
  buildTitleSceneModelV79
} from './title-scene-catalog-v79.js';

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
    matchMedia = globalThis.matchMedia?.bind(globalThis)
  } = {}) {
    this.root = root || null;
    this.fallback = fallback || null;
    this.supportsScene = supportsScene;
    this.active = false;
    this.lastSave = null;
    this.model = null;
    this.signature = '';
    this.reason = 'not-rendered';
    this.motionQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    this.onMotionPreference = () => { if (this.active) this.show(this.lastSave); };
    if (typeof this.motionQuery?.addEventListener === 'function') this.motionQuery.addEventListener('change', this.onMotionPreference);
    else this.motionQuery?.addListener?.(this.onMotionPreference);
    if (this.fallback && !this.fallback.getAttribute?.('src')) this.fallback.src = TITLE_SCENE_FALLBACK_V79.src;
  }

  useFallback(reason = 'fallback') {
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

  createLayer(layer, documentRef) {
    const element = documentRef.createElement('div');
    element.className = `title-scene-layer-v79 title-scene-layer-v79--${layer.role} title-scene-layer-v79--${layer.id}`;
    element.dataset.layerId = layer.id;
    element.dataset.role = layer.role;
    element.dataset.renderer = layer.renderer;
    if (layer.fallbackLayerId) element.dataset.fallbackLayerId = layer.fallbackLayerId;
    if (layer.assetId) element.dataset.assetId = layer.assetId;
    if (layer.runtimeId) element.dataset.runtimeId = layer.runtimeId;
    element.setAttribute('aria-hidden', 'true');
    element.style?.setProperty?.('--title-scene-depth-v79', String(layer.depth));

    if (layer.renderer === 'image') {
      const image = documentRef.createElement('img');
      image.alt = '';
      image.decoding = 'async';
      image.draggable = false;
      image.addEventListener?.('load', () => {
        element.dataset.assetStatus = 'ready';
        this.syncProceduralFallback(layer.fallbackLayerId);
      }, { once: true });
      image.addEventListener?.('error', () => {
        element.dataset.assetStatus = 'missing';
        element.hidden = true;
        if (this.root) this.root.dataset.degraded = 'true';
        this.syncProceduralFallback(layer.fallbackLayerId);
        if (layer.required) this.useFallback(`missing:${layer.id}`);
      }, { once: true });
      image.src = layer.assetSrc;
      element.append?.(image);
      element.dataset.assetStatus = 'loading';
    }
    return element;
  }

  render(model) {
    const documentRef = this.root?.ownerDocument || globalThis.document;
    if (!this.root || !documentRef?.createElement || typeof this.root.replaceChildren !== 'function') {
      return this.useFallback('dom-unsupported');
    }
    const layers = model.layers.map((layer) => this.createLayer(layer, documentRef));
    this.root.replaceChildren(...layers);
    this.root.hidden = false;
    this.root.dataset.status = 'ready';
    this.root.dataset.active = 'true';
    this.root.dataset.preset = model.presetId;
    this.root.dataset.mode = model.mode;
    this.root.dataset.tone = model.tone;
    this.root.dataset.degraded = 'false';
    this.root.setAttribute?.('aria-label', `${model.presetLabel} · animation ${model.mode}`);
    if (this.fallback) this.fallback.hidden = true;
    setParentStatus(this.root, 'ready');
    this.model = model;
    this.signature = `${model.presetId}:${model.mode}`;
    this.reason = 'ready';
    return this.getSnapshot();
  }

  show(save = {}) {
    this.active = true;
    this.lastSave = save;
    let supported = false;
    try { supported = Boolean(this.root && this.supportsScene()); } catch { supported = false; }
    if (!supported) return this.useFallback('css-unsupported');
    const model = buildTitleSceneModelV79(save, { prefersReducedMotion: Boolean(this.motionQuery?.matches) });
    if (this.signature !== `${model.presetId}:${model.mode}` || this.root.dataset.status !== 'ready') {
      try { this.render(model); } catch { return this.useFallback('render-error'); }
    }
    else {
      this.root.hidden = false;
      this.root.dataset.active = 'true';
      if (this.fallback) this.fallback.hidden = true;
      setParentStatus(this.root, 'ready');
    }
    return this.getSnapshot();
  }

  hide() {
    this.active = false;
    if (this.root) this.root.dataset.active = 'false';
  }

  dispose() {
    this.hide();
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
