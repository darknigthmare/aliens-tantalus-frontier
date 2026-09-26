import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { USER_REFERENCE_ART_V95 } from '../src/user-reference-art-v95.js';
import { ENEMY_USER_CREATIONS_V95 } from '../src/enemy-user-creations-v95.js';
import { ENEMY_STATIC_POSES_V95, getEnemyStaticPoseV95, getEnemyStaticPoseStatesV95 } from '../src/enemy-static-poses-v95.js';
import { getEnemyUserCampaignV88, isUserCasteCampaignAdmittedV95, selectUserCasteEncountersV88 } from '../src/enemy-user-campaign-v88.js';
import { createUserCampaignActorV88 } from '../src/enemy-user-campaign-runtime-v88.js';
import { createUserCasteActorV87, updateUserCasteActorV87, resolveDefenderGuardDamageV95 } from '../src/enemy-user-pose-runtime-v87.js';
import { getBioforgeRosterEntryV80, validateBioforgeCompositionV87 } from '../src/bioforge-session-v80.js';
import { GameEngine as BaseGameEngine } from '../src/game-v51-runtime.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { BioforgeRuntimeV80 } from '../src/bioforge-runtime-v80.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { ENEMY_USER_CAMPAIGN_V88 } from '../src/enemy-user-campaign-v88.js';
import { BioforgeUiV80 } from '../src/bioforge-ui-v80.js';
import { getCatalogEntryV62, searchCatalogV62 } from '../src/catalog-runtime-v62.js';
import { CatalogWorkbenchV62, formatCatalogValueV62 } from '../src/catalog-ui-v62.js';
import { ENEMIES, WORLDS, CAMPAIGNS, WEAPONS, LEVEL_SEEDS } from '../src/content.js';
import { ENEMY_STATIC_POSES_V94 } from '../src/enemy-static-poses-v94.js';

const id = 'pose-v95-user-xeno-defender';
const definition = getEnemyStaticPoseV95(id);
const sha = value => createHash('sha256').update(value).digest('hex');
const actor = (extra = {}) => ({ ...createUserCasteActorV87({ id: 'defender-test', profileId: id }, 620), x: 300, ...extra });
const frontShot = (extra = {}) => ({ kind: 'bullet', family: 'ballistic', vx: 900, vy: 0, x: 300, y: 570, ...extra });
const approx = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} !== ${expected}`);
const noop = () => {};
globalThis.addEventListener = noop;
globalThis.requestAnimationFrame = () => 1;
globalThis.Image = class {
  complete = true; naturalWidth = 1024; naturalHeight = 2048;
  set src(value) { this.currentSrc = value;
    const pose = ENEMY_STATIC_POSES_V95.flatMap(d => [d, ...getEnemyStaticPoseStatesV95(d.id)]).find(d => d.path === value);
    if (pose) { this.naturalWidth = pose.sourceWidth; this.naturalHeight = pose.sourceHeight; }
    this.onload?.();
  }
  get src() { return this.currentSrc; }
};
function engineFixture(Engine = GameEngine) {
  const events = [], persisted = [];
  const ctx = new Proxy({ measureText: text => ({ width: String(text).length * 8 }) }, { get: (target, key) => target[key] ?? noop });
  const canvas = { width: 1280, height: 720, getContext: () => ctx, addEventListener: noop, focus: noop };
  let clock = 1000;
  const engine = new Engine(canvas, { onEvent: event => events.push(event), onPersist: (state, meta) => persisted.push({ state, meta }),
    testMode: true, autoLoop: false, assets: {}, now: () => clock += 100 });
  return { engine, events, persisted };
}
function missionOptions() {
  const campaignDefinition = getEnemyUserCampaignV88(id);
  const world = WORLDS.find(w => w.id === campaignDefinition.encounterWorldIds[0]);
  const campaign = CAMPAIGNS.find(c => c.worldId === world.id && !/survival|prologue/i.test(c.id)) || CAMPAIGNS[0];
  const eligible = ENEMY_USER_CAMPAIGN_V88.filter(d => d.automaticEncounter && d.encounterWorldIds.includes(world.id));
  const seed = eligible.findIndex(d => d.id === id);
  const plan = buildMissionLevelV52({ world, campaign, levelSeeds: LEVEL_SEEDS, templateId: 'colony-multiroute', variant: 0 });
  return { userCasteCampaignV88: true, operationId: 'operation-0-v95-test', world, campaign, seed,
    enemyCatalog: ENEMIES, weapon: WEAPONS[0], difficulty: 'standard', levelSeed: { ...plan.levelSeed, seed }, missionLevel: plan };
}
function alignShot(engine, target, { facing = -1, shooterSide = -1, clearStagger = true } = {}) {
  // Controlled line of fire, using real spawned actors, fire(), collision and damage dispatch.
  Object.assign(target, { x: 1900, y: 516, groundY: 620, vy: 0, vx: 0, facing,
    dormant: false, alive: true, attacking: false, pendingMelee: false, attackAnimationClock: 0, attackWindupClock: 0,
    ...(clearStagger ? { staggerClock: 0 } : {}) });
  Object.assign(engine.player, { x: target.x + shooterSide * 180, y: 528, vx: 0, vy: 0, grounded: true,
    facing: -shooterSide, fireClock: 0, ammo: engine.player.magazineSize || 12, alive: true, reloading: false, reloadClock: 0 });
  engine.bullets = [];
}
async function printDefender(engine) {
  engine.start({ configuration: { profileId: id, quantity: 1 }, autoLoop: false, testMode: true, assets: {} });
  const control = engine.doors.find(d => d.id === 'control-seal'), inner = engine.doors.find(d => d.id === 'inner-interlock');
  const printer = engine.bioforgeLevelV80.stations.find(s => s.type === 'printer');
  Object.assign(engine.player, { x: control.x - engine.player.w - 10, y: 528 }); assert.equal(engine.interact(), true);
  Object.assign(engine.player, { x: inner.x - engine.player.w - 45, y: 528 }); assert.equal(engine.interact(), true);
  Object.assign(engine.player, { x: printer.x - 20, y: 528 }); assert.equal(engine.interact(), true);
  Object.assign(engine.player, { x: engine.bioforgeLevelV80.arenaBounds.x + 8, y: 528, vx: 0, vy: 0, grounded: true });
  engine.update(.016);
  const ready = engine.getBioforgeQaHooksV80().advance();
  assert.equal(ready?.event?.type, 'bioforge-printer-ready', JSON.stringify(ready));
  await engine.ensureEnemyAtlas(definition);
  assert.equal(engine.getBioforgeQaHooksV80().advance().event.type, 'bioforge-specimen-printed');
  assert.equal(engine.getBioforgeSnapshotV80().phase, 'combat');
  return engine.enemies.find(e => e.profileId === id);
}

test('Defender is one distinct admitted Capcom identity, preserving PNG and every historical profile', async () => {
  assert.equal(ENEMY_USER_CREATIONS_V95.filter(d => d.sourceNumber === 56).length, 1);
  const art = USER_REFERENCE_ART_V95.find(d => d.sourceNumber === 56);
  assert.equal(definition.kind, 'creature'); assert.equal(definition.legacyCounterpartId, null);
  assert.equal(definition.canonicalIdentityStatus, 'source-documented-user-assigned');
  assert.match(definition.work, /Capcom.*1994/);
  assert.deepEqual(definition.referenceUrls, ['https://avp.fandom.com/wiki/Defender']);
  assert.equal(definition.canonExact, false); assert.equal(definition.identityVerified, false);
  assert.equal(definition.animationStatus, 'missing'); assert.equal(definition.states.length, 0);
  assert.match(definition.referenceNote, /Ni variante de l’Arachnoid.*ni Sentry/);
  assert.match(definition.referenceNote, /non certifiée conforme au sprite Capcom/);
  assert.equal(sha(await readFile(new URL('../' + art.path.slice(1), import.meta.url))),
    '729a6d131424591995e8f948f9f0e6059fe0a82397a5c54f28d1269a0b46cb83');
  assert.equal(ENEMY_STATIC_POSES_V94.length, 43);
  assert.equal(sha(JSON.stringify(ENEMY_STATIC_POSES_V94)), '4cd4d97071cd64081a2b73c623f091fd258c3403f6fe3d87aefa340f33080f1a');
  assert.equal(ENEMIES.length, 571);
  assert.equal(sha(JSON.stringify(ENEMIES)), 'f609466e674e160bed8a3bdc15f6f8c41e6d788564dc4128a49dcdd0ad6e9072');
  const arachnoid = getEnemyStaticPoseV95('castes-game_avp_capcom_arachnoid');
  assert.notEqual(arachnoid.path, definition.path); assert.notEqual(arachnoid.id, id);
  assert.ok(definition.health > arachnoid.health && definition.armor > arachnoid.armor && definition.speed < arachnoid.speed);
  assert.deepEqual([definition.health, definition.damage, definition.speed, definition.armor, definition.cost], [240,14,.65,28,4]);
  assert.equal(definition.combatRole, 'defensive-melee');
});

test('Defender is printable and selected contextually for campaign, never globally substituted', () => {
  assert.equal(getBioforgeRosterEntryV80(id).profileId, id);
  const receipt = validateBioforgeCompositionV87({ composition: [{ lineId: 'defender', profileId: id, quantity: 2 }], maxConcurrent: 2 });
  assert.equal(receipt.ok, true);
  const campaign = getEnemyUserCampaignV88(id);
  assert.equal(campaign.behavior, 'guard'); assert.equal(isUserCasteCampaignAdmittedV95(campaign), true);
  const world = WORLDS.find(w => w.id === campaign.encounterWorldIds[0]);
  let selected = false;
  for (let seed = 0; seed < 150; seed++) {
    const entries = selectUserCasteEncountersV88({ world, campaign: { id: 'defender-test', mode: 'campaign' }, seed });
    assert.ok(entries.length <= 2); selected ||= entries.some(d => d.id === id || d.profileId === id);
  }
  assert.equal(selected, true);
  const spawned = createUserCampaignActorV88(campaign, { x: 400, y: 500, h: 100, alive: true }, 0);
  assert.equal(spawned.profileId, id); assert.equal(spawned.health, 240); assert.equal(spawned.armor, 28);
});

test('Defender guards both facing directions and smart/ballistic bullets using travel rather than impact or owner', () => {
  for (const facing of [-1, 1]) for (const family of ['ballistic', 'smart', 'smartgun', 'sentry', 'silent']) {
    const enemy = actor({ facing });
    approx(resolveDefenderGuardDamageV95(enemy, 100, frontShot({ family, vx: -facing * 900, owner: { x: enemy.x + facing * -300, y: enemy.y } })), 55);
    assert.equal(resolveDefenderGuardDamageV95(enemy, 100, frontShot({ family, vx: facing * 900 })), 100);
    assert.equal(resolveDefenderGuardDamageV95(enemy, 100, frontShot({ family, vx: 0, vy: 900 })), 100);
  }
  approx(resolveDefenderGuardDamageV95(actor(), 100, { kind: 'bullet', owner: { x: 0, y: 516, w: 40, h: 104 } }), 55);
  assert.equal(resolveDefenderGuardDamageV95(actor(), 100, { kind: 'bullet', x: 0, y: 568 }), 100, 'No invented firing origin from impact');
  assert.equal(resolveDefenderGuardDamageV95(actor(), 1, frontShot()), 1, 'Minimum one-point damage, never invulnerability');
});

test('Defender guard has explicit openings and never grants protection to other identities or damage families', () => {
  for (const state of [{ alive: false }, { dormant: true }, { ventTransit: true }, { attacking: true },
    { pendingMelee: true }, { attackAnimationClock: .1 }, { attackWindupClock: .1 }, { staggerClock: .1 }, { vy: -20 }])
    assert.equal(resolveDefenderGuardDamageV95(actor(state), 100, frontShot()), 100, JSON.stringify(state));
  for (const family of ['flame', 'explosive', 'electric', 'energy', 'melee', 'tool', 'sonic', 'acid', 'cryo', 'chemical'])
    assert.equal(resolveDefenderGuardDamageV95(actor(), 100, frontShot({ family })), 100, family);
  for (const source of [{ kind: 'neuro-melee' }, { kind: 'rifle-bash' }, { kind: 'ram' }, { kind: 'portable-sentry' },
    frontShot({ kind: 'explosive-splash' }), frontShot({ splash: 100 }), frontShot({ status: 'burn' })])
    assert.equal(resolveDefenderGuardDamageV95(actor(), 100, source), 100, JSON.stringify(source));
  for (const d of ENEMY_STATIC_POSES_V94)
    assert.equal(resolveDefenderGuardDamageV95(actor({ profileId: d.id }), 100, frontShot()), 100, d.id);
  assert.equal(resolveDefenderGuardDamageV95(actor({ profileId: 'foreign' }), 100, frontShot()), 100);
});

test('base V51 damage unit applies guard after armor once, preserves compensated bypass and opens on stagger', () => {
  const events = [], impacts = [];
  const engine = { spawnImpact: (...args) => impacts.push(args), onEvent: event => events.push(event), audio: { hit() {} }, defeatEnemy(enemy) { enemy.alive = false; } };
  const enemy = actor();
  const raw = 50 + enemy.armor * .35 * .18;
  const residual = raw - enemy.armor * .35;
  const damage = BaseGameEngine.prototype.applyEnemyDamage.call(engine, enemy, raw, frontShot({ family: 'smart' }));
  approx(damage, residual * .55); approx(enemy.health, 240 - damage);
  assert.equal(impacts[0][2], '#83becf'); assert.equal(events[0].type, 'defender-guard-v95');
  approx(events[0].damageBlocked, residual * .45);
  assert.ok(enemy.staggerClock > 0);
  approx(BaseGameEngine.prototype.applyEnemyDamage.call(engine, enemy, raw, frontShot({ family: 'smart' })), residual);
  assert.equal(events.length, 1, 'The staggered follow-up is not another guard');
  enemy.staggerClock = 0;
  const beforeRear = enemy.health;
  approx(BaseGameEngine.prototype.applyEnemyDamage.call(engine, enemy, raw, frontShot({ vx: -900 })), residual);
  approx(enemy.health, beforeRear - residual);
});

test('Defender approaches slowly and retains actual melee damage, not an idle label-only guard', () => {
  const enemy = actor({ attackClock: 0 });
  const player = { alive: true, x: 500, y: 516, w: 40, h: 104 };
  const hits = [];
  const engine = { player, enemyMeleePathClearV64: () => true, damagePlayer: (target, amount) => hits.push({ target, amount }) };
  const start = enemy.x;
  updateUserCasteActorV87(engine, enemy, .1);
  approx(enemy.x - start, (55 + .65 * 35) * .1);
  enemy.x = player.x - enemy.w;
  updateUserCasteActorV87(engine, enemy, .1);
  assert.equal(hits.length, 1); assert.equal(hits[0].amount, 14); assert.equal(enemy.attacking, true);
  assert.equal(resolveDefenderGuardDamageV95(enemy, 100, frontShot({ vx: -900 })), 100);
});

test('real production fire/updateBullets guards front, exposes rear and stagger, and resumes without stacking armor', () => {
  const { engine, events } = engineFixture();
  const options = missionOptions(); engine.start(options);
  const enemy = engine.enemies.find(e => e.profileId === id); assert.ok(enemy);
  engine.walls = []; engine.doors = []; engine.platforms = [];
  for (const other of engine.enemies) if (other !== enemy) other.x = 8000;
  for (const [facing, side, staggered, multiplier] of [[-1,-1,false,.55], [-1,-1,true,1], [-1,1,false,1], [1,1,false,.55]]) {
    alignShot(engine, enemy, { facing, shooterSide: side, clearStagger: !staggered });
    if (staggered) assert.ok(enemy.staggerClock > 0);
    const before = enemy.health, guardCount = events.filter(e => e.type === 'defender-guard-v95').length;
    assert.equal(engine.fire(engine.player), true, JSON.stringify({ running: engine.running, paused: engine.paused,
      atlas: engine.enemyAtlasLoadingPausedV65, casteLoading: engine.userCasteLoadingV88, mission: engine.mission.state,
      player: { alive: engine.player.alive, fireClock: engine.player.fireClock, weaponMode: engine.player.weaponMode },
      loading: engine.enemyAtlasLoadGateV65 }));
    const bullet = engine.bullets[0]; assert.ok(bullet && bullet.owner === engine.player);
    assert.equal(bullet.family, 'ballistic');
    const expected = Math.max(1, bullet.damage - 28 * .35 * (1 - bullet.armorBypass)) * multiplier;
    engine.updateBullets(.3);
    approx(before - enemy.health, expected);
    assert.equal(events.filter(e => e.type === 'defender-guard-v95').length - guardCount, multiplier === .55 ? 1 : 0);
    assert.equal(enemy.armor, 28); assert.equal(enemy.maxHealth, 240);
  }
  const health = enemy.health;
  const snapshot = engine.captureResumeState();
  const restoredEngine = engineFixture().engine; restoredEngine.start({ ...options, resumeState: snapshot });
  const restored = restoredEngine.enemies.find(e => e.profileId === id);
  assert.ok(restored); assert.equal(restored.armor, 28); assert.equal(restored.maxHealth, 240); approx(restored.health, health);
  const second = engineFixture().engine; second.start({ ...options, resumeState: restoredEngine.captureResumeState() });
  assert.equal(second.enemies.find(e => e.profileId === id).armor, 28);
});

test('real BIOFORGE printing/fire/combat preserves trajectory, exclusions, stagger and physical resume', async () => {
  const { engine, events, persisted } = engineFixture(BioforgeRuntimeV80);
  const enemy = await printDefender(engine); assert.ok(enemy); assert.equal(enemy.armor, 28);
  const cases = [
    { facing: -1, side: -1, multiplier: .55, moveOwner: true },
    { facing: -1, side: -1, multiplier: 1, staggered: true },
    { facing: -1, side: 1, multiplier: 1 },
    { facing: 1, side: 1, multiplier: .55 },
    { facing: -1, side: -1, multiplier: 1, family: 'flame' }
  ];
  for (const c of cases) {
    alignShot(engine, enemy, { facing: c.facing, shooterSide: c.side, clearStagger: !c.staggered });
    engine.player.x = c.side < 0 ? enemy.x - engine.player.w - 40 : enemy.x + enemy.w + 40;
    if (c.staggered) assert.ok(enemy.staggerClock > 0);
    const before = enemy.health, guardCount = events.filter(e => e.type === 'defender-guard-v95').length;
    assert.equal(engine.fire(), true); assert.equal(engine.bullets.length, 1);
    if (c.family) engine.bullets[0].family = c.family; // Forward-compatibility: adapter must not erase a projectile family.
    if (c.moveOwner) engine.player.x = enemy.x + 200; // Travel direction, not the owner's later position, is authoritative.
    // Close range keeps travel below the .12s stagger opening; no injected projectile or direct damage call.
    engine.updateBioforgeCombatV80(.06);
    approx(before - enemy.health, (28 - 28 * .35) * c.multiplier);
    assert.equal(events.filter(e => e.type === 'defender-guard-v95').length - guardCount, c.multiplier === .55 ? 1 : 0);
    assert.equal(enemy.armor, 28);
  }
  assert.ok(persisted.some(p => p.meta?.event?.type === 'bioforge-enemy-damaged'));
  const savedHealth = enemy.health;
  const snapshot = engine.captureBioforgeResumeStateV80();
  const restoredEngine = engineFixture(BioforgeRuntimeV80).engine;
  restoredEngine.start({ resumeState: snapshot, autoLoop: false, testMode: true, assets: {} });
  const restored = restoredEngine.enemies.find(e => e.profileId === id);
  assert.ok(restored, JSON.stringify({ result: restoredEngine.getBioforgeSnapshotV80(), saved: snapshot.runtimeV81 }));
  approx(restored.health, savedHealth); assert.equal(restored.armor, 28); assert.equal(restored.maxHealth, 240);
  assert.equal(restored.profileId, id); assert.equal(restoredEngine.enemies.length, 1);
});

test('actual M56 Smartgun firing uses its production armor bypass before Defender guard', () => {
  const { engine, events } = engineFixture();
  engine.start({ ...missionOptions(), weapon: WEAPONS.find(w => w.id === 'weapon-005-m56-smartgun') });
  const enemy = engine.enemies.find(e => e.profileId === id);
  assert.ok(enemy); engine.walls = []; engine.doors = []; engine.platforms = [];
  for (const other of engine.enemies) if (other !== enemy) other.x = 8000;
  alignShot(engine, enemy);
  assert.equal(engine.fire(engine.player), true);
  const bullet = engine.bullets[0]; assert.equal(bullet.family, 'smart'); assert.equal(bullet.armorBypass, .18);
  const before = enemy.health;
  engine.updateBullets(.3);
  approx(before - enemy.health, (bullet.damage - 28 * .35 * .82) * .55);
  assert.ok(events.some(e => e.type === 'defender-guard-v95'));
});

class Element {
  constructor(tag = '') { this.tag = tag; this.children = []; this.dataset = {}; this.style = {}; this.attributes = {}; this._text = ''; }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map(n => n.textContent).join(''); }
  append(...nodes) { this.children.push(...nodes); }
  appendChild(node) { this.children.push(node); return node; }
  replaceChildren(...nodes) { this.children = nodes; this._text = ''; }
  setAttribute(key, value) { this.attributes[key] = value; }
}
const doc = { createElement: tag => new Element(tag) };
const flatten = node => [node, ...node.children.flatMap(flatten)];

test('Defender dossier is immutable, searchable and visibly qualified in encyclopedia and BIOFORGE', () => {
  const record = getCatalogEntryV62(id), behavior = definition.specializedBehaviorV95;
  assert.deepEqual(record.combatBehaviorV95, behavior);
  assert.equal(record.combatBehaviorV89, undefined); assert.equal(record.combatBehaviorV90, undefined);
  assert.equal(record.gameplayStats.specializedBehaviorStatus, 'source-grounded-partial-v95');
  assert.equal(formatCatalogValueV62(record.gameplayStats.specializedBehaviorStatus), 'Documentée, adaptation partielle');
  assert.ok(Object.isFrozen(behavior) && Object.isFrozen(behavior.sourceUrls) && Object.isFrozen(behavior.runtimeScopes));
  assert.ok(searchCatalogV62(behavior.label, { catalog: 'enemies' }).some(hit => hit.entry.id === id));
  const ui = Object.create(BioforgeUiV80.prototype);
  ui.document = doc; ui.profile = { value: id };
  for (const key of ['preview', 'thumbnail', 'profileName', 'cost', 'missionBehaviorV90']) ui[key] = new Element();
  ui.syncSelection();
  assert.match(ui.profileName.textContent, /Defender.*Capcom.*1994/);
  assert.match(ui.cost.textContent, /garde défensive adaptée/);
  assert.match(ui.missionBehaviorV90.textContent, /MISSION ET BIOFORGE/);
  assert.match(ui.missionBehaviorV90.textContent, /45 %/);
  assert.match(ui.missionBehaviorV90.textContent, /pas des valeurs canoniques/);
  assert.match(ui.missionBehaviorV90.textContent, /non certifiée conforme au sprite Capcom/);
  assert.doesNotMatch(ui.missionBehaviorV90.textContent, /Non reproduit dans le labo/);
  assert.equal(ui.preview.src, definition.path);
  const detail = new Element(), section = new Element();
  const workbench = { document: doc, detail, renderSection(label) { section.textContent = label; return section; } };
  CatalogWorkbenchV62.prototype.renderCombatBehaviorV89.call(workbench, record);
  assert.match(detail.textContent, /COMPORTEMENT EN MISSION ET BIOFORGE/);
  assert.match(detail.textContent, /œufs\/juvéniles.*non simulées/);
  for (const host of [detail, ui.missionBehaviorV90]) {
    const links = flatten(host).filter(node => node.tag === 'a');
    assert.equal(links.length, 1); assert.equal(links[0].href, 'https://avp.fandom.com/wiki/Defender');
    assert.equal(links[0].rel, 'noopener noreferrer'); assert.equal(links[0].referrerPolicy, 'no-referrer');
  }
  ui.profile.value = 'castes-game_avp_capcom_arachnoid'; ui.syncSelection();
  assert.equal(ui.missionBehaviorV90.hidden, true); assert.equal(ui.missionBehaviorV90.textContent, '');
});
