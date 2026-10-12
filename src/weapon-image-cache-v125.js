/** Scene-owned equipment images. Catalogue cards keep their own DOM images;
 * gameplay retains only the selected pickup, operators and admitted rig art.
 * A completed request may never restore an evicted or previous-scene entry.
 */
const dimensions = image => ({ width: Number(image?.naturalWidth ?? image?.width ?? 0),
  height: Number(image?.naturalHeight ?? image?.height ?? 0) });

export function weaponImageReadyV125(image, asset = {}) {
  const size = dimensions(image);
  return Boolean(image?.complete && size.width > 0 && size.height > 0
    && (!asset.sourceWidth || size.width === asset.sourceWidth)
    && (!asset.sourceHeight || size.height === asset.sourceHeight));
}

const validAsset = asset => Boolean(asset?.imageKey && typeof asset.path === 'string'
  && asset.path.startsWith('/assets/') && !asset.path.includes('..'));
const imageState = (image, asset, previous = 'loading') => weaponImageReadyV125(image, asset) ? 'ready'
  : image?.complete && image?.src ? 'error' : previous;

export class WeaponImageCacheV125 {
  constructor({ imageStore = new Map(), maxImages = 12, ImageClass = globalThis.Image } = {}) {
    this.images = imageStore;
    this.ImageClass = ImageClass;
    this.maxImages = Math.max(4, Math.min(32, Math.trunc(Number(maxImages) || 12)));
    this.entries = new Map();
    this.pinned = new Set();
    this.sequence = 0;
    this.releases = 0;
  }

  ensure(asset) {
    if (!validAsset(asset)) return null;
    const key = asset.imageKey;
    let entry = this.entries.get(key);
    let existing = this.images.get(key);
    if (entry && (entry.asset.path !== asset.path || existing !== entry.image)) {
      this.release(key);
      entry = null;
      existing = this.images.get(key);
    }
    if (entry) {
      entry.used = ++this.sequence;
      entry.state = imageState(entry.image, asset, entry.state);
      return entry.image;
    }
    if (this.entries.size >= this.maxImages && !this.releaseOldest()) return null;
    const image = existing || (typeof this.ImageClass === 'function' ? new this.ImageClass() : null);
    if (!image) return null;
    entry = { asset, image, owned: !existing, state: existing ? imageState(image, asset) : 'loading',
      used: ++this.sequence };
    this.entries.set(key, entry);
    if (existing) return image; // Do not replace another loader's callbacks.
    this.images.set(key, image);
    image.decoding = 'async';
    const current = () => this.entries.get(key) === entry && this.images.get(key) === image;
    image.onload = () => {
      if (current()) entry.state = weaponImageReadyV125(image, asset) ? 'ready' : 'error';
    };
    image.onerror = () => { if (current()) entry.state = 'error'; };
    image.src = asset.path;
    return image;
  }

  retain(assets = []) {
    const unique = new Map();
    for (const asset of assets) if (validAsset(asset) && unique.size < this.maxImages) unique.set(asset.imageKey, asset);
    this.pinned = new Set(unique.keys());
    for (const asset of unique.values()) this.ensure(asset);
    while (this.entries.size > this.maxImages && this.releaseOldest()) { /* bounded */ }
    return this.snapshot();
  }

  releaseOldest() {
    const oldest = [...this.entries].filter(([key]) => !this.pinned.has(key))
      .sort((a, b) => a[1].used - b[1].used)[0];
    return oldest ? this.release(oldest[0]) : false;
  }

  release(key) {
    const entry = this.entries.get(key);
    if (!entry) return false;
    this.entries.delete(key);
    if (entry.owned) {
      entry.image.onload = null;
      entry.image.onerror = null;
      if (this.images.get(key) === entry.image) this.images.delete(key);
    }
    this.releases++;
    return true;
  }

  clear() {
    this.pinned.clear();
    for (const key of [...this.entries.keys()]) this.release(key);
  }

  snapshot() {
    const assets = [...this.entries.values()].map(entry => ({ imageKey: entry.asset.imageKey,
      path: entry.asset.path, state: imageState(entry.image, entry.asset, entry.state),
      pinned: this.pinned.has(entry.asset.imageKey) }));
    return { schema: 125, limit: this.maxImages, retained: assets.length,
      ready: assets.filter(entry => entry.state === 'ready').length,
      loading: assets.filter(entry => entry.state === 'loading').length,
      failed: assets.filter(entry => entry.state === 'error').length, releases: this.releases, assets };
  }
}
