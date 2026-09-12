export const AUDIO_FORMATS_V77 = Object.freeze([
  { extension: 'mp3', mime: 'audio/mpeg' }, { extension: 'wav', mime: 'audio/wav' },
  { extension: 'ogg', mime: 'audio/ogg' }, { extension: 'm4a', mime: 'audio/mp4' },
  { extension: 'webm', mime: 'audio/webm' }
]);
export const AUDIO_MIME_V77 = Object.freeze(Object.fromEntries(AUDIO_FORMATS_V77.map(x => ['.' + x.extension, x.mime])));
export const AUDIO_SLOTS_V77 = Object.freeze({ sfx: Object.freeze(['shot', 'tracker', 'hit', 'ui', 'alarm']), music: Object.freeze(['menu', 'hub', 'mission']) });
// Leaving a playable world must invalidate its pending music and delayed effects.
export const resolveViewAudioSceneV77 = view => ['play', 'bioforge'].includes(view) ? 'mission' : view === 'hub' ? 'hub' : 'menu';
export const emptyAudioManifestV77 = () => ({ schema: 1, tracks: Object.fromEntries(Object.entries(AUDIO_SLOTS_V77)
  .map(([kind, ids]) => [kind, Object.fromEntries(ids.map(id => [id, { sources: [], fallback: kind === 'sfx' ? 'synth' : 'silence' }]))])) });

export function normalizeAudioManifestV77(raw) {
  const result = emptyAudioManifestV77();
  if (raw?.schema !== 1) return result;
  for (const [kind, ids] of Object.entries(AUDIO_SLOTS_V77)) for (const id of ids) {
    const sources = raw.tracks?.[kind]?.[id]?.sources;
    if (!Array.isArray(sources)) continue;
    result.tracks[kind][id].sources = AUDIO_FORMATS_V77.flatMap(format => sources.filter(source => {
      const path = source?.path;
      return typeof path === 'string' && path === `/assets/audio/${kind}/${id}.${format.extension}`
        && source.mime === format.mime && Number.isSafeInteger(source.bytes) && source.bytes > 0
        && /^[a-f0-9]{64}$/.test(source.sha256 || '');
    }).slice(0, 1).map(source => ({ ...source })));
  }
  return result;
}

export function isAudioResponseV77(response) {
  const mime = String(response?.headers?.get?.('content-type') || '').split(';')[0].trim().toLowerCase();
  return Boolean(response?.ok && response.status !== 206 && response.type !== 'opaque'
    && /^(audio\/(mpeg|mp3|wav|wave|x-wav|ogg|mp4|x-m4a|webm)|application\/ogg|video\/webm)$/.test(mime));
}

// Both success and failure caches are bounded. A missing/corrupt optional file
// is retried later, never once per shot; concurrent requests share one transfer.
export class AudioAssetBankV77 {
  constructor({ fetchImpl = globalThis.fetch?.bind(globalThis), now = () => Date.now(), maxBytes = 32 * 1024 * 1024,
    maxFileBytes = 24 * 1024 * 1024, timeoutMs = 8000, retryMs = 60000 } = {}) {
    Object.assign(this, { fetchImpl, now, maxBytes, maxFileBytes, timeoutMs, retryMs });
    this.cache = new Map(); this.pending = new Map(); this.failures = new Map(); this.bytes = 0;
    this.controllers = new Set(); this.disposed = false;
  }
  markFailure(key, reason) {
    this.failures.delete(key); this.failures.set(key, { retryAt: this.now() + this.retryMs, reason });
    while (this.failures.size > 64) this.failures.delete(this.failures.keys().next().value);
  }
  async load(source) {
    if (this.disposed || !this.fetchImpl || !source) return null;
    const key = `${source.path}?v=${source.sha256.slice(0, 16)}`;
    if (this.cache.has(key)) { const value = this.cache.get(key); this.cache.delete(key); this.cache.set(key, value); return value; }
    if (this.pending.has(key)) return this.pending.get(key);
    if ((this.failures.get(key)?.retryAt || 0) > this.now()) return null;
    const task = this.fetchSource(key, source).finally(() => this.pending.delete(key));
    this.pending.set(key, task); return task;
  }
  async fetchSource(key, source) {
    const controller = new AbortController(); this.controllers.add(controller);
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(key, { signal: controller.signal, cache: 'no-cache' });
      if (!isAudioResponseV77(response)) throw new Error(`http-or-mime:${response.status}`);
      if (source.bytes > this.maxFileBytes || Number(response.headers.get('content-length')) > this.maxFileBytes) throw new Error('file-too-large');
      let data;
      if (response.body?.getReader) {
        const reader = response.body.getReader(); const chunks = []; let length = 0;
        try {
          for (;;) { const chunk = await reader.read(); if (chunk.done) break;
            length += chunk.value.byteLength;
            if (length > this.maxFileBytes) throw new Error('file-too-large'); chunks.push(chunk.value);
          }
        } catch (error) { await reader.cancel().catch(() => {}); throw error; }
        const bytes = new Uint8Array(length); let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; } data = bytes.buffer;
      } else data = await response.arrayBuffer();
      if (!data.byteLength || data.byteLength > this.maxFileBytes || data.byteLength !== source.bytes) throw new Error('invalid-length');
      if (globalThis.crypto?.subtle) {
        const digest = new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', data));
        if ([...digest].map(byte => byte.toString(16).padStart(2, '0')).join('') !== source.sha256) throw new Error('hash-mismatch');
      }
      if (this.disposed) return null;
      const value = { data, mime: source.mime, key };
      while (this.bytes + data.byteLength > this.maxBytes && this.cache.size) {
        const oldest = this.cache.keys().next().value; this.bytes -= this.cache.get(oldest).data.byteLength; this.cache.delete(oldest);
      }
      if (data.byteLength <= this.maxBytes) { this.cache.set(key, value); this.bytes += data.byteLength; }
      this.failures.delete(key); return value;
    } catch (error) { if (!this.disposed) this.markFailure(key, error?.message || 'load-failed'); return null;
    } finally { clearTimeout(timer); controller.abort(); this.controllers.delete(controller); }
  }
  dispose() {
    this.disposed = true; for (const controller of this.controllers) controller.abort();
    this.cache.clear(); this.failures.clear(); this.bytes = 0;
  }
}
