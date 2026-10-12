import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from '../src/player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126, resolvePlayerModularRigV126,
  drawPlayerModularRigV126 } from '../src/player-modular-rig-v126.js';
import { normalizePlayerAppearanceV126 } from '../src/player-appearance-v126.js';
import { PLAYER_TRANSIT_RIG_ASSETS_V128, PLAYER_LEG_PARTS_V128, PLAYER_TRANSIT_PRESENTATION_V128,
  advancePlayerTransitStateV128, resolvePlayerTransitRigV128, drawPlayerTransitRigV128 } from '../src/player-transit-rig-v128.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const assets=[...PLAYER_BODY_RIG_ASSETS_V125,...PLAYER_MODULAR_RIG_ASSETS_V126,...PLAYER_TRANSIT_RIG_ASSETS_V128];
const images=new Map(assets.map(a=>[a.imageKey,{complete:true,naturalWidth:a.sourceWidth,naturalHeight:a.sourceHeight}]));
const styles=[normalizePlayerAppearanceV126(),normalizePlayerAppearanceV126({schema:126,slots:{
  helmet:'helmet-patrol-v126',mask:'mask-rebreather-v126',torso:'torso-utility-v126',
  arms:'arms-utility-v126',legs:'legs-utility-v126',back:'back-radio-v126'}})];
const actor=patch=>({x:100,y:200,w:42,h:92,alive:true,grounded:true,facing:1,vx:0,vy:0,
  health:76,armor:41,ammo:23,ammoReserve:64,shots:4,costumeId:'costume-001',...patch});
const ladder={id:'ladder-a',x:121,top:0,bottom:600,w:42};
const climber=patch=>actor({climbing:true,grounded:false,ladderId:ladder.id,vy:-185,...patch});
const downed=patch=>actor({alive:false,downed:true,bleedOut:18,...patch});
const corpse=patch=>actor({alive:false,downed:false,bleedOut:0,...patch});
const close=(a,b,label='',tolerance=1e-6)=>assert.ok(Math.abs(a-b)<=tolerance,`${label}: ${a} != ${b}`);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const pointClose=(a,b,label='point')=>{close(a.x,b.x,label+'.x');close(a.y,b.y,label+'.y');};
const transform=(m,p)=>({x:m.a*p.x+m.c*p.y+m.e,y:m.b*p.x+m.d*p.y+m.f});
const inverse=(m,p)=>{const d=m.a*m.d-m.b*m.c;return {
  x:(m.d*(p.x-m.e)-m.c*(p.y-m.f))/d,y:(-m.b*(p.x-m.e)+m.a*(p.y-m.f))/d};};
const deepFreeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(deepFreeze);Object.freeze(o);}return o;};
const rig=(subject,options={})=>resolvePlayerTransitRigV128({actor:subject,images,appearance:styles[0],
  ladder,timeSeconds:1,...options});
const phaseState=(subject,kind,progress)=>({schema:128,kind,phase:kind==='revive'?'rising':'settling',
  progress,elapsed:progress*(kind==='downed'?.42:.48),duration:kind==='downed'?.42:.48,
  time:progress,context:'test',x:subject.x,y:subject.y,alive:subject.alive,downed:subject.downed,
  grounded:subject.grounded,shots:subject.shots,observed:true});
function host(){const calls=[],stack=[];const ctx={save(){stack.push(1);},restore(){assert.ok(stack.pop());},
  transform(...v){assert.ok(v.every(Number.isFinite));},drawImage(...v){calls.push(v);},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){}};return {ctx,calls,stack};}

// Decode shipped pixels only. No bitmap is generated or changed by this test.
const pngs=new Map();
function png(asset){
  if(pngs.has(asset.imageKey))return pngs.get(asset.imageKey);
  const bytes=readFileSync(resolve(root,`.${asset.path}`));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  assert.equal(width,asset.sourceWidth);assert.equal(height,asset.sourceHeight);
  assert.equal(bytes[24],8);assert.equal(bytes[25],6);assert.equal(bytes[28],0);
  const chunks=[];
  for(let o=8;o<bytes.length;){const n=bytes.readUInt32BE(o);
    if(bytes.subarray(o+4,o+8).toString()==='IDAT')chunks.push(bytes.subarray(o+8,o+8+n));o+=n+12;}
  const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,pixels=Buffer.alloc(stride*height);
  const paeth=(a,b,c)=>{const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);return da<=db&&da<=dc?a:db<=dc?b:c;};
  for(let y=0;y<height;y++){const row=y*stride,source=y*(stride+1),filter=raw[source];assert.ok(filter<=4);
    for(let x=0;x<stride;x++){const l=x>=4?pixels[row+x-4]:0,u=y?pixels[row+x-stride]:0,ul=y&&x>=4?pixels[row+x-stride-4]:0;
      pixels[row+x]=(raw[source+1+x]+(filter===0?0:filter===1?l:filter===2?u:filter===3?Math.floor((l+u)/2):paeth(l,u,ul)))&255;}}
  const result={width,height,pixels,alpha(p){const x=Math.round(p.x),y=Math.round(p.y);
    return x<0||x>=width||y<0||y>=height?0:pixels[(y*width+x)*4+3];}};
  pngs.set(asset.imageKey,result);return result;
}
function alphaAt(layer,p){const q=inverse(layer.matrix,p),r=layer.sourceRect;
  return q.x<r.x||q.x>=r.x+r.width||q.y<r.y||q.y>=r.y+r.height?0:png(layer.asset).alpha(q);}

test('fourteen real leg pieces retain the source PNG, native bounds and opaque articulation contacts',()=>{
  assert.equal(PLAYER_TRANSIT_RIG_ASSETS_V128.length,1);
  const image=png(PLAYER_TRANSIT_RIG_ASSETS_V128[0]);let clear=0;
  for(let n=3;n<image.pixels.length;n+=4)if(image.pixels[n]===0)clear++;
  assert.ok(clear>image.width*image.height*.7);
  let count=0;
  for(const style of Object.values(PLAYER_LEG_PARTS_V128)) {
    const parts=[style.pelvis,...Object.values(style.near),...Object.values(style.far)];
    count+=parts.length;
    for(const part of parts){const s=part.source;
      assert.ok(s.x>=0&&s.y>=0&&s.x+s.width<=image.width&&s.y+s.height<=image.height);
      const points=Object.entries(part).filter(([k,p])=>!['source','alphaBounds'].includes(k)&&p&&Number.isFinite(p.x)&&Number.isFinite(p.y));
      for(const [key,p]of points)assert.ok(image.alpha(p)>220,`Opaque ${key} at ${p.x},${p.y}`);
    }
  }
  assert.equal(count,14);
  const boot=PLAYER_LEG_PARTS_V128['legs-marine-v126'].near.boot;
  assert.ok(boot.source.y+boot.source.height>1254/4,'The real boot sole crosses its nominal cell boundary.');
});

test('transit admission retains character identities and requires the actual matching ladder',()=>{
  for(const patch of [{squadMember:true},{spriteId:'npc.synthetic.idle'},{inVehicle:true},{ventTransit:{}},
    {vehicleAccessPhase:'entering'},{neuroActive:true},{playerClass:'neuro-xeno'},{visualForm:'xenomorph'},
    {costumeId:'franchise-nostromo-crew'},{userEquipmentV95:{armorId:'custom'}},{x:NaN},{h:0}]){
    const r=rig(climber(patch));assert.equal(r.eligible,false);assert.deepEqual(r.requiredAssets,[]);
  }
  for(const sample of [{skinId:'different'},{sheetId:'npc.marine.locomotion'}])assert.equal(rig(climber(),{sample}).eligible,false);
  assert.equal(rig(climber(),{surface:'inventory'}).eligible,false);
  assert.equal(rig(climber(),{neuroActive:true}).eligible,false);
  for(const invalid of [null,{...ladder,x:NaN},{...ladder,id:'different'},{...ladder,bottom:5},{...ladder,w:10}]){
    assert.equal(rig(climber(),{ladder:invalid}).reason,'ladder-unavailable');
  }
  for(const override of [
    ...[NaN,Infinity,-Infinity,null,'24',0,-1,.5,129].map(rungSpacing=>({rungSpacing})),
    ...[NaN,Infinity,-Infinity,null,'8',0,-1,25].map(firstRung=>({rungSpacing:24,firstRung}))
  ])assert.equal(rig(climber(),{ladder:{...ladder,...override}}).reason,'ladder-unavailable');
  const implicit=rig(climber()),explicit=rig(climber(),{ladder:{...ladder,rungSpacing:22,firstRung:11}});
  assert.deepEqual(implicit.contacts,explicit.contacts);assert.deepEqual(implicit.legs,explicit.legs);
  assert.deepEqual(implicit.arms,explicit.arms);
  assert.equal(rig(actor()).reason,'no-active-transit');
});

test('a fallen actor cannot acquire a ground pose while airborne or hanging from a ladder',()=>{
  for(const subject of [downed({grounded:false}),corpse({grounded:false,climbing:true}),downed({grounded:undefined})]){
    const r=rig(subject);assert.equal(r.eligible,false);assert.equal(r.reason,'no-ground-support');assert.equal(r.requiredAssets.length,0);
  }
  assert.equal(rig(downed()).eligible,true);assert.equal(rig(corpse()).eligible,true);
});

test('observation clocks distinguish restored bodies, real impacts, landing, pause and revival',()=>{
  const live=actor(),fallen=downed();
  const restored=advancePlayerTransitStateV128(null,fallen,4);
  assert.equal(restored.phase,'settled');assert.equal(restored.progress,1);assert.equal(restored.observed,false);
  let state=advancePlayerTransitStateV128(null,live,0,{context:'room'});
  state=advancePlayerTransitStateV128(state,fallen,.01,{context:'room'});
  assert.equal(state.kind,'downed');assert.equal(state.progress,0);assert.equal(state.observed,true);
  state=advancePlayerTransitStateV128(state,fallen,.2,{context:'room'});
  close(state.elapsed,.19);assert.deepEqual(advancePlayerTransitStateV128(state,fallen,.2,{context:'room'}),state);
  assert.equal(advancePlayerTransitStateV128(state,fallen,.2,{context:'other'}).progress,1);
  const airborne=advancePlayerTransitStateV128(state,downed({grounded:false,y:190}),.21,{context:'room'});
  assert.equal(airborne.phase,'airborne');assert.equal(airborne.elapsed,0);
  const landed=advancePlayerTransitStateV128(airborne,fallen,.22,{context:'room'});
  assert.equal(landed.phase,'settling');assert.equal(landed.elapsed,0);
  const revived=advancePlayerTransitStateV128(landed,live,.23,{context:'room'});
  assert.equal(revived.kind,'revive');assert.equal(revived.duration,.48);
  assert.equal(advancePlayerTransitStateV128(revived,live,.8,{context:'room'}).kind,null);
  assert.equal(advancePlayerTransitStateV128(null,live,.8).kind,null,'A fresh live actor does not invent a revival.');
  const awaitingSupport=advancePlayerTransitStateV128(null,downed({grounded:false}),4);
  const confirmedSupport=advancePlayerTransitStateV128(awaitingSupport,fallen,4.01);
  assert.equal(confirmedSupport.progress,1,'Stationary support confirmation after restore is not a new impact.');
  assert.equal(confirmedSupport.observed,false);
});

test('accepted movement, firing and equipment actions immediately yield the cosmetic revival pose',()=>{
  const previous=advancePlayerTransitStateV128(null,downed(),0);
  const rising=advancePlayerTransitStateV128(previous,actor(),.01);
  assert.equal(rising.kind,'revive');
  for(const patch of [{shots:5},{vx:20},{grounded:false},{climbing:true}, {reloading:true}, {aimingV124:true},
    {fieldActionV124:{phase:'working'}},{placeableActionV124:{kind:'deploy'}},{meleeClock:.2},
    {toolUseClock:.2},{interactionClock:.2},{v52FireClock:.1}]){
    const subject=actor(patch),before=JSON.stringify(subject);
    const state=advancePlayerTransitStateV128(rising,subject,.02);
    assert.notEqual(state.kind,'revive',JSON.stringify(patch));assert.equal(JSON.stringify(subject),before);
  }
  const invalid=advancePlayerTransitStateV128(null,actor(),NaN);assert.equal(invalid,null);
});

test('ladder hands and feet are position-driven, stationary on support and reversible',()=>{
  const fixed=climber({y:200,vy:0});
  const a=rig(fixed,{timeSeconds:2}),b=rig(fixed,{timeSeconds:300});
  assert.deepEqual(a.legs,b.legs);assert.deepEqual(a.arms,b.arms);assert.deepEqual(a.contacts,b.contacts);
  assert.deepEqual(rig(climber({y:212,vy:-185})).legs,rig(climber({y:212,vy:185})).legs);
  const c=rig(climber({y:203}));
  assert.equal(a.contacts.feet.near.planted,true);assert.equal(c.contacts.feet.near.planted,true);
  pointClose(a.legs.near.sole,c.legs.near.sole,'Planted boot remains on the same rung while pelvis moves.');
  assert.ok(distance(a.legs.near.hip,c.legs.near.hip)>2.9);
});

test('every declared ladder contact coincides with a real rung after the IK limit',()=>{
  for(const surface of ['mission','hub','bioforge'])for(const facing of [-1,1])for(let F=1;F<600;F+=5.25){
    const r=rig(climber({y:F-92,facing}),{surface});
    assert.equal(r.eligible,true);
    for(const side of ['near','far'])for(const group of ['feet','hands']){
      const contact=r.contacts[group][side];
      const resolved=group==='feet'?r.legs[side].sole:r.arms[side].hand;
      pointClose(contact.point,resolved,`${group}.${side}`);
      if(contact.planted){
        assert.ok(Number.isInteger(contact.rungIndex));close(contact.rungY,11+22*contact.rungIndex);
        close(resolved.y,contact.rungY);assert.ok(contact.rungY>=11&&contact.rungY<600);
        assert.ok(!contact.reachClamped);
      }
    }
  }
});

test('Port Meridien contacts follow its authored 24-pixel grid inside the drawn rungs',()=>{
  const portLadder={id:'port-meridien-ladder',x:1232,top:432,bottom:624,w:44,rungSpacing:24,firstRung:8};
  const planted={feet:0,hands:0};
  for(const surface of ['mission','hub','bioforge'])for(const facing of [-1,1])for(let F=433;F<624;F+=3.25){
    const subject=climber({x:1211,y:F-92,facing,ladderId:portLadder.id});
    const r=rig(subject,{surface,ladder:portLadder});assert.equal(r.ready,true);
    for(const side of ['near','far'])for(const group of ['feet','hands']){
      const contact=r.contacts[group][side];
      const resolved=group==='feet'?r.legs[side].sole:r.arms[side].hand;
      pointClose(contact.point,resolved,`${group}.${side}`);
      if(contact.planted){
        planted[group]++;assert.ok(Number.isInteger(contact.rungIndex));
        close(contact.rungY,440+24*contact.rungIndex);close(resolved.y,contact.rungY);
        const drawnRungY=439+24*contact.rungIndex;
        assert.ok(resolved.y>drawnRungY&&resolved.y<drawnRungY+4&&resolved.y<624);
        assert.ok(!contact.reachClamped);
      }
    }
    const reversed=rig({...subject,vy:185},{surface,ladder:portLadder,timeSeconds:300});
    assert.deepEqual(r.legs,reversed.legs);assert.deepEqual(r.arms,reversed.arms);
    assert.deepEqual(r.contacts,reversed.contacts);
  }
  assert.ok(planted.feet>0&&planted.hands>0,'Both limb groups must establish genuine contacts.');
});

test('leg and arm lengths stay anatomical through collapse, death and recovery on every surface',()=>{
  for(const surface of ['mission','hub','bioforge'])for(const facing of [-1,1])for(const kind of ['downed','death','revive'])for(let n=0;n<=24;n++){
    const subject=kind==='downed'?downed({facing}):kind==='death'?corpse({facing}):actor({facing});
    const r=rig(subject,{surface,transitState:phaseState(subject,kind,n/24)});
    assert.equal(r.ready,true);assert.equal(r.firing,false);
    for(const side of ['near','far']){
      const l=r.legs[side],a=r.arms[side];
      close(distance(l.hip,l.knee),l.upper);close(distance(l.knee,l.ankle),l.lower);
      close(distance(a.shoulder,a.elbow),a.upper);close(distance(a.elbow,a.hand),a.fore);
      assert.equal(l.reachClamped,false);assert.ok(l.knee.y<=292-2);assert.ok(a.elbow.y<=292-2);
      close(l.sole.y,292);assert.ok(Object.values(l).filter(v=>v&&Number.isFinite(v.x)).every(p=>Number.isFinite(p.y)));
    }
  }
});

test('appearance choices preserve the transit skeleton, handedness and physical support',()=>{
  for(const kind of ['climb','downed','death','revive']){
    const subject=kind==='climb'?climber():kind==='downed'?downed():kind==='death'?corpse():actor();
    const transitState=kind==='climb'?null:phaseState(subject,kind,.6);
    const a=rig(subject,{appearance:styles[0],transitState}),b=rig(subject,{appearance:styles[1],transitState});
    assert.deepEqual(a.legs,b.legs);assert.deepEqual(a.arms,b.arms);assert.deepEqual(a.bodyRig.matrix,b.bodyRig.matrix);
    const reflected=rig({...subject,facing:-1},{transitState});
    for(const side of ['near','far'])for(const key of ['hip','knee','ankle','sole']){
      close(reflected.legs[side][key].x,242-a.legs[side][key].x);close(reflected.legs[side][key].y,a.legs[side][key].y);
    }
  }
});

test('all selected pelvis, knee and ankle seams contain real overlapping opaque pixels',()=>{
  for(const kind of ['climb','downed','death','revive'])for(const facing of [-1,1])for(const appearance of styles){
    const subject=kind==='climb'?climber({facing}):kind==='downed'?downed({facing}):kind==='death'?corpse({facing}):actor({facing});
    const r=rig(subject,{appearance,transitState:kind==='climb'?null:phaseState(subject,kind,.7)});
    const composed=resolvePlayerModularRigV126({bodyRig:r.bodyRig,appearance,images});
    const get=id=>composed.layers.find(l=>l.id===id);
    const waist=transform(r.bodyRig.matrix,r.bodyRig.modularAnchorsV127.waist);
    assert.ok(alphaAt(get('pelvis'),waist)>220);assert.ok(alphaAt(get('torso'),waist)>220);
    for(const side of ['near','far']){
      const l=r.legs[side];
      for(const [joint,left,right]of [[l.hip,'pelvis',`${side}-thigh`],[l.knee,`${side}-thigh`,`${side}-shin`],[l.ankle,`${side}-shin`,`${side}-boot`]]){
        assert.ok(alphaAt(get(left),joint)>220,`${kind} ${left}`);assert.ok(alphaAt(get(right),joint)>220,`${kind} ${right}`);
      }
      assert.ok(alphaAt(get(`${side}-boot`),l.sole)>220,'The declared sole touches an actual opaque boot pixel.');
      pointClose(transform(get(`${side}-boot`).matrix,PLAYER_LEG_PARTS_V128[appearance.slots.legs][side].boot.sole),l.sole);
    }
  }
});

test('a complete seven-part lower body replaces all native leg crops and missing parts fail before painting',()=>{
  const r=rig(climber()),composed=resolvePlayerModularRigV126({bodyRig:r.bodyRig,appearance:styles[0],images});
  assert.equal(composed.layers.filter(l=>l.slot==='legs').length,7);
  assert.ok(composed.layers.filter(l=>l.slot==='legs').every(l=>l.imageKey==='playerLegPartsV128'&&!l.clipPolygon));
  assert.equal(composed.sourceSeparation,'independent-parts-and-segmented-legs');
  const altered={...r.bodyRig,modularLowerLayersV128:{'legs-marine-v126':r.bodyRig.modularLowerLayersV128['legs-marine-v126'].slice(1)}};
  const draw=host(),invalid=drawPlayerModularRigV126(draw.ctx,{bodyRig:altered,appearance:styles[0],images,handPose:r.handPose});
  assert.equal(invalid.drawn,false);assert.equal(invalid.reason,'modular-lower-body-unavailable');assert.equal(draw.calls.length,0);
});

test('late or unavailable art leaves a complete native fallback without changing the solved contacts',()=>{
  const subject=climber(),loaded=rig(subject),cold=new Map(images);cold.delete('playerLegPartsV128');
  const waiting=rig(subject,{images:cold});assert.equal(waiting.eligible,true);assert.equal(waiting.ready,false);
  assert.equal(waiting.reason,'transit-images-unavailable');assert.deepEqual(waiting.legs,loaded.legs);assert.deepEqual(waiting.contacts,loaded.contacts);
  const draw=host(),result=drawPlayerTransitRigV128(draw.ctx,{transitRig:waiting,appearance:styles[0],images:cold});
  assert.equal(result.drawn,false);assert.equal(draw.calls.length,0);assert.equal(draw.stack.length,0);
  cold.set('playerLegPartsV128',{complete:true,naturalWidth:1024,naturalHeight:1024});assert.equal(rig(subject,{images:cold}).ready,false);
});

test('repeated composition cannot alter actor collision, action transactions, resources or observation clocks',()=>{
  const subject=deepFreeze(downed({fieldActionV124:{kind:'medical',phase:'cancelled',elapsed:.3,duration:2},
    placeableActionV124:null}));
  const before=JSON.stringify(subject),state=deepFreeze(phaseState(subject,'downed',.5));
  const r=rig(subject,{transitState:state}),snapshot=JSON.stringify(state);
  const draw=host();for(let n=0;n<5;n++)assert.equal(drawPlayerTransitRigV128(draw.ctx,{transitRig:r,appearance:styles[1],images}).drawn,true);
  assert.equal(JSON.stringify(subject),before);assert.equal(JSON.stringify(state),snapshot);assert.equal(draw.stack.length,0);
  assert.equal(r.state,state,'A previously frozen observation may be read directly.');
});

test('the accepted-shot rig keeps its original transit and incapacity guards',()=>{
  for(const subject of [climber(),downed(),corpse()]){
    const original=resolvePlayerBodyRigV125({actor:subject,images});
    assert.equal(original.eligible,false);
    assert.equal(rig(subject).eligible,true,'Only the separate nonfiring compositor admits this pose.');
  }
  assert.equal(PLAYER_TRANSIT_PRESENTATION_V128.rungSpacing,22);
});
