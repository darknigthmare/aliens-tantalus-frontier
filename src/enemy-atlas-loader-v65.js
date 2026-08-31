export const DEFAULT_ENEMY_ATLAS_CACHE_LIMIT_V65 = 12;
export const ENEMY_ATLAS_RETRY_BASE_MS_V65 = 1000;
export const ENEMY_ATLAS_RETRY_MAX_MS_V65 = 30000;

const imageReady = (image) => Boolean(image?.complete && (image.naturalWidth || image.width) > 0);

export class EnemyAtlasLRUV65 {
  constructor({ imageStore = new Map(), maxEntries = DEFAULT_ENEMY_ATLAS_CACHE_LIMIT_V65, ImageCtor = globalThis.Image, now = () => Date.now() } = {}) {
    if (!(imageStore instanceof Map)) throw new TypeError('EnemyAtlasLRUV65 requiert un imageStore Map.');
    if (!Number.isInteger(maxEntries) || maxEntries < 1) throw new RangeError('EnemyAtlasLRUV65 maxEntries doit être un entier positif.');
    if (typeof now !== 'function') throw new TypeError('EnemyAtlasLRUV65 now doit être une horloge.');
    this.imageStore = imageStore;
    this.maxEntries = maxEntries;
    this.ImageCtor = ImageCtor;
    this.now = now;
    this.records = new Map();
    this.workingSet = new Set();
    this.loads = 0;
    this.failures = 0;
    this.evictions = 0;
  }

  validateSheet(sheet) {
    if (!sheet || sheet.family !== 'enemy' || !sheet.imageKey || !sheet.path) {
      throw new TypeError('Une plaque ennemie résolue avec imageKey et path est requise.');
    }
    return sheet;
  }

  touch(imageKey) {
    const record = this.records.get(imageKey);
    if (!record) return null;
    this.records.delete(imageKey);
    this.records.set(imageKey, record);
    return record;
  }

  get(sheetOrImageKey) {
    const imageKey = typeof sheetOrImageKey === 'string' ? sheetOrImageKey : sheetOrImageKey?.imageKey;
    if (!imageKey) return null;
    this.touch(imageKey);
    return this.imageStore.get(imageKey) || null;
  }

  setWorkingSet(sheets = []) {
    // Les plaques visibles sont protégées avant la première demande de la
    // frame. Le budget LRU reste réservé aux plaques devenues inactives.
    this.workingSet = new Set(sheets
      .filter((sheet) => sheet?.family === 'enemy' && sheet.imageKey)
      .map((sheet) => sheet.imageKey));
    this.evictOverflow();
  }

  recordStatus(sheetOrImageKey) {
    const key = typeof sheetOrImageKey === 'string' ? sheetOrImageKey : sheetOrImageKey?.imageKey;
    const record = this.records.get(key);
    return record ? Object.freeze({
      imageKey: key,
      path: record.sheet.path,
      status: record.status,
      consecutiveFailures: record.consecutiveFailures || 0,
      retryAt: record.retryAt || 0
    }) : null;
  }

  ensure(sheet) {
    const entry = this.validateSheet(sheet);
    const known = this.touch(entry.imageKey);
    if (known && (known.status !== 'failed' || this.now() < known.retryAt)) return known.promise;

    const stored = this.imageStore.get(entry.imageKey);
    if (imageReady(stored)) {
      const promise = Promise.resolve(stored);
      this.records.set(entry.imageKey, { sheet: entry, image: stored, promise, status: 'ready' });
      this.evictOverflow(entry.imageKey);
      return promise;
    }
    if (typeof this.ImageCtor !== 'function') return Promise.resolve(null);

    const image = stored || new this.ImageCtor();
    image.decoding = 'async';
    const record = { sheet: entry, image, promise: null, status: 'loading', consecutiveFailures: known?.consecutiveFailures || 0, retryAt: 0 };
    const promise = new Promise((resolve) => {
      image.onload = () => {
        record.status = 'ready';
        record.consecutiveFailures = 0;
        record.retryAt = 0;
        this.loads += 1;
        resolve(image);
      };
      image.onerror = () => {
        record.status = 'failed';
        record.consecutiveFailures += 1;
        const delay = Math.min(ENEMY_ATLAS_RETRY_MAX_MS_V65, ENEMY_ATLAS_RETRY_BASE_MS_V65 * 2 ** Math.min(30, record.consecutiveFailures - 1));
        record.retryAt = this.now() + delay;
        record.image = null;
        this.failures += 1;
        if (this.imageStore.get(entry.imageKey) === image) this.imageStore.delete(entry.imageKey);
        resolve(null);
      };
    });
    record.promise = promise;
    this.records.set(entry.imageKey, record);
    this.imageStore.set(entry.imageKey, image);
    image.src = entry.path;
    this.evictOverflow(entry.imageKey);
    return promise;
  }

  evictOverflow(protectedKey = null) {
    const inactive = [...this.records.keys()].filter((key) => !this.workingSet.has(key));
    while (inactive.length > this.maxEntries) {
      const index = inactive.findIndex((key) => key !== protectedKey);
      if (index < 0) break;
      const [oldestKey] = inactive.splice(index, 1);
      const record = this.records.get(oldestKey);
      this.records.delete(oldestKey);
      if (this.imageStore.get(oldestKey) === record?.image) this.imageStore.delete(oldestKey);
      this.evictions += 1;
    }
  }

  async preload(sheets = [], { concurrency = 4 } = {}) {
    const unique = [...new Map(sheets
      .filter((sheet) => sheet?.family === 'enemy' && sheet.imageKey && sheet.path)
      .map((sheet) => [sheet.imageKey, sheet])).values()];
    const width = Math.max(1, Math.min(this.maxEntries, Math.trunc(concurrency) || 1));
    let cursor = 0;
    const workers = Array.from({ length: Math.min(width, unique.length) }, async () => {
      while (cursor < unique.length) {
        const index = cursor;
        cursor += 1;
        await this.ensure(unique[index]);
      }
    });
    await Promise.all(workers);
    return this.snapshot();
  }

  snapshot() {
    const records = [...this.records.values()];
    return Object.freeze({
      schema: 65,
      maxEntries: this.maxEntries,
      entries: records.length,
      ready: records.filter((record) => record.status === 'ready').length,
      loading: records.filter((record) => record.status === 'loading').length,
      failed: records.filter((record) => record.status === 'failed').length,
      unavailable: Object.freeze(records.filter((record) => record.status !== 'ready' && record.consecutiveFailures > 0)
        .map((record) => this.recordStatus(record.sheet.imageKey))),
      loads: this.loads,
      failures: this.failures,
      evictions: this.evictions,
      imageKeys: Object.freeze([...this.records.keys()])
    });
  }
}
