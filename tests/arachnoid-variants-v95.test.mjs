import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { auditPngBufferV95 } from '../docs/references/v95-user-creatures/audit-pngs-v95.mjs';
import { ARACHNOID_PROFILE_ID_V95 as ID, ENEMY_HISTORICAL_VARIANTS_V95 } from '../src/enemy-historical-variants-v95.js';
import { ENEMY_STATIC_POSES_V94 } from '../src/enemy-static-poses-v94.js';
import { ENEMY_STATIC_POSES_V95, ENEMY_STATIC_POSE_PATHS_V95, getEnemyStaticPoseV95,
  getEnemyStaticPoseStatesV95, getEnemyStaticPoseStateOptionsV95, getEnemyStaticPoseDefaultStateV95, getEnemyStaticPoseBaseStateLabelV95,
  sanitizeEnemyStaticPoseStateV95, selectEnemyStaticPoseEncounterStateV95 } from '../src/enemy-static-poses-v95.js';
import { createUserCasteActorV87, drawUserCastePoseV87 } from '../src/enemy-user-pose-runtime-v87.js';
import { createBioforgeV80, startBioforgeSessionV80, sanitizeBioforgeV80,
  validateBioforgeCompositionV87, buildBioforgePrintQueueV80 } from '../src/bioforge-session-v80.js';
import { captureBioforgePhysicalV87, restoreBioforgeEnemyPhysicalV87 } from '../src/bioforge-physical-state-v87.js';
import { ENEMY_ENCYCLOPEDIA_CATALOG_V88, ENEMY_USER_CAMPAIGN_V88, getEnemyUserCampaignV88,
  selectUserCasteEncountersV88, sanitizeUserCasteCampaignV88, userCasteStaticVisualV88 } from '../src/enemy-user-campaign-v88.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { BioforgeRuntimeV80 } from '../src/bioforge-runtime-v80.js';
import { WORLDS, CAMPAIGNS, ENEMIES, LEVEL_SEEDS, WEAPONS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';

const base = getEnemyStaticPoseV95(ID), states = getEnemyStaticPoseStatesV95(ID);
const noop = () => {};
globalThis.addEventListener = noop;
globalThis.requestAnimationFrame = () => 1;
globalThis.Image = class {
  complete = true; naturalWidth = 1536; naturalHeight = 1024;
  set src(path) { this.currentSrc = path; const d = ENEMY_STATIC_POSES_V95.flatMap(d => [d, ...getEnemyStaticPoseStatesV95(d.id)]).find(d => d.path === path);
    if (d) { this.naturalWidth = d.sourceWidth; this.naturalHeight = d.sourceHeight; }
    queueMicrotask(() => this.onload?.()); }
  get src() { return this.currentSrc; }
};
function fixture() {
  const draws = [], events = [];
  const ctx = new Proxy({ drawImage: (...args) => draws.push(args), measureText: text => ({ width: String(text).length * 8 }) }, { get: (target, key) => target[key] ?? noop });
  const engine = new GameEngine({ width: 1280, height: 720, getContext: () => ctx, addEventListener: noop, focus: noop }, { onEvent: event => events.push(event) });
  return { engine, ctx, draws, events };
}
function missionOptions(stateId) {
  const entry = getEnemyUserCampaignV88(ID), world = WORLDS.find(w => w.id === entry.encounterWorldIds[0]);
  const campaign = CAMPAIGNS.find(c => c.worldId === world.id && !/survival|prologue/i.test(c.id));
  const plan = buildMissionLevelV52({ world, campaign, levelSeeds: LEVEL_SEEDS, templateId: 'colony-multiroute', variant: 0 });
  const options = { userCasteCampaignV88: true, world, campaign, enemyCatalog: ENEMIES, weapon: WEAPONS[0],
    difficulty: 'standard', operationId: 'operation-0-arachnoid-test', missionLevel: plan };
  for (let seed = 0; seed < ENEMY_USER_CAMPAIGN_V88.length * 4; seed++) {
    const candidate = { ...options, seed, levelSeed: { ...plan.levelSeed, seed } };
    if (selectUserCasteEncountersV88(candidate).some(d => d.id === ID)
      && selectEnemyStaticPoseEncounterStateV95(ID, candidate) === stateId) return candidate;
  }
  assert.fail('Each colour must be reachable by normal contextual selection');
}

test('Grey and Purple are overlay states of one unchanged historical identity, never Defender', () => {
  assert.equal(base, ENEMY_STATIC_POSES_V94.find(d => d.id === ID));
  assert.equal(ENEMY_STATIC_POSES_V95.filter(d => d.id === ID).length, 1);
  assert.equal(ENEMY_ENCYCLOPEDIA_CATALOG_V88.filter(d => d.id === ID).length, 1);
  assert.deepEqual(states.map(s => s.stateId), ['grey', 'purple']);
  assert.deepEqual(getEnemyStaticPoseStateOptionsV95(ID).map(s => s.id), ['grey', 'purple']);
  assert.equal(getEnemyStaticPoseDefaultStateV95(ID), 'grey');
  assert.equal(ENEMY_HISTORICAL_VARIANTS_V95[ID].reference.canonExact, false);
  for (const state of states) {
    const d = getEnemyStaticPoseV95(ID, state.stateId);
    for (const key of ['id','profileId','health','damage','speed','armor','cost','bodyWidth','bodyHeight','renderWidth','renderHeight','pivot','biology','combatRole','animationStatus']) assert.equal(d[key], base[key], key);
    assert.notEqual(d.path, getEnemyStaticPoseV95('pose-v95-user-xeno-defender').path);
    assert.equal(sanitizeEnemyStaticPoseStateV95(ID, state.stateId), state.stateId);
    assert.equal(sanitizeEnemyStaticPoseStateV95('pose-v95-user-xeno-defender', state.stateId), null);
  }
  for (const bad of ['Purple','../purple.png','__proto__',{},null]) assert.equal(sanitizeEnemyStaticPoseStateV95(ID,bad),null);
  assert.equal(getEnemyStaticPoseV95(ID,'foreign'),base);
  assert.notEqual(getEnemyStaticPoseV95(ID,'grey').path,getEnemyStaticPoseV95(ID,'purple').path);
});

for (const state of states) test(`Arachnoid ${state.stateId}: real native alpha, immutable SHA and original geometry`, async () => {
  const report = auditPngBufferV95(await readFile(new URL('..' + state.path, import.meta.url)));
  assert.equal(report.sha256,state.sha256); assert.deepEqual([report.width,report.height],[1536,1024]);
  assert.deepEqual(report.alphaBounds,state.alphaBounds);
  assert.ok(report.transparentFraction > .70 && report.meanBodyAlphaAtLeast128 > 249);
  assert.ok(Object.values(report.marginsAlphaAtLeast16).every(n => n > 0));
  assert.ok(ENEMY_STATIC_POSE_PATHS_V95.includes(state.path));
  assert.equal(userCasteStaticVisualV88(ID,state.stateId).path,state.path);
  const actor = createUserCasteActorV87({ id:'test',profileId:ID,visualStateV95:state.stateId },620);
  const calls = [], ctx = Object.fromEntries(['save','restore','translate','scale','drawImage'].map(k => [k,(...args)=>calls.push([k,...args])]));
  const image = { complete:true,naturalWidth:1536,naturalHeight:1024 };
  for (const facing of [-1,1]) {
    calls.length=0; actor.facing=facing; assert.equal(drawUserCastePoseV87(ctx,actor,image),true);
    assert.deepEqual(calls.find(c=>c[0]==='scale'),['scale',facing,1]);
    assert.deepEqual(calls.find(c=>c[0]==='drawImage').slice(2),[-base.pivot.x*base.renderWidth,-base.pivot.y*base.renderHeight,base.renderWidth,base.renderHeight]);
  }
});

for (const state of states) test(`Arachnoid ${state.stateId}: Bioforge selection, print queue and physical resume persist colour`, () => {
  const selection = { composition:[{lineId:'one',profileId:ID,quantity:1,visualStateV95:state.stateId}],maxConcurrent:1 };
  assert.equal(validateBioforgeCompositionV87(selection).composition[0].visualStateV95,state.stateId);
  const queue = buildBioforgePrintQueueV80({sessionId:'bioforge-v80-s000000001',...selection});
  const started = startBioforgeSessionV80(createBioforgeV80(),selection,{now:100});
  assert.equal(sanitizeBioforgeV80(JSON.parse(JSON.stringify(started.state))).activeSession.queue[0].visualStateV95,state.stateId);
  const actor = createUserCasteActorV87(queue[0],620); actor.x=1700; actor.health=91;
  const player = {x:1350,y:528,w:42,h:92,vx:0,vy:0,facing:1,health:100,maxHealth:100,armor:0,maxArmor:100,ammo:3,ammoReserve:9,magazineSize:12,weaponMode:'sidearm',alive:true,grounded:true};
  const captured = captureBioforgePhysicalV87({player,enemies:[actor],inventory:{}});
  assert.equal(captured.enemies[0].visualStateV95,state.stateId);
  const restored = createUserCasteActorV87({...queue[0],visualStateV95:state.stateId==='grey'?'purple':'grey'},620);
  restoreBioforgeEnemyPhysicalV87(restored,captured.enemies[0]);
  assert.equal(restored.profileId,ID); assert.equal(restored.health,91);
  assert.equal(restored.visualStateV95,state.stateId); assert.equal(restored.visualImageKey,state.imageKey);
});

for (const state of states) test(`Arachnoid ${state.stateId}: normal campaign spawn, native drawing and save/restart preserve one parent`, () => {
  const options=missionOptions(state.stateId), f=fixture(); f.engine.start(options);
  const actor=f.engine.enemies.find(e=>e.profileId===ID); assert.ok(actor);
  assert.equal(actor.visualStateV95,state.stateId); assert.equal(actor.visualImageKey,state.imageKey);
  assert.ok(f.engine.userCasteCampaignV88.entries.length<=2);
  actor.health=85; f.engine.drawEnemy(f.ctx,actor);
  assert.ok(f.draws.some(args=>args[0]?.src===state.path && args.length===5));
  const snapshot=JSON.parse(JSON.stringify(f.engine.captureResumeState()));
  assert.equal(sanitizeUserCasteCampaignV88(snapshot.userCasteCampaignV88).entries.find(e=>e.profileId===ID).visualStateV95,state.stateId);
  const resumed=fixture(); resumed.engine.start({...options,resumeState:snapshot});
  const next=resumed.engine.enemies.find(e=>e.profileId===ID);
  assert.equal(next.visualStateV95,state.stateId); assert.equal(next.visualImageKey,state.imageKey); assert.equal(next.health,85);
  assert.equal(next.w,base.bodyWidth); assert.equal(next.h,base.bodyHeight);
  assert.equal(resumed.engine.enemies.length,f.engine.enemies.length);
  assert.equal(f.events.filter(e=>e.type==='enemy-discovered-v88'&&e.profileId===ID).length,1);
});

test('legacy campaign receipt with no colour stays Grey; unknown colour cannot inject a path', () => {
  const options=missionOptions('purple'), f=fixture(); f.engine.start(options);
  const snapshot=JSON.parse(JSON.stringify(f.engine.captureResumeState()));
  delete snapshot.userCasteCampaignV88.entries.find(e=>e.profileId===ID).visualStateV95;
  delete snapshot.enemies.find(e=>e.profileId===ID).visualStateV95;
  const resumed=fixture(); resumed.engine.start({...options,resumeState:snapshot});
  assert.equal(resumed.engine.enemies.find(e=>e.profileId===ID).visualImageKey,base.imageKey);
  const raw={schema:88,worldId:options.world.id,entries:[{profileId:ID,slot:1,visualStateV95:'foreign',path:'/fake.png',health:999999}]};
  assert.deepEqual(sanitizeUserCasteCampaignV88(raw).entries,[{profileId:ID,slot:1}]);
  assert.equal(selectEnemyStaticPoseEncounterStateV95('pose-v95-user-xeno-defender',options),null);
});

test('colour selection is total for corrupt or excessive numeric save values', () => {
  for (const seed of [NaN,Infinity,-Infinity,Number.MAX_VALUE,Number.MAX_SAFE_INTEGER,-Number.MAX_SAFE_INTEGER,'bad']) {
    for (const ordinal of ['9'.repeat(400),String(Number.MAX_SAFE_INTEGER),'invalid']) {
      assert.ok(['grey','purple'].includes(selectEnemyStaticPoseEncounterStateV95(ID,{seed,operationId:`operation-${ordinal}-test`})));
    }
  }
});

for (const [profileId,label,descriptiveId] of [
  ['pose-v95-user-xeno-carrier','Chargé','full'],
  ['pose-v95-user-xeno-big-xeno-1','Pose 1','pose-1']
]) test(`${profileId}: a single admitted base keeps its label and saved image without an invented alternate state`, () => {
  const definition=getEnemyStaticPoseV95(profileId);
  assert.equal(definition.defaultStateId,descriptiveId);
  assert.equal(getEnemyStaticPoseDefaultStateV95(profileId),null, 'Only real overlay choices require a non-null default');
  assert.equal(getEnemyStaticPoseBaseStateLabelV95(profileId),label);
  assert.deepEqual(getEnemyStaticPoseStateOptionsV95(profileId),[{id:'',label}]);
  assert.deepEqual(getEnemyStaticPoseStatesV95(profileId),[]);
  const selection={composition:[{lineId:'single',profileId,quantity:1,visualStateV95:descriptiveId}],maxConcurrent:1};
  const started=startBioforgeSessionV80(createBioforgeV80(),selection,{now:100});
  const saved=sanitizeBioforgeV80(JSON.parse(JSON.stringify(started.state)));
  const entry=saved.activeSession.queue[0];
  assert.equal(entry.visualStateV95,undefined, 'Unknown state is absent; the admitted base is still authoritative');
  const actor=createUserCasteActorV87(entry,620);
  assert.equal(actor.profileId,profileId); assert.equal(actor.visualImageKey,definition.imageKey);
  assert.equal(getEnemyStaticPoseV95(profileId,descriptiveId),definition);
  assert.equal(userCasteStaticVisualV88(profileId,entry.visualStateV95).path,definition.path);
});

for (const state of states) test(`Arachnoid ${state.stateId}: actual Bioforge printer and runtime restart keep the selected native art`, async () => {
  const make = () => {
    const calls=[], ctx=new Proxy({drawImage:(...args)=>calls.push(args),measureText:s=>({width:String(s).length*8}),
      createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(t,k)=>t[k]??noop});
    return { calls,ctx,engine:new BioforgeRuntimeV80({width:1280,height:720,getContext:()=>ctx,addEventListener:noop,focus:noop},
      {assets:{},testMode:true,autoLoop:false,now:()=>1000}) };
  };
  const f=make();
  f.engine.start({configuration:{composition:[{lineId:'one',profileId:ID,quantity:1,visualStateV95:state.stateId}],maxConcurrent:1},
    autoLoop:false,testMode:true,assets:{}});
  const control=f.engine.doors.find(d=>d.id==='control-seal'),inner=f.engine.doors.find(d=>d.id==='inner-interlock');
  const printer=f.engine.bioforgeLevelV80.stations.find(s=>s.type==='printer');
  Object.assign(f.engine.player,{x:control.x-f.engine.player.w-10,y:528}); assert.equal(f.engine.interact(),true);
  Object.assign(f.engine.player,{x:inner.x-f.engine.player.w-45,y:528}); assert.equal(f.engine.interact(),true);
  Object.assign(f.engine.player,{x:printer.x-20,y:528}); assert.equal(f.engine.interact(),true);
  Object.assign(f.engine.player,{x:f.engine.bioforgeLevelV80.arenaBounds.x+8,y:528,vx:0,vy:0,grounded:true});
  f.engine.update(.016); assert.equal(f.engine.getBioforgeSnapshotV80().phase,'sealing');
  assert.equal(f.engine.getBioforgeQaHooksV80().advance().event.type,'bioforge-printer-ready');
  await f.engine.ensureEnemyAtlas(getEnemyStaticPoseV95(ID,state.stateId));
  assert.equal(f.engine.getBioforgeQaHooksV80().advance().event.type,'bioforge-specimen-printed');
  assert.equal(f.engine.enemies.length,1);
  const actor=f.engine.enemies[0]; actor.health=91;
  assert.equal(actor.visualStateV95,state.stateId); assert.equal(actor.visualImageKey,state.imageKey);
  f.engine.drawEnemy(f.ctx,actor); assert.ok(f.calls.some(args=>args[0]?.src===state.path&&args.length===5));
  const resumeState=JSON.parse(JSON.stringify(f.engine.captureBioforgeResumeStateV80()));
  const next=make(); next.engine.start({resumeState,autoLoop:false,testMode:true,assets:{}});
  assert.equal(next.engine.enemies.length,1); assert.equal(next.engine.enemies[0].profileId,ID);
  assert.equal(next.engine.enemies[0].health,91); assert.equal(next.engine.enemies[0].visualStateV95,state.stateId);
  assert.equal(next.engine.enemies[0].visualImageKey,state.imageKey);
});
