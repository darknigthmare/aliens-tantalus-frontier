import test from 'node:test';
import assert from 'node:assert/strict';

const listeners = new Map();
globalThis.addEventListener = (type, callback) => listeners.set(type, callback);
globalThis.requestAnimationFrame = () => 1;
globalThis.Image = class TestImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1600;
    this.naturalHeight = 900;
    this.width = 1600;
    this.height = 900;
  }
  set src(value) {
    this.currentSrc = value;
    if (value.includes('/echo9-marine-') && value.endsWith('-sheet.png')) {
      this.naturalWidth = 1024;
      this.naturalHeight = 1024;
      this.width = 1024;
      this.height = 1024;
    }
  }
  get src() { return this.currentSrc; }
};

const {
  BIOFORGE_FOREGROUND_ALPHA_V80,
  BIOFORGE_MAX_CONCURRENT_V80,
  BioforgeRuntimeV80,
  resolveBioforgeBulkheadFrameV80,
  resolveBioforgeConfigurationV80
} = await import('../src/bioforge-runtime-v80.js');
const { BIOFORGE_ASSETS_V80 } = await import('../src/bioforge-assets-v80.js');

function context2d() {
  const noop = () => {};
  const stateStack = [];
  const context = {
    drawCalls: [],
    paintLog: [],
    save() {
      stateStack.push({
        globalAlpha: this.globalAlpha,
        fillStyle: this.fillStyle,
        strokeStyle: this.strokeStyle,
        shadowColor: this.shadowColor,
        shadowBlur: this.shadowBlur
      });
    },
    restore() {
      const state = stateStack.pop();
      if (state) Object.assign(this, state);
    },
    scale: noop,
    clearRect: noop,
    fillRect(...args) {
      this.paintLog.push({
        type: 'fillRect',
        args,
        alpha: this.globalAlpha,
        fillStyle: this.fillStyle,
        shadowColor: this.shadowColor,
        shadowBlur: this.shadowBlur
      });
    },
    strokeRect: noop,
    drawImage(...args) {
      this.drawCalls.push(args);
      this.paintLog.push({
        type: 'drawImage',
        args,
        image: args[0],
        alpha: this.globalAlpha,
        shadowColor: this.shadowColor,
        shadowBlur: this.shadowBlur
      });
    },
    fillText: noop,
    beginPath: noop,
    rect: noop,
    clip: noop,
    translate: noop,
    rotate: noop,
    arc: noop,
    fill: noop,
    stroke: noop,
    moveTo: noop,
    lineTo: noop,
    closePath: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    measureText: (value) => ({ width: String(value).length * 8 }),
    globalAlpha: 1,
    fillStyle: '',
    strokeStyle: '',
    shadowColor: 'rgba(0, 0, 0, 0)',
    shadowBlur: 0,
    font: '',
    textAlign: 'left',
    lineWidth: 1
  };
  return context;
}

function canvas() {
  return {
    width: 1280,
    height: 720,
    getContext: () => context2d(),
    addEventListener: () => {},
    focus: () => {}
  };
}

function runtime(options = {}) {
  const events = [];
  const persisted = [];
  let clock = 1000;
  const engine = new BioforgeRuntimeV80(canvas(), {
    assets: {},
    testMode: true,
    autoLoop: false,
    now: () => { clock += 100; return clock; },
    onEvent: (event) => events.push(event),
    onPersist: (state, meta) => persisted.push({ state, meta }),
    ...options
  });
  return { engine, events, persisted };
}

function startConfigured(engine, quantity = 3, overrides = {}) {
  return engine.start({
    configuration: { profileId: 'enemy-002-facehugger', quantity },
    autoLoop: false,
    testMode: true,
    assets: {},
    ...overrides
  });
}

function physicallyEnterArena(engine) {
  const controlDoor = engine.doors.find(({ id }) => id === 'control-seal');
  const innerDoor = engine.doors.find(({ id }) => id === 'inner-interlock');
  const printer = engine.bioforgeLevelV80.stations.find(({ type }) => type === 'printer');
  Object.assign(engine.player, { x: controlDoor.x - engine.player.w - 10, y: 528 });
  assert.equal(engine.interact(), true);
  assert.equal(controlDoor.open, true);
  Object.assign(engine.player, { x: innerDoor.x - engine.player.w - 45, y: 528 });
  assert.equal(engine.interact(), true);
  assert.equal(controlDoor.open, false);
  assert.equal(innerDoor.open, true);
  Object.assign(engine.player, { x: printer.x - 20, y: 528 });
  assert.equal(engine.interact(), true);
  assert.equal(innerDoor.open, false);
  assert.equal(engine.doors.find(({ id }) => id === 'arena-containment').open, true);
  Object.assign(engine.player, { x: engine.bioforgeLevelV80.arenaBounds.x + 8, y: 528, vx: 0, vy: 0, grounded: true });
  engine.update(0.016);
  assert.equal(engine.getBioforgeSnapshotV80().phase, 'sealing');
}

function printBatch(engine, quantity) {
  assert.equal(engine.getBioforgeQaHooksV80().advance().event.type, 'bioforge-printer-ready');
  for (let index = 0; index < quantity; index += 1) {
    const before = engine.enemies.length;
    const operation = engine.getBioforgeQaHooksV80().advance();
    assert.equal(operation.event.type, 'bioforge-specimen-printed');
    assert.equal(operation.event.index, index);
    assert.equal(engine.enemies.length, before + 1);
  }
  assert.equal(engine.getBioforgeSnapshotV80().phase, 'combat');
}

test('la configuration vient explicitement du terminal ou du projet éditeur et refuse tout défaut implicite', () => {
  assert.equal(resolveBioforgeConfigurationV80({}).reason, 'configuration-required');
  assert.equal(resolveBioforgeConfigurationV80({ configuration: { profileId: 'enemy-002-facehugger', quantity: 2 } }).ok, true);
  const fromEditor = resolveBioforgeConfigurationV80({ editorProject: { kind: 'bioforge', bioforge: { selectedProfileId: 'enemy-003-chestburster', quantity: 4 } } });
  assert.equal(fromEditor.ok, true);
  assert.equal(fromEditor.source, 'editor-project');
  assert.equal(fromEditor.selection.quantity, 4);

  const { engine } = runtime();
  assert.throws(() => engine.start({ autoLoop: false }), /configuration-required/);
  assert.throws(() => engine.start({ configuration: { profileId: 'enemy-002-facehugger', quantity: BIOFORGE_MAX_CONCURRENT_V80 + 1 } }), /quantity-exceeds/);
});

test('prepare dessine immédiatement le vrai niveau sans créer de session et permet ensuite une reprise préparée', () => {
  const { engine } = runtime();
  const prepared = engine.prepare(null, { assets: {}, testMode: true });
  assert.equal(prepared.prepared, true);
  assert.equal(prepared.running, false);
  assert.equal(prepared.sessionId, null);
  assert.equal(engine.bioforgeRootV80.serial, 0);
  assert.equal(engine.bioforgeLevelV80.rooms.length, 6);

  const source = runtime().engine;
  startConfigured(source, 2);
  physicallyEnterArena(source);
  source.getBioforgeQaHooksV80().advance();
  source.getBioforgeQaHooksV80().advance();
  const resume = source.captureBioforgeResumeStateV80();
  const preview = engine.prepare(resume, { assets: {}, testMode: true });
  assert.equal(preview.resumeAvailable, true);
  const resumed = engine.start({ autoLoop: false, assets: {}, testMode: true });
  assert.equal(resumed.sessionId, resume.state.activeSession.id);
  assert.equal(resumed.printed, 1);
  assert.equal(resumed.alive, 1);
});

test('le joueur traverse contrôle, double sas et printer avant le scellement physique', () => {
  const { engine, events } = runtime();
  const started = startConfigured(engine, 2);

  assert.equal(started.phase, 'configuration');
  assert.equal(started.started, true);
  assert.equal(engine.player.x, 160);
  assert.equal(engine.campaign, null);
  assert.equal(engine.vehicle, null);
  assert.equal(engine.weaponPickup, null);
  assert.equal(engine.toolPickup, null);
  physicallyEnterArena(engine);
  assert.equal(engine.doors.find(({ id }) => id === 'arena-containment').locked, true);
  assert.ok(events.filter(({ type }) => type === 'bioforge-airlock-step').length === 3);
  assert.ok(events.some(({ type }) => type === 'bioforge-physical-transfer-completed'));
});

test('l impression est séquentielle et produit exactement les douze spécimens choisis, sans boss ni autre contenu', () => {
  const { engine } = runtime();
  startConfigured(engine, 12);
  physicallyEnterArena(engine);
  printBatch(engine, 12);

  assert.equal(engine.enemies.length, 12);
  assert.equal(new Set(engine.enemies.map(({ id }) => id)).size, 12);
  assert.ok(engine.enemies.every(({ profileId }) => profileId === 'enemy-002-facehugger'));
  assert.ok(engine.enemies.every(({ isBoss, keyCarrier, facing }) => isBoss === false && keyCarrier === false && facing === -1));
  assert.equal(engine.getBioforgeSnapshotV80().printed, 12);
  assert.equal(engine.getBioforgeSnapshotV80().isolation.exitLocked, true);
  assert.deepEqual(engine.drops, []);
  assert.deepEqual(engine.hazards, []);
});

test('la collision de sortie et le confinement corrigent joueur, ennemis et projectiles durant le combat', () => {
  const { engine, events } = runtime();
  startConfigured(engine, 1);
  physicallyEnterArena(engine);
  printBatch(engine, 1);
  const enemy = engine.enemies[0];
  const escaped = engine.getBioforgeQaHooksV80().attemptEscape(enemy.id, -900);
  assert.ok(escaped.x >= engine.bioforgeLevelV80.arenaBounds.x);
  assert.equal(engine.getBioforgeSnapshotV80().isolation.secure, true);

  const exit = engine.doors.find(({ id }) => id === 'arena-return');
  const previousX = exit.x - engine.player.w - 5;
  Object.assign(engine.player, { x: exit.x - engine.player.w + 8, y: 528, vx: 180 });
  engine.resolveBioforgeHorizontalV80(engine.player, previousX);
  assert.equal(engine.player.x, exit.x - engine.player.w);
  assert.equal(engine.player.vx, 0);
  assert.equal(engine.interact(), false);
  assert.ok(events.some(({ type, reason }) => type === 'bioforge-exit-locked' && reason === 'combat-active'));
});

test('une victoire enchaîne result, purge atomique, arrêt moteur et retour sans résidu', () => {
  const { engine, persisted } = runtime();
  startConfigured(engine, 3);
  physicallyEnterArena(engine);
  printBatch(engine, 3);
  for (const enemy of [...engine.enemies]) assert.equal(engine.getBioforgeQaHooksV80().kill(enemy.id), true);
  engine.update(0.016);
  assert.equal(engine.getBioforgeSnapshotV80().phase, 'result');
  for (let index = 0; index < 6; index += 1) engine.update(0.1);

  const snapshot = engine.getBioforgeSnapshotV80();
  assert.equal(snapshot.phase, 'return');
  assert.equal(snapshot.running, false);
  assert.deepEqual(snapshot.entities, {
    enemies: 0,
    bullets: 0,
    hostileProjectiles: 0,
    particles: 0,
    drops: 0,
    hazards: 0,
    timers: 0
  });
  assert.equal(snapshot.lastPurge.completed, true);
  assert.equal(snapshot.isolation.secure, true);
  assert.ok(persisted.some(({ state }) => state.activeSession?.phase === 'return'));
});

test('la purge manuelle vide aussi les références injectées et un nouveau cycle redémarre avec un serial distinct', () => {
  const { engine } = runtime();
  startConfigured(engine, 2);
  physicallyEnterArena(engine);
  printBatch(engine, 2);
  const firstSessionId = engine.getBioforgeSnapshotV80().sessionId;
  engine.bullets.push({ id: 'bullet-residual', x: 1400, y: 500, w: 2, h: 2 });
  engine.hostileProjectiles.push({ id: 'hostile-residual', x: 1400, y: 500, w: 2, h: 2 });
  engine.particles.push({ id: 'particle-residual' });
  engine.drops.push({ id: 'drop-residual' });
  engine.hazards.push({ id: 'hazard-residual' });
  engine.bioforgeTimersV80.set('timer-residual', 1);
  engine.bioforgeReferencesV80.external = { unsafe: true };
  const purge = engine.getBioforgeQaHooksV80().purge('test-abort');
  assert.equal(purge.completed, true);
  assert.deepEqual(engine.bioforgeReferencesV80, {});

  const restarted = startConfigured(engine, 1);
  assert.equal(restarted.phase, 'configuration');
  assert.notEqual(restarted.sessionId, firstSessionId);
  assert.equal(engine.bioforgeRootV80.history.at(-1).outcome, 'aborted');
});

test('la reprise restaure exactement les imprimés vivants et une reprise corrompue purge puis reste arrêtée', () => {
  const first = runtime().engine;
  startConfigured(first, 3);
  physicallyEnterArena(first);
  assert.equal(first.getBioforgeQaHooksV80().advance().event.type, 'bioforge-printer-ready');
  first.getBioforgeQaHooksV80().advance();
  first.getBioforgeQaHooksV80().advance();
  const resumeState = first.captureBioforgeResumeStateV80();

  const resumed = runtime().engine;
  const snapshot = resumed.start({ resumeState, autoLoop: false, testMode: true, assets: {} });
  assert.equal(snapshot.phase, 'printing');
  assert.equal(snapshot.printed, 2);
  assert.equal(snapshot.alive, 2);
  assert.deepEqual(resumed.enemies.map(({ id }) => id), resumeState.state.activeSession.aliveIds);
  assert.ok(resumed.enemies.every(({ facing }) => facing === -1));

  const corrupt = clone(resumeState);
  corrupt.state.activeSession.schema = -1;
  const rejected = runtime().engine;
  const rejectedSnapshot = rejected.start({ resumeState: corrupt, configuration: { profileId: 'enemy-002-facehugger', quantity: 3 }, autoLoop: false });
  assert.equal(rejectedSnapshot.started, false);
  assert.equal(rejectedSnapshot.running, false);
  assert.equal(rejectedSnapshot.entities.enemies, 0);
  assert.equal(rejectedSnapshot.recovery.purgeRequired, false);
  assert.equal(rejected.bioforgeLastErrorV80, 'invalid-resume-state');
});

test('runtimeV81 persiste position et facing du joueur pendant configuration, scellement, impression et combat', () => {
  const source = runtime().engine;
  startConfigured(source, 2);
  const verifyPhase = (phase, x) => {
    Object.assign(source.player, { x, y: 510, facing: -1, vx: 0, vy: 0 });
    const saved = source.persistBioforgeV80();
    assert.equal(saved.runtimeV81.player.facing, -1);
    assert.equal(saved.runtimeV81.player.x, x);
    const resumed = runtime().engine;
    const snapshot = resumed.start({ resumeState: saved, autoLoop: false, testMode: true, assets: {} });
    assert.equal(snapshot.phase, phase);
    assert.equal(resumed.player.x, x);
    assert.equal(resumed.player.y, 510);
    assert.equal(resumed.player.facing, -1);
  };

  verifyPhase('configuration', 220);
  physicallyEnterArena(source);
  verifyPhase('sealing', 1400);
  assert.equal(source.getBioforgeQaHooksV80().advance().event.type, 'bioforge-printer-ready');
  verifyPhase('printing', 1420);
  source.getBioforgeQaHooksV80().advance();
  source.getBioforgeQaHooksV80().advance();
  verifyPhase('combat', 1440);
});

test('le fallback procédural est explicitement réservé aux tests et la persistance ne reçoit que la racine BIOFORGE', () => {
  const strategic = { credits: 41, campaignId: 'must-not-change' };
  const production = runtime({ testMode: false, assets: {} });
  production.engine.start({ configuration: { profileId: 'enemy-003-chestburster', quantity: 1 }, strategic, autoLoop: false, testMode: false, assets: {} });
  assert.equal(production.engine.getBioforgeSnapshotV80().assets.proceduralFallback, false);
  assert.equal(production.engine.getBioforgeSnapshotV80().assets.productionFallback, false);
  assert.deepEqual(strategic, { credits: 41, campaignId: 'must-not-change' });
  assert.ok(production.persisted.every(({ state }) => state.schema === 80 && !('strategy' in state) && !('campaign' in state)));

  const qa = runtime({ testMode: true, assets: {} });
  qa.engine.start({ editorProject: { kind: 'bioforge', bioforge: { profileId: 'enemy-003-chestburster', quantity: 1 } }, autoLoop: false, assets: {}, testMode: true });
  assert.equal(qa.engine.getBioforgeSnapshotV80().assets.proceduralFallback, true);
});

test('le bulkhead choisit des frames stables par état et des frames ordonnées pendant la transition', () => {
  assert.equal(resolveBioforgeBulkheadFrameV80({ open: false, locked: true, progress: 0 }), 0);
  assert.equal(resolveBioforgeBulkheadFrameV80({ open: false, locked: false, progress: 0 }), 1);
  assert.equal(resolveBioforgeBulkheadFrameV80({ open: true, locked: false, progress: 1 }), 4);
  assert.equal(resolveBioforgeBulkheadFrameV80({ open: true, progress: 0.08, visualDirection: 'opening' }), 1);
  assert.equal(resolveBioforgeBulkheadFrameV80({ open: true, progress: 0.28, visualDirection: 'opening' }), 2);
  assert.equal(resolveBioforgeBulkheadFrameV80({ open: true, progress: 0.56, visualDirection: 'opening' }), 3);
  assert.equal(resolveBioforgeBulkheadFrameV80({ open: false, progress: 0.72, visualDirection: 'closing' }), 5);
  assert.equal(resolveBioforgeBulkheadFrameV80({ open: false, progress: 0.3, visualDirection: 'closing' }), 6);

  const { engine } = runtime({ assets: BIOFORGE_ASSETS_V80 });
  startConfigured(engine, 1, { assets: BIOFORGE_ASSETS_V80 });
  const bulkhead = engine.images.get('bioforge:v80:bulkhead');
  engine.ctx.drawCalls.length = 0;
  engine.animationTime = 0;
  engine.drawBioforgeStationsV80(engine.ctx);
  const firstFrames = engine.ctx.drawCalls.filter(([image]) => image === bulkhead).map((call) => call.slice(1, 5));
  engine.ctx.drawCalls.length = 0;
  engine.animationTime = 999;
  engine.drawBioforgeStationsV80(engine.ctx);
  const laterFrames = engine.ctx.drawCalls.filter(([image]) => image === bulkhead).map((call) => call.slice(1, 5));
  assert.deepEqual(laterFrames, firstFrames, 'une porte stable ne doit plus boucler tout l atlas');
  assert.ok(firstFrames.every(([sx, sy]) => sx === 0 && sy === 0));
});

test('la purge atomique dessine le vrai frame de dissipation sans recréer d effet runtime', () => {
  const { engine } = runtime({ assets: BIOFORGE_ASSETS_V80 });
  startConfigured(engine, 1, { assets: BIOFORGE_ASSETS_V80 });
  physicallyEnterArena(engine);
  printBatch(engine, 1);
  engine.ctx.drawCalls.length = 0;
  const result = engine.purgeBioforgeV80('render-purge');
  const purge = engine.images.get('bioforge:v80:purge');
  const purgeCalls = engine.ctx.drawCalls.filter(([image]) => image === purge);

  assert.equal(result.completed, true);
  assert.equal(purgeCalls.length, 1);
  assert.deepEqual(purgeCalls[0].slice(1, 5), [1024, 512, 512, 512]);
  assert.equal(engine.running, false);
  assert.deepEqual(engine.getBioforgeSnapshotV80().entities, {
    enemies: 0,
    bullets: 0,
    hostileProjectiles: 0,
    particles: 0,
    drops: 0,
    hazards: 0,
    timers: 0
  });
  assert.deepEqual(engine.bioforgeReferencesV80, {});
  assert.equal(engine.bioforgeTimersV80.size, 0);
});

test('le foreground reste indépendant mais ne masque plus les acteurs ni les projectiles', () => {
  assert.ok(BIOFORGE_FOREGROUND_ALPHA_V80 > 0 && BIOFORGE_FOREGROUND_ALPHA_V80 <= 0.4);
  const { engine } = runtime({ assets: BIOFORGE_ASSETS_V80 });
  startConfigured(engine, 2, { assets: BIOFORGE_ASSETS_V80 });
  physicallyEnterArena(engine);
  printBatch(engine, 2);
  engine.player.fireClock = 0;
  assert.equal(engine.fire(), true);
  engine.ctx.drawCalls.length = 0;
  engine.ctx.paintLog.length = 0;

  engine.draw();

  const foreground = engine.images.get('bioforge:v80:foreground');
  const player = engine.images.get('playerCombat');
  const foregroundIndexes = [];
  const enemyIndexes = [];
  const bulletIndexes = [];
  let playerIndex = -1;
  for (const [index, entry] of engine.ctx.paintLog.entries()) {
    if (entry.type === 'drawImage' && entry.image === foreground) foregroundIndexes.push(index);
    if (entry.type === 'drawImage' && entry.image === player) playerIndex = index;
    if (entry.type === 'drawImage'
      && ((entry.shadowColor === 'rgba(166, 210, 116, .42)' && entry.shadowBlur === 7)
        || (entry.shadowColor === '#8fe7a8' && entry.shadowBlur === 16))) enemyIndexes.push(index);
    if (entry.type === 'fillRect'
      && entry.fillStyle === '#f5d87a'
      && entry.shadowColor === 'rgba(255, 224, 133, .82)'
      && entry.shadowBlur === 7) bulletIndexes.push(index);
  }

  assert.ok(foregroundIndexes.length > 0, 'la couche foreground dédiée doit rester rendue');
  assert.ok(foregroundIndexes.every((index) => engine.ctx.paintLog[index].alpha === BIOFORGE_FOREGROUND_ALPHA_V80));
  const foregroundEnd = Math.max(...foregroundIndexes);
  assert.ok(playerIndex > foregroundEnd, 'le joueur doit être peint après tout le foreground');
  assert.equal(engine.ctx.paintLog[playerIndex].shadowColor, 'rgba(145, 225, 184, .5)');
  assert.equal(engine.ctx.paintLog[playerIndex].shadowBlur, 9);
  assert.ok(enemyIndexes.length >= 1, 'au moins un sprite ennemi chargé doit matérialiser le rim de lisibilité');
  assert.ok(enemyIndexes.every((index) => index > foregroundEnd), 'tous les ennemis doivent être peints au-dessus du foreground');
  assert.ok(enemyIndexes.every((index) => engine.ctx.paintLog[index].shadowBlur >= 7));
  assert.equal(bulletIndexes.length, 1);
  assert.ok(bulletIndexes[0] > foregroundEnd, 'les projectiles doivent rester lisibles au-dessus du foreground');
  assert.equal(engine.ctx.globalAlpha, 1, 'le foreground ne doit pas laisser fuir son alpha');
  assert.equal(engine.ctx.shadowBlur, 0, 'les halos acteurs ne doivent pas fuir vers le HUD');
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
