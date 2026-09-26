import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, ENEMIES, LEVEL_SEEDS, WEAPONS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { ENEMY_USER_CAMPAIGN_V88, USER_CASTE_BEHAVIORS_V89 } from '../src/enemy-user-campaign-v88.js';
import { sanitizeOperationResumeState, recordOperationResumeState, SaveSystem, migrateSave } from '../src/save.js';
import { largeMissionActorFitsV72 } from '../src/mission-large-actor-placement-v72.js';

const noop = () => {};
globalThis.addEventListener = noop; globalThis.requestAnimationFrame = () => 1;
globalThis.Image = class {
  complete = true; naturalWidth = 1024; naturalHeight = 2048;
  set src(value) { this.currentSrc = this._src = value;
    const definition = ENEMY_USER_CAMPAIGN_V88.find(entry => entry.path === value);
    if (definition) {
      this.naturalWidth = definition.sourceWidth;
      this.naturalHeight = definition.sourceHeight;
    }
  }
  get src() { return this._src; }
};
const definitions = Object.keys(USER_CASTE_BEHAVIORS_V89).map(b => ENEMY_USER_CAMPAIGN_V88.find(d => d.basename === b));
const [burster, blight, brute] = definitions;
const gapFor = d => d === blight ? 260 : d === brute ? 130 : 80;
function optionsFor(d, mission = false) {
  const world = WORLDS.find(w => w.id === d.encounterWorldIds[0]);
  const campaign = CAMPAIGNS.find(c => c.worldId === world.id && !/survival|prologue/i.test(c.id)) || CAMPAIGNS[0];
  const seed = ENEMY_USER_CAMPAIGN_V88.filter(e => e.encounterWorldIds.includes(world.id)).findIndex(e => e.id === d.id);
  const plan = buildMissionLevelV52({ world, campaign, levelSeeds: LEVEL_SEEDS, templateId: 'colony-multiroute', variant: 0 });
  return { userCasteCampaignV88: true, operationId: 'operation-0-behavior-test', world, campaign, seed,
    enemyCatalog: ENEMIES, weapon: WEAPONS[0], difficulty: 'standard', levelSeed: { ...plan.levelSeed, seed },
    ...(mission ? { missionLevel: plan } : {}) };
}
function fixture(d = burster, { resume, mission = false } = {}) {
  const events = [], draws = [], ctx = new Proxy({ measureText: s => ({ width: String(s).length * 8 }),
    fillText: text => draws.push(text), createLinearGradient: () => ({ addColorStop: noop }) }, { get: (o, k) => o[k] ?? noop });
  const engine = new GameEngine({ width: 1280, height: 720, getContext: () => ctx, addEventListener: noop, focus: noop }, { onEvent: e => events.push(e) });
  const options = optionsFor(d, mission); engine.start({ ...options, ...(resume ? { resumeState: resume } : {}) });
  const actor = engine.enemies.find(e => e.profileId === d.id); assert.ok(actor, d.id + ' really spawned');
  if (!mission) {
    engine.walls = []; engine.doors = []; engine.covers = [];
    engine.platforms = [{ id: 'test-floor', x: 0, y: 930, w: 5000, h: 40 }];
    if (!resume) {
      Object.assign(actor, { x: 1000, y: 930 - actor.h, spawnX: 1000, staggerClock: 0 });
      Object.assign(engine.player, { x: actor.x + actor.w / 2 + gapFor(d) - engine.player.w / 2,
        y: 930 - engine.player.h, armor: 0, health: 100, maxHealth: 100, inCover: false, grounded: true });
      actor.userCasteCombatV89.clock = 0;
    }
  }
  return { engine, actor, d, options, events, draws, ctx };
}
function advance(f, seconds, { effects = false } = {}) {
  for (let elapsed = 0; elapsed < seconds - 1e-9; elapsed += .05) {
    const dt = Math.min(.05, seconds - elapsed);
    if (effects) f.engine.updateHostileProjectiles(dt); else f.engine.updateEnemy(f.actor, dt);
  }
}
function arm(f) { f.engine.updateEnemy(f.actor, .01); assert.equal(f.actor.userCasteCombatV89.phase, 'windup'); }
function count(f, type) { return f.events.filter(e => e.type === type).length; }
function impact(f) { arm(f); advance(f, f.d.behaviorContractV89.windup + .001); }

test('exactly three partial official-source contracts, native identities and population receipts unchanged', () => {
  assert.equal(ENEMY_USER_CAMPAIGN_V88.filter(d => d.specializedBehaviorV89).length, 3);
  for (const d of definitions) {
    assert.equal(d.canonExact, false); assert.equal(d.specializedBehaviorStatus, 'source-grounded-partial-v89');
    assert.match(d.specializedBehaviorV89.sourceUrls[0], /^https:\/\/www\.aliensfireteamelite\.com\//);
    assert.match(d.specializedBehaviorV89.adaptationNote, /partielle/);
    const f = fixture(d, { mission: true });
    assert.ok(f.engine.userCasteCampaignV88.entries.length <= 2);
    assert.ok(f.engine.enemies.filter(e => e.campaignCasteV88 && e.isRoyal).length <= 1);
    assert.ok(largeMissionActorFitsV72(f.actor, { platforms: f.engine.platforms, doors: f.engine.doors, ...f.engine.missionLevelBounds }));
  }
});

for (const d of definitions) test(d.basename + ': real update shows telegraph, freeze on pause/loading/zero/negative delta, one impact only', () => {
  const f = fixture(d); arm(f); f.engine.drawEnemy(f.ctx, f.actor);
  assert.ok(f.draws.includes(d.behaviorContractV89.label));
  const state = structuredClone(f.actor.userCasteCombatV89);
  f.engine.paused = true; advance(f, 1); f.engine.paused = false;
  f.engine.userCasteLoadingV88 = true; advance(f, 1); f.engine.userCasteLoadingV88 = false;
  f.engine.updateEnemy(f.actor, 0); f.engine.updateEnemy(f.actor, -.2);
  assert.deepEqual(f.actor.userCasteCombatV89, state); assert.equal(f.engine.player.health, 100);
  advance(f, d.behaviorContractV89.windup - .01); assert.equal(count(f, 'user-caste-impact-v89'), 0);
  advance(f, .02); assert.equal(count(f, 'user-caste-impact-v89'), 1);
  advance(f, .2); assert.equal(count(f, 'user-caste-impact-v89'), 1);
  if (d === blight) assert.equal(f.engine.player.health, 100, 'Launched glob is not instant damage');
  else assert.equal(f.engine.player.health, 100 - f.actor.damage * d.behaviorContractV89.damageScale);
});

for (const d of definitions) test(d.basename + ': neutralization interrupts windup permanently, including resume', () => {
  const f = fixture(d); arm(f); advance(f, .2); f.engine.defeatEnemy(f.actor, f.engine.player);
  advance(f, 2); assert.equal(count(f, 'user-caste-impact-v89'), 0); assert.equal(f.engine.userCasteEffectsV89.length, 0);
  const resumed = fixture(d, { resume: sanitizeOperationResumeState(f.engine.captureResumeState()) });
  assert.equal(resumed.engine.lastResumeResult.applied, true); advance(resumed, 2);
  assert.equal(resumed.actor.alive, false); assert.equal(count(resumed, 'user-caste-impact-v89'), 0);
});

for (const d of definitions) test(d.basename + ': save during telegraph preserves remaining time and single delivery', () => {
  const f = fixture(d); arm(f); advance(f, .2);
  const raw = sanitizeOperationResumeState(f.engine.captureResumeState());
  const resumed = fixture(d, { resume: raw });
  assert.equal(resumed.engine.lastResumeResult.applied, true);
  assert.equal(resumed.actor.id, f.actor.id); assert.equal(resumed.actor.health, f.actor.health);
  assert.deepEqual(resumed.actor.userCasteCombatV89, f.actor.userCasteCombatV89);
  advance(resumed, resumed.actor.userCasteCombatV89.clock - .01);
  assert.equal(count(resumed, 'user-caste-impact-v89'), 0);
  advance(resumed, .02); assert.equal(count(resumed, 'user-caste-impact-v89'), 1);
  const again = fixture(d, { resume: sanitizeOperationResumeState(resumed.engine.captureResumeState()) });
  advance(again, .2); assert.equal(count(again, 'user-caste-impact-v89'), 0, 'No replay after delivered impact');
});

test('Burster spends itself once; geometry blocks both arming and damage if a barrier appears during windup', () => {
  for (const obstacle of ['wall', 'door', 'cover', 'platform']) {
    const f = fixture(burster), middle = f.actor.x + f.actor.w / 2 + 40;
    const box = { id: 'barrier', x: middle, y: 500, w: 4, h: 430, progress: 0, open: false };
    const install = () => { if (obstacle === 'door') { f.engine.doors = [box]; f.engine.getDoorRenderState = d => d; }
      else f.engine[obstacle === 'wall' ? 'walls' : obstacle === 'cover' ? 'covers' : 'platforms'].push(box); };
    install(); f.engine.updateEnemy(f.actor, .1); assert.equal(f.actor.userCasteCombatV89.phase, 'cooldown', obstacle);
    if (obstacle === 'door') f.engine.doors = [];
    else f.engine[obstacle === 'wall' ? 'walls' : obstacle === 'cover' ? 'covers' : 'platforms'].pop();
    arm(f); install(); advance(f, .7);
    assert.equal(f.engine.player.health, 100, obstacle + ' intercepts blast');
    assert.equal(f.actor.alive, false); assert.equal(count(f, 'user-caste-impact-v89'), 1);
  }
});

test('Brute shockwave is grounded and cannot hit across a gap or through a closed barrier', () => {
  const f = fixture(brute); arm(f); f.engine.player.y -= 70; advance(f, .9);
  assert.equal(f.engine.player.health, 100); assert.equal(f.actor.userCasteCombatV89.phase, 'cooldown');
  const g = fixture(brute); arm(g);
  g.engine.walls.push({ x: g.actor.x + g.actor.w / 2 + 65, y: 500, w: 5, h: 430 });
  advance(g, .9); assert.equal(g.engine.player.health, 100);
  const h = fixture(brute); impact(h); const health = h.engine.player.health;
  advance(h, .5); assert.equal(h.engine.player.health, health, 'Recovery is not generic contact damage');
});

test('navigation, dormancy and stagger cancel an armed attack without carrying it through reactivation', () => {
  for (const reason of ['dormant', 'ventTransit', 'staggerClock']) {
    const f = fixture(brute); arm(f);
    f.actor[reason] = reason === 'staggerClock' ? .5 : true;
    f.engine.updateEnemy(f.actor, .01); assert.equal(f.actor.userCasteCombatV89.phase, 'cooldown', reason);
    f.actor[reason] = reason === 'staggerClock' ? 0 : false;
    advance(f, .9); assert.equal(count(f, 'user-caste-impact-v89'), 0, reason);
  }
});

test('Blight physical glob has a fuse, hits once, leaves a bounded grounded acid pool, and expires', () => {
  const f = fixture(blight); impact(f); assert.equal(f.engine.userCasteEffectsV89.length, 1);
  const glob = f.engine.userCasteEffectsV89[0], startX = glob.x;
  advance(f, .4, { effects: true }); assert.ok(glob.x > startX); assert.equal(f.engine.player.health, 100);
  const frozen = structuredClone(glob); f.engine.paused = true; advance(f, .2, { effects: true }); f.engine.paused = false;
  f.engine.updateHostileProjectiles(0); f.engine.updateHostileProjectiles(-.1); assert.deepEqual(glob, frozen);
  advance(f, .7, { effects: true }); assert.equal(count(f, 'user-caste-glob-detonated-v89'), 1);
  assert.equal(f.engine.player.health, 100 - f.actor.damage * blight.behaviorContractV89.damageScale);
  assert.equal(f.engine.userCasteEffectsV89[0]?.kind, 'pool'); const health = f.engine.player.health;
  f.engine.player.y -= 70; advance(f, .65, { effects: true }); assert.equal(f.engine.player.health, health, 'Jump avoids pool');
  f.engine.player.y += 70; advance(f, .65, { effects: true }); assert.ok(f.engine.player.health < health);
  advance(f, 3, { effects: true }); assert.equal(f.engine.userCasteEffectsV89.length, 0);
  assert.equal(count(f, 'user-caste-glob-detonated-v89'), 1);
});

test('Blight projectile respects swept thin obstacles and can be shot down before its fuse ends', () => {
  const blocked = fixture(blight); impact(blocked); const effect = blocked.engine.userCasteEffectsV89[0];
  blocked.engine.walls.push({ x: effect.x + 8, y: effect.y - 20, w: 1, h: 60 });
  advance(blocked, 1.2, { effects: true }); assert.equal(blocked.engine.userCasteEffectsV89.length, 0);
  assert.equal(count(blocked, 'user-caste-glob-detonated-v89'), 0); assert.equal(blocked.engine.player.health, 100);
  const shot = fixture(blight); impact(shot); const glob = shot.engine.userCasteEffectsV89[0];
  shot.engine.bullets.push({ x: glob.x + 30, y: glob.y, vx: -600, w: 4, h: 4, damage: 999, life: 2, owner: shot.engine.player });
  const health = shot.actor.health; shot.engine.updateBullets(.05);
  assert.equal(shot.engine.userCasteEffectsV89.length, 0); assert.equal(shot.engine.bullets.length, 0);
  assert.equal(shot.actor.health, health, 'Consumed bullet cannot also damage creature');
  assert.equal(count(shot, 'user-caste-glob-destroyed-v89'), 1);
  advance(shot, 2, { effects: true }); assert.equal(count(shot, 'user-caste-glob-detonated-v89'), 0);
});

test('Blight active glob and pool reload with remaining time, never fresh explosions or refreshed lifetime', () => {
  const f = fixture(blight); impact(f); advance(f, .4, { effects: true });
  const resumed = fixture(blight, { resume: sanitizeOperationResumeState(f.engine.captureResumeState()) });
  assert.deepEqual(resumed.engine.userCasteEffectsV89, f.engine.userCasteEffectsV89);
  advance(resumed, .7, { effects: true }); assert.equal(count(resumed, 'user-caste-glob-detonated-v89'), 1);
  advance(resumed, .2, { effects: true });
  const pool = fixture(blight, { resume: sanitizeOperationResumeState(resumed.engine.captureResumeState()) });
  assert.deepEqual(pool.engine.userCasteEffectsV89, resumed.engine.userCasteEffectsV89);
  advance(pool, 3, { effects: true }); assert.equal(count(pool, 'user-caste-glob-detonated-v89'), 0);
  assert.equal(pool.engine.userCasteEffectsV89.length, 0);
});

test('legacy or malformed state falls back safely without free impacts, foreign effects or health refill', () => {
  for (const malformed of [undefined, null, { schema: 89, kind: 'ground-slam', phase: 'windup', clock: NaN }]) {
    const f = fixture(brute); f.actor.health -= 12;
    const raw = f.engine.captureResumeState(); raw.enemies.find(e => e.id === f.actor.id).userCasteCombatV89 = malformed;
    raw.userCasteEffectsV89 = { schema: 89, entries: [null, {}, { ownerId: 'foreign', kind: 'glob', life: 1 }] };
    const resumed = fixture(brute, { resume: raw });
    assert.equal(resumed.actor.health, f.actor.health); assert.equal(resumed.actor.userCasteCombatV89.phase, 'cooldown');
    assert.equal(resumed.actor.userCasteCombatV89.clock, 1.2); assert.equal(resumed.engine.userCasteEffectsV89.length, 0);
    advance(resumed, .9); assert.equal(count(resumed, 'user-caste-impact-v89'), 0);
  }
});

for (const d of definitions) test(d.basename + ': actual mission platforms deliver the attack without replacing level geometry', () => {
  const f = fixture(d, { mission: true });
  // The authored cover is immediately to the right of this spawn. Approach
  // from the open left corridor; keep every cover/door/platform in place.
  Object.assign(f.engine.player, { x: f.actor.x + f.actor.w / 2 - gapFor(d) - f.engine.player.w / 2,
    y: f.actor.y + f.actor.h - f.engine.player.h, armor: 0, health: 100, inCover: false, grounded: true });
  f.actor.userCasteCombatV89.clock = 0;
  impact(f);
  if (d === blight) advance(f, 1.1, { effects: true });
  assert.ok(f.engine.player.health < 100, 'Attack reaches real mission player');
  if (f.actor.alive) assert.ok(largeMissionActorFitsV72(f.actor, { platforms: f.engine.platforms, doors: f.engine.doors, ...f.engine.missionLevelBounds }));
});

test('ground slam cannot cross a missing platform even when both actors stand at the same height', () => {
  const f = fixture(brute), center = f.actor.x + f.actor.w / 2;
  f.engine.platforms = [{ x: 0, y: 930, w: center + 40, h: 40 }, { x: center + 90, y: 930, w: 1500, h: 40 }];
  impact(f); assert.equal(f.engine.player.health, 100);
});

test('single area impact damages J1, J2 and AI crew once, but shared vehicle only once', () => {
  const f = fixture(burster); f.engine.coopEnabled = true;
  Object.assign(f.engine.coop, { ...f.engine.player, id: 'coop-v89', coop: true });
  const crew = { ...f.engine.player, id: 'crew-v89', crewId: 'crew-v89', squadMember: true, specialty: 'combat' };
  f.engine.squadActors = [crew];
  const crewHits = f.engine.squadTelemetry.hitsTaken;
  impact(f);
  const damage = f.actor.damage * burster.behaviorContractV89.damageScale;
  assert.equal(f.engine.player.health, 100 - damage); assert.equal(f.engine.coop.health, 100 - damage);
  assert.equal(f.engine.squadTelemetry.hitsTaken, crewHits + 1); assert.ok(crew.health < 100);
  const vehicle = fixture(burster); vehicle.engine.coopEnabled = true;
  Object.assign(vehicle.engine.coop, { ...vehicle.engine.player, id: 'coop-v89', coop: true });
  vehicle.engine.vehicle = { ...vehicle.engine.vehicle, active: true, destroyed: false, hull: 1000 };
  vehicle.engine.player.inVehicle = true; vehicle.engine.coop.inVehicle = true;
  impact(vehicle); assert.equal(vehicle.engine.vehicle.hull, 1000 - vehicle.actor.damage * burster.behaviorContractV89.damageScale);
});

test('save captured by a Burster damage callback already owns a dead spent identity', () => {
  const f = fixture(burster); let saved;
  const damage = f.engine.damagePlayer.bind(f.engine);
  f.engine.damagePlayer = (...args) => { const result = damage(...args); saved = f.engine.captureResumeState(); return result; };
  impact(f); assert.ok(saved);
  const entry = saved.enemies.find(e => e.id === f.actor.id);
  assert.equal(entry.alive, false); assert.equal(entry.userCasteCombatV89.phase, 'spent');
  const resumed = fixture(burster, { resume: saved }); advance(resumed, 4);
  assert.equal(count(resumed, 'user-caste-impact-v89'), 0);
});

test('rejected restore cannot mutate the current attack and duplicate saved effects cannot double damage', () => {
  const f = fixture(blight); impact(f); advance(f, .2, { effects: true });
  const before = structuredClone(f.engine.userCasteEffectsV89), state = structuredClone(f.actor.userCasteCombatV89);
  const wrong = f.engine.captureResumeState(); wrong.identity.worldId = 'another-world';
  assert.equal(f.engine.applyResumeState(wrong).applied, false);
  assert.deepEqual(f.engine.userCasteEffectsV89, before); assert.deepEqual(f.actor.userCasteCombatV89, state);
  const raw = f.engine.captureResumeState(); raw.userCasteEffectsV89.entries.push({ ...raw.userCasteEffectsV89.entries[0] });
  const resumed = fixture(blight, { resume: raw }); assert.equal(resumed.engine.userCasteEffectsV89.length, 1);
  advance(resumed, 1, { effects: true }); assert.equal(count(resumed, 'user-caste-glob-detonated-v89'), 1);
});

for (const phase of ['windup', 'glob', 'pool', 'spent']) test('real SaveSystem record/commit/load/migrate/apply roundtrip: ' + phase, () => {
  const d = phase === 'glob' || phase === 'pool' ? blight : burster;
  const f = fixture(d); arm(f); advance(f, phase === 'windup' ? .2 : d.behaviorContractV89.windup + .001);
  if (phase === 'glob') advance(f, .35, { effects: true });
  if (phase === 'pool') advance(f, 1.3, { effects: true });
  const memory = new Map(), storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  const writer = new SaveSystem(storage);
  writer.data.strategy.currentOperation = { id: f.options.operationId, campaignId: f.options.campaign.id, worldId: f.options.world.id,
    seed: f.options.seed, levelSeedId: f.options.levelSeed.id, status: 'deployed', crewIds: [], difficulty: 'standard' };
  const captured = f.engine.captureResumeState();
  assert.equal(recordOperationResumeState(writer.data, captured), true); assert.ok(writer.commit());
  const reader = new SaveSystem(storage); reader.load();
  const migrated = migrateSave(JSON.parse(JSON.stringify(reader.data)));
  const raw = migrated.strategy.currentOperation.resumeState;
  assert.deepEqual(raw.enemies.find(e => e.id === f.actor.id).userCasteCombatV89, f.actor.userCasteCombatV89);
  assert.deepEqual(raw.userCasteEffectsV89, captured.userCasteEffectsV89);
  const resumed = fixture(d, { resume: raw }); assert.equal(resumed.engine.lastResumeResult.applied, true);
  assert.equal(resumed.actor.id, f.actor.id); assert.equal(resumed.actor.alive, f.actor.alive);
  assert.deepEqual(resumed.actor.userCasteCombatV89, f.actor.userCasteCombatV89);
  assert.deepEqual(resumed.engine.userCasteEffectsV89, f.engine.userCasteEffectsV89);
  if (phase === 'windup') { advance(resumed, .46); assert.equal(count(resumed, 'user-caste-impact-v89'), 1); }
  else if (phase === 'glob') { advance(resumed, .71, { effects: true }); assert.equal(count(resumed, 'user-caste-glob-detonated-v89'), 1); }
  else if (phase === 'pool') { advance(resumed, 3, { effects: true }); assert.equal(count(resumed, 'user-caste-glob-detonated-v89'), 0); }
  else { advance(resumed, 3); assert.equal(count(resumed, 'user-caste-impact-v89'), 0); }
});
