import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import {
  getAnimationEntityKeyV57,
  resolveIdentitySafeNpcAnimationV57,
  resolveIdentitySafePlayerAnimationV57
} from '../src/game-v52-runtime.js';
import {
  SPRITE_SHEETS,
  enforceHumanoidAnimationIdentity
} from '../src/sprite-animation-runtime.js';
import {
  CAMPAIGNS,
  CREW,
  ENEMIES,
  EQUIPMENT,
  LEVEL_SEEDS,
  NEURO_XENO_PROFILES,
  VEHICLES,
  WEAPONS,
  WORLDS
} from '../src/content.js';

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1024;
    this.naturalHeight = 1024;
  }

  set src(value) { this.currentSrc = value; }
}

function withBrowserMocks(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try { return run(); } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
}

function missionOptions(overrides = {}) {
  const world = WORLDS[0];
  const campaign = { ...CAMPAIGNS[0], id: 'v57-animation-identity', worldId: world.id };
  const levelSeed = {
    ...LEVEL_SEEDS.find((entry) => entry.worldId === world.id),
    id: 'v57-animation-identity-level',
    worldId: world.id,
    objective: campaign.objective,
    seed: 570057
  };
  return {
    seed: levelSeed.seed,
    campaign,
    world,
    levelSeed,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES,
    vehicle: VEHICLES.find((entry) => entry.family === 'ground') || VEHICLES[0],
    equipment: EQUIPMENT.slice(0, 8),
    crew: CREW,
    difficulty: 'standard',
    ...overrides
  };
}

const assertFamily = (request, family) => {
  assert.ok(request, 'une requête animée est attendue');
  assert.equal(SPRITE_SHEETS[request.sheetId]?.family, family, `${request.sheetId} doit rester dans la famille ${family}`);
};

test('joueur marine et plusieurs membres d équipage gardent leur identité en locomotion combat blessure et mort', () => {
  const playerBase = { alive: true, grounded: true, visualForm: 'marine', playerClass: 'marine', vx: 0 };
  for (const state of [
    { grounded: false },
    { v52FireClock: 0.4 },
    { v52HurtClock: 0.4 },
    { alive: false }
  ]) assertFamily(resolveIdentitySafePlayerAnimationV57({ ...playerBase, ...state }, false), 'player');

  for (const [crewId, slug] of [
    ['crew-01-mara-vega', 'mara-vega'],
    ['crew-03-idris-kwan', 'idris-kwan'],
    ['crew-04-noor-okafor', 'noor-okafor']
  ]) {
    const base = { crewId, alive: true, grounded: true, vx: 0 };
    for (const state of [
      { grounded: false },
      { fireClock: 0.4 },
      { v52HurtClock: 0.4 },
      { alive: false }
    ]) {
      const request = resolveIdentitySafeNpcAnimationV57({ ...base, ...state });
      assertFamily(request, 'npc');
      assert.match(request.sheetId, new RegExp(`^npc[.]${slug}[.]`));
      assert.doesNotMatch(request.sheetId, /^enemy[.]/);
    }
  }
});

test('le garde-fou rejette toute plaque ennemie injectée sur un marine ou un PNJ', () => {
  const enemyRequest = { sheetId: 'enemy.xenomorph-drone.combat', clipId: 'hurt-death' };
  const marine = { alive: false, grounded: true, visualForm: 'marine', playerClass: 'marine' };
  const crew = { crewId: 'crew-03-idris-kwan', alive: false, grounded: true };

  const protectedPlayer = enforceHumanoidAnimationIdentity(marine, enemyRequest, { role: 'player', neuroActive: false });
  const protectedCrew = enforceHumanoidAnimationIdentity(crew, enemyRequest, { role: 'npc', neuroActive: false });
  assertFamily(protectedPlayer, 'player');
  assertFamily(protectedCrew, 'npc');
  assert.match(protectedCrew.sheetId, /^npc[.]idris-kwan[.]/);

  const explicitNeuroXeno = { ...marine, visualForm: 'xenomorph', playerClass: 'neuro-xeno' };
  assert.deepEqual(
    enforceHumanoidAnimationIdentity(explicitNeuroXeno, enemyRequest, { role: 'player', neuroActive: true }),
    enemyRequest,
    'sans contrat catalogue, la forme Neuro-Xéno explicite conserve le fallback Drone'
  );

  const contractedFacehugger = {
    ...explicitNeuroXeno,
    neuroVisualContract: { profileId: 'neuro-002', enemyId: 'enemy-002-facehugger', sheetId: 'enemy.facehugger.locomotion' }
  };
  assert.equal(
    enforceHumanoidAnimationIdentity(contractedFacehugger, enemyRequest, { role: 'player', neuroActive: true }),
    null,
    'un contrat Facehugger refuse explicitement la plaque Drone'
  );
  const facehuggerRequest = { sheetId: 'enemy.facehugger.locomotion', clipId: 'hurt-death' };
  assert.deepEqual(
    enforceHumanoidAnimationIdentity(contractedFacehugger, facehuggerRequest, { role: 'player', neuroActive: true }),
    facehuggerRequest
  );
});

test('neuro-002 dérive le Facehugger exact et marine standard ne reçoit aucune famille ennemie', () => withBrowserMocks(() => {
  const profile = NEURO_XENO_PROFILES.find((entry) => entry.id === 'neuro-002');
  assert.ok(profile?.playerClassCompatible);
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  const neuroEngine = new GameEngine(canvas, { onEvent: () => {} });
  neuroEngine.start(missionOptions({ neuroProfile: profile }));
  const contract = neuroEngine.player.neuroVisualContract;
  assert.deepEqual(
    { profileId: contract?.profileId, enemyId: contract?.enemyId, spriteKey: contract?.spriteKey, sheetId: contract?.sheetId, exact: contract?.exact },
    { profileId: 'neuro-002', enemyId: 'enemy-002-facehugger', spriteKey: 'facehugger', sheetId: 'enemy.facehugger.locomotion', exact: true }
  );

  const baseState = { alive: true, grounded: true, vx: 0, fireClock: 0, actionClock: 0, v52FireClock: 0, v52HurtClock: 0 };
  for (const [state, clipId] of [
    [{}, 'idle'],
    [{ vx: 60 }, 'scuttle'],
    [{ fireClock: 0.4 }, 'leap-attach'],
    [{ v52HurtClock: 0.4 }, 'hurt-death'],
    [{ alive: false }, 'hurt-death']
  ]) {
    Object.assign(neuroEngine.player, baseState, state);
    const request = resolveIdentitySafePlayerAnimationV57(neuroEngine.player, true);
    assert.deepEqual({ sheetId: request?.sheetId, clipId: request?.clipId }, { sheetId: contract.sheetId, clipId });
  }
  Object.assign(neuroEngine.player, baseState, { v52HurtClock: 0.4 });
  neuroEngine.updateSpriteAnimationEvents();
  const neuroSnapshot = neuroEngine.getSnapshot();
  const neuroKey = getAnimationEntityKeyV57('player', neuroEngine.player, 'primary');
  assert.equal(neuroSnapshot.animationRuntime.activeClips[neuroKey], 'enemy.facehugger.locomotion:hurt-death');
  assert.equal(neuroSnapshot.animationRuntime.neuroPlayerContract.sheetId, 'enemy.facehugger.locomotion');

  const marineEngine = new GameEngine(canvas, { onEvent: () => {} });
  marineEngine.start(missionOptions({ neuroProfile: null }));
  Object.assign(marineEngine.player, { alive: true, grounded: false, visualForm: 'marine', playerClass: 'marine' });
  marineEngine.updateSpriteAnimationEvents();
  const marineSnapshot = marineEngine.getSnapshot();
  const marineKey = getAnimationEntityKeyV57('player', marineEngine.player, 'primary');
  assert.equal(marineSnapshot.animationRuntime.neuroPlayerContract, null);
  assert.match(marineSnapshot.animationRuntime.activeClips[marineKey], /^player[.]echo9-marine[.]/);
}));

test('la télémétrie sépare le rôle joueur du crewId et ne contamine jamais les slots NPC', () => withBrowserMocks(() => {
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  const engine = new GameEngine(canvas, { onEvent: () => {} });
  engine.start(missionOptions());
  const crew03 = engine.squadActors.find((member) => member.crewId === 'crew-03-idris-kwan');
  const crew04 = engine.squadActors.find((member) => member.crewId === 'crew-04-noor-okafor');
  assert.ok(crew03 && crew04);

  Object.assign(engine.player, { visualForm: 'marine', playerClass: 'marine', alive: true, grounded: false, v52FireClock: 0, v52HurtClock: 0 });
  Object.assign(crew03, { alive: false, downed: false, grounded: true, fireClock: 0, v52HurtClock: 0 });
  Object.assign(crew04, { alive: true, grounded: true, fireClock: 0.5, v52HurtClock: 0 });
  engine.neuro.active = false;
  engine.updateSpriteAnimationEvents();

  const playerKey = getAnimationEntityKeyV57('player', engine.player, 'primary');
  const crew03Key = getAnimationEntityKeyV57('npc', crew03, 'crew');
  const crew04Key = getAnimationEntityKeyV57('npc', crew04, 'crew');
  let clips = engine.getSnapshot().animationRuntime.activeClips;
  assert.match(clips[playerKey], /^player[.]echo9-marine[.]/);
  assert.match(clips[crew03Key], /^npc[.]idris-kwan[.]mission:dead$/);
  assert.match(clips[crew04Key], /^npc[.]noor-okafor[.]mission:fire$/);
  assert.equal(clips[engine.player.operatorId], undefined, 'le crewId brut ne représente plus le joueur');

  Object.assign(engine.player, { visualForm: 'xenomorph', playerClass: 'neuro-xeno', alive: true, grounded: true, v52HurtClock: 0.5 });
  engine.neuro.active = true;
  engine.updateSpriteAnimationEvents();
  clips = engine.getSnapshot().animationRuntime.activeClips;
  assert.equal(clips[playerKey], 'enemy.xenomorph-drone.combat:hurt-death');
  assert.doesNotMatch(clips[crew03Key], /^enemy[.]/);
  assert.doesNotMatch(clips[crew04Key], /^enemy[.]/);
}));
