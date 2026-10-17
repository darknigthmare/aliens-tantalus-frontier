import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_VENT_NETWORK_V62 as network, enterVentNetworkV62, advanceVentTransitionV62, selectVentBranchV62, moveVentTransitV62, selectVentExitV62, exitVentNetworkV62 } from '../src/vent-network-v62.js';
import { HUB_DECKS, buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { HubGame as VentHub } from '../src/hub-v62-runtime.js';
import { HubGame as BaseHub } from '../src/hub-v52-runtime.js';
import { HUB_VENT_CROSS_SECTION_V142, HUB_VENT_TEXTURE_CROPS_V142, buildHubVentMountsV142, createHubVentSceneV142, drawHubVentSceneV142 } from '../src/hub-vent-scene-v142.js';
const at = room => {
  const entry = network.entrances.find(p => p.nodeId === `hub-${room}`);
  return advanceVentTransitionV62(network, enterVentNetworkV62(network, { id:'fixture-player',ventActorKind:'player',position:structuredClone(entry.worldPosition) },entry.id),500);
};
const geometries=HUB_DECKS.map((_,index)=>buildHubTraversalGeometryV87(index));
const mounts=buildHubVentMountsV142(HUB_DECKS,geometries);
const scene = (actor, options) => createHubVentSceneV142(network,actor,{portalMounts:mounts,...options});
test('sixteen physical nodes have distinct stable local views and their real exit destination', () => {
  const keys = new Set(), signatures = new Set();
  for (const node of network.nodes) {
    const actor = at(node.roomId), before = structuredClone(actor), a = scene(actor), b = scene(actor);
    assert.deepEqual(a,b); assert.deepEqual(actor,before); keys.add(a.key);
    const here = a.nodes.find(n => n.current); assert.equal(here.id,node.id); assert.equal(here.exit.roomId,node.roomId);
    assert.equal(here.exit.legacyType,network.exits.find(p=>p.nodeId===node.id).type);
    const deckIndex=HUB_DECKS.findIndex(d=>d.id===node.deckId), native=geometries[deckIndex].vents.find(v=>v.roomId===node.roomId);
    assert.equal(here.exit.visualMount.orientation,'front');assert.equal(here.exit.visualMount.plane,'back-wall');
    assert.equal(here.exit.visualMount.hatchId,native.id);assert.deepEqual(here.exit.visualMount.bounds,{x:native.x,y:native.y,w:native.w,h:native.h});
    assert.deepEqual(here.branches.map(b=>b.edgeId).sort(),network.edges.filter(e=>e.from===node.id||e.to===node.id).map(e=>e.id).sort());
    signatures.add(JSON.stringify({label:here.label,deck:here.deck,exit:here.exit.visualMount,signature:here.signature}));
  }
  assert.equal(keys.size,16); assert.equal(signatures.size,16);
});
test('all fifteen edges render their genuine orientation and retain forward/backward physical camera travel', () => {
  for (const edge of network.edges) {
    const from = network.nodes.find(n=>n.id===edge.from), to = network.nodes.find(n=>n.id===edge.to);
    for (const [start,end] of [[from,to],[to,from]]) {
      let actor=selectVentBranchV62(network,at(start.roomId),edge.id,end.id), a=scene(actor);
      actor=moveVentTransitV62(network,actor,edge.length/2); const b=scene(actor), active=b.edges.find(e=>e.active);
      assert.equal(typeof active.active,'boolean');
      assert.equal(active.axis,edge.kind==='vertical-riser'?'vertical':'horizontal');
      assert.equal(b.actor.climbing,edge.kind==='vertical-riser'); assert.equal(b.actor.crouching,edge.kind!=='vertical-riser');
      assert.ok(Math.abs(b.camera.x-a.camera.x)>1||Math.abs(b.camera.y-a.camera.y)>1);
      assert.equal(a.actor.x,b.actor.x,'The local camera follows, keeping the marine stable within the cutaway.');
      assert.equal(a.actor.y,b.actor.y);
      const fromScreen=b.nodes.find(n=>n.id===start.id).center, toScreen=b.nodes.find(n=>n.id===end.id).center;
      assert.ok(Math.abs((toScreen.x-fromScreen.x)-(end.position.x-start.position.x)*b.scale)<1e-8);
      assert.ok(Math.abs((toScreen.y-fromScreen.y)-(end.position.y-start.position.y)*b.scale)<1e-8);
    }
  }
});
test('held direction can animate only an actual moving segment; a released key or node is still', () => {
  const node=at('medical'); assert.equal(scene(node,{heldDirection:'left'}).actor.moving,false);
  const moving=moveVentTransitV62(network,selectVentBranchV62(network,node,'hub-mess-medical','hub-mess'),500);
  assert.equal(scene(moving,{heldDirection:'left'}).actor.vx,-70);
  for(const heldDirection of [null,'right','up']) { const a=scene(moving,{heldDirection});assert.equal(a.actor.moving,false);assert.equal(a.actor.vx,0);assert.equal(a.actor.vy,0); }
  const up=moveVentTransitV62(network,selectVentBranchV62(network,at('mess'),'hub-riser-1-2','hub-briefing'),120);
  assert.equal(scene(up,{heldDirection:'up'}).actor.vy,-70);assert.equal(scene(up).actor.vy,0);
});
test('a node remembers the actual arrival facing from its existing route history', () => {
  const left=moveVentTransitV62(network,selectVentBranchV62(network,at('medical'),'hub-mess-medical','hub-mess'),2048);
  assert.equal(scene(left).actor.facing,-1);assert.equal(scene(left).actor.vx,0);
  const right=moveVentTransitV62(network,selectVentBranchV62(network,left,'hub-mess-medical','hub-medical'),2048);
  assert.equal(scene(right).actor.facing,1);assert.equal(scene(right).actor.vx,0);
});
test('entering and exiting retain the same local node camera instead of flying between room/graph coordinate systems', () => {
  const p=network.entrances.find(p=>p.nodeId==='hub-science-lab');
  let actor=enterVentNetworkV62(network,{id:'p',ventActorKind:'player',position:p.worldPosition},p.id);
  const entry=scene(actor); actor=advanceVentTransitionV62(network,actor,500); const node=scene(actor);
  assert.deepEqual(entry.camera,node.camera);
  actor=exitVentNetworkV62(network,selectVentExitV62(network,actor,'hub-science-lab-exit'));
  assert.deepEqual(scene(actor).camera,node.camera);assert.equal(scene(actor).actor.moving,false);
});
test('horizontal crawling feet meet the rendered floor and vertical risers keep the same physical marine size', () => {
  const a=scene(at('medical'));const node=a.nodes.find(n=>n.current);
  assert.equal(a.actor.footY,node.center.y+54);assert.equal(a.actor.y+a.actor.h,a.actor.footY);
  const v=scene(selectVentBranchV62(network,at('mess'),'hub-riser-1-2','hub-briefing'));
  assert.equal(v.actor.h,92);assert.equal(v.actor.w,44);assert.equal(HUB_VENT_CROSS_SECTION_V142.height,132);
});
test('rendering samples only bounded original texture crops with uniform scale at or below native resolution', () => {
  const calls=[], image={complete:true,naturalWidth:1672,naturalHeight:941};
  const ctx=new Proxy({globalAlpha:1,drawImage(...args){calls.push(args);}}, {get(target,key){return key in target?target[key]:(()=>{});},set(target,key,value){target[key]=value;return true;}});
  drawHubVentSceneV142(ctx,image,scene(at('mess')),1280,720);assert.ok(calls.length>0);
  for(const call of calls){assert.equal(call.length,9);const [im,sx,sy,sw,sh,dx,dy,dw,dh]=call;assert.equal(im,image);assert.ok(sx>=0&&sy>=0&&sx+sw<=1672&&sy+sh<=941);assert.ok(dw/sw<=.66+1e-9);assert.ok(Math.abs(dw/sw-dh/sh)<1e-9);assert.ok(dw<200&&dh<200);}
  assert.ok(Object.values(HUB_VENT_TEXTURE_CROPS_V142).every(c=>Object.isFrozen(c)));
});
test('a pending image still draws the complete physical layout; no texture can erase a branch', () => {
  let fills=0;const ctx=new Proxy({globalAlpha:1,fillRect(){fills++;},drawImage(){assert.fail('An unloaded texture must not be painted.');}},{get(t,k){return k in t?t[k]:(()=>{});},set(t,k,v){t[k]=v;return true;}});
  drawHubVentSceneV142(ctx,{complete:false,naturalWidth:0},scene(at('mess')),1280,720);assert.ok(fills>10);
});
test('an actor outside a vent receives no duct scene',()=>{assert.equal(scene({id:'p'}),null);});

test('the native adapter binds the old sprite clip clock to travelled distance and restores state after a draw failure', () => {
  const actor=moveVentTransitV62(network,selectVentBranchV62(network,at('medical'),'hub-mess-medical','hub-mess'),640);
  const player={x:3380,y:284,w:44,h:92,vx:0,vy:0,grounded:true,crouching:true,climbing:false,facing:1};
  const before=structuredClone(player), hub=Object.assign(Object.create(VentHub.prototype),{player,keys:new Set(),animationTime:450,ventActorV62:actor,ventSceneV142:scene(actor)});
  const descriptor=Object.getOwnPropertyDescriptor(BaseHub.prototype,'drawPlayer');let calls=0;
  Object.defineProperty(BaseHub.prototype,'drawPlayer',{configurable:true,value(){calls++;assert.equal(this.animationTime,1);assert.equal(this.player.vx,0);throw Error('fixture draw failure');}});
  try{assert.throws(()=>hub.drawVentPlayerV62({},1280,720),/fixture draw failure/);assert.equal(calls,1);assert.equal(hub.animationTime,450);assert.deepEqual(player,before);}
  finally{if(descriptor)Object.defineProperty(BaseHub.prototype,'drawPlayer',descriptor);else delete BaseHub.prototype.drawPlayer;}
});

test('presentation consumes existing French room/deck labels while keeping private graph IDs out of visible text', () => {
  const actor=at('medical');const a=scene(actor,{labels:{rooms:{medical:'INFIRMERIE',mess:'RÉFECTOIRE','science-lab':'LABORATOIRE'},decks:{habitat:'PONT HABITAT'}}});
  const here=a.nodes.find(n=>n.current);assert.equal(here.label,'INFIRMERIE');assert.equal(here.deck,'PONT HABITAT');
  assert.equal(here.exit.label,'INFIRMERIE');assert.ok(here.branches.some(b=>b.label==='RÉFECTOIRE'));
  const actorHub=Object.assign(Object.create(VentHub.prototype),{running:true,ventActorV62:actor});
  assert.match(actorHub.statusPrompt(),/A \/ ←/);assert.match(actorHub.statusPrompt(),/D \/ →/);assert.match(actorHub.statusPrompt(),/E — SORTIR/);
  assert.doesNotMatch(actorHub.statusPrompt(),/LEFT|RIGHT|hub-/);
});
