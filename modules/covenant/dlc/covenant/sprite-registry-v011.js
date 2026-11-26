/* Covenant visual releases 0.11/0.12/0.13. Runtime images do not change simulation data.
 * Only manifest-admitted, successfully decoded states replace Canvas artwork.
 */
(function (root) {
  'use strict';
  const ASSET_ROOT = '/assets/openai/sprites/alien-covenant-v011/';
  const ASSET_ROOT_V012 = '/assets/openai/sprites/alien-covenant-v012/';
  const ASSET_ROOT_V013 = '/assets/openai/sprites/alien-covenant-v013/';
  // These are the actual player costume scopes; the three ducts require crawling.
  // The independent activation tableau never borrows a campaign costume or cycle.
  const WALK_ROOMS = Object.freeze({
    'daniels-work': Object.freeze(['cryo', 'service', 'cabin', 'funeralairlock', 'evaprep', 'bridge', 'comms']),
    daniels: Object.freeze(['landing', 'wheat', 'ravine', 'forest', 'juggernaut', 'pilot', 'medlander',
      'burning', 'reeds', 'necropolis', 'court', 'workshop', 'gallery', 'garden', 'crypt', 'shaw',
      'catacomb', 'nave', 'plaza', 'infirmary', 'corridor', 'returncryo', 'embryos', 'coolantwalk',
      'evaclocker', 'cistern', 'undercroft', 'stores', 'relay', 'aqueduct', 'sluiceworks', 'effigybasin',
      'reliquary', 'windfall', 'sporehollow', 'surveyblind', 'landerhold', 'landercockpit', 'landermed',
      'davidquarters', 'musicroom', 'washroom', 'colonistvault']),
    'daniels-eva': Object.freeze(['lifter', 'cargo', 'sailaccess']),
    'david-young': Object.freeze(['whiteroom'])
  });
  const MANIFEST_URL = '/dlc/covenant/sprites-v011.json';
  const KINDS = new Set(['human', 'creature', 'weapon', 'prop']);
  const STATES = new Set(['idle', 'attack', 'walk', 'run', 'crawl', 'dead', 'armed']);
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  const pair = (v, label) => {
    if (!Array.isArray(v) || v.length !== 2 || !v.every(finite)) throw new Error('Invalid ' + label);
    return Object.freeze(v.slice());
  };
  function compileManifest(raw) {
    if (!raw || raw.schemaVersion !== 1 || !['0.11.0', '0.12.0', '0.13.0'].includes(raw.release) || !Array.isArray(raw.assets)) {
      throw new Error('Invalid Covenant sprite manifest');
    }
    const definitions = raw.cycles === undefined ? [] : raw.cycles;
    if (!Array.isArray(definitions) || definitions.length && !['0.12.0', '0.13.0'].includes(raw.release)) {
      throw new Error('Invalid Covenant sprite cycles');
    }
    const frameOwners = new Map(), cycleIds = new Set();
    for (const cycle of definitions) {
      if (!/^[a-z][a-zA-Z0-9-]{0,79}$/.test(cycle?.id || '') || cycleIds.has(cycle.id)
        || cycle.kind !== 'human' || !Object.hasOwn(WALK_ROOMS, cycle.key) || cycle.state !== 'walk'
        || raw.release === '0.12.0' && cycle.key !== 'daniels-work'
        || cycle.id !== cycle.key + '-walk' || cycle.angularFrequency !== 11
        || !Array.isArray(cycle.frames) || cycle.frames.length !== 8
        || cycle.frames.some((id, index) => id !== cycle.id + '-' + String(index + 1).padStart(2, '0'))) {
        throw new Error('Invalid Covenant walk cycle');
      }
      cycleIds.add(cycle.id);
      for (const id of cycle.frames) {
        if (typeof id !== 'string' || frameOwners.has(id)) throw new Error('Duplicate cycle frame: ' + id);
        frameOwners.set(id, cycle.id);
      }
    }
    const byId = new Map(), byState = new Map(), byCycle = new Map();
    const roots = raw.release === '0.13.0' ? [ASSET_ROOT, ASSET_ROOT_V012, ASSET_ROOT_V013]
      : raw.release === '0.12.0' ? [ASSET_ROOT, ASSET_ROOT_V012] : [ASSET_ROOT];
    for (const input of raw.assets) {
      const { id, kind, key, state, path, width, height, bytes, sha256 } = input;
      if (!/^[a-z][a-zA-Z0-9-]{0,79}$/.test(id || '') || !KINDS.has(kind)
        || !/^[a-z][a-zA-Z0-9-]{0,79}$/.test(key || '') || !STATES.has(state)
        || !roots.some(base => path === base + id + '.png') || byId.has(id)
        || !Number.isInteger(width) || width < 1 || width > 8192
        || !Number.isInteger(height) || height < 1 || height > 8192
        || !Number.isSafeInteger(bytes) || bytes < 1 || !/^[a-f0-9]{64}$/.test(sha256 || '')) {
        throw new Error('Invalid Covenant sprite identity: ' + id);
      }
      if (kind === 'human' && state === 'walk'
        && [ASSET_ROOT_V012, ASSET_ROOT_V013].some(base => path.startsWith(base)) && !frameOwners.has(id)) {
        throw new Error('Walk frame is not part of a complete declared cycle: ' + id);
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
      if (!frameOwners.has(id) && byState.has(token)) throw new Error('Duplicate visual state: ' + token);
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
      byId.set(id, entry);
      if (!frameOwners.has(id)) byState.set(token, entry);
    }
    for (const definition of definitions) {
      const token = definition.kind + ':' + definition.key + ':' + definition.state;
      const frames = definition.frames.map(id => byId.get(id));
      const sourceRoot = definition.key === 'daniels-work' ? ASSET_ROOT_V012 : ASSET_ROOT_V013;
      if (byState.has(token) || byCycle.has(token) || frames.some(frame => !frame)
        || frames.some(frame => frame.kind !== definition.kind || frame.key !== definition.key
          || frame.state !== definition.state || !frame.path.startsWith(sourceRoot)
          || frame.heldGrip || frame.sourceFacing !== 1 || !frame.rooms?.length
          || new Set(frame.rooms).size !== frame.rooms.length
          || frame.rooms.some(room => !WALK_ROOMS[definition.key].includes(room)))
        || frames.some(frame => JSON.stringify(frame.rooms) !== JSON.stringify(frames[0].rooms))) {
        throw new Error('Incomplete or incompatible Covenant walk cycle: ' + definition.id);
      }
      const cycle = Object.freeze({ id: definition.id, kind: definition.kind, key: definition.key,
        state: definition.state, angularFrequency: definition.angularFrequency,
        frames: Object.freeze(frames), rooms: frames[0].rooms });
      byCycle.set(token, cycle);
    }
    const allowed = (entry, room) => entry && (!entry.rooms || entry.rooms.includes(room));
    const cycleFor = (kind, key, state = 'idle', room = null) => {
      const cycle = byCycle.get(kind + ':' + key + ':' + state);
      return allowed(cycle, room) ? cycle : null;
    };
    return Object.freeze({ entries: Object.freeze([...byId.values()]),
      cycles: Object.freeze([...byCycle.values()]),
      get: id => byId.get(id) || null, cycle: cycleFor,
      resolve: (kind, key, state = 'idle', room = null, time = 0) => {
        const entry = byState.get(kind + ':' + key + ':' + state);
        if (entry) return allowed(entry, room) ? entry : null;
        const cycle = cycleFor(kind, key, state, room);
        if (!cycle || !finite(time)) return null;
        const turn = time * cycle.angularFrequency / (2 * Math.PI);
        const phase = ((turn % 1) + 1) % 1;
        return cycle.frames[Math.floor(phase * cycle.frames.length)];
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
      entry: (kind, key, state = 'idle', room = null, time = 0) => compiled.resolve(kind, key, state, room, time),
      sprite: (kind, key, state = 'idle', room = null, time = 0) => {
        const cycle = compiled.cycle(kind, key, state, room);
        // A partial load must never produce alternating PNG/procedural phases.
        if (cycle && cycle.frames.map(imageFor).some(image => !image)) return null;
        const entry = compiled.resolve(kind, key, state, room, time), image = imageFor(entry);
        return image ? { entry, image, ...(cycle ? { cycle: cycle.id } : {}) } : null;
      },
      inspect: () => ({ status, error, admitted: compiled.entries.length,
        cycles: compiled.cycles.map(cycle => ({ id: cycle.id, key: cycle.key, rooms: cycle.rooms,
          frames: cycle.frames.map(frame => frame.id),
          ready: cycle.frames.every(frame => images.get(frame.id)?.status === 'ready') })),
        images: [...images].map(([id, value]) => ({ id, status: value.status })) }) });
  }
  const api = Object.freeze({ ASSET_ROOT, ASSET_ROOT_V012, ASSET_ROOT_V013, WALK_ROOMS,
    MANIFEST_URL, compileManifest, createRegistry });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    root.CovenantSpriteRegistryV011 = api;
    root.CovenantSpritesV011 = createRegistry({ manifest: root.CovenantSpriteManifestV011 || null });
    root.CovenantSpritesV011.load();
  }
})(globalThis);
