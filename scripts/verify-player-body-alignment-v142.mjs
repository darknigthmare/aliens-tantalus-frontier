import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {resolvePlayerBodyRigV125, PLAYER_BODY_RIG_ASSETS_V125, PLAYER_BODY_RIG_FRAMES_V125,
  PLAYER_BODY_LATERAL_SUPPORTS_V142, resolvePlayerArmPoseV125} from '../src/player-body-rig-v125.js';
import {PLAYER_MODULAR_RIG_ASSETS_V126, PLAYER_MODULAR_RIG_ANCHORS_V126,
  resolvePlayerModularRigV126} from '../src/player-modular-rig-v126.js';
import {PLAYER_TRANSIT_RIG_ASSETS_V128, PLAYER_LEG_PARTS_V128} from '../src/player-transit-rig-v128.js';
import {PLAYER_COLONIAL_RIG_ASSETS_V129, PLAYER_COLONIAL_LEG_DEFINITIONS_V129} from '../src/player-colonial-art-v129.js';
import {PLAYER_COLONIAL_RIG_ASSETS_V141, getPlayerColonialTorsoWithVariantsV141} from '../src/player-colonial-art-v141.js';
import {PLAYER_MODULAR_RIG_PARTS_V126} from '../src/player-modular-rig-v126.js';
import {PLAYER_APPEARANCE_ITEMS_V126, normalizePlayerAppearanceV126} from '../src/player-appearance-v126.js';
import {advancePlayerLocomotionStateV129,resolvePlayerLocomotionRigV129} from '../src/player-locomotion-rig-v129.js';
import {WEAPONS} from '../src/content-core-v50.js';
import {getHeldWeaponPoseV125} from '../src/held-weapon-renderer-v125.js';
import {resolveHeldWeaponProfileV125} from '../src/held-weapon-profiles-v125.js';

const assets=[...PLAYER_BODY_RIG_ASSETS_V125,...PLAYER_MODULAR_RIG_ASSETS_V126,
  ...PLAYER_TRANSIT_RIG_ASSETS_V128,...PLAYER_COLONIAL_RIG_ASSETS_V129,...PLAYER_COLONIAL_RIG_ASSETS_V141];
const images=new Map(assets.map(a=>[a.imageKey,{complete:true,naturalWidth:a.sourceWidth,naturalHeight:a.sourceHeight}]));
const actor=patch=>({x:250,y:532,w:42,h:92,facing:1,grounded:true,alive:true,vx:0,vy:0,costumeId:'costume-001',...patch});
const close=(a,b,label='coordinate')=>assert.ok(Math.abs(a-b)<1e-6,`${label}: ${a} != ${b}`);
const pointClose=(a,b,label)=>{close(a.x,b.x,label);close(a.y,b.y,label);};
const transform=(m,p)=>({x:m.a*p.x+m.c*p.y+m.e,y:m.b*p.x+m.d*p.y+m.f});
const inverse=(m,p)=>{const determinant=m.a*m.d-m.b*m.c;return{x:(m.d*(p.x-m.e)-m.c*(p.y-m.f))/determinant,y:(-m.b*(p.x-m.e)+m.a*(p.y-m.f))/determinant};};
const determinant=m=>m.a*m.d-m.b*m.c;
function rig(subject,{surface='mission',state=null,time=1,appearance=normalizePlayerAppearanceV126()}={}){
  const body=resolvePlayerBodyRigV125({actor:subject,images,surface,timeSeconds:time,reducedMotion:true});
  const resolved=resolvePlayerLocomotionRigV129({actor:subject,bodyRig:body,images,appearance,
    locomotionState:state,legDefinitions:PLAYER_COLONIAL_LEG_DEFINITIONS_V129});
  return{body,resolved,modular:resolvePlayerModularRigV126({bodyRig:resolved.bodyRig,images,appearance})};
}
const pngs=new Map();
function alpha(asset,x,y){
  if(!pngs.has(asset.imageKey)){
    const b=readFileSync(fileURLToPath(new URL(`..${asset.path}`,import.meta.url))),width=b.readUInt32BE(16),height=b.readUInt32BE(20);
    assert.equal(b[24],8);assert.equal(b[25],6);assert.equal(b[28],0);
    const chunks=[];for(let offset=8;offset<b.length;){const size=b.readUInt32BE(offset);if(b.toString('ascii',offset+4,offset+8)==='IDAT')chunks.push(b.subarray(offset+8,offset+8+size));offset+=size+12;}
    const bytes=inflateSync(Buffer.concat(chunks)),stride=width*4,pixels=Buffer.alloc(stride*height);
    const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
    for(let y=0;y<height;y++)for(let x=0;x<stride;x++){
      const filter=bytes[y*(stride+1)],offset=y*stride+x,a=x>=4?pixels[offset-4]:0,b=y?pixels[offset-stride]:0,c=y&&x>=4?pixels[offset-stride-4]:0;
      const predicted=filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c);
      pixels[offset]=(bytes[y*(stride+1)+1+x]+predicted)&255;
    }
    pngs.set(asset.imageKey,{pixels,width,height});
  }
  const png=pngs.get(asset.imageKey);x=Math.round(x);y=Math.round(y);
  return x<0||x>=png.width||y<0||y>=png.height?0:png.pixels[(y*png.width+x)*4+3];
}
function alphaAt(layer,p){
  if(layer.clipPolygon){const q=inverse(layer.clipMatrix,p),poly=layer.clipPolygon;let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>q.y)!==(b.y>q.y)&&q.x<(b.x-a.x)*(q.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}if(!inside)return 0;}
  const q=inverse(layer.matrix,p),s=layer.sourceRect;if(q.x<s.x||q.x>=s.x+s.width||q.y<s.y||q.y>=s.y+s.height)return 0;
  return alpha(layer.asset,q.x,q.y);
}
const torsos=PLAYER_APPEARANCE_ITEMS_V126.filter(item=>item.slot==='torso').map(item=>item.id);
const legIds=['legs-marine-v126','legs-utility-v126','legs-uscm-v129','legs-smartgunner-v129'];

test('the source registration follows measured anatomical belts rather than nominal cell or moving boot centres',()=>{
  for(const [atlas,frames]of Object.entries(PLAYER_BODY_LATERAL_SUPPORTS_V142))for(const [frame,x]of Object.entries(frames)){
    assert.equal(x,PLAYER_MODULAR_RIG_ANCHORS_V126[atlas][frame].waist.x);
    assert.equal(PLAYER_BODY_RIG_FRAMES_V125[atlas][frame].support.x,x);
  }
  for(const surface of ['mission','hub','bioforge'])for(const facing of [-1,1])for(const patch of [{},{vx:155*facing},{vx:270*facing},{aimingV124:true},{crouching:true}]){
    const subject=actor({facing,...patch}),{body}=rig(subject,{surface});
    const anatomical=PLAYER_MODULAR_RIG_ANCHORS_V126[body.atlas][body.frame];
    const belt=transform(body.matrix,anatomical.waist);
    const expectedX=body.pivot.x-body.matrix.c*(body.sourceFrame.support.y-anatomical.waist.y);
    close(belt.x,expectedX,'Belt is on the registered body axis, with only the physical travel lean');
    close(body.standingHeight,96.5);close(body.pivot.y,subject.y+subject.h);
  }
});

test('all actual trouser atlases form an upright pelvis with opaque femoral sockets below their belt',()=>{
  for(const facing of [-1,1])for(const legs of legIds)for(const crouching of [false,true]){
    const appearance=normalizePlayerAppearanceV126({schema:126,slots:{legs}}),{resolved,modular}=rig(actor({facing,crouching}),{appearance});
    const belt=resolved.alignmentV142.belt,pelvis=modular.layers.find(l=>l.id==='pelvis');
    assert.ok(determinant(pelvis.matrix)*facing>0,'A pelvis cannot be flipped vertically above its own belt');
    assert.ok(resolved.alignmentV142.waistToHip>=6-1e-7);
    assert.ok(alphaAt(pelvis,belt)>220,`${legs}: actual belt cloth`);
    for(const side of ['near','far']){
      const hip=resolved.legs[side].hip,thigh=modular.layers.find(l=>l.id===`${side}-thigh`);
      assert.ok(hip.y>belt.y);assert.ok(alphaAt(pelvis,hip)>220);assert.ok(alphaAt(thigh,hip)>220);
      close(Math.hypot(hip.x-resolved.legs[side].knee.x,hip.y-resolved.legs[side].knee.y),24);
      close(Math.hypot(resolved.legs[side].knee.x-resolved.legs[side].ankle.x,resolved.legs[side].knee.y-resolved.legs[side].ankle.y),23.5);
    }
  }
});

test('every selected jacket keeps its full chest affine and separates above actual visible thigh pixels',()=>{
  for(const facing of [-1,1])for(const torso of torsos)for(const legs of legIds)
    for(const pose of [{},{vx:155*facing},{crouching:true},{aimingV124:true},{crouching:true,aimingV124:true}]){
    const appearance=normalizePlayerAppearanceV126({schema:126,slots:{torso,legs}}),{body,resolved,modular}=rig(actor({facing,...pose}),{appearance});
    const original=resolvePlayerModularRigV126({bodyRig:{...resolved.bodyRig,modularBeltV142:undefined},appearance,images}).layers.find(l=>l.id==='torso');
    const jacket=modular.layers.find(l=>l.id==='torso'),pelvis=modular.layers.find(l=>l.id==='pelvis');
    assert.deepEqual(jacket.matrix,original.matrix,'Correct the common body pivot; never squash or shear its chest locally');
    const def=getPlayerColonialTorsoWithVariantsV141(torso,facing,jacket.part)?.part||PLAYER_MODULAR_RIG_PARTS_V126.torso[torso][jacket.part];
    pointClose(transform(jacket.matrix,def.joints.near),body.shoulders.near,'Near shoulder socket');
    pointClose(transform(jacket.matrix,def.joints.far),body.shoulders.far,'Far shoulder socket');
    let seamOverlap=0;
    const belt=resolved.alignmentV142.belt;
    for(let y=belt.y-1;y<=belt.y+1;y+=.5)for(let x=belt.x-5;x<=belt.x+5;x+=.5){const p={x,y};if(alphaAt(jacket,p)>128&&alphaAt(pelvis,p)>128)seamOverlap++;}
    assert.ok(seamOverlap>=3,`${torso}/${legs}/${facing}/${JSON.stringify(pose)}: continuous opaque jacket/belt seam (${seamOverlap})`);
    for(const side of ['near','far']){
      const hip=resolved.legs[side].hip,p={x:hip.x,y:hip.y+2};
      assert.equal(alphaAt(jacket,p),0,'The jacket cannot cover the upper femur below the hip joint');
      assert.ok(alphaAt(modular.layers.find(l=>l.id===`${side}-thigh`),p)>128,'Actual thigh pixels remain beneath the pelvis');
    }
  }
});

test('the corrected resting thorax is centred over the hips symmetrically in both facings',()=>{
  for(const surface of ['mission','hub','bioforge'])for(const facing of [-1,1])for(const time of [0,.5,1,1.5]){
    const subject=actor({facing}),{resolved,body}=rig(subject,{surface,time});
    const midHip=(resolved.legs.near.hip.x+resolved.legs.far.hip.x)/2;
    close(resolved.alignmentV142.belt.x,subject.x+subject.w/2);
    assert.ok(Math.abs(midHip-resolved.alignmentV142.belt.x)<=.751);
    const anatomical=PLAYER_MODULAR_RIG_ANCHORS_V126[body.atlas][body.frame];
    const neck=transform(body.matrix,anatomical.neck);
    assert.ok(Math.abs(neck.x-resolved.alignmentV142.belt.x)<2.4,'Neutral neck remains directly over the balanced belt');
  }
});

test('distance-driven starts and stops preserve contacts and a continuous belt plane, then stay still',()=>{
  for(const facing of [-1,1])for(const stopTick of [18,37,68]){
    let subject=actor({facing,vx:155*facing}),state=advancePlayerLocomotionStateV129(null,subject,0),previous=null;
    for(let tick=1;tick<=stopTick+24;tick++){
      const moving=tick<=stopTick;subject={...subject,x:subject.x+(moving?subject.vx/120:0),vx:moving?subject.vx:0};
      state=advancePlayerLocomotionStateV129(state,subject,tick/120);subject.playerLocomotionStateV129=state;
      const {resolved}=rig(subject,{state,time:tick/120});
      if(previous){assert.ok(Math.abs(resolved.alignmentV142.belt.y-previous.alignmentV142.belt.y)<1);
        for(const side of ['near','far'])if(resolved.contacts.feet[side].planted&&previous.contacts.feet[side].planted)pointClose(resolved.legs[side].sole,previous.legs[side].sole,'Existing world boot contact');}
      previous=resolved;
    }
    const frozen=advancePlayerLocomotionStateV129(state,subject,state.time);
    assert.equal(frozen,state);assert.equal(previous.mode,'idle');assert.equal(previous.presentationV133.stepsPerSecond,0);
  }
});

test('recentering keeps accepted-shot ports and both hands on the same real rigid weapon in either facing',()=>{
  let ports=0;
  for(const surface of ['mission','hub','bioforge'])for(const facing of [-1,1])for(const crouching of [false,true])for(const descriptor of WEAPONS.filter(d=>resolveHeldWeaponProfileV125(d)?.portable)){
    const subject=actor({facing,crouching,aimingV124:true}),{body,resolved}=rig(subject,{surface});
    for(const aim of [{x:facing,y:0},{x:facing,y:-.65},{x:facing,y:.65}]){
      const before=getHeldWeaponPoseV125({actor:subject,bodyRig:body,descriptor,aim,timeSeconds:1});
      const after=getHeldWeaponPoseV125({actor:subject,bodyRig:resolved.bodyRig,descriptor,aim,timeSeconds:1});
      assert.deepEqual(after,before,'Cosmetic belt separation cannot change a real accepted-shot weapon port');
      assert.ok(after?.visible,`${descriptor.id}: the supported weapon must produce an actual held pose`);ports++;
      const arms=resolvePlayerArmPoseV125(resolved.bodyRig,after);
      pointClose(arms.near.hand,after.grip,'Near grip');if(after.support)pointClose(arms.far.hand,after.support,'Far support');
      assert.equal(arms.near.reachClamped,false);assert.equal(arms.far.reachClamped,false);
    }
  }
  assert.ok(ports>200,'Cover actual supported weapon ports in all three surfaces, two facings and three aim angles');
});

test('dedicated transit and airborne poses retain their own registration and do not receive jacket clipping',()=>{
  for(const facing of [-1,1])for(const patch of [{grounded:false,vy:-200},{grounded:false,vy:200}]){
    const {resolved,modular}=rig(actor({facing,...patch}));
    assert.equal(resolved.bodyRig.modularBeltV142,undefined);
    assert.equal(modular.layers.find(l=>l.id==='torso').clipPolygon,undefined);
    assert.equal(resolved.contacts.floorY,null);
  }
  for(const parts of Object.values(PLAYER_LEG_PARTS_V128)){
    assert.ok(parts.pelvis.belt.y<parts.pelvis.waist.y);
    assert.ok(alpha(PLAYER_TRANSIT_RIG_ASSETS_V128[0],parts.pelvis.belt.x,parts.pelvis.belt.y)>220,'The alternative belt pivot is measured on real opaque belt pixels');
  }
});
