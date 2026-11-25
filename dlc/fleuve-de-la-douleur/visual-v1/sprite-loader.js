/* Optional PNG presentation. One complete image per asset; no atlas cells.
 * This module owns only decoded images and renderer observations, never saves. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    try {
      root.ROP_SPRITES = api.createRegistry(root.ROP_SPRITE_MANIFEST, {
        Image: root.Image,
        baseURL: root.document && root.document.baseURI
      });
    } catch (error) {
      root.ROP_SPRITES = api.createRegistry({ schema: 1, id: 'river-of-pain-visual-v1', assets: [] });
      root.ROP_SPRITES.error = String(error.message || error);
    }
  }
})(globalThis, function () {
  'use strict';
  const categories = {
    person: new Set(['idle', 'crouch', 'stowed']),
    creature: new Set(['idle']),
    weapon: new Set(['inventory']),
    prop: new Set(['static']),
    item: new Set(['inventory'])
  };
  const itemIds = new Set(['cell', 'wire', 'casing', 'decoy', 'ration', 'medkit', 'ammo', 'flare',
    'tracker', 'weld', 'light']);
  // Fixed v0.9 resident identities. A unit check compares this admission rule
  // against the recovered data.js definitions; it is not a new population.
  const residentAccessories = Object.freeze({ vale: 'tools', rhee: 'mug', arden: 'tablet',
    becker: 'tablet', ferris: 'tools', corban: 'tablet', hale: 'tools', doran: 'tablet',
    sato: 'linen', bell: 'tools', kent: 'tablet', voss: 'tablet' });
  const identifier = /^[a-z][a-z0-9_-]{0,95}$/;
  const fileName = /^assets\/[a-z0-9][a-z0-9_/-]*\.png$/;
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const record = value => value && typeof value === 'object' && !Array.isArray(value);
  function requireValue(condition, message) {
    if (!condition) throw new Error('Sprite manifest: ' + message);
  }
  function validateManifest(manifest) {
    requireValue(record(manifest) && manifest.schema === 1, 'schema must be 1.');
    requireValue(manifest.id === 'river-of-pain-visual-v1', 'unexpected visual identity.');
    requireValue(Array.isArray(manifest.assets) && manifest.assets.length <= 512, 'assets must be a bounded array.');
    const ids = new Set(), coverage = new Set();
    for (const asset of manifest.assets) {
      requireValue(record(asset) && identifier.test(asset.id || ''), 'invalid asset id.');
      requireValue(!ids.has(asset.id), 'duplicate id: ' + asset.id);
      ids.add(asset.id);
      requireValue(typeof asset.file === 'string' && fileName.test(asset.file)
        && !asset.file.includes('//') && !asset.file.split('/').some(part => !part || part === '.' || part === '..'),
      'asset paths must name relative PNG files under assets/.');
      requireValue(Object.hasOwn(categories, asset.category) && categories[asset.category].has(asset.pose),
        'unsupported category or pose for ' + asset.id);
      requireValue(Array.isArray(asset.targetIds) && asset.targetIds.length > 0 && asset.targetIds.length <= 64
        && asset.targetIds.every(id => typeof id === 'string' && identifier.test(id))
        && new Set(asset.targetIds).size === asset.targetIds.length, 'invalid targetIds for ' + asset.id);
      requireValue(['person', 'creature'].includes(asset.category)
        ? asset.facing === 1 || asset.facing === -1 : asset.facing === 0,
      'facing must be 1/-1 for actors, 0 for objects and inventory.');
      requireValue(finite(asset.height) && asset.height > 0 && asset.height <= 2048, 'invalid display height.');
      const b = asset.bounds, a = asset.anchor;
      requireValue(record(b) && ['x', 'y', 'w', 'h'].every(key => Number.isInteger(b[key]))
        && b.x >= 0 && b.y >= 0 && b.w > 0 && b.h > 0, 'invalid alpha bounds.');
      requireValue(record(a) && finite(a.x) && finite(a.y)
        && a.x >= b.x && a.x <= b.x + b.w && a.y >= b.y && a.y <= b.y + b.h,
      'anchor must be inside the declared image bounds (bottom edge allowed).');
      requireValue(['none', 'pulse', 'flame'].includes(asset.weapon), 'invalid weapon selector.');
      requireValue(!['creature', 'prop', 'item'].includes(asset.category) || asset.weapon === 'none',
        'creatures, props and inventory items cannot carry a weapon selector.');
      requireValue(asset.category !== 'item' || asset.targetIds.every(id => itemIds.has(id)),
        'inventory items must target a native life item or equipment control.');
      requireValue(asset.category !== 'weapon' || ['pulse', 'flame'].includes(asset.weapon),
        'inventory weapon selector must be pulse or flame.');
      if (Object.hasOwn(asset, 'accessory'))
        requireValue(asset.category === 'person' && asset.pose === 'idle' && asset.weapon === 'none'
          && typeof asset.accessory === 'string'
          && asset.targetIds.every(id => Object.hasOwn(residentAccessories, id)
            && residentAccessories[id] === asset.accessory),
        'accessory must match the native tool of each targeted idle, unarmed resident.');
      requireValue(asset.state === 'normal', 'only explicitly supported normal-state images are admitted in v1.');
      requireValue(record(asset.fidelity) && typeof asset.fidelity.status === 'string'
        && asset.fidelity.status.length > 0 && asset.fidelity.status.length <= 120
        && typeof asset.fidelity.note === 'string' && asset.fidelity.note.length <= 2400,
      'fidelity needs a status and a note.');
      requireValue(typeof asset.sha256 === 'string' && /^[a-f0-9]{64}$/.test(asset.sha256), 'invalid SHA-256.');
      for (const id of asset.targetIds) {
        const key = [asset.category, id, asset.pose, asset.weapon, asset.state, asset.facing].join('|');
        requireValue(!coverage.has(key), 'ambiguous visual coverage: ' + key);
        coverage.add(key);
      }
    }
    return manifest;
  }
  function createRegistry(input, options) {
    options = options || {};
    const manifest = validateManifest(input);
    const entries = manifest.assets.map(asset => ({ asset, image: null, status: 'pending', error: null }));
    const listeners = new Set(), observations = new WeakMap();
    const ImageClass = options.Image;
    const announce = entry => {
      for (const listener of listeners) {
        try { listener(entry); } catch (_) { /* Presentation listeners cannot stop gameplay. */ }
      }
    };
    const jobs = entries.map(entry => new Promise(resolve => {
      if (typeof ImageClass !== 'function' || !options.baseURL) {
        entry.status = 'error'; entry.error = 'Image loading is unavailable.'; resolve(entry); return;
      }
      const image = new ImageClass();
      entry.image = image;
      let done = false;
      const finish = error => {
        if (done) return;
        done = true;
        const b = entry.asset.bounds, a = entry.asset.anchor;
        const valid = image.naturalWidth > 0 && image.naturalHeight > 0
          && b.x + b.w <= image.naturalWidth && b.y + b.h <= image.naturalHeight
          && a.x <= image.naturalWidth && a.y <= image.naturalHeight;
        entry.status = !error && valid ? 'ready' : 'error';
        entry.error = entry.status === 'error' ? String(error || 'PNG dimensions do not contain the declared bounds.') : null;
        announce(entry); resolve(entry);
      };
      image.decoding = 'async';
      image.onload = () => {
        if (typeof image.decode === 'function') {
          Promise.resolve().then(() => image.decode()).then(() => finish(), finish);
        } else finish();
      };
      image.onerror = () => finish('PNG could not be loaded.');
      try { image.src = new URL(entry.asset.file, options.baseURL).href; } catch (error) { finish(error); }
    }));
    const registry = {
      manifest,
      entries,
      settled: Promise.all(jobs),
      subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
      select(query) {
        const matches = entries.filter(entry => entry.status === 'ready'
          && entry.asset.category === query.category && entry.asset.targetIds.includes(query.targetId)
          && entry.asset.pose === query.pose && entry.asset.weapon === query.weapon
          && entry.asset.state === query.state
          && (entry.asset.accessory || null) === (query.accessory || null));
        return matches.find(entry => entry.asset.facing === query.facing) || matches[0] || null;
      },
      /* Samples coordinates and authored walk phase without changing the entity.
       * A resumed actor with an unknown nonzero phase keeps its original pose for
       * the first observation. No animation frames are fabricated. */
      moving(renderer, key, body) {
        let states = observations.get(renderer);
        if (!states) { states = new Map(); observations.set(renderer, states); }
        const room = renderer.fidelitySim && renderer.fidelitySim.s && renderer.fidelitySim.s.room;
        const sample = { x: body.x, z: body.z, walk: body.walk || 0, room };
        const previous = states.get(key);
        const changed = previous && previous.room === room
          ? Math.abs(sample.x - previous.x) > 0.0001 || Math.abs(sample.z - previous.z) > 0.000001
            || Math.abs(sample.walk - previous.walk) > 0.0001
          : Math.abs(sample.walk) > 0.0001;
        states.set(key, sample);
        return Boolean(changed);
      },
      draw(context, entry, placement) {
        if (!entry || entry.status !== 'ready') return false;
        const asset = entry.asset, image = entry.image;
        const unit = asset.height / asset.bounds.h;
        const mirrored = asset.facing && placement.facing && asset.facing !== placement.facing ? -1 : 1;
        context.save();
        try {
          context.translate(placement.x, placement.y);
          context.scale(placement.scale * mirrored, placement.scale);
          // Draw the complete PNG. Bounds are alpha bounds for scale calibration,
          // never a spritesheet source rectangle.
          context.drawImage(image, -asset.anchor.x * unit, -asset.anchor.y * unit,
            image.naturalWidth * unit, image.naturalHeight * unit);
        } catch (error) {
          entry.status = 'error';
          entry.error = 'PNG draw failed: ' + String(error && error.message || error);
          return false;
        } finally { context.restore(); }
        return true;
      }
    };
    return registry;
  }
  return { validateManifest, createRegistry };
});
