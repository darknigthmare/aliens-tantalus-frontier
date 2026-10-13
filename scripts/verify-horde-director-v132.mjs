import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content-core-v50.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { buildLegacyMissionV131, LEGACY_CAMPAIGNS_V131 } from '../src/legacy-operations-v131.js';
import { enemySightClearV130 } from '../src/enemy-tactics-v130.js';
import { HORDE_DIRECTOR_V132, withHordeDirectorV132, validateHordeDirectorV132, hordeDirectorMetricsV132,
  hordeDirectorEligibleV132 } from '../src/horde-director-v132.js';

// Production composition, admitted sprites, actual combat and physical maps.
// Only browser APIs are replaced; real PNG/WebP byte dimensions are preserved.
const sizes = new Map();
function size(path) {
  if (sizes.has(path)) return sizes.get(path);
  let result;
  try {
    const bytes = readFileSync(new URL(`..${new URL(path, 'http://qa.invalid').pathname}`, import.meta.url));
    if (bytes.subarray(1, 4).toString() === 'PNG') result = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
    else if (bytes.subarray(0, 4).toString() === 'RIFF') for (let offset = 12; offset + 8 < bytes.length;) {
      const kind = bytes.subarray(offset, offset + 4).toString(), length = bytes.readUInt32LE(offset + 4), data = offset + 8;
      if (kind === 'VP8X') result = [bytes.readUIntLE(data + 4, 3) + 1, bytes.readUIntLE(data + 7, 3) + 1];
      if (kind === 'VP8L' && bytes[data] === 0x2f) { const packed = bytes.readUInt32LE(data + 1); result = [(packed & 0x3fff) + 1, (packed >>> 14 & 0x3fff) + 1]; }
      if (kind === 'VP8 ' && bytes.subarray(data + 3, data + 6).equals(Buffer.from([0x9d, 1, 0x2a]))) result = [bytes.readUInt16LE(data + 6) & 0x3fff, bytes.readUInt16LE(data + 8) & 0x3fff];
      if (result) break; offset = data + length + (length & 1);
    }
  } catch {}
  if (result) sizes.set(path, result); return result;
}
function host() {
  const window = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = window[name].bind(window);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(path) { this._src = path; const dimensions = size(path); this.naturalWidth = dimensions?.[0] || 0; this.naturalHeight = dimensions?.[1] || 0;
      queueMicrotask(() => { const event = new Event(dimensions ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); }); }
    get src() { return this._src; } async decode() { if (!this.naturalWidth) throw Error('Missing shipped bitmap'); }
  };
  const text = [], draws = [], stack = [], gradient = { addColorStop() {} };
  const ctx = new Proxy({ globalAlpha: 1, save() { stack.push(this.globalAlpha); }, restore() { assert.ok(stack.length); this.globalAlpha = stack.pop(); },
    fillText(value) { text.push(String(value)); }, drawImage(image, ...args) { assert.ok(image.naturalWidth > 0); draws.push({ path: image.src, args }); },
    measureText: value => ({ width: String(value).length * 7 }), createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }) }, { get: (object, key) => key in object ? object[key] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  return { canvas, ctx, text, draws, stack };
}
async function prepare(engine) {
  for (let n = 0; n < 8; n++) await Promise.resolve();
  await Promise.all((engine.getVisibleEnemyAtlasSheetsV65?.() || []).map(sheet => engine.ensureEnemyAtlas(sheet)));
  for (let n = 0; n < 8; n++) await Promise.resolve(); engine.refreshEnemyAtlasAvailabilityV65();
  assert.equal(engine.enemyAtlasLoadingPausedV65, false);
}
async function fixture({ template = 'ship-interior-vertical', seed = 1321, noPlan = false, patch = {}, isolate = true, resume = null } = {}) {
  const browser = host(), events = [], options = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES,
    equipment: [], crew: [], seed, ...patch };
  if (!noPlan) options.missionLevel = patch.campaign?.kind
    ? buildLegacyMissionV131({ ...options, levelSeeds: LEVEL_SEEDS }) : buildMissionLevelV52({ ...options, templateId: template, levelSeeds: LEVEL_SEEDS });
  if (resume) options.resumeState = resume;
  const engine = new GameEngine(browser.canvas, { onEvent: event => events.push(event) }); engine.start(options); await prepare(engine);
  if (isolate && engine.hordeDirectorV132) {
    engine.enemies = []; engine.squadActors = []; engine.hazards = []; engine.coopEnabled = false;
    engine.missionLevelSpawns.clear(); engine.missionLevelEvents.clear(); engine.missionLevelTimers.clear();
  }
  return { ...browser, engine, events, options };
}
function tick(engine, seconds, rate = 60, perFrame = null) {
  for (let remaining = seconds; remaining > 1e-9;) { const dt = Math.min(remaining, 1 / rate); engine.update(dt); perFrame?.(); remaining -= dt; }
}
function park(engine, floor = 868) {
  const candidates = engine.rearEntrancesForTacticsV130().filter(entry => Math.abs(entry.floorY - floor) < 25);
  for (const entrance of candidates) {
    const surface = engine.platforms.filter(entry => !entry.lift && Math.abs(entry.y - entrance.floorY) < 2 && entry.w >= 80)
      .sort((a, b) => Math.abs(a.x + a.w / 2 - entrance.x + 320) - Math.abs(b.x + b.w / 2 - entrance.x + 320))[0];
    if (!surface) continue;
    const x = Math.max(surface.x + 8, Math.min(surface.x + surface.w - 50, entrance.x - 320));
    Object.assign(engine.player, { x, y: entrance.floorY - engine.player.h, vx: 0, vy: 0, alive: true, grounded: true });
    engine.camera.x = Math.max(0, x - 430); engine.camera.y = Math.max(0, entrance.floorY - 600);
    if (engine.selectHordeEntrancesV132().length) return entrance;
  }
  throw Error(`No real entry has a reachable floor ${floor}: ${JSON.stringify({ entrances: engine.rearEntrancesV130,
    surfaces: engine.platforms.map(p => ({ x: p.x, y: p.y, w: p.w })), profiles: engine.hordeBodiesV132 })}`);
}
async function selectedFixture(options = {}) {
  for (let seed = options.seed || 1321; seed < (options.seed || 1321) + 10; seed++) {
    const subject = await fixture({ ...options, seed }); if (subject.engine.hordeDirectorV132?.eventSelected) return subject;
    subject.engine.stop();
  }
  throw Error('No selected deterministic event in ten seeds');
}
function awaitWarning(subject) {
  const e = subject.engine; park(e); tick(e, e.hordeDirectorV132.firstWarningAt + .1);
  assert.equal(e.hordeDirectorV132.phase, 'warning'); assert.equal(e.hordeDirectorV132.emitted, 0); return e;
}

test('production mixin is idempotent and seeds select occasional warnings between 45 and 80 seconds', async () => {
  assert.equal(withHordeDirectorV132(GameEngine), GameEngine); const times = new Set(), decisions = new Set();
  for (let seed = 1; seed <= 10; seed++) {
    const { engine: e } = await fixture({ seed }); assert.ok(e.hordeDirectorV132);
    times.add(e.hordeDirectorV132.firstWarningAt); decisions.add(e.hordeDirectorV132.eventSelected);
    assert.ok(e.hordeDirectorV132.firstWarningAt >= 45 && e.hordeDirectorV132.firstWarningAt <= 80);
    assert.equal(validateHordeDirectorV132(e.captureResumeState().hordeDirectorV132, e.hordeContextV132()).valid, true);
  }
  assert.ok(times.size > 3); assert.equal(decisions.size, 2);
});
test('no plan remains dormant; controller, hub, dojo, BIOFORGE and special chapters are excluded', async () => {
  const empty = await fixture({ noPlan: true }); assert.equal(empty.engine.hordeDirectorV132, null);
  for (const patch of [{ scene: 'hub' }, { scene: 'dojo' }, { scene: 'BIOFORGE' }, { editorMode: true }, { neuroProfile: { id: 'neuro' } },
    { campaign: { ...CAMPAIGNS[0], id: 'special-c12', specialOperationId: 'c12-horde' } }]) assert.equal(hordeDirectorEligibleV132(patch.campaign ? patch : { ...patch, campaign: CAMPAIGNS[0] }), false);
  for (const campaign of LEGACY_CAMPAIGNS_V131) {
    const { engine: e } = await fixture({ patch: { campaign, world: WORLDS.find(world => world.id === campaign.worldId) } });
    assert.equal(e.hordeDirectorV132, null); assert.equal(e.legacyMissionV131.stage, 0);
  }
});
test('ordinary app deployment may opt into the caste framework without being an active caste campaign', async () => {
  const subject = await fixture({ patch: { userCasteCampaignV88: true, strategicBriefing: { id: 'ordinary-ship-deployment' } } });
  assert.equal(subject.engine.userCasteCampaignActiveV88, true); assert.equal(subject.engine.neuro?.active, false); assert.ok(subject.engine.hordeDirectorV132);
  const e = awaitWarning(subject); assert.equal(e.hordeDirectorV132.phase, 'warning');
  assert.equal(hordeDirectorEligibleV132(subject.options, { neuro: { active: true } }), false);
});
test('warning is perceptible before a real rear entry; background contacts cannot be hit and floor support is real', async () => {
  const subject = await selectedFixture(), e = awaitWarning(subject); e.drawHud(subject.ctx);
  assert.ok(subject.events.some(event => event.type === 'horde-warning-v132')); assert.ok(subject.text.some(text => /HORDE.*ARRIVÉE/.test(text)));
  tick(e, 3.7); assert.equal(e.hordeDirectorV132.emitted, 0); tick(e, .5);
  const actor = e.enemies.find(enemy => enemy.hordeV132); assert.ok(actor); assert.equal(actor.dormant, true);
  assert.equal(e.applyEnemyDamage(actor, 100, { owner: e.player }), false); assert.equal(actor.alive, true);
  await prepare(e); e.drawWorld(subject.ctx); assert.ok(subject.draws.some(draw => /enemy-profiles|enemies/.test(draw.path)));
  tick(e, 2.5); assert.equal(actor.rearEntryV130.phase, 'active'); assert.equal(actor.dormant, false);
  assert.ok(e.platforms.some(surface => Math.abs(actor.y + actor.h - surface.y) < 2 && actor.x + actor.w > surface.x && actor.x < surface.x + surface.w));
});
test('all three real ship elevations admit only fitting bodies; unsupported or obstructed thresholds remain blocked', async () => {
  for (const floor of [140, 504, 868]) {
    const subject = await selectedFixture(), e = subject.engine; park(e, floor);
    const candidates = e.selectHordeEntrancesV132(); assert.ok(candidates.length);
    assert.ok(candidates.some(id => Math.abs(e.rearEntrancesV130.find(entry => entry.id === id).floorY - floor) < 25));
    e.hordeDirectorV132.elapsed = e.hordeDirectorV132.firstWarningAt; e.beginHordeWarningV132(); tick(e, 4.1);
    const actor = e.enemies.find(enemy => enemy.hordeV132); assert.ok(actor); assert.ok(actor.y >= 0);
    const entrance = e.rearEntrancesV130.find(entry => entry.id === actor.rearEntryV130.entranceId);
    assert.equal(actor.y + actor.h, entrance.floorY);
    const blocker = { x: actor.x - 2, y: actor.y, w: actor.w + 4, h: actor.h }; e.walls.push(blocker);
    tick(e, 3); assert.equal(actor.dormant, true); assert.equal(actor.rearEntryV130.blocked, true);
    e.walls = e.walls.filter(wall => wall !== blocker); tick(e, .2); assert.equal(actor.dormant, false);
  }
});
test('occupied threshold never materializes on J1/J2; pause and loading freeze the full director state', async () => {
  const subject = await selectedFixture(), e = awaitWarning(subject); tick(e, 4.2);
  const actor = e.enemies.find(enemy => enemy.hordeV132), entrance = e.rearEntrancesV130.find(entry => entry.id === actor.rearEntryV130.entranceId);
  e.coopEnabled = true; Object.assign(e.coop, { alive: true, downed: false, x: actor.x, y: entrance.floorY - e.coop.h });
  tick(e, 3); assert.equal(actor.dormant, true); e.coop.x += 200; tick(e, .1); assert.equal(actor.dormant, false);
  const saved = JSON.stringify(e.captureResumeState().hordeDirectorV132); e.paused = true; tick(e, 4);
  assert.equal(JSON.stringify(e.captureResumeState().hordeDirectorV132), saved); e.paused = false; e.enemyAtlasLoadingPausedV65 = true; tick(e, 4);
  assert.equal(JSON.stringify(e.captureResumeState().hordeDirectorV132), saved);
});
test('one actual bullet kills one-impact contacts once, creates no loot and contact crowd shares an impact budget', async () => {
  const subject = await selectedFixture(), e = awaitWarning(subject); tick(e, 7); await prepare(e);
  const actor = e.enemies.find(enemy => enemy.hordeV132 && !enemy.dormant); assert.ok(actor);
  const kills = e.player.kills, inventory = structuredClone(e.inventory), drops = e.drops.length;
  e.player.y = actor.y + actor.h - e.player.h;
  for (const offset of [160, -160, 120, -120, 220, -220]) { e.player.x = actor.x + offset; if (enemySightClearV130(e, actor, e.player)) break; }
  assert.equal(enemySightClearV130(e, actor, e.player), true, 'The admitted bullet has an actual unobstructed corridor.');
  e.player.facing = Math.sign(actor.x - e.player.x); e.player.pointerAimV83 = { x: e.player.facing, y: 0 }; e.player.ammo = e.player.magazineSize;
  e.keys.add('KeyF'); tick(e, .6); e.keys.clear(); assert.equal(actor.alive, false, JSON.stringify({ player: { x: e.player.x, y: e.player.y,
    shots: e.player.shots, hp: e.player.health, weapon: e.player.weaponMode }, actor: { x: actor.x, y: actor.y, h: actor.h, hp: actor.health,
      state: actor.rearEntryV130 }, bullets: e.bullets.map(b => ({ x: b.x, y: b.y, hit: b.hit })), loading: e.enemyAtlasLoadingPausedV65 }));
  assert.ok(e.player.kills > kills); assert.equal(e.drops.length, drops); assert.deepEqual(e.inventory, inventory);
  const killed = e.hordeDirectorV132.killed; e.defeatEnemy(actor); assert.equal(e.hordeDirectorV132.killed, killed);
  park(e); tick(e, 3);
  const active = e.enemies.filter(enemy => enemy.hordeV132 && enemy.alive && !enemy.dormant);
  assert.ok(active.length >= 2); const damage = e.player.damageTaken;
  for (const enemy of active) {
    Object.assign(enemy, { x: e.player.x + 25, y: e.player.y + e.player.h - enemy.h, facing: -1, alert: true });
    enemy.tacticsV130 = null;
  }
  for (const enemy of active) e.updateEnemy(enemy, .5);
  assert.ok(e.player.damageTaken - damage <= 12.01); assert.ok(e.hordeDirectorV132.impacts <= 1);
});
test('signed warning and in-flight entries round-trip; foreign, duplicated, warped and malformed states reject atomically', async () => {
  const subject = await selectedFixture(), e = awaitWarning(subject); tick(e, 4.2);
  const saved = JSON.parse(JSON.stringify(e.captureResumeState())); assert.equal(validateHordeDirectorV132(saved.hordeDirectorV132, e.hordeContextV132(saved)).valid, true);
  const resumed = await fixture({ seed: subject.options.seed, resume: saved, isolate: false }); assert.equal(resumed.engine.lastResumeResult.applied, true);
  assert.equal(resumed.engine.hordeDirectorV132.emitted, e.hordeDirectorV132.emitted); assert.equal(resumed.engine.enemies.filter(enemy => enemy.hordeV132).length, saved.hordeDirectorV132.actors.length);
  const baseline = JSON.stringify(e.captureResumeState());
  for (const mutation of [raw => raw.hordeDirectorV132.signature += ':foreign', raw => raw.identity.seed++, raw => raw.hordeDirectorV132.elapsed = NaN,
    raw => raw.hordeDirectorV132.actors.push(raw.hordeDirectorV132.actors[0]), raw => raw.hordeDirectorV132.killed++,
    raw => { raw.hordeDirectorV132.actors[0].x += 20; raw.enemies.find(enemy => enemy.id === raw.hordeDirectorV132.actors[0].id).x += 20; },
    raw => raw.hordeDirectorV132.eventSelected = !raw.hordeDirectorV132.eventSelected, raw => raw.hordeDirectorV132.phase = 'cooldown']) {
    const wrong = structuredClone(saved); mutation(wrong); assert.equal(e.applyResumeState(wrong).applied, false); assert.equal(JSON.stringify(e.captureResumeState()), baseline);
  }
});
test('live/global/storage budgets block emissions and time budget cancels pending contacts without counting kills', async () => {
  const subject = await selectedFixture(), e = awaitWarning(subject); tick(e, 4.1);
  const emitted = e.hordeDirectorV132.emitted;
  const source = ENEMIES.find(profile => profile.id === 'enemy-004-drone-big-chap');
  while (e.enemies.filter(enemy => enemy.alive).length < HORDE_DIRECTOR_V132.maxGlobalLive) {
    const actor = e.createEnemy(source, e.enemies.length + 500, 4600, 868); actor.dormant = true; e.enemies.push(actor);
  }
  tick(e, 2); assert.equal(e.hordeDirectorV132.emitted, emitted);
  const pending = e.enemies.filter(enemy => enemy.hordeV132 && enemy.dormant); pending.forEach(enemy => enemy.rearEntryV130.phase = 'waiting');
  const kills = e.player.kills; e.hordeDirectorV132.elapsed = HORDE_DIRECTOR_V132.duration - .1; e.update(.1);
  assert.equal(e.hordeDirectorV132.phase, 'exhausted'); assert.equal(e.player.kills, kills); assert.equal(e.hordeDirectorV132.cancelled, pending.length);
});
test('bounded production load recycles expired corpses with unique IDs and never emits beyond three waves', async () => {
  const subject = await selectedFixture(), e = subject.engine; park(e); const delivered = new Set(), costs = [];
  const publications = [], sink = e.onEvent;
  e.onEvent = event => {
    if (['horde-warning-v132', 'horde-delivery-v132', 'kill'].includes(event.type)) {
      const raw = e.captureResumeState(), checked = validateHordeDirectorV132(raw.hordeDirectorV132, e.hordeContextV132(raw));
      assert.equal(checked.valid, true, `${event.type}: ${checked.reason}`);
      assert.equal(raw.drops.some(drop => /^(salvage|ammo|key)-horde-v132-/.test(drop.id)), false);
      publications.push(event.type);
    }
    sink(event);
  };
  const start = performance.now();
  tick(e, 245, 30, () => {
    for (const actor of e.enemies.filter(enemy => enemy.hordeV132)) {
      delivered.add(actor.id);
      if (actor.alive && !actor.dormant) e.applyEnemyDamage(actor, 1, { owner: e.player, x: actor.x, y: actor.y });
    }
    costs.push(e.enemies.length);
  });
  const elapsedMs = performance.now() - start, metrics = hordeDirectorMetricsV132(e);
  assert.equal(e.mission.state, 'active'); assert.equal(metrics.emitted, HORDE_DIRECTOR_V132.maxTotal);
  assert.equal(delivered.size, HORDE_DIRECTOR_V132.maxTotal); assert.equal(metrics.killed, HORDE_DIRECTOR_V132.maxTotal);
  assert.equal(publications.filter(type => type === 'horde-warning-v132').length, 3);
  assert.equal(publications.filter(type => type === 'horde-delivery-v132').length, 30);
  assert.equal(publications.filter(type => type === 'kill').length, 30);
  assert.ok(metrics.peakLive <= HORDE_DIRECTOR_V132.maxLive); assert.ok(Math.max(...costs) <= HORDE_DIRECTOR_V132.maxStored);
  assert.ok(metrics.recycled > 0); assert.ok(metrics.pooled <= HORDE_DIRECTOR_V132.maxPool); assert.equal(metrics.phase, 'exhausted');
  assert.equal(validateHordeDirectorV132(e.captureResumeState().hordeDirectorV132, e.hordeContextV132()).valid, true);
  console.log(`horde-load-v132 ${JSON.stringify({ frames: 245 * 30, elapsedMs: Math.round(elapsedMs), ...metrics })}`);
});
test('exterior uses validated physical service thresholds; old resumes migrate without resettable wave gifts', async () => {
  const subject = await selectedFixture({ template: 'planet-exterior' }), e = subject.engine;
  assert.ok(e.rearEntrancesV130.some(entry => entry.hordeAuthoredV132)); const state = e.captureResumeState(); delete state.hordeDirectorV132;
  state.mission.elapsed = 130; assert.equal(e.applyResumeState(state).applied, true); assert.equal(e.hordeDirectorV132.elapsed, 130);
  assert.ok(e.hordeDirectorV132.nextWave >= 140);
  const missing = e.captureResumeState(); missing.enemies.push({ id: 'horde-v132-foreign-1', alive: true, health: 1, x: 1, y: 1 }); delete missing.hordeDirectorV132;
  const before = JSON.stringify(e.captureResumeState()); assert.equal(e.applyResumeState(missing).applied, false); assert.equal(JSON.stringify(e.captureResumeState()), before);
});
test('restoring a pre-director checkpoint removes future contacts; an invalid outer controller still restores nothing', async () => {
  const subject = await selectedFixture(), e = subject.engine; park(e);
  const old = e.captureResumeState(); delete old.hordeDirectorV132;
  tick(e, e.hordeDirectorV132.firstWarningAt + 7); assert.ok(e.enemies.some(enemy => enemy.hordeV132));
  const before = JSON.stringify(e.captureResumeState()), invalid = structuredClone(old); invalid.identity.seed++;
  assert.equal(e.applyResumeState(invalid).applied, false); assert.equal(JSON.stringify(e.captureResumeState()), before);
  assert.equal(e.applyResumeState(old).applied, true); assert.equal(e.enemies.filter(enemy => enemy.hordeV132).length, 0);
  const restored = e.captureResumeState(); assert.equal(validateHordeDirectorV132(restored.hordeDirectorV132, e.hordeContextV132(restored)).valid, true);
});
