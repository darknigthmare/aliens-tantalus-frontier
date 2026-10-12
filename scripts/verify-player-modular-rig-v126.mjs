import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { PLAYER_MODULAR_RIG_ASSETS_V126, PLAYER_MODULAR_RIG_PARTS_V126,
  resolvePlayerModularRigV126, drawPlayerModularRigV126, createPlayerNeutralPoseV126 } from '../src/player-modular-rig-v126.js';
import { PLAYER_BODY_RIG_ASSETS_V125, PLAYER_SHOULDER_SOCKETS_V125,
  resolvePlayerBodyRigV125, resolvePlayerArmPoseV125 } from '../src/player-body-rig-v125.js';
import { normalizePlayerAppearanceV126, PLAYER_APPEARANCE_ITEMS_V126 } from '../src/player-appearance-v126.js';
import { getHeldWeaponPoseV125, translateHeldWeaponPoseV125 } from '../src/held-weapon-renderer-v125.js';
import { constrainPlayerMuzzleV124 } from '../src/player-control-v124.js';
import { WEAPONS } from '../src/content-core-v50.js';

const repository=fileURLToPath(new URL('../',import.meta.url));
const assets=[...PLAYER_BODY_RIG_ASSETS_V125,...PLAYER_MODULAR_RIG_ASSETS_V126];
const images=new Map(assets.map(a=>[a.imageKey,{complete:true,naturalWidth:a.sourceWidth,naturalHeight:a.sourceHeight,src:a.path}]));
const actor=patch=>({x:100,y:200,w:42,h:92,alive:true,grounded:true,facing:1,vx:0,vy:0,
  costumeId:'costume-001',weaponRigMotionV125:{distance:0,shotAt:-100,time:4},...patch});
const body=(patch={},surface='mission')=>resolvePlayerBodyRigV125({actor:actor(patch),images,timeSeconds:4,surface,reducedMotion:true});
const near=(a,b,label='coordinate')=>assert.ok(Math.abs(a-b)<1e-7,`${label}: ${a} != ${b}`);
const transform=(m,p)=>({x:m.a*p.x+m.c*p.y+m.e,y:m.b*p.x+m.d*p.y+m.f});
const inverse=(m,p)=>{const det=m.a*m.d-m.b*m.c;return {
  x:(m.d*(p.x-m.e)-m.c*(p.y-m.f))/det,y:(-m.b*(p.x-m.e)+m.a*(p.y-m.f))/det};};
const inside=(polygon,p)=>{
  let result=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[i],b=polygon[j];
    if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)result=!result;
  }
  return result;
};

// Decode the shipped RGBA data rather than creating imagined component pixels.
const pngCache=new Map();
function readPng(a){
  if(pngCache.has(a.imageKey))return pngCache.get(a.imageKey);
  const bytes=readFileSync(resolve(repository,`.${a.path}`));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);
  assert.equal(bytes.subarray(1,4).toString(),'PNG');
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  assert.equal(width,a.sourceWidth);assert.equal(height,a.sourceHeight);
  assert.equal(bytes[24],8);assert.equal(bytes[25],6,'The source must have genuine alpha.');assert.equal(bytes[28],0);
  const chunks=[];
  for(let offset=8;offset<bytes.length;){const length=bytes.readUInt32BE(offset);
    if(bytes.subarray(offset+4,offset+8).toString()==='IDAT')chunks.push(bytes.subarray(offset+8,offset+8+length));offset+=length+12;}
  const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,pixels=Buffer.alloc(stride*height);
  const paeth=(a,b,c)=>{const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);return da<=db&&da<=dc?a:db<=dc?b:c;};
  for(let y=0;y<height;y++){const row=y*stride,source=y*(stride+1),filter=raw[source];assert.ok(filter<=4);
    for(let x=0;x<stride;x++){const left=x>=4?pixels[row+x-4]:0,up=y?pixels[row+x-stride]:0,ul=y&&x>=4?pixels[row+x-stride-4]:0;
      const predict=filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):paeth(left,up,ul);
      pixels[row+x]=(raw[source+1+x]+predict)&255;}}
  const alpha=(x,y)=>x<0||x>=width||y<0||y>=height?0:pixels[(Math.round(y)*width+Math.round(x))*4+3];
  const image={width,height,pixels,alpha};pngCache.set(a.imageKey,image);return image;
}
function alphaAt(layer,p){
  if(layer.clipPolygon&&!inside(layer.clipPolygon,inverse(layer.clipMatrix,p)))return 0;
  const s=inverse(layer.matrix,p),r=layer.sourceRect;
  if(s.x<r.x||s.x>=r.x+r.width||s.y<r.y||s.y>=r.y+r.height)return 0;
  return readPng(layer.asset).alpha(s.x,s.y);
}
function host(){
  const draws=[],matrices=[],stack=[];
  const ctx={save(){stack.push(1);},restore(){assert.ok(stack.pop());},transform(...m){matrices.push(m);},
    drawImage(...args){draws.push(args);},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){}};
  return {ctx,draws,matrices,stack};
}
const poses=[{}, {aimingV124:true}, {vx:155}, {vx:-155}, {crouching:true},
  {crouching:true,aimingV124:true}, {crouching:true,aimingV124:true,coverV124:{peeking:true,peekRise:26}},
  {grounded:false,vy:-200}, {grounded:false,vy:200}];

test('the three real atlases match their hashes, dimensions and separate transparent parts',()=>{
  assert.equal(PLAYER_MODULAR_RIG_ASSETS_V126.length,3);
  for(const asset of PLAYER_MODULAR_RIG_ASSETS_V126){const png=readPng(asset);let clear=0,opaque=0;
    for(let i=3;i<png.pixels.length;i+=4){if(png.pixels[i]===0)clear++;if(png.pixels[i]>=32)opaque++;}
    assert.ok(clear>png.width*png.height*.6);assert.ok(opaque>10000);}
  const head=readPng(PLAYER_MODULAR_RIG_ASSETS_V126[2]);
  assert.equal(head.alpha(831,222),0,'Marine face aperture is actually transparent.');
  assert.equal(head.alpha(1144,240),0,'Recon face aperture is actually transparent.');
  assert.ok(head.alpha(132,188)>240,'Bare head is authored skin, not a missing optional helmet.');
  const upper=readPng(PLAYER_MODULAR_RIG_ASSETS_V126[0]);
  for(const styles of Object.values(PLAYER_MODULAR_RIG_PARTS_V126.torso))for(const p of Object.values(styles)){
    assert.ok(upper.alpha(p.joints.near.x,p.joints.near.y)>240);
    assert.ok(upper.alpha(p.joints.waist.x,p.joints.waist.y)>240);
  }
});

test('every clothing selection is independent and preserves body geometry and firing pose',()=>{
  const rifle=WEAPONS[0];
  for(const patch of poses)for(const facing of [-1,1]){
    const subject=actor({...patch,facing}),bodyRig=body({...patch,facing}),before=JSON.stringify(bodyRig);
    const pose=getHeldWeaponPoseV125({actor:subject,descriptor:rifle,bodyRig,aim:{x:facing,y:0},timeSeconds:4});
    for(const item of PLAYER_APPEARANCE_ITEMS_V126){
      const appearance=normalizePlayerAppearanceV126();appearance.slots[item.slot]=item.id;
      const r=resolvePlayerModularRigV126({bodyRig,appearance,images});
      assert.equal(r.eligible,true);assert.equal(r.ready,true);assert.equal(r.effectiveSlots[item.slot],item.id);
      assert.equal(r.bodyRig,bodyRig);assert.equal(JSON.stringify(bodyRig),before);
      assert.deepEqual(getHeldWeaponPoseV125({actor:subject,descriptor:rifle,bodyRig:r.bodyRig,aim:{x:facing,y:0},timeSeconds:4}),pose);
      for(const l of r.layers){const s=l.sourceRect;assert.ok(s.x>=0&&s.y>=0&&s.x+s.width<=1254&&s.y+s.height<=1254);
        assert.ok(Object.values(l.matrix).every(Number.isFinite));}
    }
  }
});

test('marine trousers draw only below anatomical cuts and cannot retain a hidden backpack or helmet',()=>{
  const packProbes=[ [{},[95,155]], [{vx:155},[113,460]], [{grounded:false,vy:-200},[423,820]],
    [{grounded:false,vy:200},[724,750]], [{crouching:true},[99,1148]], [{crouching:true,aimingV124:true},[415,1138]],
    [{aimingV124:true},[1045,145]] ];
  for(const [patch,[x,y]]of packProbes){const bodyRig=body(patch),r=resolvePlayerModularRigV126({bodyRig,images,
    appearance:{schema:126,slots:{back:null,helmet:null}}});
    assert.ok(!r.layers.some(l=>l.slot==='back'||l.slot==='helmet'));
    const legs=r.layers.find(l=>l.slot==='legs');assert.equal(legs.sourceSeparation,'anatomical-waist-cut');
    assert.ok(legs.sourceRect.height<bodyRig.source.height);assert.ok(legs.clipPolygon.length>=6);
    assert.ok(readPng(bodyRig.asset).alpha(x,y)>=24,'Probe identifies actual opaque old pack art.');
    assert.equal(alphaAt(legs,transform(bodyRig.matrix,{x,y})),0,'The old pack point is not drawn by the trouser cut.');
    assert.deepEqual(legs.matrix,bodyRig.matrix,'The original boots keep their authored coordinates.');
  }
});

test('the selected torso and trousers overlap with real opaque pixels at every reviewed seam',()=>{
  for(const patch of poses)for(const torso of ['torso-marine-v126','torso-utility-v126'])for(const legs of ['legs-marine-v126','legs-utility-v126']){
    const bodyRig=body(patch),r=resolvePlayerModularRigV126({bodyRig,images,appearance:{schema:126,slots:{torso,legs}}});
    const top=r.layers.find(l=>l.id==='torso'),bottom=r.layers.find(l=>l.id==='legs');let overlap=0;
    const waist=r.anatomical.waist;
    for(let y=Math.floor(waist.y)-18;y<waist.y+30;y++)for(let x=Math.floor(waist.x)-40;x<waist.x+40;x++){
      const p=transform(bodyRig.matrix,{x,y});if(alphaAt(top,p)>=64&&alphaAt(bottom,p)>=64)overlap++;
    }
    assert.ok(overlap>=5,`${bodyRig.atlas}${bodyRig.frame} ${torso}/${legs}: no opaque waistband overlap (${overlap}).`);
  }
});

test('both selected shoulder caps cover the complete V125 obstacle-fitting socket',()=>{
  const socket=PLAYER_SHOULDER_SOCKETS_V125.combat[3].near;
  for(const surface of ['mission','bioforge','hub'])for(const facing of [-1,1])for(const torso of ['torso-marine-v126','torso-utility-v126']){
    const bodyRig=body({aimingV124:true,facing},surface),r=resolvePlayerModularRigV126({bodyRig,images,appearance:{schema:126,slots:{torso}}});
    const cap=r.layers.find(l=>l.id==='torso');
    for(let y=socket.top;y<=socket.bottom;y++)for(let x=socket.left;x<=socket.right;x++){
      assert.ok(alphaAt(cap,transform(bodyRig.matrix,{x,y}))>=240,`${torso} ${surface} must hide socket ${x},${y}.`);
    }
  }
});

test('real ceiling retraction keeps M56 and Heavy Pulse contacts under each selected cap',()=>{
  const subject=actor({aimingV124:true}),bodyRig=body({aimingV124:true}),aim={x:0,y:-1};
  const ceiling={x:0,y:169.99,w:1000,h:30};
  for(const name of ['M56 Smartgun','Heavy Pulse Rifle']){
    const descriptor=WEAPONS.find(w=>w.name===name);
    const pose=getHeldWeaponPoseV125({actor:subject,descriptor,aim,bodyRig,timeSeconds:4});
    const muzzle={...pose.muzzle,pivotX:bodyRig.shoulders.near.x,pivotY:bodyRig.shoulders.near.y};
    const clipped=constrainPlayerMuzzleV124({walls:[ceiling]},subject,aim,muzzle);
    const held=translateHeldWeaponPoseV125(pose,clipped.x-muzzle.x,clipped.y-muzzle.y),arms=resolvePlayerArmPoseV125(bodyRig,held);
    assert.ok(arms.near.shoulderShiftDistance>0&&arms.near.shoulderShiftDistance<=5);near(arms.near.reachError,0);
    for(const torso of ['torso-marine-v126','torso-utility-v126']){
      const r=resolvePlayerModularRigV126({bodyRig,images,appearance:{schema:126,slots:{torso}}}),cap=r.layers.find(l=>l.id==='torso');
      for(let t=0;t<=1;t+=.1){const p={x:arms.near.restShoulder.x+arms.near.shoulderShift.x*t,y:arms.near.restShoulder.y+arms.near.shoulderShift.y*t};
        assert.ok(alphaAt(cap,p)>=240,'The whole fitted joint path remains hidden by the selected shoulder.');}
    }
  }
});

test('relaxed hands use unchanged arm lengths, mirrored anatomy and no weapon callback',()=>{
  for(const patch of poses)for(const facing of [-1,1]){
    const bodyRig=body({...patch,facing}),pose=createPlayerNeutralPoseV126(bodyRig),h=host();
    assert.equal(pose.unarmed,true);
    const r=drawPlayerModularRigV126(h.ctx,{bodyRig,images,appearance:{schema:126,slots:{helmet:null,mask:null,back:null}}});
    assert.equal(r.drawn,true);assert.equal(r.unarmed,true);assert.ok(!r.layers.some(l=>l.slot==='weapon'));
    for(const side of ['near','far']){const a=r.arms[side];near(a.reachError,0);
      near(Math.hypot(a.elbow.x-a.shoulder.x,a.elbow.y-a.shoulder.y),bodyRig.armLengths[side].upper);
      near(Math.hypot(a.hand.x-a.elbow.x,a.hand.y-a.elbow.y),bodyRig.armLengths[side].fore);
      assert.equal(r.layers.find(l=>l.id===`${side}-hand`).part,`${side}-service`);}
    assert.equal(h.stack.length,0);assert.ok(h.matrices.flat().every(Number.isFinite));
  }
});

test('load failures and unsupported bodies fall back before drawing a partial person',()=>{
  const bodyRig=body({aimingV124:true}),resolved=resolvePlayerModularRigV126({bodyRig,images});
  for(const asset of resolved.requiredAssets){const unavailable=new Map(images);unavailable.delete(asset.imageKey);const h=host();
    const r=drawPlayerModularRigV126(h.ctx,{bodyRig,images:unavailable});assert.equal(r.drawn,false);assert.equal(r.fallback,true);
    assert.equal(r.reason,'modular-images-unavailable');assert.equal(r.effectiveSlots,null);assert.equal(h.draws.length,0);}
  const broken=new Map(images);broken.set('playerUpperPartsV126',{complete:true,naturalWidth:0,naturalHeight:0,width:1254,height:1254});
  assert.equal(resolvePlayerModularRigV126({bodyRig,images:broken}).ready,false,'Sized but undecoded HTML images remain unavailable.');
  for(const patch of [{costumeId:'franchise-nostromo-crew'},{userEquipmentV95:{armorId:'custom'}},{downed:true},{climbing:true},{fieldActionV124:{phase:'working'}}]){
    const h=host(),r=drawPlayerModularRigV126(h.ctx,{bodyRig:body(patch),images});assert.equal(r.drawn,false);assert.equal(h.draws.length,0);}
  assert.equal(resolvePlayerModularRigV126({bodyRig:body({userEquipmentV95:{weaponId:'item-v95-user-engineer-bone-rifle'}}),images}).eligible,true);
  const h=host();assert.equal(drawPlayerModularRigV126(h.ctx,{bodyRig,images,weaponPose:createPlayerNeutralPoseV126(bodyRig)}).drawn,false);
  assert.equal(h.draws.length,0,'An incomplete armed call cannot draw a torso before its missing weapon callback.');
});

test('actual layer order keeps the optional pack behind the body and calls a held weapon once',()=>{
  const bodyRig=body({aimingV124:true}),subject=actor({aimingV124:true});
  const weaponPose=getHeldWeaponPoseV125({actor:subject,descriptor:WEAPONS[0],bodyRig,aim:{x:1,y:0},timeSeconds:4});
  const h=host();let calls=0;
  const r=drawPlayerModularRigV126(h.ctx,{bodyRig,images,weaponPose,drawWeapon(){calls++;}});
  assert.equal(r.drawn,true);assert.equal(calls,1);
  const ids=r.layers.map(l=>l.id);assert.ok(ids.indexOf('back')<ids.indexOf('torso'));
  assert.ok(ids.indexOf('torso')<ids.indexOf('weapon'));assert.ok(ids.indexOf('weapon')<ids.indexOf('near-hand'));
  assert.equal(ids.filter(id=>id==='bare-head').length,1);assert.equal(ids.filter(id=>id==='torso').length,1);
  assert.equal(h.draws.length,r.layers.length-1);assert.equal(h.stack.length,0);
});
