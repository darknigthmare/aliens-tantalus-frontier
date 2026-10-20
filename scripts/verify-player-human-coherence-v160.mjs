import {getHeldWeaponPoseV125} from '../src/held-weapon-renderer-v125.js';
import {WEAPONS} from '../src/content-core-v50.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import {resolvePlayerBodyRigV125,PLAYER_BODY_RIG_ASSETS_V125,solvePlayerArmIKV125,drawPlayerBodyRigV125,resolvePlayerNativeBodyLayersV160} from '../src/player-body-rig-v125.js';
import {advancePlayerLocomotionStateV129,resolvePlayerLocomotionRigV129} from '../src/player-locomotion-rig-v129.js';
import {resolvePlayerModularRigV126,PLAYER_MODULAR_RIG_ASSETS_V126,PLAYER_MODULAR_RIG_ANCHORS_V126} from '../src/player-modular-rig-v126.js';
import {PLAYER_TRANSIT_RIG_ASSETS_V128} from '../src/player-transit-rig-v128.js';
import {PLAYER_COLONIAL_RIG_ASSETS_V129,PLAYER_COLONIAL_LEG_DEFINITIONS_V129} from '../src/player-colonial-art-v129.js';
import {PLAYER_COLONIAL_RIG_ASSETS_V141} from '../src/player-colonial-art-v141.js';
import {normalizePlayerAppearanceV126,PLAYER_APPEARANCE_PRESETS_V129} from '../src/player-appearance-v126.js';
import {HUMAN_VISUAL_CONTRACT_V133} from '../src/human-visual-contract-v133.js';
import {PLAYER_ARM_FLEXION_LIMITS_V160} from '../src/player-arm-constraints-v160.js';
import {sampleHumanGaitV133} from '../src/player-gait-v133.js';
const assets=[...PLAYER_BODY_RIG_ASSETS_V125,...PLAYER_MODULAR_RIG_ASSETS_V126,...PLAYER_TRANSIT_RIG_ASSETS_V128,...PLAYER_COLONIAL_RIG_ASSETS_V129,...PLAYER_COLONIAL_RIG_ASSETS_V141];
const images=new Map(assets.map(a=>[a.imageKey,{complete:true,naturalWidth:a.sourceWidth,naturalHeight:a.sourceHeight}]));
const actor=patch=>({x:500,y:532,w:42,h:92,grounded:true,alive:true,facing:1,vx:0,vy:0,costumeId:'costume-001',...patch});
const transform=(m,p)=>({x:m.a*p.x+m.c*p.y+m.e,y:m.b*p.x+m.d*p.y+m.f});
const close=(a,b,message='coordinate')=>assert.ok(Math.abs(a-b)<1e-6,`${message}: ${a} != ${b}`);
const same=(a,b,message)=>{close(a.x,b.x,message);close(a.y,b.y,message);};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function resolve(subject,state=null,appearance=normalizePlayerAppearanceV126()){
  const body=resolvePlayerBodyRigV125({actor:subject,images,timeSeconds:state?.time??0,reducedMotion:true});
  const rig=resolvePlayerLocomotionRigV129({actor:subject,bodyRig:body,images,locomotionState:state,appearance,legDefinitions:PLAYER_COLONIAL_LEG_DEFINITIONS_V129});
  return {body,rig,modular:resolvePlayerModularRigV126({bodyRig:rig.bodyRig,appearance,images})};
}
const pngs=new Map();
function pixels(asset){
  if(pngs.has(asset.imageKey))return pngs.get(asset.imageKey);
  const bytes=readFileSync(new URL('..'+asset.path,import.meta.url)),w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);assert.equal(bytes[24],8);assert.equal(bytes[25],6);assert.equal(bytes[28],0);
  const chunks=[];for(let i=8;i<bytes.length;){const n=bytes.readUInt32BE(i);if(bytes.toString('ascii',i+4,i+8)==='IDAT')chunks.push(bytes.subarray(i+8,i+8+n));i+=n+12;}
  const scan=inflateSync(Buffer.concat(chunks)),stride=w*4,out=Buffer.alloc(stride*h),paeth=(a,b,c)=>{const p=a+b-c,x=Math.abs(p-a),y=Math.abs(p-b),z=Math.abs(p-c);return x<=y&&x<=z?a:y<=z?b:c;};
  for(let y=0;y<h;y++)for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=4?out[i-4]:0,b=y?out[i-stride]:0,c=y&&x>=4?out[i-stride-4]:0,f=scan[y*(stride+1)];out[i]=(scan[y*(stride+1)+1+x]+(f===0?0:f===1?a:f===2?b:f===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;}
  const image={w,h,alpha:(x,y)=>out[(y*w+x)*4+3]};pngs.set(asset.imageKey,image);return image;
}
function inside(point,polygon){let found=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)found=!found;}return found;}
function opaqueBounds(layers){let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
  for(const layer of layers){const p=pixels(layer.asset),r=layer.sourceRect,clip=layer.clipPolygon?.map(q=>transform(layer.clipMatrix,q));
    for(let y=Math.max(0,Math.ceil(r.y));y<Math.min(p.h,r.y+r.height);y++)for(let x=Math.max(0,Math.ceil(r.x));x<Math.min(p.w,r.x+r.width);x++)if(p.alpha(x,y)>=128){const q=transform(layer.matrix,{x,y});if(clip&&!inside(q,clip))continue;left=Math.min(left,q.x);right=Math.max(right,q.x);top=Math.min(top,q.y);bottom=Math.max(bottom,q.y);}}
  return {left,top,right,bottom,height:bottom-top};
}

test('the actual opaque standing operator fits the shared human scale, with one fitted head, helmet and mask',t=>{
  const measurements=[];let styles=0;for(const facing of [-1,1])for(const appearance of [normalizePlayerAppearanceV126(),...PLAYER_APPEARANCE_PRESETS_V129.map(p=>normalizePlayerAppearanceV126({schema:126,slots:p.slots}))]){
    const subject=actor({facing}),before=JSON.stringify(subject),{body,rig,modular}=resolve(subject,null,appearance);assert.ok(modular.ready);
    const bounds=opaqueBounds(modular.layers.filter(l=>l.slot!=='back'));
    assert.ok(bounds.height>=subject.h*.9&&bounds.height<=HUMAN_VISUAL_CONTRACT_V133.standingHeight+1,`Actual clothed human height ${bounds.height}`);
    assert.ok(Math.abs(bounds.bottom-(subject.y+subject.h))<1.5,'The actual boot alpha, not just its rectangle, meets the deck');
    const head=modular.layers.find(l=>l.id==='bare-head'),headBounds=opaqueBounds([head]);
    assert.ok(headBounds.height<bounds.height*.20,'The separate head cannot occupy a quarter of the complete person');
    measurements.push({facing,torso:appearance.slots.torso,helmet:appearance.slots.helmet,
      opaqueHeight:bounds.height,opaqueHeadHeight:headBounds.height,soleError:bounds.bottom-(subject.y+subject.h)});
    const anchors=rig.bodyRig.modularAnchorsV127||PLAYER_MODULAR_RIG_ANCHORS_V126[body.atlas][body.frame];
    same(transform(head.matrix,modular.anatomical.family==='upright'?{x:143,y:292}:{x:451,y:291}),transform(rig.bodyRig.matrix,anchors.neck),'A resized head keeps its actual neck socket');
    assert.equal(JSON.stringify(subject),before);styles++;
  }assert.ok(styles>=10);t.diagnostic(JSON.stringify({nativePngAlphaMeasurements:measurements}));
});

test('one support-owned frame moves the pelvis, chest, neck and weapon shoulders together and decorates idempotently',()=>{
  let checked=0;for(const facing of [-1,1])for(const speed of [80,155,270]){
    let subject=actor({facing,vx:speed*facing}),state=advancePlayerLocomotionStateV129(null,subject,0);
    for(let tick=1;tick<=180;tick++){
      subject={...subject,x:500+speed*facing*tick/120};state=advancePlayerLocomotionStateV129(state,subject,tick/120);subject.playerLocomotionStateV129=state;
      const {body,rig}=resolve(subject,state),transfer=rig.alignmentV160.weightTransfer;
      for(const side of ['near','far'])same(rig.bodyRig.shoulders[side],{x:body.shoulders[side].x+transfer.x,y:body.shoulders[side].y+transfer.y},'Shoulder shares support translation');
      const original=PLAYER_MODULAR_RIG_ANCHORS_V126[body.atlas][body.frame],neck=transform(rig.bodyRig.matrix,original.neck),belt=rig.alignmentV142.belt;
      assert.ok(Math.abs(neck.x-belt.x)<3,'A travel head and collar share an upright native torso, not different lean angles');
      assert.ok(rig.alignmentV160.projectedHipSpan<subject.h*.08,'A side view cannot spread its femoral heads across the old wide frontal stance');
      same(rig.bodyRig.pivot,body.pivot,'Physical foot pivot stays fixed');
      assert.deepEqual(resolvePlayerLocomotionRigV129({actor:subject,bodyRig:rig.bodyRig,images,locomotionState:state,legDefinitions:PLAYER_COLONIAL_LEG_DEFINITIONS_V129}).bodyRig,rig.bodyRig,'Repeated draw cannot apply body weight transfer twice');
      checked++;
    }
  }assert.equal(checked,1080);
});

test('distance-owned walking and jogging retain planted contacts, rigid bones and finite forward knees across starts and stops',()=>{
  let contacts=0;for(const facing of [-1,1])for(const speed of [80,155,270])for(const fps of [30,60,120]){
    let subject=actor({facing,vx:0}),state=advancePlayerLocomotionStateV129(null,subject,0),previous=null;
    for(let tick=1;tick<=fps*2;tick++){
      const moving=tick<fps*1.7;subject={...subject,vx:moving?speed*facing:0,x:subject.x+(moving?speed*facing/fps:0)};state=advancePlayerLocomotionStateV129(state,subject,tick/fps);subject.playerLocomotionStateV129=state;
      const {rig}=resolve(subject,state);for(const side of ['near','far']){const leg=rig.legs[side],contact=rig.contacts.feet[side];close(distance(leg.hip,leg.knee),24,'Femur');close(distance(leg.knee,leg.ankle),23.5,'Tibia');
        const signedBend=((leg.knee.x-leg.hip.x)*(leg.ankle.y-leg.knee.y)-(leg.knee.y-leg.hip.y)*(leg.ankle.x-leg.knee.x))*facing;
        assert.ok(signedBend>=-1e-7,'A knee bends forward in the facing-relative profile, never through the back of its leg');
        assert.ok(!leg.reachClamped&&!leg.clearanceAdjusted);assert.ok(leg.heel.y<=624+1e-6&&leg.toe.y<=624+1e-6);if(contact.planted&&previous?.contacts.feet[side].planted){same(leg.sole,previous.legs[side].sole,'A planted shoe cannot skate');contacts++;}}
      previous=rig;
    }assert.ok(Object.values(previous.contacts.feet).every(f=>f.planted));
  }assert.ok(contacts>1000);
});

test('travel cadence does not force a fast short-stride walk at jogging speed and freezes without displacement',()=>{
  for(const speed of [80,155,270]){
    const subject=actor({vx:speed,weaponRigMotionV125:{distance:200}}),gait=sampleHumanGaitV133(subject,.5);
    assert.ok(gait.stepsPerSecond>=1.5&&gait.stepsPerSecond<=3.6,`${speed}: ${gait.stepsPerSecond} steps/s`);
  }
  const subject=actor({vx:155}),start=advancePlayerLocomotionStateV129(null,subject,0),stopped=advancePlayerLocomotionStateV129(start,subject,1);assert.equal(stopped.distance,0);assert.equal(stopped.moving,false);assert.equal(stopped.cycles,start.cycles);
});

test('optional elbow bounds constrain both folded and extended requests without changing the generic knee solver',()=>{
  for(const facing of [-1,1])for(const target of [{x:0,y:0},{x:1,y:0},{x:100*facing,y:0},{x:-12*facing,y:13}]){
    const ik=solvePlayerArmIKV125({x:0,y:0},target,{upper:15.5,fore:16.5},facing,PLAYER_ARM_FLEXION_LIMITS_V160);assert.ok(ik.flexionDegrees>=5-1e-4&&ik.flexionDegrees<=145+1e-4);close(distance(ik.shoulder,ik.elbow),15.5);close(distance(ik.elbow,ik.hand),16.5);
  }
  const knee=solvePlayerArmIKV125({x:0,y:0},{x:0,y:47.5},{upper:24,fore:23.5},-1);assert.equal(knee.jointLimits,null);assert.ok(knee.flexionDegrees<1,'Full leg support is admitted; elbow design bounds are not universal knee limits');
});


test('a partially loaded costume keeps native fallback boot alpha on deck and authoritative hands on the same gun',t=>{
  const nativeOnly=new Map(PLAYER_BODY_RIG_ASSETS_V125.map(a=>[a.imageKey,images.get(a.imageKey)]));
  const descriptor=WEAPONS.find(w=>w.name==='M41A Pulse Rifle')||WEAPONS.find(w=>w.name.includes('M41'));
  let checked=0,maxPenetration=-Infinity,maxTransfer=0,maxLean=0;const nativeFrames=new Set();
  const identity={a:1,b:0,c:0,d:1,e:0,f:0};
  for(const facing of [-1,1])for(const speed of [80,155,270])for(const crouching of [false,true]){
    let subject=actor({facing,vx:facing*speed,crouching}),state=advancePlayerLocomotionStateV129(null,subject,0);
    for(let tick=1;tick<=80;tick++){
      subject={...subject,x:500+facing*speed*tick/120};state=advancePlayerLocomotionStateV129(state,subject,tick/120);
      subject={...subject,playerLocomotionStateV129:state};
      if(tick%10&&tick!==22)continue;
      const raw=resolvePlayerBodyRigV125({actor:subject,images:nativeOnly,timeSeconds:tick/120});
      const decorated=resolvePlayerLocomotionRigV129({actor:subject,bodyRig:raw,images:nativeOnly,locomotionState:state,legDefinitions:PLAYER_COLONIAL_LEG_DEFINITIONS_V129});
      assert.equal(decorated.ready,false,'The exercise must actually enter native fallback');
      const body=decorated.bodyRig,pose=getHeldWeaponPoseV125({actor:subject,descriptor,aim:{x:facing,y:0},bodyRig:body,timeSeconds:tick/120});
      const draws=[],stack=[];let current={matrix:identity,clip:null},path=[],weapons=0;
      const ctx={save(){stack.push({...current});},restore(){current=stack.pop();},
        transform(a,b,c,d,e,f){const m=current.matrix;current={...current,matrix:{a:m.a*a+m.c*b,b:m.b*a+m.d*b,c:m.a*c+m.c*d,d:m.b*c+m.d*d,e:m.a*e+m.c*f+m.e,f:m.b*e+m.d*f+m.f}};},
        beginPath(){path=[];},moveTo(x,y){path.push({x,y});},lineTo(x,y){path.push({x,y});},closePath(){},clip(){current={...current,clip:path.slice()};},
        drawImage(image,sx,sy,sw,sh){if(image===nativeOnly.get(body.imageKey))draws.push({asset:body.asset,sourceRect:{x:sx,y:sy,width:sw,height:sh},matrix:current.matrix,clipPolygon:current.clip,clipMatrix:identity});}};
      const rendered=drawPlayerBodyRigV125(ctx,{bodyRig:body,images:nativeOnly,weaponPose:pose,drawWeapon(_ctx,observed){weapons++;assert.equal(observed,pose);}});
      assert.equal(rendered.drawn,true);assert.equal(weapons,1);assert.equal(stack.length,0);
      const bounds=opaqueBounds(draws),penetration=bounds.bottom-subject.y-subject.h;
      assert.ok(Math.abs(penetration)<1.5,`Native boot alpha must meet deck during cache fallback: ${penetration}`);
      for(const side of ['near','far'])same(rendered.arms[side].hand,side==='near'?pose.grip:pose.serviceHand||pose.support,'Fallback hands keep exact authoritative contacts');
      maxTransfer=Math.max(maxTransfer,body.weightTransferV160.y);maxPenetration=Math.max(maxPenetration,penetration);maxLean=Math.max(maxLean,Math.abs(raw.locomotionMotionV133.lean));nativeFrames.add(raw.frame);checked++;
    }
  }
  assert.ok(checked>=100);assert.ok(maxTransfer>4,'A useful regression case must include the former five-pixel sinking');
  assert.deepEqual([...nativeFrames].sort((a,b)=>a-b),[0,1,2,3,12,13],'Every moving upper-source frame must participate in the partial-cache exercise');
  assert.ok(maxLean>.015,'The native seam must also be exercised under the actual walking/running affine');
  t.diagnostic(JSON.stringify({nativeFallbackFrames:checked,maxTransfer,maxPenetration,maxLean}));
});


test('the reload pouch follows its actual trouser thigh through every outfit and travel phase',t=>{
  const descriptor=WEAPONS.find(w=>w.name==='M41A Pulse Rifle');let checked=0,maxContactError=0;
  function alphaAt(layer,p){const m=layer.matrix,r=layer.sourceRect,det=m.a*m.d-m.b*m.c;
    const x=Math.floor((m.d*(p.x-m.e)-m.c*(p.y-m.f))/det),y=Math.floor((-m.b*(p.x-m.e)+m.a*(p.y-m.f))/det);
    if(x<r.x||x>=r.x+r.width||y<r.y||y>=r.y+r.height)return 0;
    if(layer.clipPolygon&&!inside(p,layer.clipPolygon.map(q=>transform(layer.clipMatrix,q))))return 0;
    return pixels(layer.asset).alpha(x,y);
  }
  for(const facing of [-1,1])for(const appearance of [normalizePlayerAppearanceV126(),...PLAYER_APPEARANCE_PRESETS_V129.map(p=>normalizePlayerAppearanceV126({schema:126,slots:p.slots}))])for(const crouching of [false,true])for(const speed of [0,80,155,270]){
    if(crouching&&speed>155)continue;
    let subject=actor({facing,crouching,vx:facing*speed,appearanceV126:appearance,aimingV124:true,reloading:true,
      tacticalReload:{phase:'reloading',elapsed:1.06,completeAt:2,weaponKey:descriptor.id}});
    let state=advancePlayerLocomotionStateV129(null,subject,0);
    for(let tick=1;tick<=240;tick++){
      subject={...subject,x:500+facing*speed*tick/120};state=advancePlayerLocomotionStateV129(state,subject,tick/120);subject={...subject,playerLocomotionStateV129:state};
      if(tick%10)continue;
      const raw=resolvePlayerBodyRigV125({actor:subject,images,timeSeconds:tick/120});
      const rig=resolvePlayerLocomotionRigV129({actor:subject,bodyRig:raw,images,locomotionState:state,appearance,legDefinitions:PLAYER_COLONIAL_LEG_DEFINITIONS_V129});
      const outfit=resolvePlayerModularRigV126({bodyRig:rig.bodyRig,appearance,images}),thigh=outfit.layers.find(l=>l.id==='far-thigh');
      assert.ok(alphaAt(thigh,rig.bodyRig.pouch)>=128,'The service point stays on actual trouser pixels when the thigh moves');
      const pose=getHeldWeaponPoseV125({actor:subject,descriptor,aim:{x:facing,y:0},bodyRig:rig.bodyRig});
      const rendered=solvePlayerArmIKV125(rig.bodyRig.shoulders.far,pose.serviceHand,rig.bodyRig.armLengths.far,facing,PLAYER_ARM_FLEXION_LIMITS_V160);
      const error=distance(pose.serviceHand,rig.bodyRig.pouch);maxContactError=Math.max(maxContactError,error);
      assert.ok(error<1e-6,'Fetching a magazine must contact the sewn pocket instead of an invisible projected target');
      assert.ok(rendered.reachError<1e-6);same(rendered.hand,pose.serviceHand,'The final IK keeps that exact tissue contact');checked++;
    }
  }
  assert.equal(checked,1680);t.diagnostic(JSON.stringify({thighPouchFrames:checked,maxContactError}));
});


test('both fallback levels really animate loaded leg pixels while the native chest keeps the final weapon frame',t=>{
  const descriptor=WEAPONS.find(w=>w.name==='M41A Pulse Rifle'),identity={a:1,b:0,c:0,d:1,e:0,f:0};
  function alphaAt(layer,p){const m=layer.matrix,r=layer.sourceRect,det=m.a*m.d-m.b*m.c;
    const x=Math.floor((m.d*(p.x-m.e)-m.c*(p.y-m.f))/det),y=Math.floor((-m.b*(p.x-m.e)+m.a*(p.y-m.f))/det);
    if(x<r.x||x>=r.x+r.width||y<r.y||y>=r.y+r.height)return 0;
    if(layer.clipPolygon&&!inside(p,layer.clipPolygon.map(q=>transform(layer.clipMatrix,q))))return 0;
    return pixels(layer.asset).alpha(x,y);
  }
  let frames=0,minSeamOverlap=Infinity;const nativePhases=new Set(),widths={native:[],articulated:[]};
  for(const kind of ['native','articulated'])for(const facing of [-1,1])for(const speed of [80,155,270])for(const crouching of [false,true]){
    const partial=new Map(kind==='native'?PLAYER_BODY_RIG_ASSETS_V125.map(a=>[a.imageKey,images.get(a.imageKey)]):images);
    if(kind==='articulated')partial.delete('playerUpperPartsV126');
    let subject=actor({facing,vx:facing*speed,crouching}),state=advancePlayerLocomotionStateV129(null,subject,0);
    for(let tick=1;tick<=160;tick++){
      subject={...subject,x:500+facing*speed*tick/120};state=advancePlayerLocomotionStateV129(state,subject,tick/120);subject={...subject,playerLocomotionStateV129:state};if(tick%10)continue;
      const raw=resolvePlayerBodyRigV125({actor:subject,images:partial,timeSeconds:tick/120});
      const rig=resolvePlayerLocomotionRigV129({actor:subject,bodyRig:raw,images:partial,locomotionState:state,legDefinitions:PLAYER_COLONIAL_LEG_DEFINITIONS_V129});
      assert.equal(rig.ready,false,'The exercise must keep its complete modular renderer unavailable');
      const body=rig.bodyRig,pose=getHeldWeaponPoseV125({actor:subject,descriptor,aim:{x:facing,y:0},bodyRig:body}),layers=resolvePlayerNativeBodyLayersV160(body,{images:partial});
      assert.equal(layers.length,kind==='native'?2:8);
      const upper=layers.at(-1);assert.equal(upper.matrix,body.matrix,'The fallback never repitches the authoritative torso');
      if(kind==='native'){
        assert.equal(layers[0].matrix.b,0);assert.equal(layers[0].matrix.c,0);
        if(!crouching)nativePhases.add(layers[0].frame);
      }
      const assetsByImage=new Map(layers.map(l=>[partial.get(l.asset.imageKey),l.asset])),draws=[],stack=[];
      let current={matrix:identity,clip:null},path=[],weapons=0;
      const ctx={save(){stack.push({...current});},restore(){current=stack.pop();},
        transform(a,b,c,d,e,f){const m=current.matrix;current={...current,matrix:{a:m.a*a+m.c*b,b:m.b*a+m.d*b,c:m.a*c+m.c*d,d:m.b*c+m.d*d,e:m.a*e+m.c*f+m.e,f:m.b*e+m.d*f+m.f}};},
        beginPath(){path=[];},moveTo(x,y){path.push({x,y});},lineTo(x,y){path.push({x,y});},closePath(){},clip(){current={...current,clip:path.slice()};},
        drawImage(image,sx,sy,sw,sh){const asset=assetsByImage.get(image);if(asset)draws.push({asset,sourceRect:{x:sx,y:sy,width:sw,height:sh},matrix:current.matrix,clipPolygon:current.clip,clipMatrix:identity});}};
      const rendered=drawPlayerBodyRigV125(ctx,{actor:subject,bodyRig:body,images:partial,weaponPose:pose,drawWeapon(_ctx,observed){weapons++;assert.equal(observed,pose);}});
      assert.equal(rendered.drawn,true);assert.equal(weapons,1);assert.equal(stack.length,0);assert.equal(draws.length,layers.length);
      same(rendered.arms.near.hand,pose.grip);same(rendered.arms.far.hand,pose.support);
      const lowerDraws=draws.slice(0,-1),upperDraw=draws.at(-1),bounds=opaqueBounds(lowerDraws);
      const bootOffset=bounds.bottom-subject.y-subject.h;
      assert.ok(bootOffset<1.5,`${kind}/${facing}/${speed}/${crouching}/${tick}: animated fallback boots cannot penetrate the deck ${bootOffset}`);
      if(kind==='native'||Object.values(rig.contacts.feet).some(foot=>foot.planted))assert.ok(Math.abs(bootOffset)<1.5,'An actually planted fallback boot must meet the deck; running flight may lift both boots');
      if(!crouching)widths[kind].push(bounds.right-bounds.left);
      let overlap=0;const nativeAnchors=body.modularAnchorsV127||PLAYER_MODULAR_RIG_ANCHORS_V126[body.atlas][body.frame];
      const belt=kind==='native'?transform(body.matrix,nativeAnchors.waist):rig.alignmentV142.belt;
      for(let y=belt.y-4;y<=belt.y+4;y+=.5)for(let x=belt.x-10;x<=belt.x+10;x+=.5){const p={x,y};if(alphaAt(upperDraw,p)>=128&&lowerDraws.some(l=>alphaAt(l,p)>=128))overlap++;}
      assert.ok(overlap>=3,`${kind}/${facing}/${speed}/${crouching}/${tick}: actual upper/lower opaque seam ${overlap}`);
      minSeamOverlap=Math.min(minSeamOverlap,overlap);frames++;
    }
  }
  assert.deepEqual([...nativePhases].sort((a,b)=>a-b),[4,5,6,7],'Every native fallback walk image must really be submitted');
  for(const kind of ['native','articulated'])assert.ok(Math.max(...widths[kind])-Math.min(...widths[kind])>4,`${kind}: true alpha leg silhouette must change through travel, not just its declared phase`);
  assert.equal(frames,384);t.diagnostic(JSON.stringify({animatedFallbackFrames:frames,minSeamOverlap,nativeFrames:[...nativePhases].sort()}));
});
