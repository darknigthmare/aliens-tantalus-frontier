/* Covenant visual release 0.11. Runtime images do not change simulation data.
 * Only manifest-admitted, successfully decoded states replace Canvas artwork.
 */
(function (root) {
  'use strict';
  const ASSET_ROOT = '/assets/openai/sprites/alien-covenant-v011/';
  const MANIFEST_URL = '/dlc/covenant/sprites-v011.json';
  const KINDS = new Set(['human', 'creature', 'weapon', 'prop']);
  const STATES = new Set(['idle', 'attack', 'walk', 'run', 'crawl', 'dead', 'armed']);
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  const pair = (v, label) => {
    if (!Array.isArray(v) || v.length !== 2 || !v.every(finite)) throw new Error('Invalid ' + label);
    return Object.freeze(v.slice());
  };
  function compileManifest(raw) {
    if (!raw || raw.schemaVersion !== 1 || raw.release !== '0.11.0' || !Array.isArray(raw.assets)) {
      throw new Error('Invalid Covenant sprite manifest');
    }
    const byId = new Map(), byState = new Map();
    for (const input of raw.assets) {
      const { id, kind, key, state, path, width, height, bytes, sha256 } = input;
      if (!/^[a-z][a-zA-Z0-9-]{0,79}$/.test(id || '') || !KINDS.has(kind)
        || !/^[a-z][a-zA-Z0-9-]{0,79}$/.test(key || '') || !STATES.has(state)
        || path !== ASSET_ROOT + id + '.png' || byId.has(id)
        || !Number.isInteger(width) || width < 1 || width > 8192
        || !Number.isInteger(height) || height < 1 || height > 8192
        || !Number.isSafeInteger(bytes) || bytes < 1 || !/^[a-f0-9]{64}$/.test(sha256 || '')) {
        throw new Error('Invalid Covenant sprite identity: ' + id);
      }
      const b = input.alphaBounds;
      if (!Array.isArray(b) || b.length !== 4 || !b.every(Number.isInteger)
        || b[0] < 0 || b[1] < 0 || b[2] > width || b[3] > height || b[0] >= b[2] || b[1] >= b[3]) {
        throw new Error('Invalid alpha bounds: ' + id);
      }
      const anchor = pair(input.anchor, 'sprite anchor');
      if (anchor[0] < b[0] || anchor[0] > b[2] || anchor[1] < b[1] || anchor[1] > b[3]
        || !finite(input.logicalHeight) || input.logicalHeight <= 0 || input.logicalHeight > 2000
        || input.sourceFacing !== 1 && input.sourceFacing !== -1
        || input.verified1to1 !== false) throw new Error('Invalid sprite geometry/status: ' + id);
      const token = kind + ':' + key + ':' + state;
      if (byState.has(token)) throw new Error('Duplicate visual state: ' + token);
      const rooms = input.rooms === undefined ? null : input.rooms;
      if (rooms !== null && (!Array.isArray(rooms) || !rooms.every(v => /^[a-z][a-z0-9-]*$/.test(v)))) {
        throw new Error('Invalid room restriction: ' + id);
      }
      const entry = Object.freeze({ id, kind, key, state, path, width, height, bytes, sha256,
        alphaBounds: Object.freeze(b.slice()), anchor, logicalHeight: input.logicalHeight,
        sourceFacing: input.sourceFacing, verified1to1: false,
        rooms: rooms && Object.freeze(rooms.slice()),
        grip: input.grip ? pair(input.grip, 'weapon grip') : null,
        muzzle: input.muzzle ? pair(input.muzzle, 'weapon muzzle') : null,
        heldGrip: input.heldGrip ? pair(input.heldGrip, 'human held grip') : null,
        heldAngle: finite(input.heldAngle) ? input.heldAngle : 0,
        note: typeof input.note === 'string' ? input.note : '' });
      byId.set(id, entry); byState.set(token, entry);
    }
    return Object.freeze({ entries: Object.freeze([...byId.values()]),
      get: id => byId.get(id) || null,
      resolve: (kind, key, state = 'idle', room = null) => {
        const entry = byState.get(kind + ':' + key + ':' + state);
        return entry && (!entry.rooms || entry.rooms.includes(room)) ? entry : null;
      } });
  }

  function createRegistry({ ImageClass = root.Image, fetcher = root.fetch?.bind(root), manifest = null } = {}) {
    let compiled = compileManifest({ schemaVersion: 1, release: '0.11.0', assets: [] });
    let status = 'empty', error = null, pending = null;
    const images = new Map();
    function useManifest(raw) {
      const next = compileManifest(raw); // Rejection never partially replaces the admitted set.
      compiled = next; images.clear(); status = 'ready'; error = null;
      return compiled.entries.length;
    }
    if (manifest) useManifest(manifest);
    function load() {
      if (status === 'ready') return Promise.resolve(compiled.entries.length);
      if (pending) return pending;
      if (!fetcher) return Promise.resolve(0);
      status = 'loading';
      pending = fetcher(MANIFEST_URL, { credentials: 'same-origin' })
        .then(response => { if (!response.ok) throw new Error('Sprite manifest unavailable'); return response.json(); })
        .then(useManifest).catch(reason => { status = 'unavailable'; error = String(reason.message || reason); return 0; });
      return pending;
    }
    function imageFor(entry) {
      if (!entry || !ImageClass) return null;
      let item = images.get(entry.id);
      if (!item) {
        const image = new ImageClass();
        item = { image, status: 'loading' }; images.set(entry.id, item);
        image.onload = () => { item.status = image.naturalWidth === entry.width && image.naturalHeight === entry.height ? 'ready' : 'invalid-size'; };
        image.onerror = () => { item.status = 'unavailable'; };
        image.decoding = 'async';
        image.src = entry.path;
      }
      return item.status === 'ready' ? item.image : null;
    }
    return Object.freeze({ load, useManifest,
      entries: () => compiled.entries,
      entry: (kind, key, state = 'idle', room = null) => compiled.resolve(kind, key, state, room),
      sprite: (kind, key, state = 'idle', room = null) => {
        const entry = compiled.resolve(kind, key, state, room), image = imageFor(entry);
        return image ? { entry, image } : null;
      },
      inspect: () => ({ status, error, admitted: compiled.entries.length,
        images: [...images].map(([id, value]) => ({ id, status: value.status })) }) });
  }
  const api = Object.freeze({ ASSET_ROOT, MANIFEST_URL, compileManifest, createRegistry });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    root.CovenantSpriteRegistryV011 = api;
    root.CovenantSpritesV011 = createRegistry({ manifest: root.CovenantSpriteManifestV011 || null });
    root.CovenantSpritesV011.load();
  }
})(globalThis);
