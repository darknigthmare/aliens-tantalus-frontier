/* Covenant visual releases 0.11/0.12/0.13/0.14. Runtime images do not change simulation data.
 * Only manifest-admitted, successfully decoded states replace Canvas artwork.
 */
(function (root) {
  'use strict';
  const ASSET_ROOT = '/assets/openai/sprites/alien-covenant-v011/';
  const ASSET_ROOT_V012 = '/assets/openai/sprites/alien-covenant-v012/';
  const ASSET_ROOT_V013 = '/assets/openai/sprites/alien-covenant-v013/';
  const ASSET_ROOT_V014 = '/assets/openai/sprites/alien-covenant-v014/';
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
  const NPC_WALK_SCOPES = Object.freeze({
    walter: Object.freeze({ rooms: Object.freeze(['cryo']), actors: Object.freeze(['walter-cryo']) })
  });
  const MANIFEST_URL = '/dlc/covenant/sprites-v011.json';
  const KINDS = new Set(['human', 'creature', 'weapon', 'prop', 'background']);
  const STATES = new Set(['idle', 'attack', 'walk', 'run', 'crawl', 'dead', 'armed']);
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  const pair = (v, label) => {
    if (!Array.isArray(v) || v.length !== 2 || !v.every(finite)) throw new Error('Invalid ' + label);
    return Object.freeze(v.slice());
  };
  function compileManifest(raw) {
    if (!raw || raw.schemaVersion !== 1 || !['0.11.0', '0.12.0', '0.13.0', '0.14.0'].includes(raw.release) || !Array.isArray(raw.assets)) {
      throw new Error('Invalid Covenant sprite manifest');
    }
    const definitions = raw.cycles === undefined ? [] : raw.cycles;
    if (!Array.isArray(definitions) || definitions.length && !['0.12.0', '0.13.0', '0.14.0'].includes(raw.release)) {
      throw new Error('Invalid Covenant sprite cycles');
    }
    const frameOwners = new Map(), cycleIds = new Set();
    for (const cycle of definitions) {
      const npc = Object.hasOwn(NPC_WALK_SCOPES, cycle?.key || '');
      if (!/^[a-z][a-zA-Z0-9-]{0,79}$/.test(cycle?.id || '') || cycleIds.has(cycle.id)
        || cycle.kind !== 'human' || !npc && !Object.hasOwn(WALK_ROOMS, cycle.key) || cycle.state !== 'walk'
        || raw.release === '0.12.0' && cycle.key !== 'daniels-work'
        || cycle.id !== cycle.key + '-walk'
        || (npc ? raw.release !== '0.14.0' || cycle.consumer !== 'npc'
          || JSON.stringify(cycle.actors) !== JSON.stringify(NPC_WALK_SCOPES[cycle.key].actors)
          || !finite(cycle.angularFrequency) || cycle.angularFrequency <= 0 || cycle.angularFrequency > 11
          : cycle.angularFrequency !== 11 || cycle.consumer !== undefined || cycle.actors !== undefined)
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
    const roots = raw.release === '0.14.0' ? [ASSET_ROOT, ASSET_ROOT_V012, ASSET_ROOT_V013, ASSET_ROOT_V014]
      : raw.release === '0.13.0' ? [ASSET_ROOT, ASSET_ROOT_V012, ASSET_ROOT_V013]
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
        && [ASSET_ROOT_V012, ASSET_ROOT_V013, ASSET_ROOT_V014].some(base => path.startsWith(base)) && !frameOwners.has(id)) {
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
      const actors = input.actors;
      if (actors !== undefined && (kind !== 'human' || key !== 'walter' || state !== 'walk'
        || !path.startsWith(ASSET_ROOT_V014)
        || JSON.stringify(actors) !== JSON.stringify(NPC_WALK_SCOPES.walter.actors))) {
        throw new Error('Invalid NPC actor restriction: ' + id);
      }
      const background = kind === 'background';
      if (background ? id !== 'background-planet4-lake' || key !== 'landing' || state !== 'idle'
        || path !== ASSET_ROOT_V014 + 'background-planet4-lake.png'
        || input.imagePolicy !== 'opaque-background' || input.renderLayer !== 'sky'
        || input.backgroundFit !== 'cover-bottom' || input.logicalHeight !== 555 || input.sourceFacing !== 1
        || input.alphaThreshold !== 0 || JSON.stringify(b) !== JSON.stringify([0, 0, width, height])
        || JSON.stringify(anchor) !== JSON.stringify([width / 2, height])
        || JSON.stringify(rooms) !== JSON.stringify(['landing']) || actors !== undefined
        : input.imagePolicy !== undefined && input.imagePolicy !== 'transparent-sprite'
          || input.renderLayer !== undefined || input.backgroundFit !== undefined) {
        throw new Error('Invalid opaque background admission: ' + id);
      }
      const entry = Object.freeze({ id, kind, key, state, path, width, height, bytes, sha256,
        alphaBounds: Object.freeze(b.slice()), anchor, logicalHeight: input.logicalHeight,
        sourceFacing: input.sourceFacing, verified1to1: false,
        rooms: rooms && Object.freeze(rooms.slice()),
        ...(actors ? { actors: Object.freeze(actors.slice()) } : {}),
        ...(input.imagePolicy ? { imagePolicy: input.imagePolicy } : {}),
        ...(background ? { renderLayer: input.renderLayer, backgroundFit: input.backgroundFit } : {}),
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
      const npcScope = NPC_WALK_SCOPES[definition.key];
      const rooms = npcScope?.rooms || WALK_ROOMS[definition.key];
      const sourceRoot = npcScope ? ASSET_ROOT_V014 : definition.key === 'daniels-work' ? ASSET_ROOT_V012 : ASSET_ROOT_V013;
      if (byState.has(token) || byCycle.has(token) || frames.some(frame => !frame)
        || frames.some(frame => frame.kind !== definition.kind || frame.key !== definition.key
          || frame.state !== definition.state || !frame.path.startsWith(sourceRoot)
          || frame.heldGrip || frame.sourceFacing !== 1 || !frame.rooms?.length
          || new Set(frame.rooms).size !== frame.rooms.length
          || frame.rooms.some(room => !rooms.includes(room))
          || (npcScope ? JSON.stringify(frame.actors) !== JSON.stringify(npcScope.actors)
            || JSON.stringify(frame.rooms) !== JSON.stringify(npcScope.rooms) : frame.actors !== undefined))
        || frames.some(frame => JSON.stringify(frame.rooms) !== JSON.stringify(frames[0].rooms))) {
        throw new Error('Incomplete or incompatible Covenant walk cycle: ' + definition.id);
      }
      const cycle = Object.freeze({ id: definition.id, kind: definition.kind, key: definition.key,
        state: definition.state, angularFrequency: definition.angularFrequency,
        ...(npcScope ? { consumer: 'npc', actors: npcScope.actors } : {}),
        frames: Object.freeze(frames), rooms: frames[0].rooms });
      byCycle.set(token, cycle);
    }
    const allowed = (entry, room, actorId) => entry && (!entry.rooms || entry.rooms.includes(room))
      && (!entry.actors || entry.actors.includes(actorId));
    const cycleFor = (kind, key, state = 'idle', room = null, actorId = null) => {
      const cycle = byCycle.get(kind + ':' + key + ':' + state);
      return allowed(cycle, room, actorId) ? cycle : null;
    };
    return Object.freeze({ entries: Object.freeze([...byId.values()]),
      cycles: Object.freeze([...byCycle.values()]),
      get: id => byId.get(id) || null, cycle: cycleFor,
      resolve: (kind, key, state = 'idle', room = null, time = 0, actorId = null) => {
        const entry = byState.get(kind + ':' + key + ':' + state);
        if (entry) return allowed(entry, room, actorId) ? entry : null;
        const cycle = cycleFor(kind, key, state, room, actorId);
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
      entry: (kind, key, state = 'idle', room = null, time = 0, actorId = null) => compiled.resolve(kind, key, state, room, time, actorId),
      sprite: (kind, key, state = 'idle', room = null, time = 0, actorId = null) => {
        const cycle = compiled.cycle(kind, key, state, room, actorId);
        // A partial load must never produce alternating PNG/procedural phases.
        if (cycle && cycle.frames.map(imageFor).some(image => !image)) return null;
        const entry = compiled.resolve(kind, key, state, room, time, actorId), image = imageFor(entry);
        return image ? { entry, image, ...(cycle ? { cycle: cycle.id, consumer: cycle.consumer || 'player' } : {}) } : null;
      },
      inspect: () => ({ status, error, admitted: compiled.entries.length,
        cycles: compiled.cycles.map(cycle => ({ id: cycle.id, key: cycle.key, rooms: cycle.rooms,
          consumer: cycle.consumer || 'player', actors: cycle.actors || [], angularFrequency: cycle.angularFrequency,
          frames: cycle.frames.map(frame => frame.id),
          ready: cycle.frames.every(frame => images.get(frame.id)?.status === 'ready') })),
        images: [...images].map(([id, value]) => ({ id, status: value.status })) }) });
  }
  const api = Object.freeze({ ASSET_ROOT, ASSET_ROOT_V012, ASSET_ROOT_V013, ASSET_ROOT_V014, WALK_ROOMS, NPC_WALK_SCOPES,
    MANIFEST_URL, compileManifest, createRegistry });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    root.CovenantSpriteRegistryV011 = api;
    root.CovenantSpritesV011 = createRegistry({ manifest: root.CovenantSpriteManifestV011 || null });
    root.CovenantSpritesV011.load();
  }
})(globalThis);
