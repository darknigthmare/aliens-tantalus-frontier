import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { GameEngine } from '../src/game-production-runtime.js';
import { host, prepare, tick, fixture as missionFixture } from './engine-host-v188.mjs';
import { buildLegacyMissionV131, LEGACY_CAMPAIGNS_V131 } from '../src/legacy-operations-v131.js';
import { WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS, CREW } from '../src/content.js';
import { resolveCombatAimV83 } from '../src/combat-aim-v83.js';
import { resolvePlayerModularRigV126 } from '../src/player-modular-rig-v126.js';
import { normalizePlayerAppearanceV126, getPlayerAppearancePresetV129 } from '../src/player-appearance-v126.js';
import { attachCrewDeploymentV85 } from '../src/crew-runtime-v85.js';
import { advancePlayerTransitStateV128, resolvePlayerTransitRigV128 } from '../src/player-transit-rig-v128.js';
import { HADAL_PLAYER_ART_V188, HADAL_PLAYER_PARTS_V188, hadalPlayerArtReadyV188,
  resolveHadalPlayerContextV188, HADAL_PLAYER_LEG_DEFINITIONS_V188, adaptHadalPlayerBodyV188 } from '../src/hadal-player-art-v188.js';

// Real production engine, full application catalogue, chapter builder, input,
// combat, reload and checkpoint code. DOM/RAF/Canvas are the declared V188 host;
// the three generated images additionally have controllable load completion.
// Draw traces and geometry are not raster-quality or Chromium certification.
const paths = new Set(HADAL_PLAYER_ART_V188.map(asset => asset.path));
const near = (actual, expected, label, tolerance = 1e-6) => assert.ok(Math.abs(actual - expected) <= tolerance,
  `${label}: ${actual} != ${expected}`);
const transform = (m,p) => ({x:m.a*p.x+m.c*p.y+m.e,y:m.b*p.x+m.d*p.y+m.f});
const layerBounds = layer => {
  const r=layer.sourceRect,p=[{x:r.x,y:r.y},{x:r.x+r.width,y:r.y},{x:r.x,y:r.y+r.height},
    {x:r.x+r.width,y:r.y+r.height}].map(point=>transform(layer.matrix,point));
  return {left:Math.min(...p.map(point=>point.x)),right:Math.max(...p.map(point=>point.x)),
    top:Math.min(...p.map(point=>point.y)),bottom:Math.max(...p.map(point=>point.y))};
};
const bodyGeometry = body => ({matrix:body.matrix,shoulders:body.shoulders,pivot:body.pivot,
  armLengths:body.armLengths,legs:body.locomotionV129?.legs,contacts:body.locomotionV129?.contacts,
  breath:body.hadalPresentationV188?.breathingPoint});
const poseGeometry = pose => ({body:bodyGeometry(pose.bodyRig),muzzle:pose.muzzle,grip:pose.grip,support:pose.support,
  ejectionPort:pose.ejectionPort,reloadPort:pose.reloadPort,weaponMatrix:pose.matrix});

function controlledHost({ holdHadal = false } = {}) {
  const browser = host(), NativeImage = globalThis.Image, requests = [], pending = [];
  globalThis.Image = class extends NativeImage {
    set src(value) {
      if (!paths.has(new URL(value,'http://qa.invalid').pathname)) { super.src = value; return; }
      this._src = value; this.complete = false; this.naturalWidth = this.naturalHeight = 0;
      requests.push(value); pending.push(this);
      if (!holdHadal) queueMicrotask(() => this.finishHadal(true));
    }
    get src() { return this._src; }
    get currentSrc() { return this._src; }
    finishHadal(ready) {
      this.complete = true;
      this.naturalWidth = this.naturalHeight = ready ? 1254 : 0;
      const event = new Event(ready ? 'load' : 'error');
      this.dispatchEvent(event); this[`on${event.type}`]?.(event);
    }
  };
  const paints = [];
  browser.ctx.fillRect = function(...rect) { paints.push({kind:'fill',rect,style:this.fillStyle}); };
  browser.ctx.strokeRect = function(...rect) { paints.push({kind:'stroke',rect,style:this.strokeStyle}); };
  return {...browser,requests,pending,paints};
}
async function fixture({ holdHadal = false, kind = 'abyss', options: extra = {} } = {}) {
  const browser = controlledHost({holdHadal}), events = [];
  const campaign = LEGACY_CAMPAIGNS_V131.find(entry => entry.kind === kind);
  const options = {campaign,world:WORLDS.find(world => world.id === campaign.worldId),weapon:WEAPONS[0],
    enemyCatalog:ENEMIES,equipment:[],crew:[],seed:188,...extra};
  options.missionLevel = buildLegacyMissionV131({...options,levelSeeds:LEVEL_SEEDS});
  const engine = new GameEngine(browser.canvas,{onEvent:event=>events.push(event)});
  engine.start(options); await prepare(engine);
  return {...browser,engine,events,options};
}
function draw(subject, actor = subject.engine.player) {
  subject.draws.length = subject.paints.length = 0;
  subject.engine.drawActor(subject.ctx,actor);
  assert.equal(subject.stack.length,0,'Canvas save/restore remains balanced.');
  return {paths:subject.draws.map(entry=>entry.path),draws:[...subject.draws],paints:[...subject.paints],
    status:actor.playerAppearanceVisualV126};
}
function pose(subject, { preview = false } = {}) {
  const e=subject.engine, aim=resolveCombatAimV83({x:e.player.facing,y:0,facing:e.player.facing});
  return e.resolvePlayerWeaponPoseV125(e.player,aim,{requireReady:false,shotPreviewV160:preview});
}
function nativeProxy(render) { return render.paints.filter(entry=>entry.kind==='fill'&&entry.style==='#9edbdacc'); }

test('HADAL: all three real sources are owned and complete before any of the nineteen parts is admitted', async () => {
  for (const asset of HADAL_PLAYER_ART_V188) {
    const bytes=readFileSync(new URL(`..${asset.path}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
    assert.equal(bytes.readUInt32BE(16),asset.sourceWidth); assert.equal(bytes.readUInt32BE(20),asset.sourceHeight);
  }
  const s=await fixture({holdHadal:true}),e=s.engine, before=JSON.stringify(e.captureResumeState());
  try {
    assert.equal(s.pending.length,3); const geometry=poseGeometry(pose(s)), fallback=[];
    for (let count=0;count<=3;count++) {
      if (count) s.pending[count-1].finishHadal(true);
      const render=draw(s), hadalDraws=render.draws.filter(entry=>paths.has(entry.path));
      assert.equal(hadalPlayerArtReadyV188(e.images),count===3);
      assert.deepEqual(poseGeometry(pose(s)),geometry,'Image arrival cannot move the accepted gun, body or contacts.');
      assert.equal(Boolean(render.status?.hadal?.drawn),count===3);
      if (count<3) {
        assert.equal(hadalDraws.length,0,'No partial helmet, upper or leg may leak into fallback.');
        assert.equal(nativeProxy(render).length,1); fallback.push(render.draws);
      } else {
        assert.equal(new Set(hadalDraws.map(entry=>entry.path)).size,3);
        assert.equal(hadalDraws.length,15,'Seven lower pieces, torso, helmet and six arm/hand draws.');
        assert.equal(nativeProxy(render).length,0);
        assert.ok(!render.status.layers.some(layer=>['bare-head','back','mask','back-strap'].includes(layer.id)));
      }
    }
    assert.deepEqual(fallback[1],fallback[0]); assert.deepEqual(fallback[2],fallback[0]);
    for(let mask=0;mask<8;mask++) {
      s.pending.forEach((image,index)=>image.finishHadal(Boolean(mask & (1<<index))));
      const render=draw(s);
      assert.equal(render.status.hadal.drawn,mask===7,`Source availability mask ${mask}.`);
      if(mask!==7)assert.deepEqual(render.draws,fallback[0],'Every incomplete three-source combination uses the complete same fallback.');
      assert.deepEqual(poseGeometry(pose(s)),geometry);
    }
    assert.equal(s.requests.length,3,'Repeated draws share the pending or ready images.');
    assert.equal(JSON.stringify(e.captureResumeState()),before,'Drawing cannot modify the native checkpoint.');
  } finally { e.stop(); }
});

test('HADAL: the rendered closed visor follows the unchanged oxygen probe through native two-axis motion and all three modes', async () => {
  const s=await fixture(),e=s.engine,p=e.player;
  try {
    const physical={w:p.w,h:p.h},selected=structuredClone(p.appearanceV126);
    for (const mode of ['neutral','weighted','magnetic']) {
      assert.equal(e.legacyMissionV131.hadalMode,mode);
      for (const facing of [-1,1]) for (const vertical of [-1,0,1]) {
        // Input is native. Position is a declared clear-water fixture to keep
        // each pose away from canyon walls and repeated bell transitions.
        Object.assign(p,{x:340,y:340}); e.keys.clear();
        e.keys.add(facing<0?'KeyA':'KeyD');
        if (vertical) e.keys.add(vertical<0?'KeyW':'KeyS');
        tick(e,1/60); e.keys.clear();
        const render=draw(s), b=e.resolvePlayerAppearanceBodyV126(p), marker=b.hadalPresentationV188;
        const q={x:p.x+p.w/2-3,y:p.y+12,w:6,h:12};
        const helmet=render.status.layers.find(layer=>layer.id==='helmet'); assert.ok(helmet);
        const painted=layerBounds(helmet),target={x:q.x+q.w/2,y:q.y+2.5};
        assert.ok(target.x>=painted.left && target.x<=painted.right && target.y>=painted.top && target.y<=painted.bottom,
          `The actual helmet draw misses the oxygen reference: ${JSON.stringify({target,painted})}`);
        assert.equal(render.status?.hadal?.drawn,true);
        assert.deepEqual(marker.context.oxygenProbe,q);
        const breath=marker.breathingPoint;
        assert.ok(breath.x>=q.x && breath.x<=q.x+q.w && breath.y>=q.y && breath.y<=q.y+q.h,
          `The painted opaque visor reference misses the native oxygen probe: ${JSON.stringify({breath,probe:q})}`);
        const actual=transform(helmet.matrix,HADAL_PLAYER_PARTS_V188.helmet.respiratoryReference);
        near(actual.x,breath.x,'Actual painted visor X'); near(actual.y,breath.y,'Actual painted visor Y');
        const seal=transform(helmet.matrix,HADAL_PLAYER_PARTS_V188.helmet.neckSeal);
        const torso=render.status.layers.find(layer=>layer.id==='torso');
        const collar=transform(torso.matrix,HADAL_PLAYER_PARTS_V188.torso[marker.family].neckClosure);
        near(seal.x,collar.x,'Closed neck X'); near(seal.y,collar.y,'Closed neck Y');
        for (const leg of Object.values(b.locomotionV129.legs)) {
          near(Math.hypot(leg.knee.x-leg.hip.x,leg.knee.y-leg.hip.y),leg.upper,'Native femur');
          near(Math.hypot(leg.ankle.x-leg.knee.x,leg.ankle.y-leg.knee.y),leg.lower,'Native tibia');
        }
        assert.deepEqual({w:p.w,h:p.h},physical); assert.deepEqual(p.appearanceV126,selected);
      }
      e.activateTracker();
    }
  } finally { e.stop(); }
});

test('HADAL stature: supported hips retain leg reach and a full thorax while service and suspension remain distinct', async t => {
  const s=await fixture(),e=s.engine,p=e.player;
  const kneeAngle=leg=>{
    const a={x:leg.hip.x-leg.knee.x,y:leg.hip.y-leg.knee.y};
    const b={x:leg.ankle.x-leg.knee.x,y:leg.ankle.y-leg.knee.y};
    return Math.acos(Math.max(-1,Math.min(1,(a.x*b.x+a.y*b.y)
      /(Math.hypot(a.x,a.y)*Math.hypot(b.x,b.y)))))*180/Math.PI;
  };
  function observe() {
    const rendered=draw(s),body=e.resolvePlayerAppearanceBodyV126(p),marker=body.hadalPresentationV188;
    assert.equal(rendered.status.hadal.drawn,true); assert.ok(marker);
    const torso=rendered.status.layers.find(layer=>layer.id==='torso');
    const helmet=rendered.status.layers.find(layer=>layer.id==='helmet');
    const part=HADAL_PLAYER_PARTS_V188.torso[marker.family],h=HADAL_PLAYER_PARTS_V188.helmet;
    const neck=transform(torso.matrix,part.neckClosure),waist=transform(torso.matrix,part.joints.waist);
    const seal=transform(helmet.matrix,h.neckSeal),breath=transform(helmet.matrix,h.respiratoryReference);
    const helmetTop=transform(helmet.matrix,{x:h.alphaBounds[0],y:h.alphaBounds[1]});
    const helmetBottom=transform(helmet.matrix,{x:h.alphaBounds[0],y:h.alphaBounds[3]});
    const torsoLength=Math.hypot(waist.x-neck.x,waist.y-neck.y);
    const helmetHeight=Math.hypot(helmetBottom.x-helmetTop.x,helmetBottom.y-helmetTop.y);
    // Both figures come from the actual draw matrices and measured source
    // anchors. This also rejects the earlier tiny-torso/locked-leg variant,
    // not merely a return to the initial collapsed supported posture.
    assert.ok(torsoLength/helmetHeight>.8 && torsoLength/helmetHeight<1.4,
      `Painted thorax/helmet proportion ${torsoLength/helmetHeight}`);
    near(neck.x,seal.x,'Registered collar X'); near(neck.y,seal.y,'Registered collar Y');
    const probe={x:p.x+p.w/2-3,y:p.y+12,w:6,h:12};
    assert.ok(breath.x>=probe.x && breath.x<=probe.x+probe.w && breath.y>=probe.y && breath.y<=probe.y+probe.h);
    // No axis-specific squeeze may repair the proportions of either piece.
    for(const layer of [torso,helmet]) {
      const m=layer.matrix;
      near(Math.hypot(m.a,m.b),Math.hypot(m.c,m.d),'Uniform painted scale');
      near(m.a*m.c+m.b*m.d,0,'Orthogonal painted axes');
    }
    return {body,torsoLength,helmetHeight,knees:Object.fromEntries(Object.entries(body.locomotionV129.legs)
      .map(([side,leg])=>[side,kneeAngle(leg)]))};
  }
  try {
    e.reducedMotion=true;e.accessibilityRuntime={...e.accessibilityRuntime,reducedMotion:true};
    e.activateTracker();e.activateTracker();assert.equal(e.legacyMissionV131.hadalMode,'magnetic');
    const observations=[];
    for(const facing of [-1,1]) {
      // Only position/heading are declared fixture inputs. Actual Legacy
      // update establishes the support and the public owner resolves the rig.
      Object.assign(p,{x:340,y:e.platforms[0].y-p.h,vx:0,vy:0,facing,gamepadAimV83:{x:facing,y:0}});
      e.resolvePlayerCombatAimV83(p);tick(e,1/60);assert.equal(p.grounded,true);
      const before=JSON.stringify(e.captureResumeState()),supported=observe();
      assert.equal(JSON.stringify(e.captureResumeState()),before,'Stature resolution cannot alter physics or checkpoint.');
      const extension={};
      for(const [side,leg]of Object.entries(supported.body.locomotionV129.legs)) {
        near(leg.sole.y,p.y+p.h,'Existing supported sole plane');
        const fullHeight=leg.upper+leg.lower+leg.sole.y-leg.ankle.y;
        extension[side]=(leg.sole.y-leg.hip.y)/fullHeight;
        assert.ok(extension[side]>.88 && extension[side]<=1,
          `Supported hip/sole extension ${extension[side]} must not collapse into a working crouch.`);
      }
      p.health=30;assert.equal(e.useMedkit(p),true);tick(e,.6);
      e.preparePlayerWeaponAssetsV125();await prepare(e);
      const service=observe();assert.equal(service.body.actionV127?.mode,'medical');
      for(const angle of Object.values(service.knees))assert.ok(angle<155,'Native service retains visible knee flexion.');
      assert.equal(e.cancelFieldActionV124(p,'cancelled'),true);
      Object.assign(p,{x:340,y:340});e.keys.add('KeyW');tick(e,1/60);e.keys.clear();
      assert.equal(p.grounded,false);const suspension=observe();
      assert.ok(Object.values(suspension.body.locomotionV129.contacts.feet).every(foot=>!foot.planted));
      assert.ok(suspension.knees.near<supported.knees.near-10,'Free suspension stays distinct from supported readiness.');
      observations.push({facing,supportedExtension:extension,supportedKnees:supported.knees,
        serviceKnees:service.knees,suspensionKnees:suspension.knees,
        torsoLength:supported.torsoLength,helmetHeight:supported.helmetHeight});
    }
    t.diagnostic(JSON.stringify(observations));
  } finally {e.stop();}
});

test('HADAL: a native accepted first shot and its presentation copy use the same registered shoulders and real muzzle', async () => {
  const s=await fixture(),e=s.engine,p=e.player;
  try {
    for (const facing of [-1,1]) {
      Object.assign(p,{x:340,y:340,facing,fireClock:0,ammo:10,v52FireClock:0});
      p.combatAimV83=resolveCombatAimV83({x:facing,y:0,facing});
      const preview=pose(s,{preview:true}); assert.ok(preview?.bodyRig.hadalPresentationV188);
      const before=JSON.stringify(p), requests=s.requests.length;
      pose(s,{preview:true}); assert.equal(JSON.stringify(p),before,'Admission preview cannot mutate the owner.');
      assert.equal(s.requests.length,requests,'Admission preview is independent of image loading.');
      const start=e.bullets.length; assert.equal(e.fire(p),true); assert.ok(e.bullets.length>start);
      const bullet=e.bullets[start],actual=pose(s);
      near(bullet.x,actual.muzzle.x,'Accepted projectile X'); near(bullet.y,actual.muzzle.y,'Accepted projectile Y');
      draw(s); near(p.heldWeaponVisualV125.muzzle.x,bullet.x,'Drawn muzzle X'); near(p.heldWeaponVisualV125.muzzle.y,bullet.y,'Drawn muzzle Y');
      const clone={...p}; assert.equal(e.resolvePlayerWeaponPoseV125(clone,p.combatAimV83,{requireReady:false}),null);
      assert.equal(e.playerBodyPresentationContextV188(clone),null,'Matching IDs do not give a foreign copy the player context.');
    }
  } finally { e.stop(); }
});

test('HADAL: lost or foreign art at the same clock restores the complete native proxy instead of reusing a stale draw receipt', async () => {
  const s=await fixture(),e=s.engine;
  try {
    const complete=draw(s); assert.equal(complete.status.hadal.drawn,true); const clock=e.animationTime;
    const image=e.images.get(HADAL_PLAYER_ART_V188[2].imageKey),source=image.src;
    for (const failure of ['missing','foreign','wrong-size']) {
      image.finishHadal(true); image._src=source;
      if (failure==='missing') image.finishHadal(false);
      if (failure==='foreign') image._src='/assets/abyss/v188/manta-6-hull.png';
      if (failure==='wrong-size') image.naturalWidth=1253;
      const render=draw(s);
      assert.equal(e.animationTime,clock); assert.equal(render.status.hadal.drawn,false);
      assert.equal(render.draws.filter(entry=>paths.has(entry.path)).length,0); assert.equal(nativeProxy(render).length,1);
      assert.equal(e.playerAppearanceSnapshotV126().operators[0].visual.hadal.kitReady,false);
    }
    image._src=source; image.finishHadal(true); assert.equal(draw(s).status.hadal.drawn,true);
  } finally { e.stop(); }
});

test('HADAL: real reload, service admission and cancellation, pause and chapter resume retain their transactions and sealed contacts', async () => {
  const s=await fixture(),e=s.engine,p=e.player;
  try {
    p.ammo=Math.max(1,p.magazineSize-3);
    assert.equal(e.reload(p),true); tick(e,.25);
    assert.equal(p.reloading,true); const loading=pose(s); assert.ok(loading.reloadProgress>0);
    const during=draw(s); assert.equal(during.status.hadal.drawn,true);
    const arms=during.status.layers.filter(layer=>layer.slot==='arms');
    assert.equal(arms.length,6); assert.ok(arms.some(layer=>layer.part==='far-service'));
    e.togglePause(); const paused=JSON.stringify(p.tacticalReload),oxygen=e.legacyMissionV131.oxygen;
    tick(e,1); assert.equal(JSON.stringify(p.tacticalReload),paused); assert.equal(e.legacyMissionV131.oxygen,oxygen);
    assert.deepEqual(poseGeometry(pose(s)),poseGeometry(loading)); e.togglePause();
    tick(e,3); assert.equal(p.reloading,false); assert.equal(p.ammo,p.magazineSize);
    // Medical work requires real floor support. This declared placement is
    // followed by the chapter's own contact update; no grounded flag is set.
    p.x=340; p.y=e.platforms[0].y-p.h; tick(e,1/60); assert.equal(p.grounded,true);
    p.health=30; assert.equal(e.useMedkit(p),true);
    e.preparePlayerWeaponAssetsV125(); await prepare(e);
    const action=e.resolvePlayerAppearanceActionV127(p),render=draw(s);
    assert.equal(action.mode,'medical'); assert.equal(action.firing,false); assert.equal(render.status.hadal.drawn,true);
    assert.ok(render.status.layers.some(layer=>layer.slot==='arms'&&layer.part.endsWith('service')));
    assert.ok(!render.status.layers.some(layer=>layer.slot==='weapon'));
    const inventory=structuredClone(e.inventory),transaction=structuredClone(p.fieldActionV124);
    for(let i=0;i<4;i++)draw(s);
    assert.deepEqual(e.inventory,inventory); assert.deepEqual(p.fieldActionV124,transaction);
    // This art test certifies admission and cancellation, not medical
    // completion. The existing Legacy action-progress issue is separate.
    assert.equal(e.cancelFieldActionV124(p,'cancelled'),true);
    assert.equal(e.isFieldActionBusyV124(p),false); assert.deepEqual(e.inventory,inventory);
    assert.equal(draw(s).status.hadal.drawn,true);
    e.activateTracker(); assert.equal(e.legacyMissionV131.hadalMode,'weighted');
    const checkpoint=e.captureResumeState(),persisted=structuredClone(p.appearanceV126);
    assert.equal(JSON.stringify(checkpoint).includes('hadalPresentationV188'),false);
    assert.equal(e.applyResumeState(checkpoint).applied,true);
    assert.equal(e.legacyMissionV131.hadalMode,'weighted'); assert.deepEqual(p.appearanceV126,persisted);
    assert.equal(draw(s).status.hadal.drawn,true);
  } finally { e.stop(); }
});

test('HADAL: contextual parts preserve the native imposed-contact transit skeleton without claiming a chapter ladder or casualty route', async () => {
  const s=await fixture(),e=s.engine,ladder={id:'declared-hadal-compatibility-ladder',x:121,top:0,bottom:600,w:42};
  try {
    for(const facing of [-1,1])for(const kind of ['climb','downed','death','revive']) {
      const actor={...e.player,x:100,y:200,vx:0,vy:0,facing,grounded:true,climbing:false,alive:true,downed:false,
        reloading:false,tacticalReload:null,shots:0,meleeClock:0,toolUseClock:0,interactionClock:0,v52HurtClock:0,shockClock:0};
      if(kind==='climb')Object.assign(actor,{climbing:true,grounded:false,ladderId:ladder.id,vy:-185});
      if(kind==='downed')Object.assign(actor,{alive:false,downed:true,bleedOut:18});
      if(kind==='death')Object.assign(actor,{alive:false,bleedOut:0});
      const historyActor=kind==='revive'?{...actor,alive:false,downed:true,bleedOut:18}:actor;
      let state=advancePlayerTransitStateV128(null,historyActor,0,{context:'declared-transit-compatibility',ladder});
      state=advancePlayerTransitStateV128(state,actor,.1,{context:'declared-transit-compatibility',ladder});
      state=advancePlayerTransitStateV128(state,actor,.2,{context:'declared-transit-compatibility',ladder});
      const options={actor,images:e.images,appearance:actor.appearanceV126,ladder,transitState:state,timeSeconds:.2,
        legDefinitions:HADAL_PLAYER_LEG_DEFINITIONS_V188};
      const context=resolveHadalPlayerContextV188({owner:actor,player:actor,legacyMission:e.legacyMissionV131});
      const native=resolvePlayerTransitRigV128(options),suited=resolvePlayerTransitRigV128({...options,
        decorateBodyRigV188:body=>adaptHadalPlayerBodyV188(body,{context,preserveContacts:true})});
      assert.equal(native.eligible,true); assert.equal(suited.ready,true); assert.equal(suited.firing,false);
      for(const key of ['legs','arms','contacts','handPose','state'])assert.deepEqual(suited[key],native[key],`${kind}: ${key}`);
      assert.deepEqual(suited.bodyRig.matrix,native.bodyRig.matrix);
      assert.deepEqual(suited.bodyRig.shoulders,native.bodyRig.shoulders);
      assert.equal(resolvePlayerModularRigV126({bodyRig:suited.bodyRig,appearance:actor.appearanceV126,images:e.images}).contextualKitV188,'abyss-hadal');
    }
  } finally { e.stop(); }
});

test('HADAL: an injected capacity context cannot displace either of two native operators or their active tools from the sixteen-image cache', async t => {
  const primary=normalizePlayerAppearanceV126({schema:126,slots:{
    ...getPlayerAppearancePresetV129('uscm-hicks-v129').slots,
    torso:'torso-hudson-calendar-v141',arms:'arms-utility-v126',legs:'legs-utility-v126',mask:'mask-rebreather-v126'}});
  const secondary=normalizePlayerAppearanceV126({schema:126,slots:{
    ...getPlayerAppearancePresetV129('uscm-smartgunner-v129').slots,
    helmet:'helmet-patrol-v126',torso:'torso-hudson-v129',back:'back-radio-v126'}});
  const s=await missionFixture({options:{enemyCatalog:ENEMIES,
    weapon:WEAPONS.find(item=>item.id==='weapon-007-m37a2-pump-shotgun'),
    playerAppearanceV126:primary,coopAppearanceV126:secondary}}),e=s.engine,p=e.player;
  try {
    e.setCoop(true);
    assert.equal(attachCrewDeploymentV85(p,{...CREW[0],gearV85:[
      {instanceId:'hadal-capacity-rifle',catalogId:'weapon-001-m41a-pulse-rifle',kind:'weapon'},
      {instanceId:'hadal-capacity-tracker',catalogId:'equipment-001-motion-tracker',kind:'equipment',charges:3}]}),true);
    assert.equal(attachCrewDeploymentV85(e.coop,{...CREW[1],gearV85:[
      {instanceId:'hadal-capacity-pistol',catalogId:'weapon-003-m4a3-service-pistol',kind:'weapon'},
      {instanceId:'hadal-capacity-medkit',catalogId:'equipment-006-medkit',kind:'equipment'}]}),true);
    e.weaponPickup.taken=false; p.health=e.coop.health=30;
    tick(e,.1); assert.equal(p.grounded,true); assert.equal(e.coop.grounded,true);
    assert.equal(e.useEquipment('equipment-001-motion-tracker',p),true); assert.equal(e.useMedkit(e.coop),true);
    e.preparePlayerWeaponAssetsV125(); await prepare(e);
    const native=e.collectPlayerWeaponAssetsV125(); assert.ok(native.length>13 && native.length<=16);
    // Abyss itself is single-player. This is a capacity regression only: two
    // real admitted operators/actions keep their normal mission while the
    // primary's pure presentation context is injected, without a fake save.
    e.playerBodyPresentationContextV188=function(owner=this.player) {
      return resolveHadalPlayerContextV188({owner,player:this.player,legacyMission:{kind:'abyss',aboard:false},
        artAdmitted:this.hadalArtCacheAdmittedV188!==false});
    };
    const before=JSON.stringify(e.captureResumeState());
    e.preparePlayerWeaponAssetsV125(); await prepare(e);
    const required=e.collectPlayerWeaponAssetsV125(),cache=e.weaponImageCacheV125.snapshot();
    assert.equal(e.hadalArtCacheAdmittedV188,false); assert.equal(cache.limit,16); assert.ok(cache.retained<=16);
    for(const asset of native)assert.ok(required.some(entry=>entry.imageKey===asset.imageKey),`${asset.imageKey} remains required.`);
    for(const asset of required)assert.ok(cache.assets.some(entry=>entry.imageKey===asset.imageKey&&entry.pinned&&entry.state==='ready'));
    const releases=cache.releases;
    for(let n=0;n<6;n++) {
      e.preparePlayerWeaponAssetsV125(); e.drawActor(s.ctx,p); e.drawActor(s.ctx,e.coop);
      assert.equal(p.playerAppearanceVisualV126.drawn,true); assert.equal(e.coop.playerAppearanceVisualV126.drawn,true);
      assert.equal(p.playerAppearanceVisualV126.hadal.drawn,false);
      assert.ok(!s.draws.some(entry=>paths.has(entry.path)));
    }
    assert.equal(e.weaponImageCacheV125.snapshot().releases,releases);
    assert.equal(JSON.stringify(e.captureResumeState()),before);
    t.diagnostic(`Actual two-tool native requirement ${native.length}/16; HADAL declined atomically. Capacity context injection only, not an Abyss multiplayer feature.`);
  } finally { e.stop(); }
});

test('HADAL: native eligibility excludes neuro, incompatible armor, another Legacy chapter and the MANTA driver', async () => {
  const s=await fixture(),e=s.engine,p=e.player;
  try {
    const cases=[
      [()=>{e.neuro={active:true};},()=>{e.neuro=null;}],
      [()=>{p.userEquipmentV95={armorId:'declared-incompatible-armor'};},()=>{delete p.userEquipmentV95;}],
      [()=>{p.costumeId='franchise-nostromo-crew';},()=>{delete p.costumeId;}]
    ];
    for (const [apply,restore] of cases) {
      apply(); const rig=e.resolvePlayerAppearanceBodyV126(p); assert.equal(Boolean(rig?.hadalPresentationV188),false);
      assert.equal(draw(s).draws.some(entry=>paths.has(entry.path)),false); restore();
    }
    p.x=e.vehicle.x-45; p.y=e.vehicle.y;
    assert.equal(e.toggleVehicle(),true); assert.equal(e.legacyMissionV131.aboard,true);
    assert.equal(e.playerBodyPresentationContextV188(p),null);
    assert.equal(draw(s).draws.some(entry=>paths.has(entry.path)),false);
    assert.equal(e.toggleVehicle(),true); assert.equal(e.legacyMissionV131.aboard,false);
    assert.equal(draw(s).status?.hadal?.drawn,true);
  } finally { e.stop(); }
  const other=await fixture({kind:'nostromo'});
  try { assert.equal(other.requests.length,0); assert.equal(draw(other).draws.some(entry=>paths.has(entry.path)),false); }
  finally { other.engine.stop(); }
});

test('HADAL service: the native Legacy update completes one medical transaction and preserves pause, interruption and resume guards', async t => {
  const s=await fixture(),e=s.engine,p=e.player;
  try {
    // Declared floor placement; native update establishes support. The actual
    // useMedkit/update/commit/cancel/checkpoint methods own every transaction.
    p.x=340; p.y=e.platforms[0].y-p.h; tick(e,1/60); p.health=30;
    const kits=e.inventory.medkits,startElapsed=e.legacyMissionV131.elapsed;
    assert.equal(e.useMedkit(p),true); tick(e,1);
    const progressAtOne=p.fieldActionV124?.elapsed,healthAtOne=p.health;
    e.togglePause(); const frozen=JSON.stringify(p.fieldActionV124),elapsed=e.legacyMissionV131.elapsed;
    tick(e,3); assert.equal(JSON.stringify(p.fieldActionV124),frozen); assert.equal(e.legacyMissionV131.elapsed,elapsed);
    assert.equal(e.inventory.medkits,kits); e.togglePause(); tick(e,1.2);
    const finishes=()=>s.events.filter(event=>event.type==='field-action-complete'&&event.action==='medical').length;
    t.diagnostic(JSON.stringify({nativeSeconds:e.legacyMissionV131.elapsed-startElapsed,progressAtOne,
      healthAtOne,healthAfter:p.health,medkitsBefore:kits,medkitsAfter:e.inventory.medkits,completed:finishes()}));
    assert.equal(p.health,78,'The existing native medical effect heals48 after2.2 active seconds.');
    near(progressAtOne,1,'Exactly one native action advance per simulation step'); assert.equal(healthAtOne,30);
    assert.equal(e.inventory.medkits,kits-1); assert.equal(finishes(),1); assert.equal(e.isFieldActionBusyV124(p),false);
    tick(e,.4); assert.equal(p.health,78); assert.equal(e.inventory.medkits,kits-1); assert.equal(finishes(),1);

    p.health=30; assert.equal(e.useMedkit(p),true); tick(e,.25);
    e.damagePlayer(p,12,'declared-medical-impact'); assert.equal(e.isFieldActionBusyV124(p),false);
    tick(e,2.3); assert.equal(e.inventory.medkits,kits-1); assert.equal(finishes(),1);
    p.health=30; assert.equal(e.useMedkit(p),true); tick(e,.25);
    assert.equal(e.cancelFieldActionV124(p,'cancelled'),true); tick(e,2.3);
    assert.equal(e.inventory.medkits,kits-1); assert.equal(finishes(),1);

    assert.equal(e.useMedkit(p),true); tick(e,.25);
    const checkpoint=e.captureResumeState(); assert.equal(e.applyResumeState(checkpoint).applied,true);
    assert.equal(e.isFieldActionBusyV124(e.player),false); assert.equal(e.inventory.medkits,kits-1);
    tick(e,2.3); assert.equal(finishes(),1); assert.equal(e.inventory.medkits,kits-1);
    const current=e.player; current.health=30; assert.equal(e.useMedkit(current),true);
    current.alive=false; tick(e,2.3);
    assert.equal(e.inventory.medkits,kits-1); assert.equal(finishes(),1,'An invalid actor cannot complete or spend.');
    // No claim of immediate cancellation in every early-return branch or of
    // cancellation by keyboard intention; those are separate native rules.
  } finally { e.stop(); }
});

test('HADAL: delayed source events cannot reacquire stopped scene images or restart gameplay', async () => {
  const s=await fixture({holdHadal:true}),e=s.engine,pending=[...s.pending];
  const requests=s.requests.length,save=JSON.stringify(e.captureResumeState());
  pending[0].finishHadal(false); e.preparePlayerWeaponAssetsV125();
  assert.equal(s.requests.length,requests,'A failed PNG is not retried on every draw.');
  e.stop(); const stopped=e.weaponImageCacheV125.snapshot(); assert.equal(stopped.retained,0);
  for (const image of pending) image.finishHadal(true);
  assert.equal(e.running,false); assert.equal(e.weaponImageCacheV125.snapshot().retained,0);
  assert.equal(HADAL_PLAYER_ART_V188.some(asset=>e.images.has(asset.imageKey)),false);
  assert.equal(s.requests.length,requests); assert.equal(JSON.stringify(e.captureResumeState()),save);
  e.start(s.options); await prepare(e);
  try {
    assert.equal(s.requests.length,requests+3,'A new scene retries its three sources once.');
    const current=HADAL_PLAYER_ART_V188.map(asset=>e.images.get(asset.imageKey));
    pending.forEach(image=>image.finishHadal(true));
    assert.deepEqual(HADAL_PLAYER_ART_V188.map(asset=>e.images.get(asset.imageKey)),current);
    assert.equal(hadalPlayerArtReadyV188(e.images),false,'Old events cannot complete replacement images.');
    current.forEach(image=>image.finishHadal(true)); assert.equal(draw(s).status.hadal.drawn,true);
  } finally { e.stop(); }
});
