import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { validatePlayerIdentityV84 } from '../src/player-onboarding-v84.js';
import { PLAYER_VISUAL_CONTRACT_V81 } from '../src/player-visual-contract-v81.js';
import { ALPHA_BRAVO_CAMPAIGN_V69 } from '../src/alpha-bravo-coop-v69.js';
import { beginOperation, createDefaultSave, resolveOperation, sanitizeOperationResumeState } from '../src/save.js';
import { CAMPAIGNS, CREW, ENEMIES, LEVEL_SEEDS, WEAPONS, WORLDS } from '../src/content.js';

const IDENTITY = Object.freeze(validatePlayerIdentityV84({ name: 'Alex Navarro', callsign: 'echo-9' }).identity);
const MANIFEST_CREW = CREW.slice(0, 4);
const crewIds = actors => actors.map(actor => actor.crewId || actor.operatorId);

function withRuntime(run) {
  const names = ['Image', 'addEventListener', 'requestAnimationFrame', 'document', 'navigator'];
  const descriptors = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const document = { hidden: false, activeElement: null, addEventListener() {} };
  const mocks = {
    Image: class {
      constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
      set src(value) { this.currentSrc = value; }
    },
    addEventListener() {}, requestAnimationFrame: () => 0,
    document, navigator: { getGamepads: () => [] }
  };
  for (const [name, value] of Object.entries(mocks)) Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  const engines = [];
  function make(overrides = {}) {
    const events = [];
    const canvas = {
      width: 1280, height: 720, getContext: () => ({}), addEventListener() {},
      focus() { document.activeElement = canvas; },
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 })
    };
    const engine = new GameEngine(canvas, { onEvent: event => events.push(event) });
    engines.push(engine);
    const world = overrides.world || WORLDS[0];
    const campaign = overrides.campaign || { ...CAMPAIGNS[0], id: 'identity-v84', worldId: world.id };
    const options = {
      seed: 840084, world, campaign,
      levelSeed: { ...LEVEL_SEEDS[0], id: 'identity-level-v84', seed: 840084, worldId: world.id, objective: campaign.objective },
      weapon: WEAPONS[0], equipment: [], crew: MANIFEST_CREW, enemyCatalog: ENEMIES.slice(0, 52),
      difficulty: 'standard', accessibility: { aimAssist: 'off' }, ...overrides
    };
    engine.start(options);
    return { engine, events, options };
  }
  try { return run(make); }
  finally {
    for (const engine of engines) engine.stop();
    for (const [name, descriptor] of descriptors) descriptor
      ? Object.defineProperty(globalThis, name, descriptor) : delete globalThis[name];
  }
}

function putAtStation(actor, station, offset = 0) {
  Object.assign(actor, { x: station.x + station.w / 2 - actor.w / 2 + offset,
    y: station.groundY - actor.h, vx: 0, vy: 0, alive: true, downed: false, inVehicle: false });
}

test('validated V84 identity owns J1 and its snapshot without changing the four catalogue Marines', () => withRuntime(make => {
  const source = structuredClone(MANIFEST_CREW);
  const before = structuredClone(source);
  const { engine } = make({ playerIdentityV84: IDENTITY, crew: source });
  assert.equal(engine.player.operatorId, 'player-echo9');
  assert.equal(engine.player.name, IDENTITY.name);
  assert.equal(engine.player.callsign, 'ECHO-9');
  assert.deepEqual(crewIds(engine.squadActors), MANIFEST_CREW.map(member => member.id));
  assert.equal(engine.squadActors.length, 4);
  assert.equal(engine.activeSquadActors().length, 4);
  assert.equal(engine.squadActors[0].name, 'Mara Vega');
  assert.deepEqual(source, before);
  assert.equal(new Set([engine.player.operatorId, ...crewIds(engine.activeSquadActors())]).size, 5);
  const snapshot = engine.getSnapshot();
  assert.deepEqual(snapshot.playerIdentityV84, IDENTITY);
  assert.equal(snapshot.player.operatorId, IDENTITY.id);
  assert.equal(snapshot.player.name, IDENTITY.name);
  assert.equal(snapshot.player.callsign, IDENTITY.callsign);
  assert.equal(engine.player.visualSheetId, PLAYER_VISUAL_CONTRACT_V81.fallback.sheetId, 'identity does not replace Echo-9 art with Mara art');
  snapshot.playerIdentityV84.name = 'Snapshot changed';
  assert.equal(engine.playerIdentityV84.name, IDENTITY.name);
}));

test('identity is normalized, copied and ignores injected IDs, visual sheets and combat statistics', () => withRuntime(make => {
  const candidate = { id: MANIFEST_CREW[0].id, name: '  Alex   Navarro ', callsign: 'echo-9',
    health: 9999, armor: 9999, damage: 9999, visualSheetId: 'npc:mara', specialty: 'command' };
  const { engine } = make({ playerIdentityV84: candidate, crew: [] });
  const { engine: legacy } = make({ crew: [] });
  assert.deepEqual(engine.playerIdentityV84, IDENTITY);
  assert.equal(Object.isFrozen(engine.playerIdentityV84), true);
  candidate.name = 'Changed Later';
  assert.equal(engine.player.name, 'Alex Navarro');
  for (const key of ['health', 'maxHealth', 'armor', 'maxArmor', 'ammo', 'ammoReserve', 'speed']) {
    assert.equal(engine.player[key], legacy.player[key], 'no identity-created statistic: ' + key);
  }
  assert.equal(engine.player.visualSheetId, legacy.player.visualSheetId);
}));

for (const candidate of [undefined, null, {}, { name: 'Mara Vega', callsign: 'ECHO' },
  { name: '<script>', callsign: 'ECHO' }, { name: 'Alex Navarro', callsign: '' }]) {
  test('legacy rules are retained for missing or invalid identity: ' + JSON.stringify(candidate), () => withRuntime(make => {
    const { engine } = make({ playerIdentityV84: candidate });
    assert.equal(engine.playerIdentityV84, null);
    assert.equal(engine.player.operatorId, MANIFEST_CREW[0].id);
    assert.equal(engine.coop.operatorId, MANIFEST_CREW[1].id);
    assert.deepEqual(crewIds(engine.squadActors), MANIFEST_CREW.slice(1).map(member => member.id));
    assert.equal(engine.squadActors.length, 3);
    assert.equal(engine.getSnapshot().playerIdentityV84, null);
  }));
}

test('V84 coop replaces its original second-Marine counterpart, transferring state without a fifth ally', () => withRuntime(make => {
  const { engine } = make({ playerIdentityV84: IDENTITY });
  const counterpart = engine.squadActors.find(member => member.crewId === MANIFEST_CREW[1].id);
  assert.equal(engine.coop.operatorId, counterpart.crewId);
  Object.assign(counterpart, { x: 1600, y: 650, health: 23, armor: 4, kills: 3 });
  engine.setCoop(true);
  assert.equal(engine.activeSquadActors().length, 3);
  assert.ok(engine.activeSquadActors().some(member => member.crewId === MANIFEST_CREW[0].id));
  assert.ok(!engine.activeSquadActors().includes(counterpart));
  assert.deepEqual([engine.coop.x, engine.coop.y, engine.coop.health, engine.coop.armor, engine.coop.kills], [1600, 650, 23, 4, 3]);
  assert.equal(new Set([engine.player.operatorId, engine.coop.operatorId, ...crewIds(engine.activeSquadActors())]).size, 5);
  Object.assign(engine.coop, { x: 1750, health: 19, kills: 4 });
  engine.setCoop(false);
  assert.equal(engine.activeSquadActors().length, 4);
  assert.deepEqual([counterpart.x, counterpart.health, counterpart.kills], [1750, 19, 4]);
  assert.equal(engine.player.operatorId, IDENTITY.id);
  assert.equal(engine.player.name, IDENTITY.name);
}));

test('mission resume restores all four allies and keeps the deployment identity authoritative', () => withRuntime(make => {
  const { engine, options } = make({ playerIdentityV84: IDENTITY });
  engine.squadActors.forEach((member, index) => { member.health = 71 - index * 9; });
  engine.player.health = 61;
  const resumeState = engine.captureResumeState();
  assert.equal(resumeState.squad.members.length, 4);
  resumeState.player.operatorId = MANIFEST_CREW[0].id;
  resumeState.player.name = 'Mara Vega';
  resumeState.player.callsign = 'FORGED';
  const { engine: resumed } = make({ ...options, resumeState: sanitizeOperationResumeState(resumeState) });
  assert.equal(resumed.lastResumeResult.applied, true);
  assert.equal(resumed.player.operatorId, IDENTITY.id);
  assert.equal(resumed.player.name, IDENTITY.name);
  assert.equal(resumed.player.callsign, IDENTITY.callsign);
  assert.equal(resumed.player.health, 61);
  assert.deepEqual(resumed.squadActors.map(member => member.health), [71, 62, 53, 44]);
}));

test('reusing an engine cannot leak a previous V84 profile name into another identity or legacy run', () => withRuntime(make => {
  const { engine, options } = make({ playerIdentityV84: IDENTITY });
  const second = validatePlayerIdentityV84({ name: 'Sam Renaud', callsign: 'BRAVO-8' }).identity;
  engine.start({ ...options, playerIdentityV84: second });
  assert.equal(engine.player.name, second.name);
  assert.equal(engine.player.callsign, second.callsign);
  engine.start({ ...options, playerIdentityV84: null });
  assert.equal(engine.playerIdentityV84, null);
  assert.equal(engine.player.operatorId, MANIFEST_CREW[0].id);
  assert.equal(engine.player.name, undefined);
  assert.equal(engine.player.callsign, undefined);
  assert.equal(engine.squadActors.length, 3);
}));

test('V84 Alpha/Bravo keeps exactly the four Marines in two pairs, with a fifth independent commander', () => withRuntime(make => {
  const { engine } = make({ playerIdentityV84: IDENTITY, campaign: ALPHA_BRAVO_CAMPAIGN_V69 });
  const expected = MANIFEST_CREW.map(member => member.id);
  assert.deepEqual(engine.alphaBravoCrewIdsV69(), expected);
  assert.deepEqual(engine.alphaBravoV69.teams.alpha.memberIds, expected.slice(0, 2));
  assert.deepEqual(engine.alphaBravoV69.teams.bravo.memberIds, expected.slice(2));
  assert.equal(engine.alphaBravoAllActorsV69().length, 5);
  assert.equal(engine.alphaBravoTeamForActorV69(engine.player), null);
  assert.equal(engine.alphaBravoTeamActorsV69('alpha').length, 2);
  assert.equal(engine.alphaBravoTeamActorsV69('bravo').length, 2);
  const ui = engine.getAlphaBravoUiStateV69();
  assert.equal(ui.commanderV84.id, IDENTITY.id);
  assert.equal(ui.commanderV84.countsTowardCertification, false);
  assert.equal(engine.alphaBravoIncomingDamageScaleV69(engine.player), 1, 'no invented team modifier for independent commander');
  engine.setCoop(true);
  assert.equal(engine.alphaBravoAllActorsV69().length, 5);
  assert.equal(engine.alphaBravoActorForCrewIdV69(expected[1]), engine.coop);
  assert.equal(engine.alphaBravoTeamForActorV69(engine.coop), 'alpha');
  assert.deepEqual(engine.alphaBravoCrewIdsV69(), expected);
}));

test('legacy Alpha/Bravo still has four physical operators including J1 and the original two pairs', () => withRuntime(make => {
  const { engine } = make({ campaign: ALPHA_BRAVO_CAMPAIGN_V69 });
  const expected = MANIFEST_CREW.map(member => member.id);
  assert.deepEqual(engine.alphaBravoCrewIdsV69(), expected);
  assert.equal(engine.alphaBravoAllActorsV69().length, 4);
  assert.equal(engine.alphaBravoTeamForActorV69(engine.player), 'alpha');
  assert.equal(engine.getAlphaBravoUiStateV69().commanderV84, undefined);
}));

test('commander console action respects selected team and never replaces a missing Marine at a task', () => withRuntime(make => {
  const { engine, events } = make({ playerIdentityV84: IDENTITY, campaign: ALPHA_BRAVO_CAMPAIGN_V69 });
  const task = engine.alphaBravoTaskStateV69('alpha-relay');
  const station = engine.alphaBravoStationV69(task.id);
  putAtStation(engine.player, station);
  engine.selectAlphaBravoFireteamV69('bravo');
  assert.equal(engine.interact(engine.player), false);
  assert.match(engine.getInteractionPrompt(engine.player), /SÉLECTIONNEZ LE BINÔME ALPHA/);
  assert.equal(task.reservedBy, null);
  engine.selectAlphaBravoFireteamV69('alpha');
  assert.equal(engine.interact(engine.player), true);
  assert.equal(task.reservedBy, 'alpha');
  assert.equal(engine.alphaBravoV69.teams.alpha.order, 'focus');
  assert.ok(events.some(event => event.type === 'fireteam-order' && event.issuedBy === IDENTITY.id));
  const [first, second] = engine.alphaBravoTeamActorsV69('alpha');
  putAtStation(first, station, -35);
  second.x = station.x + 1000;
  assert.equal(engine.alphaBravoTaskReadyActorsV69(task).length, 0);
  for (let index = 0; index < 20; index += 1) engine.updateAlphaBravoTasksV69(0.1);
  assert.equal(task.progress, 0, 'J1 plus one Marine is not the two-Marine pair');
  putAtStation(second, station, 35);
  engine.player.x = station.x + 1000;
  engine.updateAlphaBravoTasksV69(0.1);
  assert.ok(task.progress > 0, 'the two actual Marines work without the commander occupying their station');
}));

test('commander selected-group orders and pings drive actual squad movement without changing roster', () => withRuntime(make => {
  const { engine } = make({ playerIdentityV84: IDENTITY, campaign: ALPHA_BRAVO_CAMPAIGN_V69 });
  engine.selectAlphaBravoFireteamV69('alpha');
  assert.equal(engine.issueAlphaBravoOrderV69('hold'), true);
  assert.equal(engine.alphaBravoV69.teams.alpha.order, 'hold');
  assert.equal(engine.alphaBravoV69.teams.bravo.order, 'follow');
  engine.selectAlphaBravoFireteamV69('all');
  const pings = engine.placeAlphaBravoPingV69({ x: 2400, y: 930 });
  assert.equal(pings.length, 2);
  assert.equal(engine.issueAlphaBravoOrderV69('move'), true);
  const member = engine.alphaBravoTeamActorsV69('bravo')[0];
  Object.assign(member, { x: 1000, y: 838, vx: 0, vy: 0, grounded: true, inVehicle: false });
  const before = member.x;
  engine.updateSquadMovement(member, 0, engine.player, 0.05);
  assert.ok(member.x > before, 'real AI movement follows the selected-group order');
  assert.equal(engine.squadActors.length, 4);
}));

for (const coopEnabled of [false, true]) test('V84 Alpha/Bravo certificate contains all four manifested Marines and is accepted by the real save resolver; coop=' + coopEnabled, () => withRuntime(make => {
  const save = createDefaultSave(1);
  const campaign = CAMPAIGNS.find(entry => entry.id === ALPHA_BRAVO_CAMPAIGN_V69.id);
  const world = WORLDS.find(entry => entry.id === campaign.worldId);
  if (!save.galaxy.unlockedWorldIds.includes(world.id)) save.galaxy.unlockedWorldIds.push(world.id);
  const previousFatigue = new Map(save.crew.map(member => [member.id, member.fatigue]));
  const { operation } = beginOperation(save, campaign, world);
  const crew = operation.crewIds.map(id => ({ ...CREW.find(member => member.id === id), ...save.crew.find(member => member.id === id) }));
  assert.equal(crew.length, 4);
  for (const member of crew) assert.ok(member.fatigue > previousFatigue.get(member.id), 'only genuinely present manifested Marine receives deployment fatigue');
  const { engine, events, options } = make({ playerIdentityV84: IDENTITY, campaign, world, crew, strategicBriefing: operation });
  engine.setCoop(coopEnabled);
  assert.deepEqual(crewIds(engine.squadActors), operation.crewIds);
  for (const taskId of ['alpha-relay', 'bravo-perimeter', 'joint-certification']) {
    const task = engine.alphaBravoTaskStateV69(taskId);
    const station = engine.alphaBravoStationV69(taskId);
    engine.selectAlphaBravoFireteamV69('all');
    putAtStation(engine.player, station);
    assert.equal(engine.interact(engine.player), true);
    const teams = task.fireteamId === 'joint' ? ['alpha', 'bravo'] : [task.fireteamId];
    teams.flatMap(teamId => engine.alphaBravoTeamActorsV69(teamId)).forEach((actor, index) => putAtStation(actor, station, (index - 1.5) * 34));
    for (let tick = 0; tick < 600 && !task.complete; tick += 1) {
      engine.mission.elapsed += 0.1;
      engine.updateAlphaBravoTasksV69(0.1);
    }
    assert.equal(task.complete, true, taskId + ' completed through real readiness and elapsed-time mechanics');
  }
  assert.equal(engine.alphaBravoV69.certified, true);
  assert.equal(engine.missingAlphaBravoRequirementV69(), null);
  assert.equal(events.filter(event => event.type === 'fireteam-certified').length, 1);
  const payload = engine.buildAlphaBravoResolutionPayloadV69();
  assert.deepEqual(payload.crewResults.map(result => result.crewId), operation.crewIds);
  assert.ok(!payload.crewResults.some(result => result.crewId === IDENTITY.id));
  assert.equal(payload.crewResults.length, 4);
  const resumeState = sanitizeOperationResumeState(engine.captureResumeState(), { operation });
  assert.equal(resumeState.squad.members.length, 4, 'the save sanitizer retains the fourth manifested ally');
  const { engine: resumed } = make({ ...options, resumeState });
  assert.equal(resumed.lastResumeResult.applied, true);
  assert.equal(resumed.alphaBravoV69.certified, true);
  assert.deepEqual(resumed.alphaBravoCrewIdsV69(), operation.crewIds);
  assert.equal(resumed.alphaBravoAllActorsV69().length, 5);
  assert.equal(resumed.coopEnabled, coopEnabled);
  assert.equal(resumed.player.name, IDENTITY.name);
  const result = resolveOperation(save, { success: true, rewards: { alphaBravoDoctrine: payload } });
  assert.equal(result.ok, true);
  assert.equal(result.success, true, 'existing four-Marine certification validator accepts the real runtime payload');
  assert.equal(save.alphaBravoDoctrine.runs.length, 1);
  assert.equal(save.alphaBravoDoctrine.runs[0].crewResults.length, 4);
  assert.equal(resolveOperation(save, { success: true, rewards: { alphaBravoDoctrine: payload } }).ok, false, 'certificate is not paid twice');
}));
