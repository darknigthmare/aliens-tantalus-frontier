import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createPlayerOpeningV88, normalizePlayerOpeningV88, advancePlayerOpeningV88, getPlayerOpeningObjectiveV88, applyOpeningMissionSuppliesV88, OPENING_POSTS_V88 } from '../src/player-opening-v88.js';
import { createPlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { SaveSystem, createDefaultSave, migrateSave, beginOperation, getOperationBrief, resolveOperation } from '../src/save.js';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { HubGame, HUB_DECKS, resolveHubResumeHeightV88 } from '../src/hub-opening-v88.js';
import { HubGame as PreviousHub } from '../src/hub-onboarding-v84.js';
import { DROPSHIP_HANGAR_ART_V55 } from '../src/hub-art-runtime-v55.js';
import { projectRefugeHubSaveV87 } from '../src/refuge-save-v87.js';
import { SHIP_REFUGE_ANNEX_V87 } from '../src/refuge-room-v87.js';

function withRealHub(run) {
  const names=['Image','addEventListener','requestAnimationFrame','matchMedia'];
  const previous=Object.fromEntries(names.map(name=>[name,globalThis[name]]));
  globalThis.Image=class { constructor(){this.complete=true;this.naturalWidth=1024;this.naturalHeight=1024;} set src(value){this.currentSrc=value;} };
  globalThis.addEventListener=()=>{}; globalThis.requestAnimationFrame=()=>0; globalThis.matchMedia=()=>({matches:false});
  const ctx=new Proxy({measureText:v=>({width:String(v).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(target,key)=>key in target?target[key]:()=>{}});
  try { return run(new HubGame({width:1280,height:720,getContext:()=>ctx,addEventListener(){},focus(){}})); }
  finally { Object.assign(globalThis,previous); }
}

const receipt = 'm41a-qualification-v81:session-1:qualification';
const completeWelcome = () => ({ ...createPlayerOnboardingV84({ name: 'Alex Moreau', callsign: 'FOX-9' }), phase: 'complete', dialogueNode: 0 });
const at = (phase, freight = 'medical') => ({ ...createPlayerOpeningV88(), phase,
  ...(['relay','signal','manifest','ready','deployed','complete'].includes(phase) ? { qualificationId: receipt } : {}),
  ...(['ready','deployed','complete'].includes(phase) ? { freight } : {}),
  ...(['deployed','complete'].includes(phase) ? { operationId: 'operation-1' } : {}),
  ...(phase === 'complete' ? { completedOperationId: 'operation-1', outcome: 'success' } : {}) });
const evidence = (phase, patch = {}) => ({ onboardingComplete: true, physicalContact: true,
  roomId: OPENING_POSTS_V88[phase]?.roomId, weaponIds: ['weapon-001-m41a-pulse-rifle'], relaySeconds: 3, ...patch });
const transition = (state, event, proof = evidence(state.phase)) => {
  const before = structuredClone(state);
  const result = advancePlayerOpeningV88(state, event, proof);
  assert.deepEqual(state, before, 'pure transition cannot mutate the active save');
  assert.equal(result.ok, true, result.reason);
  assert.deepEqual(normalizePlayerOpeningV88(result.state), result.state);
  return result.state;
};
function storage() { const values = new Map(); return { values, deny: false,
  getItem: key => values.get(key) ?? null,
  setItem(key,value) { if (this.deny) throw new Error('quota'); values.set(key,value); },
  removeItem: key => values.delete(key) }; }
function operation(save) { const campaign = CAMPAIGNS.find(c => save.galaxy.unlockedWorldIds.includes(c.worldId)); return [campaign, WORLDS.find(w => w.id === campaign.worldId)]; }

test('opening follows physical steps, a verified qualification, three short signal beats, exclusive freight and actual sortie', () => {
  let s = createPlayerOpeningV88();
  s = transition(s, 'berth'); s = transition(s, 'armory');
  s = transition(s, 'qualified', { onboardingComplete: true, qualificationId: receipt, qualificationReceiptIds: [receipt] });
  s = transition(s, 'relay');
  for (let node = 0; node < 3; node++) s = transition(s, { type: 'signal-next', node });
  s = transition(s, { type: 'freight', freight: 'medical' });
  assert.equal(s.phase, 'ready');
  assert.equal(advancePlayerOpeningV88(s, { type: 'freight', freight: 'energy' }, evidence('manifest')).ok, false);
  s = transition(s, 'deploy', { onboardingComplete: true, operationId: 'operation-1' });
  s = transition(s, 'resolve', { onboardingComplete: true, operationId: 'operation-1', success: false });
  assert.equal(s.phase, 'complete'); assert.equal(s.outcome, 'retreat');
  assert.equal(getPlayerOpeningObjectiveV88(s, completeWelcome()), null);
  assert.deepEqual(transition(s, 'resolve', { onboardingComplete: true, operationId: 'operation-1', success: false }), s);
});

test('unproven contact, wrong rooms, stale nodes, incomplete timers and future steps cannot advance', () => {
  for (const phase of ['berth','armory','relay']) for (const patch of [{ physicalContact: false }, { roomId: 'wrong-room' }, { onboardingComplete: false }]) {
    assert.equal(advancePlayerOpeningV88(at(phase), phase, evidence(phase, patch)).ok, false);
  }
  for (const relaySeconds of [undefined, NaN, Infinity, -1, 2.99]) assert.equal(advancePlayerOpeningV88(at('relay'), 'relay', evidence('relay', { relaySeconds })).ok, false);
  assert.equal(advancePlayerOpeningV88(at('armory'), 'armory', evidence('armory', { weaponIds: [] })).ok, false);
  assert.equal(advancePlayerOpeningV88(at('qualification'), 'qualified', { onboardingComplete: true, qualificationId: receipt, qualificationReceiptIds: [] }).ok, false);
  assert.equal(advancePlayerOpeningV88(at('signal'), { type: 'signal-next', node: 1 }, evidence('signal')).ok, false);
  assert.equal(advancePlayerOpeningV88(at('manifest'), { type: 'freight', freight: 'both' }, evidence('manifest')).ok, false);
  assert.equal(advancePlayerOpeningV88(at('deployed'), 'resolve', { onboardingComplete: true, operationId: 'other', success: true }).ok, false);
});

test('normalization strips injected fields and never opts legacy or unknown schemas into the tutorial', () => {
  for (const raw of [null, undefined, [], {}, { ...at('ready'), schema: 89 }, { ...at('ready'), freight: 'both' }, { ...at('relay'), qualificationId: 'fake' }]) assert.equal(normalizePlayerOpeningV88(raw), null);
  const source = { ...at('ready'), money: 999999, signalNode: 99 };
  assert.deepEqual(normalizePlayerOpeningV88(source), at('ready'));
  const old = createDefaultSave();
  assert.equal(migrateSave(old).openingV88, null);
  old.onboardingV84 = completeWelcome();
  assert.equal(migrateSave(old).openingV88, null, 'completed V84 player stays on their old route');
  assert.equal(getPlayerOpeningObjectiveV88(at('berth'), { phase: 'wake' }), null);
});

test('new player creation persists the marker; each state survives reload and quota failure leaves active state unchanged', () => {
  const backend = storage(); let saves = new SaveSystem(backend);
  saves.newPlayerTimelineV84({ name: 'Alex Moreau', callsign: 'FOX-9' }, 1);
  assert.deepEqual(saves.data.openingV88, createPlayerOpeningV88());
  saves.commit({ onboardingV84: completeWelcome() });
  for (const phase of ['berth','armory','qualification','relay','signal','manifest','ready','deployed','complete']) {
    saves.commit({ openingV88: at(phase) });
    saves = new SaveSystem(backend); saves.load(1);
    assert.deepEqual(saves.data.openingV88, at(phase));
  }
  const before = JSON.stringify(saves.data), bytes = [...backend.values]; const reference = saves.data;
  backend.deny = true;
  assert.throws(() => saves.commit({ openingV88: at('ready','energy') }));
  assert.equal(saves.data, reference); assert.equal(JSON.stringify(saves.data), before); assert.deepEqual([...backend.values], bytes);
});

test('deployment gate is in save core, energy is consumed once, and resolution closes only its own operation', () => {
  const save = createDefaultSave(); save.onboardingV84 = completeWelcome(); save.openingV88 = at('berth');
  const [campaign, world] = operation(save); const before = JSON.stringify(save);
  assert.throws(() => beginOperation(save, campaign, world), /prise de poste/); assert.equal(JSON.stringify(save), before);
  save.openingV88 = null; const ordinaryFuel = getOperationBrief(save,campaign,world).cost.fuel;
  save.openingV88 = at('ready','energy');
  assert.equal(getOperationBrief(save,campaign,world).cost.fuel, Math.max(1,ordinaryFuel-2));
  const started = beginOperation(save,campaign,world); const paid = save.galaxy.resources.fuel;
  assert.equal(started.operation.flags['v88-opening-energy'],true); assert.equal(save.openingV88.phase,'deployed');
  assert.equal(beginOperation(save,campaign,world).resumed,true); assert.equal(save.galaxy.resources.fuel,paid);
  assert.equal(resolveOperation(save,{success:false,reason:'retreat'}).ok,true); assert.equal(save.openingV88.phase,'complete');
  assert.equal(getOperationBrief(save,campaign,world).openingSupportV88.energy,false);
});

test('medical freight changes the real inventory only on fresh runtime, never on consumed snapshot resume', () => {
  const operation = { id: 'operation-1', flags: { 'v88-opening-medical': true } };
  const engine = { inventory: { medkits: 1 } };
  assert.equal(applyOpeningMissionSuppliesV88(engine,operation,false),true); assert.equal(engine.inventory.medkits,3);
  assert.equal(applyOpeningMissionSuppliesV88(engine,operation,false),false);
  engine.inventory.medkits = 0;
  assert.equal(applyOpeningMissionSuppliesV88(engine,operation,true),false); assert.equal(engine.inventory.medkits,0);
  engine.inventory = { medkits: 1 };
  assert.equal(applyOpeningMissionSuppliesV88(engine,operation,false),true); assert.equal(engine.inventory.medkits,3);
});

function hubAt(phase) {
  const post = OPENING_POSTS_V88[phase], room = HUB_DECKS[post.deck].rooms.find(r => r.id === post.roomId);
  const hub = Object.create(HubGame.prototype);
  Object.assign(hub, { openingV88: at(phase), onboardingV84: completeWelcome(), state: { deck: post.deck }, running: true,
    editorPlaytest: false, player: { x: room.propInteractionBounds.x, y: 532, w: 44, h: 92, alive: true },
    doorStates: [], v51Doors: [], keys: new Set(), isAnnexActiveV71: () => false, onAction() {} });
  if (phase === 'manifest') Object.assign(hub.player, { x: DROPSHIP_HANGAR_ART_V55.controlBooth.interactionBounds.x + 30, y: 268 });
  return hub;
}

test('every authored ship station is an actual reachable prop, not a remote room-wide action', () => {
  for (const phase of Object.keys(OPENING_POSTS_V88)) {
    const hub = hubAt(phase);
    assert.equal(hub.openingContactV88()?.action, `opening:${phase}`, phase);
    const room = HUB_DECKS[hub.state.deck].rooms.find(r => r.id === OPENING_POSTS_V88[phase].roomId);
    assert.ok(phase === 'manifest' ? hub.player.y + hub.player.h <= room.propCollisionBounds.y : hub.player.x + hub.player.w < room.propCollisionBounds.x || hub.player.x >= room.propCollisionBounds.x + room.propCollisionBounds.w, 'approach clears physical prop');
    hub.player.x = room.xStart + 20; assert.equal(hub.openingContactV88(),null);
  }
});

test('doors, decks, crisis, annex, death and editor block opening contact', () => {
  for (const mutate of [h=>{h.state.deck=0;},h=>{h.state.activeCrisis={};},h=>{h.editorPlaytest=true;},h=>{h.player.alive=false;},h=>{h.isAnnexActiveV71=()=>true;},h=>{h.onboardingV84.phase='briefing';}]) {
    const hub=hubAt('berth'); mutate(hub); assert.equal(hub.openingContactV88(),null);
  }
  const hub=hubAt('berth'); hub.v51Doors=[{x:hub.player.x+50,progress:.4}]; assert.equal(hub.openingContactV88(),null);
  hub.v51Doors[0].progress=.82; assert.ok(hub.openingContactV88());
});

test('relay timer needs stationary gameplay, freezes in pause, cancels movement and emits once', t => {
  t.mock.method(PreviousHub.prototype,'update',()=>{});
  const hub=hubAt('relay'), actions=[]; hub.onAction=e=>actions.push(e);
  hub.interact(); for(let i=0;i<10;i++) hub.update(.1);
  assert.ok(hub.openingRepairV88.elapsed>.9 && hub.openingRepairV88.elapsed<1.1);
  hub.running=false; hub.update(99); assert.equal(actions.length,0);
  hub.running=true; hub.keys.add('KeyD'); hub.update(.1);
  assert.equal(hub.openingRepairV88,null); assert.equal(actions.at(-1).action,'opening:repair-cancelled');
  hub.keys.clear(); hub.interact(); for(let i=0;i<40;i++) hub.update(.1);
  assert.equal(actions.filter(e=>e.action==='opening:relay').length,1);
  assert.equal(hub.openingRepairV88.complete,true);
});

test('app wires physical opening, owner guards, atomic qualification and immediate inventory checkpoint', () => {
  const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  for(const marker of ["from './hub-opening-v88.js'",'openingV88: saveSystem.data.openingV88','pendingOpeningDialogV88','hubEngine.openingContactV88()?.action !== interaction.action','candidate.openingV88 = advanced.state','applyOpeningMissionSuppliesV88(engine','commitCurrentRuntimeV78();']) assert.ok(source.includes(marker),marker);
});

test('optional parent height rejects invalid imports and solid overlap while leaving legacy floor spawn unchanged', () => withRealHub(hub => {
  const base={deck:3,roomId:'dropship-hangar',positionX:1180};
  hub.start(base);assert.equal(hub.player.y,532);
  for(const positionY of [NaN,Infinity,-1,1e12,'268',null]) {
    const save=createDefaultSave();save.hub.positionY=positionY;
    assert.equal(migrateSave(save).hub.positionY,null);
    assert.equal(resolveHubResumeHeightV88(hub,positionY),null);
  }
  assert.equal(resolveHubResumeHeightV88(hub,533),null,'below global floor');
  const obstacle=hub.obstacles.find(p=>p.collisionMode!=='one-way-top');
  hub.player.x=obstacle.x;assert.equal(resolveHubResumeHeightV88(hub,obstacle.y),null,'inside solid prop');
  hub.player.x=300;hub.v51Walls=[{x:300,y:200,w:100,h:150}];assert.equal(resolveHubResumeHeightV88(hub,210),null,'wall/ceiling collision');
  hub.v51Walls=[];hub.v51Doors=[{x:300,y:200,w:100,h:150,progress:0}];assert.equal(resolveHubResumeHeightV88(hub,210),null,'closed door');
  hub.v51Doors=[];hub.v51Vents=[{x:300,y:200,w:100,h:60}];
  assert.equal(resolveHubResumeHeightV88(hub,210),null,'a formerly crouched checkpoint cannot restore a standing actor inside a duct');
}));

test('real upper hangar checkpoint restores above the live hazard; midair resumes under real gravity', () => withRealHub(hub => {
  const state={deck:3,roomId:'dropship-hangar',positionX:1180,positionY:268};
  hub.start(state,{onboardingV84:completeWelcome(),openingV88:at('manifest')});
  assert.equal(hub.player.y,268);assert.equal(hub.player.grounded,true);assert.equal(hub.openingContactV88().phase,'manifest');
  for(let i=0;i<120;i++)hub.update(1/60);
  assert.equal(hub.player.health,100);assert.equal(hub.player.y,268);
  hub.start({...state,positionY:200},{onboardingV84:completeWelcome()});
  assert.equal(hub.player.y,200);assert.equal(hub.player.grounded,false);
  for(let i=0;i<120;i++)hub.update(1/60);
  assert.equal(hub.player.y,268);assert.equal(hub.player.health,100);
}));

test('a first animation-frame timestamp older than start/resume never invents a jump or rewinds physics', () => withRealHub(hub => {
  hub.start({deck:3,roomId:'dropship-hangar',positionX:1180,positionY:268},{onboardingV84:completeWelcome()});
  for(const restart of [false,true]) {
    if(restart){hub.pause();hub.resume();}
    const before={y:hub.player.y,vy:hub.player.vy,health:hub.player.health};
    hub.loop(hub.last-15,hub.loopToken);
    assert.deepEqual({y:hub.player.y,vy:hub.player.vy,health:hub.player.health},before);
    assert.equal(hub.jumpQueued,0);assert.equal(hub.player.grounded,true);assert.equal(hub.keys.size,0);
    hub.loop(hub.last+16,hub.loopToken);assert.equal(hub.player.y,268);
  }
}));

test('parent height never overwrites active annex-local pose, wake spawn or Refuge return boundary', () => withRealHub(hub => {
  hub.start({deck:3,roomId:'dropship-hangar',positionX:1180,positionY:268},{onboardingV84:completeWelcome()});
  const real=hub.isAnnexActiveV71;hub.isAnnexActiveV71=()=>true;
  assert.equal(resolveHubResumeHeightV88(hub,200),null);hub.isAnnexActiveV71=real;
  hub.onboardingV84.phase='wake';assert.equal(resolveHubResumeHeightV88(hub,200),null);
  const door=SHIP_REFUGE_ANNEX_V87.parentDoorBounds;
  const projected=projectRefugeHubSaveV87({positionY:200,commercialV71:{schema:71,registryVersion:87,activeAnnexId:SHIP_REFUGE_ANNEX_V87.id,annexPositionY:111}});
  assert.equal(projected.positionY,door.y+door.h-92);assert.equal(projected.commercialV71.annexPositionY,null);
  assert.equal(projected.commercialV71.activeAnnexId,null);
  const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  assert.ok(source.includes('annexReturnPoseV71?.y ?? hubEngine.restoreReturnPoseV71(annex).y'));
  assert.ok(source.includes('if (hubEngine.restoringHubPoseV88) return;'));
}));
