import { AudioAssetBankV77, emptyAudioManifestV77, normalizeAudioManifestV77 } from './audio-assets-v77.js';

const level = (value, fallback = 1) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(1, Number(value))) : fallback;
export class AudioDirector {
  constructor({ manifestUrl = '/assets/audio/manifest.json', fetchImpl = globalThis.fetch?.bind(globalThis),
    AudioContextCtor = globalThis.AudioContext || globalThis.webkitAudioContext, AudioCtor = globalThis.Audio,
    urlApi = globalThis.URL, now = () => Date.now(), bank = null } = {}) {
    Object.assign(this, { manifestUrl, fetchImpl, AudioContextCtor, AudioCtor, urlApi, now });
    this.context = null; this.master = null; this._enabled = true; this.disposed = false;
    this.volumes = { master: 1, effects: 0.7, music: 0.6 };
    this.bank = bank || new AudioAssetBankV77({ fetchImpl, now });
    this.manifest = emptyAudioManifestV77(); this.manifestStatus = 'unloaded'; this.manifestRetryAt = 0;
    this.manifestPending = null; this.manifestAbort = null;
    this.effectBuffers = new Map(); this.effectPending = new Map(); this.decodeFailures = new Map();
    this.effectBytes = 0; this.effectVoices = new Set(); this.timers = new Set();
    this.scene = null; this.sceneGeneration = 0; this.musicVoices = new Set(); this.musicPendingGeneration = -1;
    this.musicStatus = 'silent'; this.unlockStatus = 'locked';
    try { this.probe = AudioCtor ? new AudioCtor() : null; } catch { this.probe = null; }
  }
  get enabled() { return this._enabled; }
  set enabled(value) {
    const wasEnabled = this._enabled;
    this._enabled = Boolean(value);
    if (wasEnabled && !this._enabled) this.sceneGeneration += 1;
    this.applyVolumes();
    if (!this._enabled) { this.stopEffects(); this.stopMusic(0); }
    else if (this.context?.state === 'running') void this.playScene();
  }
  setVolumes(values = {}) {
    const musicWasAudible = this._enabled && this.volumes.music > 0 && this.volumes.master > 0;
    for (const key of ['master', 'effects', 'music']) if (values[key] !== undefined) this.volumes[key] = level(values[key], this.volumes[key]);
    // Muting releases the media even if play() has not resolved. Invalidate
    // that attempt so an immediate unmute can start its own pending playback.
    if (musicWasAudible && (!this.volumes.music || !this.volumes.master)) this.sceneGeneration += 1;
    this.applyVolumes();
    if (!this.volumes.effects || !this.volumes.master) this.stopEffects();
    if (!this.volumes.music || !this.volumes.master) this.stopMusic(0);
    else if (this._enabled && this.context?.state === 'running' && !this.musicVoices.size) void this.playScene();
    return { ...this.volumes };
  }
  applyVolumes() {
    if (this.master) this.master.gain.value = this._enabled ? this.volumes.effects * this.volumes.master * 0.26 : 0;
    for (const voice of this.musicVoices) voice.audio.volume = this._enabled ? this.volumes.music * this.volumes.master * voice.weight : 0;
  }
  async prepare() {
    if (this.disposed || this.manifestStatus === 'ready' || this.manifestRetryAt > this.now()) return this.manifest;
    if (this.manifestPending) return this.manifestPending;
    const controller = new AbortController(); this.manifestAbort = controller;
    const timer = setTimeout(() => controller.abort(), 8000);
    this.manifestPending = (async () => {
      try {
        if (!this.fetchImpl) throw new Error('fetch-unavailable');
        const response = await this.fetchImpl(this.manifestUrl, { signal: controller.signal, cache: 'no-cache' });
        if (!response.ok || !String(response.headers.get('content-type')).includes('application/json')) throw new Error('manifest-http-or-mime');
        const text = await response.text(); if (text.length > 131072) throw new Error('manifest-too-large');
        const raw = JSON.parse(text); if (raw.schema !== 1) throw new Error('manifest-schema');
        if (!this.disposed) { this.manifest = normalizeAudioManifestV77(raw); this.manifestStatus = 'ready'; }
      } catch { if (!this.disposed) { this.manifestStatus = 'unavailable'; this.manifestRetryAt = this.now() + 60000; }
      } finally { clearTimeout(timer); controller.abort(); this.manifestPending = null; this.manifestAbort = null; }
      return this.manifest;
    })();
    return this.manifestPending;
  }
  async unlock() {
    if (!this._enabled || this.disposed) return false;
    try {
      // Context creation/resume happens synchronously within the user gesture.
      if (!this.context && this.AudioContextCtor) {
        this.context = new this.AudioContextCtor(); this.master = this.context.createGain();
        this.master.connect(this.context.destination); this.applyVolumes();
      }
      if (!this.context) { this.unlockStatus = 'unsupported'; return false; }
      if (this.context.state === 'suspended') await this.context.resume();
      this.unlockStatus = this.context.state === 'running' ? 'running' : 'blocked';
      if (this.unlockStatus !== 'running') return false;
      void this.prepare().then(() => {
        for (const id of Object.keys(this.manifest.tracks.sfx)) void this.warmEffect(id);
        void this.playScene();
      });
      return true;
    } catch { this.unlockStatus = 'blocked'; return false; }
  }
  sources(kind, id) {
    return (this.manifest.tracks[kind]?.[id]?.sources || []).filter(source => {
      try { return !this.probe?.canPlayType || Boolean(this.probe.canPlayType(source.mime)); } catch { return true; }
    });
  }
  async warmEffect(id) {
    if (!this.context || this.disposed) return null;
    if (this.effectBuffers.has(id)) return this.effectBuffers.get(id);
    if (this.effectPending.has(id)) return this.effectPending.get(id);
    const work = (async () => {
      for (const source of this.sources('sfx', id)) {
        const key = `${source.path}:${source.sha256}`;
        if ((this.decodeFailures.get(key) || 0) > this.now()) continue;
        const file = await this.bank.load(source); if (!file || this.disposed) continue;
        try {
          const buffer = await this.context.decodeAudioData(file.data.slice(0));
          const bytes = buffer.length * buffer.numberOfChannels * 4;
          if (this.disposed) return null;
          if (!(bytes > 0) || bytes > 16 * 1024 * 1024) { this.decodeFailures.set(key, this.now() + 60000); continue; }
          while (this.effectBytes + bytes > 32 * 1024 * 1024 && this.effectBuffers.size) {
            const first = this.effectBuffers.keys().next().value, removed = this.effectBuffers.get(first);
            this.effectBytes -= removed.length * removed.numberOfChannels * 4; this.effectBuffers.delete(first);
          }
          this.effectBuffers.set(id, buffer); this.effectBytes += bytes; return buffer;
        } catch { this.decodeFailures.set(key, this.now() + 60000); }
      }
      return null;
    })().catch(() => null).finally(() => this.effectPending.delete(id));
    this.effectPending.set(id, work); return work;
  }
  playEffect(id, fallback) {
    if (!this._enabled || !this.volumes.effects || this.disposed || this.context?.state !== 'running') return false;
    const buffer = this.effectBuffers.get(id);
    if (buffer) {
      try {
        const source = this.context.createBufferSource(); source.buffer = buffer; source.connect(this.master);
        this.trackEffect(source); source.start(); return true;
      } catch { this.effectBuffers.delete(id); this.effectBytes -= buffer.length * buffer.numberOfChannels * 4; }
    }
    // Loading prepares FUTURE events. A shot heard late would misrepresent play.
    void this.prepare().then(() => this.warmEffect(id));
    fallback?.(); return false;
  }
  trackEffect(source) {
    while (this.effectVoices.size >= 24) { const oldest = this.effectVoices.values().next().value;
      try { oldest.stop(); oldest.disconnect(); } catch {} this.effectVoices.delete(oldest); }
    this.effectVoices.add(source);
    source.onended = () => { source.disconnect(); this.effectVoices.delete(source); };
  }
  stopEffects() {
    for (const voice of this.effectVoices) { try { voice.stop(); voice.disconnect(); } catch {} }
    this.effectVoices.clear(); for (const timer of this.timers) clearTimeout(timer); this.timers.clear();
  }
  tone(frequency = 220, duration = 0.08, type = 'square', volume = 0.08, glide = 0) {
    if (!this.context || this.context.state !== 'running' || !this._enabled || !this.volumes.effects || this.disposed) return false;
    try {
      const now = this.context.currentTime, oscillator = this.context.createOscillator(), gain = this.context.createGain();
      oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, now);
      if (glide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(24, frequency + glide), now + duration);
      gain.gain.setValueAtTime(volume, now); gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain).connect(this.master); this.trackEffect(oscillator);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); this.effectVoices.delete(oscillator); };
      oscillator.start(now); oscillator.stop(now + duration); return true;
    } catch { return false; }
  }
  shot() { return this.playEffect('shot', () => this.tone(92, 0.06, 'sawtooth', 0.18, -35)); }
  tracker() { return this.playEffect('tracker', () => this.tone(880, 0.055, 'sine', 0.12, 120)); }
  hit() { return this.playEffect('hit', () => this.tone(55, 0.12, 'square', 0.12, -20)); }
  ui() { return this.playEffect('ui', () => this.tone(420, 0.035, 'square', 0.05, 40)); }
  vent(payload = {}) {
    const occluded = Boolean(payload.occluded), distance = Math.max(0, Number(payload.distance) || 0);
    const volume = Math.max(0.025, 0.09 - Math.min(0.06, distance / 18000));
    if (String(payload.cue || '').includes('hatch')) { this.tone(118, 0.14, 'square', volume, -42); return; }
    this.tone(occluded ? 72 : 96, 0.08, 'triangle', volume, -18);
    this.tone(occluded ? 54 : 68, 0.11, 'square', volume * 0.55, -8);
  }
  alarm() {
    return this.playEffect('alarm', () => {
      this.tone(160, 0.28, 'sawtooth', 0.07, 80); const generation = this.sceneGeneration;
      const timer = setTimeout(() => { this.timers.delete(timer);
        if (generation === this.sceneGeneration) this.tone(115, 0.24, 'sawtooth', 0.06, 45);
      }, 180); this.timers.add(timer);
    });
  }
  setScene(scene) {
    const next = ['menu', 'hub', 'mission'].includes(scene) ? scene : null;
    if (this.scene === next) return this.playScene();
    this.scene = next; this.sceneGeneration += 1; this.stopEffects(); this.stopMusic(0.35);
    return this.playScene();
  }
  async playScene() {
    const generation = this.sceneGeneration, scene = this.scene;
    if (this.disposed || !scene || !this._enabled || !this.volumes.music || !this.volumes.master || this.context?.state !== 'running') return false;
    if ([...this.musicVoices].some(voice => voice.scene === scene && !voice.stopping)) return true;
    if (this.musicPendingGeneration === generation) return false;
    this.musicPendingGeneration = generation;
    const current = () => !this.disposed && generation === this.sceneGeneration && this._enabled && this.volumes.music > 0 && this.volumes.master > 0;
    try {
      await this.prepare();
      for (const source of this.sources('music', scene)) {
        const failureKey = `music:${source.path}:${source.sha256}`;
        if ((this.decodeFailures.get(failureKey) || 0) > this.now()) continue;
        const file = await this.bank.load(source); if (!current()) return false; if (!file) continue;
        let voice;
        try {
          if (!this.AudioCtor || !this.urlApi?.createObjectURL) break;
          const audio = new this.AudioCtor(), url = this.urlApi.createObjectURL(new Blob([file.data], { type: file.mime }));
          voice = { audio, url, scene, weight: 0, timer: null, stopping: false };
          audio.loop = true; audio.preload = 'auto'; audio.volume = 0; audio.src = url;
          this.musicVoices.add(voice);
          while (this.musicVoices.size > 2) this.releaseMusic(this.musicVoices.values().next().value);
          let timeout;
          try {
            await Promise.race([audio.play(), new Promise((_, reject) => {
              timeout = setTimeout(() => reject(new Error('audio-play-timeout')), 8000);
            })]);
          } finally { clearTimeout(timeout); }
          if (!current() || !this.musicVoices.has(voice)) { this.releaseMusic(voice); return false; }
          this.fadeMusic(voice, 1, 0.6); this.musicStatus = 'playing'; return true;
        } catch (error) {
          if (voice) this.releaseMusic(voice);
          if (!current()) return false;
          if (error?.name === 'NotAllowedError') { this.musicStatus = 'autoplay-blocked'; return false; }
          this.decodeFailures.set(failureKey, this.now() + 60000);
          // Unsupported/corrupt MP3 can fall through to a readable WAV/OGG.
        }
      }
      if (current()) this.musicStatus = 'silent-missing'; return false;
    } catch { if (current()) this.musicStatus = 'unavailable'; return false;
    } finally { if (this.musicPendingGeneration === generation) this.musicPendingGeneration = -1; }
  }
  fadeMusic(voice, target, duration) {
    clearTimeout(voice.timer); const start = this.now(), initial = voice.weight;
    if (target === 0) voice.stopping = true;
    const tick = () => {
      if (!this.musicVoices.has(voice)) return;
      const progress = duration > 0 ? Math.min(1, (this.now() - start) / (duration * 1000)) : 1;
      voice.weight = initial + (target - initial) * progress; this.applyVolumes();
      if (progress >= 1) { if (target === 0) this.releaseMusic(voice); return; }
      voice.timer = setTimeout(tick, 40);
    }; tick();
  }
  releaseMusic(voice) {
    if (!voice || !this.musicVoices.delete(voice)) return;
    clearTimeout(voice.timer);
    try { voice.audio.pause(); voice.audio.removeAttribute('src'); voice.audio.load(); } catch {}
    this.urlApi?.revokeObjectURL?.(voice.url);
  }
  stopMusic(fadeSeconds = 0) { for (const voice of this.musicVoices) this.fadeMusic(voice, 0, fadeSeconds); this.musicStatus = 'silent'; }
  dispose() {
    if (this.disposed) return;
    this.disposed = true; this.sceneGeneration += 1; this.manifestAbort?.abort(); this.stopEffects(); this.stopMusic(0);
    this.bank.dispose(); this.effectBuffers.clear(); this.effectBytes = 0;
    try { const closing = this.context?.close?.(); closing?.catch?.(() => {}); } catch {}
  }
}
